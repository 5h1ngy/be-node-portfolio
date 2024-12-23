import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsObject, IsNumber } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for representing image details.
 */
export class ImageDto {
  @IsUUID()
  id!: string | null;

  @IsString()
  @IsOptional()
  thumbnail!: string | null;
}

/**
 * DTO for representing tag details.
 */
export class TagDto {
  @IsUUID()
  id!: string | null;

  @IsString()
  @IsOptional()
  label!: string | null;
}

/**
 * DTO for representing anime details.
 */
export class AnimeDetailsDto {
  @IsUUID()
  id!: string;

  @IsString()
  title!: string | null;

  @IsString()
  type!: string | null;

  @IsNumber()
  episodes!: number | null;

  @IsString()
  season!: string | null;

  @IsNumber()
  year_start!: number | null;

  @IsNumber()
  year_end!: number | null;

  @ValidateNested()
  @IsObject()
  @Type(() => ImageDto)
  image!: ImageDto | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags!: Array<TagDto> | null;

  @IsString()
  description!: string | null;

  constructor(
    id: string,
    title: string | null,
    type: string | null,
    episodes: number | null,
    season: string | null,
    year_start: number | null,
    year_end: number | null,
    image: ImageDto | null,
    tags: Array<TagDto> | null,
    description: string | null
  ) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.episodes = episodes;
    this.season = season;
    this.year_start = year_start;
    this.year_end = year_end;
    this.image = image;
    this.tags = tags;
    this.description = description;
  }
}
