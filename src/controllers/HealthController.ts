import { JsonController, Get } from "routing-controllers";
import { Service } from "typedi";

/**
 * @module HealthController
 * 
 * Provides a set of endpoints for monitoring the application's health status.
 * This controller is designed to be lightweight and efficient, allowing external
 * systems to perform quick health checks.
 */
@Service()
@JsonController("/health")
export class HealthController {

  /**
   * GET /health/
   * 
   * @summary Health check endpoint
   * @description This endpoint is used to verify that the application is running
   * and responding as expected. It returns a JSON object containing a status
   * message and a timestamp indicating the server's current time.
   * 
   * @returns {object} An object containing the health status and current timestamp.
   * @example
   * {
   *   "status": "OK",
   *   "timestamp": "2024-12-23T12:34:56.789Z"
   * }
   */
  @Get("/")
  check() {
    return { 
      status: "OK", 
      timestamp: new Date() 
    };
  }
}
