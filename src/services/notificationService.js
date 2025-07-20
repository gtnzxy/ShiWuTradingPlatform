import apiClient from './apiClient';
import { mockNotifications, simulateDelay, generateId } from '../utils/mockData';

// 开发环境使用Mock数据
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

const notificationService = {
  /**
   * 获取通知列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.type - 通知类型筛选
   * @param {boolean} params.unreadOnly - 只显示未读
   * @returns {Promise} 通知列表
   */
  getNotifications: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      let filteredNotifications = [...mockNotifications];
      
      // 按类型筛选
      if (params.type) {
        filteredNotifications = filteredNotifications.filter(n => n.type === params.type);
      }
      
      // 只显示未读
      if (params.unreadOnly) {
        filteredNotifications = filteredNotifications.filter(n => !n.isRead);
      }
      
      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filteredNotifications.slice(start, end);
      
      return {
        data: paginatedData,
        total: filteredNotifications.length,
        page,
        pageSize
      };
    }
    
    try {
      const response = await apiClient.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取通知列表失败: ${error.message}`);
    }
  },

  /**
   * 标记单个通知为已读
   * @param {number} id - 通知ID
   * @returns {Promise} 操作结果
   */
  markAsRead: async (id) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) {
        notification.isRead = true;
      }
      return { success: true };
    }
    
    try {
      const response = await apiClient.put(`/notifications/${id}/read-status`);
      return response.data;
    } catch (error) {
      throw new Error(`标记通知已读失败: ${error.message}`);
    }
  },

  /**
   * 批量标记通知为已读
   * @param {number[]} ids - 通知ID数组
   * @returns {Promise} 操作结果
   */
  markMultipleAsRead: async (ids) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      ids.forEach(id => {
        const notification = mockNotifications.find(n => n.id === id);
        if (notification) {
          notification.isRead = true;
        }
      });
      return { success: true, count: ids.length };
    }
    
    try {
      const response = await apiClient.put('/notifications/batch-read', { ids });
      return response.data;
    } catch (error) {
      throw new Error(`批量标记已读失败: ${error.message}`);
    }
  },

  /**
   * 标记所有通知为已读
   * @returns {Promise} 操作结果
   */
  markAllAsRead: async () => {
    if (USE_MOCK_DATA) {
      await simulateDelay(400);
      mockNotifications.forEach(notification => {
        notification.isRead = true;
      });
      return { success: true, count: mockNotifications.length };
    }
    
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error(`标记全部已读失败: ${error.message}`);
    }
  },

  /**
   * 删除通知
   * @param {number} id - 通知ID
   * @returns {Promise} 操作结果
   */
  deleteNotification: async (id) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(250);
      const index = mockNotifications.findIndex(n => n.id === id);
      if (index > -1) {
        mockNotifications.splice(index, 1);
      }
      return { success: true };
    }
    
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`删除通知失败: ${error.message}`);
    }
  },

  /**
   * 获取未读通知数量
   * @returns {Promise} 未读数量
   */
  getUnreadCount: async () => {
    if (USE_MOCK_DATA) {
      await simulateDelay(150);
      const unreadCount = mockNotifications.filter(n => !n.isRead).length;
      return { count: unreadCount };
    }
    
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw new Error(`获取未读数量失败: ${error.message}`);
    }
  },

  /**
   * 获取通知设置
   * @returns {Promise} 通知设置
   */
  getSettings: async () => {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      return {
        data: {
          push: true,
          email: true,
          sms: false,
          types: {
            system: true,
            order: true,
            product: true,
            follow: true,
            message: true,
            promotion: false
          },
          schedule: {
            startTime: '09:00',
            endTime: '22:00',
            enabled: true
          }
        }
      };
    }
    
    try {
      const response = await apiClient.get('/notifications/settings');
      return response.data;
    } catch (error) {
      throw new Error(`获取通知设置失败: ${error.message}`);
    }
  },

  /**
   * 更新通知设置
   * @param {Object} settings - 通知设置
   * @returns {Promise} 操作结果
   */
  updateSettings: async (settings) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      // 在Mock环境中，只是简单返回成功
      return { success: true, data: settings };
    }
    
    try {
      const response = await apiClient.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(`更新通知设置失败: ${error.message}`);
    }
  },

  /**
   * 创建新通知（主要用于Mock测试）
   * @param {Object} notificationData - 通知数据
   * @returns {Promise} 创建的通知
   */
  createNotification: async (notificationData) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      const newNotification = {
        id: generateId(),
        type: notificationData.type || 'system',
        title: notificationData.title,
        content: notificationData.content,
        data: notificationData.data || {},
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      mockNotifications.unshift(newNotification); // 添加到开头
      return newNotification;
    }
    
    // 生产环境可能不需要这个方法，或者有不同的实现
    throw new Error('创建通知功能在生产环境不可用');
  }
};

// 通知类型常量
export const NOTIFICATION_TYPES = {
  SYSTEM: 'system',
  ORDER: 'order',
  PRODUCT: 'product',
  FOLLOW: 'follow',
  MESSAGE: 'message',
  PROMOTION: 'promotion'
};

// 通知优先级常量
export const NOTIFICATION_PRIORITIES = {
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
};

export default notificationService;
