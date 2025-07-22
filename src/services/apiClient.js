import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

// 创建axios实例
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    return response.data;
  },
  (error) => {
    // 统一处理错误
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转登录
          localStorage.removeItem('authToken');
          window.location.href = '/auth/login';
          break;
        case 403:
          // 禁止访问
          console.error('访问被禁止');
          break;
        case 404:
          // 资源不存在
          console.error('请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          console.error('服务器内部错误');
          break;
        default:
          console.error('请求失败:', data?.message || error.message);
      }
      
      return Promise.reject({
        success: false,
        message: data?.message || error.message,
        code: status
      });
    } else if (error.request) {
      // 请求发送失败
      console.error('网络连接失败');
      return Promise.reject({
        success: false,
        message: '网络连接失败，请检查网络设置',
        code: 'NETWORK_ERROR'
      });
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message);
      return Promise.reject({
        success: false,
        message: error.message,
        code: 'CONFIG_ERROR'
      });
    }
  }
);

export default apiClient;
