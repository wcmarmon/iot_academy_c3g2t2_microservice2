


import * as mqtt from 'mqtt';
import { Client } from 'pg';
import * as fs from 'fs'; 
import { Config, PlcTags, Tag } from './config-interface';

//which PostGres data types must be quoted when inserting data
//an almost exhaustive list ... enough for this project anyway/
const quotable_postgres_types: string[] = ['text','varchar','char','bpchar','name','interval', 'time', 'timestamp','date','json','jsonb'];

//interface for each datapoint passed to the db functions
interface DataPoint {
    column_name: string;
    data_type: string;
    value: any;
}
//interface for the entire datapoints object  
interface Datapoints {
    [key: string]: DataPoint;
}

//read a file synchronously - used to get config.json
function readFile(file_path: string): string | void { 
    try { 
        const data = fs.readFileSync(file_path, 'utf8'); 
        return data; 
    } catch (err) { 
        console.error(err); 
        return; 
    }
}

// Function to create table if it doesn't exist
async function createTables(config:Config, dbClient:Client) {  
    //traverse the config and create the table if it doesn't exist
    for(const table in config.plc.tags){
        let createTableQuery = `CREATE TABLE IF NOT EXISTS ${table} (id SERIAL PRIMARY KEY, timestamp TIMESTAMP `
        for(const column in config.plc.tags[table]){
            createTableQuery+=`, ${config.plc.tags[table][column].description} ${config.plc.tags[table][column].datatype} `
        }
        createTableQuery+=`);`
        console.log(createTableQuery)
        try {    
            await dbClient.query(createTableQuery);    
            console.log(`Table ${table} Created.`);  
        } catch (err) {    
            console.error(`Error creating table ${table}:`, err);  
        }
    }
}

// Function to insert data into the db
async function insertData(tablename:string, datapoints: Datapoints, dbClient:Client) {  
    let columnsQuery = '';
    let valuesQuery = '';
    for(const column in datapoints){
        //add the column name to the columns list of the insert statment
        columnsQuery+=`, ${datapoints[column].column_name} `
        //add the column value to the values list of the insert statement
        //also check to see if this column's type means its needs to be quoted
        if(quotable_postgres_types.includes(datapoints[column].data_type)){
            valuesQuery+=`, '${datapoints[column].value}' `
        } else{
            valuesQuery+=`, ${datapoints[column].value} `
        }       
    }
    valuesQuery = `(${valuesQuery.slice(1)})`
    columnsQuery= `(${columnsQuery.slice(1)})`
    const insertQuery = `INSERT INTO ${tablename} ${columnsQuery} VALUES ${valuesQuery}`;
    try {    
        await dbClient.query(insertQuery);    
        console.log(`Data inserted into ${tablename}`);  
    } catch (err) {    
        console.error(`Error inserting data into ${tablename}:`, err);  
    }
}

// Main function
async function main() {  
    //where the config.json structure will live
    let config: Config;
    console.log('Loading Configurations...');
    //read the config.json file
    const config_str:string|void = readFile('config.json');
    //if it's not string (it's a void) OR it's empty, then we can't go on 
    if(typeof config_str !== "string" || config_str.length === 0){
        console.error('Failed to parse config.json. (empty file or null returned)  Application Aborted.');
        return;
    } else {
        //attempting to JSON parse this file's contents should load it into memory as the Config interface.  
        //So, if parsing fails we can't go on
        try {
            //parsing succeeded, we're in business
            config = JSON.parse(config_str) as Config;
            console.log("Configurations Successfully Loaded.");
        } catch(err) {
            //parsing failed. we go bye bye... :(
            console.error('Failed to parse config.json. (failed to parse as a json object)  Application Aborted.')
            return;
        }
    }
    //now config is loaded, use it....
    console.log("Connecting to Database")
    // Initialize PostgreSQL client
    const dbClient:Client = new Client(config.database.connection);
    //connect client
    try {    
        await dbClient.connect();   
        console.log('Connected to PostgreSQL Database');    
    } catch (err) {    
        console.error('Error connecting to PostgreSQL. Application Aborted:', err);
        return;  
    }  
    //call createTables to ensure db is built up before we start inserting data
    console.log("Checking Database Structure")
    createTables(config,dbClient);
    console.log("Database Structure Comfirmed")

    //connect to mqtt
    console.log('Starting MQTT subscription');  
    // Initialize MQTT client  
    const mqttClient = mqtt.connect(config.mqtt.connection.brokerUrl, config.mqtt.connection.options);  
    mqttClient.on('connect', () => {    
        console.log('Connected to MQTT broker');    
    });  
    mqttClient.on('error', (err) => {    
        console.error('MQTT connection error:', err);  
    });  
    // Subscribe to the topics    
    //extract from config.mqtt.topic_mapping the proper map joined by '/' and ended with '#'
    const joinedMapping = config.mqtt.topic_mapping .map(mapping => Object.values(mapping)[0]) .join('/'); 
    const topic = `${config.mqtt.connection.baseTopic}${joinedMapping}/#`; 
    mqttClient.subscribe(topic, (err) => {
        if (err) {
            console.error(`Failed to subscribe to topic ${topic}:`, err);
        } else {
            console.log(`Subscribed to topic ${topic}`);        
        }      
    });    
    // Handle incoming messages  
    mqttClient.on('message', (topic, message) => {    
        try {      
            const data = JSON.parse(message.toString());      
            console.log(`Received message on ${topic}:`, data);      
            // Extract payload name from last item in topic structure
            const payloadName = topic.split('/').pop()?.toString();
            // log error if it's undefined or null
            if (payloadName === null || payloadName === undefined) {
                throw new Error(`Invalid topic: ${topic}`);
            }            
            
            // Build the datapoints object to pass a payload definition to insertData
            const datapoints: Datapoints = {};
            // add to my datapoints structure the standard timestamp that will be in any payload.
            datapoints["timestamp"] = {
                column_name: 'timestamp',
                value: data["timestamp"],  //timesatemp is a required field that should always be in the data
                data_type: "timestamp"
            }
            // Get definition from config.plc.tags that matches payload name
            const definition:Tag[] = config.plc.tags[payloadName.toString()] as Tag[];
            // Build the datapoints object from definition
            // Should become an object with each definition's name, value, and datatype
            for (const tag of definition) {
                const dp = {
                    column_name: tag.description,
                    value: data[tag.description],
                    data_type: tag.datatype
                };
                datapoints[tag.description] = dp;
            }
            //call insertData with the datapoints object
            insertData(payloadName.toString(),datapoints,dbClient);
        } catch (err) {         
            console.error('Error parsing message:', err);    
        }  
    });
}  
       
main(); 