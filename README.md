# Review Assistant - 电商评价管理浏览器插件

一款面向个人电商卖家的浏览器插件，帮助高效管理评价回复。

[English](README_EN.md) | 简体中文

## 功能特性

### 核心功能

- **📝 评价管理** - 手动输入评价内容，本地存储评价列表
- **🏷️ 评价筛选** - 支持按全部/待回复/已回复/差评筛选
- **📋 模板管理** - 预设常用回复模板，支持自定义添加
- **🤖 AI 回复生成** - 调用 Claude API 智能生成专业回复
- **📤 一键复制** - 快速复制回复内容到剪贴板
- **💾 本地存储** - 所有数据存储在本地，保护隐私

### 设计亮点

- **扁平化设计** - 简约现代的 UI 风格
- **深色主题** - 护眼配色，适合长时间使用
- **流畅动画** - 150-200ms 过渡，体验丝滑

## 安装使用

### 前置要求

- Google Chrome / Microsoft Edge 等 Chromium 内核浏览器
- Claude API Key（从 [Anthropic Console](https://console.anthropic.com/) 获取）

### 安装步骤

1. 下载/克隆本项目
2. 打开浏览器扩展页面 `chrome://extensions/`（Edge 用户使用 `edge://extensions/`）
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择本项目文件夹

### 快速开始

1. 点击浏览器右上角的扩展图标，打开 Review Assistant
2. 切换到「AI」标签页，输入并保存 Claude API Key
3. 点击「测试连接」确保 API 正常
4. 返回「评价」标签页，点击「添加评价」开始使用

## 界面预览

```
┌─────────────────────────────────┐
│  Review Assistant         ⚙️   │
├─────────────────────────────────┤
│  [评价]  [模板]  [AI]           │
├─────────────────────────────────┤
│  [全部] [待回复] [已回复] [差评]│
│                                 │
│  ┌─────────────────────────┐   │
│  │ 张三                    │   │
│  │ 商品A          ⭐⭐⭐⭐⭐ │   │
│  │ 非常满意，好评！         │   │
│  │ [回复] [AI生成] [复制]  │   │
│  └─────────────────────────┘   │
│                                 │
│  [+ 添加评价]                   │
├─────────────────────────────────┤
│  5 条评价，2 条待回复           │
└─────────────────────────────────┘
```

## 技术架构

```
review-assistant/
├── manifest.json      # Chrome Extension Manifest V3
├── popup.html         # 主界面结构
├── popup.css         # 样式（Flat Design, Dark Theme）
├── popup.js          # UI 逻辑
├── src/
│   ├── storage.js    # chrome.storage 数据持久化
│   ├── ai.js         # Claude API 集成
│   ├── templates.js   # 模板管理
│   └── utils.js      # 工具函数
└── tests/            # Jest 单元测试
```

### 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (ES6+)
- **存储**: chrome.storage.local
- **AI**: Claude API (claude-3-haiku)
- **测试**: Jest
- **字体**: Fira Code + Fira Sans (Google Fonts)

## API 配置

### 获取 API Key

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册/登录账号
3. 在 API Keys 页面创建新密钥
4. 复制密钥并在本插件中配置

### 关于费用

- 使用 `claude-3-haiku` 模型，成本极低
- 官方定价：$0.25 / 1M tokens（输入），$1.25 / 1M tokens（输出）
- 日常使用每月费用通常低于 $1

## 数据隐私

- 所有评价数据仅存储在用户本地浏览器
- API Key 仅存储在本地，不会上传
- 无需担心买家评价信息泄露

## 开发相关

### 安装开发依赖

```bash
npm install
```

### 运行测试

```bash
npm test
```

### 项目结构

```
src/              # 源代码模块
  ├── storage.js   # 数据存储
  ├── ai.js       # AI 集成
  ├── templates.js # 模板管理
  └── utils.js    # 工具函数

tests/            # 测试文件
icons/           # 图标资源
```

## 更新日志

### v1.0.0 (2026-03-24) - MVP 发布

- ✅ 评价管理（添加/编辑/删除）
- ✅ 评价筛选（全部/待回复/已回复/差评）
- ✅ 回复模板管理
- ✅ AI 回复生成（Claude API）
- ✅ 一键复制功能
- ✅ 本地数据持久化
- ✅ 完整的单元测试

## License

MIT License
