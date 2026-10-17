import { TokenizeError } from './errors.js';

const OPERATORS = new Set(['+', '-', '*', '/', '(', ')']);

/** Convert an expression string into number and operator tokens. */
export function tokenize(expression) {
  if (typeof expression !== 'string' || expression.trim() === '') {
    throw new TokenizeError('Expression cannot be empty.');
  }

  const tokens = [];
  let index = 0;

  while (index < expression.length) {
    const character = expression[index];

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(character)) {
      const start = index;
      let decimalPoints = 0;

      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        if (expression[index] === '.') decimalPoints++;
        index += 1;
      }

      const raw = expression.slice(start, index);
      if (decimalPoints > 1 || raw === '.') {
        throw new TokenizeError(`Invalid number: ${raw}`);
      }

      // Preserve every fractional digit for later calculations.
      tokens.push({ type: 'number', value: Number(raw), raw });
      continue;
    }

    if (OPERATORS.has(character)) {
      tokens.push({ type: 'operator', value: character });
      index += 1;
      continue;
    }

    throw new TokenizeError(`Unexpected character: "${character}".`);
  }

  return tokens;
}
