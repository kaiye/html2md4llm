import assert from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { main } from '../src/main.js';

const cliPath = join(process.cwd(), 'bin/html2md4llm.js');

// File input -> file output
const tempDir = mkdtempSync(join(tmpdir(), 'html2md4llm-cli-'));
const inputFile = join(tempDir, 'input.html');
const outputFile = join(tempDir, 'output.md');

const html = '<h1>Hello</h1><p>World</p>';
writeFileSync(inputFile, html, 'utf-8');

execFileSync(process.execPath, [cliPath, inputFile, outputFile], { encoding: 'utf-8' });

const fileOutput = readFileSync(outputFile, 'utf-8');
assert.strictEqual(fileOutput, main(html));

// stdin -> stdout
const piped = spawnSync(process.execPath, [cliPath], {
  input: '<p>Pipe</p>',
  encoding: 'utf-8'
});

assert.strictEqual(piped.status, 0);
assert.strictEqual(piped.stdout, main('<p>Pipe</p>'));
