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
import { STORAGE_KEYS } from '../utils/constants';

const USE_MOCK_DATA = false;

// 使用本地存储管理购物车，与登录相同的策略
const USE_LOCAL_STORAGE = true;

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
      console.log('🛒 添加商品到购物车:', { productId, quantity });

      // 检查本地存储的认证信息
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      console.log('🔍 添加购物车请求前认证检查:', {
        hasToken: !!token,
        hasUser: !!user,
        tokenStart: token ? token.substring(0, 30) + '...' : 'null'
      });

      // 如果没有认证信息，提示登录
      if (!token || !user) {
        console.log('⚠️ 未找到认证信息，需要登录');
        throw new Error('请先登录后再添加商品到购物车');
      }

      // 使用与登录相同的方式调用API，使用正确的后端路径
      const response = await apiClient.post('/cart/add', {
        productId: productId,
        quantity
      });

      console.log('✅ 添加到购物车成功:', response);

      // 处理后端响应格式，与authService保持一致
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.error?.message || '添加到购物车失败');
      }
    } catch (error) {
      console.error('❌ 添加到购物车失败:', error);

      // 如果是401错误，不要清除Token，保持登录状态
      if (error.response?.status === 401) {
        console.log('⚠️ 收到401错误，但保持登录状态');
        throw new Error('认证失败，请刷新页面重试');
      }

      throw new Error(`添加到购物车失败: ${error.message}`);
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
      console.log('🗑️ 从购物车移除商品:', productId);

      // 检查本地存储的认证信息
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      console.log('🔍 移除购物车请求前认证检查:', {
        hasToken: !!token,
        hasUser: !!user
      });

      // 如果没有认证信息，提示登录
      if (!token || !user) {
        console.log('⚠️ 未找到认证信息，需要登录');
        throw new Error('请先登录后再操作购物车');
      }

      // 使用正确的后端路径
      const response = await apiClient.delete(`/cart/remove/${productId}`);

      console.log('✅ 从购物车移除成功:', response);

      // 处理后端响应格式
      if (response.success !== false) {
        return {
          success: true
        };
      } else {
        throw new Error(response.error?.message || '从购物车移除商品失败');
      }
    } catch (error) {
      console.error('❌ 从购物车移除商品失败:', error);

      // 如果是401错误，不要清除Token，保持登录状态
      if (error.response?.status === 401) {
        console.log('⚠️ 收到401错误，但保持登录状态');
        throw new Error('认证失败，请刷新页面重试');
      }

      throw new Error(`从购物车移除商品失败: ${error.message}`);
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
      console.log('🛒 获取购物车数据...');

      // 检查本地存储的认证信息
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      console.log('🔍 购物车请求前认证检查:', {
        hasToken: !!token,
        hasUser: !!user,
        tokenStart: token ? token.substring(0, 30) + '...' : 'null',
        userInfo: user ? JSON.parse(user).username : 'null'
      });

      // 如果没有认证信息，返回空购物车而不是报错
      if (!token || !user) {
        console.log('⚠️ 未找到认证信息，返回空购物车');
        return {
          success: true,
          data: {
            items: [],
            totalItems: 0,
            totalPrice: 0
          }
        };
      }

      // 使用正确的后端路径，与登录相同的方式
      const response = await apiClient.get('/cart/');

      console.log('✅ 获取购物车成功:', response);

      // 处理后端响应格式，与authService保持一致
      if (response.success) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error(response.error?.message || '获取购物车失败');
      }
    } catch (error) {
      // 如果是401错误，不要清除Token，而是返回空购物车
      if (error.response?.status === 401) {
        console.warn('⚠️ 购物车API需要认证，返回空购物车');
        return {
          success: true,
          data: {
            items: [],
            totalItems: 0,
            totalPrice: 0
          }
        };
      }

      console.error('❌ 获取购物车失败:', error.message);
      // 其他错误才抛出
      throw new Error(`获取购物车失败: ${error.message}`);
    }
  },

  /**
   * 获取购物车商品数量
   * @returns {Promise<number>} 购物车商品总数
   */
  async getCartItemCount() {
    try {
      console.log('🔢 获取购物车商品数量...');

      const cartData = await this.getCart();
      const count = cartData.data?.items ? cartData.data.items.length : 0;

      console.log('✅ 购物车商品数量:', count);
      return count;
    } catch (error) {
      console.error('❌ 获取购物车数量失败:', error);
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
