# html2md4llm

把 HTML 转成更干净的 Markdown 或 JSON，便于给 LLM 使用。

## 安装

```bash
npm install html2md4llm
```

## 在代码中引用（npm 包）

```js
import { main } from 'html2md4llm';

const markdown = main('<h1>Hello</h1><p>World</p>');
console.log(markdown);
```

也支持默认导入：

```js
import html2md4llm from 'html2md4llm';

const markdown = html2md4llm('<h1>Hello</h1>');
```

### API

`main(htmlInput, options?)`

- `htmlInput`：`string`，HTML 内容
- `options.outputFormat`：`'markdown' | 'json'`，默认 `'markdown'`
- `options.strategy`：`'list' | 'article'`
- `options.removeAttributes`：`string[]`，例如 `['aria-*', 'role']`

返回值：`string`（Markdown 或 JSON 字符串）

## 命令行使用（npx / CLI）

安装后可直接使用：

```bash
npx html2md4llm --help
```

### 1) 本地 HTML 文件 -> 本地 .md 文件

```bash
npx html2md4llm ./input.html ./output.md
```

或：

```bash
npx html2md4llm ./input.html -o ./output.md
```

### 2) stdin / stdout（Linux 管道）

```bash
cat ./input.html | npx html2md4llm > ./output.md
```

也可以显式用 `-` 代表 stdin：

```bash
npx html2md4llm - --format json < ./input.html > ./output.json
```

### CLI 参数

- `-o, --output <file>`：输出文件路径
- `-f, --format <markdown|json>`：输出格式
- `--json`：等价于 `--format json`
- `--markdown`：等价于 `--format markdown`
- `-s, --strategy <list|article>`：提取策略
- `-r, --remove-attrs <attrs>`：移除属性，逗号分隔（如 `aria-*,role`）
- `-h, --help`：查看帮助
- `-v, --version`：查看版本

## 开发

```bash
npm test
```

## 发布到 npm（GitHub CI）

仓库已包含两个工作流：

- `CI`：每次 push / PR 自动执行 `npm ci` + `npm test`
- `Publish to npm`：当你 push `v*` tag 时自动发布到 npm

### 一次性配置

在 GitHub 仓库里设置 Secret：

- `NPM_TOKEN`：npm 的 Automation Token（建议只授予发布权限）

### 发布 1.1.0（当前版本）

```bash
# 在仓库根目录
npm test
git add package.json package-lock.json
git commit -m "chore: release 1.1.0"
git tag v1.1.0
git push origin main --tags
```

推送 tag 后，GitHub Actions 会执行发布流程。

## License

MIT
