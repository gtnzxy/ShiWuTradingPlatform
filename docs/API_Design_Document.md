# 拾物 - 前后端API接口设计文档

## 文档信息
- **项目名称**: 拾物（Shiwu）二手交易平台
- **版本**: v1.0
- **创建日期**: 2025年1月
- **文档类型**: API接口设计规范

## 1. API设计原则

### 1.1 设计规范
- **RESTful风格**: 遵循REST设计原则
- **统一响应格式**: 成功/失败响应格式标准化
- **HTTP状态码**: 正确使用HTTP状态码
- **版本控制**: API版本化管理

### 1.2 命名规范
- **URL路径**: 使用小写字母和连字符
- **参数命名**: 使用camelCase
- **响应字段**: 与前端类型定义保持一致

### 1.3 安全原则
- **认证授权**: 所有API都需要权限验证
- **参数验证**: 服务端强制参数验证
- **数据脱敏**: 敏感信息脱敏处理

## 2. 统一响应格式

### 2.1 成功响应 (200 OK)
```json
{
  "success": true,
  "data": {
    // 具体的业务数据
  }
}
```

### 2.2 失败响应 (4xx, 5xx)
```json
{
  "success": false,
  "error": {
    "code": "A0101",
    "message": "用户名或密码错误",
    "userTip": "您输入的用户名或密码不正确，请重新输入"
  }
}
```

### 2.3 分页响应格式
```json
{
  "success": true,
  "data": {
    "list": [...],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## 3. 错误码定义

### 3.1 用户相关错误 (A01xx)
| 错误码 | 说明 | HTTP状态码 |
|-------|------|-----------|
| A0101 | 用户名或密码错误 | 401 |
| A0102 | 用户不存在 | 404 |
| A0103 | 用户已存在 | 409 |
| A0104 | 用户未登录 | 401 |
| A0105 | 用户无权限 | 403 |

### 3.2 商品相关错误 (A02xx)
| 错误码 | 说明 | HTTP状态码 |
|-------|------|-----------|
| A0201 | 商品不存在 | 404 |
| A0202 | 商品已下架 | 400 |
| A0203 | 商品信息无效 | 400 |
| A0204 | 商品库存不足 | 400 |

### 3.3 订单相关错误 (A03xx)
| 错误码 | 说明 | HTTP状态码 |
|-------|------|-----------|
| A0301 | 订单不存在 | 404 |
| A0302 | 订单状态错误 | 400 |
| A0303 | 订单金额错误 | 400 |

## 4. API端点详细设计

### 4.1 用户认证模块 (/auth)

#### POST /auth/register
**描述**: 用户注册

**请求参数**:
```json
{
  "username": "string",     // 用户名 (4-20字符)
  "password": "string",     // 密码 (6-20字符)
  "email": "string",        // 邮箱地址
  "phone": "string",        // 手机号码
  "nickname": "string"      // 昵称
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": 12345,
    "username": "testuser",
    "nickname": "测试用户",
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/login
**描述**: 用户登录

**请求参数**:
```json
{
  "username": "string",     // 用户名或邮箱
  "password": "string"      // 密码
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": 12345,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": "avatar_url",
    "token": "jwt_token_here"
  }
}
```

#### POST /auth/logout
**描述**: 用户登出

**请求头**: `Authorization: Bearer {token}`

**响应**:
```json
{
  "success": true,
  "data": {}
}
```

### 4.2 用户管理模块 (/users)

#### GET /users/profile
**描述**: 获取当前用户信息

**请求头**: `Authorization: Bearer {token}`

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": 12345,
    "username": "testuser",
    "nickname": "测试用户",
    "email": "user@example.com",
    "phone": "138****1234",
    "avatar": "avatar_url",
    "bio": "个人简介",
    "followersCount": 10,
    "followingCount": 15,
    "createTime": "2025-01-01T00:00:00Z"
  }
}
```

#### PUT /users/profile
**描述**: 更新用户信息

**请求参数**:
```json
{
  "nickname": "string",
  "bio": "string",
  "avatar": "string"
}
```

#### GET /users/{userId}
**描述**: 获取指定用户信息（公开信息）

**响应**:
```json
{
  "success": true,
  "data": {
    "userId": 12345,
    "nickname": "测试用户",
    "avatar": "avatar_url",
    "bio": "个人简介",
    "followersCount": 10,
    "followingCount": 15,
    "isFollowing": false
  }
}
```

#### POST /users/{userId}/follow
**描述**: 关注用户

#### DELETE /users/{userId}/follow
**描述**: 取消关注用户

### 4.3 商品管理模块 (/products)

#### GET /products
**描述**: 获取商品列表（支持分页和筛选）

**查询参数**:
- `page`: 页码 (默认1)
- `pageSize`: 每页数量 (默认20)
- `keyword`: 搜索关键词
- `category`: 商品分类ID
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `sort`: 排序方式 (newest, oldest, price_asc, price_desc)
- `status`: 商品状态 (available, sold)

**响应**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "productId": 123,
        "title": "商品标题",
        "description": "商品描述",
        "price": 99.99,
        "originalPrice": 199.99,
        "images": ["image1.jpg", "image2.jpg"],
        "category": {
          "categoryId": 1,
          "name": "电子产品"
        },
        "seller": {
          "userId": 456,
          "nickname": "卖家昵称",
          "avatar": "avatar.jpg"
        },
        "status": "available",
        "createTime": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### GET /products/{id}
**描述**: 获取商品详情

**响应**:
```json
{
  "success": true,
  "data": {
    "productId": 123,
    "title": "商品标题",
    "description": "商品详细描述",
    "price": 99.99,
    "originalPrice": 199.99,
    "images": ["image1.jpg", "image2.jpg"],
    "category": {
      "categoryId": 1,
      "name": "电子产品"
    },
    "seller": {
      "userId": 456,
      "nickname": "卖家昵称",
      "avatar": "avatar.jpg",
      "isFollowing": false
    },
    "status": "available",
    "condition": "良好",
    "location": "北京市",
    "viewCount": 100,
    "favoriteCount": 10,
    "isFavorited": false,
    "createTime": "2025-01-01T00:00:00Z",
    "updateTime": "2025-01-01T00:00:00Z"
  }
}
```

#### POST /products
**描述**: 发布商品

**请求参数**:
```json
{
  "title": "string",
  "description": "string",
  "price": 99.99,
  "originalPrice": 199.99,
  "categoryId": 1,
  "images": ["image1.jpg", "image2.jpg"],
  "condition": "string",
  "location": "string"
}
```

#### PUT /products/{id}
**描述**: 更新商品信息

#### DELETE /products/{id}
**描述**: 删除商品（下架）

### 4.4 订单管理模块 (/orders)

#### POST /orders
**描述**: 创建订单

**请求参数**:
```json
{
  "productIds": [123, 456],
  "addressId": 789
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "orderIds": [1001, 1002]
  }
}
```

#### GET /orders
**描述**: 获取用户订单列表

**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `status`: 订单状态
- `role`: 用户角色 (buyer, seller)

**响应**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "orderId": 1001,
        "product": {
          "productId": 123,
          "title": "商品标题",
          "image": "image.jpg",
          "priceAtPurchase": 99.99
        },
        "buyer": {
          "userId": 456,
          "nickname": "买家昵称"
        },
        "seller": {
          "userId": 789,
          "nickname": "卖家昵称"
        },
        "status": "pending",
        "totalAmount": 99.99,
        "createTime": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pageSize": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

#### GET /orders/{id}
**描述**: 获取订单详情

#### PUT /orders/{id}/status
**描述**: 更新订单状态

**请求参数**:
```json
{
  "status": "confirmed"  // pending, confirmed, shipped, completed, cancelled
}
```

### 4.5 购物车模块 (/cart)

#### GET /cart
**描述**: 获取购物车商品列表

#### POST /cart/items
**描述**: 添加商品到购物车

**请求参数**:
```json
{
  "productId": 123
}
```

#### DELETE /cart/items/{productId}
**描述**: 从购物车移除商品

#### PUT /cart/items/{productId}
**描述**: 更新购物车商品数量

### 4.6 地址管理模块 (/addresses)

#### GET /addresses
**描述**: 获取用户地址列表

#### POST /addresses
**描述**: 添加新地址

**请求参数**:
```json
{
  "receiverName": "string",
  "phone": "string",
  "province": "string",
  "city": "string",
  "district": "string",
  "detail": "string",
  "isDefault": false
}
```

#### PUT /addresses/{id}
**描述**: 更新地址信息

#### DELETE /addresses/{id}
**描述**: 删除地址

### 4.7 社交功能模块

#### GET /users/{userId}/followers
**描述**: 获取用户粉丝列表

#### GET /users/{userId}/following
**描述**: 获取用户关注列表

#### GET /messages
**描述**: 获取消息列表

#### POST /messages
**描述**: 发送消息

**请求参数**:
```json
{
  "toUserId": 456,
  "content": "消息内容",
  "type": "text"  // text, image
}
```

#### GET /messages/{conversationId}
**描述**: 获取对话详情

### 4.8 搜索模块 (/search)

#### GET /search/products
**描述**: 搜索商品

**查询参数**:
- `q`: 搜索关键词
- `category`: 分类筛选
- `minPrice`: 最低价格
- `maxPrice`: 最高价格
- `sort`: 排序方式

#### GET /search/users
**描述**: 搜索用户

### 4.9 通知模块 (/notifications)

#### GET /notifications
**描述**: 获取通知列表

#### PUT /notifications/{id}/read
**描述**: 标记通知为已读

#### PUT /notifications/read-all
**描述**: 标记所有通知为已读

### 4.10 文件上传模块 (/upload)

#### POST /upload/image
**描述**: 上传图片

**请求**: multipart/form-data

**响应**:
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/images/image.jpg",
    "filename": "image.jpg",
    "size": 1024
  }
}
```

## 5. 数据模型定义

### 5.1 用户模型 (User)
```json
{
  "userId": "number",
  "username": "string",
  "nickname": "string",
  "email": "string",
  "phone": "string",
  "avatar": "string",
  "bio": "string",
  "followersCount": "number",
  "followingCount": "number",
  "isFollowing": "boolean",
  "createTime": "string",
  "updateTime": "string"
}
```

### 5.2 商品模型 (Product)
```json
{
  "productId": "number",
  "title": "string",
  "description": "string",
  "price": "number",
  "originalPrice": "number",
  "images": "string[]",
  "category": "Category",
  "seller": "User",
  "status": "string",
  "condition": "string",
  "location": "string",
  "viewCount": "number",
  "favoriteCount": "number",
  "isFavorited": "boolean",
  "createTime": "string",
  "updateTime": "string"
}
```

### 5.3 订单模型 (Order)
```json
{
  "orderId": "number",
  "product": "Product",
  "buyer": "User",
  "seller": "User",
  "status": "string",
  "totalAmount": "number",
  "address": "Address",
  "createTime": "string",
  "updateTime": "string"
}
```

## 6. API测试与文档

### 6.1 接口测试
- **单元测试**: 每个API端点的单元测试覆盖
- **集成测试**: 关键业务流程的集成测试
- **压力测试**: 高并发场景下的性能测试

### 6.2 API文档
- **Swagger/OpenAPI**: 自动生成API文档
- **接口示例**: 提供完整的请求/响应示例
- **错误处理**: 详细的错误码和处理说明

---

**文档版本**: 1.0  
**维护团队**: 后端开发团队  
**更新频率**: 随API变更实时更新
