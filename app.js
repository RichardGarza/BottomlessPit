// Dependencies
const express = require("express");
const appConfig = require("./config/main-config.js");
const routeConfig = require("./config/routes-config");

// App Instantiation
const app = express();

// App Config
appConfig.init(app, express);

routeConfig.init(app);
