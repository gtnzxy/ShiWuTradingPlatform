/**
 * Mock数据处理器
 * 为第5周用户中心和消息系统提供模拟数据
 * 遵循React应用设计标准和测试指导原则
 */

// Mock用户数据
export const mockUsers = {
  1: {
    id: 1,
    username: 'alice',
    nickname: '小爱同学',
    avatar: 'https://via.placeholder.com/150/87CEEB/000000?text=A',
    email: 'alice@example.com',
    phone: '13800138001',
    gender: 'female',
    birthday: '1995-05-15',
    location: '北京市朝阳区',
    bio: '热爱生活，喜欢分享美好事物～',
    registrationDate: '2023-10-01',
    lastActiveTime: new Date().toISOString(),
    isOnline: true,
    followers: 156,
    following: 89,
    products: 23,
    isFollowed: false,
    rating: 4.8,
    status: 'active'
  },
  2: {
    id: 2,
    username: 'bob',
    nickname: 'Bob的小店',
    avatar: 'https://via.placeholder.com/150/FFB6C1/000000?text=B',
    email: 'bob@example.com',
    phone: '13800138002',
    gender: 'male',
    birthday: '1992-08-20',
    location: '上海市徐汇区',
    bio: '数码产品爱好者，专业卖家',
    registrationDate: '2023-09-15',
    lastActiveTime: new Date(Date.now() - 300000).toISOString(), // 5分钟前
    isOnline: false,
    followers: 234,
    following: 45,
    products: 67,
    isFollowed: true,
    rating: 4.9,
    status: 'active'
  },
  3: {
    id: 3,
    username: 'charlie',
    nickname: '查理书友',
    avatar: 'https://via.placeholder.com/150/98FB98/000000?text=C',
    email: 'charlie@example.com',
    phone: '13800138003',
    gender: 'male',
    birthday: '1998-12-10',
    location: '广州市天河区',
    bio: '书籍收藏爱好者，诚信交易',
    registrationDate: '2023-11-01',
    lastActiveTime: new Date(Date.now() - 3600000).toISOString(), // 1小时前
    isOnline: false,
    followers: 78,
    following: 123,
    products: 145,
    isFollowed: false,
    rating: 4.7,
    status: 'active'
  }
};

// Mock消息对话数据
export const mockConversations = [
  {
    id: 1,
    userId: 2,
    user: mockUsers[2],
    lastMessage: {
      id: 101,
      senderId: 2,
      receiverId: 1,
      content: '你好，请问这个商品还有吗？',
      type: 'text',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30分钟前
      isRead: false
    },
    unreadCount: 3,
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 2,
    userId: 3,
    user: mockUsers[3],
    lastMessage: {
      id: 102,
      senderId: 1,
      receiverId: 3,
      content: '谢谢您的购买！',
      type: 'text',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2小时前
      isRead: true
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  }
];

// Mock消息数据
export const mockMessages = {
  1: [
    {
      id: 101,
      senderId: 2,
      receiverId: 1,
      content: '你好，请问这个商品还有吗？',
      type: 'text',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: false
    },
    {
      id: 103,
      senderId: 2,
      receiverId: 1,
      content: '价格可以商量吗？',
      type: 'text',
      timestamp: new Date(Date.now() - 1700000).toISOString(),
      isRead: false
    },
    {
      id: 104,
      senderId: 2,
      receiverId: 1,
      content: 'https://via.placeholder.com/300x200/87CEEB/000000?text=Product',
      type: 'image',
      timestamp: new Date(Date.now() - 1600000).toISOString(),
      isRead: false
    }
  ],
  2: [
    {
      id: 102,
      senderId: 1,
      receiverId: 3,
      content: '谢谢您的购买！',
      type: 'text',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: true
    },
    {
      id: 105,
      senderId: 3,
      receiverId: 1,
      content: '商品质量很好，五星好评！',
      type: 'text',
      timestamp: new Date(Date.now() - 7100000).toISOString(),
      isRead: true
    }
  ]
};

// Mock通知数据
export const mockNotifications = [
  {
    id: 1,
    type: 'message',
    title: '新消息',
    content: 'Bob的小店向您发送了新消息',
    data: { userId: 2, conversationId: 1 },
    isRead: false,
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 2,
    type: 'follow',
    title: '新粉丝',
    content: 'Bob的小店关注了您',
    data: { userId: 2 },
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    type: 'like',
    title: '商品点赞',
    content: '查理书友赞了您的商品',
    data: { userId: 3, productId: 1 },
    isRead: true,
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 4,
    type: 'order',
    title: '订单更新',
    content: '您的订单已发货',
    data: { orderId: 1001 },
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1天前
  },
  {
    id: 5,
    type: 'system',
    title: '系统通知',
    content: '平台维护完成，感谢您的耐心等待',
    data: {},
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2天前
  }
];

// Mock地址数据
export const mockAddresses = [
  {
    id: 1,
    name: '张三',
    phone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    street: '三里屯街道',
    detail: '工人体育场北路13号院1号楼101室',
    postalCode: '100027',
    isDefault: true,
    tag: '家'
  },
  {
    id: 2,
    name: '张三',
    phone: '13800138001',
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    street: '中关村街道',
    detail: '中关村大街1号鼎好大厦A座2308室',
    postalCode: '100080',
    isDefault: false,
    tag: '公司'
  }
];

// Mock搜索记录
export const mockSearchHistory = [
  '手机',
  '笔记本电脑',
  '数学教材',
  '自行车',
  '化妆品'
];

// Mock商品数据（用于用户个人页面展示）
export const mockUserProducts = {
  1: [
    {
      id: 1,
      title: 'iPhone 14 Pro 256GB 深空黑',
      price: 6999,
      originalPrice: 8999,
      image: 'https://via.placeholder.com/300x300/87CEEB/000000?text=iPhone',
      condition: '99新',
      location: '北京市朝阳区',
      views: 156,
      likes: 23,
      status: 'available',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      title: 'MacBook Air M2 8+256GB 银色',
      price: 7899,
      originalPrice: 9499,
      image: 'https://via.placeholder.com/300x300/FFB6C1/000000?text=MacBook',
      condition: '95新',
      location: '北京市朝阳区',
      views: 234,
      likes: 45,
      status: 'available',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  2: [
    {
      id: 3,
      title: '小米13 Pro 12+256GB 陶瓷白',
      price: 3999,
      originalPrice: 4999,
      image: 'https://via.placeholder.com/300x300/98FB98/000000?text=Xiaomi',
      condition: '98新',
      location: '上海市徐汇区',
      views: 189,
      likes: 67,
      status: 'available',
      createdAt: new Date(Date.now() - 259200000).toISOString()
    }
  ],
  3: [
    {
      id: 4,
      title: '高等数学第七版（同济大学版）',
      price: 25,
      originalPrice: 45,
      image: 'https://via.placeholder.com/300x300/DDA0DD/000000?text=Math',
      condition: '90新',
      location: '广州市天河区',
      views: 78,
      likes: 12,
      status: 'available',
      createdAt: new Date(Date.now() - 345600000).toISOString()
    }
  ]
};

// 模拟延迟工具函数
export const simulateDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 生成随机ID
export const generateId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// 格式化时间为相对时间
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  
  return time.toLocaleDateString();
};

const mockDataDefaults = {
  mockUsers,
  mockConversations,
  mockMessages,
  mockNotifications,
  mockAddresses,
  mockSearchHistory,
  mockUserProducts,
  simulateDelay,
  generateId,
  formatRelativeTime
};

export default mockDataDefaults;
