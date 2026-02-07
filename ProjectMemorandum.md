# 项目备忘录 - 易宿酒店预订平台

> 本文档汇总了整个项目从需求分析到开发完成的关键决策与技术细节，供后续对话和维护参考。

---

## 一、项目背景

本项目为前端大作业，要求开发一个「易宿酒店预订平台」，包含：
- **移动端（H5）**：酒店查询页、酒店列表页、酒店详情页
- **PC 管理后台**：登录/注册、商户酒店信息录入/编辑、管理员审核/发布/下线

需求文档详见 `plan.md`。

---

## 二、技术选型决策

### 移动端选择：H5 Web（而非 APP 或小程序）

**决策理由**：
1. 使用 React 构建 H5 页面最为简单，无需额外学习 Taro 或小程序语法
2. 一套代码既可在浏览器中运行，也可嵌入 WebView，兼容性最好
3. 不依赖微信开发者工具或 APP 打包工具，开发调试效率最高
4. 通过 viewport 和响应式 CSS 即可实现良好的移动端适配

### 完整技术栈

| 分类 | 技术选型 | 版本 |
|------|----------|------|
| 前端框架 | React + TypeScript | React 19, TS 5.9 |
| 构建工具 | Vite | 7.x |
| 移动端 UI | Ant Design Mobile | 5.x |
| PC 端 UI | Ant Design | 6.x |
| 路由 | React Router | v7 (v6 API 兼容) |
| 状态管理 | Zustand | 5.x |
| 后端 | Express + TypeScript | Express 4.x |
| 数据库 | SQLite + Sequelize | SQLite3 5.x, Sequelize 6.x |
| 认证 | JWT (jsonwebtoken + bcryptjs) | - |
| 文件上传 | Multer | 1.x |

---

## 三、项目架构

### 目录结构

```
trip/
├── client/                         # 前端 Vite 项目
│   ├── src/
│   │   ├── mobile/                 # 移动端 3 个页面
│   │   │   ├── SearchPage/         # 首页：Banner轮播、城市/日期/关键字搜索、星级价格筛选、快捷标签
│   │   │   ├── ListPage/           # 列表页：筛选展示、酒店卡片列表、InfiniteScroll 无限滚动
│   │   │   └── DetailPage/         # 详情页：图片轮播、基础信息、房型价格（按价格升序）、周边信息
│   │   ├── admin/                  # PC 管理后台 5 个页面/组件
│   │   │   ├── LoginPage/          # 登录页
│   │   │   ├── RegisterPage/       # 注册页（支持选择商户/管理员角色）
│   │   │   ├── AdminLayout/        # 后台布局（侧边栏导航）
│   │   │   ├── HotelList/          # 商户酒店列表
│   │   │   ├── HotelForm/          # 酒店信息录入/编辑表单
│   │   │   └── ReviewList/         # 管理员审核列表
│   │   ├── components/
│   │   │   └── CalendarPicker/     # 自主开发的日历选择组件
│   │   ├── api/index.ts            # Axios 封装（authAPI, hotelAPI, uploadAPI）
│   │   ├── stores/
│   │   │   ├── useSearchStore.ts   # 搜索条件状态（Zustand）
│   │   │   └── useAuthStore.ts     # 认证状态（token + 用户信息）
│   │   ├── App.tsx                 # 路由配置
│   │   └── main.tsx                # 入口
│   └── vite.config.ts              # Vite 配置（含 API 代理到 3001 端口）
├── server/                         # 后端 Express 项目
│   ├── src/
│   │   ├── index.ts                # 服务入口（端口 3001）
│   │   ├── models/index.ts         # Sequelize 数据模型定义
│   │   ├── middleware/auth.ts      # JWT 认证 + 角色权限中间件
│   │   ├── routes/
│   │   │   ├── auth.ts             # 注册/登录/获取用户信息
│   │   │   ├── hotels.ts           # 酒店 CRUD + 搜索 + 审核流程
│   │   │   ├── rooms.ts            # 房型管理
│   │   │   └── upload.ts           # 图片上传
│   │   ├── seed.ts                 # 8 家种子酒店数据
│   │   └── uploads/                # 上传图片存储
│   └── database.sqlite             # SQLite 数据库文件
├── plan.md                         # 项目需求文档
├── README.md                       # 项目说明
└── ProjectMemorandum.md            # 本备忘录
```

### 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/m` | SearchPage | 移动端首页（默认跳转） |
| `/m/list` | ListPage | 酒店列表页 |
| `/m/hotel/:id` | DetailPage | 酒店详情页 |
| `/admin/login` | LoginPage | 管理后台登录 |
| `/admin/register` | RegisterPage | 管理后台注册 |
| `/admin/hotels` | HotelList | 商户酒店管理列表 |
| `/admin/hotels/create` | HotelForm | 新增酒店 |
| `/admin/hotels/edit/:id` | HotelForm | 编辑酒店 |
| `/admin/review` | ReviewList | 管理员审核列表 |

---

## 四、数据库模型

### users 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| username | STRING UNIQUE | 用户名 |
| password_hash | STRING | bcrypt 加密密码 |
| role | STRING | 角色: merchant / admin |

### hotels 酒店表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| name_cn | STRING | 中文名称 |
| name_en | STRING | 英文名称 |
| city | STRING | 城市 |
| address | STRING | 详细地址 |
| star | INTEGER | 星级 (1-5) |
| opening_date | STRING | 开业时间 |
| description | TEXT | 酒店描述 |
| tags | TEXT (JSON) | 标签数组: 豪华/亲子/江景等 |
| facilities | TEXT (JSON) | 设施数组: WiFi/泳池/健身房等 |
| images | TEXT (JSON) | 图片URL数组 |
| merchant_id | INTEGER FK | 关联商户用户 |
| status | STRING | 状态: draft/pending/approved/rejected/offline |
| reject_reason | TEXT | 拒绝原因 |

### room_types 房型表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| hotel_id | INTEGER FK | 关联酒店 |
| name | STRING | 房型名称 |
| price | FLOAT | 当前价格 |
| original_price | FLOAT NULL | 原价（用于展示折扣） |
| capacity | INTEGER | 入住人数 |
| breakfast | BOOLEAN | 是否含早餐 |

### nearby_places 周边信息表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| hotel_id | INTEGER FK | 关联酒店 |
| type | STRING | 类型: attraction/transport/mall |
| name | STRING | 名称 |
| distance | STRING | 距离描述 |

---

## 五、API 接口总览

### 认证
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 公开 |
| POST | /api/auth/login | 登录 | 公开 |
| GET | /api/auth/profile | 获取当前用户信息 | 需登录 |

### 酒店（公开）
| 方法 | 路径 | 说明 | 参数 |
|------|------|------|------|
| GET | /api/hotels/search | 搜索酒店 | city, keyword, star, minPrice, maxPrice, tag, page, limit |
| GET | /api/hotels/banner | Banner 数据 | - |
| GET | /api/hotels/:id | 酒店详情（含房型+周边） | - |

### 酒店（商户）
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/hotels/my | 获取自己的酒店列表 | merchant |
| POST | /api/hotels | 创建酒店 | merchant |
| PUT | /api/hotels/:id | 编辑酒店 | merchant |
| POST | /api/hotels/:id/submit | 提交审核 | merchant |

### 酒店（管理员）
| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/hotels/review | 审核列表 | admin |
| PUT | /api/hotels/:id/approve | 通过审核 | admin |
| PUT | /api/hotels/:id/reject | 拒绝审核（附原因） | admin |
| PUT | /api/hotels/:id/offline | 下线（可恢复） | admin |
| PUT | /api/hotels/:id/online | 恢复上线 | admin |

### 文件上传
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/upload | 上传图片，返回 URL |

---

## 六、状态管理

### useSearchStore（移动端搜索条件）
管理字段：city, keyword, checkIn, checkOut, star, minPrice, maxPrice, tag
- 搜索条件在首页(SearchPage)设置，传递到列表页(ListPage)使用
- 日期默认为当天入住、次日退房

### useAuthStore（管理后台认证）
管理字段：token, user (id + username + role)
- 登录成功后存入 localStorage 持久化
- Axios 拦截器自动附加 Bearer Token
- 401 响应自动清除认证信息并跳转登录页

---

## 七、核心功能实现要点

### 移动端
1. **Banner 轮播**：从 approved 状态酒店中随机取 3-5 条，点击跳转详情页
2. **日历组件（CalendarPicker）**：自主开发，支持入住/离店日期联动选择
3. **搜索筛选**：城市选择、关键字、星级(1-5)、价格区间(500以下/500-1000/1000-2000/2000以上)、快捷标签
4. **无限滚动**：列表页使用 InfiniteScroll 组件实现上滑自动加载
5. **房型排序**：详情页房型按价格从低到高排序

### PC 管理后台
1. **角色区分**：注册时选择角色，登录时自动识别
2. **酒店录入**：支持基本信息 + 动态增减房型 + 动态增减周边信息
3. **审核流程**：draft(草稿) → pending(待审核) → approved(通过)/rejected(拒绝，需填原因)
4. **下线恢复**：approved → offline(下线)，offline → approved(恢复上线)，下线非删除

---

## 八、启动方式

```bash
# 后端
cd server
npm install
npm run seed    # 首次运行初始化数据库和种子数据
npm run dev     # 启动开发服务器 (端口 3001)

# 前端
cd client
npm install
npm run dev     # 启动开发服务器 (端口 5173，API 代理到 3001)
```

### 访问地址
- 移动端：http://localhost:5173/m
- 管理后台：http://localhost:5173/admin/login

### 测试账号
| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 商户 | merchant | merchant123 |

---

## 九、种子数据

内置 8 家酒店数据，覆盖上海、北京、杭州、成都、三亚、广州、苏州、深圳等城市，每家酒店包含 3-4 个房型和 3-4 条周边信息。

---

## 十、已解决的问题

1. **¥ 符号编码乱码**：前端文件中人民币符号 ¥ 因编码问题变成了 `?`，已修复以下文件：
   - `client/src/mobile/SearchPage/index.tsx`（价格筛选标签）
   - `client/src/mobile/ListPage/index.tsx`（酒店卡片价格、筛选展示）
   - `client/src/mobile/DetailPage/index.tsx`（房型价格）
   - `client/src/admin/HotelForm/index.tsx`（价格输入框前缀）

2. **plan.md 编码乱码**：整个文件中文内容变成乱码，已用正确 UTF-8 编码重写

3. **server/package.json description 乱码**：已修复为正确中文描述

4. **清理无用文件**：删除了 `convert-encoding.ps1` 编码转换脚本和 Vite 默认的 `client/README.md`

---

## 十一、Git 提交规范

采用约定式提交（Conventional Commits）：
- `feat(scope):` 新功能
- `fix:` 修复问题
- `docs:` 文档变更
- `chore:` 杂项（构建、依赖等）

GitHub 仓库地址：https://github.com/Vincent-Ctrl-18/trip

---

## 十二、评分对应关系

| 评分项 | 分值 | 对应实现 |
|--------|------|----------|
| 酒店查询页 | 5分 | SearchPage: Banner + 城市/日期/关键字/星级/价格/标签搜索 |
| 酒店列表页 | 15分 | ListPage: 筛选头 + 筛选标签 + 酒店卡片 + 无限滚动 |
| 酒店详情页 | 15分 | DetailPage: 图片轮播 + 基础信息 + 日历 + 房型列表 + 周边 |
| 管理系统登录/注册 | 5分 | LoginPage + RegisterPage: 角色选择注册/自动判断登录 |
| 酒店信息录入操作 | 10分 | HotelForm: 基本信息 + 动态房型 + 动态周边信息 |
| 审核/发布/下线 | 10分 | ReviewList: 通过/拒绝(原因)/下线/恢复上线 |
| 数据结构与实时更新 | 2分 | REST API 直连 SQLite，保存即实时可见 |
| 用户体验流畅度 | 5分 | 移动端原生滑动、InfiniteScroll、响应式布局 |
| 长列表优化 | 3分 | InfiniteScroll 分页加载 |
| 视觉设计 | 5分 | Ant Design / Ant Design Mobile 组件库 |
| 兼容性 | 5分 | H5 Web 方案，viewport 适配 |
| 项目结构 | 4分 | 前后端分离、清晰分层 |
| 编码规范与 README | 3分 | TypeScript 类型安全 + 详细 README |
| 代码复用 | 3分 | API 封装、Store 抽取、CalendarPicker 通用组件 |
| 新技术 | 5分 | Zustand 状态管理、Vite 构建、SQLite 零配置 |
| 创新功能点 | 5分 | 自主开发日历组件、快捷标签筛选、折扣价展示 |
