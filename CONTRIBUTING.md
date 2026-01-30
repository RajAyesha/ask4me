# Contributing

感谢你愿意为 Ask4Me 做贡献。

## 开发环境

- Go 1.22+
- Node.js 18+

## 本地运行

1. 准备配置文件：

```bash
cp .env.example .env
```

2. 启动 server：

```bash
go run . -config ./.env
```

## 提交规范

- 尽量保持改动聚焦，避免无关格式化/重构混入功能改动
- 如涉及行为变更，请同时更新 README 中的相关示例或说明
- 如新增/修改对外接口，请给出兼容性说明

## 代码质量

- Go：确保 `go fmt ./...`、`go vet ./...`、`go test ./...` 通过
- Node：确保关键脚本可运行（CLI / server 启动器 / SDK）

## 报告问题

- Bug：请提供可复现步骤、实际/期望行为、运行环境与日志片段
- Feature：请说明使用场景与预期 API/CLI 形态
