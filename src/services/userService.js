import apiClient from './api';
import { mockUsers, simulateDelay } from '../utils/mockData';

// 开发环境使用Mock数据
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

/**
 * 用户相关API服务
 */
export const userService = {
  /**
   * 获取用户详细信息
   * @param {number} userId - 用户ID（可选，不传则获取当前用户）
   * @returns {Promise<Object>} 用户信息
   */
  async getProfile(userId) {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      const currentUserId = userId || 1; // 假设当前用户ID为1
      const user = mockUsers[currentUserId];
      if (!user) {
        throw new Error('用户不存在');
      }
      return { data: user };
    }
    
    const url = userId ? `/users/${userId}/profile` : '/users/profile';
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * 获取公开用户资料
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  async getPublicProfile(userId) {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      const user = mockUsers[parseInt(userId)]; // 转换为数字
      if (!user) {
        throw new Error('用户不存在');
      }
      return { data: user };
    }
    
    const response = await apiClient.get(`/users/${userId}/public-profile`);
    return response.data;
  },

  /**
   * 获取用户统计信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 统计信息
   */
  async getUserStats(userId) {
    if (USE_MOCK_DATA) {
      await simulateDelay(150);
      const user = mockUsers[parseInt(userId)]; // 转换为数字
      if (!user) {
        throw new Error('用户不存在');
      }
      
      return {
        data: {
          products: user.products || 0,
          followers: user.followers || 0,
          following: user.following || 0,
          rating: user.rating || 0
        }
      };
    }
    
    const response = await apiClient.get(`/users/${userId}/stats`);
    return response.data;
  },

  /**
   * 更新用户资料
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateProfile(data) {
    if (USE_MOCK_DATA) {
      await simulateDelay(400);
      const currentUserId = 1; // 假设当前用户ID为1
      const user = mockUsers[currentUserId];
      if (!user) {
        throw new Error('用户不存在');
      }
      
      // 更新用户信息
      Object.assign(user, data);
      
      return { 
        data: user,
        message: '资料更新成功'
      };
    }
    
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  },

  /**
   * 更新用户头像
   * @param {File} file - 头像文件
   * @returns {Promise<Object>} 更新结果
   */
  async updateAvatar(file) {
    if (USE_MOCK_DATA) {
      await simulateDelay(800);
      const currentUserId = 1; // 假设当前用户ID为1
      const user = mockUsers[currentUserId];
      if (!user) {
        throw new Error('用户不存在');
      }
      
      // 模拟文件上传，生成新的头像URL
      const avatarUrl = `https://via.placeholder.com/150/${Math.random().toString(36).substr(2, 6)}/000000?text=Avatar`;
      user.avatar = avatarUrl;
      
      return { 
        data: { avatar: avatarUrl },
        message: '头像更新成功'
      };
    }
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * 修改密码
   * @param {Object} data - 密码数据
   * @param {string} data.oldPassword - 旧密码
   * @param {string} data.newPassword - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async changePassword(data) {
    if (USE_MOCK_DATA) {
      await simulateDelay(500);
      
      // 简单的密码验证
      if (data.oldPassword !== '123456') {
        throw new Error('原密码错误');
      }
      
      if (data.newPassword.length < 6) {
        throw new Error('新密码长度不能少于6位');
      }
      
      return { 
        success: true,
        message: '密码修改成功'
      };
    }
    
    const response = await apiClient.put('/users/password', data);
    return response.data;
  },

  /**
   * 获取隐私设置
   * @returns {Promise<Object>} 隐私设置
   */
  async getPrivacySettings() {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      return {
        data: {
          profileVisibility: 'public', // public, followers, private
          contactVisibility: 'followers',
          activityVisibility: 'public',
          showOnlineStatus: true,
          allowMessages: true,
          allowFollow: true
        }
      };
    }
    
    const response = await apiClient.get('/users/privacy-settings');
    return response.data;
  },

  /**
   * 更新隐私设置
   * @param {Object} settings - 隐私设置
   * @returns {Promise<Object>} 更新结果
   */
  async updatePrivacySettings(settings) {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      return { 
        success: true,
        data: settings,
        message: '隐私设置更新成功'
      };
    }
    
    const response = await apiClient.put('/users/privacy-settings', settings);
    return response.data;
  },

  /**
   * 获取安全设置
   * @returns {Promise<Object>} 安全设置
   */
  async getSecuritySettings() {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      return {
        data: {
          twoFactorEnabled: false,
          loginAlerts: true,
          passwordLastChanged: '2024-01-15',
          securityQuestions: true
        }
      };
    }
    
    const response = await apiClient.get('/users/security-settings');
    return response.data;
  },

  /**
   * 更新安全设置
   * @param {Object} settings - 安全设置
   * @returns {Promise<Object>} 更新结果
   */
  async updateSecuritySettings(settings) {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      return { 
        success: true,
        data: settings,
        message: '安全设置更新成功'
      };
    }
    
    const response = await apiClient.put('/users/security-settings', settings);
    return response.data;
  },

  /**
   * 获取活动日志
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 活动日志
   */
  async getActivityLog(params = {}) {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      const mockLog = [
        {
          id: 1,
          action: '登录',
          ip: '192.168.1.1',
          location: '北京市',
          device: 'Chrome on Windows',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          action: '修改资料',
          ip: '192.168.1.1',
          location: '北京市',
          device: 'Chrome on Windows',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      
      return {
        data: mockLog.slice(0, params.limit || 10),
        total: mockLog.length
      };
    }
    
    const response = await apiClient.get('/users/activity-log', { params });
    return response.data;
  },

  /**
   * 获取登录设备列表
   * @returns {Promise<Object>} 设备列表
   */
  async getLoginDevices() {
    if (USE_MOCK_DATA) {
      await simulateDelay(250);
      const mockDevices = [
        {
          id: 1,
          device: 'Chrome on Windows',
          ip: '192.168.1.1',
          location: '北京市',
          lastActive: new Date().toISOString(),
          isCurrent: true
        },
        {
          id: 2,
          device: 'Safari on iPhone',
          ip: '192.168.1.2',
          location: '北京市',
          lastActive: new Date(Date.now() - 86400000).toISOString(),
          isCurrent: false
        }
      ];
      
      return { data: mockDevices };
    }
    
    const response = await apiClient.get('/users/login-devices');
    return response.data;
  },

  /**
   * 移除登录设备
   * @param {number} deviceId - 设备ID
   * @returns {Promise<Object>} 操作结果
   */
  async removeLoginDevice(deviceId) {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      return { 
        success: true,
        message: '设备已移除'
      };
    }
    
    const response = await apiClient.delete(`/users/login-devices/${deviceId}`);
    return response.data;
  }
};

export default userService;
