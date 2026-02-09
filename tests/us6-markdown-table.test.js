import assert from 'assert';
import { main } from '../src/main.js';

console.log('Testing US6: Markdown Table Support...');

// Test 1: Basic table with thead + tbody
const html1 = '<table><thead><tr><th>Name</th><th>Age</th></tr></thead><tbody><tr><td>Alice</td><td>30</td></tr><tr><td>Bob</td><td>25</td></tr></tbody></table>';
const result1 = main(html1);
const expected1 = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';
assert.strictEqual(result1, expected1, 'Should convert basic table to markdown table');
console.log('✓ Basic table conversion');

// Test 2: Table without thead should still produce valid markdown table
const html2 = '<table><tr><td>城市</td><td>国家</td></tr><tr><td>巴黎</td><td>法国</td></tr></table>';
const result2 = main(html2);
const expected2 = '| 城市 | 国家 |\n| --- | --- |\n| 巴黎 | 法国 |';
assert.strictEqual(result2, expected2, 'Should promote first row to markdown table header when no th/thead');
console.log('✓ Table without thead');

// Test 3: Preserve inline markdown and escape pipe in table cells
const html3 = '<table><tr><th>项目</th><th>值</th></tr><tr><td><strong>CPU</strong></td><td>8 | cores</td></tr><tr><td><a href="https://example.com">官网</a></td><td><code>v1.2.0</code></td></tr></table>';
const result3 = main(html3);
const expected3 = '| 项目 | 值 |\n| --- | --- |\n| **CPU** | 8 \\| cores |\n| [官网](https://example.com) | `v1.2.0` |';
assert.strictEqual(result3, expected3, 'Should render inline markdown and escape pipes in cells');
console.log('✓ Inline formatting in cells');

// Test 4: Table should be treated as block element with spacing around paragraphs
const html4 = '<p>前文</p><table><tr><th>键</th><th>值</th></tr><tr><td>A</td><td>1</td></tr></table><p>后文</p>';
const result4 = main(html4);
const expected4 = '前文\n\n| 键 | 值 |\n| --- | --- |\n| A | 1 |\n\n后文';
assert.strictEqual(result4, expected4, 'Should keep blank lines between paragraph and table');
console.log('✓ Table block spacing');

// Test 5: Keep empty cells to preserve table shape
const html5 = '<table><tr><th>A</th><th>B</th><th>C</th></tr><tr><td>1</td><td></td><td>3</td></tr></table>';
const result5 = main(html5);
const expected5 = '| A | B | C |\n| --- | --- | --- |\n| 1 |  | 3 |';
assert.strictEqual(result5, expected5, 'Should keep empty td as empty markdown cell');
console.log('✓ Empty cell preservation');

console.log('All US6 tests passed!');
