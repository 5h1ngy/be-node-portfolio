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

import { connect, disconnect } from "@/config/database";
import { errorHandler } from "@/middleware/errorHandler";
import { setupHttpLogging, logInfo, logError, logWarn } from "@/shared/logger";

import { AnimeController } from "@/controllers/AnimeController";
import { TagController } from "@/controllers/TagsController";
import { HealthController } from "@/controllers/HealthController";

/**
 * Main application class.
 * Initializes the Express server, controllers, and middleware.
 */
class App {
    private static instance: App;
    public app: express.Application;

    private constructor() {
        this.app = express();
        this.config();
        this.setupControllers();
        this.setupSwagger();
        this.setupErrorHandling();
        this.connectDatabase();
        this.handleProcessEvents();
    }

    /**
     * Retrieves the singleton instance of the application.
     */
    public static getInstance(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    /**
     * Configures middlewares such as Helmet, CORS, and HTTP logging.
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
     * Sets up the application controllers with routing-controllers.
     */
    private setupControllers(): void {
        useExpressServer(this.app, {
            controllers: [
                AnimeController,
                TagController,
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
     * Configures Swagger documentation for the API.
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
     * Sets up global error handling middleware.
     */
    private setupErrorHandling(): void {
        this.app.use(errorHandler);
    }

    /**
     * Establishes the database connection.
     */
    private connectDatabase(): void {
        connect()
            .then(() => {
                const PORT = process.env.SERVER_PORT || 3000;
                this.app.listen(PORT, () => logInfo(`Server running on http://localhost:${PORT}`));
            })
            .catch((err) => logError(err));
    }

    /**
     * Handles process events for graceful shutdown.
     */
    private handleProcessEvents(): void {
        process.on("SIGINT", async () => {
            await disconnect();
            logWarn("Server shutting down...");
            process.exit(0);
        });
    }
}

// Start the application
App.getInstance();
