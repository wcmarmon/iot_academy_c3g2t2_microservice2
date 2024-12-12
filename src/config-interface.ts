/**
 * Tag interface definition
 * 
 * This interface defines the shape of one datapoint from the plc
 * 
 * @property description - The description of what the Tag represents - also doubles as the ColumnName in data tables
 * @property tagname - The name of the tag as it appears in the PLC - the name we would use to poll value from PLC
 * @property datatype - The data type of this datapoint in the database (used to create the columns as correct types)
 */
export interface Tag {
  description: string;
  tagname: string;
  datatype: string;
}

/**
 * Interface for a collection of tags from a PLC
 * 
 * This interface represents a collection of tags from a PLC, where the key is the table name in the database and the
 * value is an array of Tag objects. Each Tag object represents a single data point from the plc.
 */
export interface PlcTags {
  [key: string]: Tag[];
}


/**
 * This interface defines the shape of the configuration object
 * that this application uses to configure itself.
 * 
 * The configuration object has two main properties: `mqtt` and `plc`.
 * The `mqtt` property is an object that contains the configuration
 * options for the MQTT connection. The sub-properties of `mqtt`
 * are as follows:
 * 
 * - `connection`: An object that contains the configuration options
 *   for the MQTT connection. The sub-properties of `connection` are as
 *   follows:
 *   - `brokerUrl`: The URL of the MQTT broker to connect to.
 *   - `options`: An object that contains the configuration options for
 *     the MQTT connection. The sub-properties of `options` are as follows:
 *     - `port`: The port number to use when connecting to the MQTT broker.
 *     - `username`: The username to use when connecting to the MQTT broker.
 *     - `password`: The password to use when connecting to the MQTT broker.
 *   - `baseTopic`: The base topic to subscribe to in the MQTT broker.
 *   - `polling_interval`: The interval (in milliseconds) between polling
 *     the MQTT broker for new data.
 * - `topic_mapping`: An array of objects that define how to map a topic
 *   published to by the MQTT broker to a specific table in the database.
 *   Each object in the array contains the following properties:
 *   - `organization`: The organization name to use when mapping the topic
 *     to a table in the database.
 *   - `division`: The division name to use when mapping the topic to a table
 *     in the database.
 *   - `plant`: The plant name to use when mapping the topic to a table in the
 *     database.
 *   - `area`: The area name to use when mapping the topic to a table in the
 *     database.
 *   - `line`: The line name to use when mapping the topic to a table in the
 *     database.
 *   - `workstation`: The workstation name to use when mapping the topic to a
 *     table in the database.
 *   - `type`: The type name to use when mapping the topic to a table in the
 *     database.
 * 
 * The `plc` property is an object that contains the configuration options
 * for the PLC connection. The sub-properties of `plc` are as follows:
 * 
 * - `connection`: An object that contains the configuration options for the
 *   PLC connection. The sub-properties of `connection` are as follows:
 *   - `localAmsNetId`: The local AMS net ID to use when connecting to the
 *     PLC.
 *   - `localAdsPort`: The local ADS port to use when connecting to the PLC.
 *   - `targetAmsNetId`: The target AMS net ID to use when connecting to the
 *     PLC.
 *   - `targetAdsPort`: The target ADS port to use when connecting to the PLC.
 *   - `routerAddress`: The IP address of the router to use when connecting to
 *     the PLC.
 *   - `routerTcpPort`: The TCP port number to use when connecting to the router.
 * - `tags`: An object that contains the configuration options for the PLC tags.
 *   The sub-properties of `tags` are as follows:
 *   - `tagname`: The name of the tag as it appears in the PLC.
 *   - `description`: A description of the tag that can be used to identify it.
 *   - `datatype`: The data type of the tag as it appears in the PLC.
 * 
 * The `database` property is an object that contains the configuration options
 * for the database connection. The sub-properties of `database` are as follows:
 * 
 * - `connection`: An object that contains the configuration options for the
 *   database connection. The sub-properties of `connection` are as follows:
 *   - `host`: The hostname of the database server to connect to.
 *   - `port`: The port number to use when connecting to the database server.
 *   - `user`: The username to use when connecting to the database server.
 *   - `password`: The password to use when connecting to the database server.
 *   - `database`: The name of the database to connect to.
 * 
 * @author [IOT Academy Cohort 3 Group 2 Team 2](https://github.com/IOT-Academy-Cohort-3-Group-2)
 * @version 1.0
 */
export interface Config {
  mqtt: {
    connection: {
      brokerUrl: string;
      options: {
        port: number;
        username: string;
        password: string;
      };
      baseTopic: string;
      polling_interval: number;
    };
    topic_mapping: Array<{
      organization?: string;
      division?: string;
      plant?: string;
      area?: string;
      line?: string;
      workstation?: string;
      type?: string;
    }>;
  };
  plc: {
    connection: {
      localAmsNetId: string;
      localAdsPort: number;
      targetAmsNetId: string;
      targetAdsPort: number;
      routerAddress: string;
      routerTcpPort: number;
    };
    tags: PlcTags;
  };
  database: {
    connection: {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    };
  };
}
