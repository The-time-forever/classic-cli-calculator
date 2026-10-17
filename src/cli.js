import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import { pathToFileURL } from 'node:url';
import { calculate, formatResult } from './calculator.js';
import { CalculatorError } from './errors.js';
import { History } from './history.js';

export const HELP_TEXT = [
  'Classic command-line calculator',
  'Supports: addition, subtraction, multiplication, division, parentheses, decimals, and unary signs.',
  'Commands: help, history, clear, quit.',
  'Rules: multiplication and division precede addition and subtraction; operators of equal precedence are evaluated left to right.',
].join('\n');

export async function runCalculator({ input = stdin, output = stdout } = {}) {
  const rl = createInterface({ input, output, terminal: true });
  const history = new History();

  try {
    for await (const line of rl) {
      const command = line.trim().toLowerCase();
      if (!command) continue;
      if (command === 'quit' || command === 'exit') {
        output.write('Goodbye!\n');
        break;
      }
      if (command === 'help') {
        output.write(HELP_TEXT + '\n');
        continue;
      }
      if (command === 'clear') {
        history.clear();
        output.write('History cleared.\n');
        continue;
      }
      if (command === 'history') {
        const entries = history.list();
        output.write(entries.length
          ? `${entries.map((entry, index) => `${index + 1}. ${entry.expression} = ${entry.result}`).join('\n')}\n`
          : 'No history yet.\n');
        continue;
      }

      try {
        const result = calculate(line);
        const display = formatResult(result);
        history.add(line.trim(), display);
        output.write(`${display}\n`);
      } catch (error) {
        if (!(error instanceof CalculatorError)) throw error;
        output.write(`Error: ${error.message}\n`);
      }
    }
  } finally {
    rl.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCalculator().catch((error) => {
    console.error(`Program error: ${error.message}`);
    process.exitCode = 1;
  });
}
