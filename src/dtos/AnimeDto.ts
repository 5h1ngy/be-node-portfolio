import { IsString, IsUUID, ValidateNested, IsObject, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ImageDto } from './AnimeDetailsDto'

/**
 * DTO for representing anime details.
 */
export class AnimeDto {
  @IsUUID()
  id!: string;

  @IsString()
  title!: string | null;

  @IsString()
  type!: string | null;

  @IsString()
  season!: string | null;

  @IsNumber()
  year_start!: number | null;

  @ValidateNested()
  @IsObject()
  @Type(() => ImageDto)
  image!: ImageDto | null;

  constructor(
    id: string,
    title: string | null,
    type: string | null,
    season: string | null,
    year_start: number | null,
    image: ImageDto | null,
  ) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.season = season;
    this.year_start = year_start;
    this.image = image;
  }
}
