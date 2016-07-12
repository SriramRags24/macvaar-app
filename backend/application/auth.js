var getUserData = function(req) {
   var userData = {};
   if (req.headers['x-hasura-role'] !== 'anonymous') {
      userData.isLogin = true;
      userData.id = req.headers['x-hasura-user-id'];
   } else {
      userData.isLogin = false;
   }
   return userData;
};

module.exports = getUserData;
