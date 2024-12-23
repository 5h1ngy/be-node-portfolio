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