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
let currentUserId = null;

// 生成JWT Token
const generateToken = (user) => {
  return `mock-jwt-token-${user.userId}-${Date.now()}`;
};

// 验证Token
const verifyToken = (req) => {
  const authHeader = req.headers.get('authorization');
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
  rest.post('/api/v1/auth/login', (req, res, ctx) => {
    const { loginType, username, phone, password, rememberMe } = req.body;
    
    let user;
    if (loginType === 'username') {
      user = users.find(u => u.username === username);
    } else if (loginType === 'phone') {
      user = users.find(u => u.phone === phone);
    }
    
    if (!user || user.password !== password) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '用户名或密码错误', 401))
      );
    }
    
    if (user.status === 'BANNED') {
      return res(
        ctx.status(403),
        ctx.json(createResponse(null, '账号已被封禁', 403))
      );
    }
    
    const token = generateToken(user);
    currentUserId = user.userId;
    
    const { password: _, ...userWithoutPassword } = user;
    
    return res(
      ctx.json(createResponse({
        user: userWithoutPassword,
        token
      }, '登录成功'))
    );
  }),

  // 用户注册
  rest.post('/api/v1/auth/register', (req, res, ctx) => {
    const { username, phone, email, password, verificationCode } = req.body;
    
    // 检查用户名是否已存在
    if (users.find(u => u.username === username)) {
      return res(
        ctx.status(400),
        ctx.json(createResponse(null, '用户名已存在', 400))
      );
    }
    
    // 检查手机号是否已存在
    if (users.find(u => u.phone === phone)) {
      return res(
        ctx.status(400),
        ctx.json(createResponse(null, '手机号已被注册', 400))
      );
    }
    
    // 模拟验证码验证
    if (verificationCode !== '123456') {
      return res(
        ctx.status(400),
        ctx.json(createResponse(null, '验证码错误', 400))
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
    
    return res(
      ctx.json(createResponse(null, '注册成功'))
    );
  }),

  // 退出登录
  rest.post('/api/v1/auth/logout', (req, res, ctx) => {
    currentUserId = null;
    return res(
      ctx.json(createResponse(null, '退出成功'))
    );
  }),

  // 获取当前用户信息
  rest.get('/api/v1/auth/me', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return res(
      ctx.json(createResponse(userWithoutPassword))
    );
  }),

  // 检查用户名是否存在
  rest.post('/api/v1/auth/check-username', (req, res, ctx) => {
    const { username } = req.body;
    const exists = users.some(u => u.username === username);
    
    return res(
      ctx.json(createResponse({ exists }))
    );
  }),

  // 检查手机号是否存在
  rest.post('/api/v1/auth/check-phone', (req, res, ctx) => {
    const { phone } = req.body;
    const exists = users.some(u => u.phone === phone);
    
    return res(
      ctx.json(createResponse({ exists }))
    );
  }),

  // 发送注册验证码
  rest.post('/api/v1/auth/send-register-code', (req, res, ctx) => {
    const { phone } = req.body;
    
    // 模拟发送验证码
    console.log(`发送注册验证码到手机号: ${phone}, 验证码: 123456`);
    
    return res(
      ctx.json(createResponse(null, '验证码已发送'))
    );
  }),

  // 发送重置密码验证码
  rest.post('/api/v1/auth/send-reset-code', (req, res, ctx) => {
    const { phone } = req.body;
    
    // 检查手机号是否存在
    const userExists = users.some(u => u.phone === phone);
    if (!userExists) {
      return res(
        ctx.status(404),
        ctx.json(createResponse(null, '手机号不存在', 404))
      );
    }
    
    console.log(`发送重置密码验证码到手机号: ${phone}, 验证码: 123456`);
    
    return res(
      ctx.json(createResponse(null, '验证码已发送'))
    );
  }),

  // 重置密码
  rest.post('/api/v1/auth/reset-password', (req, res, ctx) => {
    const { phone, verificationCode, newPassword } = req.body;
    
    if (verificationCode !== '123456') {
      return res(
        ctx.status(400),
        ctx.json(createResponse(null, '验证码错误', 400))
      );
    }
    
    const userIndex = users.findIndex(u => u.phone === phone);
    if (userIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json(createResponse(null, '手机号不存在', 404))
      );
    }
    
    users[userIndex].password = newPassword;
    
    return res(
      ctx.json(createResponse(null, '密码重置成功'))
    );
  }),

  // 获取用户详细信息
  rest.get('/api/v1/users/profile', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const { password: _, ...userProfile } = user;
    
    return res(
      ctx.json(createResponse(userProfile))
    );
  }),

  // 更新用户信息
  rest.put('/api/v1/users/profile', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const updateData = req.body;
    const userIndex = users.findIndex(u => u.userId === user.userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updateData };
      const { password: _, ...updatedUser } = users[userIndex];
      
      return res(
        ctx.json(createResponse(updatedUser, '更新成功'))
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json(createResponse(null, '用户不存在', 404))
    );
  }),

  // 修改密码
  rest.put('/api/v1/users/password', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const { oldPassword, newPassword } = req.body;
    
    if (user.password !== oldPassword) {
      return res(
        ctx.status(400),
        ctx.json(createResponse(null, '原密码错误', 400))
      );
    }
    
    const userIndex = users.findIndex(u => u.userId === user.userId);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
    }
    
    return res(
      ctx.json(createResponse(null, '密码修改成功'))
    );
  }),

  // 发送绑定手机号验证码
  rest.post('/api/v1/users/send-bind-phone-code', (req, res, ctx) => {
    const { phone } = req.body;
    
    console.log(`发送绑定手机号验证码到: ${phone}, 验证码: 123456`);
    
    return res(
      ctx.json(createResponse(null, '验证码已发送'))
    );
  }),

  // 绑定手机号
  rest.post('/api/v1/users/bind-phone', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const { phone, verificationCode } = req.body;
    
    if (verificationCode !== '123456') {
      return res(
        ctx.status(400),
        ctx.json(createResponse(null, '验证码错误', 400))
      );
    }
    
    const userIndex = users.findIndex(u => u.userId === user.userId);
    if (userIndex !== -1) {
      users[userIndex].phone = phone;
    }
    
    return res(
      ctx.json(createResponse(null, '手机号绑定成功'))
    );
  }),

  // 绑定邮箱
  rest.post('/api/v1/users/bind-email', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const { email, verificationCode } = req.body;
    
    if (verificationCode !== '123456') {
      return res(
        ctx.status(400),
        ctx.json(createResponse(null, '验证码错误', 400))
      );
    }
    
    const userIndex = users.findIndex(u => u.userId === user.userId);
    if (userIndex !== -1) {
      users[userIndex].email = email;
    }
    
    return res(
      ctx.json(createResponse(null, '邮箱绑定成功'))
    );
  }),

  // 商品相关接口
  rest.get('/api/v1/products', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page')) || 1;
    const pageSize = parseInt(req.url.searchParams.get('pageSize')) || 20;
    const keyword = req.url.searchParams.get('keyword') || '';
    const categoryId = req.url.searchParams.get('categoryId');
    
    let filteredProducts = products;
    
    if (keyword) {
      filteredProducts = products.filter(p => 
        p.title.includes(keyword) || p.description.includes(keyword)
      );
    }
    
    if (categoryId) {
      filteredProducts = filteredProducts.filter(p => 
        p.categoryId === parseInt(categoryId)
      );
    }
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filteredProducts.slice(start, end);
    
    return res(
      ctx.json(createResponse({
        items,
        total: filteredProducts.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredProducts.length / pageSize)
      }))
    );
  }),

  // 用户统计信息
  rest.get('/api/v1/users/stats', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const stats = {
      totalProducts: products.filter(p => p.sellerId === user.userId).length,
      totalOrders: orders.filter(o => o.buyerId === user.userId || o.sellerId === user.userId).length,
      totalFavorites: 0, // 模拟数据
      totalViews: 0, // 模拟数据
      followingCount: 0, // 模拟数据
      followersCount: 0 // 模拟数据
    };
    
    return res(
      ctx.json(createResponse(stats))
    );
  }),

  // 消息相关接口
  rest.get('/api/v1/messages', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const userMessages = messages.filter(m => 
      m.senderId === user.userId || m.receiverId === user.userId
    );
    
    return res(
      ctx.json(createResponse(userMessages))
    );
  }),

  // 通知相关接口
  rest.get('/api/v1/notifications', (req, res, ctx) => {
    const user = verifyToken(req);
    
    if (!user) {
      return res(
        ctx.status(401),
        ctx.json(createResponse(null, '未登录', 401))
      );
    }
    
    const userNotifications = notifications.filter(n => n.userId === user.userId);
    
    return res(
      ctx.json(createResponse(userNotifications))
    );
  }),

  // 404 处理
  rest.get('*', (req, res, ctx) => {
    return res(
      ctx.status(404),
      ctx.json(createResponse(null, '接口不存在', 404))
    );
  })
];
