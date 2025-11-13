import assert from 'assert';
import { main } from '../src/main.js';
import { parse } from '../src/parser.js';

console.log('Testing US2 Edge Cases...');

// Test 1: Remove SVG tags
const html1 = '<p>Before</p><svg><path d="M10"></path></svg><p>After</p>';
const result1 = main(html1);
assert.ok(!result1.includes('svg'), 'Should remove svg tags');
assert.ok(!result1.includes('path'), 'Should remove svg content');
assert.ok(result1.includes('Before'), 'Should keep content before svg');
assert.ok(result1.includes('After'), 'Should keep content after svg');
console.log('✓ SVG removal');

// Test 2: Remove HTML comments
const html2 = '<p>Text</p><!-- This is a comment --><p>More</p>';
const result2 = main(html2);
assert.ok(!result2.includes('comment'), 'Should remove HTML comments');
assert.ok(result2.includes('Text'), 'Should keep text content');
assert.ok(result2.includes('More'), 'Should keep more content');
console.log('✓ HTML comment removal');

// Test 3: Remove source tags, keep img
const html3 = '<picture><source srcset="a.webp"><source srcset="b.jpg"><img src="c.gif"></picture>';
const tree3 = parse(html3);
const picture = tree3;
assert.strictEqual(picture.children.length, 1, 'Picture should have 1 child (img only)');
assert.strictEqual(picture.children[0].tag, 'img', 'Child should be img');
assert.strictEqual(picture.children[0].attributes.src, 'c.gif', 'Img should have src');
console.log('✓ Source tag removal');

console.log('All US2 edge case tests passed!');
