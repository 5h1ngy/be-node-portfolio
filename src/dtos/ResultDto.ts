import { Type } from "class-transformer";

/**
 * @module DTOs
 * 
 * Provides data transfer objects (DTOs) for simple result representations.
 */

/**
 * @class SimpleResultDto
 * @template T
 * 
 * Represents a DTO for a single result occurrence.
 * This generic class is designed to encapsulate a single instance of type `T`,
 * allowing for flexible and reusable data structures.
 * 
 * @example
 * const result = new SimpleResultDto<UserDto>(user);
 * 
 * @property {T} occurrence - The single occurrence of the result, typed as `T`.
 */
export class SimpleResultDto<T> {
  /**
   * The single occurrence of the result.
   * Replace `Object` with the specific DTO class when instantiated.
   * 
   * @type {T}
   */
  @Type(() => Object) // Replace Object with the specific DTO class when used
  occurrence!: T;

  /**
   * Constructs a SimpleResultDto instance.
   * 
   * @param {T} occurrence - The single result occurrence.
   */
  constructor(occurrence: T) {
    this.occurrence = occurrence;
  }
}

/**
 * @class SimpleResultsDto
 * @template T
 * 
 * Represents a DTO for multiple result occurrences.
 * This generic class encapsulates an array or collection of results of type `T`,
 * facilitating the transfer of multiple instances in a standardized format.
 * 
 * @example
 * const results = new SimpleResultsDto<UserDto[]>(users);
 * 
 * @property {T} occurrences - The collection of results, typed as `T`.
 */
export class SimpleResultsDto<T> {
  /**
   * The collection of result occurrences.
   * Replace `Object` with the specific DTO class when instantiated.
   * 
   * @type {T}
   */
  @Type(() => Object) // Replace Object with the specific DTO class when used
  occurrences!: T;

  /**
   * Constructs a SimpleResultsDto instance.
   * 
   * @param {T} occurrences - The collection of result occurrences.
   */
  constructor(occurrences: T) {
    this.occurrences = occurrences;
  }
}
