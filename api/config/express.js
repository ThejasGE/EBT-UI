var config = require("./config"),
    express = require("express"),
    bodyParser = require("body-parser"),
    jwt = require("jsonwebtoken"),
    cookieParser = require("cookie-parser"),
    session = require("express-session"),
    cors = require("cors"),
    mongoStore = require("connect-mongo")(session),
    request = require("request"),
    error_config = require("./error_codes"),
    db = require("./mongoose"),
    helmet = require('helmet');

module.exports = function() {
    var app = express();
    // app.use(helmet.noCache());
    // app.use(helmet())
    app.use(cors());
    /*   app.use(session({
            secret: 'mysecret',
            resave: false,
            saveUninitialized: false,
            store: new mongoStore({
                url: config.sessiondb,
                ttl: config.sessiontimeout

            })
        })); */

    app.use(cookieParser("SecretPassPhrase"));

    app.use(bodyParser.json({ limit: '50mb', extended: true }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    app.get("/test", function(req, res, next) {
        res.send("App is running successfully");
    });

    app.use((req, res, next) => {
        try {
            req.config = config;
            const header = req.headers.authorization;
            if (typeof header !== 'undefined') {
                req.authToken = header;
            }
            next();
        } catch (e) {
            res.status(500).send({ err: e.message })
        }
    });

    var io = require('socket.io')(app.listen(config.port));

    require("../app/routes/users.server.routes.js")(app);
    require("../app/routes/buildings.server.routes.js")(app);
    require("../app/routes/customers.server.routes.js")(app);
    require("../app/routes/floor.server.routes.js")(app);
    require("../app/routes/seats.server.routes.js")(app);
    require("../app/routes/section.server.routes.js")(app);
    require("../app/routes/pcsData.server.routes")(app);
    require("../app/routes/singJapan.server.routes")(app);
    require("../app/routes/deskData.server.routes")(app);
    require("../app/routes/dashboard.server.routes")(app);
    require("../app/routes/michineLearning.server.routes")(app);
    require("../app/routes/freshdesk.server.routes.js")(app);
    require("../app/routes/hosts.server.routes.js")(app);
    require('../app/routes/sockets.server.routes')(app, io);


    return app;
};