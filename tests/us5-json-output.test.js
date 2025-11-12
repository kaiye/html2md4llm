import assert from 'assert';
import { main } from '../src/main.js';

// US5: JSON Output Format
console.log('Testing US5: JSON Output...');

// Test 1: Valid JSON output
const html1 = '<h1>Title</h1><p>Text</p>';
const result1 = main(html1, { outputFormat: 'json' });
const parsed1 = JSON.parse(result1);
assert.ok(parsed1, 'Should produce valid JSON');
console.log('✓ Valid JSON output');

// Test 2: Preserve structure
const html2 = '<div><p>Nested</p></div>';
const result2 = main(html2, { outputFormat: 'json' });
const parsed2 = JSON.parse(result2);
assert.strictEqual(parsed2.type, 'element', 'Should have element type');
assert.ok(parsed2.children, 'Should have children');
console.log('✓ Preserve structure');

// Test 3: Preserve attributes
const html3 = '<a href="http://test.com">Link</a>';
const result3 = main(html3, { outputFormat: 'json' });
const parsed3 = JSON.parse(result3);
assert.strictEqual(parsed3.attributes.href, 'http://test.com', 'Should preserve href');
console.log('✓ Preserve attributes');

console.log('All US5 tests passed!');
