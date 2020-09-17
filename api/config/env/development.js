var ip = require("ip");
console.dir(ip.address());

var host = ip.address();

var tokenSecret = "superSecret";
// var tokenSecret = "Adappt-Services";
var _ = require('lodash');
var port = 9000;
var options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
};
// var options = {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// };
var db = {
    // adobe: {
    //     url: "mongodb://root:adapptroot@adobe.adapptonline.com/occupancy?authSource=admin",
    //     options: options
    // },
    // barclays: {
    //     url: "mongodb://adapptadmin:adappt-barclays-admin@barclays.adapptonline.com/occupancy?authSource=admin",
    //     options: options
    // },
    localhost: {
        url: "mongodb://localhost:27017/Services",
        options: options
    }
    // "adappt-kores": {
    //     url: "mongodb://root:adapptroot@kores.adapptonline.com/adappt-kores?authSource=admin",
    //     options: options
    // },
    // "adappt-jll": {
    //     url: "mongodb://root:adapptroot@jll.adapptonline.com/adappt-jll?authSource=admin",
    //     options: options
    // },
    // "adappt-lnt": {
    //     url: "mongodb://root:adapptroot@lnt.adapptonline.com/adappt-lnt?authSource=admin",
    //     options: options
    // },
    // "adappt-mmoser": {
    //     url: "mongodb://root:adapptroot@mmoser.adapptonline.com/adappt-mmoser?authSource=admin",
    //     options: options
    // },
    // "adappt-bosch": {
    //     url: "mongodb://root:adapptroot@bosch.adapptonline.com/lmsDemo?authSource=admin",
    //     options: options
    // },
    // "adappt-lenovo": {
    //     url: "mongodb://adapptadmin:adappt-lenovo-admin@lenovo-us.adapptonline.com/adappt-lenovo-us?authSource=admin",
    //     options: options
    // }
};

var domainlist = [
    // "adobe",
    // "barclays",
    "localhost"
    // "adappt-kores",
    // "adappt-jll",
    // "adappt-lnt",
    // "adappt-mmoser",
    // "adappt-bosch",
    // "adappt-lenovo",

];
global.domainData = [
    // "adobe",
    // "barclays",
    "localhost"
    // "adappt-kores",
    // "adappt-jll",
    // "adappt-lnt",
    // "adappt-mmoser",
    // "adappt-bosch",
    // "adappt-lenovo",
    // "localhost"
];


module.exports = {
    port: port,
    db: db,
    sessiondb: "mongodb://localhost:27017/Services",
    host: host,
    tokenSecret: tokenSecret,
    sessiontimeout: 15 * 60,
    master_database_uri: "mongodb://localhost:27017/Services",
    master_database_name: "Services",
    auth_service_jwt_url: "http://localhost:4200/jwt/auth",
    auth_service_oauth_url: "http://localhost:4200/oauth/auth",
    domainlist: domainlist
};