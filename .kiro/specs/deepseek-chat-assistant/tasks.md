# Implementation Plan: DeepSeek 聊天助手

## Overview

本实现计划将 DeepSeek 聊天助手系统分解为可执行的开发任务。实现基于 Next.js 14 App Router 架构，使用 TypeScript 开发，部署在 Vercel 平台。

实现策略采用渐进式开发方法：
1. 首先搭建项目基础结构和配置
2. 实现核心 API 路由处理流式响应
3. 开发前端组件和状态管理
4. 集成完整的错误处理机制
5. 添加响应式设计和优化

每个任务都包含具体的实现目标、相关需求引用和验收标准，确保实现的完整性和可追溯性。

## Tasks

- [x] 1. 初始化 Next.js 项目并配置开发环境
  - 使用 `create-next-app` 创建 Next.js 14+ 项目，启用 TypeScript 和 App Router
  - 配置 `.env.local` 文件，添加 `DEEPSEEK_API_KEY` 环境变量
  - 创建项目目录结构：`app/`、`components/`、`lib/`、`types/`
  - 配置 `tsconfig.json` 启用严格类型检查
  - 安装必要依赖（无需额外 HTTP 库，使用原生 fetch API）
  - _需求: 7.1, 7.2, 7.3, 6.1, 6.2_

- [x] 2. 定义核心数据模型和类型
  - [x] 2.1 创建 TypeScript 类型定义文件 `types/chat.ts`
    - 定义 `Message` 接口（role、content、timestamp、id）
    - 定义 `ChatState` 接口（messages、streamingContent、isLoading、error、isStreaming）
    - 定义 `APIError` 接口（statusCode、message、type、originalError）
    - 定义 `StreamChunk` 接口（delta、isDone、finishReason）
    - 定义 `DeepSeekChatRequest` 和 `DeepSeekChatResponse` 接口
    - _需求: 1.2, 2.1, 3.1, 4.1, 9.1, 9.2_

  - [ ]* 2.2 编写单元测试验证类型定义
    - 测试类型约束是否正确（role 枚举、必填字段等）
    - 测试类型兼容性（Message 是否可赋值给 DeepSeek API 格式）
    - _需求: 7.3_

- [ ] 3. 实现工具函数和验证逻辑
  - [ ] 3.1 创建 `lib/validation.ts` 实现输入验证
    - 实现 `validateUserInput(input: string)` 函数
    - 验证规则：非空、非纯空格、长度不超过 4000 字符
    - 返回 `{ valid: boolean, error?: string }` 格式
    - _需求: 1.4, 10.1_

  - [ ]* 3.2 编写 validateUserInput 的单元测试
    - 测试空字符串、纯空格、超长消息、有效消息场景
    - _需求: 1.4_

  - [ ] 3.3 创建 `lib/stream-parser.ts` 实现流式数据解析
    - 实现 `parseStreamChunk(rawData: string): StreamChunk | null` 函数
    - 解析 DeepSeek API 返回的 SSE 格式数据
    - 处理 `[DONE]` 结束标记和 JSON 解析错误
    - _需求: 2.2, 4.1_

  - [ ]* 3.4 编写 parseStreamChunk 的单元测试
    - 测试正常内容块、[DONE] 标记、格式错误数据、空增量内容场景
    - _需求: 4.4_

  - [x] 3.5 创建 `lib/error-handler.ts` 实现错误分类
    - 实现 `classifyAPIError(statusCode: number, message: string): APIError` 函数
    - 映射 HTTP 状态码到错误类型（auth、rate_limit、server、network、unknown）
    - 生成用户友好的错误提示消息
    - _需求: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 3.6 编写 classifyAPIError 的单元测试
    - 测试 401、429、5xx 状态码和网络错误的分类
    - 验证错误消息的正确性
    - _需求: 10.1, 10.2, 10.3, 10.4_

- [~] 4. Checkpoint - 验证基础设施
  - 确保所有测试通过，类型定义和工具函数正确实现
  - 验证环境变量配置正确（DEEPSEEK_API_KEY 已设置）
  - 询问用户是否有疑问

- [x] 5. 实现 API 路由处理 DeepSeek 流式响应
  - [x] 5.1 创建 `app/api/chat/route.ts` 实现 POST 端点
    - 定义 `POST` 函数导出为 Next.js API 路由
    - 解析请求体获取 `messages` 数组
    - 验证请求格式（messages 必须是非空数组）
    - 如果验证失败，返回 400 错误响应
    - _需求: 1.2, 2.1, 7.4, 9.1_

  - [x] 5.2 实现 DeepSeek API 调用逻辑
    - 从环境变量读取 `DEEPSEEK_API_KEY`
    - 如果密钥不存在，返回 500 错误响应
    - 构造 DeepSeek API 请求（端点、headers、body）
    - 设置 `stream: true` 启用流式响应
    - 使用 `AbortSignal.timeout(30000)` 设置 30 秒超时
    - _需求: 2.1, 6.1, 6.2, 6.4_

  - [x] 5.3 实现流式响应转发逻辑
    - 创建 `ReadableStream` 读取 DeepSeek API 响应体
    - 使用 `TextDecoder` 解码流式数据块
    - 将每个数据块以 SSE 格式发送到客户端（`data: {json}\n\n`）
    - 处理流结束和错误情况，关闭 stream controller
    - 返回响应，设置 headers（Content-Type: text/event-stream, Cache-Control: no-cache）
    - _需求: 2.2, 4.1, 4.2_

  - [x] 5.4 实现 API 路由错误处理
    - 捕获网络错误（fetch 失败、超时）
    - 捕获 DeepSeek API 错误（401、429、5xx）
    - 使用 `classifyAPIError` 分类错误
    - 返回统一格式的错误响应 `{ error: string, code?: string }`
    - _需求: 2.4, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 5.5 编写 API 路由集成测试
    - 使用 MSW 模拟 DeepSeek API
    - 测试成功流式响应场景
    - 测试 401、429、500 错误场景
    - 测试空消息列表和无效请求格式
    - _需求: 2.1, 2.4, 10.2, 10.3_

- [x] 6. 实现前端组件 - MessageInput
  - [x] 6.1 创建 `components/MessageInput.tsx`
    - 定义 `MessageInputProps` 接口（onSend、disabled、placeholder）
    - 实现受控输入框组件（使用 useState 管理输入值）
    - 实现发送按钮，点击时调用 `onSend` 并清空输入框
    - 实现回车键发送逻辑（Shift+回车换行，回车发送）
    - 根据 `disabled` 和输入是否为空控制按钮状态
    - _需求: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 6.2 编写 MessageInput 组件测试
    - 测试输入为空时禁用发送按钮
    - 测试输入非空时启用发送按钮
    - 测试回车键触发发送
    - 测试发送后清空输入框
    - 测试 disabled 属性正确禁用输入
    - _需求: 1.1, 1.2, 1.3, 1.4_

- [x] 7. 实现前端组件 - MessageList
  - [x] 7.1 创建 `components/MessageList.tsx`
    - 定义 `MessageListProps` 接口（messages、streamingContent、isStreaming）
    - 渲染消息列表，遍历 `messages` 数组
    - 使用不同样式区分 user 和 assistant 消息（右对齐蓝色 vs 左对齐灰色）
    - 如果 `isStreaming` 为 true，显示流式内容和加载指示器
    - 实现自动滚动到最新消息（使用 `useEffect` 和 `scrollIntoView`）
    - _需求: 3.1, 3.2, 3.3, 3.4, 4.2, 4.3_

  - [ ]* 7.2 编写 MessageList 组件测试
    - 测试渲染所有消息
    - 测试区分用户和助手消息样式
    - 测试显示流式内容
    - 测试流式传输时显示加载指示器
    - _需求: 3.1, 3.2, 4.2, 4.3_

- [x] 8. 实现前端组件 - ErrorMessage
  - [x] 8.1 创建 `components/ErrorMessage.tsx`
    - 定义 `ErrorMessageProps` 接口（message、onClose、type）
    - 实现错误提示组件，显示错误消息和关闭按钮
    - 根据 `type` 应用不同样式（error 红色、warning 黄色、info 蓝色）
    - 点击关闭按钮调用 `onClose` 回调
    - _需求: 2.4, 10.1, 10.2, 10.3, 10.4_

  - [ ]* 8.2 编写 ErrorMessage 组件测试
    - 测试显示错误消息
    - 测试关闭按钮功能
    - 测试不同 type 的样式应用
    - _需求: 10.1_

- [~] 9. Checkpoint - 验证组件实现
  - 确保所有组件单元测试通过
  - 验证组件的 props 类型定义正确
  - 询问用户是否有疑问

- [x] 10. 实现主页面组件和状态管理
  - [x] 10.1 创建 `app/page.tsx` 主聊天界面
    - 定义 `ChatState` 状态（使用 useState）
    - 初始化状态：messages 为空数组，isLoading 和 isStreaming 为 false，error 为 null
    - 导入并渲染 MessageList、MessageInput、ErrorMessage 组件
    - 传递正确的 props 到子组件
    - _需求: 3.1, 9.2_

  - [x] 10.2 实现 handleSendMessage 函数
    - 使用 `validateUserInput` 验证输入
    - 如果验证失败，设置 error 状态并返回
    - 创建用户消息对象并添加到 messages 状态
    - 设置 `isLoading` 为 true，禁用输入
    - 调用 `/api/chat` 端点，传递完整 messages 数组
    - 如果请求失败，调用错误处理逻辑
    - _需求: 1.2, 1.3, 2.1, 9.1, 10.1_

  - [x] 10.3 实现 handleStreamResponse 函数
    - 获取响应体的 ReadableStream reader
    - 使用 TextDecoder 解码数据块
    - 循环读取数据块，调用 `parseStreamChunk` 解析
    - 将解析的 delta 追加到 `streamingContent` 状态
    - 如果 `isDone` 为 true，将完整内容添加到 messages 并清空 streamingContent
    - 设置 `isStreaming` 状态控制加载指示器显示
    - 处理流中断错误，设置 error 状态
    - _需求: 2.2, 2.3, 4.1, 4.2, 4.3, 4.4_

  - [x] 10.4 实现错误处理逻辑
    - 定义 `handleAPIError` 函数处理不同类型错误
    - 使用 `classifyAPIError` 分类错误
    - 根据错误类型设置相应的用户提示消息
    - 设置 `isLoading` 和 `isStreaming` 为 false，重新启用输入
    - _需求: 2.4, 10.1, 10.2, 10.3, 10.4_

  - [x] 10.5 实现 clearError 和辅助函数
    - 实现 `clearError` 函数清空 error 状态
    - 实现 `addMessage` 函数添加消息到历史
    - 确保时间戳和 ID 正确生成
    - _需求: 3.1, 9.2_

  - [ ]* 10.6 编写端到端测试验证完整流程
    - 使用 Playwright 或 Cypress 测试完整对话流程
    - 测试多轮对话功能
    - 测试网络错误场景下的错误提示
    - _需求: 1.2, 2.2, 2.3, 10.1_

- [x] 11. 实现响应式设计
  - [x] 11.1 添加 CSS 样式实现响应式布局
    - 创建 `app/globals.css` 或使用 Tailwind CSS
    - 定义移动端布局样式（视口宽度 < 768px）
    - 定义桌面端布局样式（视口宽度 >= 768px）
    - 使用 flexbox 或 grid 布局自适应消息区域和输入区域
    - 确保消息列表在不同屏幕尺寸下可滚动
    - _需求: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 11.2 编写响应式布局测试
    - 测试移动端布局（375x667 视口）
    - 测试桌面端布局（1920x1080 视口）
    - 验证布局切换正确应用
    - _需求: 5.1, 5.2_

- [x] 12. 配置 Vercel 部署
  - [x] 12.1 创建 `vercel.json` 配置文件
    - 配置构建设置（buildCommand、outputDirectory）
    - 配置环境变量引用（DEEPSEEK_API_KEY）
    - 配置路由规则（如需要）
    - _需求: 8.1, 8.4_

  - [x] 12.2 配置项目环境变量
    - 在 Vercel 项目设置中添加 `DEEPSEEK_API_KEY`
    - 验证环境变量在部署后正确读取
    - 测试部署后的应用功能
    - _需求: 6.2, 8.2, 8.3_

- [x] 13. 优化和最终验证
  - [x] 13.1 性能优化
    - 优化流式响应更新频率（使用 requestAnimationFrame 或节流）
    - 优化消息列表渲染性能（使用 React.memo 或虚拟滚动）
    - 确保首次响应时间符合性能需求（< 1 秒）
    - _需求: 4.1, 性能需求 1, 性能需求 2_

  - [x] 13.2 可用性改进
    - 添加清晰的加载状态指示器
    - 优化交互反馈（按钮点击、输入焦点状态）
    - 确保键盘导航和无障碍访问
    - _需求: 可用性需求 1, 可用性需求 2_

  - [x] 13.3 安全性检查
    - 验证 API 密钥不会暴露到客户端
    - 验证用户输入清理和验证逻辑
    - 检查 CSP 和其他安全 headers 配置
    - _需求: 6.4, 安全性需求 1, 安全性需求 2_

  - [ ]* 13.4 编写集成测试验证所有功能
    - 测试完整的发送-接收流程
    - 测试错误处理和恢复机制
    - 测试会话状态管理
    - _需求: 1.2, 2.1, 2.2, 2.3, 9.1, 9.4_

- [~] 14. Final Checkpoint - 最终验证
  - 运行所有测试套件，确保全部通过
  - 在本地环境测试完整用户流程
  - 部署到 Vercel 并验证生产环境功能
  - 询问用户是否有其他需求或疑问

## Notes

- 任务标记 `*` 的为可选测试任务，可根据项目时间表跳过以加快 MVP 开发
- 每个任务都明确引用了相关需求编号，确保实现的可追溯性
- Checkpoint 任务用于阶段性验证和用户沟通，确保实现方向正确
- 核心实现任务（非测试）必须完成，不可跳过
- 流式响应实现是系统核心功能，需重点关注性能和用户体验
- 环境变量配置在开发和部署阶段都需验证，确保安全性

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2"]
    },
    {
      "id": 2,
      "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6"]
    },
    {
      "id": 3,
      "tasks": ["5.1"]
    },
    {
      "id": 4,
      "tasks": ["5.2", "5.3"]
    },
    {
      "id": 5,
      "tasks": ["5.4", "5.5", "6.1", "6.2", "7.1", "7.2", "8.1", "8.2"]
    },
    {
      "id": 6,
      "tasks": ["10.1"]
    },
    {
      "id": 7,
      "tasks": ["10.2", "10.3", "10.4", "10.5"]
    },
    {
      "id": 8,
      "tasks": ["10.6", "11.1", "11.2"]
    },
    {
      "id": 9,
      "tasks": ["12.1", "12.2"]
    },
    {
      "id": 10,
      "tasks": ["13.1", "13.2", "13.3", "13.4"]
    }
  ]
}
```
