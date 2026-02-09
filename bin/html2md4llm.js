#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { main } from '../src/main.js';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

function printHelp() {
  const help = `html2md4llm ${pkg.version}

Usage:
  html2md4llm <input.html> [output.md] [options]
  html2md4llm - [output.md] [options]
  cat input.html | html2md4llm [options] > output.md

Options:
  -o, --output <file>           Output file path
  -f, --format <markdown|json>  Output format (default: markdown)
  --json                         Shortcut for --format json
  --markdown                     Shortcut for --format markdown
  -s, --strategy <list|article> Extraction strategy
  -r, --remove-attrs <attrs>    Comma-separated attrs (e.g. aria-*,role)
  -h, --help                    Show help
  -v, --version                 Show version`;

  process.stdout.write(`${help}\n`);
}

function parseArgs(argv) {
  const parsed = {
    positional: [],
    outputFile: undefined,
    outputFormat: 'markdown',
    strategy: undefined,
    removeAttributes: []
  };

  const takeValue = (name, index) => {
    const value = argv[index + 1];
    if (!value || value.startsWith('-')) {
      throw new Error(`Missing value for ${name}`);
    }
    return value;
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '-h' || arg === '--help') {
      parsed.help = true;
      continue;
    }

    if (arg === '-v' || arg === '--version') {
      parsed.version = true;
      continue;
    }

    if (arg === '-o' || arg === '--output') {
      parsed.outputFile = takeValue(arg, i);
      i++;
      continue;
    }

    if (arg === '-f' || arg === '--format') {
      parsed.outputFormat = takeValue(arg, i);
      i++;
      continue;
    }

    if (arg === '--json') {
      parsed.outputFormat = 'json';
      continue;
    }

    if (arg === '--markdown') {
      parsed.outputFormat = 'markdown';
      continue;
    }

    if (arg === '-s' || arg === '--strategy') {
      parsed.strategy = takeValue(arg, i);
      i++;
      continue;
    }

    if (
      arg === '-r' ||
      arg === '--remove-attrs' ||
      arg === '--remove-attr' ||
      arg === '--remove-attribute'
    ) {
      const value = takeValue(arg, i);
      parsed.removeAttributes.push(
        ...value.split(',').map(item => item.trim()).filter(Boolean)
      );
      i++;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    parsed.positional.push(arg);
  }

  if (parsed.positional.length > 2) {
    throw new Error('Too many positional arguments');
  }

  if (parsed.outputFile && parsed.positional[1]) {
    throw new Error('Output file specified twice (positional and --output)');
  }

  parsed.inputFile = parsed.positional[0];
  if (!parsed.outputFile) {
    parsed.outputFile = parsed.positional[1];
  }

  return parsed;
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (args.version) {
    process.stdout.write(`${pkg.version}\n`);
    return;
  }

  if (args.outputFormat !== 'markdown' && args.outputFormat !== 'json') {
    throw new Error('Invalid --format value. Use "markdown" or "json".');
  }

  if (args.strategy && args.strategy !== 'list' && args.strategy !== 'article') {
    throw new Error('Invalid --strategy value. Use "list" or "article".');
  }

  const hasStdin = !process.stdin.isTTY;
  let htmlInput;

  if (args.inputFile && args.inputFile !== '-') {
    htmlInput = await readFile(args.inputFile, 'utf-8');
  } else if (args.inputFile === '-' || hasStdin) {
    htmlInput = await readStdin();
  } else {
    throw new Error('No input provided. Pass an input file, "-" for stdin, or pipe HTML to stdin.');
  }

  const options = {
    outputFormat: args.outputFormat
  };

  if (args.strategy) {
    options.strategy = args.strategy;
  }

  if (args.removeAttributes.length > 0) {
    options.removeAttributes = args.removeAttributes;
  }

  const output = main(htmlInput, options);

  if (args.outputFile) {
    await writeFile(args.outputFile, output, 'utf-8');
    return;
  }

  process.stdout.write(output);
  if (process.stdout.isTTY && !output.endsWith('\n')) {
    process.stdout.write('\n');
  }
}

run().catch(err => {
  process.stderr.write(`html2md4llm: ${err.message}\n`);
  process.stderr.write('Run "html2md4llm --help" for usage.\n');
  process.exit(1);
});
