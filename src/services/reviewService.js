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

import { BASE_URL } from '../utils/constants';

// 评价服务类
class ReviewService {
  constructor() {
    this.baseURL = `${BASE_URL}/api/reviews`;
  }

  /**
   * 获取认证头部
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

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
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          order_id: reviewData.orderId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          images: reviewData.images || []
        })
      });

      if (!response.ok) {
        throw new Error(`创建评价失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReviewData(data);
    } catch (error) {
      console.error('创建评价失败:', error);
      throw error;
    }
  }

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
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort
      });

      const response = await fetch(
        `${this.baseURL}/product/${productId}?${queryParams}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`获取评价列表失败: ${response.status}`);
      }

      const data = await response.json();
      return {
        reviews: data.reviews?.map(review => this.formatReviewData(review)) || [],
        total: data.total || 0,
        hasMore: data.has_more || false,
        stats: data.stats ? this.formatReviewStats(data.stats) : null
      };
    } catch (error) {
      console.error('获取评价列表失败:', error);
      throw error;
    }
  }

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
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        type
      });

      const response = await fetch(
        `${this.baseURL}/user?${queryParams}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`获取用户评价失败: ${response.status}`);
      }

      const data = await response.json();
      return {
        reviews: data.reviews?.map(review => this.formatReviewData(review)) || [],
        total: data.total || 0,
        hasMore: data.has_more || false
      };
    } catch (error) {
      console.error('获取用户评价失败:', error);
      throw error;
    }
  }

  /**
   * 回复评价
   * @param {string} reviewId - 评价ID
   * @param {string} replyContent - 回复内容
   */
  async replyToReview(reviewId, replyContent) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}/reply`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          content: replyContent
        })
      });

      if (!response.ok) {
        throw new Error(`回复评价失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReviewData(data);
    } catch (error) {
      console.error('回复评价失败:', error);
      throw error;
    }
  }

  /**
   * 获取评价详情
   * @param {string} reviewId - 评价ID
   */
  async getReviewDetail(reviewId) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`获取评价详情失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReviewData(data);
    } catch (error) {
      console.error('获取评价详情失败:', error);
      throw error;
    }
  }

  /**
   * 删除评价
   * @param {string} reviewId - 评价ID
   */
  async deleteReview(reviewId) {
    try {
      const response = await fetch(`${this.baseURL}/${reviewId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`删除评价失败: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('删除评价失败:', error);
      throw error;
    }
  }

  /**
   * 格式化评价数据
   * @param {Object} rawData - 原始数据
   */
  formatReviewData(rawData) {
    if (!rawData) return null;

    return {
      reviewId: rawData.review_id || rawData.id,
      orderId: rawData.order_id,
      productId: rawData.product_id,
      rating: rawData.rating,
      comment: rawData.comment,
      images: rawData.images || [],
      createTime: rawData.create_time,
      updateTime: rawData.update_time,
      
      // 用户信息
      reviewer: rawData.reviewer ? {
        userId: rawData.reviewer.user_id || rawData.reviewer.id,
        nickname: rawData.reviewer.nickname,
        avatar: rawData.reviewer.avatar
      } : null,
      
      // 商品信息快照
      product: rawData.product ? {
        productId: rawData.product.product_id || rawData.product.id,
        title: rawData.product.title,
        image: rawData.product.image,
        price: rawData.product.price
      } : null,
      
      // 回复信息
      reply: rawData.reply ? {
        replyId: rawData.reply.reply_id || rawData.reply.id,
        content: rawData.reply.content,
        createTime: rawData.reply.create_time,
        replier: rawData.reply.replier ? {
          userId: rawData.reply.replier.user_id || rawData.reply.replier.id,
          nickname: rawData.reply.replier.nickname,
          avatar: rawData.reply.replier.avatar
        } : null
      } : null,
      
      // 权限标识
      canReply: rawData.can_reply || false,
      canEdit: rawData.can_edit || false,
      canDelete: rawData.can_delete || false
    };
  }

  /**
   * 格式化评价统计数据
   * @param {Object} rawStats - 原始统计数据
   */
  formatReviewStats(rawStats) {
    if (!rawStats) return null;

    return {
      totalCount: rawStats.total_count || 0,
      averageRating: rawStats.average_rating || 0,
      ratingDistribution: {
        fiveStar: rawStats.rating_distribution?.five_star || 0,
        fourStar: rawStats.rating_distribution?.four_star || 0,
        threeStar: rawStats.rating_distribution?.three_star || 0,
        twoStar: rawStats.rating_distribution?.two_star || 0,
        oneStar: rawStats.rating_distribution?.one_star || 0
      },
      hasImages: rawStats.has_images || 0,
      withContent: rawStats.with_content || 0
    };
  }
}

// 创建并导出服务实例
export const reviewService = new ReviewService();

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
