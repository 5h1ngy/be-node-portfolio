import winston from "winston";
import "winston-daily-rotate-file";
import morgan, { StreamOptions } from "morgan";
import path from "path";
import fs from "fs";
import { TransformableInfo } from "logform";

/**
 * @module Logger
 * 
 * Provides a comprehensive logging solution for the application, including
 * rotating file logs, console logging with colorization, and HTTP request logging.
 * It uses the `winston` library for logging and `morgan` for HTTP middleware integration.
 */

/**
 * Path to the log directory, determined by the current environment.
 * In development, logs are stored in `logs` under the project root.
 * In production, logs are stored in the current working directory.
 * 
 * @constant {string}
 */
const logDirectory = process.env.NODE_ENV === "development"
    ? path.resolve(__dirname, "..", "..", "logs")
    : path.resolve(process.cwd(), "logs");

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

/**
 * Configures daily rotating file logs using `winston-daily-rotate-file`.
 * Log files are archived daily, with a size limit of 20MB and retention for 14 days.
 */
const transport = new winston.transports.DailyRotateFile({
    filename: `${logDirectory}/%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
});

/**
 * Custom color mappings for log levels.
 */
winston.addColors({
    error: "bold red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    verbose: "cyan",
    debug: "blue",
    silly: "magenta",
});

/**
 * Custom log format for structured and readable log messages.
 * Includes timestamp, level, and message.
 * 
 * @param {TransformableInfo} info - The log information object.
 * @returns {string} The formatted log message.
 */
const logFormat = winston.format.printf((info: TransformableInfo) => {
    const { level, message, timestamp } = info;
    return `[${timestamp}] ${level}: ${message}`;
});

/**
 * Creates the main logger instance with console and file transports.
 * Configures exception and rejection handlers for uncaught errors and unhandled rejections.
 */
const logger = winston.createLogger({
    level: process.env.LOG_DEFAULT_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        process.env.NODE_ENV === "development"
            ? winston.format.colorize({ all: true })
            : winston.format.uncolorize(),
        logFormat
    ),
    transports: [
        transport,
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                logFormat
            ),
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: path.join(logDirectory, "exceptions.log") }),
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: path.join(logDirectory, "rejections.log") }),
    ],
});

/**
 * Stream object for integrating Morgan with Winston for HTTP logging.
 * 
 * @constant {StreamOptions}
 */
const stream: StreamOptions = {
    write: (message: string) => logger.http(message.trim()),
};

/**
 * Sets up HTTP request logging using Morgan.
 * 
 * @param {any} app - The Express application instance.
 */
export function setupHttpLogging(app: any): void {
    app.use(
        morgan("combined", {
            stream,
        })
    );
}

/**
 * Logs a generic message with a specified level.
 * 
 * @param {string} level - The log level (e.g., "info", "error").
 * @param {string} message - The log message.
 */
export function logMessage(level: string, message: string): void {
    logger.log({ level, message });
}

/**
 * Logs an error message.
 * 
 * @param {string} message - The error message.
 */
export function logError(message: string): void {
    logger.error(message);
}

/**
 * Logs a warning message.
 * 
 * @param {string} message - The warning message.
 */
export function logWarn(message: string): void {
    logger.warn(message);
}

/**
 * Logs an informational message.
 * 
 * @param {string} message - The informational message.
 */
export function logInfo(message: string): void {
    logger.info(message);
}

/**
 * Logs a verbose message.
 * 
 * @param {string} message - The verbose message.
 */
export function logVerbose(message: string): void {
    logger.verbose(message);
}

/**
 * Logs an HTTP request with detailed information.
 * 
 * @param {any} req - The HTTP request object.
 */
export function logHttpRequest(req: any): void {
    const { method, url, headers, body } = req;
    const logEntry = `HTTP Request - Method: ${method}, URL: ${url}, Headers: ${JSON.stringify(
        headers
    )}, Body: ${JSON.stringify(body)}`;
    logger.http(logEntry);
}

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack || "");
    process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    logger.error(`Unhandled Rejection: ${reason}`);
});
