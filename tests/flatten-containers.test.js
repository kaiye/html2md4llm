import assert from 'assert';
import { parse } from '../src/parser.js';

console.log('Testing Container Flattening...');

// 测试 1: 基本扁平化 - div > span > text
const html1 = '<div><span>text</span></div>';
const tree1 = parse(html1);
assert.strictEqual(tree1.type, 'text', '测试1: 应该扁平化为 text 节点');
assert.strictEqual(tree1.text, 'text', '测试1: text 内容正确');
assert.deepStrictEqual(tree1.flattenedTags, ['div', 'span'], '测试1: flattenedTags 正确');
console.log('✓ 测试1: 基本扁平化');

// 测试 2: strong 不被扁平化
const html2 = '<div><span><strong>加粗</strong></span></div>';
const tree2 = parse(html2);
assert.strictEqual(tree2.tag, 'strong', '测试2: strong 不被扁平化');
assert.deepStrictEqual(tree2.flattenedTags, ['div', 'span'], '测试2: flattenedTags 正确');
assert.strictEqual(tree2.children[0].text, '加粗', '测试2: 子节点是 text');
console.log('✓ 测试2: strong 不被扁平化');

// 测试 3: ul/li 不被扁平化
const html3 = '<ul><li><div><span>项目</span></div></li></ul>';
const tree3 = parse(html3);
assert.strictEqual(tree3.tag, 'ul', '测试3: ul 保留');
assert.strictEqual(tree3.children[0].tag, 'li', '测试3: li 保留');
assert.strictEqual(tree3.children[0].children[0].type, 'text', '测试3: li 的子节点被扁平化为 text');
assert.deepStrictEqual(tree3.children[0].children[0].flattenedTags, ['div', 'span'], '测试3: flattenedTags 正确');
console.log('✓ 测试3: ul/li 不被扁平化');

// 测试 4: p 被扁平化
const html4 = '<div><section><p>段落</p></section></div>';
const tree4 = parse(html4);
assert.strictEqual(tree4.type, 'text', '测试4: 扁平化为 text');
assert.strictEqual(tree4.text, '段落', '测试4: text 内容正确');
assert.deepStrictEqual(tree4.flattenedTags, ['div', 'section', 'p'], '测试4: flattenedTags 包含 p');
console.log('✓ 测试4: p 被扁平化');

// 测试 5: 多个子节点，只扁平化单子节点链
const html5 = '<div><div>text1</div><div><span>text2</span></div></div>';
const tree5 = parse(html5);
assert.strictEqual(tree5.tag, 'div', '测试5: 外层 div 保留');
assert.strictEqual(tree5.children.length, 2, '测试5: 有 2 个子节点');
assert.strictEqual(tree5.children[0].type, 'text', '测试5: 第一个子节点是 text');
assert.strictEqual(tree5.children[0].text, 'text1', '测试5: 第一个 text 内容');
assert.deepStrictEqual(tree5.children[0].flattenedTags, ['div'], '测试5: 第一个 flattenedTags');
assert.strictEqual(tree5.children[1].type, 'text', '测试5: 第二个子节点是 text');
assert.strictEqual(tree5.children[1].text, 'text2', '测试5: 第二个 text 内容');
assert.deepStrictEqual(tree5.children[1].flattenedTags, ['div', 'span'], '测试5: 第二个 flattenedTags');
console.log('✓ 测试5: 多子节点扁平化');

// 测试 6: img 作为终点
const html6 = '<div><section><img src="pic.jpg"></section></div>';
const tree6 = parse(html6);
assert.strictEqual(tree6.tag, 'img', '测试6: img 不被扁平化');
assert.deepStrictEqual(tree6.flattenedTags, ['div', 'section'], '测试6: flattenedTags 正确');
console.log('✓ 测试6: img 作为终点');

// 测试 7: br 作为终点
const html7 = '<section><section><span><br></span></section></section>';
const tree7 = parse(html7);
assert.strictEqual(tree7.tag, 'br', '测试7: br 不被扁平化');
assert.deepStrictEqual(tree7.flattenedTags, ['section', 'section', 'span'], '测试7: flattenedTags 正确');
console.log('✓ 测试7: br 作为终点');

// 测试 8: 不在白名单的容器不扁平化
const html8 = '<article><div>text</div></article>';
const tree8 = parse(html8);
assert.strictEqual(tree8.tag, 'article', '测试8: article 不被扁平化');
assert.strictEqual(tree8.children[0].type, 'text', '测试8: div 被扁平化');
assert.deepStrictEqual(tree8.children[0].flattenedTags, ['div'], '测试8: flattenedTags 只有 div');
console.log('✓ 测试8: 非白名单容器');

// 测试 9: flattenedClasses
const html9 = '<div class="outer"><span class="inner">text</span></div>';
const tree9 = parse(html9);
assert.strictEqual(tree9.type, 'text', '测试9: 扁平化为 text');
assert.deepStrictEqual(tree9.flattenedClasses, ['outer', 'inner'], '测试9: flattenedClasses 正确');
console.log('✓ 测试9: flattenedClasses');

// 测试 10: 没有 class 的节点
const html10 = '<div><span>text</span></div>';
const tree10 = parse(html10);
assert.deepStrictEqual(tree10.flattenedClasses, [], '测试10: flattenedClasses 为空数组');
console.log('✓ 测试10: 空 flattenedClasses');

console.log('All container flattening tests passed!');
