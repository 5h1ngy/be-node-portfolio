import { JsonController, Get } from "routing-controllers";
import { Service } from "typedi";

/**
 * Controller for health check endpoints.
 */
@Service()
@JsonController("/health")
export class HealthController {
  /**
   * Health check endpoint.
   * 
   * @returns Status and timestamp.
   */
  @Get("/")
  check() {
    return { status: "OK", timestamp: new Date() };
  }
}
