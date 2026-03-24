# Changelog - 版本变更记录

所有版本变更都会记录在此文件中。

---

## [1.1] - 2026-03-24

### 新增
- **文档记录** - 添加 SKILLS.md，记录本次开发使用的技能
- **头脑风暴记录** - 添加 BRAINSTORMING.md，记录需求探索和设计决策过程

### 使用技能
- `superpowers:brainstorming` - 需求探索与设计
- `superpowers:test-driven-development` - TDD 测试驱动开发
- `superpowers:using-superpowers` - 技能系统基础

### 提交记录
- `387dc3d` - docs: add SKILLS.md and BRAINSTORMING.md records
- `d0b810c` - docs: add README.md with full documentation

---

## [1.0.0] - 2026-03-24

### 首次发布 (MVP)

#### 核心功能
- ✅ 评价管理（添加/编辑/删除）
- ✅ 评价筛选（全部/待回复/已回复/差评）
- ✅ 回复模板管理（5个预设模板 + 自定义模板）
- ✅ AI 回复生成（Claude API）
- ✅ 一键复制功能
- ✅ 本地数据持久化

#### 技术实现
- Chrome Extension Manifest V3
- HTML5 + CSS3 + JavaScript (ES6+)
- chrome.storage.local 本地存储
- Claude API (claude-3-haiku) 集成
- Jest 单元测试 (24 tests)

#### 使用技能
- `superpowers:test-driven-development` - TDD 测试驱动开发

#### 提交记录
- `c7f9bce` - feat: Review Assistant browser extension MVP
- `52082f5` - docs: add Review Assistant design spec
- `48e0dc2` - git: add .worktrees to gitignore

---

## 版本命名规范

- **主版本号.次版本号** (如 1.0, 1.1, 2.0)
- 主版本号：重大功能变更或架构调整
- 次版本号：功能新增或较大改进
- 修订号：bug修复或小调整

## 提交信息规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
refactor: 代码重构
test: 测试相关
chore: 构建/工具
```
