import axios from 'axios';
import { APP_CONFIG } from '../utils/constants';

// 创建axios实例
const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('发送请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.config.url);
    
    // 检查业务层面的错误
    if (response.data && !response.data.success) {
      const error = response.data.error;
      throw new Error(error?.userTip || error?.message || '请求失败');
    }
    
    return response.data; // 直接返回数据部分
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除登录状态并跳转到登录页
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
          break;
        case 403:
          throw new Error('权限不足');
        case 404:
          throw new Error('请求的资源不存在');
        case 500:
          throw new Error('服务器内部错误');
        default:
          throw new Error(data?.error?.userTip || '网络请求失败');
      }
    } else if (error.request) {
      throw new Error('网络连接失败，请检查网络设置');
    } else {
      throw new Error(error.message || '请求失败');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
