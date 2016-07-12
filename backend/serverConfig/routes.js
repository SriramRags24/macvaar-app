var page = require(__base + 'application/pageHandler');

var express = require('express');
var fs = require('fs');

var loggerUtil = require(__base + 'serverConfig/logger');
var logger = loggerUtil.getLogger('routes.js');

var rp  =   require("request-promise") ;
var ip = require(__base + "application/hasuraConfig");

/**
 * Exports the modules for the touting of the Nodejs application. The function requires a copy of the express object.
 * @param  {Object} app the express framework library code for routes.
 * @return {Function} the actual routes object which will be used for redirecting the restful APIs
 */
module.exports = function(app) {

    var check_login  =   function(req, res, next)
    {
        /*
        var role = req.headers["x-hasura-role"];
        if(role != "admin")
        {
            res.redirect(302, "/login");
        }
        else
        {
            //fetch user data
            var req_obj = {};
            var user_tm_id = req.headers["x-hasura-user-id"]
            var user_query = {"columns":["*"],"where":{"tm_id": parseInt(user_tm_id)}};
            req_obj["headers"] = {"X-Hasura-Role": "admin", "X-Hasura-User-Id": 1, "Content-Type": "application/json"};
            req_obj["url"] = ip + "api/1/table/user/select";
            req_obj["body"] = JSON.stringify(user_query);

            rp.post(req_obj).then(function(user_response){
                user_response = JSON.parse(user_response)[0];
                res.locals.user = user_response;
                next();
            });
        }
        */
        next();
    };

    app.use('/styles', express.static('static/styles'));
    app.use('/scripts', express.static('static/scripts'));

    app.get('/home', check_login, page.home);

    app.get('*',function(req, res)
    {
        //ideally this should be a 404 page
        //res.send('Page not found');
        console.log("404");
        res.render("error/index");
    });
};


