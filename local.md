# JSON Forms 前端资源本地化方案（提案）

## 背景与目标

当前交互页（`/r/<request_id>`）通过远程 CDN（esm.sh）动态加载 React / ReactDOM / JSON Forms 相关模块。实际使用中远程加载可能较慢、受网络波动影响，导致页面长时间停留在 Loading。

目标：

- 交互页渲染 JSON Forms 时不再依赖远程 CDN
- 首次打开交互页的加载时间可控、可离线/弱网可用（至少在内网/自建环境中）
- 保持现有 API / 数据结构不变（`/spec`、`payload_json`、`user.submitted.data.payload`）
- 不改变现有 MCD 路径；仅对 JSON Forms 渲染链路做本地化

非目标：

- 不处理 landing page（`website/`）的前端资源，本方案仅针对 Go server 的交互页
- 不引入复杂的 SSR

## 总体方案（推荐）

把 JSON Forms 渲染逻辑打成一个本地 bundle（单文件 JS + 可选 CSS），由 Go server 通过本地静态路径提供，并在交互页模板里引用本地脚本。

### 关键点

- **依赖打包**：React、ReactDOM、`@jsonforms/*`、lodash 依赖都被打进 bundle，浏览器不再发起 esm.sh 的网络请求
- **资源分发**：Go server 提供 `/static/...`（或类似前缀）的静态资源
- **内嵌可选**：用 `go:embed` 把构建产物嵌入二进制，避免部署时额外拷贝文件
- **缓存优化**：静态资源文件名带 hash（推荐），配合长缓存头，减少二次加载

## 实施步骤（不改动行为的最小增量）

### 1) 引入一个最小的前端构建目录（建议新建 `ui/`）

目的：只构建交互页 JSON Forms bundle，不与 `website/` 混在一起。

内容（建议）：

- `ui/package.json`
- `ui/src/jsonforms.ts`（入口文件）
- `ui/dist/jsonforms.bundle.js`（构建产物）
- （可选）`ui/dist/jsonforms.css`

入口文件职责：

- 导出一个全局可调用的 mount 函数（例如 `window.Ask4MeJsonForms.mount(...)`）
- 内部实现：
  - fetch `./spec?k=...`
  - 使用 JSON Forms 渲染 schema/uischema/data
  - onChange 更新隐藏域 `payload_json`
  - 根据 errors 禁用 submit
  - 可选：把 submit_label 写到按钮上

注意：入口逻辑与当前内联 `<script type="module">` 的行为保持一致，避免引入新交互差异。

### 2) 选择构建器与输出格式

推荐：**esbuild**（足够轻量，产物稳定，适合单入口打包）。

- 输出格式：IIFE 或 UMD（浏览器直接 `<script src>`）
- 目标：`es2018` 或 `es2020`（可按支持范围调整）
- 输出：单文件 `jsonforms.bundle.js`

构建命令示例（方案描述用，落地时可再细化）：

- `npm -C ui i`
- `npm -C ui run build`

### 3) Go server 增加静态资源服务

提供两种实现方式（推荐优先 A）：

- A. `go:embed` 内嵌 `ui/dist/*`，通过 `http.FS` 提供 `/static/`
  - 优点：单二进制交付，不需要额外拷贝 dist
  - 缺点：每次更新前端资源都需要重新编译 Go
- B. 运行时读取磁盘目录（例如 `./ui/dist`）
  - 优点：开发时可热更新资源
  - 缺点：部署时需要额外带上资源文件

缓存策略（两种方式都适用）：

- 若文件名带 hash：`Cache-Control: public, max-age=31536000, immutable`
- 若不带 hash：`Cache-Control: public, max-age=300`（短缓存）

### 4) 交互页模板从“内联动态 import”切换为“引用本地 bundle”

交互页模板的 JSON Forms 分支改为：

- 引入本地脚本：`<script src="/static/jsonforms.bundle.js" defer></script>`
- 在脚本加载后调用 `window.Ask4MeJsonForms.mount(...)`
- 保留现有 `Loading...`、`#err` 展示逻辑

这样可把 HTML 里大段内联模块代码显著缩短，并避免浏览器模块依赖加载失败导致空白。

### 5) 兼容策略（可选但建议）

增加一个配置开关，便于回滚与对比：

- `ASK4ME_JSONFORMS_ASSETS=local|cdn`
  - `local`：引用 `/static/jsonforms.bundle.js`
  - `cdn`：保留当前 esm.sh 动态 import 方案（回滚用）

默认值建议：`local`（如果本地资源存在），否则回退到 `cdn`。

## 验收标准

- 打开交互页时 Network 面板不再出现对 esm.sh 的请求
- JSON Forms 页面首屏渲染时间明显缩短（尤其是弱网/海外网络）
- 表单输入、校验、禁用提交、提交 payload 行为与当前一致
- 现有 MCD 模式不受影响

## 风险与对策

- **bundle 体积增大**：React + JSON Forms 体积不可避免
  - 对策：启用压缩（minify）与 gzip/br（若后续要做）
  - 对策：hash 文件名 + 强缓存，二次访问几乎零成本
- **构建链增加（Node 依赖）**
  - 对策：把构建过程做成可选步骤；Release 时预构建并提交产物（是否提交产物由你决定）
- **版本升级成本**
  - 对策：锁定依赖版本；升级时一次性更新 bundle 与 Go 二进制

## 推荐的落地方式（我建议的执行顺序）

1. 新增 `ui/` 并用 esbuild 产出 `jsonforms.bundle.js`
2. Go server 增加 `/static/`（先用磁盘目录方式，方便调试）
3. 交互页模板改为引用本地 bundle
4. 验证通过后改为 `go:embed` 内嵌（可选）
5. 加配置开关与回滚路径（可选）

