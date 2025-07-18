import { http, HttpResponse } from 'msw';

// Mock数据
const mockUsers = [
  {
    id: 1,
    username: 'testuser',
    nickname: '测试用户',
    email: 'test@example.com',
    avatar: null,
    status: 'ACTIVE',
    followerCount: 10,
    averageRating: 4.5,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const mockProducts = [
  {
    id: 1,
    title: 'iPhone 13 Pro 二手',
    description: '95新，无磕碰，功能正常',
    price: 3999.99,
    status: 'ON_SALE',
    imageUrls: ['/api/placeholder/300/300'],
    category: { id: 2, name: '电子产品' },
    condition: 'LIKE_NEW',
    seller: mockUsers[0],
    createdAt: '2024-01-15T10:00:00Z'
  }
];

// 认证相关API
export const authHandlers = [
  // 登录
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { username, password } = await request.json();
    
    // 模拟登录验证
    if (username === 'testuser' && password === '123456') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: mockUsers[0]
        }
      });
    }
    
    return HttpResponse.json({
      success: false,
      error: {
        code: 'A0101',
        message: 'Invalid credentials',
        userTip: '用户名或密码错误'
      }
    }, { status: 401 });
  }),

  // 注册
  http.post('/api/v1/auth/register', async ({ request }) => {
    const userData = await request.json();
    
    // 模拟注册处理
    const newUser = {
      id: Date.now(),
      ...userData,
      status: 'ACTIVE',
      followerCount: 0,
      averageRating: 0,
      createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return HttpResponse.json({
      success: true,
      data: {
        userId: newUser.id,
        message: '注册成功'
      }
    }, { status: 201 });
  }),

  // 获取用户信息
  http.get('/api/v1/auth/profile', () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers[0]
    });
  }),

  // 退出登录
  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      data: {
        message: '退出成功'
      }
    });
  })
];

// 商品相关API
export const productHandlers = [
  // 获取商品列表
  http.get('/api/v1/products', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    
    return HttpResponse.json({
      success: true,
      data: {
        items: mockProducts,
        total: mockProducts.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockProducts.length / pageSize)
      }
    });
  }),

  // 获取商品详情
  http.get('/api/v1/products/:id', ({ params }) => {
    const product = mockProducts.find(p => p.id === parseInt(params.id));
    
    if (!product) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'B0001',
          message: 'Product not found',
          userTip: '商品不存在'
        }
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      success: true,
      data: product
    });
  }),

  // 获取商品分类
  http.get('/api/v1/categories', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, name: '图书教材', icon: '📚' },
        { id: 2, name: '电子产品', icon: '📱' },
        { id: 3, name: '服装配饰', icon: '👔' },
        { id: 4, name: '生活用品', icon: '🏠' },
        { id: 5, name: '运动健身', icon: '🏃' }
      ]
    });
  })
];

// 用户相关API
export const userHandlers = [
  // 获取用户信息
  http.get('/api/v1/users/:id', ({ params }) => {
    const user = mockUsers.find(u => u.id === parseInt(params.id));
    
    if (!user) {
      return HttpResponse.json({
        success: false,
        error: {
          code: 'A0201',
          message: 'User not found',
          userTip: '用户不存在'
        }
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      success: true,
      data: user
    });
  })
];

// 订单相关API
export const orderHandlers = [
  // 获取订单列表
  http.get('/api/v1/orders', () => {
    return HttpResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      }
    });
  })
];

// 消息相关API
export const messageHandlers = [
  // 获取对话列表
  http.get('/api/v1/conversations', () => {
    return HttpResponse.json({
      success: true,
      data: {
        items: [],
        total: 0
      }
    });
  }),

  // 获取通知列表
  http.get('/api/v1/notifications', () => {
    return HttpResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        unreadCount: 0
      }
    });
  })
];

// 导出所有处理器
export const handlers = [
  ...authHandlers,
  ...productHandlers,
  ...userHandlers,
  ...orderHandlers,
  ...messageHandlers
];
