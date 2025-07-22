import apiClient from './api';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * 用户相关API服务 - 只包含后端支持的功能
 */
export const userService = {
  /**
   * 获取用户详细信息
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   */
  async getProfile(userId) {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }
    
    try {
      const response = await apiClient.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`获取用户信息失败: ${error.message}`);
    }
  },

  /**
   * 获取当前登录用户信息（从本地存储）
   * @returns {Promise<Object>} 当前用户信息
   */
  async getCurrentUserProfile() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (!userStr) {
        throw new Error('用户未登录');
      }
      
      const user = JSON.parse(userStr);
      return { data: user };
    } catch (error) {
      throw new Error(`获取当前用户信息失败: ${error.message}`);
    }
  },

  /**
   * 关注用户
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 操作结果
   */
  async followUser(userId) {
    try {
      const response = await apiClient.post(`/user/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw new Error(`关注用户失败: ${error.message}`);
    }
  },

  /**
   * 取消关注用户
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 操作结果
   */
  async unfollowUser(userId) {
    try {
      const response = await apiClient.delete(`/user/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw new Error(`取消关注失败: ${error.message}`);
    }
  },

  /**
   * 获取关注状态
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 关注状态
   */
  async getFollowStatus(userId) {
    try {
      const response = await apiClient.get(`/user/${userId}/follow`);
      return response.data;
    } catch (error) {
      throw new Error(`获取关注状态失败: ${error.message}`);
    }
  }
};

export default userService;
