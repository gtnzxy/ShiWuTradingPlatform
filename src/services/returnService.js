/**
 * 退货退款服务 - 第4周核心功能
 *
 * 功能：
 * - 申请退货退款
 * - 退货流程管理
 * - 退款处理
 * - 退货状态跟踪
 *
 * 设计标准：
 * - 严格按照后端API规范
 * - 统一错误处理
 * - 数据格式标准化
 */

import apiClient from './api';

// 退货状态枚举
export const RETURN_STATUS = {
  PENDING: 'PENDING',                 // 待审核
  APPROVED: 'APPROVED',               // 已同意
  REJECTED: 'REJECTED',               // 已拒绝
  BUYER_SHIPPED: 'BUYER_SHIPPED',     // 买家已发货
  SELLER_RECEIVED: 'SELLER_RECEIVED', // 卖家已收货
  REFUNDED: 'REFUNDED',               // 已退款
  CANCELLED: 'CANCELLED'              // 已取消
};

// 退货原因枚举
export const RETURN_REASONS = {
  QUALITY_ISSUE: 'QUALITY_ISSUE',           // 质量问题
  NOT_AS_DESCRIBED: 'NOT_AS_DESCRIBED',     // 与描述不符
  WRONG_ITEM: 'WRONG_ITEM',                 // 发错商品
  DAMAGED_IN_TRANSIT: 'DAMAGED_IN_TRANSIT', // 运输损坏
  NOT_NEEDED: 'NOT_NEEDED',                 // 不需要了
  OTHER: 'OTHER'                            // 其他原因
};

// 退货服务
export const returnService = {

  /**
   * 申请退货退款
   */
  async createReturnRequest(returnData) {
    try {
      const response = await apiClient.post('/returns', {
        order_id: returnData.orderId,
        reason: returnData.reason,
        description: returnData.description,
        images: returnData.images || [],
        refund_amount: returnData.refundAmount
      });
      return response.data;
    } catch (error) {
      console.error('申请退货失败:', error);
      throw error;
    }
  },

  /**
   * 获取退货申请列表
   */
  async getReturnRequests(params = {}) {
    try {
      const response = await apiClient.get('/returns', { params });
      return response.data;
    } catch (error) {
      console.error('获取退货列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取退货详情
   */
  async getReturnDetail(returnId) {
    try {
      const response = await apiClient.get(`/returns/${returnId}`);
      return response.data;
    } catch (error) {
      console.error('获取退货详情失败:', error);
      throw error;
    }
  },

  /**
   * 处理退货申请
   */
  async processReturnRequest(returnId, action, data = {}) {
    try {
      const response = await apiClient.post(`/returns/${returnId}/${action}`, data);
      return response.data;
    } catch (error) {
      console.error('处理退货申请失败:', error);
      throw error;
    }
  }
};

// 导出退货原因文本映射
export const RETURN_REASON_TEXTS = {
  [RETURN_REASONS.QUALITY_ISSUE]: '质量问题',
  [RETURN_REASONS.NOT_AS_DESCRIBED]: '与描述不符',
  [RETURN_REASONS.WRONG_ITEM]: '发错商品',
  [RETURN_REASONS.DAMAGED_IN_TRANSIT]: '运输损坏',
  [RETURN_REASONS.NOT_NEEDED]: '不需要了',
  [RETURN_REASONS.OTHER]: '其他原因'
};

// 导出退货状态文本映射
export const RETURN_STATUS_TEXTS = {
  [RETURN_STATUS.PENDING]: '待审核',
  [RETURN_STATUS.APPROVED]: '已同意',
  [RETURN_STATUS.REJECTED]: '已拒绝',
  [RETURN_STATUS.BUYER_SHIPPED]: '买家已发货',
  [RETURN_STATUS.SELLER_RECEIVED]: '卖家已收货',
  [RETURN_STATUS.REFUNDED]: '已退款',
  [RETURN_STATUS.CANCELLED]: '已取消'
};

export default returnService;
