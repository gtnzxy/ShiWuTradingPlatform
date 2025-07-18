import apiClient from './api';

// 分类服务
export const categoryService = {
  // 获取所有分类
  getCategories: async () => {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      throw new Error(`获取分类列表失败: ${error.message}`);
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
