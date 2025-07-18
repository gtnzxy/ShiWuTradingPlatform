import { http, HttpResponse } from 'msw';

// 模拟数据存储
let users = [
  {
    userId: 1,
    username: 'testuser',
    nickname: '测试用户',
    phone: '13800138000',
    email: 'test@example.com',
    password: '123456', // 实际应用中不会存储明文密码
    avatar: 'https://via.placeholder.com/100',
    status: 'ACTIVE',
    role: 'USER',
    realName: '张三',
    gender: '男',
    birthday: '1990-01-01',
    bio: '这是一个测试用户',
    location: '北京市朝阳区',
    createTime: '2024-01-01 00:00:00',
    twoFactorEnabled: false,
    permissions: []
  }
];

let products = [];
let orders = [];
let messages = [];
let notifications = [];

// 生成JWT Token
const generateToken = (user) => {
  return `mock-jwt-token-${user.userId}-${Date.now()}`;
};

// 验证Token
const verifyToken = (request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  if (token.startsWith('mock-jwt-token-')) {
    const userId = parseInt(token.split('-')[3]);
    return users.find(u => u.userId === userId);
  }
  
  return null;
};

// 统一响应格式
const createResponse = (data, message = 'success', code = 200) => ({
  code,
  message,
  data,
  timestamp: new Date().toISOString()
});

export const handlers = [
  // 用户名/手机号登录
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json();
    const { loginType, username, phone, password } = body;
    
    let user;
    if (loginType === 'username') {
      user = users.find(u => u.username === username);
    } else if (loginType === 'phone') {
      user = users.find(u => u.phone === phone);
    }
    
    if (!user || user.password !== password) {
      return HttpResponse.json(
        createResponse(null, '用户名或密码错误', 401),
        { status: 401 }
      );
    }
    
    if (user.status === 'BANNED') {
      return HttpResponse.json(
        createResponse(null, '账号已被封禁', 403),
        { status: 403 }
      );
    }
    
    const token = generateToken(user);
    
    const { password: _, ...userWithoutPassword } = user;
    
    return HttpResponse.json(createResponse({
      user: userWithoutPassword,
      token
    }, '登录成功'));
  }),

  // 用户注册
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = await request.json();
    const { username, phone, email, password, verificationCode } = body;
    
    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
      return HttpResponse.json(
        createResponse(null, '用户名已存在', 400),
        { status: 400 }
      );
    }
    
    // 检查手机号是否已存在
    if (users.find(u => u.phone === phone)) {
      return HttpResponse.json(
        createResponse(null, '手机号已被注册', 400),
        { status: 400 }
      );
    }
    
    // 模拟验证码验证
    if (verificationCode !== '123456') {
      return HttpResponse.json(
        createResponse(null, '验证码错误', 400),
        { status: 400 }
      );
    }
    
    const newUser = {
      userId: users.length + 1,
      username,
      nickname: username,
      phone,
      email: email || null,
      password,
      avatar: 'https://via.placeholder.com/100',
      status: 'ACTIVE',
      role: 'USER',
      realName: null,
      gender: null,
      birthday: null,
      bio: null,
      location: null,
      createTime: new Date().toISOString(),
      twoFactorEnabled: false,
      permissions: []
    };
    
    users.push(newUser);
    
    return HttpResponse.json(createResponse(null, '注册成功'));
  }),

  // 退出登录
  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json(createResponse(null, '退出成功'));
  }),

  // 获取当前用户信息
  http.get('/api/v1/auth/me', ({ request }) => {
    const user = verifyToken(request);
    
    if (!user) {
      return HttpResponse.json(
        createResponse(null, '未登录', 401),
        { status: 401 }
      );
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return HttpResponse.json(createResponse(userWithoutPassword));
  }),

  // 检查用户名是否存在
  http.post('/api/v1/auth/check-username', async ({ request }) => {
    const body = await request.json();
    const { username } = body;
    const exists = users.some(u => u.username === username);
    
    return HttpResponse.json(createResponse({ exists }));
  }),

  // 检查手机号是否存在
  http.post('/api/v1/auth/check-phone', async ({ request }) => {
    const body = await request.json();
    const { phone } = body;
    const exists = users.some(u => u.phone === phone);
    
    return HttpResponse.json(createResponse({ exists }));
  }),

  // 发送注册验证码
  http.post('/api/v1/auth/send-register-code', async ({ request }) => {
    const body = await request.json();
    const { phone } = body;
    
    console.log(`发送注册验证码到手机号: ${phone}, 验证码: 123456`);
    
    return HttpResponse.json(createResponse(null, '验证码已发送'));
  }),

  // 发送重置密码验证码
  http.post('/api/v1/auth/send-reset-code', async ({ request }) => {
    const body = await request.json();
    const { phone } = body;
    
    const userExists = users.some(u => u.phone === phone);
    if (!userExists) {
      return HttpResponse.json(
        createResponse(null, '手机号不存在', 404),
        { status: 404 }
      );
    }
    
    console.log(`发送重置密码验证码到手机号: ${phone}, 验证码: 123456`);
    
    return HttpResponse.json(createResponse(null, '验证码已发送'));
  }),

  // 重置密码
  http.post('/api/v1/auth/reset-password', async ({ request }) => {
    const body = await request.json();
    const { phone, verificationCode, newPassword } = body;
    
    if (verificationCode !== '123456') {
      return HttpResponse.json(
        createResponse(null, '验证码错误', 400),
        { status: 400 }
      );
    }
    
    const userIndex = users.findIndex(u => u.phone === phone);
    if (userIndex === -1) {
      return HttpResponse.json(
        createResponse(null, '手机号不存在', 404),
        { status: 404 }
      );
    }
    
    users[userIndex].password = newPassword;
    
    return HttpResponse.json(createResponse(null, '密码重置成功'));
  }),

  // 获取用户详细信息
  http.get('/api/v1/users/profile', ({ request }) => {
    const user = verifyToken(request);
    
    if (!user) {
      return HttpResponse.json(
        createResponse(null, '未登录', 401),
        { status: 401 }
      );
    }
    
    const { password: _, ...userProfile } = user;
    
    return HttpResponse.json(createResponse(userProfile));
  }),

  // 更新用户信息
  http.put('/api/v1/users/profile', async ({ request }) => {
    const user = verifyToken(request);
    
    if (!user) {
      return HttpResponse.json(
        createResponse(null, '未登录', 401),
        { status: 401 }
      );
    }
    
    const updateData = await request.json();
    const userIndex = users.findIndex(u => u.userId === user.userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updateData };
      const { password: _, ...updatedUser } = users[userIndex];
      
      return HttpResponse.json(createResponse(updatedUser, '更新成功'));
    }
    
    return HttpResponse.json(
      createResponse(null, '用户不存在', 404),
      { status: 404 }
    );
  }),

  // 修改密码
  http.put('/api/v1/users/password', async ({ request }) => {
    const user = verifyToken(request);
    
    if (!user) {
      return HttpResponse.json(
        createResponse(null, '未登录', 401),
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { oldPassword, newPassword } = body;
    
    if (user.password !== oldPassword) {
      return HttpResponse.json(
        createResponse(null, '原密码错误', 400),
        { status: 400 }
      );
    }
    
    const userIndex = users.findIndex(u => u.userId === user.userId);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
    }
    
    return HttpResponse.json(createResponse(null, '密码修改成功'));
  }),

  // 用户统计信息
  http.get('/api/v1/users/stats', ({ request }) => {
    const user = verifyToken(request);
    
    if (!user) {
      return HttpResponse.json(
        createResponse(null, '未登录', 401),
        { status: 401 }
      );
    }
    
    const stats = {
      totalProducts: products.filter(p => p.sellerId === user.userId).length,
      totalOrders: orders.filter(o => o.buyerId === user.userId || o.sellerId === user.userId).length,
      totalFavorites: 0,
      totalViews: 0,
      followingCount: 0,
      followersCount: 0
    };
    
    return HttpResponse.json(createResponse(stats));
  }),

  // 商品相关接口
  http.get('/api/v1/products', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
    const keyword = url.searchParams.get('keyword') || '';
    
    let filteredProducts = products;
    
    if (keyword) {
      filteredProducts = products.filter(p => 
        p.title.includes(keyword) || p.description.includes(keyword)
      );
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filteredProducts.slice(start, end);
    
    return HttpResponse.json(createResponse({
      items,
      total: filteredProducts.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredProducts.length / pageSize)
    }));
  })
];
