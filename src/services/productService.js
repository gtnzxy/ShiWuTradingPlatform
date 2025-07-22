import apiClient from './api';
import { mockUserProducts, simulateDelay } from '../utils/mockData';

// 使用真实后端API
const USE_MOCK_DATA = false;

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

// 后端英文分类名称到中文的映射表
export const ENGLISH_TO_CHINESE_CATEGORY = {
  'Electronics': '电子产品',
  'Books': '图书文具',
  'Fashion': '服装鞋帽',
  'Sports': '运动用品',
  'Daily Goods': '生活用品',
  'Mobile Phones': '手机数码',
  'Computers': '电脑设备',
  'Professional Books': '专业书籍',
  'Literature': '文学作品',
  'Sports Shoes': '运动鞋',
  'Clothing': '服装',
  'Home': '家居',
  'Other': '其他'

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
            avatar: '/placeholder-avatar.svg',
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
      // 构建查询参数
      const queryParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        ...params
      };

      const response = await apiClient.get('/products', { params: queryParams });
      console.log('🔍 商品列表API响应:', response);

      // 处理后端返回的数据结构 - 实际返回 {data: Array, total, page, pageSize, pages}
      const responseData = response.data;
      const list = responseData.data || responseData.list || [];
      const total = responseData.total || 0;
      const pages = responseData.pages || 1;
      const pageSize = responseData.pageSize || 20;

      console.log('📋 解析后的商品列表:', list);

      // 转换数据格式以匹配前端期望的格式
      const transformedList = list.map(product => {
        // 安全的日期转换函数
        const safeParseDate = (dateValue) => {
          if (!dateValue) return new Date().toISOString();

          try {
            // 如果是数组格式 [year, month, day, hour, minute, second]
            if (Array.isArray(dateValue) && dateValue.length >= 6) {
              // 注意：JavaScript的月份是从0开始的，所以需要减1
              const date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2],
                                  dateValue[3], dateValue[4], dateValue[5]);
              if (isNaN(date.getTime())) {
                console.warn('无效的日期数组格式:', dateValue);
                return new Date().toISOString();
              }
              return date.toISOString();
            }

            // 如果是字符串格式
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
              console.warn('无效的日期格式:', dateValue);
              return new Date().toISOString();
            }
            return date.toISOString();
          } catch (error) {
            console.warn('日期解析错误:', dateValue, error);
            return new Date().toISOString();
          }
        };

        // 获取分类中文名称
        let categoryName = '其他';
        if (product.categoryName) {
          // 如果后端返回了分类名称，转换为中文
          categoryName = ENGLISH_TO_CHINESE_CATEGORY[product.categoryName] || product.categoryName;
        } else if (product.categoryId) {
          // 如果只有分类ID，使用ID映射
          categoryName = CATEGORY_TEXTS[product.categoryId] || '其他';
        }

        return {
          id: product.id,
          productId: product.id, // ProductCard期望的字段
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          mainImageUrl: product.mainImageUrl || '/placeholder-image.svg',
          imageUrls: product.imageUrls || [product.mainImageUrl || '/placeholder-image.svg'],
          description: product.description || '',
          category: product.categoryName ? { name: categoryName } : null, // CategoryTag期望的格式
          categoryName: categoryName,
          status: product.status === 1 ? PRODUCT_STATUS.ON_SALE : PRODUCT_STATUS.DELISTED, // 使用正确的状态常量
          createdAt: safeParseDate(product.createTime),
          sellerId: product.sellerId,
          viewCount: product.views || product.viewCount || 0, // 统一字段名
          favoriteCount: product.likes || product.favoriteCount || 0, // 统一字段名
          isFavorited: product.isFavorited || false,
          seller: {
            id: product.sellerId,
            nickname: `用户${product.sellerId}`,
            avatarUrl: '/placeholder-avatar.svg', // ProductCard期望avatarUrl字段
            rating: 4.5,
            location: '北京市'
          }
        };
      });

      return {
        data: transformedList,
        total: total,
        page: queryParams.page,
        pageSize: pageSize,
        pages: pages
      };
    } catch (error) {
      console.error('获取商品列表失败:', error);
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
              avatar: '/placeholder-avatar.svg',
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
      const product = response.data;

      // 转换分类名称为中文
      if (product && product.categoryName) {
        product.categoryName = ENGLISH_TO_CHINESE_CATEGORY[product.categoryName] || product.categoryName;
      } else if (product && product.categoryId) {
        product.categoryName = CATEGORY_TEXTS[product.categoryId] || '其他';
      }

      return product;
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
      const response = await apiClient.post(`/products/${productId}`, productData);
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
    try {
      const response = await apiClient.get('/categories');
      console.log('🔍 分类API响应:', response);

      // 处理后端返回的数据结构 {success: true, data: Array, ...}
      const categories = response.data?.data || response.data || [];
      console.log('📋 解析后的分类数据:', categories);

      // 将后端返回的英文分类名称转换为中文，并添加图标
      const categoryIcons = {
        1: '📱', 2: '📚', 3: '👔', 4: '⚽', 5: '🏠',
        6: '📱', 7: '💻', 8: '📖', 9: '📚', 10: '👟'
      };

      const transformedCategories = categories.map(category => {
        const chineseName = ENGLISH_TO_CHINESE_CATEGORY[category.name] || category.name;
        console.log(`🔄 转换分类: ${category.name} → ${chineseName}`);

        return {
          id: category.id,
          name: chineseName,
          icon: categoryIcons[category.id] || '📦',
          parentId: category.parentId
        };
      });

      console.log('✅ 最终分类数据:', transformedCategories);
      return transformedCategories;
    } catch (error) {
      console.error('获取分类列表失败，使用默认分类:', error);

      // 如果API失败，返回默认分类
      return [
        { id: 1, name: '电子产品', icon: '📱' },
        { id: 2, name: '图书文具', icon: '📚' },
        { id: 3, name: '服装鞋帽', icon: '👔' },
        { id: 4, name: '运动用品', icon: '⚽' },
        { id: 5, name: '生活用品', icon: '🏠' },
        { id: 99, name: '其他', icon: '📦' }
      ];
    }
  },

  // 搜索商品 (暂时使用Mock数据，等待后端实现)
  searchProducts: async (searchParams) => {
    console.log('🔍 搜索商品参数:', searchParams);

    // 转换前端参数名称为后端期望的格式
    const backendParams = {
      keyword: searchParams.keyword,
      categoryId: searchParams.categoryId,
      minPrice: searchParams.minPrice,
      maxPrice: searchParams.maxPrice,
      sortBy: searchParams.sortBy,
      sortDirection: searchParams.sortDirection,
      page: searchParams.page,
      page_size: searchParams.page_size
    };

    console.log('🔄 转换后的后端参数:', backendParams);

    // 调用getProducts获取数据
    const result = await productService.getProducts(backendParams);
    console.log('📋 getProducts返回结果:', result);

    // 转换数据格式以匹配ProductListPage期望的格式
    const transformedResult = {
      success: true,
      data: {
        products: result.data || [], // 商品数组
        total: result.total || 0,    // 总数
        page: result.page || 1,      // 当前页
        pageSize: result.pageSize || 20, // 页大小
        pages: result.pages || 1     // 总页数
      },
      message: '搜索成功'
    };

    console.log('✅ 转换后的搜索结果:', transformedResult);
    return transformedResult;
  },

  // 收藏商品 (暂时使用Mock数据，等待后端实现)
  favoriteProduct: async (productId) => {
    await simulateDelay(300);
    return { success: true, message: '收藏成功' };
  },

  // 取消收藏 (暂时使用Mock数据，等待后端实现)
  unfavoriteProduct: async (productId) => {
    await simulateDelay(300);
    return { success: true, message: '取消收藏成功' };
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
      console.log('🔍 我的商品API响应:', response);

      // 处理后端返回的数据结构 {success: true, data: Array, ...}
      const products = response.data?.data || response.data || [];
      console.log('📋 解析后的商品数据:', products);

      // 转换数据格式，确保字段匹配前端期望
      const transformedProducts = products.map(product => {
        // 安全的日期转换函数
        const safeParseDate = (dateValue) => {
          if (!dateValue) return new Date().toISOString();

          try {
            // 如果是数组格式 [year, month, day, hour, minute, second]
            if (Array.isArray(dateValue) && dateValue.length >= 6) {
              // 注意：JavaScript的月份是从0开始的，所以需要减1
              const date = new Date(dateValue[0], dateValue[1] - 1, dateValue[2],
                                  dateValue[3], dateValue[4], dateValue[5]);
              if (isNaN(date.getTime())) {
                console.warn('无效的日期数组格式:', dateValue);
                return new Date().toISOString();
              }
              return date.toISOString();
            }

            // 如果是字符串格式
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) {
              console.warn('无效的日期格式:', dateValue);
              return new Date().toISOString();
            }
            return date.toISOString();
          } catch (error) {
            console.warn('日期解析错误:', dateValue, error);
            return new Date().toISOString();
          }
        };

        return {
          id: product.id,
          title: product.title,
          price: product.price,
          mainImage: product.mainImageUrl || product.imageUrl || '/placeholder-image.svg',
          imageUrls: product.imageUrls || [product.mainImageUrl || '/placeholder-image.svg'],
          description: product.description || '',
          category: product.categoryId || PRODUCT_CATEGORY.OTHER,
          categoryName: ENGLISH_TO_CHINESE_CATEGORY[product.categoryName] || product.categoryName || '其他',
          status: product.status === 1 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OFF_SHELF,
          createdAt: safeParseDate(product.createTime),
          updatedAt: safeParseDate(product.updateTime),
          sellerId: product.sellerId,
          views: product.views || 0,
          likes: product.likes || 0
        };
      });

      console.log('✅ 转换后的商品数据:', transformedProducts);

      // 返回包含分页信息的数据
      return {
        products: transformedProducts,
        total: transformedProducts.length,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      };
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
        url: `/placeholder-image.svg`,
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
