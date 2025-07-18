import { http, HttpResponse } from 'msw';

// ======================================
// 🚨 MOCK DATA - 仅用于前端开发调试
// ⚠️  后期集成真实后端时需要删除
// 按照 FRONTEND_REQUIREMENTS.md 和 Core Coding.md 规范
// ======================================

// Mock用户数据
const mockUsers = [
  {
    id: 1,
    username: 'test_user',
    nickname: '测试用户',
    email: 'test@example.com',
    phone: '13800138001',
    avatar: 'https://via.placeholder.com/150/87CEEB/000000?text=U',
    status: 'ACTIVE',
    followerCount: 10,
    averageRating: 4.5,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Mock商品数据 - 严格按照productService.js中的数据结构
const mockProducts = [
  {
    id: 1,
    title: 'iPhone 13 Pro 二手',
    description: '95新，无磕碰，功能正常',
    price: 3999.99,
    status: 'ON_SALE',
    imageUrls: ['https://via.placeholder.com/300x300/87CEEB/000000?text=iPhone'],
    category: { id: 1, name: '电子产品' },
    condition: 'LIKE_NEW',
    seller: mockUsers[0],
    createdAt: '2024-01-15T10:00:00Z'
  }
];

// ======================================
// 认证相关API - 按照authService.js规范
// ======================================
export const authHandlers = [
  // 用户登录
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { username, password } = await request.json();
    
    // 🚨 MOCK LOGIN - 仅用于开发调试
    if (username === 'test_user' && password === 'password123') {
      return HttpResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-token-dev-only',
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

  // 获取用户信息
  http.get('/api/v1/auth/profile', () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers[0]
    });
  }),

  // 用户注册
  http.post('/api/v1/auth/register', async ({ request }) => {
    const userData = await request.json();
    
    return HttpResponse.json({
      success: true,
      data: {
        token: 'mock-jwt-token-dev-only',
        user: {
          id: 2,
          username: userData.username,
          nickname: userData.nickname || userData.username,
          email: userData.email,
          avatar: null,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        }
      }
    });
  })
];

// ======================================
// 商品相关API - 严格按照Design.md和SRS规范
// ======================================
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

  // 🚨 MOCK API - 获取商品分类 (按照PRODUCT_CATEGORY枚举)
  http.get('/api/v1/categories', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, name: '电子产品', icon: '📱' },
        { id: 2, name: '图书文具', icon: '📚' },
        { id: 3, name: '服装鞋帽', icon: '👔' },
        { id: 4, name: '运动用品', icon: '⚽' },
        { id: 5, name: '生活用品', icon: '🏠' },
        { id: 99, name: '其他', icon: '📦' }
      ]
    });
  }),

  // 🚨 MOCK API - 搜索商品
  http.get('/api/v1/products/search', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    
    return HttpResponse.json({
      success: true,
      data: {
        products: mockProducts,
        total: mockProducts.length,
        page,
        pageSize,
        totalPages: Math.ceil(mockProducts.length / pageSize)
      }
    });
  }),

  // 🚨 MOCK API - 获取我的商品列表 (严格按照productService.getMyProducts)
  http.get('/api/v1/products/my', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const status = url.searchParams.get('status');
    
    // 模拟当前用户的商品数据 - 严格按照mockData.js结构
    let userProducts = [
      {
        id: 1,
        title: 'iPhone 14 Pro 256GB 深空黑',
        price: 6999,
        mainImage: 'https://via.placeholder.com/300x300/87CEEB/000000?text=iPhone',
        status: 'AVAILABLE',
        categoryId: 1,
        categoryName: '电子产品',
        views: 156,
        likes: 23,
        description: '个人自用iPhone 14 Pro，成色很新，配件齐全',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        title: 'MacBook Air M2 8+256GB 银色',
        price: 7899,
        mainImage: 'https://via.placeholder.com/300x300/FFB6C1/000000?text=MacBook',
        status: 'AVAILABLE',
        categoryId: 1,
        categoryName: '电子产品',
        views: 234,
        likes: 45,
        description: 'MacBook Air M2，轻薄便携，适合学生使用',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 3,
        title: '高等数学第七版（同济大学版）',
        price: 25,
        mainImage: 'https://via.placeholder.com/300x300/DDA0DD/000000?text=Math',
        status: 'AVAILABLE',
        categoryId: 2,
        categoryName: '图书文具',
        views: 78,
        likes: 12,
        description: '大学高数教材，内容完整无缺页',
        createdAt: new Date(Date.now() - 345600000).toISOString()
      }
    ];
    
    // 状态筛选
    if (status) {
      userProducts = userProducts.filter(product => product.status === status);
    }
    
    // 分页处理
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = userProducts.slice(start, end);
    
    return HttpResponse.json({
      success: true,
      data: {
        products: paginatedData,
        total: userProducts.length,
        page,
        pageSize
      }
    });
  }),

  // 🚨 MOCK API - 发布商品 (严格按照productService.createProduct)
  http.post('/api/v1/products', async ({ request }) => {
    const productData = await request.json();
    
    const newProduct = {
      id: Date.now(),
      ...productData,
      status: 'AVAILABLE',
      views: 0,
      likes: 0,
      mainImage: productData.images?.[0] || 'https://via.placeholder.com/300x300/98FB98/000000?text=New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({
      success: true,
      data: { 
        product: newProduct,
        message: '商品发布成功'
      }
    });
  }),

  // 🚨 MOCK API - 更新商品
  http.put('/api/v1/products/:id', async ({ params, request }) => {
    const productData = await request.json();
    
    const updatedProduct = {
      id: parseInt(params.id),
      ...productData,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json({
      success: true,
      data: { 
        product: updatedProduct,
        message: '商品更新成功'
      }
    });
  }),

  // 🚨 MOCK API - 删除商品
  http.delete('/api/v1/products/:id', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { message: '删除成功' }
    });
  }),

  // 🚨 MOCK API - 商品上架
  http.put('/api/v1/products/:id/list', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { message: '上架成功' }
    });
  }),

  // 🚨 MOCK API - 商品下架
  http.put('/api/v1/products/:id/delist', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: { message: '下架成功' }
    });
  }),

  // 🚨 MOCK API - 获取商品详情
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
  })
];

// ======================================
// 文件上传相关API - 按照uploadService.js规范
// ======================================
export const uploadHandlers = [
  // 🚨 MOCK API - 图片上传
  http.post('/api/v1/upload/image', async ({ request }) => {
    // 模拟图片上传延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return HttpResponse.json({
      success: true,
      data: {
        url: `https://via.placeholder.com/300x300/87CEEB/000000?text=IMG${Date.now()}`,
        filename: `image_${Date.now()}.jpg`,
        size: 1024 * 200 // 200KB
      }
    });
  })
];

// ======================================
// 用户相关API
// ======================================
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

// ======================================
// 其他业务API占位符
// ======================================
export const orderHandlers = [
  http.get('/api/v1/orders', () => {
    return HttpResponse.json({
      success: true,
      data: { items: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }
    });
  })
];

export const messageHandlers = [
  http.get('/api/v1/conversations', () => {
    return HttpResponse.json({
      success: true,
      data: { items: [], total: 0 }
    });
  }),
  
  http.get('/api/v1/notifications', () => {
    return HttpResponse.json({
      success: true,
      data: { items: [], total: 0, unreadCount: 0 }
    });
  })
];

// ======================================
// 导出所有处理器
// ⚠️  严格按照模块解耦原则 (Core Coding.md)
// ⚠️  后期集成真实后端时需要移除MSW配置
// ======================================
export const handlers = [
  ...authHandlers,
  ...productHandlers,
  ...uploadHandlers,
  ...userHandlers,
  ...orderHandlers,
  ...messageHandlers
];
