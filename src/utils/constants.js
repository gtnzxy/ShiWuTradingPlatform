// 应用常量配置
export const APP_CONFIG = {
  // 应用信息
  APP_NAME: '拾物',
  VERSION: '1.0.0',
  
  // API配置
  API_BASE_URL: process.env.REACT_APP_API_URL || '/api/v1',
  REQUEST_TIMEOUT: 10000,
  
  // 分页配置
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // 文件上传配置
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_IMAGES_PER_PRODUCT: 9,
  
  // 表单验证
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 20,
  PRODUCT_TITLE_MAX_LENGTH: 100,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 2000,
  
  // 价格限制
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  
  // 搜索配置
  SEARCH_DEBOUNCE_TIME: 300,
  SEARCH_HISTORY_LIMIT: 10,
  
  // 缓存配置
  CACHE_DURATION: 5 * 60 * 1000, // 5分钟
  
  // 通知配置
  NOTIFICATION_DURATION: 4.5, // 秒
  
  // 主题配置
  THEME: {
    PRIMARY_COLOR: '#1890ff',
    SUCCESS_COLOR: '#52c41a',
    WARNING_COLOR: '#faad14',
    ERROR_COLOR: '#f5222d',
    BORDER_RADIUS: 6,
    BOX_SHADOW: '0 2px 8px rgba(0,0,0,0.15)'
  }
};

// API Base URL - 兼容导出
export const BASE_URL = APP_CONFIG.API_BASE_URL;

// 用户状态
export const USER_STATUS = {
  ACTIVE: 'ACTIVE', // 正常
  BANNED: 'BANNED', // 已封禁
  MUTED: 'MUTED' // 已禁言
};

// 用户状态标签
export const USER_STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: '正常',
  [USER_STATUS.BANNED]: '已封禁',
  [USER_STATUS.MUTED]: '已禁言'
};

// 商品状态
export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT', // 草稿
  PENDING_REVIEW: 'PENDING_REVIEW', // 待审核
  ON_SALE: 'ON_SALE', // 在售
  LOCKED: 'LOCKED', // 已锁定
  SOLD: 'SOLD', // 已售出
  REVIEW_FAILED: 'REVIEW_FAILED', // 审核失败
  DELISTED: 'DELISTED', // 已下架
  DELETED: 'DELETED' // 已删除
};

// 商品状态标签
export const PRODUCT_STATUS_LABELS = {
  [PRODUCT_STATUS.DRAFT]: '草稿',
  [PRODUCT_STATUS.PENDING_REVIEW]: '待审核',
  [PRODUCT_STATUS.ON_SALE]: '在售',
  [PRODUCT_STATUS.LOCKED]: '已锁定',
  [PRODUCT_STATUS.SOLD]: '已售出',
  [PRODUCT_STATUS.REVIEW_FAILED]: '审核失败',
  [PRODUCT_STATUS.DELISTED]: '已下架',
  [PRODUCT_STATUS.DELETED]: '已删除'
};

// 商品状态颜色
export const PRODUCT_STATUS_COLORS = {
  [PRODUCT_STATUS.DRAFT]: 'default',
  [PRODUCT_STATUS.PENDING_REVIEW]: 'processing',
  [PRODUCT_STATUS.ON_SALE]: 'success',
  [PRODUCT_STATUS.LOCKED]: 'warning',
  [PRODUCT_STATUS.SOLD]: 'error',
  [PRODUCT_STATUS.REVIEW_FAILED]: 'error',
  [PRODUCT_STATUS.DELISTED]: 'default',
  [PRODUCT_STATUS.DELETED]: 'default'
};

// 订单状态
export const ORDER_STATUS = {
  AWAITING_PAYMENT: 'AWAITING_PAYMENT', // 待支付
  PAID: 'PAID', // 已支付
  AWAITING_SHIPMENT: 'AWAITING_SHIPMENT', // 待发货
  SHIPPED: 'SHIPPED', // 已发货
  DELIVERED: 'DELIVERED', // 已送达
  COMPLETED: 'COMPLETED', // 已完成
  CANCELLED: 'CANCELLED', // 已取消
  REFUNDED: 'REFUNDED', // 已退款
  RETURN_REQUESTED: 'RETURN_REQUESTED', // 退货申请中
  RETURNED: 'RETURNED' // 已退货
};

// 订单状态标签
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.AWAITING_PAYMENT]: '待支付',
  [ORDER_STATUS.PAID]: '已支付',
  [ORDER_STATUS.AWAITING_SHIPMENT]: '待发货',
  [ORDER_STATUS.SHIPPED]: '已发货',
  [ORDER_STATUS.DELIVERED]: '已送达',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDED]: '已退款',
  [ORDER_STATUS.RETURN_REQUESTED]: '退货申请中',
  [ORDER_STATUS.RETURNED]: '已退货'
};

// 订单状态颜色
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.AWAITING_PAYMENT]: 'warning',
  [ORDER_STATUS.PAID]: 'processing',
  [ORDER_STATUS.AWAITING_SHIPMENT]: 'processing',
  [ORDER_STATUS.SHIPPED]: 'processing',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'error',
  [ORDER_STATUS.REFUNDED]: 'default',
  [ORDER_STATUS.RETURN_REQUESTED]: 'warning',
  [ORDER_STATUS.RETURNED]: 'default'
};

// 商品新旧程度
export const ITEM_CONDITIONS = {
  NEW: 'NEW',// 全新
  LIKE_NEW: 'LIKE_NEW', // 九成新
  GOOD: 'GOOD',// 良好
  FAIR: 'FAIR',// 一般
  POOR: 'POOR'// 较差
};

// 商品条件标签
export const ITEM_CONDITIONS_LABELS = {
  [ITEM_CONDITIONS.NEW]: '全新',
  [ITEM_CONDITIONS.LIKE_NEW]: '九成新',
  [ITEM_CONDITIONS.GOOD]: '良好',
  [ITEM_CONDITIONS.FAIR]: '一般',
  [ITEM_CONDITIONS.POOR]: '较差'
};

// 商品条件颜色
export const ITEM_CONDITIONS_COLORS = {
  [ITEM_CONDITIONS.NEW]: 'green',
  [ITEM_CONDITIONS.LIKE_NEW]: 'blue',
  [ITEM_CONDITIONS.GOOD]: 'cyan',
  [ITEM_CONDITIONS.FAIR]: 'orange',
  [ITEM_CONDITIONS.POOR]: 'red'
};

// 排序方式
export const SORT_BY = {
  CREATE_TIME_DESC: 'CREATE_TIME_DESC', // 按创建时间倒序
  PRICE_ASC: 'PRICE_ASC', // 按价格升序
  PRICE_DESC: 'PRICE_DESC', // 按价格降序
  POPULARITY_DESC: 'POPULARITY_DESC' // 按热度降序
};

// 排序方式标签
export const SORT_BY_LABELS = {
  [SORT_BY.CREATE_TIME_DESC]: '最新发布',
  [SORT_BY.PRICE_ASC]: '价格从低到高',
  [SORT_BY.PRICE_DESC]: '价格从高到低',
  [SORT_BY.POPULARITY_DESC]: '热度排序'
};

// 通知类型
export const NOTIFICATION_TYPES = {
  ORDER: 'ORDER',
  PRODUCT: 'PRODUCT',
  SYSTEM: 'SYSTEM',
  MESSAGE: 'MESSAGE',
  REVIEW: 'REVIEW' // 评价通知
};

// 通知类型标签
export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.ORDER]: '订单通知',
  [NOTIFICATION_TYPES.PRODUCT]: '商品通知',
  [NOTIFICATION_TYPES.SYSTEM]: '系统通知',
  [NOTIFICATION_TYPES.MESSAGE]: '消息通知',
  [NOTIFICATION_TYPES.REVIEW]: '评价通知'
};

// 通知优先级
export const NOTIFICATION_PRIORITY = {
  LOW: 'LOW',       // 低优先级
  MEDIUM: 'MEDIUM', // 中优先级
  HIGH: 'HIGH'      // 高优先级
};

// 支付方式
export const PAYMENT_METHODS = {
  ALIPAY: 'ALIPAY',
  WECHAT: 'WECHAT',
  BANK_CARD: 'BANK_CARD',
  CASH: 'CASH'
};

// 支付方式标签
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.ALIPAY]: '支付宝',
  [PAYMENT_METHODS.WECHAT]: '微信支付',
  [PAYMENT_METHODS.BANK_CARD]: '银行卡',
  [PAYMENT_METHODS.CASH]: '现金交易'
};

// 交易方式
export const TRADE_METHODS = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
  BOTH: 'BOTH'
};

// 交易方式标签
export const TRADE_METHOD_LABELS = {
  [TRADE_METHODS.DELIVERY]: '快递邮寄',
  [TRADE_METHODS.PICKUP]: '线下自提',
  [TRADE_METHODS.BOTH]: '两种方式'
};

// 消息类型
export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  SYSTEM: 'SYSTEM',
  PRODUCT_INQUIRY: 'PRODUCT_INQUIRY' // 商品询问
};

// 消息类型标签
export const MESSAGE_TYPE_LABELS = {
  [MESSAGE_TYPES.TEXT]: '文本消息',
  [MESSAGE_TYPES.IMAGE]: '图片消息',
  [MESSAGE_TYPES.SYSTEM]: '系统消息',
  [MESSAGE_TYPES.PRODUCT_INQUIRY]: '商品询问'
};

// 商品分类
export const CATEGORIES = [
  { id: 1, categoryId: 1, name: '图书教材', icon: '📚' },
  { id: 2, categoryId: 2, name: '电子产品', icon: '📱' },
  { id: 3, categoryId: 3, name: '服装配饰', icon: '👔' },
  { id: 4, categoryId: 4, name: '生活用品', icon: '🏠' },
  { id: 5, categoryId: 5, name: '运动健身', icon: '🏃' },
  { id: 6, categoryId: 6, name: '美妆护肤', icon: '💄' },
  { id: 7, categoryId: 7, name: '家居装饰', icon: '🛋️' },
  { id: 8, categoryId: 8, name: '母婴用品', icon: '🍼' },
  { id: 9, categoryId: 9, name: '食品饮料', icon: '🍕' },
  { id: 10, categoryId: 10, name: '汽车用品', icon: '🚗' },
  { id: 11, categoryId: 11, name: '乐器音响', icon: '🎵' },
  { id: 12, categoryId: 12, name: '宠物用品', icon: '🐕' },
  { id: 13, categoryId: 13, name: '手工艺品', icon: '🎨' },
  { id: 14, categoryId: 14, name: '收藏品', icon: '🏆' },
  { id: 15, categoryId: 15, name: '办公文具', icon: '📝' },
  { id: 16, categoryId: 16, name: '游戏娱乐', icon: '🎮' },
  { id: 17, categoryId: 17, name: '旅行户外', icon: '🎒' },
  { id: 18, categoryId: 18, name: '其他', icon: '📦' }
];

// 用户角色
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

// 商品发布操作
export const PRODUCT_ACTIONS = {
  SUBMIT_REVIEW: 'SUBMIT_REVIEW', // 提交审核
  SAVE_DRAFT: 'SAVE_DRAFT' // 保存草稿
};

// 关注操作
export const FOLLOW_ACTIONS = {
  FOLLOW: 'FOLLOW', // 关注
  UNFOLLOW: 'UNFOLLOW' // 取消关注
};

// 默认分页参数
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  PAGE_SIZE: 20
};

// 错误码分类
export const ERROR_CODES = {
  // 用户端错误
  USER_ERROR: 'A0001',
  LOGIN_INVALID: 'A0101',
  LOGIN_BANNED: 'A0102',
  REGISTER_USERNAME_EXISTS: 'A0110',
  PARAM_INVALID: 'A0201',
  PERMISSION_DENIED: 'A0301',
  
  // 系统错误
  SYSTEM_ERROR: 'B0001',
  DATABASE_ERROR: 'B0100',
  
  // 第三方服务错误
  THIRD_PARTY_ERROR: 'C0001'
};

// 路由权限
export const ROUTE_PERMISSIONS = {
  PUBLIC: 'PUBLIC',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  ADMIN_ONLY: 'ADMIN_ONLY'
};

// 默认头像
export const DEFAULT_AVATAR = '/api/placeholder/100/100';

// 默认商品图片
export const DEFAULT_PRODUCT_IMAGE = '/api/placeholder/300/300';

// 正则表达式
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  PRICE: /^\d+(\.\d{1,2})?$/,
  CHINESE_NAME: /^[\u4e00-\u9fa5]{2,10}$/
};

// 本地存储键名
export const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'user',
  CSRF_TOKEN: 'csrfToken',
  SEARCH_HISTORY: 'searchHistory',
  CART: 'cart',
  FAVORITES: 'favorites',
  THEME: 'theme',
  LANGUAGE: 'language'
};

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查网络设置',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UNAUTHORIZED: '请先登录',
  FORBIDDEN: '权限不足',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '输入数据格式不正确',
  TIMEOUT: '请求超时，请稍后重试'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  LOGOUT_SUCCESS: '退出成功',
  REGISTER_SUCCESS: '注册成功',
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
  PUBLISH_SUCCESS: '发布成功',
  ORDER_SUCCESS: '下单成功',
  PAYMENT_SUCCESS: '支付成功'
};
