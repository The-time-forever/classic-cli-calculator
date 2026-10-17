import { CalculatorError, DivisionByZeroError } from './errors.js';

export function evaluate(ast) {
  let result;

  switch (ast?.type) {
    case 'number':
      result = ast.value;
      break;
    case 'unary': {
      const value = evaluate(ast.operand);
      result = ast.operator === '-' ? -value : value;
      break;
    }
    case 'binary': {
      const a = evaluate(ast.left)
      const b = evaluate(ast.right)
      switch (ast.operator) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/':
          if (b === 0) throw new DivisionByZeroError();
          result = a / b;
          break;
        default: throw new CalculatorError(`Unsupported operator: ${ast.operator}`);
      }
      break;
    }
    default:
      throw new CalculatorError('Cannot evaluate an invalid expression.');
  }

  if(!Number.isFinite(result)) throw new CalculatorError('Result is outside the supported range.')
  return result;
}
