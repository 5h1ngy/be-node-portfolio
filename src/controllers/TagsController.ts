import { JsonController, Get, QueryParam, Param } from "routing-controllers";
import { Inject, Service } from "typedi";

import { logInfo } from "@/shared/logger";
import { TagDetailsService } from "@/services/TagDetailsService";

import { TagDetailsDto } from "@/dtos/TagDetailsDto";
import { AnimeDto } from "@/dtos/AnimeDto";
import { PaginatedResultDto } from "@/dtos/ResultDto";

/**
 * Controller for managing tag details.
 */
@Service()
@JsonController("/tag")
export class TagController {
  constructor(
    @Inject()
    private tagDetailsService: TagDetailsService
  ) { }

  /**
   * Fetches all tags.
   * 
   * @param offset The pagination offset.
   * @param size The pagination size.
   * @returns A list of tag details.
   */
  @Get("/")
  async getAll(
    @QueryParam("offset", { required: false }) offset: number = 1,
    @QueryParam("size", { required: false }) size: number = 10
  ): Promise<PaginatedResultDto<TagDetailsDto>> {
    logInfo(`Fetching all tag details - Offset: ${offset}, Size: ${size}`);
    return await this.tagDetailsService.getAll(offset, size);
  }

  /**
   * Searches tags by label and returns paginated anime details.
   * 
   * @param label The label to search for.
   * @param offset The pagination offset.
   * @param size The pagination size.
   * @returns Paginated anime details associated with the tag.
   */
  @Get("/search/:label")
  async searchByLabel(
    @Param("label") label: string,
    @QueryParam("offset", { required: false }) offset: number = 1,
    @QueryParam("size", { required: false }) size: number = 10
  ): Promise<PaginatedResultDto<AnimeDto>> {
    logInfo(`Searching anime by tag label - Label: "${label}"`);
    return await this.tagDetailsService.searchByLabel(label, offset, size);
  }
}
