## todo

[ ] 所有的数据库记录的自增 id 都从 1万开始
[ ] Agent 支持：无后端、纯客户端运行（用户自定义 API Key + Base URL）的  React Native 终极 Agent 技术组合 如下：
1. 终极组合架构 (Tech Stack)
UI 交互层：@assistant-ui/react-native

作用：负责打字机流式气泡、Tool Call（工具调用中/完成）状态展示、消息重发与开箱即用的现代化 Agent 界面。

Agent 编排与 ReAct 引擎：ai (Vercel AI SDK) + @ai-sdk/openai

作用：负责解析用户 API Key/URL、流式传输（Streaming）、处理 Tool Call 循环 (maxSteps) 以及驱动本地 RN 原生 API 执行。

数据校验：zod

作用：用于在前端强类型定义 Agent 工具（Tools）的输入/输出参数格式。

环境兼容层：react-native-polyfill-globals

作用：补全 RN JS 引擎缺失的 fetch / ReadableStream / TextEncoder，确保 Fetch 流式传输和流式 Fetch 不报错。

- [ ] ImagePicker已选图片，需要支持点击放大预览。提供一个 Image 、 Image.Preview 组件。
