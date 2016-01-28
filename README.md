
# web-servo

A simple Node js web server that is executing node JS scripts.

## Features
- Easy to use, launch with one line of code
- Configuration in a JSON file
- Log management of errors and access
- Working example
- Executing node javascript file on the server and output result
- Debug log to fix your node script file
- Descriptive log in the console

## Install

**From node / npm:**

    npm install web-servo

**From GitHub:**

    git clone https://github.com/Komrod/web-servo.git
    cd web-servo
    npm install

## How to use

Launch the server with one line of script:
    
    require('web-servo').start();

Change server directory:

    var ws = require('web-servo');
    ws.setDir('../somedir/');
    ws.start();

## Methods

1. setDir(dir)
Set the dir of the server before start.
- dir: {string} directory relative or absolute of the server
Example: ws.setDir('./myServer/');

2. silent(b)
Set the silent mode on or off, no console output.
- b: {bool} if true, set the silent mode on, default true
Example: 
``` 
  ws.silent(); // silent mode set on
  ws.silent(false); // silent mode set
  ws.silent(true);
``` 

## Configuration file

The configuration file "config.json" must be located in the server directory. The server directory is initialized to the working directory at startup and can be changed.

```	
{
  "server": {
    "port": "80",					        <-- port of the web server
    "dir": "www/"					        <-- directory of the server (from server dir)
  },
  "page": {
    "script": "xjs",              <-- extension of the JS to execute server side
    "default": "index.html"       <-- default page if none
  },
  "log": {
    "access": {
      "enabled": true,				    <-- if access log is enabled
      "path": "log/access.log",		<-- path of the access log file
      "console": false				    <-- show access log in console
    },
    "error": {
      "enabled": true,				    <-- if error log is enabled
      "path": "log/error.log",		<-- path of the error log
      "console": true				      <-- show error log in console
      "debug": true,				      <-- additional debug for error in script
    },
    "warning": {
      "enabled": true				      <-- show warning log in console
    }
  }
}
```

## Example

Execute the example server :
    
    cd example/
    node server.js

The server is started. Open your browser and go to these locations:
- http://localhost:80/            <-- index page (default page is index.html)
- http://localhost:80/index.html  <-- index page directly
- http://localhost:80/404.html    <-- Page not found
- http://localhost:80/script.xjs  <-- script executed on the server, returns HTML
- http://localhost:80/simple.xjs  <-- simple script executed on the server, returns nothing
- http://localhost:80/error.xjs   <-- debug log on console

## TODO

- Configure files for error pages
- Set server config from script
- change a config parameter from script
- Tutorial to set up a server from scratch
- Tutorial to script, get POST data and upload files
- Launch from command line
- Change mime type of output page in a script
- Password protected directory
- Run multiple types of script

- × Launch silently, no console output
- × Chainable functions
