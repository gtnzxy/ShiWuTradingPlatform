# 拾物 - 前端项目结构与API设计文档

## 项目概述

**项目名称**: 拾物（Shiwu）二手交易平台  
**版本**: v1.0  
**技术栈**: React 19 + Ant Design 5.26.5 + React Router  
**开发范围**: 用户端前端（不包含管理员功能）  

## 1. 项目架构设计

### 1.1 整体架构
- **前后端分离**: SPA单页应用 + RESTful API
- **模块化设计**: 按功能模块组织代码，严格遵循模块解耦原则
- **原子设计模式**: 组件按atoms/molecules/organisms/templates分层

### 1.2 技术架构层次
```
┌─────────────────────────────────────┐
│           用户界面层 (UI Layer)         │
│     React组件 + Ant Design           │
├─────────────────────────────────────┤
│          路由层 (Routing Layer)       │
│           React Router               │
├─────────────────────────────────────┤
│         服务层 (Service Layer)        │
│       Axios HTTP客户端               │
├─────────────────────────────────────┤
│      状态管理层 (State Management)     │
│          React Context              │
└─────────────────────────────────────┘
```

## 2. 文件结构与模块设计

### 2.1 核心目录结构
```
src/
├── components/          # 组件库（原子设计模式）
│   ├── atoms/          # 原子组件（按钮、输入框等）
│   ├── molecules/      # 分子组件（搜索栏、产品卡片等）
│   ├── organisms/      # 生物体组件（导航栏、产品列表等）
│   └── templates/      # 模板组件（页面布局）
├── pages/              # 页面组件（19个用例对应的页面）
├── hooks/              # 自定义Hooks
├── services/           # API服务层
├── router/             # 路由配置
├── styles/             # 样式文件
├── types/              # TypeScript类型定义
└── utils/              # 工具函数
```

### 2.2 服务层设计（Service Layer）
按业务模块分离，严格遵循单一职责原则：

- **authService.js**: 用户认证服务
- **userService.js**: 用户信息管理
- **productService.js**: 商品相关服务
- **orderService.js**: 订单管理服务
- **cartService.js**: 购物车服务
- **addressService.js**: 地址管理服务
- **followService.js**: 关注/粉丝服务
- **messageService.js**: 消息服务
- **searchService.js**: 搜索服务
- **uploadService.js**: 文件上传服务

## 3. API接口设计规范

### 3.1 统一响应格式
所有API响应遵循统一格式，frontend使用Axios拦截器统一处理：

**成功响应 (200 OK)**:
```json
{
  "success": true,
  "data": { /* 业务数据 */ }
}
```

**失败响应 (4xx, 5xx)**:
```json
{
  "success": false,
  "error": {
    "code": "A0101",
    "message": "错误信息",
    "userTip": "用户友好提示"
  }
}
```

### 3.2 核心API端点设计

#### 用户认证模块 (/auth)
- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出
- `POST /auth/register` - 用户注册

#### 用户管理模块 (/users)
- `GET /users/profile` - 获取当前用户信息
- `PUT /users/profile` - 更新用户信息
- `POST /users/{userId}/follow` - 关注用户
- `DELETE /users/{userId}/follow` - 取消关注

#### 商品模块 (/products)
- `GET /products` - 获取商品列表（支持分页和筛选）
- `GET /products/{id}` - 获取商品详情
- `POST /products` - 发布商品
- `PUT /products/{id}` - 更新商品
- `DELETE /products/{id}` - 删除商品

#### 订单模块 (/orders)
- `POST /orders` - 创建订单
- `GET /orders` - 获取用户订单列表
- `PUT /orders/{id}/status` - 更新订单状态

## 4. 前端组件设计

### 4.1 页面组件（19个核心用例）
1. **LoginPage** - 用户登录
2. **RegisterPage** - 用户注册
3. **HomePage** - 首页
4. **ProductListPage** - 商品列表
5. **ProductDetailPage** - 商品详情
6. **ProductPublishPage** - 发布商品
7. **MyProductsPage** - 我的商品
8. **CartPage** - 购物车
9. **OrderListPage** - 订单列表
10. **OrderDetailPage** - 订单详情
11. **ProfilePage** - 个人信息
12. **AddressManagePage** - 地址管理
13. **FollowingPage** - 关注列表
14. **FollowersPage** - 粉丝列表
15. **MessagesPage** - 消息列表
16. **MessageDetailPage** - 消息详情
17. **SearchResultPage** - 搜索结果
18. **NotificationPage** - 通知中心
19. **UserProfilePage** - 用户主页

### 4.2 组件复用设计
- **原子组件**: 基于Ant Design组件的封装
- **分子组件**: 业务特定的复合组件
- **生物体组件**: 完整功能模块的组件

## 5. 状态管理设计

### 5.1 全局状态（React Context）
- **AuthContext**: 用户登录状态和信息
- **CartContext**: 购物车状态管理
- **ThemeContext**: 主题和UI偏好设置

### 5.2 本地状态管理
- 页面级状态使用useState/useReducer
- 表单状态使用Ant Design Form
- 异步状态使用自定义hooks

## 6. 安全设计

### 6.1 前端安全措施
- **XSS防护**: 所有用户输入内容进行HTML转义
- **CSRF防护**: 所有状态变更请求携带CSRF令牌
- **权限验证**: 路由级别的权限检查
- **数据验证**: 前端表单验证 + 后端二次验证

### 6.2 数据传输安全
- 使用HTTPS进行所有API通信
- 敏感信息（如密码）不在前端存储
- 使用HttpOnly Cookie管理会话

## 7. 性能优化设计

### 7.1 前端性能优化
- **代码分割**: 按路由进行懒加载
- **组件优化**: React.memo和useMemo优化渲染
- **图片优化**: 懒加载和WebP格式支持
- **缓存策略**: API响应缓存和本地存储

### 7.2 用户体验优化
- **加载状态**: 统一的Loading组件
- **错误处理**: 友好的错误提示和重试机制
- **响应式设计**: 移动端适配
- **无障碍访问**: ARIA标签和键盘导航支持

## 8. 开发规范

### 8.1 代码规范
- **命名规范**: 
  - 组件使用PascalCase
  - 函数和变量使用camelCase
  - 常量使用UPPER_SNAKE_CASE
- **文件组织**: 按功能模块组织，避免循环依赖
- **注释规范**: 关键业务逻辑必须添加注释

### 8.2 模块解耦原则
- **严格禁止跨模块直接调用**: 服务层之间通过定义良好的接口交互
- **单一职责**: 每个模块只负责自己的业务逻辑
- **依赖注入**: 使用Context提供跨组件依赖

## 9. 测试策略

### 9.1 测试类型
- **单元测试**: Jest + React Testing Library
- **集成测试**: 关键业务流程的端到端测试
- **性能测试**: 关键页面的加载性能监控

### 9.2 测试覆盖
- 核心业务逻辑100%覆盖
- 关键用户路径集成测试
- 错误边界和异常处理测试

## 10. 部署与维护

### 10.1 构建部署
- **构建工具**: Create React App
- **部署平台**: Vercel/Netlify
- **CI/CD**: GitHub Actions自动化部署

### 10.2 监控维护
- **错误监控**: 前端错误收集和上报
- **性能监控**: 页面加载时间和用户体验指标
- **日志管理**: 关键操作的客户端日志

---

**文档版本**: 1.0  
**更新日期**: 2025年1月  
**维护人**: 开发团队
