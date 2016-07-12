var bodyParser = require('body-parser');

/**
 * Injects necessary Middleware, the function injects only bodyParser who primary purpose is to make a structured JSON Object
 * from the request.
 *
 * @param  {Object} app basically is the express application.
 */
module.exports = function(app) {
   app.use(bodyParser.json());
};
