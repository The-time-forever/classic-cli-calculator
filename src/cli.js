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
  const terminal = Boolean(input.isTTY && output.isTTY);
  const rl = createInterface({ input, output, terminal });
  const history = new History();
  const lines = rl[Symbol.asyncIterator]();

  try {
    while (true) {
      // The prompt belongs before the input is read.
      output.write('calc> ');
      const { value: line, done } = await lines.next();
      if (done) break;
      // Readline only echoes typed input in terminal mode; mirror it otherwise
      // so a piped transcript still shows what was entered.
      if (!terminal) output.write(`${line}\n`);
      const command = line.trim().toLowerCase();
      if (command === 'quit' || command === 'exit') {
        output.write('Goodbye!\n');
        break;
      }
      if (command === 'help') {
        // Show the full usage guide here.
        output.write(HELP_TEXT + '\n');
      } else if (command === 'clear') {
        history.clear();
        output.write('History cleared.\n');
      } else if (command === 'history') {
        const entries = history.list();
        output.write(entries.length
          ? `${entries.map((entry, index) => `${index + 1}. ${entry.expression} = ${entry.result}`).join('\n')}\n`
          : 'No history yet.\n');
      } else if (command) {
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
