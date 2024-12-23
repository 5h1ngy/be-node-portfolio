import { config } from "dotenv";
import path from "path";

/**
 * Loads the environment configuration file based on the current NODE_ENV.
 * Defaults to `.env.production` if NODE_ENV is not set.
 *
 * This script uses the `dotenv` package to load environment variables from the
 * specified .env file into `process.env`. It dynamically determines the file
 * path using the current working directory and the NODE_ENV value.
 *
 * @module LoadEnvironment
 *
 * @example
 * // In development mode (NODE_ENV=development):
 * // Loads `.env.development`
 *
 * @example
 * // In production mode (NODE_ENV=production or undefined):
 * // Loads `.env.production`
 */

// Determine the environment file name based on the current NODE_ENV.
const envFile = `.env.${process.env.NODE_ENV || "production"}`;

/**
 * Loads the environment variables from the resolved .env file.
 */
config({ path: path.resolve(process.cwd(), envFile) });

/**
 * Logs a message indicating the environment file that has been loaded.
 */
console.log(`Environment loaded: ${envFile}`);
