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
const html2 = '<ul><li>Nested</li></ul>';
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

// Test 4: Default attribute filtering
const html4 = '<ul style="color:red" class="test" data-id="123"><li>Content</li></ul>';
const result4 = main(html4, { outputFormat: 'json' });
const parsed4 = JSON.parse(result4);
assert.strictEqual(parsed4.attributes.style, undefined, 'Should remove style by default');
assert.strictEqual(parsed4.attributes['data-id'], undefined, 'Should remove data-* by default');
assert.strictEqual(parsed4.attributes.class, 'test', 'Should keep class by default');
console.log('✓ Default attribute filtering');

// Test 5: Custom attribute removal with wildcard
const html5 = '<a href="http://test.com" aria-label="Link" role="button">Link</a>';
const result5 = main(html5, { outputFormat: 'json', removeAttributes: ['aria-*', 'role'] });
const parsed5 = JSON.parse(result5);
assert.strictEqual(parsed5.attributes.href, 'http://test.com', 'Should keep href');
assert.strictEqual(parsed5.attributes['aria-label'], undefined, 'Should remove aria-label');
assert.strictEqual(parsed5.attributes.role, undefined, 'Should remove role');
console.log('✓ Custom attribute removal');

console.log('All US5 tests passed!');
