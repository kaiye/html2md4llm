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

// Helper function to check if tree contains a tag (avoids circular JSON issue)
function hasTag(node, tagName) {
  if (node.type === 'element' && node.tag === tagName) {
    return true;
  }
  if (node.children) {
    return node.children.some(child => hasTag(child, tagName));
  }
  return false;
}

// Test 4: Remove empty formatting elements - strong with br
const html4 = '<p>Before <strong><br></strong> After</p>';
const tree4 = parse(html4);
const hasStrong = hasTag(tree4, 'strong');
assert.strictEqual(hasStrong, false, 'Should remove strong with only br');
console.log('✓ Empty strong with br removal');

// Test 5: Remove empty formatting elements - strong with whitespace
const html5 = '<p>Text <strong>   </strong> More</p>';
const tree5 = parse(html5);
const hasStrong5 = hasTag(tree5, 'strong');
assert.strictEqual(hasStrong5, false, 'Should remove strong with only whitespace');
console.log('✓ Empty strong with whitespace removal');

// Test 6: Remove empty formatting elements - em with nested empty span
const html6 = '<p>Text <em><span> </span></em> More</p>';
const tree6 = parse(html6);
const hasEm6 = hasTag(tree6, 'em');
assert.strictEqual(hasEm6, false, 'Should remove em with only empty nested elements');
console.log('✓ Empty em with nested span removal');

// Test 7: Remove empty formatting elements - code with multiple br
const html7 = '<p>Code: <code><br><br></code> here</p>';
const tree7 = parse(html7);
const hasCode7 = hasTag(tree7, 'code');
assert.strictEqual(hasCode7, false, 'Should remove code with only br elements');
console.log('✓ Empty code with multiple br removal');

// Test 8: Keep formatting elements with actual text
const html8 = '<p>Text <strong>bold</strong> and <em>italic</em> here</p>';
const tree8 = parse(html8);
const hasStrong8 = hasTag(tree8, 'strong');
const hasEm8 = hasTag(tree8, 'em');
assert.strictEqual(hasStrong8, true, 'Should keep strong with text');
assert.strictEqual(hasEm8, true, 'Should keep em with text');
console.log('✓ Keep formatting elements with text');

// Test 9: Remove deeply nested empty formatting elements
const html9 = '<p>Text <b><i><span>  </span></i></b> More</p>';
const tree9 = parse(html9);
const hasB9 = hasTag(tree9, 'b');
assert.strictEqual(hasB9, false, 'Should remove b with deeply nested empty elements');
console.log('✓ Empty deeply nested formatting removal');

// Test 10: Keep formatting elements with img
const html10 = '<p>Text <strong><img src="photo.jpg"></strong> More</p>';
const tree10 = parse(html10);
const hasStrong10 = hasTag(tree10, 'strong');
const hasImg10 = hasTag(tree10, 'img');
assert.strictEqual(hasStrong10, true, 'Should keep strong with img');
assert.strictEqual(hasImg10, true, 'Should keep img inside strong');
console.log('✓ Keep formatting elements with img');

// Test 11: Keep formatting elements with link
const html11 = '<p>Text <em><a href="url">link</a></em> More</p>';
const tree11 = parse(html11);
const hasEm11 = hasTag(tree11, 'em');
const hasA11 = hasTag(tree11, 'a');
assert.strictEqual(hasEm11, true, 'Should keep em with link');
assert.strictEqual(hasA11, true, 'Should keep link inside em');
console.log('✓ Keep formatting elements with link');

// Test 12: Remove formatting with img but no src (img gets filtered earlier)
const html12 = '<p>Text <strong><img></strong> More</p>';
const tree12 = parse(html12);
const hasStrong12 = hasTag(tree12, 'strong');
assert.strictEqual(hasStrong12, false, 'Should remove strong when img has no src');
console.log('✓ Remove formatting with invalid img');

console.log('All US2 edge case tests passed!');
