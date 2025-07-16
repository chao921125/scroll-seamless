# 贡献指南

感谢你考虑为 Scroll Seamless 做出贡献！以下是参与项目开发的指南。

## 开发环境设置

1. Fork 本仓库
2. 克隆你的 Fork 到本地：
   ```bash
   git clone https://github.com/YOUR_USERNAME/scroll-seamless.git
   cd scroll-seamless
   ```
3. 安装依赖：
   ```bash
   npm install
   # 或者使用 pnpm
   pnpm install
   ```
4. 创建一个新分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 开发流程

### 项目结构

```
scroll-seamless/
├── docs/             # 文档
├── examples/         # 示例
├── src/              # 源代码
│   ├── core/         # 核心库
│   ├── plugins/      # 插件
│   ├── react/        # React 组件
│   ├── styles/       # 样式
│   ├── types/        # 类型定义
│   └── vue/          # Vue 组件
├── test/             # 测试
└── test-scroll-seamless/ # 测试项目
```

### 构建与测试

- **构建项目**：
  ```bash
  npm run build
  # 或者
  pnpm build
  ```

- **运行测试**：
  ```bash
  npm test
  # 或者
  pnpm test
  ```

- **运行测试项目**：
  ```bash
  cd test-scroll-seamless
  npm install
  npm run dev
  ```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范来格式化提交信息。

提交格式：
```
<type>(<scope>): <subject>
```

常用的 `type` 值：
- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档变更
- **style**: 代码风格变更（不影响代码运行的变动）
- **refactor**: 重构（既不是新增功能，也不是修改 bug 的代码变动）
- **perf**: 性能优化
- **test**: 增加测试
- **chore**: 构建过程或辅助工具的变动

示例：
```
feat(core): 添加虚拟滚动功能
fix(vue): 修复 Vue 组件重复渲染问题
docs: 更新 API 文档
```

## Pull Request 流程

1. 确保你的分支与最新的主分支同步
2. 确保你的代码通过所有测试
3. 确保你的代码符合项目的代码风格
4. 提交 Pull Request 到主仓库的 `main` 分支
5. 在 PR 描述中详细说明你的变更

## 代码风格

- 遵循 TypeScript 的最佳实践
- 使用 2 个空格缩进
- 使用单引号
- 每行不超过 100 个字符
- 确保代码通过 ESLint 检查

## 文档

如果你添加了新功能或修改了现有功能，请确保更新相应的文档：

1. 更新 API 文档（如果适用）
2. 添加或更新示例（如果适用）
3. 更新 README.md（如果适用）

## 版本发布

版本发布由维护者负责，遵循 [语义化版本](https://semver.org/) 规范：

- **主版本号**：当你做了不兼容的 API 修改
- **次版本号**：当你做了向下兼容的功能性新增
- **修订号**：当你做了向下兼容的问题修正

## 许可证

通过贡献你的代码，你同意将其授权给项目所使用的 BSD-3-Clause 许可证。

## 联系方式

如果你有任何问题或建议，可以通过以下方式联系我们：

- 提交 Issue
- 发送 Pull Request
- 发送邮件至项目维护者

感谢你的贡献！ 