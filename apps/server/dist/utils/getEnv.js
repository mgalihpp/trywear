"use strict";
/**
 * Retrieves the value of an environment variable by its key.
 *
 * @param key - The name of the environment variable to retrieve.
 * @param defaultValue - The default value to return if the environment variable is not set.
 *                        Defaults to an empty string.
 * @returns The value of the environment variable if it is set, or the default value if provided.
 * @throws Will throw an error if the environment variable is not set and no default value is provided.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnv = getEnv;
function getEnv(key, defaultValue = "") {
    const value = process.env[key];
    if (value === undefined) {
        if (defaultValue) {
            return defaultValue;
        }
        throw new Error(`Missing environment variable: ${key}\n\nPlease set the environment variable in your .env file or your deployment environment.\n\nIf you're in a development environment, you can create a .env file in the root of your project and add the required variables there.\n\n`);
    }
    return value;
}
