var config = require('./config'),
    mongoose = global.mongoose = require('mongoose');
require('mongoose-double')(mongoose);


var options = {
        useNewUrlParser: true
    },
    localSchemeFile = require('./localschemas')
schemaFile = require('./schemas'), // external schema file
    mongooseMulti = require('mongoose-multi');

var schemafiles = {
    // "adobe": schemaFile,
    // "barclays": schemaFile,
    "localhost": localSchemeFile
        // "adappt-accenture": schemaFile,
        // "adappt-kores": schemaFile,
        // "adappt-lnt": schemaFile,
        // "adappt-jll": schemaFile,
        // "adappt-zs": schemaFile,
        // "adappt-mmoser": schemaFile,
        // "adappt-bosch": schemaFile,
        // "adappt-amazon": schemaFile,
        // "adappt-lenovo": schemaFile

}

var db = mongooseMulti.start(config.db, schemafiles);
/*  var db = mongoose.connect(config.db, options);
 db.on('error', console.error.bind(console, 'connection error:'));
 db.once('open', () => {
     console.log('connected');
 }); */

// require('../app/models/user.server.model');

module.exports = db;