const clear = require("clear");
const chalk = require("chalk");
const figlet = require("figlet");

const PluralSightService = require("./services/pluralsight-service");
const LoginScreen = require("./screens/login-screen");

const brandColor = chalk.rgb(235, 46, 102);
const logo = brandColor(figlet.textSync(APP_NAME));
