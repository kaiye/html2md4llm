import { readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const testFiles = readdirSync(__dirname)
  .filter(f => f.endsWith('.test.js'));

// Add generator tests if directory exists
const generatorsDir = join(__dirname, 'generators');
if (existsSync(generatorsDir)) {
  const generatorTests = readdirSync(generatorsDir)
    .filter(f => f.endsWith('.test.js'))
    .map(f => `generators/${f}`);
  testFiles.push(...generatorTests);
}

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
