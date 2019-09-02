var debug = require("debug");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var passport = require("passport");
var session = require("express-session");
var SteamStrategy = require("passport-steam").Strategy;

var routes = require("./routes/index");
var users = require("./routes/users");

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new SteamStrategy({
        returnURL: "http://localhost:8080/login/return",
        realm: "http://localhost:8080/",
        apiKey: "7BABB0D2D8C00AE40D6D4201CAB5D14F"
    },
    function (identifier, profile, done) {
        process.nextTick(function () {
            profile.identifier = identifier;
            return done(null, profile);
        });
    }
));

var app = express();
app.disable('x-powered-by');
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.engine("html", require("ejs").renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());

app.use(session({
    secret: "swekkiesessie123",
    name: "swekkiesessie",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/", routes);
app.use("/users", users);

app.use(function (req, res, next) {
    var err = new Error("Not Found");
    res.status(404).render(__dirname + "/views/error", { message: err.message, error: err });
});

if (app.get("env") === "development") {
    app.use(function (err, res) {
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, res) {
    res.status(err.status || 500);
    res.render("error", {
        message: err.message,
        error: {}
    });
});

app.set("port", process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug("Express server listening on port " + server.address().port);
});

