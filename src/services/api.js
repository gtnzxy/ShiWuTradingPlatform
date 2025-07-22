import axios from 'axios';
import { APP_CONFIG, STORAGE_KEYS } from '../utils/constants';

const apiClient = axios.create({
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: APP_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// 请求拦截器 - 增强调试
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token - 使用正确的键名
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 添加认证token:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ 未找到认证token');
    }

    console.log('📤 发送请求:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 增强调试
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 收到响应:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });

    // 检查业务层面的错误
    if (response.data && !response.data.success) {
      const error = response.data.error;
      console.error('💼 业务错误:', error);
      throw new Error(error?.userTip || error?.message || '请求失败');
    }

    return response.data;
  },
  (error) => {
    console.error('❌ 响应错误:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.log('🚨 401错误 - URL:', error.config?.url);

          // 检查是否是登录相关的API，如果是则直接处理
          const url = error.config?.url || '';
          if (url.includes('/user/login') || url.includes('/user/register')) {
            console.log('🔐 登录/注册API 401错误 - 不清除登录状态');
            break;
          }

          // 对于其他API的401错误，检查是否是已知的未实现接口
          const unimplementedApis = ['/cart', '/notifications', '/message'];
          const isUnimplementedApi = unimplementedApis.some(api => url.includes(api));

          if (isUnimplementedApi) {
            console.log('⚠️ 未实现API 401错误 - 保持登录状态');
          } else {
            console.log('🚨 关键API 401错误 - 清除登录状态');
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            localStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN);
            window.location.href = '/auth/login';
          }
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
