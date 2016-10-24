
# Tutorials

## Make a server from scratch

Assuming you start from nothing, install Node (https://nodejs.org/en/download/) and open a console. Then create a directory for your project and install the web-servo module:
```
  mkdir myProject
  cd myProject
  npm install web-servo
```

Create the script "server.js" to launch the server in "myProject/":
```
  require('web-servo').start();
```
If you run the server now, it will show an error because the configuration is not set in the script and the server is supposed to use the file "config.json" that doesn't exist yet. It is also recommanded to create the WWW root directory and log directory so everything works fine.
```
  mkdir www
  mkdir log
```
Now create "config.json" in "myProject/":
```
{
  "server": {
    "port": "9000",
    "dir": "www/"
  },
  "log": {
    "access": {
      "enabled": true,
      "path": "log/access.log",
      "console": true
    },
    "error": {
      "enabled": true,
      "path": "log/error.log",
      "console": true,
      "debug": true
    }
  }
}
```
In this file, we defined the server to run on port 9000 and the WWW directory to "www/". I also add the log parameters to show access and errors in the console.
If you omit a parameter in this file, it will take the default value. For example, the default page is set by default to "index.html".

Now launch the server and it should run properly:
```
  node server.js
```

The console will output:
```
  Using config file "C:\Users\me\git\myProject\config.json"
  Using WWW directory "C:\Users\me\git\myProject\www"
  Server listening on: http://localhost:9000
```

Create a simple "index.html" file and put it in "myProject/www/":
```
  <!doctype html>
  <html>
    <head>
      <title>Hello world!</title>
    </head>
    <body>
      This is the Hello world page!
    </body>
  </html>
```

Now open a browser and request http://localhost:9000/ you should see the Hello world page. You can now build a whole website inside the WWW directory with images, CSS, JS ...


