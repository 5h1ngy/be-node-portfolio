#!/usr/bin/env node

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
import { setupHttpLogging, logWarn } from "@/shared/logger";

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
     */
    private constructor() {
        this.app = express();
        this.config();
        this.setupControllers();
        this.setupSwagger();
        this.setupErrorHandling();
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
     * The OpenAPI specification is generated dynamically based on routing-controllers metadata
     * and class-validator schemas.
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
     * @private
     */
    private setupErrorHandling(): void {
        this.app.use(errorHandler);
    }

    /**
     * Configures process event listeners for graceful application shutdown.
     * Logs a warning message before exiting.
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
