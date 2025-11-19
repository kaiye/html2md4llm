![cover_image](https://mmbiz.qpic.cn/sz_mmbiz_jpg/cFWFibBpTbSd4LP3iauROyZdwqadBzsmlUS3Y6CPzAJZp2P1XvgFzuk75BRQ4Y7oJPJ25HiaeTibNC3H9fZar0y1DA/0?wx_fmt=jpeg)

# Claude Code 免费版，体验一次程序员的快感

Original yekai

Claude Code 命令行工具是当前最热门最聪明的 AI 编程工具，能 100% 用对话的方式写程序，不需要阅读和理解代码。我个人使用体验上，它的编码成功率大概是 Cursor 的 2 到 3 倍，所以如果你还没用过，也应该先体验一次再说。

但对于国内用户来说，Claude Code 的安装和会员订阅门槛，还是相当高的。

本文介绍一种能免费体验的方法。

第 1 步：注册登录 PackyCode，领取 $1 体验额度

https://www.packyapi.com/register?aff=sf14

第 2 步：在控制台创建一个新的令牌 

https://www.packyapi.com/console/token

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cFWFibBpTbSd4LP3iauROyZdwqadBzsmlUfibrv8oq23NArkhN8ZpcKiasL7uCvfU2vnMjQDTsZuI5sIWrGTPoyk3Q/640?wx_fmt=png&amp;from=appmsg)

注意：分组选 aws-q，token 消耗速度最慢，$1 预计能免费体验一天。

创建完成后，把密钥复制出来，一会要用！

![](https://mmbiz.qpic.cn/sz_mmbiz_png/cFWFibBpTbSd4LP3iauROyZdwqadBzsmlUCTndEmib6ueoaiaxw4DXDDmZvxgb8ibSI2twDwa5UT96m8fpc9CaU0DCw/640?wx_fmt=png&amp;from=appmsg)


第 3 步：命令行终端里安装 Claude Code

（如果到这一步你就已经看不懂了，可以问一下元宝、豆包或者 deepseek）

**MacOS/Linux:**

```
curl -fsSL https://claude.ai/install.sh | bash
```

**Homebrew (MacOS):**

```
brew install --cask claude-code
```

**Windows:**

```
irm https://claude.ai/install.ps1 | iex
```

**NPM:**

```
npm install -g @anthropic-ai/claude-code
```

第 4 步：修改 Claude Code 的配置文件

很多同学是安装好之后直接运行 claude 命令，然后发现要注册登录很懵逼，这里其实可以通过修改环境变量的方式绕过登录，直接使用指定的大模型。

用代码编辑器（推荐 vscode 或 cursor）打开以下文件，没有的话就创建一个。

```
~/.claude/settings.json
```

文件中写入以下内容，将下面的  your-api-key-here 替换成 上面创建的令牌密钥。

```
{  "env": {    "ANTHROPIC_AUTH_TOKEN": "your-api-key-here",    "ANTHROPIC_BASE_URL": "https://www.packyapi.com",    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"  },  "permissions": {    "defaultMode": "bypassPermissions"  }}
```


注意： bypassPermissions 是 Claude Code 的放飞自我模式（YOLO mode），执行任何命令都不会再和用户确认，很爽但也危险，请自行判断是否去掉（我自己是一直打开：）


第 5 步：执行命令 claude 开始体验。


如果你不是程序员，不懂代码，没关系，直接和 claude 聊你的想法，它能帮你把产品一步步实现。


如果你希望按照标准软件开发流程来实现你的产品，可以继续安装使用微软的 spec-kit 工具。



https://github.com/github/spec-kit?tab=readme-ov-file


不会安装？现在你已经拥有 Claude Code 了，把上面的链接和要求丢给它，它会帮你搞定剩下的一切。



提示：如果本文有看不懂的地方，还可以在评论区 @元宝 帮你解读：）

继续滑动看下一个

轻触阅读原文

![](http://mmbiz.qpic.cn/sz_mmbiz_png/cFWFibBpTbSecnvk38OLNQnaFrRGfQJ9z4gmwwvSYEM5pPT2kvYub9oMIWCibvHVABwRx4ib9ibP52TeiazE4Rm6umA/0?wx_fmt=png)

猫哥ai编程

向上滑动看下一个