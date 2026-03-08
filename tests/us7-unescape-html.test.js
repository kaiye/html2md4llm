import assert from 'assert';
import { main } from '../src/main.js';

console.log('Testing US7: unescapeHTML option...');

const escapedHtml = '&lt;h1&gt;Title&lt;/h1&gt;';

// Test 1: default auto should unescape escaped full HTML
const autoResult = main(escapedHtml);
assert.ok(autoResult.includes('# Title'), 'Default auto should unescape escaped full HTML input');
console.log('✓ auto unescape by default');

// Test 2: auto should also work with leading/trailing whitespace
const autoWithWhitespaceResult = main(`\n  ${escapedHtml}  \n`);
assert.ok(autoWithWhitespaceResult.includes('# Title'), 'auto should detect escaped HTML after trimming');
console.log('✓ auto detection with whitespace');

// Test 3: false should disable full unescape
const disabledResult = main(escapedHtml, { unescapeHTML: false });
assert.strictEqual(disabledResult, '<h1>Title</h1>');
console.log('✓ disable unescape');

// Test 4: true should always unescape full input
const forcedResult = main(escapedHtml, { unescapeHTML: true });
assert.ok(forcedResult.includes('# Title'), 'true should force full unescape');
console.log('✓ force unescape');

// Test 5: invalid unescapeHTML should throw
assert.throws(
  () => main('<p>x</p>', { unescapeHTML: 'yes' }),
  /options\.unescapeHTML must be/,
  'Invalid unescapeHTML should throw'
);
console.log('✓ invalid unescapeHTML validation');

console.log('All US7 tests passed!');
