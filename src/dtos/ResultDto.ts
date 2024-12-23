import { IsArray, IsNumber, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";

/**
 * DTO for representing simple result sets.
 */
export class SimpleResultDto<T> {
  @Type(() => Object) // Replace Object with the specific DTO class when used
  occurrence!: T;

  constructor(occurrence: T) {
    this.occurrence = occurrence;
  }
}

/**
 * DTO for representing simple result sets.
 */
export class SimpleResultsDto<T> {
  @Type(() => Object) // Replace Object with the specific DTO class when used
  occurrences!: T;

  constructor(occurrences: T) {
    this.occurrences = occurrences;
  }
}

/**
 * DTO for representing paginated result sets.
 */
export class PaginatedResultDto<T> {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object) // Replace Object with the specific DTO class when used
  occurrences!: T[];

  @IsNumber()
  total!: number;

  @IsNumber()
  page!: number;

  @IsNumber()
  limit!: number;

  @IsNumber()
  totalPages!: number;

  constructor(
    occurrences: T[],
    total: number,
    page: number,
    limit: number,
    totalPages: number
  ) {
    this.occurrences = occurrences;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages;
  }
}
