# Next.js + Supabase on Vercel（路线 1）步骤清单

## 当前模式：公共读（不隔离）
- 读取：`notes` 表公共读取（示例 RLS 允许 `select using (true)`），多用户看到相同数据。
- 写入/删除：需登录（`authenticated` 策略允许 insert/delete），未登录不可写/删。
- 页面访问：`/notes`、`/protected` 需登录；`/api/*` 免登录（middleware 已排除 `api`）。
- Realtime：订阅全表 `notes` 变更，任意变更会触发页面刷新。
- 多租户隔离：未启用；如需启用，见文末“多租户（按用户隔离，当前未启用，可选）”。

> 目标：快速跑通官方 with-supabase 示例，本地验证 API 与 Auth，部署到 Vercel。

## 0) 选择路线
- 选项：1 — Next.js + Supabase。

## 1) 全局准备
- 账号：GitHub、Vercel、Supabase 可用。
- 版本检查：
  - `node -v`（18.17+，建议 LTS）
  - `npm -v`
  - `git --version`
  - `vercel --version`（无则：`npm i -g vercel && vercel login`）

## 2) 初始化项目
- 在工作目录下执行（联网）：
  - `npx create-next-app@latest app-with-supabase --example with-supabase --use-npm`
- 进入目录：
  - `cd app-with-supabase`

## 3) 本地增强（便于验证）
- 新增 API 路由：`app/api/ping/route.ts`
  - 内容（TypeScript）：
    ```ts
    import { NextResponse } from 'next/server'
    export const runtime = 'nodejs'
    export function GET() { return NextResponse.json({ ok: true, message: 'pong' }) }
    ```
- 新增环境变量示例：`.env.local.example`
  - `NEXT_PUBLIC_SUPABASE_URL=your-project-url`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key`

## 4) 本地验证 /api/ping
- 启动：`npm run dev`
- 另开终端验证：`curl -i http://localhost:3000/api/ping`
  - 预期：`HTTP/1.1 200 OK` 且 body 为 `{"ok":true,"message":"pong"}`

## 5) 配置 Supabase（浏览器）
- 控制台：Supabase → New project → 选择区域 → Create。
- 复制变量：Project → Settings → API
  - Project URL → `.env.local` 的 `NEXT_PUBLIC_SUPABASE_URL`
  - `anon`/`publishable` key → `.env.local` 的 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- 本地创建并填写环境变量：
  - `cp .env.local.example .env.local`（将上述值填入）
- 可选便捷设置（本地开发更顺畅）：
  - Authentication → Providers → Email：关闭 “Confirm email”。
  - Authentication → URL Configuration：Site URL 设为 `http://localhost:3000`。

## 6) 本地验证 Auth
- 启动：`npm run dev`
- 打开浏览器访问：`http://localhost:3000`
  - 进入 Sign up（或 `/auth/sign-up`）注册；登录成功后访问 `/protected` 应可查看用户信息。
  - 未登录访问 `/protected` 应被重定向到 `/auth/login`。

## 7) 部署到 Vercel（二选一）
- 方式 A：GitHub 导入（推荐持续部署）
  - 初始化并推送代码：
    - `git init && git add . && git commit -m "init: with-supabase"`
    - 在 GitHub 创建空仓库，然后：
    - `git remote add origin <your-github-repo-url>`
    - `git branch -M main && git push -u origin main`
  - Vercel Dashboard → New Project → Import Git Repository。
  - 配置环境变量（Preview 和 Production 环境均需）：
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
  - Deploy。

- 方式 B：Vercel CLI 直接部署
  - 登录：`vercel login`
  - 在项目根目录：`vercel`（按提示创建/链接项目）
  - 添加环境变量（分别添加到 Preview/Production）：
    - `vercel env add NEXT_PUBLIC_SUPABASE_URL`
    - `vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
  - 生产部署：`vercel deploy --prod`

## 8) 部署后检查
- 访问：`https://<your-deployed-domain>/api/ping` → 期望 200 与 `{"ok":true,"message":"pong"}`。
- 打开站点验证登录/注册与 `/protected` 页面访问。

## 9) 常见问题与修正
- 登录/注册失败：确认已在 Supabase 设置正确 URL 与是否关闭 Email Confirm（或配置 SMTP）。
- 401/重定向异常：检查 `middleware.ts` 与 `.env` 是否在 Vercel 正确配置，重新部署。
- 缺少环境变量：本地 `.env.local` 与 Vercel 环境变量需同时配置；修改后需重启/重部署。

## 10) 进度记录（实时）
- 已完成：环境检查、项目初始化、/api/ping 路由、新增 .env.local.example。
- Supabase 环境变量：已配置到本地 `.env.local`。
- 本地验证结果：
  - 初次验证：
    - `/` → 200（dev server 正常）
    - `/api/ping` → 307 重定向到 `/auth/login`（中间件对未登录重定向）
  - 修正：在 `middleware.ts` 的 `config.matcher` 中排除 `api` 前缀：
    - 从 `"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"`
    - 改为 `"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"`
  - 二次验证：
    - `/api/ping` → 200 + `{ ok: true, message: 'pong' }`
    - `/protected` → 307 → `Location: /auth/login`（符合预期）
    - `/auth/login` → 200（页面可访问）

### 部署（Vercel CLI，方式 B）
- 登录状态：`vercel whoami` → 已登录（zhengfengomega-3325）。
- 项目链接：`vercel link --project app-with-supabase --yes` → 成功（生成 `.vercel/`）。
- 环境变量添加：
  - `NEXT_PUBLIC_SUPABASE_URL`（preview, production）
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`（preview, production）
- 生产部署（最新优先）：
  - 最新：`vercel deploy --prod --yes` → `https://app-with-supabase-8myb6k7ke-zhengfengs-projects-b6cdf769.vercel.app`
  - 历史：`https://app-with-supabase-mrupfjo97-zhengfengs-projects-b6cdf769.vercel.app`、`https://app-with-supabase-7v3oe9g26-zhengfengs-projects-b6cdf769.vercel.app`、`https://app-with-supabase-9m2fwpve9-zhengfengs-projects-b6cdf769.vercel.app`
- 备注：如遇 401（Deployment Protection），在 Vercel 控制台打开该部署即可自动设置 bypass，或在项目 Settings 关闭保护。

### 数据展示与写入（主路径）
- Supabase：已建表并插入示例数据（notes）。RLS：已启用，并添加公开读取策略（示例）。
- Next.js：新增页面 `/notes`（Server Component），并在同页加入 Server Action 插入和删除 note：
  - 文件：`app/notes/page.tsx`
  - 读取：`supabase.from('notes').select('id,title').order('id', { ascending: false })`
  - 写入：`await supabase.from('notes').insert({ title })` + `revalidatePath('/notes')`
  - 删除：`await supabase.from('notes').delete().eq('id', id)` + `revalidatePath('/notes')`
- Realtime 刷新：新增 `components/notes-live.tsx` 客户端订阅 Postgres 变更，变更时 `router.refresh()` 以实时刷新页面。
- 提示：如插入失败（RLS 拦截），在 Supabase 执行：
  ```sql
  create policy "Allow authenticated insert" on notes
  for insert to authenticated
  with check (true);
  ```
  如删除失败（RLS 拦截），在 Supabase 执行：
  ```sql
  create policy "Allow authenticated delete" on notes
  for delete to authenticated
  using (true);
  ```

### Notes 创建时间列
- 数据库：在 `notes` 表增加创建时间列，并为既有数据填充（到分钟展示即可）：
  ```sql
  alter table notes add column if not exists created_at timestamptz not null default now();
  -- 可选：如果历史数据存在 NULL（旧库），执行一次填充
  update notes set created_at = now() where created_at is null;
  ```
- 应用：`/notes` 已展示“Created”列，按 `created_at desc, id desc` 排序；时间格式 `YYYY-MM-DD HH:MM`（本地时区）。
-- 应用：`/notes` 已展示“Created”列，按 `created_at desc, id desc` 排序；时间格式 `YYYY-MM-DD HH:MM`（固定 UTC+8）。
- 应用：`/notes` 已展示“Created”列，按 `created_at desc, id desc` 排序；时间格式 `YYYY/MM/DD HH:mm`（默认，固定 UTC+8）。

### Notes 时间显示选项
- 新增切换：绝对时间（YYYY/MM/DD HH:mm, UTC+8）与相对时间（如“5分钟前/3小时前/2天前”）。
- 实现：客户端组件 `components/notes-table.tsx`，按钮切换，不影响服务端查询与 Server Action。

### 删除失败（RLS）处理
- 若删除失败，请在 Supabase 执行：
  ```sql
  create policy "Allow authenticated delete" on notes
  for delete to authenticated
  using (true);
  ```
  如需更严谨的按用户隔离：为表新增 `user_id uuid default auth.uid()`，并将 insert/delete/select 策略限定为 `user_id = auth.uid()`。

### 多租户（按用户隔离，当前未启用，可选）
- 目标：每个用户只能看到/修改自己的 notes。
- SQL（Supabase → SQL Editor）：
  ```sql
  -- 1) 移除公共读取策略（若之前按教程添加过）
  drop policy if exists "Allow public read access" on notes;

  -- 2) 列：为 notes 增加 user_id（已有则跳过）
  alter table notes add column if not exists user_id uuid not null default auth.uid();

  -- 3) 开启 RLS（若未开启）
  alter table notes enable row level security;

  -- 4) 最小策略：仅允许本人读/写/删
  create policy if not exists "Read own notes" on notes
  for select to authenticated
  using (user_id = auth.uid());

  create policy if not exists "Insert own notes" on notes
  for insert to authenticated
  with check (user_id = auth.uid());

  create policy if not exists "Delete own notes" on notes
  for delete to authenticated
  using (user_id = auth.uid());

  -- 5) 权限（如需要）
  grant select, insert, update, delete on table notes to authenticated;
  grant usage, select on sequence notes_id_seq to authenticated;
  ```
- 既有数据：没有 `user_id` 的旧记录将不可见。可选择删除旧记录，或到 Auth → Users 复制某个用户的 UUID 后定向归属：
  ```sql
  update notes set user_id = '<某用户的 UUID>' where user_id is null;
  ```
- Realtime：当前订阅全表 `notes` 的变更以简化演示；如启用多租户，可将订阅改为按 `user_id=eq.<uid>` 过滤。
### 受保护页精简
- `app/protected/page.tsx`：使用 `supabase.auth.getUser()`，展示登录邮箱与快捷链接；移除教程“Next steps”和冗长的 claims 输出。

### 导航打开方式
- 站内导航及首页快捷链接（Notes/Protected/Ping/Edge）均使用 `target="_blank" rel="noopener noreferrer"`，新标签打开。

### 登录页刷新修复
- 问题：登录后不跳转，需要手动刷新才反映登录态。
- 修复：`components/login-form.tsx` 登录成功后先 `router.refresh()` 再 `router.replace('/protected')`，确保服务端会话生效并导航到受保护页。

### 退出后导航仍显示用户（修复）
- 问题：登出后右上角仍显示邮箱，需刷新才更新。
- 修复：`components/logout-button.tsx` 登出后 `router.refresh()` + `router.replace('/auth/login')`，强制刷新服务端布局与导航。

### 受保护页面重复导航（修复）
- 问题：`app/protected/layout.tsx` 自带一套导航/页脚，和全局导航重复。
- 修复：精简为仅渲染 `children`，统一使用全局导航与页脚。

### 导航与可用性
- 全站导航：在 `app/layout.tsx` 引入 `components/site-nav.tsx`，为所有页面提供导航：
  - 链接：`/`（Home）、`/notes`、`/protected`、`/api/ping`、`/api/edge-time`
  - 右侧：登录/登出（AuthButton）与主题切换（ThemeSwitcher）
- 首页：保留教程引导模块，移除页内重复导航，避免与全站导航重复。

### Edge API 能力
- 新增 Edge 路由：`app/api/edge-time/route.ts`
  - `export const runtime = 'edge'`
  - 返回 `{ runtime: 'edge', now: <ISO> }`
- 访问：`/api/edge-time`（免登录，因 middleware 已排除 `api` 前缀）

### 首页“Next steps”精简
- 根据当前状态动态渲染：
  - 未配置 env → 显示 `ConnectSupabaseSteps`
  - 已配置 env 且已登录 → 显示快捷链接（Notes/Protected/Ping/Edge），隐藏“注册首个用户/Redirect URLs”提示
  - 已配置 env 未登录 → 显示 `SignUpUserSteps`
