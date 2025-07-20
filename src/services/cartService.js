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
import { mockUserProducts, simulateDelay } from '../utils/mockData';

// 开发环境使用Mock数据
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// Mock购物车数据
let mockCartItems = [
  {
    id: 1,
    product_id: 1,
    quantity: 1,
    status: 'ONSALE',
    addedAt: new Date().toISOString()
  }
];

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
    if (USE_MOCK_DATA) {
      await simulateDelay(300);

      // 检查商品是否已在购物车中
      const existingItem = mockCartItems.find(item => item.product_id === productId);

      if (existingItem) {
        throw new Error('商品已在购物车中');
      }

      // 添加到购物车
      const newItem = {
        id: Date.now(),
        product_id: productId,
        quantity,
        status: 'ONSALE',
        addedAt: new Date().toISOString()
      };

      mockCartItems.push(newItem);

      return {
        success: true,
        data: {
          totalItems: mockCartItems.length
        }
      };
    }

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
    if (USE_MOCK_DATA) {
      await simulateDelay(200);

      // 从购物车中移除商品
      const index = mockCartItems.findIndex(item => item.product_id === productId);
      if (index !== -1) {
        mockCartItems.splice(index, 1);
      }

      return;
    }

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
    if (USE_MOCK_DATA) {
      await simulateDelay(300);

      // 获取购物车商品详情
      const cartItemsWithDetails = [];

      for (const cartItem of mockCartItems) {
        // 在所有用户的商品中查找
        let productFound = false;
        for (const userId in mockUserProducts) {
          const userProducts = mockUserProducts[userId];
          const product = userProducts.find(p => p.id === cartItem.product_id);
          if (product) {
            cartItemsWithDetails.push({
              ...cartItem,
              title: product.title,
              price: product.price,
              images: product.images,
              category: product.category,
              condition: product.condition,
              location: product.location,
              seller: {
                id: parseInt(userId),
                nickname: `用户${userId}`,
                avatar: `https://via.placeholder.com/40x40/87CEEB/000000?text=U${userId}`
              }
            });
            productFound = true;
            break;
          }
        }

        // 如果商品不存在，标记为已下架
        if (!productFound) {
          cartItemsWithDetails.push({
            ...cartItem,
            status: 'OFFSALE',
            title: '商品已下架',
            price: 0,
            images: []
          });
        }
      }

      return {
        success: true,
        data: {
          items: cartItemsWithDetails,
          totalItems: mockCartItems.length
        }
      };
    }

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
