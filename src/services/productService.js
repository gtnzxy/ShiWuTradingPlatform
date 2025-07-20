import apiClient from './api';
import { mockUserProducts, simulateDelay } from '../utils/mockData';

// 开发环境使用Mock数据
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// 商品状态枚举
export const PRODUCT_STATUS = {
  AVAILABLE: 'AVAILABLE',       // 可售
  SOLD: 'SOLD',                // 已售出  
  OFF_SHELF: 'OFF_SHELF',      // 下架
  PENDING: 'PENDING'           // 待审核
};

// 商品排序枚举
export const PRODUCT_SORT = {
  LATEST: 'latest',            // 最新发布
  PRICE_LOW: 'price_low',      // 价格从低到高
  PRICE_HIGH: 'price_high',    // 价格从高到低
  POPULAR: 'popular'           // 最受欢迎
};

// 商品分类枚举
export const PRODUCT_CATEGORY = {
  ELECTRONICS: 1,              // 电子产品
  BOOKS: 2,                   // 图书文具
  CLOTHING: 3,                // 服装鞋帽
  SPORTS: 4,                  // 运动用品
  DAILY: 5,                   // 生活用品
  OTHER: 99                   // 其他
};

// 导出商品分类文本映射
export const CATEGORY_TEXTS = {
  [PRODUCT_CATEGORY.ELECTRONICS]: '电子产品',
  [PRODUCT_CATEGORY.BOOKS]: '图书文具',
  [PRODUCT_CATEGORY.CLOTHING]: '服装鞋帽',
  [PRODUCT_CATEGORY.SPORTS]: '运动用品',
  [PRODUCT_CATEGORY.DAILY]: '生活用品',
  [PRODUCT_CATEGORY.OTHER]: '其他'
};

// 导出商品状态文本映射
export const STATUS_TEXTS = {
  [PRODUCT_STATUS.AVAILABLE]: '在售',
  [PRODUCT_STATUS.SOLD]: '已售',
  [PRODUCT_STATUS.OFF_SHELF]: '下架',
  [PRODUCT_STATUS.PENDING]: '审核中'
};

// 商品服务
export const productService = {
  // 获取商品列表
  getProducts: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);

      // 合并所有用户的商品
      let allProducts = [];
      for (const userId in mockUserProducts) {
        const userProducts = mockUserProducts[userId].map(product => ({
          ...product,
          categoryName: CATEGORY_TEXTS[product.category] || '其他',
          seller: {
            id: parseInt(userId),
            nickname: `用户${userId}`,
            avatar: `https://via.placeholder.com/40x40/87CEEB/000000?text=U${userId}`,
            rating: 4.5,
            location: '北京市'
          }
        }));
        allProducts = allProducts.concat(userProducts);
      }

      // 按创建时间排序（最新的在前）
      allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = allProducts.slice(start, end);

      return {
        data: paginatedData,
        total: allProducts.length,
        page,
        pageSize
      };
    }

    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取商品列表失败: ${error.message}`);
    }
  },

  // 获取商品详情
  getProductById: async (productId) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);

      // 在所有用户的商品中查找
      for (const userId in mockUserProducts) {
        const userProducts = mockUserProducts[userId];
        const product = userProducts.find(p => p.id === parseInt(productId));
        if (product) {
          return {
            ...product,
            isOwner: parseInt(userId) === 1, // 假设当前用户ID为1
            isFavorited: false,
            viewCount: Math.floor(Math.random() * 100) + 1,
            categoryName: CATEGORY_TEXTS[product.category] || '其他',
            seller: {
              id: parseInt(userId),
              nickname: `用户${userId}`,
              avatar: `https://via.placeholder.com/40x40/87CEEB/000000?text=U${userId}`,
              rating: 4.5,
              location: '北京市'
            }
          };
        }
      }

      // 如果没找到，抛出错误
      throw new Error('商品不存在');
    }

    try {
      const response = await apiClient.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(`获取商品详情失败: ${error.message}`);
    }
  },

  // 发布商品
  createProduct: async (productData) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(500);
      
      // 模拟创建商品
      const newProduct = {
        id: Date.now(), // 简单的ID生成
        ...productData,
        status: PRODUCT_STATUS.AVAILABLE,
        views: 0,
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 将商品添加到当前用户的商品列表中（模拟持久化）
      const currentUserId = 1;
      if (!mockUserProducts[currentUserId]) {
        mockUserProducts[currentUserId] = [];
      }
      mockUserProducts[currentUserId].unshift(newProduct);
      
      return { product: newProduct };
    }
    
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error) {
      throw new Error(`发布商品失败: ${error.message}`);
    }
  },

  // 更新商品
  updateProduct: async (productId, productData) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      
      // 在Mock数据中更新商品
      const currentUserId = 1;
      const userProducts = mockUserProducts[currentUserId] || [];
      const productIndex = userProducts.findIndex(p => p.id === parseInt(productId));
      
      if (productIndex !== -1) {
        mockUserProducts[currentUserId][productIndex] = {
          ...userProducts[productIndex],
          ...productData,
          updatedAt: new Date().toISOString()
        };
        return { product: mockUserProducts[currentUserId][productIndex] };
      } else {
        throw new Error('商品不存在');
      }
    }
    
    try {
      const response = await apiClient.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw new Error(`更新商品失败: ${error.message}`);
    }
  },

  // 删除商品
  deleteProduct: async (productId) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      
      // 在Mock数据中删除商品
      const currentUserId = 1;
      const userProducts = mockUserProducts[currentUserId] || [];
      const productIndex = userProducts.findIndex(p => p.id === parseInt(productId));
      
      if (productIndex !== -1) {
        mockUserProducts[currentUserId].splice(productIndex, 1);
        return { success: true };
      } else {
        throw new Error('商品不存在');
      }
    }
    
    try {
      const response = await apiClient.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw new Error(`删除商品失败: ${error.message}`);
    }
  },

  // 获取商品分类列表
  getCategories: async () => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      
      // 🚨 MOCK CATEGORIES - 严格按照PRODUCT_CATEGORY枚举
      return [
        { id: 1, name: '电子产品', icon: '📱' },
        { id: 2, name: '图书文具', icon: '📚' },
        { id: 3, name: '服装鞋帽', icon: '👔' },
        { id: 4, name: '运动用品', icon: '⚽' },
        { id: 5, name: '生活用品', icon: '🏠' },
        { id: 99, name: '其他', icon: '📦' }
      ];
    }
    
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      throw new Error(`获取分类列表失败: ${error.message}`);
    }
  },

  // 搜索商品
  searchProducts: async (searchParams) => {
    try {
      const response = await apiClient.get('/products/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw new Error(`搜索商品失败: ${error.message}`);
    }
  },

  // 收藏商品
  favoriteProduct: async (productId) => {
    try {
      const response = await apiClient.post(`/products/${productId}/favorite`);
      return response.data;
    } catch (error) {
      throw new Error(`收藏商品失败: ${error.message}`);
    }
  },

  // 取消收藏
  unfavoriteProduct: async (productId) => {
    try {
      const response = await apiClient.delete(`/products/${productId}/favorite`);
      return response.data;
    } catch (error) {
      throw new Error(`取消收藏失败: ${error.message}`);
    }
  },

  // 获取我的商品列表
  getMyProducts: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      
      // 模拟当前用户ID为1
      const currentUserId = 1;
      const userProducts = mockUserProducts[currentUserId] || [];
      
      // 状态筛选
      let filteredProducts = userProducts;
      if (params.status) {
        filteredProducts = userProducts.filter(product => product.status === params.status);
      }
      
      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filteredProducts.slice(start, end);
      
      return {
        products: paginatedData,
        total: filteredProducts.length,
        page,
        pageSize
      };
    }
    
    try {
      const response = await apiClient.get('/products/my', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取我的商品失败: ${error.message}`);
    }
  },

  // 获取我的收藏列表
  getMyFavorites: async (params = {}) => {
    try {
      const response = await apiClient.get('/products/favorites', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取收藏列表失败: ${error.message}`);
    }
  },

  // 获取指定用户的商品列表
  getUserProducts: async (userId, params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      
      const userProducts = mockUserProducts[parseInt(userId)] || []; // 转换为数字
      
      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = userProducts.slice(start, end);
      
      return {
        data: paginatedData,
        total: userProducts.length,
        page,
        pageSize
      };
    }
    
    try {
      const response = await apiClient.get(`/users/${userId}/products`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取用户商品失败: ${error.message}`);
    }
  },

  // 商品上架
  listProduct: async (productId) => {
    try {
      const response = await apiClient.put(`/products/${productId}/list`);
      return response.data;
    } catch (error) {
      throw new Error(`商品上架失败: ${error.message}`);
    }
  },

  // 商品下架
  delistProduct: async (productId) => {
    try {
      const response = await apiClient.put(`/products/${productId}/delist`);
      return response.data;
    } catch (error) {
      throw new Error(`商品下架失败: ${error.message}`);
    }
  },

  // 上传商品图片
  uploadImage: async (file) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(1000); // 模拟上传延迟
      
      // 🚨 MOCK UPLOAD - 仅用于开发调试
      return {
        url: `https://via.placeholder.com/300x300/87CEEB/000000?text=IMG${Date.now()}`,
        filename: file.name || `image_${Date.now()}.jpg`,
        size: file.size || 1024 * 200 // 200KB
      };
    }
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiClient.post('/api/v1/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(`图片上传失败: ${error.message}`);
    }
  },

  // 切换商品状态（上架/下架）
  toggleProductStatus: async (productId, action) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      
      // 在Mock数据中更新商品状态
      const currentUserId = 1;
      const userProducts = mockUserProducts[currentUserId] || [];
      const productIndex = userProducts.findIndex(p => p.id === parseInt(productId));
      
      if (productIndex !== -1) {
        const newStatus = action === 'off_shelf' ? PRODUCT_STATUS.OFF_SHELF : PRODUCT_STATUS.AVAILABLE;
        mockUserProducts[currentUserId][productIndex] = {
          ...userProducts[productIndex],
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        return { product: mockUserProducts[currentUserId][productIndex] };
      } else {
        throw new Error('商品不存在');
      }
    }
    
    try {
      const endpoint = action === 'off_shelf' ? 'delist' : 'list';
      const response = await apiClient.put(`/products/${productId}/${endpoint}`);
      return response.data;
    } catch (error) {
      throw new Error(`状态更新失败: ${error.message}`);
    }
  }
};
