const prompts = require("prompts");
const {hostname} = require("os");
const {Spinner} = require("clui");

class ExceededMaxLoginAttemptsError {}

_promptCredentials = async () => {
    // Request credentials login.
    console.log(chalk.bold("Please log-in to PluralSight:"));

    // Get user credentials.
    const credentials = await prompts([
        {
            type: "text", 
            name: "username",
            message: "Username",
            validate: fieldRequired
        },
        {
            type: "password",
            name: "password",
            message: "Password",
            validate: fieldRequired
        },
        {
            type: "text",
            name: "deviceName",
            message: "Device name",
            initial: hostname()
        },
        {
            type: "toggle",
            name: "stayLoggedIn",
            message: "Stay logged in?",
            initial: true,
            active: 'yes',
            inactive: 'no'
        }
    ]);

    // Return log-in credentials.
    return credentials;
};

const _attemptLogin = async () => {
    // Prompt user for credentials.
    const credentials = await promptCredentials();

    // Create & show login spinner.
    const spinner = new Spinner("Logging in...");    
    spinner.start();

    try {
        // Authenticate client.
        return ps.authenticate(credentials);
    }

    finally {
        // Hide spinner before returning.
        spinner.stop();
    }
};

const show = async () => {    
    

    let tries = 0;

    while (true) {
        try {
            return await _attemptLogin();
        }
        
        // TODO: distinguish error types.
        catch (e) {
            if (tries > MAX_LOGIN_TRIES)
                break; // TODO: handle error.

            const {retry} = prompts({
                type: "confirm",
                name: "retry",
                message: chalk.red("Log-in failed... retry?"),
                initial: true
            });

            // TODO: handle cancellation.
        }
    }
};

module.exports = {show};