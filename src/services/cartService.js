/**
 * 购物车服务 - 严格按照后端API设计标准
 * 
 * API路径设计：
 * - POST /cart/items - 添加商品到购物车
 * - DELETE /cart/items/{productId} - 从购物车移除商品  
 * - GET /cart - 查看购物车
 * 
 * 响应格式：
 * - 成功: { success: true, data: {...} }
 * - 失败: { success: false, error: { code, message, userTip } }
 */

import apiClient from './api';

/**
 * 购物车服务类
 */
export const cartService = {
  /**
   * 添加商品到购物车
   * @param {Object} params - 参数对象
   * @param {number} params.productId - 商品ID
   * @param {number} params.quantity - 数量（固定为1）
   * @returns {Promise<Object>} 响应数据 { totalItems: number }
   */
  async addToCart({ productId, quantity = 1 }) {
    try {
      const response = await apiClient.post('/cart/items', {
        product_id: productId, // 使用snake_case命名
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('添加到购物车失败:', error);
      throw error;
    }
  },

  /**
   * 从购物车移除商品
   * @param {number} productId - 商品ID
   * @returns {Promise<void>} 无返回数据（204 No Content）
   */
  async removeFromCart(productId) {
    try {
      await apiClient.delete(`/cart/items/${productId}`);
    } catch (error) {
      console.error('从购物车移除商品失败:', error);
      throw error;
    }
  },

  /**
   * 查看购物车
   * @returns {Promise<Object>} 购物车数据 CartVO
   */
  async getCart() {
    try {
      const response = await apiClient.get('/cart');
      return response.data;
    } catch (error) {
      console.error('获取购物车失败:', error);
      throw error;
    }
  },

  /**
   * 获取购物车商品数量
   * @returns {Promise<number>} 购物车商品总数
   */
  async getCartItemCount() {
    try {
      const cartData = await this.getCart();
      return cartData.items ? cartData.items.length : 0;
    } catch (error) {
      console.error('获取购物车数量失败:', error);
      return 0;
    }
  },

  /**
   * 清空购物车（批量删除）
   * @param {number[]} productIds - 商品ID列表
   * @returns {Promise<void>}
   */
  async clearCart(productIds) {
    try {
      const deletePromises = productIds.map(productId => 
        this.removeFromCart(productId)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('清空购物车失败:', error);
      throw error;
    }
  }
};
