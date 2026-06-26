# DeepSeek Chat Assistant

基于 DeepSeek 大模型的智能聊天助手系统，使用 Next.js 14 构建。

## 功能特性

- ✨ 流式响应：实时逐字显示 AI 回复
- 💬 多轮对话：维护完整的对话上下文
- 📱 响应式设计：支持桌面端和移动端
- 🔒 安全可靠：API 密钥在服务器端安全管理
- ⚡ 高性能：基于 Next.js 14 App Router

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI 服务**: DeepSeek API
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入你的 DeepSeek API 密钥：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

获取 API 密钥：https://platform.deepseek.com/api_keys

### 3. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm run start
```

## 项目结构

```
.
├── app/                  # Next.js App Router 应用目录
│   ├── api/             # API 路由
│   ├── layout.tsx       # 根布局
│   ├── page.tsx         # 主页面
│   └── globals.css      # 全局样式
├── components/          # React 组件
├── lib/                 # 工具函数
├── types/              # TypeScript 类型定义
├── .env.local          # 环境变量（本地，不提交到 git）
└── .env.example        # 环境变量示例
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 在 Vercel 项目设置中添加环境变量 `DEEPSEEK_API_KEY`
4. 部署完成

## 开发路线图

- [x] 项目初始化和环境配置
- [ ] 实现 API 路由和流式响应
- [ ] 开发前端聊天界面
- [ ] 添加错误处理
- [ ] 实现响应式设计
- [ ] 优化性能和用户体验
- [ ] 部署到生产环境

## License

ISC
