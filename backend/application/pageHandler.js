var rp  =   require("request-promise") ;
var _ = require("underscore");

var pageManager = {
   home: function(req, res)
   {
      var to_template = {};
      res.render("home/index", to_template);
   },
   projects: function(req, res)
   {
      var to_template = {};
      res.render("projects/index", to_template);
   },
};

module.exports = pageManager;
