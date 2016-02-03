
# web-servo

A simple HTTP web server executing node JS scripts.

The server can return normal HTTP files (.css, .html, .js ...) and will execute the .xjs files as node scripts (file extension editable in config). So you can do everything a node script can do with a simple HTTP request.

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
``` 
  npm install web-servo
``` 

**From GitHub:**
``` 
  git clone https://github.com/Komrod/web-servo.git
  cd web-servo
  npm install
``` 

## How to use

Launch the server with one line of script:
``` 
  require('web-servo').start();
``` 

Change server directory:
``` 
  var ws = require('web-servo');
  ws.setDir('../somedir/');
  ws.start();
``` 

**For normal HTTP files:**
When a client request a file, the server will return the content of the file to the client, if the extension does not match with the script file extension (by default .xjs). The returned mime type depends on the file extension.

**For node script file:**
When the client request a file with the script extension (by default .xjs), the server will execute JS script and return the result as HTML. The server will not stop even if there is an error in the script but will return the 500 error page. There is an additional "debug" option which track the syntax error in the console.

**For unknown files:**
If file is not here, server will return the 404 error page.


Example XJS script that returns HTML:
```
  // As this script runs in the server, this will show in the console
  console.log('test');

  // to return HTML, we use module.exports
  module.exports = function(request, response, parameters, ws) {
    // request: HTTP request by client
    // response: HTTP response of server
    // parameters: GET and POST parameters
    // ws: web-servo object

    // Do something here, read some files ..
    // Then return the HTML
    return '<html><body>This is it!</body></html>';
  };

```

Simple XJS script:
```
  // We don't use module.exports so we can't return anything
  // We also don't know anything about the request (parameters, type ...)

  // Here, you can user any istalled modules
  fs.stat('/helloWorld.html', function (error, stast) {
    if (error) {
      // Trouble accessing the file.
      return fs.appendFile('helloworld.log', 'File is NOT ok');
    } else {
      // Do something
      return fs.appendFile('helloworld.log', 'File is ok');
    }
  });
```

## Methods

### setDir(dir)
Set the dir of the server before config() or start().
**dir**: {string} directory of the server, relative to working directory or absolute

Example: 
``` 
  ws.setDir('./myServer/');
``` 

### config(file)
Set the config for the server. Parameter can be a path to a config file or a config object. If parameter is omited, load the default file "config.json" in the server directory. If parameter is an object, consider it as the loaded config.
**file**: {mixed} path to the file or object

Example: 
``` 
  // Load the default file "config.json" from server directory
  ws.config();

  // Configure server to listen to port 9000
  ws.config({server: {port: 9000}})
``` 

### setConfigVar(name, value)
Set a configuration variable for the server.
**name**: {string} name of the variable as in config file with dots "." if the variable is in an object
**value**: {mixed} value

Example: 
``` 
  // Change config to show access in console
  .setConfigVar('log.access.console', true)
``` 

### start(callback)
Start the server then call the callback function. Configure by default the server if config() wasn't called

Example: 
```
  ws.start();
```

### stop(callback)
Stop the server then call the callback function 

Example: 
```
  ws.stop();
```

### silent(b)
Set the silent mode on or off, no console output.
**b**: {bool} if true, set the silent mode on, default true

Example: 
```
  // silent mode set on
  ws.silent(); 
```

**All these methods are chainable.**
Example:
``` 
  // set server to silent mode and start
  require('web-servo').silent().start(); 

  // set server dir and load a config file
  require('web-servo').setDir('./www-prod/').config('./config-prod.json'); 
``` 

## Configuration file

The configuration file "config.json" must be located in the server directory. The server directory is initialized to the working directory at startup and can be changed with the setDir() method. You can also load a different config file or load directly an object using the config() method.

```	
{
  "server": {
    "port": "80",                 <-- port of the web server
    "dir": "www/"                 <-- directory of the www root (from server dir)
  },
  "page": {
    "script": "xjs",              <-- extension of the JS to execute server side
    "default": "index.html",      <-- default page if none
    "error": {
      "401": "page/401.html",     <-- full path of the 401 error page
      "404": "page/404.html",     <-- full path of the 404 error page
      "500": "page/500.html"      <-- full path of the 500 error page
    }
  },
  "log": {
    "access": {
      "enabled": true,            <-- if access log is enabled
      "path": "log/access.log",   <-- path of the access log file
      "console": false            <-- show access log in console
    },
    "error": {
      "enabled": true,            <-- if error log is enabled
      "path": "log/error.log",    <-- path of the error log
      "console": true             <-- show error log in console
      "debug": true,              <-- additional debug for error in script
    },
    "warning": {
      "enabled": true             <-- show warning log in console
    }
  }
}
```

## Example

Execute the example server :
```
    node example/server.js
```

The server is started. Open your browser and go to these locations:
- http://localhost:80/            <-- index page (default page is index.html)
- http://localhost:80/index.html  <-- index page directly
- http://localhost:80/404.html    <-- Page not found
- http://localhost:80/script.xjs  <-- script executed on the server, returns HTML
- http://localhost:80/simple.xjs  <-- simple script executed on the server, returns nothing
- http://localhost:80/error.xjs   <-- Error and debug log on console
- http://localhost:80/json.xjs    <-- change the header response to content type "application/json"

## Changelog

**Version 0.2**
- Set server config from script
- Check if www root directory exists
- Fix error 404 on XJS script request
- Change a config parameter from script
- Change mime type of output page in a script

**Version 0.1.2**
- Configure files for error pages
- Launch silently, no console output
- Chainable functions

## TODO

- Get additional informations about the uploaded files
- Tutorial to set up a server from scratch
- Tutorial to script, get POST data and uploaded files
- Tutorial for multiple servers
- Password protected directory
- URL aliases
- Build an API REST
- Timeout for a page / script
- Event system
- Launch from command line (port, dir ...)
- Cache system
- Run multiple types of script (PHP)
