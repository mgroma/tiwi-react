/* global __dirname */
/* eslint-disable import/no-extraneous-dependencies */

// Support storing environment variables in a file named "testenv"
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Read environment variables from "testenv". Override environment vars if they are already set.
const TESTENV = path.resolve(__dirname, '.', 'testenv');
if (fs.existsSync(TESTENV)) {
    const envConfig = dotenv.parse(fs.readFileSync(TESTENV));
    Object.keys(envConfig).forEach((k) => {
        process.env[k] = envConfig[k];
    });
}
process.env.CLIENT_ID = process.env.CLIENT_ID || process.env.SPA_CLIENT_ID;
process.env.OKTA_TESTING_DISABLEHTTPSCHECK = process.env.OKTA_TESTING_DISABLEHTTPSCHECK || false;

const webpack = require('webpack');

const env = {};

// List of environment variables made available to the app
[
    'API_HOSTNAME',
    'REDIRECT_URI',
    'ISSUER',
    'CLIENT_ID',
    'OKTA_TESTING_DISABLEHTTPSCHECK',
].forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Environment variable ${key} must be set. See README.md`);
    }
    env[key] = JSON.stringify(process.env[key]);
});

module.exports = {
    /* eslint-disable no-param-reassign */
    webpack: (config) => {
        // Remove the 'ModuleScopePlugin' which keeps us from requiring outside the src/ dir
        config.resolve.plugins = [];

        // Optimize for development
        config.optimization = {
            ...config.optimization,
            removeAvailableModules: false,
            removeEmptyChunks: false,
            splitChunks: false,
        };

        // Use faster source maps in development
        config.devtool = 'eval-source-map';

        // Define global vars from env vars
        config.plugins = config.plugins.concat([
            new webpack.DefinePlugin({
                'process.env': env,
            }),
        ]);

        return config;
    },
    devServer: function(configFunction) {
        // Return the replacement function for create-react-app to use to generate the Webpack
        // Development Server config. "configFunction" is the function that would normally have
        // been used to generate the Webpack Development server config - you can use it to create
        // a starting configuration to then modify instead of having to create a config from scratch.
        return function(proxy, allowedHost) {
            // Create the default config by calling configFunction with the proxy/allowedHost parameters
            const config = configFunction(proxy, allowedHost);

            // Optimize dev server
            config.watchOptions = {
                ignored: /node_modules/,
                aggregateTimeout: 300,
                poll: 1000,
            };

            // Enable hot module replacement
            config.hot = true;

            // Change the https certificate options
            if (process.env.REACT_HTTPS_KEY && process.env.REACT_HTTPS_CERT) {
                config.https = {
                    key: fs.readFileSync(process.env.REACT_HTTPS_KEY, 'utf8'),
                    cert: fs.readFileSync(process.env.REACT_HTTPS_CERT, 'utf8'),
                };
            }

            // Return your customised Webpack Development Server config.
            return config;
        };
    }
};
