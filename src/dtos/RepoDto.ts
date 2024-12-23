import { IsString, IsNumber, IsArray, IsOptional } from "class-validator";

/**
 * DTO for representing repository details.
 * 
 * This class is used to validate and transform data related to repositories.
 * It includes information such as repository ID, creation and update timestamps,
 * URL, title, topics, and optional fields like description, thumbnail, and readme content.
 */
export class RepoDto {
  /**
   * Unique identifier of the repository.
   * @example 12345
   */
  @IsNumber()
  _id!: number;

  /**
   * ISO 8601 timestamp indicating when the repository was created.
   * @example "2023-01-01T12:00:00Z"
   */
  @IsString()
  created!: string;

  /**
   * ISO 8601 timestamp indicating when the repository was last updated.
   * @example "2023-06-01T12:00:00Z"
   */
  @IsString()
  updated!: string;

  /**
   * Git URL of the repository.
   * @example "https://github.com/user/repo.git"
   */
  @IsString()
  url!: string;

  /**
   * Name of the repository.
   * @example "my-repo"
   */
  @IsString()
  title!: string;

  /**
   * List of topics associated with the repository.
   * Each topic is a string.
   * @example ["typescript", "validation", "dto"]
   */
  @IsArray()
  @IsString({ each: true })
  topics!: string[];

  /**
   * Optional description of the repository.
   * @example "This repository contains example DTOs for TypeScript."
   */
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Optional URL or path to the repository thumbnail.
   * @example "https://example.com/thumbnail.png"
   */
  @IsOptional()
  @IsString()
  thumbnail?: string;

  /**
   * Optional README content of the repository.
   * @example "# My Repo\nThis is the README content."
   */
  @IsOptional()
  @IsString()
  readme?: string;

  /**
   * Constructor to initialize the RepoDto.
   * @param _id - Unique identifier of the repository.
   * @param created - Creation timestamp in ISO 8601 format.
   * @param updated - Update timestamp in ISO 8601 format.
   * @param url - Git URL of the repository.
   * @param title - Name of the repository.
   * @param topics - Array of topics associated with the repository.
   * @param description - (Optional) Description of the repository.
   * @param thumbnail - (Optional) Thumbnail URL or path.
   * @param readme - (Optional) README content of the repository.
   */
  constructor(
    _id: number,
    created: string,
    updated: string,
    url: string,
    title: string,
    topics: string[],
    description?: string,
    thumbnail?: string,
    readme?: string
  ) {
    this._id = _id;
    this.created = created;
    this.updated = updated;
    this.url = url;
    this.title = title;
    this.topics = topics;
    this.description = description;
    this.thumbnail = thumbnail;
    this.readme = readme;
  }
}
