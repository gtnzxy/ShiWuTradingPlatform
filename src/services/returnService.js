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

import { BASE_URL } from '../utils/constants';

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

// 退货服务类
class ReturnService {
  constructor() {
    this.baseURL = `${BASE_URL}/api/returns`;
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
   * 申请退货退款
   * @param {Object} returnData - 退货申请数据
   * @param {string} returnData.orderId - 订单ID
   * @param {string} returnData.reason - 退货原因
   * @param {string} returnData.description - 退货说明
   * @param {Array} returnData.images - 凭证图片
   * @param {number} returnData.refundAmount - 退款金额
   */
  async createReturnRequest(returnData) {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          order_id: returnData.orderId,
          reason: returnData.reason,
          description: returnData.description,
          images: returnData.images || [],
          refund_amount: returnData.refundAmount
        })
      });

      if (!response.ok) {
        throw new Error(`申请退货失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReturnData(data);
    } catch (error) {
      console.error('申请退货失败:', error);
      throw error;
    }
  }

  /**
   * 获取退货申请列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.status - 状态筛选
   * @param {string} params.role - 角色筛选(buyer/seller)
   */
  async getReturnRequests(params = {}) {
    try {
      const { page = 1, pageSize = 10, status, role } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ...(status && { status }),
        ...(role && { role })
      });

      const response = await fetch(`${this.baseURL}?${queryParams}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`获取退货列表失败: ${response.status}`);
      }

      const data = await response.json();
      return {
        returns: data.returns?.map(item => this.formatReturnData(item)) || [],
        total: data.total || 0,
        hasMore: data.has_more || false
      };
    } catch (error) {
      console.error('获取退货列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取退货申请详情
   * @param {string} returnId - 退货申请ID
   */
  async getReturnDetail(returnId) {
    try {
      const response = await fetch(`${this.baseURL}/${returnId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`获取退货详情失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReturnData(data);
    } catch (error) {
      console.error('获取退货详情失败:', error);
      throw error;
    }
  }

  /**
   * 处理退货申请（卖家操作）
   * @param {string} returnId - 退货申请ID
   * @param {string} action - 操作类型(approve/reject)
   * @param {string} reason - 处理原因（拒绝时必填）
   */
  async processReturnRequest(returnId, action, reason = '') {
    try {
      const response = await fetch(`${this.baseURL}/${returnId}/process`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action,
          reason
        })
      });

      if (!response.ok) {
        throw new Error(`处理退货申请失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReturnData(data);
    } catch (error) {
      console.error('处理退货申请失败:', error);
      throw error;
    }
  }

  /**
   * 买家发货（退货商品）
   * @param {string} returnId - 退货申请ID
   * @param {Object} shippingData - 发货信息
   * @param {string} shippingData.trackingNumber - 快递单号
   * @param {string} shippingData.shippingCompany - 快递公司
   * @param {string} shippingData.shippingAddress - 收货地址
   */
  async buyerShipReturn(returnId, shippingData) {
    try {
      const response = await fetch(`${this.baseURL}/${returnId}/ship`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          tracking_number: shippingData.trackingNumber,
          shipping_company: shippingData.shippingCompany,
          shipping_address: shippingData.shippingAddress
        })
      });

      if (!response.ok) {
        throw new Error(`发货失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReturnData(data);
    } catch (error) {
      console.error('发货失败:', error);
      throw error;
    }
  }

  /**
   * 卖家确认收货
   * @param {string} returnId - 退货申请ID
   * @param {string} condition - 商品状态说明
   */
  async sellerConfirmReceived(returnId, condition = '') {
    try {
      const response = await fetch(`${this.baseURL}/${returnId}/received`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          condition
        })
      });

      if (!response.ok) {
        throw new Error(`确认收货失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReturnData(data);
    } catch (error) {
      console.error('确认收货失败:', error);
      throw error;
    }
  }

  /**
   * 处理退款
   * @param {string} returnId - 退货申请ID
   * @param {number} refundAmount - 实际退款金额
   */
  async processRefund(returnId, refundAmount) {
    try {
      const response = await fetch(`${this.baseURL}/${returnId}/refund`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          refund_amount: refundAmount
        })
      });

      if (!response.ok) {
        throw new Error(`退款失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReturnData(data);
    } catch (error) {
      console.error('退款失败:', error);
      throw error;
    }
  }

  /**
   * 取消退货申请
   * @param {string} returnId - 退货申请ID
   */
  async cancelReturnRequest(returnId) {
    try {
      const response = await fetch(`${this.baseURL}/${returnId}/cancel`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`取消退货申请失败: ${response.status}`);
      }

      const data = await response.json();
      return this.formatReturnData(data);
    } catch (error) {
      console.error('取消退货申请失败:', error);
      throw error;
    }
  }

  /**
   * 格式化退货数据
   * @param {Object} rawData - 原始数据
   */
  formatReturnData(rawData) {
    if (!rawData) return null;

    return {
      returnId: rawData.return_id || rawData.id,
      orderId: rawData.order_id,
      status: rawData.status,
      reason: rawData.reason,
      description: rawData.description,
      images: rawData.images || [],
      refundAmount: rawData.refund_amount,
      actualRefundAmount: rawData.actual_refund_amount,
      
      // 时间信息
      createTime: rawData.create_time,
      processTime: rawData.process_time,
      shipTime: rawData.ship_time,
      receivedTime: rawData.received_time,
      refundTime: rawData.refund_time,
      
      // 发货信息
      shipping: rawData.shipping ? {
        trackingNumber: rawData.shipping.tracking_number,
        shippingCompany: rawData.shipping.shipping_company,
        shippingAddress: rawData.shipping.shipping_address,
        shipTime: rawData.shipping.ship_time
      } : null,
      
      // 订单信息快照
      order: rawData.order ? {
        orderId: rawData.order.order_id,
        productTitle: rawData.order.product_title,
        productImage: rawData.order.product_image,
        originalPrice: rawData.order.original_price,
        buyerInfo: rawData.order.buyer_info,
        sellerInfo: rawData.order.seller_info
      } : null,
      
      // 处理信息
      processInfo: rawData.process_info ? {
        processedBy: rawData.process_info.processed_by,
        processTime: rawData.process_info.process_time,
        processReason: rawData.process_info.process_reason
      } : null,
      
      // 时间线
      timeline: rawData.timeline || [],
      
      // 权限标识
      canCancel: rawData.can_cancel || false,
      canProcess: rawData.can_process || false,
      canShip: rawData.can_ship || false,
      canConfirmReceived: rawData.can_confirm_received || false,
      canRefund: rawData.can_refund || false,
      
      // 角色标识
      isBuyer: rawData.is_buyer || false,
      isSeller: rawData.is_seller || false
    };
  }
}

// 创建并导出服务实例
export const returnService = new ReturnService();

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
