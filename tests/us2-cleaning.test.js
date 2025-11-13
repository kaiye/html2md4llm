import assert from 'assert';
import { main } from '../src/main.js';
import { parse } from '../src/parser.js';

// US2: HTML Cleaning and Metadata Extraction
console.log('Testing US2: HTML Cleaning and Metadata...');

// Test 1: Remove script tags
const html1 = '<p>Before</p><script>alert("bad")</script><p>After</p>';
const result1 = main(html1);
assert.ok(!result1.includes('alert'), 'Should remove script content');
assert.ok(result1.includes('Before'), 'Should keep content before script');
assert.ok(result1.includes('After'), 'Should keep content after script');
console.log('✓ Script removal');

// Test 2: Remove style and iframe
const html2 = '<p>Text</p><style>.bad{}</style><iframe src="x"></iframe><p>More</p>';
const result2 = main(html2);
assert.ok(!result2.includes('.bad'), 'Should remove style content');
assert.ok(!result2.includes('iframe'), 'Should remove iframe');
assert.ok(result2.includes('Text'), 'Should keep text content');
console.log('✓ Style and iframe removal');

// Test 3: Preserve description and keywords meta tags
const html3 = '<html><head><title>My Title</title><meta name="description" content="My desc"><meta name="keywords" content="a,b,c"><meta name="viewport" content="width=device-width"></head><body><p>Content</p></body></html>';
const tree3 = parse(html3);
const head = tree3.children.find(c => c.tag === 'head');
const metas = head.children.filter(c => c.tag === 'meta');
assert.strictEqual(metas.length, 2, 'Should keep 2 meta tags (description and keywords)');
assert.ok(metas.some(m => m.attributes.name === 'description' && m.attributes.content === 'My desc'), 'Should keep description meta');
assert.ok(metas.some(m => m.attributes.name === 'keywords' && m.attributes.content === 'a,b,c'), 'Should keep keywords meta');
assert.ok(!metas.some(m => m.attributes.name === 'viewport'), 'Should remove viewport meta');
console.log('✓ Metadata extraction');

console.log('All US2 tests passed!');
