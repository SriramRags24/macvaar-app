//Cluster provides to utilize multi-core architecture.
var cluster = require('cluster');
var express = require('express');

//if the workers are set on the env variable then use them, else get total number of cores on the system.
var workers = process.env.WORKERS || require('os').cpus().length;
var args = process.argv;
var serverPort = 8090;

//NOTE: This will set a global base variable which has the directory structure. Helps maintain consistency in all subdirectory js.
global.__base = __dirname + '/';
// This will bring changes in development automatically.
global.__env = 'development';
//global.__env = 'production';

//The following modules is used to config the express base application.
var cons = require('consolidate');
var rp  =   require("request-promise") ;
var bp  =   require("body-parser") ;
var underscore = require("underscore");
var routes = require(__base + 'serverConfig/routes');
 

//var template = require(__base + 'serverConfig/template');
//var middleware = require(__base + 'serverConfig/middleware');

var loggerUtil = require(__base + 'serverConfig/logger');
var logger = loggerUtil.getLogger('server.js');

/**
 * Starts the express based application server using the given routing.
 */
function serveApp() {

   var app = express();

   //template(app);//Adds template.
   //middleware(app);//Adds Middleware.
   routes(app);//Adds routes.
   app.set('view engine', 'html');
   app.engine('html', cons.underscore); 
   app.listen(serverPort);
}

/**
 * Starts of the server and spawns children which in-turn mimics the one-thread architecture of Nodejs (In Case Of Prod)
 * else starts of a debug server with just one thread. (Debug)
 *
 * Why? : Because nodejs one-thread solution is not using the complete machine architecture (AKA Processing power). i.e.: Eat what you paid for..
 */
function startServer() {

   //If the arguments are not available <VERY UNLIKELY> or if the arguments are just 2 <server> <server.js> then its prod
   if (args === null || args.length <= 2) {

      //Father
      if (cluster.isMaster) {
         for (var i = 0; i < workers; i++) {
            cluster.fork();
         }

         //A worker restart if a cluster child fails.
         cluster.on('exit', function() {
            logger.log('info', 'A worker process died, restarting the worker...');
            cluster.fork();
         });

         logger.log('info', 'started cluster with ' + workers + ' workers');
      } else if (cluster.isWorker) { //Child
         serveApp();
      }
   } else if ((args !== undefined && args !== null && args.length === 3) && ('--debug'.toUpperCase() === args[2].toUpperCase())) {
      serveApp();
      global.__env = 'development';
      logger.log('info', 'started a single thread node application for code debug.');
   } else {
      logger.log('info', 'Command-line arguments not supported, please check the arguments : ', args);
   }
}

/**
* This basically handles all uncaughtExceptions and forces the nodejs server to exit. It basically logs them on console.
* NOTE: the function assumes that there is a cluster management tool (like kubernetes) to restart the application in-case all hell is let loose!!
* TODO: we need to make this into a mountable error folder.
*
* @param  {Event} 'uncaughtException' if an exception occurs which is not handled by either express.js
* @param  {Object} err the error which is caught by the process.
*/
process.on('uncaughtException', function(err) {
   logger.error(err.message);
   logger.error(err.stack);
   process.exit(1);
});

//Lets Start the server.
startServer();
