import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const inputDir = join(rootDir, 'tests/fixtures');
const outputDir = join(rootDir, 'tests/output');

const { main } = await import(pathToFileURL(join(rootDir, 'src/main.js')).href);

mkdirSync(outputDir, { recursive: true });

const htmlFiles = readdirSync(inputDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const html = readFileSync(`${inputDir}/${file}`, 'utf-8');
  const baseName = file.replace('.html', '');

  const markdown = main(html);
  writeFileSync(`${outputDir}/${baseName}.md`, markdown);

  const json = main(html, { outputFormat: 'json' });
  writeFileSync(`${outputDir}/${baseName}.json`, json);

  console.log(`✓ Converted ${file}`);
});

console.log(`\nProcessed ${htmlFiles.length} files`);
