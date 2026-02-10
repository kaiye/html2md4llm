import assert from 'assert';
import { main } from '../src/main.js';

console.log('Testing Markdown Spacing...');

// 用例 1: 基本段落
const html1 = '<p>段落1</p><p>段落2</p>';
const result1 = main(html1);
assert.strictEqual(result1, '段落1\n\n段落2', '用例1: 段落之间应有空行');
console.log('✓ 用例1: 基本段落');

// 用例 2: 标题和段落
const html2 = '<h1>标题</h1><p>段落内容</p>';
const result2 = main(html2);
assert.strictEqual(result2, '# 标题\n\n段落内容', '用例2: 标题和段落之间应有空行');
console.log('✓ 用例2: 标题和段落');

// 用例 3: 行内元素
const html3 = '<div><span>文本1</span><span>文本2</span><strong>加粗</strong></div>';
const result3 = main(html3);
assert.strictEqual(result3, '文本1 文本2 **加粗**', '用例3: 行内元素之间应有空格');
console.log('✓ 用例3: 行内元素');

// 用例 4: 嵌套的单子节点容器
const html4 = '<section><section><span><br></span></section></section>';
const result4 = main(html4);
assert.strictEqual(result4, '\n', '用例4: 只有一个换行');
console.log('✓ 用例4: 嵌套单子节点容器');

// 用例 4a: 外层是 span
const html4a = '<span><section><section><span><br></span></section></section></span>';
const result4a = main(html4a);
assert.strictEqual(result4a, '\n', '用例4a: 外层span，只有一个换行');
console.log('✓ 用例4a: 外层是 span');

// 用例 4b: 外层是 p
const html4b = '<p><section><section><span><br></span></section></section></p>';
const result4b = main(html4b);
assert.strictEqual(result4b, '\n', '用例4b: 外层p，只有一个换行');
console.log('✓ 用例4b: 外层是 p');

// 用例 4c: 多个嵌套容器
const html4c = '<div><section><section><span><br></span></section></section><section><section><span><br></span></section></section></div>';
const result4c = main(html4c);
assert.strictEqual(result4c, '\n\n', '用例4c: 两个br，br不参与间距');
console.log('✓ 用例4c: 多个嵌套容器');

// 用例 4d: 嵌套 section + p
const html4d = '<section><section><span><br></span></section></section><p>继续</p>';
const result4d = main(html4d);
assert.strictEqual(result4d, '\n\n继续', '用例4d: br产生\\n，br不参与间距计算');
console.log('✓ 用例4d: 嵌套 section + p');

// 用例 4e: 嵌套 section + span
const html4e = '<section><section><span><br></span></section></section><span>继续</span>';
const result4e = main(html4e);
assert.strictEqual(result4e, '\n继续', '用例4e: br不参与间距计算');
console.log('✓ 用例4e: 嵌套 section + span');

// 用例 5: 多个 section 包含文本
const html5 = '<div><section><span>段落1</span></section><section><span>段落2</span></section><section><span>段落3</span></section></div>';
const result5 = main(html5);
assert.strictEqual(result5, '段落1\n\n段落2\n\n段落3', '用例5: section之间有空行');
console.log('✓ 用例5: 多个 section');

// 用例 6: 列表
const html6 = '<ul><li>项目1</li><li>项目2</li></ul><p>段落</p>';
const result6 = main(html6);
assert.strictEqual(result6, '- 项目1\n- 项目2\n\n段落', '用例6: 列表和段落之间有空行');
console.log('✓ 用例6: 列表');

// 用例 7: 代码块
const html7 = '<p>说明</p><pre>code here</pre><p>继续</p>';
const result7 = main(html7);
assert.strictEqual(result7, '说明\n\n```\ncode here\n```\n\n继续', '用例7: 代码块前后有空行');
console.log('✓ 用例7: 代码块');

// 用例 8: 图片 + 空段落 + hr + 标题
const html8 = '<img src="https://example.com/image.jpg" alt="test image"><p></p><hr><h2>Section Title</h2>';
const result8 = main(html8);
assert.strictEqual(
  result8,
  '![test image](https://example.com/image.jpg)\n\n---\n\n## Section Title',
  '用例8: hr应转成---，并保持图片与标题块级换行'
);
console.log('✓ 用例8: 图片 + hr + 标题');

console.log('All Markdown spacing tests passed!');
