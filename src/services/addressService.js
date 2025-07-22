import apiClient from './api';
import { mockAddresses, simulateDelay, generateId } from '../utils/mockData';

// 禁用Mock数据，使用真实API
const USE_MOCK_DATA = false;

const addressService = {
  /**
   * 获取用户收货地址列表
   * @returns {Promise} 地址列表
   */
  getAddresses: async () => {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      return {
        data: mockAddresses,
        total: mockAddresses.length
      };
    }
    
    try {
      const response = await apiClient.get('/user/addresses');
      return response.data;
    } catch (error) {
      throw new Error(`获取地址列表失败: ${error.message}`);
    }
  },

  /**
   * 获取单个地址详情
   * @param {number} id - 地址ID
   * @returns {Promise} 地址详情
   */
  getAddress: async (id) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(150);
      const address = mockAddresses.find(addr => addr.id === parseInt(id));
      if (!address) {
        throw new Error('地址不存在');
      }
      return { data: address };
    }
    
    try {
      const response = await apiClient.get(`/user/addresses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`获取地址详情失败: ${error.message}`);
    }
  },

  /**
   * 添加新收货地址
   * @param {Object} data - 地址数据
   * @param {string} data.name - 收货人姓名
   * @param {string} data.phone - 手机号码
   * @param {string} data.province - 省份
   * @param {string} data.city - 城市
   * @param {string} data.district - 区县
   * @param {string} data.street - 街道
   * @param {string} data.detail - 详细地址
   * @param {string} data.postalCode - 邮政编码
   * @param {string} data.tag - 地址标签
   * @param {boolean} data.isDefault - 是否默认地址
   * @returns {Promise} 创建的地址
   */
  addAddress: async (data) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(400);
      
      // 如果设为默认地址，先取消其他默认地址
      if (data.isDefault) {
        mockAddresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      const newAddress = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockAddresses.push(newAddress);
      return { data: newAddress };
    }
    
    try {
      const response = await apiClient.post('/user/addresses', data);
      return response.data;
    } catch (error) {
      throw new Error(`添加地址失败: ${error.message}`);
    }
  },

  /**
   * 更新收货地址
   * @param {number} id - 地址ID
   * @param {Object} data - 更新数据
   * @returns {Promise} 更新的地址
   */
  updateAddress: async (id, data) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(350);
      const index = mockAddresses.findIndex(addr => addr.id === parseInt(id));
      if (index === -1) {
        throw new Error('地址不存在');
      }
      
      // 如果设为默认地址，先取消其他默认地址
      if (data.isDefault) {
        mockAddresses.forEach(addr => {
          addr.isDefault = false;
        });
      }
      
      const updatedAddress = {
        ...mockAddresses[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      mockAddresses[index] = updatedAddress;
      return { data: updatedAddress };
    }
    
    try {
      const response = await apiClient.put(`/user/addresses/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`更新地址失败: ${error.message}`);
    }
  },

  /**
   * 删除收货地址
   * @param {number} id - 地址ID
   * @returns {Promise} 操作结果
   */
  deleteAddress: async (id) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(250);
      const index = mockAddresses.findIndex(addr => addr.id === parseInt(id));
      if (index === -1) {
        throw new Error('地址不存在');
      }
      
      const deletedAddress = mockAddresses[index];
      mockAddresses.splice(index, 1);
      
      // 如果删除的是默认地址，设置第一个地址为默认
      if (deletedAddress.isDefault && mockAddresses.length > 0) {
        mockAddresses[0].isDefault = true;
      }
      
      return { success: true };
    }
    
    try {
      const response = await apiClient.delete(`/user/addresses/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`删除地址失败: ${error.message}`);
    }
  },

  /**
   * 设置默认地址
   * @param {number} id - 地址ID
   * @returns {Promise} 操作结果
   */
  setDefaultAddress: async (id) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      
      // 先取消所有默认地址
      mockAddresses.forEach(addr => {
        addr.isDefault = false;
      });
      
      // 设置指定地址为默认
      const address = mockAddresses.find(addr => addr.id === parseInt(id));
      if (!address) {
        throw new Error('地址不存在');
      }
      
      address.isDefault = true;
      return { success: true, data: address };
    }
    
    try {
      const response = await apiClient.put(`/user/addresses/${id}/default`);
      return response.data;
    } catch (error) {
      throw new Error(`设置默认地址失败: ${error.message}`);
    }
  },

  /**
   * 获取默认地址
   * @returns {Promise} 默认地址
   */
  getDefaultAddress: async () => {
    if (USE_MOCK_DATA) {
      await simulateDelay(150);
      const defaultAddress = mockAddresses.find(addr => addr.isDefault);
      if (!defaultAddress) {
        return { data: null };
      }
      return { data: defaultAddress };
    }
    
    try {
      const response = await apiClient.get('/user/addresses/default');
      return response.data;
    } catch (error) {
      throw new Error(`获取默认地址失败: ${error.message}`);
    }
  },

  /**
   * 验证地址信息
   * @param {Object} data - 地址数据
   * @returns {Promise} 验证结果
   */
  validateAddress: async (data) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(400);
      
      // 简单验证逻辑
      const errors = [];
      
      if (!data.name || data.name.trim().length < 2) {
        errors.push('收货人姓名至少2个字符');
      }
      
      if (!data.phone || !/^1[3-9]\d{9}$/.test(data.phone)) {
        errors.push('请输入正确的手机号码');
      }
      
      if (!data.province || !data.city || !data.district) {
        errors.push('请选择完整的省市区信息');
      }
      
      if (!data.detail || data.detail.trim().length < 5) {
        errors.push('详细地址至少5个字符');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        suggestions: errors.length === 0 ? ['地址信息完整'] : []
      };
    }
    
    try {
      const response = await apiClient.post('/user/addresses/validate', data);
      return response.data;
    } catch (error) {
      throw new Error(`地址验证失败: ${error.message}`);
    }
  }
};

// 地址标签常量
export const ADDRESS_TAGS = {
  HOME: 'home',
  OFFICE: 'office',
  SCHOOL: 'school',
  OTHER: 'other'
};

// 地址标签显示文本
export const ADDRESS_TAG_TEXTS = {
  [ADDRESS_TAGS.HOME]: '家',
  [ADDRESS_TAGS.OFFICE]: '公司',
  [ADDRESS_TAGS.SCHOOL]: '学校',
  [ADDRESS_TAGS.OTHER]: '其他'
};

export default addressService;
