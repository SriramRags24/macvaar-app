var hasuraUrl = '';
if (global.__env === 'development') {
    hasuraUrl = 'http://104.155.192.195:30808/';
}
else if (global.__env === 'production') {
    hasuraUrl = 'http://hasuradb.default:8080/';
}

module.exports = hasuraUrl;
