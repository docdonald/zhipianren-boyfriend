# 纸片人男友 (Paper Boyfriend)

情感陪伴型 AI 角色扮演系统。4 个平行世界男性角色，专属对话、长期陪伴。

> 完整产品规范见 [SPEC.md](./SPEC.md)

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 ARK_API_KEY（火山方舟，与图像生成共享 Key）

# 3. 启动开发服务
pnpm dev

# 4. 访问
open http://localhost:3000
```

## 技术栈

- Next.js 14 (App Router) + React 18 + TypeScript (strict)
- Tailwind CSS
- LLM：火山方舟 Doubao-Seed-Character（角色扮演专用，OpenAI 兼容）
- Vercel 部署

## 4 角色

| ID | 角色 | 张力 | 语言指纹 |
| --- | --- | --- | --- |
| `lin-xu-bai` | 林叙白 | 温柔刺客 | 省略号钩子 |
| `zhou-mu` | 周牧野 | 失控秩序 | 句号控制 |
| `jiang-yu` | 江屿 | 资源守恒 | 无标点算力 |
| `xia-ye` | 夏野 | 逃避阳光 | 感叹号断电 |

详细人设：[data/personas/](./data/personas/)；完整 skill：[.trae/skills/](./.trae/skills/)

## 项目结构

```
app/
  page.tsx                              # 选角页
  api/chat/route.ts                     # DeepSeek 流式 API
  characters/[id]/chat/                 # 1对1 聊天
components/
  CharacterCard.tsx
  ChatBubble.tsx
  ChatInput.tsx
lib/
  ai/
    characters.ts                       # 4 角色注册表
    types.ts                            # 共享类型
    prompts.ts                          # prompt 入口
    deepseek.ts                         # LLM 客户端（Doubao-Seed-Character，OpenAI 兼容）
    <characterId>/prompt.ts             # 单角色 prompt
                                        # （对话历史已迁移到服务端 DB）
data/
  personas/<characterId>.md             # 人设源文件
```

## MVP 范围

✅ 4 角色选角 + 流式对话
⏳ 账号/TTS/邮件推送/亲密度框架/图像 — V2

## 部署

```bash
# Vercel CLI 部署
pnpm i -g vercel
vercel
# 设置环境变量：ARK_API_KEY、SEEDREAM_API_KEY（火山方舟共用）、RESEND_API_KEY、VOLCENGINE_*、Turso、CRON_SECRET
```
