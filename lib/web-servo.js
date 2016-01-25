

var webservo = function() {

	this.initModules();

	this.isInitiated = false;
	this.isRunning = false;
	this.configData = {};
	//this.setDir(__dirname);
	this.setDir(process.cwd());
};


webservo.prototype.initModules = function() {
	// init the modules
	this.modules = {};
	this.modules.fs = require('fs');
	this.modules.os = require('os');
	this.modules.url = require('url');
	this.modules.http = require('http');
	this.modules.mime = require('mime');
	this.modules.path = require('path');
	this.modules.colors = require('colors');
	this.modules.busboy = require('busboy');
};


webservo.prototype.setDir = function(dir) {
	this.dir = {};
	this.dir.base = this.modules.path.resolve(dir+'/');
	if (this.configData && this.configData.server && this.configData.server.dir) {
		this.dir.www = this.modules.path.resolve(this.dir.base+'/'+this.configData.server.dir+'/');
	}
};

webservo.prototype.config = function(file) {

	this.isInitiated = false;
	this.configData = {};

	if (!file) {
		file = this.modules.path.resolve(this.dir.base+'/config.json');
	}

	this.log(('Using config file "'+file+'"').cyan);
	var config = false;

	try {
		this.modules.fs.lstatSync(file);
	} catch (e) {
		this.error(''+e);
		return false;
	}

	try {
		config = require(file);
	} catch (e) {
		this.error(''+e);
		return false;
	}


	// default
	if (!config) config = {};

	if (!config.server) config.server = {};
	if (!config.server.port) config.server.port = '80';
	if (!config.server.dir) config.server.dir = 'www/';

	if (!config.page) config.page = {};
	if (!config.page.script) config.page.script = 'xjs';
	if (!config.page.default) config.page.default = 'index.html';

	this.configData = config;
	this.isInitiated = true;

	this.dir.www = this.modules.path.resolve(this.dir.base+'/'+this.configData.server.dir+'/');
	this.log(('Using WWW directory "'+this.dir.www+'"').cyan);

	// check error log
	
	
	// check access log
	

	return true;
};

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

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
};

webservo.prototype.error = function(message) {
	console.log(message.red);
	if (this.configData.log.error.enabled) {
		this.writeError(message);
	}
};

webservo.prototype.writeError = function(message) {
	return this.modules.fs.appendFileSync(this.modules.path.resolve(this.dir.base+'/'+this.configData.log.error.path), this.getDateTime()+'	'+message+String.fromCharCode(13));
};

webservo.prototype.log = function(message) {
	console.log(message);
};

webservo.prototype.warning = function(message) {
	console.log(message.yellow);
};

webservo.prototype.writeAccess = function(message) {
	return this.modules.fs.appendFileSync(this.modules.path.resolve(this.dir.base+'/'+this.configData.log.access.path), this.getDateTime()+'	'+message+String.fromCharCode(13));
};


webservo.prototype.status500 = function(response, message) {
	if (message) {
		this.error(message);
	}
	response.writeHead(500, {"Content-Type": "text/html"});
	response.write("500 Server error");
	response.end();
	return true;
};


webservo.prototype.status404 = function(response, message) {
	if (message) {
		this.error(message);
	}
	response.writeHead(404, {"Content-Type": "text/html"});
	response.write("404 Not found");
	response.end();
	return true;
};


webservo.prototype.status200 = function(response, body) {
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write(body);
	response.end();
	return true;
};


webservo.prototype.isScript = function(file) {
	return this.modules.path.extname(file) == "."+this.configData.page.script;
};


webservo.prototype.process = function(request, response, file, parameters) {
	if (this.isScript(file)) {
		this.processScript(request, response, file, parameters);
	} else {
		this.processFile(request, response, file, parameters);
	}
	return true;
};


webservo.prototype.processScript = function(request, response, file, parameters) {
	try {
		this.modules.fs.lstatSync(file);
	} catch (e) {
		this.error(''+e);
		return false;
	}
    
    try {
    	var pathAbsolute = this.modules.path.resolve(file);
    	var result = require(pathAbsolute)(request, response, parameters, this);
    	require.cache[pathAbsolute] = null;
    } catch(e) {
    	var pathAbsolute = this.modules.path.resolve(file);
    	require.cache[pathAbsolute] = null;
		return this.status500(response, ''+e);
    }
    
    if (result === false) {
		return this.status500(response, 'Script returned error status (false)');
    }
	return this.status200(response, result);
};

webservo.prototype.processFile = function(request, response, file, parameters) {
    try {
    	var content = this.modules.fs.readFileSync(file);
		response.writeHead(200, {"Content-Type": this.modules.mime.lookup(file)});
		response.write(content);
		response.end();
	} catch (e) {
		return this.status404(response, 'Error: 404 file not found "'+file+'"');
	}
};


webservo.prototype.getUrlFile = function(url) {
	var file = [this.dir.www, this.modules.url.parse(url).pathname].join('/').replace('//', '/');
	var filename = this.modules.path.basename(file);
	if (file.slice(-1) == '/' || filename == '') {
		file += '/'+this.configData.page.default;
	}
	return file;
};


webservo.prototype.start = function() {

	if (this.isRunning === true)	{
		this.warning('The server is already running');
		return false;
	}

	// init the server
	if (this.isInitiated === false)	{
		this.config();
	}

	// the server could not init
	if (this.isInitiated === false)	{
		// exit with failure code
		this.error('Failed to load the server');
		return false;
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
	    	return ws.status500(response, ''+e);
	    }
	};

	this.server = this.modules.http.createServer(handleRequest);

	var ws = this;
	this.server.listen(this.configData.server.port, function() {
	    ws.log("Server listening on: http://localhost:"+ws.configData.server.port);
	});


	this.isRunning = true;
};


module.exports = new webservo();


