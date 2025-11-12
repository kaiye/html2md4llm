import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const testFiles = readdirSync(__dirname)
  .filter(f => f.endsWith('.test.js'))
  .concat(
    readdirSync(join(__dirname, 'generators'))
      .filter(f => f.endsWith('.test.js'))
      .map(f => `generators/${f}`)
  );

let passed = 0;
let failed = 0;

for (const file of testFiles) {
  try {
    await import(`./${file}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
