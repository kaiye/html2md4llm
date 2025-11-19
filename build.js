import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

// Build with esbuild
await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  globalName: '__html2md4llm_temp',
  outfile: 'dist/temp.js',
  platform: 'neutral',
});

// Wrap to expose only html2md4llm function
const temp = readFileSync('dist/temp.js', 'utf-8');
const wrapped = `// html2md4llm - Convert HTML to Markdown/JSON
${temp}
var html2md4llm = __html2md4llm_temp.main;`;

writeFileSync('dist/html2md4llm.js', wrapped);
unlinkSync('dist/temp.js');

// Minified version
await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  globalName: '__html2md4llm_temp',
  outfile: 'dist/temp.min.js',
  minify: true,
  platform: 'neutral',
});

const tempMin = readFileSync('dist/temp.min.js', 'utf-8');
const wrappedMin = `${tempMin}var html2md4llm=__html2md4llm_temp.main;`;
writeFileSync('dist/html2md4llm.min.js', wrappedMin);
unlinkSync('dist/temp.min.js');

console.log('✓ Built dist/html2md4llm.js');
console.log('✓ Built dist/html2md4llm.min.js');
