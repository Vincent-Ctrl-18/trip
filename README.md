# 易宿 — 酒店预订平台

智慧出行酒店预订平台，包含用户端（H5 移动网页）和商户/管理员端（PC 管理后台）。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 移动端 UI | Ant Design Mobile 5 |
| PC 端 UI | Ant Design 5 |
| 路由 | React Router v6 |
| 状态管理 | Zustand |
| 后端 | Express + TypeScript |
| 数据库 | SQLite + Sequelize |
| 认证 | JWT |

## 项目结构

```
trip/
├── client/                 # 前端 React 项目
│   └── src/
│       ├── mobile/         # 移动端页面（SearchPage / ListPage / DetailPage）
│       ├── admin/          # PC 管理后台（Login / Register / HotelList / HotelForm / ReviewList）
│       ├── components/     # 通用组件（CalendarPicker）
│       ├── api/            # Axios 接口封装
│       └── stores/         # Zustand 状态管理
├── server/                 # 后端 Express 项目
│   └── src/
│       ├── routes/         # API 路由（auth / hotels / rooms / upload）
│       ├── models/         # Sequelize 数据模型
│       ├── middleware/     # JWT 认证中间件
│       └── seed.ts         # 种子数据
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18

### 安装与运行

```bash
# 1. 安装后端依赖并初始化数据
cd server
npm install
npm run seed

# 2. 启动后端服务（端口 3001）
npm run dev

# 3. 新开终端，安装前端依赖并启动
cd client
npm install
npm run dev
```

前端启动后访问：
- 移动端首页：http://localhost:5173/m
- 管理后台：http://localhost:5173/admin/login

### 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 商户 | merchant | merchant123 |

## 功能说明

### 用户端（H5 移动网页）

- **酒店查询页**：Banner 轮播、城市选择、自定义日历组件、关键字搜索、星级/价格筛选、快捷标签
- **酒店列表页**：筛选条件栏、酒店卡片列表、InfiniteScroll 无限滚动加载
- **酒店详情页**：图片轮播、酒店基础信息、设施展示、入住日期选择、房型价格列表（按价格升序）、周边信息

### 管理后台（PC 站点）

- **登录/注册**：支持商户和管理员两种角色，登录自动识别角色跳转
- **酒店信息管理（商户）**：酒店信息录入/编辑（中英文名、地址、星级、开业时间、标签、设施、房型动态添加、周边信息）、提交审核
- **审核管理（管理员）**：按状态筛选、审核通过/拒绝（填写原因）、发布上线/下线、恢复上线

### 审核流程

```
草稿 → 待审核 → 已通过（上线） → 可下线 → 可恢复上线
                → 已拒绝（显示原因）→ 可重新编辑提交
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| GET | /api/hotels/search | 搜索酒店 |
| GET | /api/hotels/banner | 获取 Banner |
| GET | /api/hotels/:id | 酒店详情 |
| GET | /api/hotels/my | 商户酒店列表 |
| POST | /api/hotels | 创建酒店 |
| PUT | /api/hotels/:id | 编辑酒店 |
| POST | /api/hotels/:id/submit | 提交审核 |
| GET | /api/hotels/review | 审核列表 |
| PUT | /api/hotels/:id/approve | 通过审核 |
| PUT | /api/hotels/:id/reject | 拒绝审核 |
| PUT | /api/hotels/:id/offline | 下线 |
| PUT | /api/hotels/:id/online | 恢复上线 |
| POST | /api/upload | 上传图片 |
