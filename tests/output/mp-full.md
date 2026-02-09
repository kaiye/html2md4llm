![cover_image](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0Ric0z8ibMOgichRibSTyDliaia8KTORu3959kDVT7FoqG56nVR518fJSyGYctg/0?wx_fmt=jpeg)

# 编程大模型聪明度排名（最新评测）

Original 猫哥

上个月我用扣子平台搭了一个拍照解数独的微信小程序，无意中发现了一张神奇的测试图片， **当时所有的大模型都无法正确识别出来** 。

这让我对 AI 编程产生了强烈的质疑：简单的图片识别都会犯错，AI 写出来的代码还有可信度吗？

后来 Claude Sonnet 4 发布，居然识别正确，我感觉  **AI Coding 的“奇点时刻”已然到来** 。

今天我拿这张图片又测试了下市面上的顶尖大模型。厂家包括：OpenAI、Google、Claude、xAI、阿里、百度、腾讯、字节豆包、Deepseek、Kimi。

以下是各家大模型的详细测评，赶时间的朋友可以直接拉到最后看汇总表格。

## 测试题

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0RicjAIJfmj0WpbFsibuEAh8sB636aeYHo1fiaJsOnHaibNKZn4HIU8oTlZKw/640?wx_fmt=jpeg&amp;from=appmsg)

把这张数独棋盘转换成JSON格式的二维数组

## ChatGPT 4o

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0RicGWVco1B7R7XzDZNyTKCOtEibRO9j8GVCVHTX72oBABwxyE5PYQSQOAQ/640?wx_fmt=jpeg)

表现不错，只错了 1 个地方，把 1608 识别成了 16008。

## Kimi

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0RicHoVk94UB8onqnGHvMRO9zUPh8dOEibiaA4Pmq9cOYI87hgH55XcXhw8g/640?wx_fmt=jpeg&amp;from=appmsg)

没眼看，Kimi 错的非常离谱！每行都错！

## 阿里通义千问 Qwen3

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0RicXYAKx8buXfrBkC0LYTVA0sCWZke7CtEY1Xh0kkzyJIn5aM7ubrRwqw/640?wx_fmt=jpeg&amp;from=appmsg)

同上，错了 5 个位置，相当拉胯！

## 百度文心 4.5 Turbo

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0Ricicv2ib3ibV2lPGeVtas0tMwgwC7CF7Eaq7HHibNdJCDJz400yL92UHicuxw/640?wx_fmt=jpeg&amp;from=appmsg)

这哥们有点特立独行，不返回 0，返回 null，而且错了 6 个位置。

## DeepSeek-V3

![](https://mmbiz.qpic.cn/mmbiz_png/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0RicOvxgjGs7rgx2XeAgtWSZoFw8ex7vMzf8yNXdyXkaDH1hCkb33qg3Eg/640?wx_fmt=png&amp;from=appmsg)

最离谱的应该是 deepseek，9x9 被识别成了 7x7，完全不对！ 开启 R1 推理后，它会自作聪明的在每一行的结尾补充 2 个 0…

## 腾讯混元

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0Riccd3MsNCk6hcqgEy2CibicCkVdwV0f1RrumpiajAllbaUugbOxdXrEhS7g/640?wx_fmt=jpeg&amp;from=appmsg)

腾讯的混元大模型已经是国产中表现相对较好的了，错了 3 个位置。

## 豆包（最新，版本号未知）

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0Ric4iae7rSV7tkaJExyKicwZjS5w8icRzFmkpRkEhtXb2ic27r5UhXF3miabWg/640?wx_fmt=jpeg&amp;from=appmsg)

豆包真的是国产之光，竟然解对了，速度也是飞快！

## 豆包·视觉理解·Pro·1.5


![](https://mmbiz.qpic.cn/mmbiz_png/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0RicPAosYoz67PJQTeNw1ib2ItvWRP0WqbibFQMZVib9pX3oiaNT68aHYkV9ibQ/640?wx_fmt=png&amp;from=appmsg)


但扣子平台上提供给开发者的豆包大模型，表现不行，错了 3 个。

## ChatGPT o3

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0Ric7ria4wVq5JXRoHavNeKX0yWicCxdatbNdPXiaOD5cF5iccq3iakq1czNWKw/640?wx_fmt=jpeg)

o3 对是对了，但推理时长居然长达 7 分 5 秒，速度比 3 岁小孩还慢。

## Grok-3

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0Ric23Ok6uQfBXCPmAfkicNiaeU4nmneaUEwRYBGbIl593lpIkKFxfb1fwTQ/640?wx_fmt=jpeg&amp;from=appmsg)


马斯克家的 Grok-3 和 GPT-4o 一样，错了 1 个，且位置相同（🐶）。

## Gemini-2.5-Pro

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0RicFTdSAZu0rLReLXJ8MB1Odpclpj9ibYT4NiaXE9q7YaXnxUicmtQ0Rj7QQ/640?wx_fmt=jpeg&amp;from=appmsg)


Google 家的表现中规中矩，错了 2 个。

## Claude Sonnet 4

![](https://mmbiz.qpic.cn/mmbiz_jpg/csq5yXgaUWtxLsVyxEXoG4IVHicFAm0RiciaicWCicicqz07lsAiahicF2Goone083JibFMlBJDpsJZcxiauvice4nTPdZs1A/640?wx_fmt=jpeg&amp;from=appmsg)

果然 Claude 4 都答对了（包括 Sonnet 4 和 Opus 4），但我多试了几次，发现有时候也会答错。

所以， **可能上面那些答错的 LLM，也有一定几率能答对。**

## 大模型聪明度排名

| 排名 | 模型名称 | 错误数量 | 特殊说明 | 聪明度评级 |
| --- | --- | --- | --- | --- |
| 🥇 | 豆包（最新未知版本） | 0 | 完全正确，速度快，国产之光 | ⭐⭐⭐⭐⭐ |
| 🥈 | Claude Sonnet 4 | 0 | 完全正确，但偶尔也会错 | ⭐⭐⭐⭐⭐ |
| 🥉 | ChatGPT o3 | 0 | 正确，但推理时间长达7分5秒 | ⭐⭐⭐⭐ |
| 4 | ChatGPT 4o | 1 | 把1608识别成了16008 | ⭐⭐⭐⭐ |
| 4 | Grok-3 | 1 | 同上 | ⭐⭐⭐⭐ |
| 6 | Gemini-2.5-Pro | 2 | 错误较少 | ⭐⭐⭐ |
| 7 | 腾讯混元 | 3 | 国产中表现相对较好 | ⭐⭐⭐ |
| 7 | 豆包·视觉理解·Pro·1.5 | 3 | 扣子平台开发者版本 | ⭐⭐⭐ |
| 9 | 阿里通义千问 Qwen3 | 5 | 表现不佳 | ⭐⭐ |
| 10 | 百度文心 4.5 Turbo | 6 | 表现较差 | ⭐⭐ |
| 11 | Kimi | 多处错误 | 很离谱，每行都错 | ⭐ |
| 12 | DeepSeek-V3 | 严重错误 | 完全不对，9x9识别成7x7 | ⭐ |

综上，我的个人建议是：当前 AI 编程使用相对聪明一些的大模型，因为 **代码世界里没有"差不多先生"，一个字符的错误就能让整个程序世界，彻底崩溃** 。特别说明：本次测试仅针对前文提到的数独棋盘的图片识别，不够全面严谨，仅供参考。



继续滑动看下一个

轻触阅读原文

![](http://mmbiz.qpic.cn/mmbiz_png/csq5yXgaUWuc8lGabpq1MB203RgxsfLeS3wMcTgxEVYcgKf1ICYtM5tXI8HBPIibAGwTYDL1dak77e0paa53jsw/0?wx_fmt=png)

前端培训

向上滑动看下一个