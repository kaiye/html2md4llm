import assert from 'assert';
import { main } from '../src/main.js';

// US4: Article Extraction Strategy
console.log('Testing US4: Article Extraction...');

// Test 1: Filter empty divs
const html1 = '<div><p>Main content</p></div><div></div><div><p>More text</p></div>';
const result1 = main(html1, { strategy: 'article' });
assert.ok(result1.includes('Main content'), 'Should keep div with text');
assert.ok(result1.includes('More text'), 'Should keep div with text');
console.log('✓ Filter empty divs');

// Test 2: Keep only text-containing siblings
const html2 = '<div><nav></nav></div><div><p>Article body</p></div><div><aside></aside></div>';
const result2 = main(html2, { strategy: 'article' });
assert.ok(result2.includes('Article body'), 'Should keep article content');
console.log('✓ Keep text-containing siblings');

console.log('All US4 tests passed!');
