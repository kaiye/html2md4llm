import * as esbuild from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';

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

// Package Dify plugin as .difypkg (ZIP archive)
try {
  // Import archiver dynamically
  const archiver = await import('archiver');
  const archiverDefault = archiver.default;

  // Read manifest to get version
  const manifestYaml = readFileSync('plugin/manifest.yaml', 'utf-8');
  const versionMatch = manifestYaml.match(/^version:\s*([^\n]+)/m);
  const version = versionMatch ? versionMatch[1].trim() : '1.0.0';

  const pluginPackage = `dist/html2md4llm-${version}.difypkg`;

  // Ensure dist directory exists
  execSync('mkdir -p dist', { stdio: 'ignore' });

  // Create ZIP archive
  const { createWriteStream, readdirSync, statSync } = await import('fs');
  const { join } = await import('path');

  const output = createWriteStream(pluginPackage);
  const archive = archiverDefault('zip', { zlib: { level: 6 } });

  archive.pipe(output);

  // Add files from plugin directory recursively, but NOT directory entries

  function addFilesRecursively(dir, baseDir = '') {
    const files = readdirSync(dir);
    for (const file of files) {
      const fullPath = join(dir, file);
      const archivePath = baseDir ? join(baseDir, file) : file;
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively add files from subdirectory, but don't add directory entry
        addFilesRecursively(fullPath, archivePath);
      } else if (stat.isFile()) {
        // Add file to archive
        archive.file(fullPath, { name: archivePath });
      }
    }
  }

  addFilesRecursively('plugin');

  await archive.finalize();

  // Wait for stream to finish
  await new Promise((resolve, reject) => {
    output.on('finish', resolve);
    output.on('error', reject);
  });

  console.log(`✓ Packaged dist/html2md4llm-${version}.difypkg`);
} catch (err) {
  console.warn('⚠ Failed to package Dify plugin (.difypkg)');
  console.warn('  Install archiver: npm install -D archiver');
}
