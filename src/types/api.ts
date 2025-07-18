/**
 * 基础类型定义 - 基于后端API设计规范
 */

// 基础响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    userTip: string;
  };
}

// 分页相关类型
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 用户相关类型
export interface User {
  userId: string;
  username: string;
  nickname: string;
  avatarUrl?: string;
  status: UserStatus;
  followerCount: number;
  averageRating: number;
  createdAt: string;
}

export interface UserRegisterDTO {
  username: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  email?: string;
}

export interface UserLoginDTO {
  username: string;
  password: string;
}

export interface UserProfileVO extends User {
  followingCount: number;
  isFollowing?: boolean;
  products?: Product[];
}

// 商品相关类型
export interface Product {
  productId: string;
  title: string;
  description: string;
  price: number;
  status: ProductStatus;
  imageUrls: string[];
  category: Category;
  condition: ItemCondition;
  seller: User;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  likeCount?: number;
}

export interface CreateProductDTO {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  condition: ItemCondition;
  imageUrls: string[];
  tradeMethod: TradeMethod;
  location?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  status?: ProductStatus;
}

export interface ProductQuery extends PaginationParams {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: ItemCondition;
  sortBy?: SortBy;
  sellerId?: string;
}

export interface Category {
  id: number;
  categoryId: number;
  name: string;
  icon: string;
}

// 订单相关类型
export interface Order {
  orderId: string;
  buyer: User;
  seller: User;
  product: Product;
  status: OrderStatus;
  priceAtPurchase: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: PaymentMethod;
  shippingAddress?: string;
  notes?: string;
}

export interface CreateOrderDTO {
  productIds: string[];
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  notes?: string;
}

export interface OrderStatusUpdateDTO {
  status: OrderStatus;
  notes?: string;
}

// 购物车相关类型
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

// 消息相关类型
export interface Message {
  messageId: string;
  conversationId: string;
  sender: User;
  receiver: User;
  content: string;
  type: MessageType;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  conversationId: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface SendMessageDTO {
  receiverId: string;
  content: string;
  type: MessageType;
  productId?: string;
}

// 通知相关类型
export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// 评价相关类型
export interface Review {
  reviewId: string;
  orderId: string;
  reviewer: User;
  reviewee: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateReviewDTO {
  orderId: string;
  rating: number;
  comment: string;
}

// 枚举类型定义
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  MUTED = 'MUTED'
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ON_SALE = 'ON_SALE',
  LOCKED = 'LOCKED',
  SOLD = 'SOLD',
  REVIEW_FAILED = 'REVIEW_FAILED',
  DELISTED = 'DELISTED',
  DELETED = 'DELETED'
}

export enum OrderStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  AWAITING_SHIPMENT = 'AWAITING_SHIPMENT',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED'
}

export enum ItemCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export enum PaymentMethod {
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
  BANK_CARD = 'BANK_CARD',
  CASH = 'CASH'
}

export enum TradeMethod {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
  BOTH = 'BOTH'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
  PRODUCT_INQUIRY = 'PRODUCT_INQUIRY'
}

export enum NotificationType {
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  SYSTEM = 'SYSTEM',
  MESSAGE = 'MESSAGE',
  REVIEW = 'REVIEW'
}

export enum SortBy {
  CREATE_TIME_DESC = 'CREATE_TIME_DESC',
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC',
  POPULARITY_DESC = 'POPULARITY_DESC'
}

// Context相关类型
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: UserLoginDTO) => Promise<void>;
  register: (userData: UserRegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// 表单相关类型
export interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  agreement: boolean;
}

// 错误类型
export interface ApiError {
  code: string;
  message: string;
  userTip: string;
}

// 文件上传相关类型
export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  response?: any;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}
