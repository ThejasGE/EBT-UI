var express = global.express = require('express');
var path = require('path');
var io = require('socket.io');
var express = require('express');
var mongoose = global.mongoose = require('mongoose');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var engines = require('consolidate');



var db = mongoose.connect('mongodb://localhost:27017/Services', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
    function(err, response) {
        if (err)
            console.log("Failed to establish a connection to Mongo DB");
        else {
            console.log("Connection established to DB" + response);
        }
    });

// const connectDB = async() => {
//     try {
//         await mongoose.connect('mongodb://localhost:27017/Services', {
//             useNewUrlParser: true,
//             useCreateIndex: true,
//             useUnifiedTopology: true,
//             useFindAndModify: false
//         });
//         console.log("MongoDB Conected")
//     } catch (err) {
//         console.error(err.message);
//         process.exit(1);
//     }
// };

var app = express();
// app.use(favicon(path.join( 'src/assets/img/adappt-icon-green.png')));
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public/views');
app.engine('html', engines.mustache);
app.set('view engine', 'html');


var router = express.Router();
app.get('/', function(req, res) {
    res.render('index.html');
});

app.get("/test", function(req, res, next) {
    res.send("App is running successfully");
});

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS', 'PATCH', 'DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var Schema = mongoose.Schema;

var CustomerSchema = new Schema({
    name: { type: String },
    buildingName: { type: String },
    location: { type: String },
    saleType: { type: String },
    status: {
        type: Boolean,
        default: false
    }
}, { versionKey: false });

var model = mongoose.model('customers', CustomerSchema, 'customers');


app.get("/api/getCustomer", function(req, res) {
    console.log("hi", req)
    model.find({}),
        function(err, data) {
            if (err) {
                console.log(err)
                res.send();
            } else {
                res.send(data);
            }
        }
});

app.post("/api/UpdateService", function(req, res) {
    var mod = new model(req.body);
    model.findByIdAndUpdate(req.body.id, { status: req.body.status },
        function(err, data) {
            if (err) {
                res.send(err)
            } else {
                res.send({ data: "Updated Successfully" });
            }
        });
});


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);


    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(3000, function() {
    console.log("Server running on Port 3000!")
})
