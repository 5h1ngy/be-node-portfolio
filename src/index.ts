#!/usr/bin/env node
import https from "https";
import fs from "fs";
import path from "path";

import "./config/env";
import { Container } from "typedi";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { useExpressServer, getMetadataArgsStorage, useContainer } from "routing-controllers";
import swaggerUi from "swagger-ui-express";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { getFromContainer, MetadataStorage } from "class-validator";

import { errorHandler } from "@/middleware/errorHandler";
import { setupHttpLogging, logWarn, logInfo } from "@/shared/logger";

import { GithubController } from "@/controllers/GithubController";
import { HealthController } from "@/controllers/HealthController";

/**
 * @class App
 *
 * Main application class responsible for initializing and configuring the Express server.
 * This includes setting up middleware, controllers, Swagger documentation, and global error handling.
 */
class App {
    /**
     * Singleton instance of the application.
     * @private
     * @static
     * @type {App}
     */
    private static instance: App;

    /**
     * The Express application instance.
     * @public
     * @type {express.Application}
     */
    public app: express.Application;

    /**
     * Private constructor to enforce singleton pattern.
     * Configures the Express application, sets up controllers, middleware,
     * Swagger documentation, error handling, and event listeners.
     */
    private constructor() {
        this.app = express();
        this.config();
        this.setupControllers();
        this.setupSwagger();
        this.setupErrorHandling();
        this.run();
        this.handleProcessEvents();
    }

    /**
     * Retrieves the singleton instance of the application.
     * Ensures only one instance of the App class is created.
     * 
     * @returns {App} The singleton application instance.
     */
    public static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    /**
     * Configures middlewares such as Helmet for security, CORS for cross-origin requests,
     * and HTTP logging for request monitoring.
     * 
     * Helmet provides enhanced security headers, while CORS allows API access from specified origins.
     * JSON and URL-encoded body parsing are enabled for request payloads.
     * 
     * @private
     */
    private config(): void {
        useContainer(Container);
        this.app.use(
            helmet({
                contentSecurityPolicy: false,
                crossOriginOpenerPolicy: false,
                crossOriginEmbedderPolicy: false,
            })
        );
        this.app.use(
            cors({
                origin: "*",
                methods: ["GET"],
                optionsSuccessStatus: 200,
            })
        );
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        setupHttpLogging(this.app);
    }

    /**
     * Configures routing-controllers to initialize and bind application controllers.
     * Controllers are registered with routing-controllers to handle specific API routes.
     * Each controller encapsulates a set of related endpoints.
     * 
     * @private
     */
    private setupControllers(): void {
        useExpressServer(this.app, {
            controllers: [
                GithubController,
            ],
            defaultErrorHandler: false,
            routePrefix: "/api",
        });

        useExpressServer(this.app, {
            controllers: [HealthController],
            defaultErrorHandler: false,
        });
    }

    /**
     * Configures Swagger UI documentation for the API endpoints.
     * 
     * The OpenAPI specification is dynamically generated using metadata from
     * routing-controllers and class-validator.
     * Swagger documentation provides a user-friendly interface for exploring
     * and testing API endpoints.
     * 
     * @private
     */
    private setupSwagger(): void {
        const storage = getMetadataArgsStorage();
        const schemas = validationMetadatasToSchemas({
            classValidatorMetadataStorage: getFromContainer(MetadataStorage),
        });

        const spec = routingControllersToSpec(
            storage,
            {
                routePrefix: "/api",
            },
            {
                components: {
                    // Disable TS errors for OpenAPI
                    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
                    // @ts-ignore
                    schemas,
                },
                info: {
                    title: "Anime API",
                    version: "1.0.0",
                },
            }
        );

        this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));
    }

    /**
     * Sets up global error handling middleware to catch and process application errors.
     * 
     * This middleware ensures that any unhandled errors are logged and properly formatted
     * before being sent in the HTTP response. Custom error handling logic is defined in
     * the `errorHandler` module.
     * 
     * @private
     */
    private setupErrorHandling(): void {
        this.app.use(errorHandler);
    }

    /**
     * Starts the server, supporting both HTTP and HTTPS protocols based on environment configuration.
     * 
     * If HTTPS is enabled, certificates are loaded from the specified paths or default to
     * `certs/key.pem` and `certs/cert.pem` in the working directory.
     * Logs the server URL upon successful startup.
     * 
     * @private
     */
    private run(): void {
        const PORT = process.env.SERVER_PORT || 3000;
        const isHttps = process.env.HTTPS === "true";

        if (isHttps) {
            const keyPath = process.env.HTTPS_KEY_PATH || "certs/key.pem";
            const certPath = process.env.HTTPS_CERT_PATH || "certs/cert.pem";

            const privateKey = fs.readFileSync(path.resolve(process.cwd(), keyPath), "utf8");
            const certificate = fs.readFileSync(path.resolve(process.cwd(), certPath), "utf8");
            const credentials = { key: privateKey, cert: certificate };

            https.createServer(credentials, this.app).listen(PORT, () => {
                logInfo(`HTTPS server running on https://localhost:${PORT}`);
            });
        } else {
            this.app.listen(PORT, () => {
                logInfo(`HTTP server running on http://localhost:${PORT}`);
            });
        }
    }

    /**
     * Configures process event listeners for graceful application shutdown.
     * Logs a warning message before exiting to ensure proper cleanup of resources.
     * 
     * @private
     */
    private handleProcessEvents(): void {
        process.on("SIGINT", async () => {
            logWarn("Server shutting down...");
            process.exit(0);
        });
    }
}

// Start the application
App.getInstance();
