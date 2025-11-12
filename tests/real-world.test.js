import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { main } from '../src/main.js';

const inputDir = 'tests/fixtures';
const outputDir = 'tests/output';

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
