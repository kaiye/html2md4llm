# Dify Plugin Installation Guide

## 问题解决

### 签名验证错误

如果在 Dify 中安装插件时收到以下错误：

```
PluginDaemonBadRequestError: plugin verification has been enabled,
and the plugin you want to install has a bad signature
```

这是因为你的 Dify 实例启用了**插件签名验证**。有两种解决方案：

## 解决方案 1: 禁用签名验证（推荐用于开发）

这是最简单的方法。编辑你的 Dify 配置文件或环境变量，设置：

```bash
PLUGIN_SIGNATURE_VERIFICATION_ENABLED=false
```

或在 Docker Compose 中：

```yaml
services:
  dify-api:
    environment:
      - PLUGIN_SIGNATURE_VERIFICATION_ENABLED=false
```

然后重启 Dify，再次上传插件。

**何时使用**：
- 本地开发环境
- 测试自定义插件
- 私有 Dify 部署

## 解决方案 2: 对插件进行签名（推荐用于生产）

如果需要保持签名验证启用，需要为插件签名。

### 步骤：

1. **生成签名密钥对**

   使用 OpenSSL：
   ```bash
   # 生成私钥
   openssl genrsa -out html2md4llm.private.pem 2048

   # 生成公钥
   openssl rsa -in html2md4llm.private.pem -pubout -out html2md4llm.public.pem
   ```

2. **对插件进行签名**

   使用官方 Dify 工具（需要安装 dify-cli）：
   ```bash
   dify signature sign dist/html2md4llm-1.0.0.difypkg \
     -p html2md4llm.private.pem
   ```

   这会生成：`dist/html2md4llm-1.0.0.signed.difypkg`

3. **上传签名的插件**

   在 Dify 中上传 `*.signed.difypkg` 文件。

4. **配置公钥验证**

   将公钥放在 Dify 可以访问的位置，并在配置中引用它。

**何时使用**：
- 生产环境
- 公开发布插件
- 需要安全验证的场景

## 文件清单

确保 `.difypkg` 文件包含以下内容：

```
✓ manifest.yaml          - 插件元数据
✓ main.py               - 入口点
✓ _assets/icon.svg      - 插件图标
✓ lib/                  - Python 库文件
✓ provider/             - 工具提供商配置
✓ tools/                - 工具实现
✓ PRIVACY.md            - 隐私政策
✓ requirements.txt      - Python 依赖
✓ pyproject.toml        - 项目配置
```

**重要**：不应该包含目录条目，只有文件条目。

## 安装步骤

1. 获取插件包：
   ```bash
   npm run build
   # 输出：dist/html2md4llm-1.0.0.difypkg
   ```

2. 在 Dify 中：
   - 导航到 **Plugins** → **Install from file**
   - 选择 `.difypkg` 文件
   - 点击 **Install**

3. 使用插件：
   - 在工作流中添加 **HTML to Markdown** 或 **HTML to JSON** 工具
   - 配置参数：
     - `html_input`: HTML 内容
     - `remove_attributes`: 要移除的属性（可选）
     - `strategy`: 提取策略 - `list` 或 `article`（可选）

## 故障排除

### 错误：read _assets: is a directory

**原因**：.difypkg 包含目录条目

**解决**：使用最新的 build.js（已修复）

```bash
npm run build  # 重新构建
```

### 错误：Plugin file is not valid

**原因**：缺少必要的文件或配置

**检查**：
```bash
unzip -l dist/html2md4llm-1.0.0.difypkg
```

应该包含 manifest.yaml 和 main.py。

### 错误：python version mismatch

**原因**：Dify 环境 Python 版本不是 3.12+

**解决**：确保 Dify 使用 Python 3.12 或更高版本

## 相关文档

- [Dify 插件开发指南](https://docs.dify.ai/en/plugins/quick-start/develop-plugins)
- [插件签名文档](https://docs.dify.ai/en/plugins/publish-plugins/signing-plugins-for-third-party-signature-verification)
- [GitHub Issue #13842 - 签名验证问题](https://github.com/langgenius/dify/issues/13842)
