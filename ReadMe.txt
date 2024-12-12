1***Create your DIRECTORY

2***navigate into it
******Create src directory
mkdir src
******Create dist directory
mkdir dist
******Create ignore directory (if you want a place to hide old code for a while - will be excluded from compiling by config later)
mkdir ignore
******Create files directory (if you want a place to drop or pickup files - will be excluded from compiling by config later) 
mkdir files

3***run these commands in the root directory of your workspace
npm init -y
npm install typescript ads-client @types/node @types/ads-client mqtt @types/mqtt --save-dev
tsc -init

4***open tsconfig.json
******change rootDir to "./src" (and uncomment line)
******change outdir to "./dist" (and uncomment line)
add this after Compile Options:

,
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "ignore",
    "files"
  ]

5***setup github with command:
git init

6***create file in root called .gitignore, fill it with this:

# Node modules 
node_modules/ 
# Build output 
dist/ 
files/
ignore/
# TypeScript compiled JavaScript 
*.js 
*.js.map 
# Logs 
logs/ 
*.log 
# Dependency directories 
npm-debug.log* 
yarn-debug.log*
yarn-error.log*


7***add your src files to git with command:
git add .
***commit your files to git with a descriptive message:
git commit -m "message goes here"
***connect to a remote repository:
git remote add origin https://github.com/yourusername/your-repo-name.git
***push code to the remote repository
git push -u origin master
***checkout code
git checkout
***checkout code to another branch
git checkout -b new-feature-branch-name
***merge branches 
git checkout master 
git merge new-feature-branch-name
git push

8***create ts files in src directory and save them

9***compile them with this command:
npx tsc

10***find your js file in the dist folder and then run your js file with this command 
node dist/compiled_js_file.js