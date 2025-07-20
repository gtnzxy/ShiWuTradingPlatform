/**
 * 订单服务 - 严格按照后端API设计标准
 * 
 * API路径设计：
 * - POST /orders - 创建订单
 * - GET /orders - 查看订单列表
 * - GET /orders/{orderId} - 查看订单详情
 * - POST /orders/{orderId}/payment - 模拟支付
 * - PUT /orders/{orderId}/shipment - 卖家发货
 * - PUT /orders/{orderId}/confirmation - 买家确认收货
 * - POST /orders/{orderId}/reviews - 评价订单
 * - POST /orders/{orderId}/return-requests - 申请退货
 * - PUT /orders/{orderId}/return-requests - 处理退货请求
 * 
 * 枚举值定义：
 * - OrderStatus: AWAITING_PAYMENT, AWAITING_SHIPPING, SHIPPED, COMPLETED, CANCELLED, RETURNED
 * - Role: BUYER, SELLER
 */

import apiClient from './api';
import { mockUserProducts, simulateDelay } from '../utils/mockData';

// 开发环境使用Mock数据
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// Mock订单数据
let mockOrders = [
  {
    id: 1,
    buyerId: 1,
    sellerId: 2,
    productId: 1,
    status: 'AWAITING_PAYMENT',
    totalAmount: 1299.00,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    shippingAddress: {
      name: '张三',
      phone: '13800138001',
      address: '北京市朝阳区xxx街道xxx号'
    }
  }
];

/**
 * 订单状态枚举
 */
export const ORDER_STATUS = {
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',    // 待支付
  AWAITING_SHIPPING: 'AWAITING_SHIPPING',  // 待发货
  SHIPPED: 'SHIPPED',                      // 已发货
  COMPLETED: 'COMPLETED',                  // 已完成
  CANCELLED: 'CANCELLED',                  // 已取消
  RETURNED: 'RETURNED'                     // 已退货
};

/**
 * 用户角色枚举
 */
export const USER_ROLE = {
  BUYER: 'BUYER',
  SELLER: 'SELLER'
};

/**
 * 订单服务类
 */
export const orderService = {
  /**
   * 创建订单
   * @param {Object} params - 参数对象
   * @param {number[]} params.productIds - 商品ID列表
   * @returns {Promise<Object>} 响应数据 { orderIds: string[] }
   */
  async createOrder({ productIds }) {
    if (USE_MOCK_DATA) {
      await simulateDelay(500);

      const orderIds = [];

      // 为每个商品创建一个订单
      for (const productId of productIds) {
        // 查找商品信息
        let product = null;
        let sellerId = null;

        for (const userId in mockUserProducts) {
          const userProducts = mockUserProducts[userId];
          const foundProduct = userProducts.find(p => p.id === productId);
          if (foundProduct) {
            product = foundProduct;
            sellerId = parseInt(userId);
            break;
          }
        }

        if (!product) {
          throw new Error(`商品 ${productId} 不存在`);
        }

        // 创建订单
        const newOrder = {
          id: Date.now() + Math.random(),
          buyerId: 1, // 假设当前用户ID为1
          sellerId,
          productId,
          status: 'AWAITING_PAYMENT',
          totalAmount: parseFloat(product.price),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          shippingAddress: {
            name: '张三',
            phone: '13800138001',
            address: '北京市朝阳区xxx街道xxx号'
          }
        };

        mockOrders.push(newOrder);
        orderIds.push(newOrder.id.toString());
      }

      return {
        success: true,
        data: {
          orderIds
        }
      };
    }

    try {
      const response = await apiClient.post('/orders', {
        product_ids: productIds // 使用snake_case命名
      });
      return response.data;
    } catch (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
  },

  /**
   * 查看订单列表
   * @param {Object} params - 查询参数
   * @param {string} params.role - 用户角色 (BUYER|SELLER)
   * @param {string} [params.status] - 订单状态（可选）
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=20] - 每页大小
   * @returns {Promise<Object>} 分页的订单摘要列表
   */
  async getOrderList({ role, status, page = 1, pageSize = 20 }) {
    if (USE_MOCK_DATA) {
      await simulateDelay(400);

      const currentUserId = 1; // 假设当前用户ID为1

      // 根据角色筛选订单
      let filteredOrders = mockOrders.filter(order => {
        if (role === 'BUYER') {
          return order.buyerId === currentUserId;
        } else if (role === 'SELLER') {
          return order.sellerId === currentUserId;
        }
        return false;
      });

      // 根据状态筛选
      if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
      }

      // 分页处理
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedOrders = filteredOrders.slice(start, end);

      // 添加商品信息
      const ordersWithDetails = paginatedOrders.map(order => {
        // 查找商品信息
        let product = null;
        for (const userId in mockUserProducts) {
          const userProducts = mockUserProducts[userId];
          const foundProduct = userProducts.find(p => p.id === order.productId);
          if (foundProduct) {
            product = foundProduct;
            break;
          }
        }

        return {
          ...order,
          product: product ? {
            id: product.id,
            title: product.title,
            price: product.price,
            images: product.images,
            category: product.category
          } : null
        };
      });

      return {
        success: true,
        data: {
          items: ordersWithDetails,
          total: filteredOrders.length,
          page,
          pageSize
        }
      };
    }

    try {
      const params = {
        role,
        page,
        page_size: pageSize // 使用snake_case命名
      };

      if (status) {
        params.status = status;
      }

      const response = await apiClient.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('获取订单列表失败:', error);
      throw error;
    }
  },

  /**
   * 查看订单详情
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 订单详情 OrderDetailVO
   */
  async getOrderDetail(orderId) {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);

      // 查找订单
      const order = mockOrders.find(o => o.id.toString() === orderId.toString());
      if (!order) {
        throw new Error('订单不存在');
      }

      // 查找商品信息
      let product = null;
      for (const userId in mockUserProducts) {
        const userProducts = mockUserProducts[userId];
        const foundProduct = userProducts.find(p => p.id === order.productId);
        if (foundProduct) {
          product = foundProduct;
          break;
        }
      }

      return {
        success: true,
        data: {
          ...order,
          product: product ? {
            id: product.id,
            title: product.title,
            price: product.price,
            images: product.images,
            category: product.category,
            condition: product.condition,
            description: product.description
          } : null,
          buyer: {
            id: order.buyerId,
            nickname: `用户${order.buyerId}`,
            avatar: `https://via.placeholder.com/40x40/87CEEB/000000?text=U${order.buyerId}`
          },
          seller: {
            id: order.sellerId,
            nickname: `用户${order.sellerId}`,
            avatar: `https://via.placeholder.com/40x40/87CEEB/000000?text=U${order.sellerId}`
          }
        }
      };
    }

    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('获取订单详情失败:', error);
      throw error;
    }
  },

  /**
   * 模拟支付
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 支付结果 { status: 'SUCCESS' }
   */
  async processPayment(orderId) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/payment`);
      return response.data;
    } catch (error) {
      console.error('支付失败:', error);
      throw error;
    }
  },

  /**
   * 卖家发货
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 更新后的订单详情
   */
  async shipOrder(orderId) {
    try {
      const response = await apiClient.put(`/orders/${orderId}/shipment`);
      return response.data;
    } catch (error) {
      console.error('发货失败:', error);
      throw error;
    }
  },

  /**
   * 买家确认收货
   * @param {number} orderId - 订单ID
   * @returns {Promise<Object>} 更新后的订单详情
   */
  async confirmReceived(orderId) {
    try {
      const response = await apiClient.put(`/orders/${orderId}/confirmation`);
      return response.data;
    } catch (error) {
      console.error('确认收货失败:', error);
      throw error;
    }
  },

  /**
   * 评价订单
   * @param {Object} params - 评价参数
   * @param {number} params.orderId - 订单ID
   * @param {number} params.rating - 评分 (1-5)
   * @param {string} [params.comment] - 评价内容
   * @returns {Promise<Object>} 创建的评价信息
   */
  async reviewOrder({ orderId, rating, comment }) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/reviews`, {
        rating,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('评价订单失败:', error);
      throw error;
    }
  },

  /**
   * 申请售后/退货
   * @param {Object} params - 退货参数
   * @param {number} params.orderId - 订单ID
   * @param {string} params.reason - 退货原因
   * @returns {Promise<Object>} 更新后的订单详情
   */
  async requestReturn({ orderId, reason }) {
    try {
      const response = await apiClient.post(`/orders/${orderId}/return-requests`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('申请退货失败:', error);
      throw error;
    }
  },

  /**
   * 处理退货请求
   * @param {Object} params - 处理参数
   * @param {number} params.orderId - 订单ID
   * @param {string} params.action - 操作类型 (APPROVE|REJECT)
   * @param {string} [params.reason] - 处理原因
   * @returns {Promise<Object>} 更新后的订单详情
   */
  async handleReturnRequest({ orderId, action, reason }) {
    try {
      const response = await apiClient.put(`/orders/${orderId}/return-requests`, {
        action,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('处理退货请求失败:', error);
      throw error;
    }
  },

  /**
   * 获取我的购买订单
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 买家订单列表
   */
  async getMyPurchases(params = {}) {
    return this.getOrderList({
      role: USER_ROLE.BUYER,
      ...params
    });
  },

  /**
   * 获取我的销售订单
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 卖家订单列表
   */
  async getMySales(params = {}) {
    return this.getOrderList({
      role: USER_ROLE.SELLER,
      ...params
    });
  }
};
