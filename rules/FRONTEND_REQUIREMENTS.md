# 二手交易平台 - 前端开发需求文档

## 项目概述

### 项目名称
Second-Hand Marketplace Frontend（二手交易平台前端）

### 项目目标
使用现代前端技术栈开发一个完整的二手交易平台用户界面，提供优秀的用户体验和完善的功能实现。

### 技术栈
- **框架**: React 19.x
- **构建工具**: Create React App
- **UI框架**: Ant Design (antd) 5.x
- **路由**: React Router 7.x
- **状态管理**: React Context API
- **表单处理**: Ant Design Form + native validation
- **HTTP客户端**: Axios
- **模拟API**: Mock Service Worker (MSW)
- **测试**: Jest + React Testing Library
- **部署**: Vercel / Netlify

## 项目架构

### 文件夹结构
```
src/
├── components/           # 组件库（原子设计模式）
│   ├── atoms/           # 原子组件
│   ├── molecules/       # 分子组件
│   ├── organisms/       # 生物体组件
│   └── templates/       # 模板组件
├── pages/              # 页面组件
├── hooks/              # 自定义Hooks
├── services/           # API服务
├── context/            # React Context
├── types/              # JavaScript类型定义和常量
├── utils/              # 工具函数
├── constants/          # 常量定义
├── styles/             # 样式文件
├── mocks/              # Mock数据和MSW配置
└── router/             # 路由配置
```

## 核心功能模块

### 1. 用户认证模块

#### 页面组件
- **LoginPage.js** - 用户登录页面
- **RegisterPage.js** - 用户注册页面

#### 功能特性
- 表单验证（用户名、密码格式验证）
- 登录状态管理（React Context）
- 自动登录记住功能
- 错误处理和用户反馈

#### UI组件需求
```javascript
// 原子组件 - 使用Ant Design组件
- Button（使用antd Button组件）
- Input（使用antd Input组件）
- Logo（网站Logo）

// 分子组件
- LoginForm（使用antd Form组件）
- RegisterForm（使用antd Form组件）
```

### 2. 商品管理模块

#### 页面组件
- **HomePage.js** - 首页
- **ProductListPage.js** - 商品列表页
- **ProductDetailPage.js** - 商品详情页
- **ProductPublishPage.js** - 商品发布页
- **MyProductsPage.js** - 我的商品页

#### 功能特性
- 商品搜索和筛选
- 商品分类浏览
- 图片上传和预览
- 商品状态管理
- 分页加载

#### UI组件需求
```javascript
// 原子组件 - 基于Ant Design
- Image（使用antd Image组件）
- Tag（使用antd Tag组件）
- Badge（使用antd Badge组件）

// 分子组件
- ProductCard（使用antd Card组件）
- SearchBar（使用antd Input.Search组件）
- FilterPanel（使用antd Filters组件）

// 生物体组件
- ProductList（使用antd List组件）
- ProductForm（使用antd Form组件）
- ImageUploader（使用antd Upload组件）
```

### 3. 购物交易模块

#### 页面组件
- **CartPage.js** - 购物车页面
- **CheckoutPage.js** - 结算页面
- **OrderListPage.js** - 订单列表页
- **OrderDetailPage.js** - 订单详情页

#### 功能特性
- 购物车管理
- 订单创建流程
- 支付模拟
- 订单状态跟踪
- 评价系统

#### UI组件需求
```javascript
// 分子组件 - 基于Ant Design
- CartItem（使用antd List.Item组件）
- OrderCard（使用antd Card组件）
- PaymentForm（使用antd Form组件）
- ReviewForm（使用antd Form + Rate组件）

// 生物体组件
- CartList（使用antd List组件）
- OrderTable（使用antd Table组件）
- CheckoutSummary（使用antd Descriptions组件）
```

### 4. 用户社交模块

#### 页面组件
- **UserProfilePage.js** - 用户主页
- **MessageCenterPage.js** - 消息中心
- **NotificationPage.js** - 通知页面
- **ActivityFeedPage.js** - 动态页面

#### 功能特性
- 用户关注系统
- 站内消息
- 实时通知
- 动态更新

#### UI组件需求
```typescript
// 分子组件
- UserCard（用户卡片）
- MessageBubble（消息气泡）
- NotificationItem（通知项）

// 生物体组件
- MessageList（消息列表）
- NotificationCenter（通知中心）
- FollowList（关注列表）
```

### 5. 通用布局模块

#### 页面组件
- **MainLayout.tsx** - 主要页面布局
- **NotFoundPage.tsx** - 404错误页面

#### 功能特性
- 响应式导航栏
- 统一页面布局
- 错误页面处理
- 移动端适配

#### UI组件需求
```typescript
// 生物体组件
- Header（页面头部导航）
- Footer（页面底部）
- Sidebar（侧边栏，移动端）

// 模板组件
- MainLayout（主要布局模板）
- AuthLayout（认证页面布局）
```

## 技术实现细节

### TypeScript类型定义

```typescript
// 用户类型
interface User {
  userId: string;
  username: string;
  nickname: string;
  avatarUrl: string;
  status: UserStatus;
  followerCount: number;
  averageRating: number;
  createdAt: string;
}

// 商品类型
interface Product {
  productId: string;
  title: string;
  description: string;
  price: number;
  status: ProductStatus;
  imageUrls: string[];
  category: Category;
  seller: User;
  createdAt: string;
}

// 订单类型
interface Order {
  orderId: string;
  buyer: User;
  seller: User;
  product: Product;
  status: OrderStatus;
  priceAtPurchase: number;
  createdAt: string;
}
```

### 状态管理结构

```typescript
// 认证上下文
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userInfo: RegisterInfo) => Promise<void>;
  isLoading: boolean;
}

// 购物车上下文
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalPrice: number;
}
```

### API服务设计

```typescript
// API服务类
class ApiService {
  // 认证相关
  async login(credentials: LoginCredentials): Promise<AuthResponse>;
  async register(userInfo: RegisterInfo): Promise<AuthResponse>;
  async logout(): Promise<void>;

  // 商品相关
  async getProducts(params: ProductQuery): Promise<ProductList>;
  async getProduct(id: string): Promise<Product>;
  async createProduct(product: CreateProductDto): Promise<Product>;
  async updateProduct(id: string, product: UpdateProductDto): Promise<Product>;

  // 订单相关
  async getOrders(): Promise<Order[]>;
  async createOrder(orderInfo: CreateOrderDto): Promise<Order>;
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
  
  // 消息相关
  async getConversations(): Promise<Conversation[]>;
  async getMessages(conversationId: string): Promise<Message[]>;
  async sendMessage(message: SendMessageDto): Promise<Message>;
  
  // 通知相关
  async getNotifications(): Promise<Notification[]>;
  async markNotificationRead(id: string): Promise<void>;
}
```

## Mock数据设计

### Mock Service Worker配置
```typescript
// mocks/handlers.ts
export const handlers = [
  // 认证接口
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    return res(ctx.json({ code: 200, data: mockUser }));
  }),

  // 商品接口
  rest.get('/api/v1/products', (req, res, ctx) => {
    return res(ctx.json({ code: 200, data: mockProducts }));
  }),

  // 订单接口
  rest.post('/api/v1/orders', (req, res, ctx) => {
    return res(ctx.json({ code: 200, data: mockOrder }));
  }),

  // 消息接口
  rest.get('/api/v1/conversations', (req, res, ctx) => {
    return res(ctx.json({ code: 200, data: mockConversations }));
  }),

  // 通知接口
  rest.get('/api/v1/notifications', (req, res, ctx) => {
    return res(ctx.json({ code: 200, data: mockNotifications }));
  }),
];
```

### 本地存储管理
```typescript
// utils/storage.ts
class StorageManager {
  setAuthToken(token: string): void;
  getAuthToken(): string | null;
  setUserInfo(user: User): void;
  getUserInfo(): User | null;
  setCartItems(items: CartItem[]): void;
  getCartItems(): CartItem[];
}
```

## 开发阶段规划

### 第1周：项目基础搭建
- [ ] Vite + React + TypeScript项目初始化
- [ ] Material-UI主题配置
- [ ] 文件夹结构和绝对路径导入
- [ ] 基础原子组件开发
- [ ] 路由配置
- [ ] Mock Service Worker设置

### 第2周：认证和用户管理
- [ ] 登录注册页面
- [ ] 表单验证实现
- [ ] 认证Context和状态管理
- [ ] 路由保护
- [ ] 用户主页展示

### 第3周：商品管理功能
- [ ] 商品列表页面
- [ ] 搜索筛选功能
- [ ] 商品详情页面
- [ ] 商品发布表单
- [ ] 图片上传组件

### 第4周：购物和订单
- [ ] 购物车功能
- [ ] 结算流程
- [ ] 订单管理
- [ ] 支付模拟
- [ ] 评价系统

### 第5周：社交功能
- [ ] 消息系统UI
- [ ] 通知中心
- [ ] 用户关注
- [ ] 动态更新
- [ ] 实时消息模拟

### 第6周：优化和完善
- [ ] 错误处理完善
- [ ] 加载状态优化
- [ ] 性能优化
- [ ] 响应式设计
- [ ] 测试覆盖
- [ ] 部署配置

## 性能优化要求

### 代码分割
- 路由级别代码分割
- 大型组件懒加载
- 第三方库按需加载

### 渲染优化
- React.memo优化重渲染
- useMemo缓存计算结果
- useCallback优化函数引用

### 资源优化
- 图片懒加载
- 虚拟列表（长列表）
- 防抖搜索

## 测试策略

### 组件测试
```typescript
// 示例：ProductCard组件测试
describe('ProductCard', () => {
  it('should render product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
  });

  it('should handle add to cart click', () => {
    const onAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByText('添加到购物车'));
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
```

### 集成测试
- 用户登录流程
- 商品搜索流程
- 购买流程
- 消息发送流程
- 关注用户流程

## 部署配置

### 环境变量
```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_MOCK_ENABLED=true

# .env.production
VITE_API_BASE_URL=https://api.example.com/v1
VITE_MOCK_ENABLED=false
```

### 构建优化
- Tree shaking移除未使用代码
- 资源压缩和优化
- CDN静态资源
- 缓存策略配置

## 开发指南

### 代码规范
1. **组件命名**: 使用PascalCase
2. **文件命名**: 组件文件使用PascalCase，其他使用camelCase
3. **TypeScript**: 启用严格模式，所有函数需要明确返回类型
4. **样式**: 优先使用MUI的sx prop，复杂样式使用CSS modules
5. **导入**: 使用绝对路径导入（@/components、@/types等）

### 最佳实践
1. **状态管理**: 全局状态用Context，局部状态用useState
2. **错误处理**: 使用Error Boundary处理组件错误
3. **表单处理**: 使用React Hook Form进行表单管理
4. **API调用**: 统一错误处理，提供加载状态
5. **类型安全**: 所有API响应和Props都要有明确类型定义

### 质量保证
- 代码覆盖率达到80%以上
- 所有PR需要通过ESLint和TypeScript检查
- 关键功能需要E2E测试
- 定期进行性能审计

---

## 成功标准

### 功能完整性
- [ ] 用户端所有功能完整实现（14个用例）
- [ ] 用户流程顺畅无阻断
- [ ] 响应式设计完备

### 技术质量
- [ ] TypeScript严格模式无错误
- [ ] 组件测试覆盖率80%+
- [ ] 性能指标达标（LCP < 3s）
- [ ] 无重大accessibility问题

### 用户体验
- [ ] 响应式设计适配移动端
- [ ] 加载状态和错误提示完善
- [ ] 交互流畅，符合用户习惯
- [ ] 界面美观，符合现代设计标准

请基于此需求文档和rules.json配置，专注完成前端部分的开发工作。
