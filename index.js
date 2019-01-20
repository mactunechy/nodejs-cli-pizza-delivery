/*
*Entry file for Application initialisation
*
*/

//Dependencies
var server = require('./lib/server');
var cli = require('./lib/cli');
//starting the server
server.init(); 


//starting the CLI after everything else
setTimeout(() => {
	cli.init()
},50);