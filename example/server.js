
require('../lib/web-servo')
	.setDir('./') // set the server dir to working dir
	.config() // Load the config from default file config.json
	.start(); // start the server

