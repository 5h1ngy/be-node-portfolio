import { Service } from "typedi";
import { RepoDto } from "@/dtos/RepoDto";
import { SimpleResultsDto } from "@/dtos/ResultDto";
import axios, { AxiosHeaders, RawAxiosRequestHeaders } from "axios";
import { logError, logInfo } from "@/shared/logger";

/**
 * @class GithubService
 * 
 * Service for interacting with the GitHub API to fetch repository data.
 * This class handles API requests, processes responses, and formats data into DTOs.
 */
@Service()
export class GithubService {
  /**
   * Headers used for GitHub API requests.
   * Includes API versioning, content type, and authorization token.
   * @private
   * @type {(RawAxiosRequestHeaders & Record<string, any>) | AxiosHeaders}
   */
  private _headers: (RawAxiosRequestHeaders & Record<string, any>) | AxiosHeaders = {};

  /**
   * GitHub username whose repositories will be fetched.
   * @private
   * @type {string}
   */
  private _user: string;

  /**
   * Initializes the service with necessary headers and username from environment variables.
   */
  constructor() {
    this._headers["X-GitHub-Api-Version"] = "2022-11-28";
    this._headers["Accept"] = "application/vnd.github+json";
    this._headers["Authorization"] = `Bearer ${process.env.GITHUB_BEARER}`;
    this._user = process.env.GITHUB_USER!;
  }

  /**
   * Fetches all repositories for the configured GitHub user.
   * This method retrieves repository data, including the README and logo (if available),
   * and formats it into DTOs for further processing.
   * 
   * @returns {Promise<SimpleResultsDto<RepoDto[]>>} A promise resolving to a DTO containing an array of repositories.
   * @example
   * const results = await githubService.getAll();
   * console.log(results.data); // Array of RepoDto
   */
  async getAll(): Promise<SimpleResultsDto<RepoDto[]>> {
    const repos: RepoDto[] = [];

    try {
      logInfo("Fetching all repositories from GitHub API");

      // Fetch repositories from the GitHub API
      const { data } = await axios.get(
        `https://api.github.com/users/${this._user}/repos`,
        { headers: this._headers }
      );

      logInfo(`Successfully fetched ${data.length} repositories`);

      for (const repo of data) {
        let readmeData = undefined;
        let logoData = undefined;

        try {
          if (repo.description === null) throw new Error("Repository description is missing");

          logInfo(`Fetching README for repository: ${repo.name}`);

          const { data } = await axios.get(
            `https://api.github.com/repos/${this._user}/${repo.name}/readme`,
            { headers: this._headers }
          );

          readmeData = data;

        } catch (error: any) {
          logError(`Error processing README repository ${repo.name}: ${JSON.stringify(error)}`);
        }

        try {
          if (repo.description === null) throw new Error("Repository description is missing");

          logInfo(`Fetching logo for repository: ${repo.name}`);

          // Fetch logo data
          const { data } = await axios.get(
            `https://api.github.com/repos/${this._user}/${repo.name}/contents/assets/logo.png`,
            { headers: this._headers }
          );

          logoData = data;
        } catch (error: any) {
          logError(`Error processing logo repository ${repo.name}: ${JSON.stringify(error)}`);
        }

        repos.push(
          new RepoDto(
            repo.id,
            repo.created_at,
            repo.updated_at,
            repo.git_url,
            repo.name,
            repo.topics,
            repo.description,
            logoData?.content ? "data:image/png;base64," + logoData.content : logoData,
            readmeData?.content ? readmeData.content : readmeData
          )
        );

        logInfo(`Successfully processed repository: ${repo.name}`);
      }

      return new SimpleResultsDto<RepoDto[]>(repos);
    } catch (error: unknown) {
      logError(`Failed to fetch repositories: ${(error as Error).message}`);
      return new SimpleResultsDto<RepoDto[]>([]);
    }
  }
}
