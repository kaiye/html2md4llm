import assert from 'assert';
import { main } from '../src/main.js';

// US1: Basic HTML to Markdown Conversion
console.log('Testing US1: Basic HTML to Markdown...');

// Test 1: Simple HTML with headings and paragraphs
const html1 = '<h1>Title</h1><p>Paragraph</p>';
const result1 = main(html1);
assert.ok(result1.includes('# Title'), 'Should convert h1 to # Title');
assert.ok(result1.includes('Paragraph'), 'Should include paragraph text');
console.log('✓ Simple HTML to Markdown');

// Test 2: Inline formatting (bold, italic, links)
const html2 = '<p>Text with <strong>bold</strong>, <em>italic</em>, and <a href="https://example.com">link</a>.</p>';
const result2 = main(html2);
assert.ok(result2.includes('**bold**'), 'Should convert strong to **bold**');
assert.ok(result2.includes('*italic*'), 'Should convert em to *italic*');
assert.ok(result2.includes('[link](https://example.com)'), 'Should convert a to [text](url)');
console.log('✓ Inline formatting');

// Test 3: Nested lists
const html3 = '<ul><li>Item 1</li><li>Item 2</li></ul>';
const result3 = main(html3);
assert.ok(result3.includes('- Item 1'), 'Should convert ul/li to - Item');
assert.ok(result3.includes('- Item 2'), 'Should convert ul/li to - Item');
console.log('✓ Nested lists');

// Test 4: Code blocks and inline code
const html4 = '<p>Inline <code>code</code> and block:</p><pre>code block</pre>';
const result4 = main(html4);
assert.ok(result4.includes('`code`'), 'Should convert code to `code`');
assert.ok(result4.includes('```'), 'Should convert pre to code block');
console.log('✓ Code blocks');

console.log('All US1 tests passed!');
