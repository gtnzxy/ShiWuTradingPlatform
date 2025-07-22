import apiClient from './api';

// 分类名称映射（英文到中文）
const CATEGORY_NAME_MAP = {
  'Electronics': '电子产品',
  'Books': '图书文具',
  'Clothing': '服装',
  'Sports': '运动用品',
  'Home': '家居',
  'Other': '其他',
  // 兼容其他可能的英文名称
  'ELECTRONICS': '电子产品',
  'CLOTHING': '服装鞋帽',
  'BOOKS': '图书文具',
  'SPORTS': '运动用品',
  'DAILY_NECESSITIES': '生活用品',
  'OTHER': '其他',
  'BOOKS_STATIONERY': '图书文具',
  'CLOTHING_ACCESSORIES': '服装配饰',
  'SPORTS_FITNESS': '运动健身',
  'DAILY_GOODS': '生活用品'
};

// 分类服务
export const categoryService = {
  // 获取所有分类
  getCategories: async () => {
    try {
      console.log('🏷️ 开始获取分类数据...');
      const response = await apiClient.get('/categories');
      console.log('📋 分类API响应:', response.data);

      // 转换分类数据，添加中文名称映射
      const categories = response.data.data || response.data || [];
      const transformedCategories = categories.map(category => {
        const chineseName = CATEGORY_NAME_MAP[category.name] || category.name;
        console.log(`🔄 转换分类: ${category.name} → ${chineseName}`);
        return {
          ...category,
          name: chineseName, // 显示中文名称
          originalName: category.name // 保留原始英文名称用于API调用
        };
      });

      const result = {
        success: true,
        data: transformedCategories,
        message: '获取分类成功'
      };

      console.log('✅ 转换后的分类数据:', result);
      return result;
    } catch (error) {
      console.error('❌ 获取分类失败:', error);
      // 返回Mock数据作为备用
      const mockCategories = [
        { id: 1, name: '电子产品', originalName: 'Electronics' },
        { id: 2, name: '服装', originalName: 'Clothing' },
        { id: 3, name: '图书文具', originalName: 'Books' },
        { id: 4, name: '运动用品', originalName: 'Sports' },
        { id: 5, name: '家居', originalName: 'Home' },
        { id: 6, name: '其他', originalName: 'Other' }
      ];

      return {
        success: true,
        data: mockCategories,
        message: '使用默认分类数据'
      };
    }
  },

  // 获取分类详情
  getCategoryById: async (categoryId) => {
    try {
      const response = await apiClient.get(`/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      throw new Error(`获取分类详情失败: ${error.message}`);
    }
  },

  // 获取分类下的商品
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await apiClient.get(`/categories/${categoryId}/products`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取分类商品失败: ${error.message}`);
    }
  },

  // 获取热门分类
  getPopularCategories: async () => {
    try {
      const response = await apiClient.get('/categories/popular');
      return response.data;
    } catch (error) {
      throw new Error(`获取热门分类失败: ${error.message}`);
    }
  }
};
