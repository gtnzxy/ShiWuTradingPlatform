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
        user: action.payload,
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
    const initAuth = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const user = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && user) {
        try {
          // 验证 token 是否有效
          const response = await authService.getCurrentUser();
          
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: response.data
          });
          
          // 更新本地存储中的用户信息
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
          
        } catch (error) {
          // Token 无效，清除本地存储
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
      }
    };

    initAuth();
  }, []);

  // 登录
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authService.login(credentials);
      const { user, token } = response.data;

      // 保存到本地存储
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });

      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
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
