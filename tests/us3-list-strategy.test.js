import assert from 'assert';
import { main } from '../src/main.js';

// US3: List Extraction Strategy
console.log('Testing US3: List Extraction...');

// Test 1: Extract largest ul
const html1 = '<ul><li>A</li></ul><ul><li>1</li><li>2</li><li>3</li></ul><ul><li>X</li><li>Y</li></ul>';
const result1 = main(html1, { strategy: 'list' });
assert.ok(result1.includes('- 1'), 'Should include largest list');
assert.ok(result1.includes('- 2'), 'Should include largest list');
assert.ok(result1.includes('- 3'), 'Should include largest list');
assert.ok(!result1.includes('- A'), 'Should not include smaller list');
console.log('✓ Extract largest ul');

// Test 2: Extract largest ol
const html2 = '<ol><li>A</li></ol><ol><li>1</li><li>2</li></ol>';
const result2 = main(html2, { strategy: 'list' });
assert.ok(result2.includes('1. 1'), 'Should extract largest ol');
assert.ok(result2.includes('2. 2'), 'Should extract largest ol');
console.log('✓ Extract largest ol');

// Test 3: Mixed ul and ol
const html3 = '<ul><li>A</li><li>B</li></ul><ol><li>1</li><li>2</li><li>3</li></ol>';
const result3 = main(html3, { strategy: 'list' });
assert.ok(result3.includes('1. 1'), 'Should extract ol with most items');
assert.ok(!result3.includes('- A'), 'Should not include smaller ul');
console.log('✓ Mixed ul and ol');

console.log('All US3 tests passed!');
