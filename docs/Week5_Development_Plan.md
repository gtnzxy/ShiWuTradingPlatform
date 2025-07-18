# 拾物 - 第5周开发计划

## 一、开发概览

### 📋 开发目标
第5周专注于用户中心与消息系统的开发，完善用户个人信息管理、消息通讯、通知系统等核心社交功能。

### 🎯 核心功能模块
1. **用户中心系统** - 个人信息管理、收货地址、安全设置
2. **消息通讯系统** - 用户间实时消息交流
3. **通知系统** - 系统通知、交易通知、活动通知
4. **搜索与筛选** - 商品搜索优化、高级筛选
5. **用户关注系统** - 关注卖家、动态更新

### 📊 进度规划
- **计划制定**: 0.5天 (2025年7月18日)
- **架构搭建**: 1天 (需求分析+组件设计)
- **功能开发**: 3天 (核心功能实现)
- **测试验证**: 1天 (功能测试+集成测试)
- **总结报告**: 0.5天 (文档编写+优化)

## 二、技术架构设计

### 🏗️ 组件架构规划

#### 页面组件 (Pages)
```
src/pages/
├── UserProfilePage.js          # 用户个人主页 (替换占位符)
├── MessageCenterPage.js        # 消息中心 (替换占位符)
├── NotificationPage.js         # 通知页面 (替换占位符)
├── UserSettingsPage.js         # 用户设置页面 (新建)
├── AddressManagePage.js        # 收货地址管理 (新建)
└── SearchResultPage.js         # 搜索结果页面 (新建)
```

#### 服务层 (Services)
```
src/services/
├── messageService.js           # 消息服务 (新建)
├── notificationService.js      # 通知服务 (新建)
├── addressService.js           # 地址服务 (新建)
├── followService.js            # 关注服务 (新建)
└── searchService.js            # 搜索服务 (新建)
```

#### 组件层 (Components)
```
src/components/
├── atoms/
│   ├── MessageBubble.js        # 消息气泡组件
│   ├── NotificationItem.js     # 通知项组件
│   └── AddressCard.js          # 地址卡片组件
├── molecules/
│   ├── MessageInput.js         # 消息输入框
│   ├── UserInfoCard.js         # 用户信息卡片
│   └── SearchFilters.js        # 搜索筛选器
└── organisms/
    ├── MessageList.js          # 消息列表
    ├── ConversationList.js     # 会话列表
    └── NotificationCenter.js   # 通知中心
```

### 🔌 API接口设计

#### 消息模块 API
```javascript
// 消息服务接口
const messageService = {
  // 获取会话列表
  getConversations: (params) => GET('/api/messages/conversations'),
  
  // 获取会话消息历史
  getMessages: (conversationId, params) => GET(`/api/messages/conversations/${conversationId}`),
  
  // 发送消息
  sendMessage: (data) => POST('/api/messages', data),
  
  // 标记消息已读
  markAsRead: (conversationId) => PUT(`/api/messages/conversations/${conversationId}/read`)
};
```

#### 通知模块 API
```javascript
// 通知服务接口
const notificationService = {
  // 获取通知列表
  getNotifications: (params) => GET('/api/notifications'),
  
  // 标记已读
  markAsRead: (id) => PUT(`/api/notifications/${id}/read`),
  
  // 获取未读数量
  getUnreadCount: () => GET('/api/notifications/unread-count')
};
```

#### 用户模块 API
```javascript
// 用户服务接口扩展
const userService = {
  // 获取用户详细信息
  getUserProfile: (userId) => GET(`/api/users/${userId}/profile`),
  
  // 更新用户信息
  updateProfile: (data) => PUT('/api/users/profile', data),
  
  // 获取收货地址
  getAddresses: () => GET('/api/users/addresses'),
  
  // 添加收货地址
  addAddress: (data) => POST('/api/users/addresses', data),
  
  // 关注用户
  followUser: (userId) => POST(`/api/users/${userId}/follow`),
  
  // 取消关注
  unfollowUser: (userId) => DELETE(`/api/users/${userId}/follow`)
};
```

### 📱 状态管理设计

#### Context 状态管理
```javascript
// MessageContext - 消息状态管理
const MessageContext = {
  conversations: [],      // 会话列表
  currentConversation: null,  // 当前会话
  messages: {},          // 消息缓存 {conversationId: messages[]}
  unreadCount: 0         // 未读消息数
};

// NotificationContext - 通知状态管理
const NotificationContext = {
  notifications: [],     // 通知列表
  unreadCount: 0,       // 未读通知数
  filters: {}           // 筛选条件
};

// UserContext - 用户信息扩展
const UserContext = {
  profile: {},          // 用户详细信息
  addresses: [],        // 收货地址列表
  following: [],        // 关注列表
  settings: {}          // 用户设置
};
```

## 三、功能实现细节

### 🎯 核心功能清单

#### 3.1 用户中心系统
- [ ] **用户个人主页**
  - [ ] 用户基本信息展示
  - [ ] 发布商品历史
  - [ ] 交易评价展示
  - [ ] 关注按钮功能
  
- [ ] **用户设置页面**
  - [ ] 个人信息编辑
  - [ ] 头像上传功能
  - [ ] 密码修改
  - [ ] 隐私设置
  
- [ ] **收货地址管理**
  - [ ] 地址列表展示
  - [ ] 添加新地址
  - [ ] 编辑删除地址
  - [ ] 设置默认地址

#### 3.2 消息通讯系统
- [ ] **消息中心**
  - [ ] 会话列表展示
  - [ ] 未读消息提醒
  - [ ] 消息搜索功能
  - [ ] 消息删除管理
  
- [ ] **消息对话**
  - [ ] 实时消息收发
  - [ ] 消息历史记录
  - [ ] 图片消息支持
  - [ ] 商品分享功能

#### 3.3 通知系统
- [ ] **通知中心**
  - [ ] 系统通知展示
  - [ ] 交易通知管理
  - [ ] 通知分类筛选
  - [ ] 批量标记已读
  
- [ ] **实时通知**
  - [ ] 新消息提醒
  - [ ] 订单状态通知
  - [ ] 系统公告通知

#### 3.4 搜索与筛选优化
- [ ] **高级搜索**
  - [ ] 多条件组合搜索
  - [ ] 价格区间筛选
  - [ ] 分类筛选
  - [ ] 地理位置筛选
  
- [ ] **搜索结果**
  - [ ] 搜索结果展示
  - [ ] 排序功能
  - [ ] 搜索历史记录
  - [ ] 热门搜索推荐

#### 3.5 用户关注系统
- [ ] **关注功能**
  - [ ] 关注/取消关注
  - [ ] 关注列表管理
  - [ ] 粉丝列表展示
  - [ ] 关注动态更新

## 四、Mock数据设计

### 📊 数据模型定义

#### 用户信息模型
```javascript
const UserProfile = {
  id: 1,
  username: "user123",
  nickname: "张三",
  avatar: "/avatars/user1.jpg",
  email: "user@example.com",
  phone: "13800138000",
  gender: "male",
  birthday: "1995-01-01",
  location: "北京市海淀区",
  bio: "热爱生活，分享美好",
  joinDate: "2024-01-01",
  followingCount: 12,
  followersCount: 34,
  productCount: 15,
  rating: 4.8,
  verified: true
};
```

#### 消息模型
```javascript
const Message = {
  id: "msg_001",
  conversationId: "conv_001",
  senderId: 1,
  receiverId: 2,
  content: "您好，这个商品还在吗？",
  type: "text", // text, image, product
  createTime: "2025-07-18T10:30:00Z",
  isRead: false,
  productId: 123 // 可选，商品分享消息
};

const Conversation = {
  id: "conv_001",
  participants: [1, 2],
  otherUser: UserProfile,
  lastMessage: "您好，这个商品还在吗？",
  lastMessageTime: "2025-07-18T10:30:00Z",
  unreadCount: 2,
  isActive: true
};
```

#### 通知模型
```javascript
const Notification = {
  id: "notif_001",
  type: "order", // system, order, product, follow, message
  title: "订单状态更新",
  content: "您的订单已发货，请注意查收",
  data: { orderId: 123 }, // 相关数据
  isRead: false,
  createTime: "2025-07-18T10:30:00Z",
  priority: "normal" // high, normal, low
};
```

#### 地址模型
```javascript
const Address = {
  id: 1,
  name: "张三",
  phone: "13800138000",
  province: "北京市",
  city: "北京市",
  district: "海淀区",
  street: "中关村大街1号",
  detail: "A座1001室",
  postalCode: "100000",
  isDefault: true,
  tag: "家" // 家、公司、学校
};
```

### 🗄️ Mock服务处理器

#### 消息Mock处理器
```javascript
export const messageHandlers = [
  // 获取会话列表
  http.get('/api/messages/conversations', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
    
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        items: mockConversations.slice((page-1)*pageSize, page*pageSize),
        total: mockConversations.length,
        page,
        pageSize
      }
    });
  }),
  
  // 发送消息
  http.post('/api/messages', async ({ request }) => {
    const body = await request.json();
    const newMessage = {
      id: `msg_${Date.now()}`,
      ...body,
      createTime: new Date().toISOString(),
      isRead: false
    };
    
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: newMessage
    }, { status: 201 });
  })
];
```

## 五、开发时间表

### 📅 详细进度安排

#### Day 1: 计划制定与架构设计 (2025-07-18)
- [x] 需求分析和功能规划
- [x] 技术架构设计
- [x] API接口设计
- [x] Mock数据模型设计
- [ ] 组件结构规划

#### Day 2: 基础架构搭建 (2025-07-19)
- [ ] 创建服务层文件
- [ ] 设计Mock数据处理器
- [ ] 创建Context状态管理
- [ ] 创建基础组件骨架
- [ ] 配置路由结构

#### Day 3-4: 核心功能开发 (2025-07-20 ~ 2025-07-21)
- [ ] 用户中心页面开发
- [ ] 消息中心功能实现
- [ ] 通知系统开发
- [ ] 搜索功能优化
- [ ] 关注系统实现

#### Day 5: 测试与优化 (2025-07-22)
- [ ] 功能测试验证
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 用户体验优化

#### Day 6: 总结与文档 (2025-07-23)
- [ ] 开发总结报告
- [ ] 技术文档更新
- [ ] 下周规划制定

## 六、质量保证标准

### 🎯 功能质量标准
- **完整性**: 所有规划功能100%实现
- **可用性**: 核心用户流程无阻断
- **响应性**: 页面加载时间 < 2秒
- **兼容性**: 支持主流浏览器
- **安全性**: 用户数据安全保护

### 🧪 测试验证清单
- [ ] 用户中心功能完整性测试
- [ ] 消息收发功能测试
- [ ] 通知系统准确性测试
- [ ] 搜索功能精确性测试
- [ ] 关注系统逻辑测试
- [ ] 移动端响应式测试
- [ ] 边界情况处理测试

### 📊 性能指标要求
- **首屏加载**: < 3秒
- **页面切换**: < 500ms
- **消息发送**: < 200ms响应
- **搜索响应**: < 1秒
- **通知更新**: 实时性良好

## 七、风险评估

### ⚠️ 技术风险
1. **状态管理复杂度** - 多模块状态同步
   - 缓解策略: 使用成熟的Context模式
   
2. **实时性模拟** - 消息和通知实时更新
   - 缓解策略: 使用定时器模拟WebSocket

3. **性能优化** - 大量数据列表渲染
   - 缓解策略: 虚拟滚动和分页加载

### 📋 开发风险
1. **开发时间紧张** - 功能点较多
   - 缓解策略: 分优先级开发，核心功能优先
   
2. **组件复用度** - 避免重复开发
   - 缓解策略: 提前设计通用组件

### 🔄 依赖风险
1. **第三方库稳定性** - Ant Design组件兼容性
   - 缓解策略: 使用稳定版本，做好测试

## 八、成功指标

### 🎯 开发完成度指标
- 所有计划页面100%完成
- 所有API接口100%实现
- 所有Mock数据处理器正常工作
- 编译无错误，运行无异常

### 👥 用户体验指标
- 用户操作流程顺畅
- 界面美观且响应迅速
- 错误提示友好明确
- 移动端体验良好

### 🔧 技术质量指标
- 代码规范100%符合ESLint标准
- 组件复用率 > 80%
- API响应时间模拟真实
- 状态管理逻辑清晰

---

**文档版本**: v1.0  
**创建时间**: 2025年7月18日  
**维护者**: GitHub Copilot AI Assistant  
**适用项目**: 拾物 - 第5周开发
