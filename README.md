# 易宿酒店预订平台

智慧出行酒店预订平台，包含移动端 H5 用户预订流程和 PC 端酒店管理后台。面向酒店商户与用户，提供酒店查询、列表、详情浏览以及商户录入、管理员审核发布等功能。

## 功能概览

### 移动端（H5）

- **酒店查询页（首页）**：Banner 轮播广告、城市选择、日历日期选择器、关键字搜索、星级与价格筛选、快捷标签
- **酒店列表页**：筛选条件展示、酒店卡片列表、InfiniteScroll 无限滚动加载
- **酒店详情页**：图片轮播、基础信息（星级/设施/地址）、房型价格列表（按价格升序）、周边信息

### 管理后台（PC）

- **登录/注册**：支持商户与管理员两种角色注册，登录自动识别角色
- **商户端**：酒店信息录入/编辑、房型动态管理、提交审核
- **管理员端**：审核通过/拒绝（附原因）、发布上线、下线（可恢复）

## 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript + Vite |
| 移动端 UI | Ant Design Mobile 5 |
| PC 端 UI | Ant Design 5 |
| 路由 | React Router v6 |
| 状态管理 | Zustand |
| 后端 | Express + TypeScript |
| 数据库 | SQLite + Sequelize |
| 认证 | JWT (jsonwebtoken + bcryptjs) |
| 文件上传 | Multer |

## 项目结构

```
trip/
├── client/                     # 前端 React 项目
│   └── src/
│       ├── mobile/             # 移动端页面（SearchPage/ListPage/DetailPage）
│       ├── admin/              # 管理后台页面（Login/Register/HotelList/HotelForm/ReviewList）
│       ├── components/         # 通用组件（CalendarPicker 日历选择器）
│       ├── api/                # Axios 接口封装
│       ├── stores/             # Zustand 状态管理
│       ├── App.tsx             # 路由配置
│       └── main.tsx            # 入口
├── server/                     # 后端 Node.js 项目
│   └── src/
│       ├── routes/             # API 路由（auth/hotels/rooms/upload）
│       ├── models/             # Sequelize 数据模型
│       ├── middleware/         # JWT 认证与角色权限中间件
│       ├── uploads/            # 图片上传存储
│       ├── seed.ts             # 种子数据脚本
│       └── index.ts            # 服务入口
├── plan.md                     # 项目需求文档
└── README.md
```

## 快速启动

### 环境要求

- Node.js >= 18
- npm >= 9

### 1. 启动后端

```bash
cd server
npm install
npm run seed    # 初始化数据库和种子数据（首次运行必须执行）
npm run dev     # 启动开发服务器，端口 3001
```

### 2. 启动前端

```bash
cd client
npm install
npm run dev     # 启动开发服务器，端口 5173（自动代理 API 到后端）
```

### 3. 访问页面

- 移动端（H5）：`http://localhost:5173/m`
- 管理后台（PC）：`http://localhost:5173/admin/login`

## 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 商户 | merchant | merchant123 |

## 数据库设计

- **users**：用户表（id, username, password_hash, role）
- **hotels**：酒店表（名称中英文、城市、地址、星级、开业时间、描述、标签、设施、图片、状态、拒绝原因等）
- **room_types**：房型表（名称、价格、原价、容量、是否含早）
- **nearby_places**：周边信息表（类型：景点/交通/商场、名称、距离）

## API 简要

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册（选择角色） |
| POST | /api/auth/login | 登录（自动判断角色） |
| GET | /api/auth/profile | 获取当前用户信息 |
| GET | /api/hotels/search | 酒店搜索（城市/关键字/星级/价格/标签） |
| GET | /api/hotels/banner | 首页 Banner 数据 |
| GET | /api/hotels/:id | 酒店详情 |
| GET | /api/hotels/my | 商户：获取自己的酒店列表 |
| POST | /api/hotels | 商户：创建酒店 |
| PUT | /api/hotels/:id | 商户：编辑酒店 |
| POST | /api/hotels/:id/submit | 商户：提交审核 |
| GET | /api/hotels/review | 管理员：审核列表 |
| PUT | /api/hotels/:id/approve | 管理员：通过审核 |
| PUT | /api/hotels/:id/reject | 管理员：拒绝审核（附原因） |
| PUT | /api/hotels/:id/offline | 管理员：下线 |
| PUT | /api/hotels/:id/online | 管理员：恢复上线 |
| POST | /api/upload | 上传图片 |

## 技术亮点

- 自主开发日历选择组件，支持入住/离店日期联动
- 列表页 InfiniteScroll 无限滚动分页加载
- 商户保存数据后用户端实时可见（REST API 直连数据库）
- SQLite 零配置数据库，无需额外安装数据库服务
- 前后端均使用 TypeScript，类型安全
- Zustand 轻量状态管理，搜索条件跨页面共享
