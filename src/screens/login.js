const prompts = require("prompts");
const {hostname} = require("os");
const {Spinner} = require("clui");

const MAX_LOGIN_TRIES = 3;

class ExceededMaxLoginAttemptsError extends Error {
    constructor() {
        super(`Exceeded allowed ${MAX_LOGIN_TRIES} login attempts.`);
    }
}

class LoginScreen {
    constructor({pluralSight}) {
        this._pluralSight = pluralSight;
    }

    async show() {    
        let tries = 0;
    
        while (true) {
            try {
                return await _attemptLogin();
            }
            
            catch (e) {
                // If exceeded allowed number of retries, fail.
                if (tries > MAX_LOGIN_TRIES) 
                {
                    console.error("Reached maximum number of failed attempts!");
                    throw new ExceededMaxLoginAttemptsError();
                }
    
                // If not yet exceeded, infrom failed attempt and retry.
                console.error("Login failed, please try again...");
            }
        }
    };

    async _attemptLogin() {
        // Prompt user for credentials.
        const credentials = await _promptCredentials();
    
        // Create & show login spinner.
        const spinner = new Spinner("Logging in...");    
        spinner.start();
    
        try {
            // Authenticate client.
            return this._pluralSight.authenticate(credentials);
        }
    
        finally {
            // Hide spinner before returning.
            spinner.stop();
        }
    };

    async _promptCredentials() {
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
}

module.exports = LoginScreen;