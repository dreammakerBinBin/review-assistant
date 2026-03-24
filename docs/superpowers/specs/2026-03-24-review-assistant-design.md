# Review Assistant - 电商评价管理浏览器插件

## 1. Concept & Vision

一款面向个人电商卖家的浏览器插件，帮助高效管理评价回复。卖家可以手动输入评价内容，本地管理评价列表，使用 AI 生成专业回复，告别重复性文字工作。设计简洁现代，操作流畅，让好评维护变得轻松。

## 2. Design Language

### 2.1 Aesthetic Direction
**Flat Design** — 扁平化、无阴影、简约现代风格。强调功能性和易用性，适合工具型产品。

### 2.2 Color Palette
| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#0F172A` | 主背景色 |
| Secondary | `#1E293B` | 卡片/面板背景 |
| Accent Positive | `#22C55E` | 好评标识/正向操作 |
| Accent Negative | `#EF4444` | 差评标识/负面操作 |
| Accent Warning | `#F59E0B` | 中评/警告 |
| Text Primary | `#F8FAFC` | 主文字 |
| Text Muted | `#94A3B8` | 次要文字 |
| Border | `#334155` | 边框/分割线 |

### 2.3 Typography
- **Heading:** Fira Code (等宽，技术感)
- **Body:** Fira Sans (清晰易读)
- **Google Fonts:** `Fira+Code:wght@400;500;600;700|Fira+Sans:wght@300;400;500;600;700`

### 2.4 Spatial System
- Popup 尺寸：380px × 600px
- 内边距：16px
- 卡片间距：12px
- 圆角：8px

### 2.5 Motion Philosophy
- 过渡时长：150-200ms
- 缓动函数：ease-out
- Hover 反馈：背景色变化（无位移/缩放）
- 加载状态：简洁旋转动画

## 3. Layout & Structure

### 3.1 Popup 整体布局
```
┌─────────────────────────────────┐
│  Header (Logo + 设置按钮)       │  48px
├─────────────────────────────────┤
│  Tab 导航 (评价/模板/AI)        │  44px
├─────────────────────────────────┤
│                                 │
│  主内容区                       │  ~450px
│  (根据 Tab 切换)                │
│                                 │
├─────────────────────────────────┤
│  状态栏 (模板数/AI状态)         │  32px
└─────────────────────────────────┘
```

### 3.2 Tab 1: 评价列表页
- 筛选标签：全部 / 待回复 / 已回复 / 差评
- 评价卡片列表（可滚动）
- 每张卡片：买家名、商品、星级、日期、评价内容、操作按钮

### 3.3 Tab 2: 模板管理页
- 模板列表
- 新增/编辑/删除模板
- 模板分类（回复模板/邀请模板）

### 3.4 Tab 3: AI 设置页
- API Key 输入
- AI 模型选择（可选）
- 语气风格选择（礼貌/亲切/专业）
- 测试连接按钮

## 4. Features & Interactions

### 4.1 核心功能

#### 4.1.1 评价输入
- 用户手动粘贴评价内容
- 输入框支持多行文本
- 星级选择（1-5 星）
- 保存后添加到本地评价列表

#### 4.1.2 评价列表
- 展示所有已保存的评价
- 支持按状态筛选：
  - 全部：显示所有评价
  - 待回复：尚未生成回复的评价
  - 已回复：已有回复内容的评价
  - 差评：星级 ≤ 2 的评价
- 每条评价显示：买家名、商品名、星级、日期、评价摘要

#### 4.1.3 回复模板
- 预设常用回复模板
- 支持自定义添加模板
- 一键应用到当前评价的回复输入框
- 模板变量支持（{买家名}、{商品}等）

#### 4.1.4 AI 回复生成
- 输入关键词或直接生成
- 调用 Claude API 生成回复
- 显示加载状态
- 生成后可编辑、复制或标记为已回复

#### 4.1.5 好评邀请
- 生成邀请买家好评的话术
- 多种风格可选
- 一键复制

#### 4.1.6 一键复制
- 复制回复内容到剪贴板
- 显示复制成功提示

### 4.2 交互细节

| 元素 | Hover | Active | Disabled |
|------|-------|--------|----------|
| 按钮 | 背景变亮 10% | 背景变暗 10% | 透明度 50%，禁用 |
| 卡片 | 边框颜色变亮 | - | - |
| 标签 | 下划线高亮 | 背景高亮 | - |

### 4.3 状态处理
- **空状态：** 显示引导文案 "暂无评价，点击下方按钮添加"
- **加载状态：** 旋转图标 + 文案 "AI 生成中..."
- **错误状态：** 红色提示框 + 重试按钮
- **成功状态：** 绿色提示框，2秒后自动消失

## 5. Component Inventory

### 5.1 Header
- Logo + 产品名 "Review Assistant"
- 设置齿轮图标按钮
- 固定高度 48px

### 5.2 Tab Navigation
- 三个 Tab：评价 / 模板 / AI
- 底部高亮条指示当前 Tab
- 支持键盘导航

### 5.3 Filter Tags
- 横向排列的筛选标签
- 支持多选或单选
- 选中态有背景色高亮

### 5.4 Review Card
- 卡片式设计
- 显示：头像占位、买家名、商品名、星级（星图标）、日期、评价内容（最多3行+展开）
- 操作按钮组：回复 / AI生成 / 复制
- 状态标识（待回复/已回复）

### 5.5 Template Card
- 模板名称 + 预览内容
- 编辑/删除按钮
- 点击选中应用到当前回复

### 5.6 Input Field
- 标签 + 输入框
- 支持文本和多行文本
- 错误状态红色边框 + 错误提示

### 5.7 Button
- Primary：绿色背景，深色文字
- Secondary：透明背景，白色边框
- Icon Button：仅图标
- 三种尺寸：sm (28px) / md (36px) / lg (44px)

### 5.8 Toast Notification
- 固定在底部居中
- 成功（绿色）/ 错误（红色）/ 警告（黄色）
- 2秒自动消失
- 可手动关闭

## 6. Technical Approach

### 6.1 插件形式
**Chrome Extension (Manifest V3)**

### 6.2 前端技术
- HTML5 + CSS3 + JavaScript (ES6+)
- Tailwind CSS (CDN)
- 无需构建工具，保持轻量

### 6.3 数据存储
使用 `chrome.storage.local` 存储：
- 评价列表 (reviews)
- 回复模板 (templates)
- 用户设置 (settings)
- API Key (apiKey) — 加密存储

### 6.4 AI 集成
- 调用 Claude API (https://api.anthropic.com/v1/messages)
- 模型：claude-3-haiku-20240307（低成本）
- 支持流式响应

### 6.5 文件结构
```
review-assistant/
├── manifest.json          # 插件配置
├── popup.html             # Popup 主页面
├── popup.css              # 样式文件
├── popup.js               # Popup 逻辑
├── content.js             # Content Script (可选)
├── background.js          # Service Worker
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### 6.6 安全考虑
- API Key 仅存储在本地，不上传
- CSP 限制外部请求
- 不执行 eval() 等危险操作

## 7. MVP Scope

### 7.1 First Release (MVP)
- 评价手动输入和本地存储
- 评价列表和筛选
- 预设回复模板
- AI 回复生成（调用 Claude）
- 一键复制
- 基础设置（API Key 配置）

### 7.2 Future Enhancements (Post-MVP)
- 多平台评价自动抓取
- 批量回复
- 评价数据分析
- 导出/导入数据
- 同步到云端

## 8. Success Metrics

### 8.1 MVP 验证指标
- 功能可用性：所有核心功能正常运行
- 用户试用率：目标 100 次安装/试用
- 反馈收集：获得 10+ 用户反馈

### 8.2 Growth Metrics (Post-MVP)
- 日活跃用户 (DAU)
- 功能使用率（AI 生成使用次数）
- 用户留存 (D7, D30)
- 口碑传播

## 9. Notes

- 本设计专注于电商平台通用的评价管理场景
- 暂不接入特定平台 API，以 MVP 方式快速验证
- 评价数据完全存储在用户本地，保护隐私
