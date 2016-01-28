
/**
 * The main class
 */
var webservo = function() {

	this.initModules();

	this.isInitiated = false;
	this.isRunning = false;
	this.isSilent = false;
	this.configData = {};
	this.setDir(process.cwd());
};


/**
 * Initialize the modules
 */
webservo.prototype.initModules = function() {
	// init the modules
	this.modules = {};
	this.modules.fs = require('fs');
	this.modules.os = require('os');
	this.modules.url = require('url');
	this.modules.http = require('http');
	this.modules.mime = require('mime');
	this.modules.path = require('path');
	this.modules.busboy = require('busboy');
	this.modules.colors = require('colors');
	this.modules.child_process = require('child_process');
};

/**
 * Set the server directory. Chainable
 * @param {string} dir The directory, relative or absolute
 */
webservo.prototype.setDir = function(dir) {

	// init the dir object
	this.dir = {};
	this.dir.base = this.modules.path.resolve(dir+'/');

	// check if the config is loaded
	if (this.configData && this.configData.server && this.configData.server.dir) {
		// set the www directory
		this.dir.www = this.modules.path.resolve(this.dir.base+'/'+this.configData.server.dir+'/');
	}
	return this;
};

/**
 * Trim
 */
webservo.prototype.trim = function (str) {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};


/**
 * Set silent mode on and off. Chainable
 */
webservo.prototype.silent = function (b) {
    if (typeof b === "undefined") {
    	b = true;
    }
    this.isSilent = b;
    return this;
};


/**
 * Set the config file of the server. Chainable
 * @param  {string}	file Path of the config file
 * @return {bool}  		 True on success
 */
webservo.prototype.config = function(file) {

	this.isInitiated = false;
	this.configData = {};

	// default config file
	if (!file) {
		file = this.modules.path.resolve(this.dir.base+'/config.json');
	}

	var config = false;

	// check if the file exists
	try {
		this.modules.fs.lstatSync(file);
	} catch (e) {
		this.log(('Using config file "'+file+'"').cyan);
		this.error(''+e);
		return this;
	}

	// try to load the JSON file
	try {
		config = require(file);
	} catch (e) {
		this.log(('Using config file "'+file+'"').cyan);
		this.error(''+e);
		return this;
	}

	// default in config object
	if (!config) config = {};

	if (!config.server) config.server = {};
	if (!config.server.port) config.server.port = '80';
	if (!config.server.dir) config.server.dir = 'www/';

	if (!config.page) config.page = {};
	if (!config.page.script) config.page.script = 'xjs';
	if (!config.page.default) config.page.default = 'index.html';

	if (!config.log) config.log = {};
	if (!config.log.error) config.log.error = { "enabled": false };
	if (!config.log.access) config.log.access = { "enabled": false };
	if (!config.log.warning) config.log.warning = { "enabled": false };

	this.log(('Using config file "'+file+'"').cyan);

	this.configData = config;

	// check error log file
	try {
		var file = this.modules.path.resolve(this.dir.base+'/'+config.log.error.path);
		var error = this.modules.fs.appendFileSync(file, '');
	} catch (e) {
		this.warning('Cannot write in error log file "'+file+'"');
		config.log.error.enabled = false;
	}

	// check access log file
	try {
		var file = this.modules.path.resolve(this.dir.base+'/'+config.log.access.path);
		var access = this.modules.fs.appendFileSync(file, '');
	} catch (e) {
		this.warning('Cannot write in access log file "'+file+'"');
		config.log.access.enabled = false;
	}

	this.configData = config;
	this.isInitiated = true;

	this.dir.www = this.modules.path.resolve(this.dir.base+'/'+this.configData.server.dir+'/');
	this.log(('Using WWW directory "'+this.dir.www+'"').cyan);

	return this;
};

/**
 * Get the date and time for log
 */
webservo.prototype.getDateTime = function() {

    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
};

/**
 * A error occured
 * @param  {string} message Error description
 */
webservo.prototype.error = function(message) {
	// if config not loaded yet, just print message in console
	if (!this.configData || !this.configData.log) {
		this.log(message.red);
	} else if (this.configData.log.error.enabled) {
		// write error in file
		this.writeError(message);

		// print in console if needed
		if (this.configData.log.error.console) {
			this.log(message.red);
		}
	}
};

/**
 * Write the error in the error log file
 * @param  {string} message 
 */
webservo.prototype.writeError = function(message) {
	return this.modules.fs.appendFile(this.modules.path.resolve(this.dir.base+'/'+this.configData.log.error.path), this.getDateTime()+'	'+message+String.fromCharCode(13));
};

/**
 * Show message in console
 * @param  {string} message 
 */
webservo.prototype.log = function(message) {
	if (!this.isSilent) {
		console.log(message);
	}
};

/**
 * Show warning in console
 * @param  {string} message 
 */
webservo.prototype.warning = function(message) {
	this.log(message.yellow);
};

/**
 * Show debug for a JS file in console
 * @param  {string} file Path to node file
 */
webservo.prototype.debug = function(file) {
	var ws = this;

	// callback to show the result
	function puts(error, stdout, stderr) { 

		// split the lines
		var lines = (stderr+'').split(String.fromCharCode(13));

		// show each line
		for (var t=0; t<lines.length; t++) {
			// hide if line empty
			if (ws.trim(lines[t]) != '') {
				ws.log(('Debug: '+lines[t]).replace(String.fromCharCode(13), '').replace(String.fromCharCode(10), '').green);
			}
		}
	}

	// execute "node -c file" to get the error details
	this.modules.child_process.exec("node -c "+file, puts);
};

/**
 * Log an access
 * @param  {object} request    
 * @param  {object} response   
 * @param  {int} 	statusCode The returned status code (200, 404 ...)
 */
webservo.prototype.access = function(request, response, statusCode) {
	
	// if access log is enabled
	if (this.configData.log.access.enabled) {

		// get the url
		var url = request.url;

		// get the IP @TODO convert to ipv4 if possible
		var ip = request.connection.remoteAddress;

		// write in log
		this.writeAccess(statusCode, ip, url);

		// write in console if needed
		if (this.configData.log.access.console) {
			this.log(('Access: '+ip+'	'+url).magenta);
		}
	}
}

/**
 * Write an access in the access log file
 * @param  {int} 	statusCode The returned status code
 * @param  {string} ip         Remote IP
 * @param  {string} url        URL
 */
webservo.prototype.writeAccess = function(statusCode, ip, url) {
	return this.modules.fs.appendFile(this.modules.path.resolve(this.dir.base+'/'+this.configData.log.access.path), this.getDateTime()+'	'+statusCode+'	'+ip+'	'+url+String.fromCharCode(13));
};

/**
 * Return a page with status code 500
 * @param  {object} request  
 * @param  {object} response 
 * @param  {string} message
 */
webservo.prototype.status500 = function(request, response, message) {

	// log the access
	this.access(request, response, 500);

	// show in console if needed
	if (message) {
		this.error(message);
	}

	// output to client
	response.writeHead(500, {"Content-Type": "text/html"});
	response.write("500 Server error");
	response.end();
	return true;
};


/**
 * Return a page with status code 404
 * @param  {object} request  
 * @param  {object} response 
 * @param  {string} message
 */
webservo.prototype.status404 = function(request, response, message) {
	// log the access
	this.access(request, response, 404);

	// show in console if needed
	if (message) {
		this.error(message);
	}

	// output to client
	response.writeHead(404, {"Content-Type": "text/html"});
	response.write("404 Not found");
	response.end();
	return true;
};

/**
 * Return a page with status code 200
 * @param  {object} request  
 * @param  {object} response 
 * @param  {string} message
 */
webservo.prototype.status200 = function(request, response, body) {
	// log the access
	this.access(request, response, 200);

	// output to client @TODO change content type // detect with response.getHeader("Content-Type")
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();
	return true;
};

/**
 * Check if the file is a server script
 * @param  {string}  file Path to the file
 */
webservo.prototype.isScript = function(file) {
	return this.modules.path.extname(file) == "."+this.configData.page.script;
};

/**
 * Process a file. The file 
 */
webservo.prototype.process = function(request, response, file, parameters) {
	// @TODO check if file exists here
	 
	// check if file is a script
	if (this.isScript(file)) {
		// process as a JS script, execute on the server
		this.processScript(request, response, file, parameters);
	} else {
		// process as a simple file, send the data to client
		this.processFile(request, response, file, parameters);
	}
	return true;
};

/**
 * Execute script and return result
 */
webservo.prototype.processScript = function(request, response, file, parameters) {
	
	// check if file exists
	try {
		this.modules.fs.lstatSync(file);
	} catch (e) {
		// fail
		this.error(''+e);
		return false;
	}
    
    // execute the JS file and catch error
    try {
    	// absolute path of the file
    	var pathAbsolute = this.modules.path.resolve(file);

    	// get the function to call / execute the JS
    	var fct = require(pathAbsolute);

    	var getType = {};
    	var result = false;

    	// if result if a function, execute it here and get result
    	if (fct && getType.toString.call(fct) == '[object Function]') {
    		result = fct(request, response, parameters, this);
    	}

    	// delete cache  so the file is also executed next time
    	require.cache[pathAbsolute] = null;
    } catch(e) {
    	// absolute path of the file
    	var pathAbsolute = this.modules.path.resolve(file);

    	// delete cache  so the file is also executed next time
    	require.cache[pathAbsolute] = null;

    	// try to show the debug of the error
    	if (this.configData.log.error.debug) {
    		this.debug(file);
    	}

    	// return the error 500 page
		return this.status500(request, response, ''+e+' in "'+file+'"');
    }
    
    // display a warning if the script returned nothing
    if (result === false || result === '') {
		this.warning('Script returned nothing: "'+file+'"');
    }

    // return the page with status code 200
	return this.status200(request, response, result || '');
};

/**
 * Get file and return it to client
 */
webservo.prototype.processFile = function(request, response, file, parameters) {

	// process the file
    try {
    	var content = this.modules.fs.readFileSync(file);
		response.writeHead(200, {"Content-Type": this.modules.mime.lookup(file)});
		response.write(content);
		response.end();
	} catch (e) {
		// if any errors happened, file is probably not here
		// return the 404 page
		return this.status404(request, response, 'Error: 404 file not found "'+file+'"');
	}
};


webservo.prototype.getUrlFile = function(url) {
	// build the path of the file
	var file = [this.dir.www, this.modules.url.parse(url).pathname].join('/').replace('//', '/');
	var filename = this.modules.path.basename(file);

	// set default file if needed
	if (file.slice(-1) == '/' || filename == '') {
		file += '/'+this.configData.page.default;
	}

	return file;
};

/**
 * Stop the server
 * @param  {Function} callback
 */
webservo.prototype.stop = function(callback) {

	// server is not running
	if (this.isRunning === false)	{
		this.warning('Stop: the server is not running');
		return this;
	}
	
	var ws = this;

	// stop the server
	this.server.close(function(){
        ws.log('Server stopped');

        // call the callback
        if (callback) {
        	callback(ws);
        }
    });
	return this;
};




webservo.prototype.start = function(callback) {

	if (this.isRunning === true)	{
		this.warning('Start: the server is already running');
		return this;
	}

	// init the server
	if (this.isInitiated === false)	{
		this.config();
	}

	// the server could not init
	if (this.isInitiated === false)	{
		// exit with failure code
		this.error('Failed to load the server');
		return this;
	}


	function handleRequest(request, response) {
		try {
	    	var requestedFile = ws.getUrlFile(request.url);
			var parameters = ws.modules.url.parse(request.url, true);
			parameters = parameters.query;

			if (request.method == 'POST') {
	    		var busboy = new ws.modules.busboy({ headers: request.headers });

				busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
				    var saveTo = this.modules.path.join(os.tmpDir(), ws.modules.path.basename(fieldname)+'_'+Math.floor(Math.random() * 10000000000)+'_'+filename);
					file.pipe(ws.modules.fs.createWriteStream(saveTo));
				    parameters[fieldname] = saveTo;
				});
				busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
				    parameters[fieldname] = val;
				});
				busboy.on('finish', function() {
					ws.process(request, response, file, parameters);
				});
				return request.pipe(busboy);
			}

			return ws.process(request, response, requestedFile, parameters);

	    } catch (e) {
	    	return ws.status500(request, response, ''+e);
	    }
	};

	this.server = this.modules.http.createServer(handleRequest);

	var ws = this;
	this.server.listen(this.configData.server.port, function() {
	    ws.log("Server listening on: http://localhost:"+ws.configData.server.port);
        if (callback) {
        	callback(ws);
        }
	});


	this.isRunning = true;
	return this;
};


module.exports = new webservo();


