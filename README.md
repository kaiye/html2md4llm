# html2md4llm

把 HTML 转成更干净的 Markdown 或 JSON，便于人和 AI 直接消费。

## 安装

```bash
npm install html2md4llm
```

## 最常用方式

### 1) 在代码中调用

```js
import { main } from 'html2md4llm';

const html = '<h1>Hello</h1><p>World</p>';
const md = main(html); // 默认输出 markdown
console.log(md);
```

输出 JSON：

```js
const json = main('<h1>Hello</h1>', { outputFormat: 'json' });
```

### 2) 用 npx 当命令行工具

本地文件转 `.md`：

```bash
npx html2md4llm ./input.html ./output.md
```

stdin -> stdout（Linux 管道）：

```bash
cat ./input.html | npx html2md4llm > ./output.md
```

## API（给代码/AI 调用）

`main(htmlInput, options?)`

- `htmlInput: string`：HTML 字符串
- `options.outputFormat: 'markdown' | 'json'`：默认 `'markdown'`
- `options.strategy: 'list' | 'article'`：可选提取策略
- `options.removeAttributes: string[]`：按规则移除属性，如 `['aria-*', 'role']`

返回值：`string`（Markdown 文本或 JSON 字符串）

## CLI 参数

```bash
html2md4llm <input.html> [output.md] [options]
html2md4llm - [output.md] [options]
```

- `-o, --output <file>`：输出文件路径
- `-f, --format <markdown|json>`：输出格式
- `--json`：等价于 `--format json`
- `--markdown`：等价于 `--format markdown`
- `-s, --strategy <list|article>`：内容提取策略
- `-r, --remove-attrs <attrs>`：逗号分隔，如 `aria-*,role`
- `-h, --help`：查看帮助
- `-v, --version`：查看版本

## AI 使用建议

如果你在 Agent/工作流里调用这个工具，推荐固定约定：

1. 输入始终传完整 HTML 字符串。
2. 需要结构化消费时使用 `outputFormat: 'json'`。
3. 需要最简正文时按场景加 `strategy: 'article'` 或 `strategy: 'list'`。
4. 需要清理无关属性时传 `removeAttributes`，例如 `['aria-*', 'role', 'data-*']`。

## 开发

```bash
npm test
```

## License

MIT
