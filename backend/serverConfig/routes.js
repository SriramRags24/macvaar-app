var page = require(__base + 'application/pageHandler');

var express = require('express');
var fs = require('fs');

var loggerUtil = require(__base + 'serverConfig/logger');
var logger = loggerUtil.getLogger('routes.js');

var rp  =   require("request-promise") ;

/**
 * Exports the modules for the touting of the Nodejs application. The function requires a copy of the express object.
 * @param  {Object} app the express framework library code for routes.
 * @return {Function} the actual routes object which will be used for redirecting the restful APIs
 */
module.exports = function(app) {

    app.use('/styles', express.static('static/styles'));
    app.use('/scripts', express.static('static/scripts'));

    app.get('/home', page.home);

    app.get('*',function(req, res)
    {
        //ideally this should be a 404 page
        //res.send('Page not found');
        console.log("404");
        res.render("error/index");
    });
};


