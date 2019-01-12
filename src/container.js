const {createContainer, asValue, asFunction, asClass} = require("awilix");
const PluralSightService = require("./services/pluralsight-service");
const CliController = require("./controllers/cli-controller");
const ConfigStore = require("configStore");

// Factory method for configuration store.
const makeConfigStore = ({appName}) => new ConfigStore(appName);

// Create IoC container for dependecy-injection.
const container = createContainer();

// Register all dependecies.
container.register({
    appName: asValue(process.env.NPM_PACKAGE_NAME).singleton(),
    config: asFunction(makeConfigStore).singleton(),
    pluralSight: asClass(PluralSightService),
    cliController: asClass(CliController).singleton(),
});

module.exports = container;