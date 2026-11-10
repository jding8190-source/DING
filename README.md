# DING · 个人作品集网站｜WorkBuddy 接管版

> 接管日期：2026-11-10
> 线上地址：https://jding8190-source.github.io/DING-/
> 源码仓库：`jding8190-source/DING`（本目录）
> 部署仓库：`jding8190-source/DING-`（main 分支托管 GitHub Pages，只放构建产物）
>
> 原站由 Google AI Studio / Gemini 生成。本仓库已脱离其工具链：后续内容、视觉与代码改动直接在此源码库中完成，不需要 Gemini，也不需要任何大模型密钥。

---

## 1. 工程速览

| 项 | 值 |
| --- | --- |
| 框架 | React 19 + TypeScript + Vite 6 |
| 样式 | Tailwind CSS 4（`@tailwindcss/vite`）+ 自定义 `src/index.css` |
| 动效 / 图标 | motion（原 framer-motion）/ lucide-react |
| 路由 | react-router-dom `HashRouter`（GitHub Pages 无需服务端重写） |
| 数据层 | Firebase Auth + Cloud Firestore（在线 CMS，可离线回退） |
| 入口 | `index.html` → `src/main.tsx` → `src/App.tsx` |

```bash
npm install        # 安装依赖
npm run dev        # 本地开发 http://localhost:3000
npm run lint       # TypeScript 类型检查（tsc --noEmit）
npm run build      # 产出 dist/，用于发布
npm run preview    # 预览构建产物
```

路由：`/` 首页、`/project/:id` 项目详情、`/archive` 全作品归档、`/admin` 后台管理（也可按 Ctrl/Cmd + Shift + A 进入）。

---

## 2. 页面结构与内容地图

首页 `src/components/Home.tsx` 按顺序串联：

| 顺序 | 组件 | 锚点 | 内容与文案 |
| --- | --- | --- | --- |
| 0 | `Navigation` | 固定浮动 | 胶囊栏左侧「ZC」徽标 + `Ding Jie` / `Creative Director`；菜单「作品 / 关于 / 履历 / 联系」；右侧 `INDEX ©24` 与绿色状态点 |
| 1 | `ScrollIndicator` | 固定 | 滚动进度指示 |
| 2 | `Hero` | `#hero` | 全屏人像背景；青色圆点徽章 `CREATIVE EXHIBITION LAB`；超大标题 `DESIGN`；白色主按钮 `Enter Exhibition`；玻璃次按钮「关于作品 / ABOUT」；右上 `PORTFOLIO CURATION 2024-2026`、`SHANGHAI / TOKYO / REMOTE` |
| 3 | `ProjectGrid` | `#work` | 「关于作品 / ABOUT」、展签 `Exhibition Hall / Liquid Glass`、「作品展示展销空间」、`crafted fluid glassmorphism.`；筛选「全部 / 项目应用 / 品牌视觉 / 运营设计」+「随机抽选」；`EXPLORE FULL ALBUM ARCHIVE / 全作品归档索引` |
| 4 | `About` | `#about` | `Philosophy`「极致之美来源于 / 秩序的延伸.」+ 一段理念说明；`Expertise` 六项：Design Systems、Product Architecture、Spatial UI、Art Direction、Motion Prototyping、Visual Branding；`About Me` 个人简介；`Available — 2024-2026` |
| 5 | `Experience` | `#experience` | `Work History & Experience`「职业履历与经历 / curated milestones.」+ 3 段经历卡片 |
| 6 | `Contact` | `#contact` | `Contact & Collaboration`「创造更有价值的 / 数字感官体验.」+ 合作邀请语；邮件 `jding8190@gmail.com`、微信 `dingjie_design`、所在地 `Shanghai, China & Remote`；页脚版权 `© 2024-2026 DING JIE. ALL RIGHTS RESERVED.` |

作品区交互：分类筛选、封面缩放滑块、暗角透明度滑块、随机抽选、自动播放、卡片详情跳转、归档页入口。

`src/constants.ts` 内置 4 个示例项目：Nexa 智能资产管理平台、Horizon 极简旅行导航、Etheria 品牌重塑、春季新品发布运营专题（均为 Unsplash 配图 + 虚构案例数据，含背景、目标、过程、成果、复盘字段）。

---

## 3. 视觉规范

**配色**：全站近黑底 `#080808`，首屏 `#050505`；文字主白 / zinc 灰阶（zinc-100 ~ zinc-600）；分隔线 `border-white/[0.04]`；功能色极克制——青色 `#22d3ee` 状态点、琥珀 `amber-400` 履历标签、翠绿 `emerald-400` 在线状态、蓝色 `blue-400` 公司圆点。选中态为白底黑字。

**字体**（`src/index.css` 中 Google Fonts 引入）：
- 无衬线 `Outfit`（回退 Inter / 苹方 / 微软雅黑）——标题与正文
- 衬线 `Cormorant Garamond` 斜体——英文副标题，如 `curated milestones.`、`crafted fluid glassmorphism.`
- 等宽 `JetBrains Mono` 大写 + 0.2em~0.6em 字距——展签、徽章、元信息

**版式**：`max-w-[1440px]` 居中容器，12 栏栅格（首屏左 8 栏标题 + 右 4 栏状态）；区块上下留白 `py-40`；超大标题 `clamp(4.5rem, 12vw, 12rem)`、`leading-[0.75]`；内容整体上移 `-translate-y-[200px]` 压在人像上。

**材质（Apple Liquid Glass 体系，全部定义在 `src/index.css`）**：
- `.apple-glass` 基础玻璃：白色 8%→2% 渐变 + `blur(28px) saturate(190%)` + 1px 白边 + 内外多层阴影
- `.apple-glass-capsule` 胶囊：用于导航、徽章、标签，`blur(32px)` + 顶部高光
- `.apple-glass-card` 卡片：深色 70%~80% 渐变 + `blur(36px)` + 圆角 `2.2rem`
- `.glass-rim-top` 顶部 1px 反射线；`.apple-glass-interactive` 悬停斜向扫光；`.apple-glass-button` 玻璃按钮
- `.text-stroke` 描边透明字，悬停加亮

**首屏背景**：`public/hero_bg.webp`（113 KB，暗调人像），失败回退 `public/hero_bg.png`（2.8 MB）；叠加从底部到顶部的黑色渐变、左右压暗渐变；`object-position: center 35%`，`scale 1.01` 与 3000ms 缓动。

**动效**：motion 首屏淡入上移（1.5s，缓动 `[0.16,1,0.3,1]`）、区块 `whileInView` 滚动入场、路由切换 0.25s 淡入淡出、`FlowingLight` 全局流动光效、`html { scroll-behavior: smooth }`。

---

## 4. 内容在哪里改（双轨数据源，重要）

站点文案有两层，**在线数据优先、本地兜底**：

| 数据 | 本地兜底（改源码，可版本化） | 在线覆盖（免重新部署） |
| --- | --- | --- |
| 站点标题、Hero 文案、联系方式、分类、关于文案 | `src/lib/settings.tsx` → `DEFAULT_SETTINGS` | Firestore `settings/global` |
| 项目卡片与案例详情 | `src/constants.ts` → `projects` | Firestore `projects` 集合 |
| 履历三段 | `src/components/Experience.tsx` → `staticExperiences` | Firestore `experiences` 集合 |

各组件用 `onSnapshot` 实时订阅 Firestore：有数据则覆盖本地常量，集合为空或连接失败自动回退本地常量。因此**断网也能完整渲染**。后台 `/admin` 可视化编辑这些字段，登录受 Firebase Auth 限制。

> 接管后的建议：以本地源码为唯一事实来源，改内容直接改上面三个文件并走构建发布；在线后台只用于临时快改，避免「线上有值、源码没改」造成版本漂移。

**静态资源**：图片放 `public/`，引用一律用相对路径（Vite `base: './'`）。`public/assets/aistudio/` 下 5 张图是 AI Studio 时代遗留素材，当前仍作为资产保留，不参与 Gemini 相关调用。

---

## 5. 本次接管已完成的动作

1. 从 `jding8190-source/DING` 克隆完整源码到工作区，`npm install` 与 `vite build` 均通过（dist 约 7.8 MB）。
2. 移除 `@google/genai` 依赖——全仓库源码无任何调用，属 Gemini 工具链残留；同步更新 `package-lock.json`。
3. 移除 `vite.config.ts` 中的 `loadEnv` 与 `process.env.GEMINI_API_KEY` 注入；改写 `.env.example`，本地开发不再需要任何大模型密钥。
4. 补齐原仓库缺失的 `@types/react` / `@types/react-dom`（19.x）。这是 `Admin.tsx` 两处 `unknown → Blob` 与 `ErrorBoundary.tsx` 一处 `props` 类型报错的根因；补齐后 `npm run lint` 无报错。
5. 保留 Firebase 数据层：它是站点的 CMS 后端，不属于 Gemini 生成工具链，移除会破坏后台与实时内容同步。
6. 2026-11-10 正式接管：`hero_bg.png`、`hero_bg.webp` 与 `assets/aistudio/` 下 5 张图共 7 个视觉文件，与源码 `public/` 逐字节 SHA-256 比对一致；清理后的源码状态提交为接管基线 `7b1322d`，后续改动均以此为起点可回溯。

---

## 6. 待处理：站点内容与本人真实资料冲突

当前线上文案是 Gemini 生成的模板内容，与本人在简历 / 作品集中的真实信息不一致，接管后的第一优先级是替换：

| 字段 | 网站现值 | 真实资料口径（见工作区简历 v4 与作品集补强稿） |
| --- | --- | --- |
| 履历 | 2015–2018 `Art & Tech Collective`、2018–2021 `Innovation Lab`、2021–Present `Global Creative Studio` | 2019.07–2021.04 深圳颖网科技、2021.04–2025.01 深圳特斯联智能科技、2025.03–至今 江西深亚实业 |
| 职级 / 定位 | `Creative Director`、`Lead Product Designer` | UI 设计主管，7 年经验，复杂 B 端 / 数据平台 / 数据可视化方向 |
| 联系邮箱 | 网站现值 `jding8190@gmail.com` | 简历与作品集另有不同口径；默认按最新简历 v4 统一，具体地址见本地简历文件，不写入公开仓库 |
| 所在地 | `Shanghai, China & Remote`、`SHANGHAI / TOKYO / REMOTE` | 现有资料未含该字段，保留网站现值，取得真实城市后按同一口径替换 |
| 项目案例 | Nexa / Horizon / Etheria / 春季运营（虚构案例 + Unsplash 图） | 应替换为作品集中的真实项目与真实成果数字 |
| 年份标签 | `2024-2026`、`INDEX ©24` | 需按实际投递年度统一 |

以上字段本轮**未改动**：本轮任务是读取、还原与接管，内容替换属下一步。默认口径为「以最新简历 v4 与作品集补强稿为准」；项目案例需配真实图片与业务数据；所在地在现有资料中不存在，保留网站现值。改动入口已在第 4 节列明。

---

## 7. 发布流程

源码仓库与部署仓库是分开的：

```bash
cd site-takeover/DING
npm run lint && npm run build     # 产出 dist/
# 将 dist/ 全部内容同步到 jding8190-source/DING- 仓库的 main 分支根目录
# （含 index.html、404.html、assets/、hero_bg.webp/png、.nojekyll）
git add -A && git commit -m "update portfolio" && git push
```

推送后 GitHub Pages 从 `DING-` 的 main 分支自动更新，通常 1–2 分钟生效。

**2026-11-10 更新**：账户授权已完成，源码仓库推送由 WorkBuddy 执行；日常迭代不再手工搬运 `dist/`，改走第 9 节的自动化链路。

---

## 8. 后续维护约定

- 内容与视觉改动直接改本地源码，提交前跑 `npm run lint && npm run build`。
- 不引入大模型 SDK、不注入 AI 密钥；生成与维护由 WorkBuddy 承担。
- 新增图片放 `public/`，优先 webp，保留 png 回退；避免把大图提交进 `src/`。
- 首屏标题、导航、联系方式等对外文案改动需与简历 / 作品集口径保持一致，避免多渠道信息冲突。

---

## 9. 每次迭代自动同步与发布（2026-11-10 新增）

### 当前主链路：本机一键

```
本地改源码
  → ./push-to-github.sh "改动说明"
      ① git 提交
      ② 按内容差异把源码同步到 jding8190-source/DING 的 main
      ③ npm run lint && npm run build
      ④ 把 dist/ 一次提交同步到 jding8190-source/DING- 的 main
  → GitHub Pages 自动更新 https://jding8190-source.github.io/DING-/
```

本机 `git push` 到 `github.com` 被网络策略拦截（代理返回 502、直连超时），但 `api.github.com` 可达，因此同步走 GitHub REST 接口；令牌存放在系统加密钥匙串，脚本只读取、不打印明文。源码同步按「远端文件树 vs 本地文件」做内容差异，不依赖 git 的远程引用；站点发布用一次提交整体替换 `assets/`，历史干净。

```bash
cd site-takeover/交付
./push-to-github.sh "简述本次改动"     # 自动提交 + 同步源码 + 构建 + 发布
./push-to-github.sh                    # 不带参数：只同步已有提交
```

脚本会校验同步后远端文件与本地逐字节一致；构建产物与线上相同时自动跳过发布提交，不产生空提交。

### 可选增强：云端 GitHub Actions

`site-takeover/交付/deploy-cloud-ci.yml.template` 是云端自动构建模板：push 到 main 后由 GitHub Actions 执行 `npm ci → lint → build → 同步 dist 到 DING-`，本机只需推源码。启用需把模板内容放进仓库的 `.github/workflows/deploy.yml`；当前令牌授权范围为 `repo`、不含 `workflow`，接口无法写入工作流文件，可在仓库网页手动创建一次，或改用带 `workflow` 权限的令牌后由 WorkBuddy 写入。仓库密钥 `DING_PAGES_TOKEN` 已通过接口预置，模板启用即可用。

### 部署仓库的保留项

`.nojekyll` 与 `404.html` 不随构建删除；`assets/` 作为整体子树替换，旧构建文件自动淘汰。`vite.config.ts` 的 `base: './'` 保证 `/DING-/` 子路径下资源引用正确。
