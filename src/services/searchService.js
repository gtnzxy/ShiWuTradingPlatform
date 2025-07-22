import apiClient from './api';
import { mockSearchHistory, mockUserProducts, mockUsers, simulateDelay } from '../utils/mockData';

// 临时启用Mock数据，等待后端API实现
const USE_MOCK_DATA = true;

// Mock热门搜索关键词
const mockHotKeywords = [
  '手机', '电脑', '教材', '自行车', '化妆品',
  '相机', '耳机', '背包', '运动鞋', '平板'
];

// Mock搜索建议
const mockSearchSuggestions = {
  '手': ['手机', '手表', '手机壳', '手机充电器'],
  '电': ['电脑', '电视', '电动车', '电子书'],
  '书': ['书籍', '教科书', '漫画书', '小说'],
  '车': ['自行车', '电动车', '汽车用品'],
  '化': ['化妆品', '化学教材']
};

const searchService = {
  /**
   * 搜索商品
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.categoryId - 分类ID
   * @param {number} params.minPrice - 最低价格
   * @param {number} params.maxPrice - 最高价格
   * @param {string} params.condition - 商品成色
   * @param {string} params.location - 地理位置
   * @param {string} params.sortBy - 排序方式
   * @param {string} params.sortOrder - 排序顺序
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise} 搜索结果
   */
  searchProducts: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(500);
      
      const keyword = params.keyword?.toLowerCase() || '';
      let results = [];
      
      // 从所有用户商品中搜索
      Object.values(mockUserProducts).forEach(userProducts => {
        userProducts.forEach(product => {
          const matchTitle = product.title.toLowerCase().includes(keyword);
          const matchPrice = (!params.minPrice || product.price >= params.minPrice) &&
                           (!params.maxPrice || product.price <= params.maxPrice);
          const matchCondition = !params.condition || product.condition === params.condition;
          const matchLocation = !params.location || product.location.includes(params.location);
          
          if ((matchTitle || keyword === '') && matchPrice && matchCondition && matchLocation) {
            results.push(product);
          }
        });
      });
      
      // 排序处理
      if (params.sortBy) {
        results.sort((a, b) => {
          let aValue = a[params.sortBy];
          let bValue = b[params.sortBy];
          
          if (params.sortBy === 'price') {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
          }
          
          const order = params.sortOrder === 'desc' ? -1 : 1;
          if (aValue < bValue) return -1 * order;
          if (aValue > bValue) return 1 * order;
          return 0;
        });
      }
      
      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedResults = results.slice(start, end);
      
      return {
        data: paginatedResults,
        total: results.length,
        page,
        pageSize,
        keyword: params.keyword
      };
    }
    
    try {
      const response = await apiClient.get('/search/products', { params });
      return response.data;
    } catch (error) {
      throw new Error(`搜索商品失败: ${error.message}`);
    }
  },

  /**
   * 搜索用户
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise} 用户搜索结果
   */
  searchUsers: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      
      const keyword = params.keyword?.toLowerCase() || '';
      let results = [];
      
      Object.values(mockUsers).forEach(user => {
        const matchUsername = user.username.toLowerCase().includes(keyword);
        const matchNickname = user.nickname.toLowerCase().includes(keyword);
        const matchBio = user.bio?.toLowerCase().includes(keyword);
        
        if (matchUsername || matchNickname || matchBio || keyword === '') {
          results.push(user);
        }
      });
      
      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedResults = results.slice(start, end);
      
      return {
        data: paginatedResults,
        total: results.length,
        page,
        pageSize,
        keyword: params.keyword
      };
    }
    
    try {
      const response = await apiClient.get('/search/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(`搜索用户失败: ${error.message}`);
    }
  },

  /**
   * 获取搜索建议 (自动补全)
   * @param {string} keyword - 搜索关键词
   * @param {string} type - 搜索类型 (product, user)
   * @returns {Promise} 建议列表
   */
  getSearchSuggestions: async (keyword, type = 'product') => {
    if (USE_MOCK_DATA) {
      await simulateDelay(150);
      
      const suggestions = [];
      const lowerKeyword = keyword.toLowerCase();
      
      // 根据关键词前缀匹配建议
      Object.entries(mockSearchSuggestions).forEach(([prefix, words]) => {
        if (lowerKeyword.startsWith(prefix)) {
          suggestions.push(...words.filter(word => 
            word.toLowerCase().includes(lowerKeyword)
          ));
        }
      });
      
      // 如果没有匹配的，返回部分热门关键词
      if (suggestions.length === 0) {
        suggestions.push(...mockHotKeywords.filter(word => 
          word.toLowerCase().includes(lowerKeyword)
        ).slice(0, 5));
      }
      
      return {
        data: suggestions.slice(0, 8), // 最多返回8个建议
        keyword
      };
    }
    
    try {
      const response = await apiClient.get('/search/suggestions', {
        params: { keyword, type }
      });
      return response.data;
    } catch (error) {
      throw new Error(`获取搜索建议失败: ${error.message}`);
    }
  },

  /**
   * 获取热门搜索关键词
   * @param {string} type - 搜索类型
   * @param {number} limit - 返回数量限制
   * @returns {Promise} 热门关键词列表
   */
  getHotKeywords: async (type = 'product', limit = 10) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      
      return {
        data: mockHotKeywords.slice(0, limit),
        type,
        updatedAt: new Date().toISOString()
      };
    }
    
    try {
      const response = await apiClient.get('/search/hot-keywords', {
        params: { type, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`获取热门关键词失败: ${error.message}`);
    }
  },

  /**
   * 保存搜索历史
   * @param {Object} data - 搜索数据
   * @param {string} data.keyword - 搜索关键词
   * @param {string} data.type - 搜索类型
   * @param {number} data.resultCount - 搜索结果数量
   * @returns {Promise} 操作结果
   */
  saveSearchHistory: async (data) => {
    try {
      const response = await apiClient.post('/api/search/history', data);
      return response.data;
    } catch (error) {
      throw new Error(`保存搜索历史失败: ${error.message}`);
    }
  },

  /**
   * 获取搜索历史
   * @param {Object} params - 查询参数
   * @param {string} params.type - 搜索类型
   * @param {number} params.limit - 返回数量限制
   * @returns {Promise} 搜索历史列表
   */
  getSearchHistory: async (params = {}) => {
    try {
      const response = await apiClient.get('/search/history', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取搜索历史失败: ${error.message}`);
    }
  },

  /**
   * 清除搜索历史
   * @param {string} type - 搜索类型 (可选)
   * @returns {Promise} 操作结果
   */
  clearSearchHistory: async (type) => {
    try {
      const params = type ? { type } : {};
      const response = await apiClient.delete('/api/search/history', { params });
      return response.data;
    } catch (error) {
      throw new Error(`清除搜索历史失败: ${error.message}`);
    }
  },

  /**
   * 删除单条搜索历史
   * @param {number} id - 历史记录ID
   * @returns {Promise} 操作结果
   */
  deleteSearchHistory: async (id) => {
    try {
      const response = await apiClient.delete(`/api/search/history/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`删除搜索历史失败: ${error.message}`);
    }
  },

  /**
   * 获取筛选选项
   * @param {string} type - 筛选类型 (category, location, condition)
   * @returns {Promise} 筛选选项列表
   */
  getFilterOptions: async (type) => {
    try {
      const response = await apiClient.get(`/search/filter-options/${type}`);
      return response.data;
    } catch (error) {
      throw new Error(`获取筛选选项失败: ${error.message}`);
    }
  },

  /**
   * 获取搜索统计
   * @param {string} keyword - 搜索关键词
   * @returns {Promise} 搜索统计信息
   */
  getSearchStats: async (keyword) => {
    try {
      const response = await apiClient.get('/search/stats', {
        params: { keyword }
      });
      return response.data;
    } catch (error) {
      throw new Error(`获取搜索统计失败: ${error.message}`);
    }
  }
};

// 搜索排序常量
export const SEARCH_SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  CREATE_TIME_ASC: 'create_time_asc',
  CREATE_TIME_DESC: 'create_time_desc',
  POPULARITY: 'popularity'
};

// 搜索排序显示文本
export const SEARCH_SORT_TEXTS = {
  [SEARCH_SORT_OPTIONS.RELEVANCE]: '相关度',
  [SEARCH_SORT_OPTIONS.PRICE_ASC]: '价格从低到高',
  [SEARCH_SORT_OPTIONS.PRICE_DESC]: '价格从高到低',
  [SEARCH_SORT_OPTIONS.CREATE_TIME_ASC]: '发布时间(旧到新)',
  [SEARCH_SORT_OPTIONS.CREATE_TIME_DESC]: '发布时间(新到旧)',
  [SEARCH_SORT_OPTIONS.POPULARITY]: '热门程度'
};

// 搜索类型常量
export const SEARCH_TYPES = {
  PRODUCT: 'product',
  USER: 'user'
};

export default searchService;
