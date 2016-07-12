var rp  =   require("request-promise") ;
var _ = require("underscore");
var ip = require("./hasuraConfig");

console.log(ip);
var headers = {"X-Hasura-Role":"admin","X-Hasura-User-Id":0, "Content-Type":"application/json"};

var pageManager = {

   home: function(req, res) {

      var to_template = {};
      /*
      var req_obj = {};
      var query = {"columns":["*"]};
      req_obj["headers"] = headers;
      req_obj["url"] = ip + "api/1/table/table-name/select";
      req_obj["body"] = JSON.stringify(query);

      rp.post(req_obj).then(function(response){

          response = JSON.parse(response);
          to_template["data"] = response;
          to_template["user_data"] = res.locals.user_data;
          res.render("home/index", to_template);

      });
    */
          res.render("home/index", to_template);
   },

};

module.exports = pageManager;
