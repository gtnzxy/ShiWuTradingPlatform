import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { STORAGE_KEYS } from '../utils/constants';

// 初始状态
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  userStats: null
};

// Action 类型
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_USER_STATS: 'UPDATE_USER_STATS',
  SET_LOADING: 'SET_LOADING'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        userStats: null
      };

    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        isLoading: true
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      };

    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    case AUTH_ACTIONS.UPDATE_USER_STATS:
      return {
        ...state,
        userStats: action.payload
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
};

// 创建 Context
const AuthContext = createContext();

// AuthProvider 组件
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化时检查本地存储
  useEffect(() => {
    // 注释掉调试代码以减少日志
    // const originalRemoveItem = localStorage.removeItem.bind(localStorage);
    // const originalClear = localStorage.clear.bind(localStorage);

    // localStorage.removeItem = function(key) {
    //   console.log('🗑️ localStorage.removeItem 被调用:', key);
    //   console.trace('调用堆栈:');
    //   return originalRemoveItem(key);
    // };

    // localStorage.clear = function() {
    //   console.log('🗑️ localStorage.clear 被调用');
    //   console.trace('调用堆栈:');
    //   return originalClear();
    // };

    const initAuth = () => {
      // 减少日志输出
      // console.log('🔄 开始初始化认证状态...');
      // console.log('📍 当前页面路径:', window.location.pathname);
      // console.log('🔑 STORAGE_KEYS:', STORAGE_KEYS);

      // 检查所有本地存储的键
      // console.log('💾 本地存储所有键:', Object.keys(localStorage));

      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);

      // console.log('🔍 本地存储检查结果:', {
      //   tokenKey: STORAGE_KEYS.TOKEN,
      //   userKey: STORAGE_KEYS.USER,
      //   token: token ? `存在(${token.substring(0, 20)}...)` : '不存在',
      //   userStr: userStr ? '存在' : '不存在',
      //   userStrContent: userStr ? userStr.substring(0, 100) + '...' : 'null'
      // });

      if (token && userStr) {
        try {
          // 直接使用本地存储的用户信息，不调用API验证
          const user = JSON.parse(userStr);

          console.log('✅ 准备恢复用户登录状态:', user.username);

          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: { user, token }
          });

          console.log('🎉 从本地存储恢复用户登录状态成功:', user.username);

        } catch (error) {
          console.error('❌ 解析本地用户信息失败:', error);
          // 本地数据损坏，清除存储
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
        }
      } else {
        console.log('⚠️ 未找到本地登录信息，token:', !!token, 'userStr:', !!userStr);
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
      }
    };

    // console.log('🚀 AuthProvider useEffect 触发');
    initAuth();

    // 监听本地存储变化
    const handleStorageChange = (e) => {
      console.log('🔔 本地存储变化事件:', {
        key: e.key,
        oldValue: e.oldValue ? e.oldValue.substring(0, 50) + '...' : 'null',
        newValue: e.newValue ? e.newValue.substring(0, 50) + '...' : 'null',
        url: e.url
      });

      // 如果是我们关心的键被删除了，重新初始化
      if (e.key === STORAGE_KEYS.USER && e.newValue === null && e.oldValue !== null) {
        console.log('⚠️ 用户信息被外部删除，重新初始化认证状态');
        initAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      // 注释掉恢复原始方法的代码
      // localStorage.removeItem = originalRemoveItem;
      // localStorage.clear = originalClear;
    };
  }, []);

  // 登录
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      // 构造authService期望的credentials格式
      const credentials = {
        loginType: 'username',
        username: username,
        password: password,
        rememberMe: false
      };

      const response = await authService.login(credentials);
      const { user, token } = response.data;

      console.log('登录成功，准备保存到本地存储:', { user, token });
      console.log('保存前本地存储键:', Object.keys(localStorage));

      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      console.log('保存后本地存储键:', Object.keys(localStorage));

      // 验证保存是否成功
      const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      console.log('本地存储保存结果:', {
        tokenKey: STORAGE_KEYS.TOKEN,
        userKey: STORAGE_KEYS.USER,
        savedToken: savedToken ? '已保存' : '保存失败',
        savedUser: savedUser ? '已保存' : '保存失败',
        savedUserContent: savedUser ? savedUser.substring(0, 100) + '...' : 'null'
      });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });

      return response;
    } catch (error) {
      console.error('❌ AuthContext login 捕获到错误:', error);
      console.log('🔍 错误详情:', {
        message: error.message,
        type: typeof error.message,
        stack: error.stack
      });

      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });

      console.log('🔄 准备重新抛出错误...');
      throw error;
    }
  };

  // 注册
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await authService.register(userData);

      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });

      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE });
      throw error;
    }
  };

  // 退出登录
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('退出登录API调用失败:', error);
    } finally {
      // 无论API调用是否成功，都要清除本地状态
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN);
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    if (!state.isAuthenticated) return;
    
    try {
      const response = await authService.getCurrentUser();
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data
      });
      
      // 更新本地存储
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      throw error;
    }
  };

  // 更新用户信息
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData
    });
    
    // 更新本地存储
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  // 更新用户统计信息
  const updateUserStats = (stats) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER_STATS,
      payload: stats
    });
  };

  // 检查权限
  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    // 管理员拥有所有权限
    if (state.user.role === 'ADMIN') return true;
    
    // 检查具体权限
    return state.user.permissions?.includes(permission) || false;
  };

  // 检查是否为管理员
  const isAdmin = () => {
    return state.user?.role === 'ADMIN';
  };

  // 检查用户状态
  const isUserActive = () => {
    return state.user?.status === 'ACTIVE';
  };

  // 检查用户是否被封禁
  const isUserBanned = () => {
    return state.user?.status === 'BANNED';
  };

  // 检查用户是否被禁言
  const isUserMuted = () => {
    return state.user?.status === 'MUTED';
  };

  // 手动设置登录状态（用于绕过AuthContext登录时）
  const setLoginState = (user, token) => {
    console.log('🔄 手动设置登录状态:', { user: user?.username, token: token ? '存在' : '不存在' });

    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user, token }
    });
  };

  // Context 值
  const value = {
    // 状态
    ...state,

    // 操作方法
    login,
    register,
    logout,
    refreshUser,
    updateUser,
    updateUserStats,
    setLoginState,

    // 权限检查方法
    hasPermission,
    isAdmin,
    isUserActive,
    isUserBanned,
    isUserMuted
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthContext;
