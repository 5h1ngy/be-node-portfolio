import { Service } from "typedi";
import AnimeDetails from "@/models/AnimeDetails";
import { AnimeDto } from "@/dtos/AnimeDto";
import { AnimeDetailsDto } from "@/dtos/AnimeDetailsDto";
import { SimpleResultDto, SimpleResultsDto, PaginatedResultDto } from "@/dtos/ResultDto";
import { Sequelize } from "sequelize";


/**
 * Service for managing anime details.
 */
@Service()
export class AnimeService {
  /**
   * Fetches all anime details with pagination and optional filtering by type.
   *
   * @param offset The page number (1-based).
   * @param size The number of items per page.
   * @param type Optional filter for the anime type.
   * @returns Paginated anime details.
   */
  async getAll(offset: number = 1, size: number = 10, type?: string): Promise<PaginatedResultDto<AnimeDto>> {
    // Costruisci la clausola WHERE in base al parametro type
    const whereClause = type ? { type } : undefined;

    // Trova righe e conteggio totale dal database
    const { rows, count: total } = await AnimeDetails.findAndCountAll({
      where: whereClause, // Applica il filtro se specificato
      offset: (offset - 1) * size,
      limit: size,
      include: [
        { association: "asset", required: false },
      ],
      order: [
        ["year_start", "DESC NULLS LAST"],
        [
          Sequelize.literal(`
            CASE
              WHEN season = 'winter' THEN 1
              WHEN season = 'spring' THEN 2
              WHEN season = 'summer' THEN 3
              WHEN season = 'autumn' THEN 4
              ELSE 5
            END
        `),
          "DESC" // Ordina le stagioni in ordine specificato
        ],
      ],
    });

    // Mappa le righe in un array di DTO
    const occurrences = rows.map((anime) => new AnimeDto(
      anime.id,
      anime.title || null,
      anime.type || null,
      anime.season || null,
      anime.year_start || null,
      anime.asset?.id
        ? { id: anime.asset.id, thumbnail: anime.asset.thumbnail }
        : null
    ));

    // Calcola il numero totale di pagine
    const totalPages = Math.ceil(total / size);

    // Inizializza e restituisci un'istanza del DTO paginato
    return new PaginatedResultDto<AnimeDto>(occurrences, total, offset, size, totalPages);
  }

  /**
 * Fetches all anime details with pagination.
 *
 * @param ids The ids array.
 * @param offset The page number (1-based).
 * @param size The number of items per page.
 * @returns Paginated anime details.
 */
  async getByIds(ids: Array<string>): Promise<SimpleResultsDto<AnimeDto[]>> {

    // Trova righe e conteggio totale dal database
    const { rows, count: total } = await AnimeDetails.findAndCountAll({
      where: {
        id: ids
      },
      include: [
        { association: "asset", required: false },
      ],
      order: [
        ["year_start", "DESC NULLS LAST"],
        [
          Sequelize.literal(`
                CASE
                    WHEN season = 'winter' THEN 1
                    WHEN season = 'spring' THEN 2
                    WHEN season = 'summer' THEN 3
                    WHEN season = 'autumn' THEN 4
                    ELSE 5
                END
            `),
          "DESC" // Ordina le stagioni in ordine specificato
        ],
      ],
    });

    // Mappa le righe in un array di DTO
    const occurrences = rows.map((anime) => new AnimeDto(
      anime.id,
      anime.title || null,
      anime.type || null,
      anime.season || null,
      anime.year_start || null,
      anime.asset?.id
        ? { id: anime.asset.id, thumbnail: anime.asset.thumbnail }
        : null
    ));

    // Inizializza e restituisci un'istanza del DTO paginato
    return new SimpleResultsDto<AnimeDto[]>(occurrences);
  }

  /**
   * Searches anime by title and returns paginated results.
   *
   * @param id The title to search for.
   * @returns Paginated anime details matching the title.
   */
  async getById(id: string): Promise<SimpleResultDto<null | AnimeDetailsDto>> {

    const anime = await AnimeDetails.findByPk(id, {
      include: [
        { association: "asset", required: false },
        { association: "tags", required: false },
        { association: "description", required: false },
      ],
    });

    const occurrence = !anime
      ? null
      : new AnimeDetailsDto(
        anime.id,
        anime.title || null,
        anime.type || null,
        anime.episodes || null,
        anime.season || null,
        anime.year_start || null,
        anime.year_end || null,
        anime.asset?.id ? { id: anime.asset.id, thumbnail: anime.asset.thumbnail } : null,
        anime.tags?.map((tag) => ({ id: tag.id, label: tag.label })) || null,
        anime.description?.raw || null
      )

    return new SimpleResultDto<null | AnimeDetailsDto>(occurrence);
  }

  /**
   * Fetches all unique anime types.
   *
   * @returns List of unique anime types.
   */
  async getAllTypes(): Promise<string[]> {
    // Esegui una query per ottenere tutti i tipi univoci
    const types: Array<{ type: string | null }> = await AnimeDetails.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("type")), "type"],
      ],
      raw: true,
    });

    // Estrarre i valori, filtrare i null e restituirli come array
    return types
      .map((t) => t.type) // Ottieni i valori del campo "type"
      .filter((t): t is string => t !== null); // Filtra i valori null e garantisci il tipo
  }
}
