/**
 * 评价服务 - 第4周核心功能
 *
 * 功能：
 * - 创建和提交评价
 * - 获取评价列表
 * - 评价回复功能
 * - 评价统计信息
 *
 * 设计标准：
 * - 严格按照后端API规范
 * - 统一错误处理
 * - 数据格式标准化
 */

import apiClient from './api';

// 评价服务
export const reviewService = {
  /**
   * 创建订单评价
   * @param {Object} reviewData - 评价数据
   * @param {string} reviewData.orderId - 订单ID
   * @param {number} reviewData.rating - 评分(1-5)
   * @param {string} reviewData.comment - 评价内容
   * @param {Array} reviewData.images - 评价图片(可选)
   */
  async createReview(reviewData) {
    try {
      const response = await apiClient.post('/reviews', {
        order_id: reviewData.orderId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || []
      });
      return response.data;
    } catch (error) {
      console.error('创建评价失败:', error);
      throw error;
    }
  },

  /**
   * 获取商品评价列表
   * @param {string} productId - 商品ID
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.sort - 排序方式
   */
  async getProductReviews(productId, params = {}) {
    try {
      const { page = 1, pageSize = 10, sort = 'latest' } = params;
      const queryParams = {
        page: page.toString(),
        page_size: pageSize.toString(),
        sort
      };

      const response = await apiClient.get(`/reviews/product/${productId}`, { params: queryParams });
      return {
        reviews: response.data.reviews || [],
        total: response.data.total || 0,
        hasMore: response.data.has_more || false,
        stats: response.data.stats || null
      };
    } catch (error) {
      console.error('获取评价列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取用户评价列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.type - 评价类型(given/received)
   */
  async getUserReviews(params = {}) {
    try {
      const { page = 1, pageSize = 10, type = 'given' } = params;
      const queryParams = {
        page: page.toString(),
        page_size: pageSize.toString(),
        type
      };

      const response = await apiClient.get('/reviews/user', { params: queryParams });
      return {
        reviews: response.data.reviews || [],
        total: response.data.total || 0,
        hasMore: response.data.has_more || false
      };
    } catch (error) {
      console.error('获取用户评价失败:', error);
      throw error;
    }
  },

  /**
   * 回复评价
   * @param {string} reviewId - 评价ID
   * @param {string} replyContent - 回复内容
   */
  async replyToReview(reviewId, replyContent) {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/reply`, {
        content: replyContent
      });
      return response.data;
    } catch (error) {
      console.error('回复评价失败:', error);
      throw error;
    }
  },

  /**
   * 获取评价详情
   * @param {string} reviewId - 评价ID
   */
  async getReviewDetail(reviewId) {
    try {
      const response = await apiClient.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('获取评价详情失败:', error);
      throw error;
    }
  },

  /**
   * 删除评价
   * @param {string} reviewId - 评价ID
   */
  async deleteReview(reviewId) {
    try {
      await apiClient.delete(`/reviews/${reviewId}`);
      return true;
    } catch (error) {
      console.error('删除评价失败:', error);
      throw error;
    }
  }
};



// 导出评价相关常量
export const REVIEW_SORT_OPTIONS = {
  LATEST: 'latest',
  OLDEST: 'oldest',
  RATING_HIGH: 'rating_high',
  RATING_LOW: 'rating_low',
  HELPFUL: 'helpful'
};

export const REVIEW_TYPES = {
  GIVEN: 'given',     // 我发出的评价
  RECEIVED: 'received' // 我收到的评价
};

export default reviewService;
