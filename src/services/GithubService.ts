import { Service } from "typedi";
import { RepoDto } from "@/dtos/RepoDto";
import { SimpleResultsDto } from "@/dtos/ResultDto";
import axios, { AxiosHeaders, RawAxiosRequestHeaders } from "axios";
import { logError, logInfo } from "@/shared/logger";
import Repos from "@/models/Repos";
import { DateTime } from "luxon";

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
    // Fetch data from the database
    const data = await Repos.findAll();

    // Verifica se `data` è vuoto o contiene elementi non aggiornati da un'ora
    const isStale = data.some((repo) => {
      const updatedDate = DateTime.fromISO(repo.updatedAt); // Parso la data ISO con Luxon
      const oneHourAgo = DateTime.now().minus({ hours: 1 }); // Data di un'ora fa
      return updatedDate < oneHourAgo; // Confronto tra DateTime
    });

    if (data.length === 0 || isStale) {
      logInfo("Data is empty or stale. Fetching fresh data from GitHub API...");

      const repos: RepoDto[] = [];

      try {
        // Fetch repositories from the GitHub API
        const { data: apiData } = await axios.get(
          `https://api.github.com/users/${this._user}/repos`,
          { headers: this._headers }
        );

        logInfo(`Successfully fetched ${apiData.length} repositories`);

        for (const repo of apiData) {
          let readmeData = undefined;
          let logoData = undefined;
          let linksData = undefined;

          try {
            // Fetch README
            logInfo(`Fetching README for repository: ${repo.name}`);
            const { data: readme } = await axios.get(
              `https://api.github.com/repos/${this._user}/${repo.name}/readme`,
              { headers: this._headers }
            );
            readmeData = readme.content;
          } catch (error) {
            logError(`Error fetching README for ${repo.name}: ${error}`);
          }

          try {
            // Fetch logo
            logInfo(`Fetching logo for repository: ${repo.name}`);
            const { data: logo } = await axios.get(
              `https://api.github.com/repos/${this._user}/${repo.name}/contents/assets/logo.png`,
              { headers: this._headers }
            );
            logoData = logo.content;
          } catch (error) {
            logError(`Error fetching logo for ${repo.name}: ${error}`);
          }

          try {
            // Fetch links
            logInfo(`Fetching links for repository: ${repo.name}`);
            const { data: links } = await axios.get(
              `https://api.github.com/repos/${this._user}/${repo.name}/contents/assets/links.json`,
              { headers: this._headers }
            );
            linksData = links.content;
          } catch (error) {
            logError(`Error fetching links for ${repo.name}: ${error}`);
          }

          const repoDto = new RepoDto(
            repo.id,
            repo.created_at,
            repo.updated_at,
            repo.html_url,
            repo.name,
            repo.topics,
            repo.description,
            logoData ? `data:image/png;base64,${logoData}` : undefined,
            readmeData || undefined,
            linksData || undefined
          );

          repos.push(repoDto);

          // Verifica se esiste un repository con lo stesso githubId
          const existingRepo = await Repos.findOne({ where: { githubId: repoDto._id } });

          if (existingRepo) {
            existingRepo.topics = repoDto.topics; // Imposta i topics usando il setter
            existingRepo.created = repoDto.created;
            existingRepo.updated = repoDto.updated;
            existingRepo.url = repoDto.url;
            existingRepo.title = repoDto.title;
            existingRepo.description = repoDto.description || undefined;
            existingRepo.thumbnail = repoDto.thumbnail || undefined;
            existingRepo.readme = repoDto.readme || undefined;
            existingRepo.links = repoDto.links || undefined;

            // Salva l'istanza per applicare i cambiamenti
            await existingRepo.save();
            logInfo(`Updated repository: ${repoDto.title}`);
          } else {
            const newRepo = Repos.build();
            newRepo.githubId = repoDto._id;
            newRepo.topics = repoDto.topics; // Imposta i topics usando il setter
            newRepo.created = repoDto.created;
            newRepo.updated = repoDto.updated;
            newRepo.url = repoDto.url;
            newRepo.title = repoDto.title;
            newRepo.description = repoDto.description || undefined;
            newRepo.thumbnail = repoDto.thumbnail || undefined;
            newRepo.readme = repoDto.readme || undefined;
            newRepo.links = repoDto.links || undefined;

            // Salva il nuovo record
            await newRepo.save();
            logInfo(`Created new repository: ${repoDto.title}`);
          }
        }

        logInfo("Successfully processed all repositories");
        return new SimpleResultsDto<RepoDto[]>(repos);
      } catch (error) {
        logError(`Failed to fetch repositories: ${JSON.stringify(error as Error)}`);
        return new SimpleResultsDto<RepoDto[]>([]);
      }
    } else {
      logInfo("Data is fresh. Returning cached data.");
      // Restituisci i dati dalla cache del database
      return new SimpleResultsDto<RepoDto[]>(
        data.map((repo) => new RepoDto(
          repo.githubId,
          repo.created,
          repo.updated,
          repo.url,
          repo.title,
          repo.topics,
          repo.description,
          repo.thumbnail,
          repo.readme,
          repo.links
        ))
      );
    }
  }

}
