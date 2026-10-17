export class History {
  #entries = [];
  #limit;

  constructor(limit = 20) {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new RangeError('History limit must be a positive integer.');
    }
    this.#limit = limit;
  }

  add(expression, result) {
    this.#entries.push({ expression, result });
    if (this.#entries.length > this.#limit) this.#entries.shift();
  }

  list() {
    // Return a detached snapshot so callers cannot modify stored entries.
    return this.#entries.map((entry) => ({ ...entry }));
  }

  clear() {
    this.#entries = [];
  }
}
