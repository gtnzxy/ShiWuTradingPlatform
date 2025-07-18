import apiClient from './api';

/**
 * 认证相关API服务
 */
export const authService = {
  /**
   * 用户登录 - 支持用户名和手机号登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.loginType - 登录类型: username | phone
   * @param {string} credentials.username - 用户名（loginType为username时）
   * @param {string} credentials.phone - 手机号（loginType为phone时）
   * @param {string} credentials.password - 密码
   * @param {boolean} credentials.rememberMe - 记住登录状态
   * @returns {Promise<Object>} 登录结果
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.phone - 手机号
   * @param {string} userData.email - 邮箱（可选）
   * @param {string} userData.password - 密码
   * @param {string} userData.verificationCode - 验证码
   * @returns {Promise<Object>} 注册结果
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} 用户信息
   */
  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  /**
   * 用户登出
   * @returns {Promise<Object>} 登出结果
   */
  async logout() {
    const response = await apiClient.post('/auth/logout');
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  /**
   * 刷新Token
   * @returns {Promise<Object>} 新的token信息
   */
  async refreshToken() {
    const response = await apiClient.post('/auth/refresh-token');
    return response.data;
  },

  /**
   * 获取当前用户信息
   * @returns {Promise<Object>} 用户信息
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * 检查用户名是否存在
   * @param {Object} data - 检查数据
   * @param {string} data.username - 用户名
   * @returns {Promise<Object>} 检查结果
   */
  async checkUsernameExists(data) {
    const response = await apiClient.post('/auth/check-username', data);
    return response.data;
  },

  /**
   * 检查手机号是否存在
   * @param {Object} data - 检查数据
   * @param {string} data.phone - 手机号
   * @returns {Promise<Object>} 检查结果
   */
  async checkPhoneExists(data) {
    const response = await apiClient.post('/auth/check-phone', data);
    return response.data;
  },

  /**
   * 发送注册验证码
   * @param {Object} data - 验证码数据
   * @param {string} data.phone - 手机号
   * @returns {Promise<Object>} 发送结果
   */
  async sendRegisterCode(data) {
    const response = await apiClient.post('/auth/send-register-code', data);
    return response.data;
  },

  /**
   * 发送重置密码验证码
   * @param {Object} data - 验证码数据
   * @param {string} data.phone - 手机号
   * @returns {Promise<Object>} 发送结果
   */
  async sendResetCode(data) {
    const response = await apiClient.post('/auth/send-reset-code', data);
    return response.data;
  },

  /**
   * 重置密码
   * @param {Object} data - 重置数据
   * @param {string} data.phone - 手机号
   * @param {string} data.verificationCode - 验证码
   * @param {string} data.newPassword - 新密码
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(data) {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  /**
   * 修改密码
   * @param {Object} data - 修改密码数据
   * @param {string} data.oldPassword - 旧密码
   * @param {string} data.newPassword - 新密码
   * @returns {Promise<Object>} 修改结果
   */
  async changePassword(data) {
    const response = await apiClient.put('/auth/change-password', data);
    return response.data;
  },

  /**
   * 绑定手机号
   * @param {Object} data - 绑定数据
   * @param {string} data.phone - 手机号
   * @param {string} data.verificationCode - 验证码
   * @returns {Promise<Object>} 绑定结果
   */
  async bindPhone(data) {
    const response = await apiClient.post('/auth/bind-phone', data);
    return response.data;
  },

  /**
   * 绑定邮箱
   * @param {Object} data - 绑定数据
   * @param {string} data.email - 邮箱
   * @param {string} data.verificationCode - 验证码
   * @returns {Promise<Object>} 绑定结果
   */
  async bindEmail(data) {
    const response = await apiClient.post('/auth/bind-email', data);
    return response.data;
  },

  /**
   * 解绑手机号
   * @param {Object} data - 解绑数据
   * @param {string} data.verificationCode - 验证码
   * @returns {Promise<Object>} 解绑结果
   */
  async unbindPhone(data) {
    const response = await apiClient.delete('/auth/unbind-phone', { data });
    return response.data;
  },

  /**
   * 解绑邮箱
   * @param {Object} data - 解绑数据
   * @param {string} data.verificationCode - 验证码
   * @returns {Promise<Object>} 解绑结果
   */
  async unbindEmail(data) {
    const response = await apiClient.delete('/auth/unbind-email', { data });
    return response.data;
  },

  /**
   * 启用二步验证
   * @param {Object} data - 启用数据
   * @param {string} data.secret - 二步验证密钥
   * @param {string} data.code - 验证码
   * @returns {Promise<Object>} 启用结果
   */
  async enableTwoFactor(data) {
    const response = await apiClient.post('/auth/enable-2fa', data);
    return response.data;
  },

  /**
   * 禁用二步验证
   * @param {Object} data - 禁用数据
   * @param {string} data.code - 验证码
   * @returns {Promise<Object>} 禁用结果
   */
  async disableTwoFactor(data) {
    const response = await apiClient.post('/auth/disable-2fa', data);
    return response.data;
  },

  /**
   * 验证二步验证码
   * @param {Object} data - 验证数据
   * @param {string} data.code - 验证码
   * @returns {Promise<Object>} 验证结果
   */
  async verifyTwoFactor(data) {
    const response = await apiClient.post('/auth/verify-2fa', data);
    return response.data;
  }
};

export default authService;
