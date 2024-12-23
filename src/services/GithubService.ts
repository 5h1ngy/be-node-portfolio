import { Service } from "typedi";
import AnimeDetails from "@/models/AnimeDetails";
import { RepoDto } from "@/dtos/RepoDto";
// import { AnimeDetailsDto } from "@/dtos/AnimeDetailsDto";
import { SimpleResultDto, SimpleResultsDto } from "@/dtos/ResultDto";
import { Sequelize } from "sequelize";
import axios, { AxiosHeaders, RawAxiosRequestHeaders } from "axios";
import { logError, logWarn } from "@/shared/logger";


@Service()
export class GithubService {
  private _headers: (RawAxiosRequestHeaders & Record<string, any>) | AxiosHeaders = {}
  private _user: string

  constructor() {
    this._headers["X-GitHub-Api-Version"] = "2022-11-28";
    this._headers["Accept"] = "application/vnd.github+json";
    this._headers["Authorization"] = `Bearer ${process.env.GITHUB_BEARER}`;
    this._user = process.env.GITHUB_USER!;
  }

  async getAll(): Promise<SimpleResultsDto<RepoDto[]>> {
    const repos: RepoDto[] = [];

    try {

      const { data } = await axios.get(
        `https://api.github.com/users/${this._user}/repos`,
        { headers: this._headers }
      )

      for (const repo of data) {

        try {

          if (repo.description === null) throw new Error("missing description")

          const { data: readmeData } = await axios.get(
            `https://api.github.com/repos/${this._user}/${repo.name}/readme`,
            { headers: this._headers }
          )

          const { data: logoData } = await axios.get(
            `https://api.github.com/repos/${this._user}/${repo.name}/contents/assets/logo.png`,
            { headers: this._headers }
          )

          repos.push(new RepoDto(
            repo.id, repo.created_at, repo.updated_at,
            repo.git_url, repo.name, repo.topics, repo.description,
            "data:image/png;base64," + logoData.content, readmeData.content,
          ));

        } catch (error: any) {
          logError(JSON.stringify(error))
          // if (error.status! === 404) {

          //   repos.push(new RepoDto(
          //     repo.id, repo.created_at, repo.updated_at,
          //     repo.git_url, repo.name, repo.topics, repo.description,
          //     undefined, undefined,
          //   ));
          // }
        }
      }

      return new SimpleResultsDto<RepoDto[]>(repos);

    } catch (error: unknown) {
      logError(error as string)

      // In caso di errore, restituisci un valore vuoto o un'istanza di fallback
      return new SimpleResultsDto<RepoDto[]>([]);
    }

    // Costruisci la clausola WHERE in base al parametro type
    // const whereClause = type ? { type } : undefined;

    // // Trova righe e conteggio totale dal database
    // const { rows, count: total } = await AnimeDetails.findAndCountAll({
    //   where: whereClause, // Applica il filtro se specificato
    //   offset: (offset - 1) * size,
    //   limit: size,
    //   include: [
    //     { association: "asset", required: false },
    //   ],
    //   order: [
    //     ["year_start", "DESC NULLS LAST"],
    //     [
    //       Sequelize.literal(`
    //         CASE
    //           WHEN season = 'winter' THEN 1
    //           WHEN season = 'spring' THEN 2
    //           WHEN season = 'summer' THEN 3
    //           WHEN season = 'autumn' THEN 4
    //           ELSE 5
    //         END
    //     `),
    //       "DESC" // Ordina le stagioni in ordine specificato
    //     ],
    //   ],
    // });

    // // Mappa le righe in un array di DTO
    // const occurrences = rows.map((anime) => new AnimeDto(
    //   anime.id,
    //   anime.title || null,
    //   anime.type || null,
    //   anime.season || null,
    //   anime.year_start || null,
    //   anime.asset?.id
    //     ? { id: anime.asset.id, thumbnail: anime.asset.thumbnail }
    //     : null
    // ));

    // // Calcola il numero totale di pagine
    // const totalPages = Math.ceil(total / size);

    // Inizializza e restituisci un'istanza del DTO paginato
    // return new PaginatedResultDto<AnimeDto>(occurrences, total, offset, size, totalPages);
  }
}
