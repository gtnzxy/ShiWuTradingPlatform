/**
 * 支付服务 - 支付相关API调用
 * 
 * 功能：
 * - 创建支付订单
 * - 处理支付结果
 * - 查询支付状态
 * - 支付方式管理
 * 
 * 设计标准：
 * - 严格按照后端API规范
 * - 统一错误处理
 * - 数据格式标准化
 */

import apiClient from './api';

// 支付状态枚举
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',       // 待支付
  SUCCESS: 'SUCCESS',       // 支付成功
  FAILED: 'FAILED',         // 支付失败
  CANCELLED: 'CANCELLED',   // 已取消
  REFUNDED: 'REFUNDED'      // 已退款
};

// 支付方式枚举
export const PAYMENT_METHODS = {
  ALIPAY: 'ALIPAY',         // 支付宝
  WECHAT: 'WECHAT',         // 微信支付
  BANK_CARD: 'BANK_CARD',   // 银行卡
  BALANCE: 'BALANCE'        // 余额支付
};

// 支付服务
export const paymentService = {
  /**
   * 创建支付订单
   * @param {Object} paymentData - 支付数据
   * @param {string} paymentData.orderId - 订单ID
   * @param {number} paymentData.amount - 支付金额
   * @param {string} paymentData.paymentMethod - 支付方式
   * @returns {Promise<Object>} 支付订单信息
   */
  async createPayment(paymentData) {
    try {
      const response = await apiClient.post('/payments', {
        order_id: paymentData.orderId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('创建支付订单失败:', error);
      throw error;
    }
  },

  /**
   * 处理支付
   * @param {string} paymentId - 支付ID
   * @param {Object} paymentInfo - 支付信息
   * @returns {Promise<Object>} 支付结果
   */
  async processPayment(paymentId, paymentInfo) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/process`, paymentInfo);
      return response.data;
    } catch (error) {
      console.error('处理支付失败:', error);
      throw error;
    }
  },

  /**
   * 查询支付状态
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 支付状态信息
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/status`);
      return response.data;
    } catch (error) {
      console.error('查询支付状态失败:', error);
      throw error;
    }
  },

  /**
   * 取消支付
   * @param {string} paymentId - 支付ID
   * @returns {Promise<Object>} 取消结果
   */
  async cancelPayment(paymentId) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('取消支付失败:', error);
      throw error;
    }
  },

  /**
   * 申请退款
   * @param {Object} refundData - 退款数据
   * @param {string} refundData.paymentId - 支付ID
   * @param {number} refundData.amount - 退款金额
   * @param {string} refundData.reason - 退款原因
   * @returns {Promise<Object>} 退款申请结果
   */
  async requestRefund(refundData) {
    try {
      const response = await apiClient.post('/payments/refund', {
        payment_id: refundData.paymentId,
        amount: refundData.amount,
        reason: refundData.reason
      });
      return response.data;
    } catch (error) {
      console.error('申请退款失败:', error);
      throw error;
    }
  },

  /**
   * 获取支付历史
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.status - 状态筛选
   * @returns {Promise<Object>} 支付历史列表
   */
  async getPaymentHistory(params = {}) {
    try {
      const response = await apiClient.get('/payments/history', { params });
      return response.data;
    } catch (error) {
      console.error('获取支付历史失败:', error);
      throw error;
    }
  },

  /**
   * 获取支付方式列表
   * @returns {Promise<Object>} 支付方式列表
   */
  async getPaymentMethods() {
    try {
      const response = await apiClient.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('获取支付方式失败:', error);
      throw error;
    }
  },

  /**
   * 验证支付结果
   * @param {string} paymentId - 支付ID
   * @param {Object} verificationData - 验证数据
   * @returns {Promise<Object>} 验证结果
   */
  async verifyPayment(paymentId, verificationData) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      console.error('验证支付结果失败:', error);
      throw error;
    }
  }
};

export default paymentService;
