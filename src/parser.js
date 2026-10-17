import { ParseError } from './errors.js';

/** Standard precedence keeps multiplication ahead of addition. */
export function parse(tokens) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new ParseError('Expression cannot be empty.');
  }

  let position = 0;

  function current() {
    return tokens[position];
  }

  function consume(value) {
    if (current()?.value === value) {
      position += 1;
      return true;
    }
    return false;
  }

  function parseExpression() {
    let node = parseTerm();
    while (consume('+') || consume('-')) {
      const operator = tokens[position - 1].value;
      node = { type: 'binary', operator, left: node, right: parseTerm() };
    }
    return node;
  }

  function parseTerm() {
    let node = parseUnary();
    while (consume('*') || consume('/')) {
      const operator = tokens[position - 1].value;
      node = { type: 'binary', operator, left: node, right: parseUnary() };
    }
    return node;
  }

  function parseUnary() {
    if (consume('+')) return { type: 'unary', operator: '+', operand: parseUnary() };
    if (consume('-')) return { type: 'unary', operator: '-', operand: parseUnary() };
    return parsePrimary();
  }

  function parsePrimary() {
    const token = current();
    if (!token) throw new ParseError('Incomplete expression: expected a number.');

    if (token.type === 'number') {
      position += 1;
      return { type: 'number', value: token.value };
    }

    if (consume('(')) {
      const node = parseExpression();
      if (!consume(')')) throw new ParseError('Missing closing parenthesis.');
      return node;
    }

    throw new ParseError(`Expected a number or opening parenthesis, received "${token.value}".`);
  }

  const ast = parseExpression();
  if (position !== tokens.length) {
    throw new ParseError(`Unexpected token: "${current().value}".`);
  }
  return ast;
}
