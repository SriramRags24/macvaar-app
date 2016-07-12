var winston = require('winston');
var utils = require(__base + 'serverConfig/utils');

//A Custom logger which will record the logs onto the console & file.
var logFile = __base + 'node-webserver.log';

winston.add(winston.transports.File, {
   level: 'debug',
   timestamp: true,
   stringify: true,
   prettyPrint: true,
   humanReadableUnhandledException: true,
   showLevel: true,
   filename: logFile
});

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
   level: 'debug',
   timestamp: true,
   stringify: true,
   prettyPrint: true,
   humanReadableUnhandledException: true,
   showLevel: true
});

/**
 * Logger object is a common implementation to improve the overall logging.
 * @type {Object}
 */
var logger = {

   /**
    * The function passes a string which is used to define the Object which is used.
    * @param  {String} objName the object name for the looger.
    * @return {Object} logger Object with the default log methods.
    */
   getLogger: function(objName) {

      var objNameStr = utils.isDefined(objName) ? objName : 'anonymous class';
      var messageStr = '[%s] - %s';

      var log = function(type, message) {
         winston.log(type, messageStr, objNameStr, message);
      };

      var info = function(message) {
         winston.info(messageStr, objNameStr, message);
      };

      var warn = function(message) {
         winston.warn(messageStr, objNameStr, message);
      };

      var error = function(message) {
         winston.error(messageStr, objNameStr, message);
      };

      return {
         log: log,
         info: info,
         warn: warn,
         error: error
      };
   }
};

module.exports = logger;
