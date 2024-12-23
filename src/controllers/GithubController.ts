import { JsonController, Get } from "routing-controllers";
import { Inject, Service } from "typedi";
import { logInfo } from "@/shared/logger";
import { GithubService } from "@/services/GithubService";
import { RepoDto } from "@/dtos/RepoDto";
import { SimpleResultsDto } from "@/dtos/ResultDto";

/**
 * @module GithubController
 *
 * Controller for handling GitHub-related operations.
 * This controller provides endpoints for interacting with repositories and
 * other GitHub data, leveraging the GithubService for data fetching and processing.
 */
@Service()
@JsonController("/github")
export class GithubController {

  /**
   * Creates an instance of GithubController.
   *
   * @param {GithubService} githubService - The service used to interact with GitHub data.
   */
  constructor(@Inject() private githubService: GithubService) {

  }

  /**
   * GET /github/repos
   *
   * @summary Fetch all repositories
   * @description Fetches a list of all repositories from the GitHub account configured
   * in the application. The data is processed and returned as an array of repository DTOs.
   *
   * @returns {Promise<SimpleResultsDto<RepoDto[]>>} A promise that resolves to a DTO containing the list of repositories.
   * @throws {Error} Throws an error if the fetch operation fails.
   * @example
   * {
   *   "success": true,
   *   "data": [
   *     {
   *       "id": 1,
   *       "name": "example-repo",
   *       "url": "https://github.com/user/example-repo"
   *     }
   *   ]
   * }
   */
  @Get("/repos")
  async getRepositories(): Promise<SimpleResultsDto<RepoDto[]>> {
    logInfo(`Fetching all repos`);
    return await this.githubService.getAll();
  }
}
