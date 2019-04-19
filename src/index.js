const chalk = require("chalk");
const figlet = require("figlet");
const ConfigStore = require("configstore");
const pkgName = require("../package.json");
const LoginScreen = require("./screens/login");

// Create/Load configuration store.
const config = new ConfigStore(pkgName);

const 

// Print logo.
const brandColor = chalk.rgb(235, 46, 102);
const logo = brandColor(figlet.textSync(APP_NAME));
console.log(logo);

// Sign-in user if needed.

