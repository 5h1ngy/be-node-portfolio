import { Service } from "typedi";
import { Op } from "sequelize";
import TagDetails from "@/models/TagDetails";
import AnimeDetails from "@/models/AnimeDetails";
import { TagDetailsDto } from "@/dtos/TagDetailsDto";
import { AnimeDto } from "@/dtos/AnimeDto";
import { PaginatedResultDto } from "@/dtos/ResultDto";

/**
 * Service for managing tag details.
 */
@Service()
export class TagDetailsService {
  /**
   * Fetches all tag details in alphabetical order.
   *
   * @param offset The page number (1-based).
   * @param size The number of items per page.
   * @returns Paginated anime details.
   */
  async getAll(offset: number = 1, size: number = 10): Promise<PaginatedResultDto<TagDetailsDto>> {

    const { rows, count: total } = await TagDetails.findAndCountAll({
      offset: (offset - 1) * size,
      limit: size,
      order: [["label", "ASC"]],
    });

    const occurrences = rows.map((tag) => new TagDetailsDto(tag.id, tag.label || null));

    // Calcola il numero totale di pagine
    const totalPages = Math.ceil(total / size);

    return new PaginatedResultDto<TagDetailsDto>(occurrences, total, offset, size, totalPages);
  }

  /**
   * Searches tags by label and paginates associated anime details.
   *
   * @param label The label to search for.
   * @param offset The page number (1-based).
   * @param size The number of items per page.
   * @returns Paginated anime details associated with matching tags.
   */
  async searchByLabel(label: string, offset: number = 1, size: number = 10): Promise<PaginatedResultDto<AnimeDto>> {

    const tags = await TagDetails.findAll({
      where: { label: { [Op.like]: `%${label}%` } },
      include: [{ association: "animes", required: false }],
      order: [["label", "ASC"]],
    });

    const totalAnimes = tags.reduce((sum, tag) => sum + (tag.animes?.length || 0), 0);
    const animeOffset = (offset - 1) * size;

    const paginatedAnimes: AnimeDto[] = [];
    let animeCount = 0;

    for (const tag of tags) {
      for (const anime of tag.animes) {
        if (animeCount >= animeOffset && paginatedAnimes.length < size) {
          const details = await AnimeDetails.findByPk(anime.id, {
            include: [
              { association: "asset", required: false }
            ],
          });

          if (details) {
            paginatedAnimes.push(
              new AnimeDto(
                details.id,
                details.title || null,
                details.type || null,
                details.asset?.id
                  ? { id: details.asset.id, thumbnail: details.asset.thumbnail }
                  : null
              )
            );
          }
        }
        animeCount++;
        if (paginatedAnimes.length >= size) break;
      }
    }

    const totalPages = Math.ceil(totalAnimes / size);

    return new PaginatedResultDto<AnimeDto>(paginatedAnimes, totalAnimes, offset, size, totalPages);
  }
}
