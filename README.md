# 后台管理系统

这是一个基于Node.js和Vue.js的全栈后台管理系统，提供用户管理、产品管理、订单处理等功能。

## 技术选型

### 前端技术栈

- **框架**: Vue.js
- **构建工具**: Vite
- **路由管理**: Vue Router
- **状态管理**: Pinia
- **UI组件**: Element Plus
- **HTTP客户端**: Axios

### 后端技术栈

- **运行环境**: Node.js
- **Web框架**: Express.js 
- **数据库**: MySQL
- **认证方式**: JWT
- **API架构**: RESTful API

## 项目结构

### 前端结构 (client/)

```
client/
├── index.html              # HTML入口文件
├── package.json            # 项目依赖配置
├── vite.config.js          # Vite构建工具配置
└── src/
    ├── App.vue             # 应用根组件
    ├── main.ts             # 应用入口文件
    ├── assets/             # 静态资源文件夹
    ├── components/         # 组件目录
    │   ├── basic/          # 基础通用组件
    │   ├── business/       # 业务组件
    │   └── layout/         # 布局相关组件
    ├── router/             # 路由配置
    ├── store/              # 状态管理
    │   ├── order.js        # 订单相关状态
    │   ├── product.js      # 产品相关状态
    │   └── user.js         # 用户相关状态
    ├── utils/              # 工具函数
    └── views/              # 页面视图组件
        ├── auth/           # 认证相关页面
        ├── dashboard/      # 仪表盘
        ├── error/          # 错误页面
        ├── order/          # 订单管理
        ├── product/        # 产品管理
        ├── profile/        # 个人信息
        ├── system/         # 系统设置
        └── user/           # 用户管理
```

### 后端结构 (server/)

```
server/
├── app.js                  # 应用入口文件
├── package.json            # 项目依赖配置
├── config/                 # 配置文件目录
│   └── db.js               # 数据库配置
├── controllers/            # 控制器层
│   ├── authController.js   # 认证控制器
│   ├── orderController.js  # 订单控制器
│   ├── productController.js# 产品控制器
│   └── userController.js   # 用户控制器
├── middleware/             # 中间件
│   └── auth.js             # 认证中间件
├── models/                 # 数据模型
│   ├── index.js            # 模型入口
│   ├── Order.js            # 订单模型
│   ├── OrderItem.js        # 订单项模型
│   ├── Product.js          # 产品模型
│   └── User.js             # 用户模型
├── public/                 # 静态资源
└── routes/                 # 路由定义
    ├── auth.js             # 认证路由
    ├── orders.js           # 订单路由
    ├── products.js         # 产品路由
    └── users.js            # 用户路由
```

## 系统架构

该系统采用前后端分离的架构：

1. **前端**：Vue.js单页应用，负责界面渲染和用户交互
2. **后端**：Node.js API服务器，提供数据处理和业务逻辑
3. **数据流**：前端通过HTTP请求与后端API交互，获取和提交数据
4. **认证流程**：使用JWT进行用户认证，保护API资源

## 核心功能模块

1. **用户管理**：用户注册、登录、权限分配、角色管理
2. **产品管理**：产品添加、编辑、分类、搜索
3. **订单管理**：订单处理、状态跟踪、订单明细、统计分析
4. **系统设置**：系统参数配置、日志管理

## 开始使用

### 一体化工作区优化（2025.04）

本项目已采用 pnpm monorepo 工作区模式统一管理前后端依赖，极大提升协作与维护效率：
- 根目录下统一依赖管理，前后端依赖自动隔离、软链，无需分别进入子目录安装。
- 只需一次安装命令即可完成所有依赖准备。
- 推荐使用 pnpm v9+。

#### 一键安装依赖

```bash
# 在项目根目录运行（自动安装前后端所有依赖）
pnpm install
```

#### 启动/开发命令

```bash
# 启动后端开发服务
pnpm run dev:server

# 启动前端开发服务
pnpm run dev:client

# 构建前端
pnpm run build:client

# 构建后端
pnpm run build:server
```

> 你也可以进入 client 或 server 子目录单独运行 `pnpm dev`、`pnpm build` 等命令。

### 兼容原有 npm/yarn 使用方式

如需兼容传统 npm/yarn，可进入各子目录分别安装和运行，但推荐统一用 pnpm 管理。

---
npm start

# 运行前端开发服务器
cd client
npm run dev
```

## 部署说明

(根据实际情况补充部署信息)

## 贡献指南

(根据实际情况补充贡献指南)

## 许可证

(根据实际情况补充许可证信息)