var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var ParseServer = require("parse-server").ParseServer;
var ParseDashboard = require("parse-dashboard");
require("dotenv").config();

var port = process.env.PORT || 1388;

var indexRouter = require("./routes/index");

var app = express();

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public", { maxAge: 31557600000 }));

var api = new ParseServer({
  databaseURI: process.env.databaseURI,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.js",
  appId: process.env.appId,
  restAPIKey: process.env.restAPIKey,
  javascriptKey: process.env.javascriptKey,
  serverURL: `${process.env.serverUrl}/parse`,
  masterKey: process.env.masterKey
});

// make the Parse Server available at /parse
app.use("/parse", api);

var dashboard = new ParseDashboard(
  {
    apps: [
      {
        serverURL: `${process.env.serverUrl}/parse`,
        appId: process.env.appId,
        masterKey: process.env.masterKey,
        appName: process.env.appName
      }
    ],
    users: [
      {
        user: process.env.masterUsername,
        pass: process.env.masterPassword
      }
    ]
  },
  { allowInsecureHTTP: true }
);

// make the Parse Dashboard available at /dashboard

app.set("port", port);

app.use("/dashboard", dashboard);

var httpServer = require("http").createServer(app);
httpServer.listen(port);

module.exports = app;
