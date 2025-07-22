/**
 * API集成测试工具
 * 用于逐一测试前后端接口连接情况
 */

import { authService } from './services/authService';
import { userService } from './services/userService';
import { productService } from './services/productService';
import { categoryService } from './services/categoryService';
import { messageService } from './services/messageService';
import { followService } from './services/followService';
import { cartService } from './services/cartService';
import { orderService } from './services/orderService';
import { reviewService } from './services/reviewService';
import { addressService } from './services/addressService';
import { notificationService } from './services/notificationService';
import { searchService } from './services/searchService';
import { paymentService } from './services/paymentService';

// 测试结果收集器
const testResults = {
  passed: [],
  failed: [],
  total: 0
};

// 测试工具函数
const testAPI = async (testName, apiCall) => {
  testResults.total++;
  console.log(`\n🧪 测试: ${testName}`);
  
  try {
    const result = await apiCall();
    console.log(`✅ ${testName} - 成功`, result);
    testResults.passed.push(testName);
    return result;
  } catch (error) {
    console.error(`❌ ${testName} - 失败:`, error.message);
    testResults.failed.push({ name: testName, error: error.message });
    return null;
  }
};

// 打印测试总结
const printTestSummary = () => {
  console.log('\n' + '='.repeat(50));
  console.log('📊 API测试总结');
  console.log('='.repeat(50));
  console.log(`总测试数: ${testResults.total}`);
  console.log(`✅ 成功: ${testResults.passed.length}`);
  console.log(`❌ 失败: ${testResults.failed.length}`);
  console.log(`成功率: ${((testResults.passed.length / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed.length > 0) {
    console.log('\n❌ 失败的测试:');
    testResults.failed.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }
  
  console.log('\n✅ 成功的测试:');
  testResults.passed.forEach(name => {
    console.log(`  - ${name}`);
  });
};

// 1. 基础连接测试
export const testBasicConnection = async () => {
  console.log('\n🚀 开始基础连接测试...');
  
  // 测试分类接口（无需认证）
  await testAPI('获取商品分类列表', () => categoryService.getCategories());
  
  // 测试商品列表接口（无需认证）
  await testAPI('获取商品列表', () => productService.getProducts({ page: 1, pageSize: 5 }));
};

// 2. 认证相关测试
export const testAuthentication = async () => {
  console.log('\n🔐 开始认证功能测试...');
  
  // 测试用户注册
  const registerData = {
    username: `testuser_${Date.now()}`,
    password: 'password123',
    email: `test_${Date.now()}@example.com`,
    phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    realName: '测试用户',
    studentId: `2024${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
  };
  
  const registerResult = await testAPI('用户注册', () => authService.register(registerData));
  
  if (registerResult) {
    // 测试用户登录
    const loginResult = await testAPI('用户登录', () => 
      authService.login({
        loginType: 'username',
        username: registerData.username,
        password: registerData.password
      })
    );
    
    if (loginResult) {
      // 保存token用于后续测试
      window.testToken = loginResult.token;
      window.testUser = loginResult.user;
      
      // 测试获取用户信息
      await testAPI('获取用户信息', () => userService.getProfile());
    }
  }
};

// 3. 用户相关测试
export const testUserFeatures = async () => {
  console.log('\n👤 开始用户功能测试...');
  
  if (!window.testToken) {
    console.log('⚠️ 跳过用户功能测试 - 需要先完成登录');
    return;
  }
  
  // 测试更新用户资料
  await testAPI('更新用户资料', () => 
    userService.updateProfile({
      bio: '这是测试用户的个人简介',
      location: '北京市'
    })
  );
  
  // 测试获取用户统计
  if (window.testUser) {
    await testAPI('获取用户统计', () => userService.getUserStats(window.testUser.id));
  }
};

// 4. 商品相关测试
export const testProductFeatures = async () => {
  console.log('\n📦 开始商品功能测试...');
  
  if (!window.testToken) {
    console.log('⚠️ 跳过商品功能测试 - 需要先完成登录');
    return;
  }
  
  // 测试发布商品
  const productData = {
    title: `测试商品_${Date.now()}`,
    description: '这是一个测试商品的描述',
    price: 99.99,
    originalPrice: 199.99,
    condition: 'LIKE_NEW',
    categoryId: 1,
    location: '北京市海淀区',
    images: ['test-image-1.jpg'],
    tags: ['测试', '商品']
  };
  
  const productResult = await testAPI('发布商品', () => productService.createProduct(productData));
  
  if (productResult) {
    window.testProductId = productResult.product?.id || productResult.id;
    
    // 测试获取商品详情
    await testAPI('获取商品详情', () => productService.getProductById(window.testProductId));
    
    // 测试获取我的商品
    await testAPI('获取我的商品', () => productService.getMyProducts({ page: 1, pageSize: 5 }));
  }
};

// 5. 购物车和订单测试
export const testCartAndOrder = async () => {
  console.log('\n🛒 开始购物车和订单测试...');
  
  if (!window.testToken || !window.testProductId) {
    console.log('⚠️ 跳过购物车和订单测试 - 需要先完成登录和商品发布');
    return;
  }
  
  // 测试添加到购物车
  await testAPI('添加商品到购物车', () => 
    cartService.addToCart({ productId: window.testProductId, quantity: 1 })
  );
  
  // 测试查看购物车
  const cartResult = await testAPI('查看购物车', () => cartService.getCart());
  
  if (cartResult && cartResult.items && cartResult.items.length > 0) {
    // 测试创建订单
    await testAPI('创建订单', () => 
      orderService.createOrder({ productIds: [window.testProductId] })
    );
    
    // 测试获取订单列表
    await testAPI('获取买家订单列表', () => 
      orderService.getMyPurchases({ page: 1, pageSize: 5 })
    );
  }
};

// 6. 消息和通知测试
export const testMessagingFeatures = async () => {
  console.log('\n💬 开始消息和通知测试...');
  
  if (!window.testToken) {
    console.log('⚠️ 跳过消息功能测试 - 需要先完成登录');
    return;
  }
  
  // 测试获取会话列表
  await testAPI('获取会话列表', () => messageService.getConversations());
  
  // 测试获取未读消息数量
  await testAPI('获取未读消息数量', () => messageService.getUnreadCount());
  
  // 测试获取通知列表
  await testAPI('获取通知列表', () => notificationService.getNotifications());
};

// 7. 搜索功能测试
export const testSearchFeatures = async () => {
  console.log('\n🔍 开始搜索功能测试...');
  
  // 测试商品搜索
  await testAPI('搜索商品', () => 
    searchService.searchProducts({ keyword: '测试', page: 1, pageSize: 5 })
  );
  
  // 测试获取热门关键词
  await testAPI('获取热门关键词', () => searchService.getHotKeywords());
};

// 主测试函数
export const runAllTests = async () => {
  console.log('🚀 开始完整的API集成测试...');
  console.log('请确保后端服务已启动在 http://localhost:8080');
  
  // 重置测试结果
  testResults.passed = [];
  testResults.failed = [];
  testResults.total = 0;
  
  try {
    await testBasicConnection();
    await testAuthentication();
    await testUserFeatures();
    await testProductFeatures();
    await testCartAndOrder();
    await testMessagingFeatures();
    await testSearchFeatures();
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
  
  printTestSummary();
};

// 在开发环境下自动暴露到全局
if (process.env.NODE_ENV === 'development') {
  window.runAPITests = runAllTests;
  window.testBasicConnection = testBasicConnection;
  window.testAuthentication = testAuthentication;
  window.testUserFeatures = testUserFeatures;
  window.testProductFeatures = testProductFeatures;
  window.testCartAndOrder = testCartAndOrder;
  window.testMessagingFeatures = testMessagingFeatures;
  window.testSearchFeatures = testSearchFeatures;
  
  console.log('🧪 API测试工具已加载！');
  console.log('使用方法:');
  console.log('  - window.runAPITests() - 运行所有测试');
  console.log('  - window.testBasicConnection() - 测试基础连接');
  console.log('  - window.testAuthentication() - 测试认证功能');
  console.log('  - 其他单独测试函数...');
}
