# 第5周 API接口设计文档 - 用户中心与消息系统

## 📋 文档信息
- **版本**: v1.0
- **创建时间**: 2025年7月18日
- **适用阶段**: 第5周开发 - 用户中心与消息系统
- **遵循标准**: Architecture_Design.md API设计规范

## 🎯 设计原则

### 1. 统一响应格式
严格遵循架构设计文档中的API响应格式：

#### 成功响应 (200 OK)
```json
{
  "success": true,
  "data": { /* 业务数据 */ }
}
```

#### 失败响应 (4xx, 5xx)
```json
{
  "success": false,
  "error": {
    "code": "A0101",
    "message": "Invalid username or password.",
    "userTip": "用户名或密码错误，请重新输入"
  }
}
```

### 2. RESTful API设计
- 使用标准HTTP方法 (GET, POST, PUT, DELETE)
- 资源导向的URL设计
- 状态码语义化使用

### 3. TypeScript类型支持
- 所有接口都有对应的TypeScript类型定义
- DTO (Data Transfer Object) 和 VO (View Object) 分离
- 前后端类型一致性保证

## 📡 消息系统 API

### 基础路径: `/api/v1/messages`

#### 1. 获取会话列表
```
GET /api/v1/messages/conversations
```

**请求参数**:
```typescript
interface ConversationsQuery {
  page?: number;        // 页码，默认1
  pageSize?: number;    // 每页数量，默认20
}
```

**响应数据**:
```typescript
interface ConversationsResponse {
  success: true;
  data: {
    items: Conversation[];
    total: number;
    page: number;
    pageSize: number;
  }
}

interface Conversation {
  conversationId: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}
```

#### 2. 获取消息历史
```
GET /api/v1/messages/conversations/{conversationId}/messages
```

**请求参数**:
```typescript
interface MessagesQuery {
  page?: number;
  pageSize?: number;
  beforeMessageId?: string;  // 分页标记
}
```

**响应数据**:
```typescript
interface MessagesResponse {
  success: true;
  data: {
    items: Message[];
    total: number;
    hasMore: boolean;
  }
}
```

#### 3. 发送消息
```
POST /api/v1/messages/send
```

**请求体**:
```typescript
interface SendMessageDTO {
  receiverId: string;
  content: string;
  type: MessageType;  // TEXT, IMAGE, PRODUCT
  metadata?: {
    productId?: string;    // 商品分享时使用
    imageUrl?: string;     // 图片消息时使用
  }
}
```

**响应数据**:
```typescript
interface SendMessageResponse {
  success: true;
  data: Message;
}
```

#### 4. 标记消息已读
```
PUT /api/v1/messages/conversations/{conversationId}/read
```

**请求体**:
```typescript
interface MarkReadDTO {
  messageIds?: string[];  // 可选，不传则标记整个会话已读
}
```

#### 5. 删除会话
```
DELETE /api/v1/messages/conversations/{conversationId}
```

## 🔔 通知系统 API

### 基础路径: `/api/v1/notifications`

#### 1. 获取通知列表
```
GET /api/v1/notifications
```

**请求参数**:
```typescript
interface NotificationsQuery {
  page?: number;
  pageSize?: number;
  type?: NotificationType;   // ORDER, PRODUCT, SYSTEM, MESSAGE, REVIEW
  status?: 'read' | 'unread' | 'all';
}
```

**响应数据**:
```typescript
interface NotificationsResponse {
  success: true;
  data: {
    items: Notification[];
    total: number;
    unreadCount: number;
  }
}
```

#### 2. 标记通知已读
```
PUT /api/v1/notifications/{notificationId}/read
```

#### 3. 批量标记已读
```
PUT /api/v1/notifications/batch-read
```

**请求体**:
```typescript
interface BatchReadDTO {
  notificationIds: string[];
}
```

#### 4. 全部标记已读
```
PUT /api/v1/notifications/read-all
```

#### 5. 获取未读数量
```
GET /api/v1/notifications/unread-count
```

**响应数据**:
```typescript
interface UnreadCountResponse {
  success: true;
  data: {
    total: number;
    byType: Record<NotificationType, number>;
  }
}
```

## 👤 用户管理 API

### 基础路径: `/api/v1/users`

#### 1. 获取用户公开资料
```
GET /api/v1/users/{userId}/profile
```

**响应数据**:
```typescript
interface UserProfileResponse {
  success: true;
  data: UserProfileVO;
}

interface UserProfileVO extends User {
  followingCount: number;
  followerCount: number;
  isFollowing?: boolean;  // 当前用户是否关注该用户
  productStats: {
    onSale: number;
    sold: number;
    total: number;
  };
  recentProducts: Product[];  // 最近发布的商品
}
```

#### 2. 获取用户统计信息
```
GET /api/v1/users/{userId}/stats
```

**响应数据**:
```typescript
interface UserStatsResponse {
  success: true;
  data: {
    products: {
      total: number;
      onSale: number;
      sold: number;
      draft: number;
    };
    orders: {
      asbuyer: number;
      asSeller: number;
    };
    ratings: {
      average: number;
      total: number;
    };
    joinDays: number;
  }
}
```

#### 3. 更新用户资料
```
PUT /api/v1/users/profile
```

**请求体**:
```typescript
interface UpdateProfileDTO {
  nickname?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    wechat?: string;
  };
}
```

#### 4. 修改密码
```
PUT /api/v1/users/password
```

**请求体**:
```typescript
interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

#### 5. 隐私设置
```
GET /api/v1/users/privacy-settings
PUT /api/v1/users/privacy-settings
```

**请求体**:
```typescript
interface PrivacySettingsDTO {
  profileVisibility: 'PUBLIC' | 'FOLLOWERS_ONLY' | 'PRIVATE';
  showContact: boolean;
  showProducts: boolean;
  allowMessages: 'EVERYONE' | 'FOLLOWERS_ONLY' | 'NONE';
}
```

## 👥 关注系统 API

### 基础路径: `/api/v1/users/{userId}`

#### 1. 关注用户
```
POST /api/v1/users/{userId}/follow
```

#### 2. 取消关注
```
DELETE /api/v1/users/{userId}/follow
```

#### 3. 检查关注状态
```
GET /api/v1/users/{userId}/follow-status
```

**响应数据**:
```typescript
interface FollowStatusResponse {
  success: true;
  data: {
    isFollowing: boolean;
    followedAt?: string;
  }
}
```

#### 4. 获取关注列表
```
GET /api/v1/users/{userId}/following
GET /api/v1/users/{userId}/followers
```

## 📍 地址管理 API

### 基础路径: `/api/v1/addresses`

#### 1. 获取地址列表
```
GET /api/v1/addresses
```

#### 2. 添加地址
```
POST /api/v1/addresses
```

**请求体**:
```typescript
interface AddAddressDTO {
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: boolean;
}
```

#### 3. 更新地址
```
PUT /api/v1/addresses/{addressId}
```

#### 4. 删除地址
```
DELETE /api/v1/addresses/{addressId}
```

#### 5. 设置默认地址
```
PUT /api/v1/addresses/{addressId}/default
```

## 🔍 搜索系统 API

### 基础路径: `/api/v1/search`

#### 1. 搜索商品
```
GET /api/v1/search/products
```

**请求参数**:
```typescript
interface ProductSearchQuery {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: 'CREATE_TIME_DESC' | 'PRICE_ASC' | 'PRICE_DESC';
  page?: number;
  pageSize?: number;
}
```

#### 2. 搜索用户
```
GET /api/v1/search/users
```

**请求参数**:
```typescript
interface UserSearchQuery {
  keyword: string;
  page?: number;
  pageSize?: number;
}
```

#### 3. 获取搜索建议
```
GET /api/v1/search/suggestions
```

**请求参数**:
```typescript
interface SearchSuggestionsQuery {
  keyword: string;
  type?: 'product' | 'user' | 'all';
}
```

#### 4. 获取热门关键词
```
GET /api/v1/search/hot-keywords
```

## 🛡️ 错误码规范

### 用户相关错误 (A01xx)
- `A0101`: 用户名或密码错误
- `A0102`: 用户不存在
- `A0103`: 用户已被禁用
- `A0104`: 权限不足

### 消息相关错误 (A02xx)
- `A0201`: 会话不存在
- `A0202`: 消息发送失败
- `A0203`: 不能给自己发送消息
- `A0204`: 用户不允许接收消息

### 通知相关错误 (A03xx)
- `A0301`: 通知不存在
- `A0302`: 无权限操作该通知

### 系统错误 (B01xx)
- `B0100`: 系统繁忙，请稍后重试
- `B0101`: 网络异常
- `B0102`: 数据格式错误

## 📊 性能要求

### 1. 响应时间
- 查询接口: < 200ms
- 写入接口: < 500ms
- 文件上传: < 2s

### 2. 并发要求
- 支持1000+并发用户
- 消息系统支持实时推送

### 3. 数据一致性
- 强一致性: 用户认证、支付相关
- 最终一致性: 通知、统计数据

## 🔒 安全要求

### 1. 认证授权
- JWT Token 认证
- 接口权限控制
- 敏感操作二次验证

### 2. 数据保护
- 敏感信息脱敏
- SQL注入防护
- XSS攻击防护

### 3. 频率限制
- API调用频率限制
- IP黑白名单机制

## 📝 开发注意事项

### 1. Mock数据开发
- 开发环境自动使用Mock数据
- 生产环境自动切换真实API
- Mock数据结构与真实API保持一致

### 2. 类型安全
- 所有接口都要有TypeScript类型定义
- 使用泛型提高代码复用性
- 严格的类型检查

### 3. 错误处理
- 统一的错误处理机制
- 用户友好的错误提示
- 完整的错误日志记录

---

**文档状态**: ✅ 已完成  
**最后更新**: 2025年7月18日  
**维护者**: GitHub Copilot  
**审核状态**: 待审核
