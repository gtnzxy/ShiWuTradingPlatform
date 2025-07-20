import apiClient from './apiClient';
import { mockUsers, simulateDelay } from '../utils/mockData';

// 开发环境使用Mock数据
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

// Mock关注关系数据
const mockFollowRelations = {
  // 用户1关注的人
  1: [2],
  // 用户2关注的人
  2: [1, 3],
  // 用户3关注的人
  3: [1]
};

const followService = {
  /**
   * 关注用户
   * @param {number} userId - 用户ID
   * @returns {Promise} 操作结果
   */
  followUser: async (userId) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      const currentUserId = 1; // 假设当前用户ID为1
      
      if (!mockFollowRelations[currentUserId]) {
        mockFollowRelations[currentUserId] = [];
      }
      
      if (!mockFollowRelations[currentUserId].includes(userId)) {
        mockFollowRelations[currentUserId].push(userId);
        
        // 更新用户关注状态
        if (mockUsers[userId]) {
          mockUsers[userId].isFollowed = true;
          mockUsers[userId].followers += 1;
        }
        
        // 更新当前用户的关注数
        if (mockUsers[currentUserId]) {
          mockUsers[currentUserId].following += 1;
        }
      }
      
      return { 
        success: true, 
        isFollowed: true,
        message: '关注成功'
      };
    }
    
    try {
      const response = await apiClient.post(`/users/${userId}/followers`, {
        action: 'FOLLOW'
      });
      return response.data;
    } catch (error) {
      throw new Error(`关注用户失败: ${error.message}`);
    }
  },

  /**
   * 取消关注用户
   * @param {number} userId - 用户ID
   * @returns {Promise} 操作结果
   */
  unfollowUser: async (userId) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      const currentUserId = 1; // 假设当前用户ID为1
      
      if (mockFollowRelations[currentUserId]) {
        const index = mockFollowRelations[currentUserId].indexOf(userId);
        if (index > -1) {
          mockFollowRelations[currentUserId].splice(index, 1);
          
          // 更新用户关注状态
          if (mockUsers[userId]) {
            mockUsers[userId].isFollowed = false;
            mockUsers[userId].followers -= 1;
          }
          
          // 更新当前用户的关注数
          if (mockUsers[currentUserId]) {
            mockUsers[currentUserId].following -= 1;
          }
        }
      }
      
      return { 
        success: true, 
        isFollowed: false,
        message: '取消关注成功'
      };
    }
    
    try {
      const response = await apiClient.post(`/users/${userId}/followers`, {
        action: 'UNFOLLOW'
      });
      return response.data;
    } catch (error) {
      throw new Error(`取消关注失败: ${error.message}`);
    }
  },

  /**
   * 检查是否已关注某用户
   * @param {number} userId - 用户ID
   * @returns {Promise} 关注状态
   */
  checkFollowStatus: async (userId) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(150);
      const currentUserId = 1; // 假设当前用户ID为1
      const isFollowed = mockFollowRelations[currentUserId]?.includes(userId) || false;
      
      return { 
        isFollowed,
        userId 
      };
    }
    
    try {
      const response = await apiClient.get(`/users/${userId}/follow-status`);
      return response.data;
    } catch (error) {
      throw new Error(`检查关注状态失败: ${error.message}`);
    }
  },

  /**
   * 获取关注列表 (我关注的人)
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise} 关注列表
   */
  getFollowing: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(250);
      const currentUserId = 1; // 假设当前用户ID为1
      const followingIds = mockFollowRelations[currentUserId] || [];
      
      const followingUsers = followingIds.map(id => mockUsers[id]).filter(Boolean);
      
      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = followingUsers.slice(start, end);
      
      return {
        data: paginatedData,
        total: followingUsers.length,
        page,
        pageSize
      };
    }
    
    try {
      const response = await apiClient.get('/users/following', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取关注列表失败: ${error.message}`);
    }
  },

  /**
   * 获取粉丝列表 (关注我的人)
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise} 粉丝列表
   */
  getFollowers: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(250);
      const currentUserId = 1; // 假设当前用户ID为1
      
      // 找出所有关注当前用户的人
      const followers = [];
      Object.entries(mockFollowRelations).forEach(([userId, followingList]) => {
        if (followingList.includes(currentUserId)) {
          const follower = mockUsers[parseInt(userId)];
          if (follower) {
            followers.push(follower);
          }
        }
      });
      
      // 分页处理
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = followers.slice(start, end);
      
      return {
        data: paginatedData,
        total: followers.length,
        page,
        pageSize
      };
    }
    
    try {
      const response = await apiClient.get('/users/followers', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取粉丝列表失败: ${error.message}`);
    }
  },

  /**
   * 获取指定用户的关注列表
   * @param {number} userId - 用户ID
   * @param {Object} params - 查询参数
   * @returns {Promise} 关注列表
   */
  getUserFollowing: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/${userId}/following`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取用户关注列表失败: ${error.message}`);
    }
  },

  /**
   * 获取指定用户的粉丝列表
   * @param {number} userId - 用户ID
   * @param {Object} params - 查询参数
   * @returns {Promise} 粉丝列表
   */
  getUserFollowers: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/${userId}/followers`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取用户粉丝列表失败: ${error.message}`);
    }
  },

  /**
   * 获取关注统计信息
   * @param {number} userId - 用户ID (可选，不传则获取当前用户)
   * @returns {Promise} 统计信息
   */
  getFollowStats: async (userId) => {
    try {
      const url = userId ? `/users/${userId}/follow-stats` : '/users/follow-stats';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      throw new Error(`获取关注统计失败: ${error.message}`);
    }
  },

  /**
   * 获取关注动态
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise} 动态列表
   */
  getFollowingActivities: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/following-activities', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取关注动态失败: ${error.message}`);
    }
  },

  /**
   * 批量关注用户
   * @param {number[]} userIds - 用户ID数组
   * @returns {Promise} 操作结果
   */
  batchFollow: async (userIds) => {
    try {
      const response = await apiClient.post('/users/batch-follow', { userIds });
      return response.data;
    } catch (error) {
      throw new Error(`批量关注失败: ${error.message}`);
    }
  },

  /**
   * 批量取消关注
   * @param {number[]} userIds - 用户ID数组
   * @returns {Promise} 操作结果
   */
  batchUnfollow: async (userIds) => {
    try {
      const response = await apiClient.post('/users/batch-unfollow', { userIds });
      return response.data;
    } catch (error) {
      throw new Error(`批量取消关注失败: ${error.message}`);
    }
  }
};

export default followService;
