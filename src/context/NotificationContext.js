import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { message as antdMessage } from 'antd';

// 初始状态
const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    enableSystemNotifications: true,
    enableOrderNotifications: true,
    enableProductNotifications: true,
    enableFollowNotifications: true,
    enableMessageNotifications: true,
    enablePromotionNotifications: false
  },
  filters: {
    type: 'all',
    unreadOnly: false
  },
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  }
};

// Action 类型
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.SET_NOTIFICATIONS:
      return { 
        ...state, 
        notifications: action.payload,
        loading: false,
        error: null
      };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    
    case ActionTypes.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id
            ? { ...notification, ...action.payload.updates }
            : notification
        )
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };
    
    case ActionTypes.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };
    
    case ActionTypes.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case ActionTypes.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      };
    
    case ActionTypes.SET_SETTINGS:
      return { ...state, settings: action.payload };
    
    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case ActionTypes.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
    
    case ActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    
    default:
      return state;
  }
};

// Context
const NotificationContext = createContext();

// Provider组件
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // 获取通知列表
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const queryParams = {
        page: state.pagination.page,
        pageSize: state.pagination.pageSize,
        type: state.filters.type === 'all' ? undefined : state.filters.type,
        unreadOnly: state.filters.unreadOnly,
        ...params
      };
      
      const data = await notificationService.getNotifications(queryParams);
      dispatch({ type: ActionTypes.SET_NOTIFICATIONS, payload: data.data || [] });
      dispatch({
        type: ActionTypes.SET_PAGINATION,
        payload: {
          page: data.page || 1,
          pageSize: data.pageSize || 20,
          total: data.total || 0
        }
      });
      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      antdMessage.error(error.message);
      throw error;
    }
  }, [state.pagination.page, state.pagination.pageSize, state.filters.type, state.filters.unreadOnly]);

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: data.count });
      return data;
    } catch (error) {
      console.error('获取未读数量失败:', error);
    }
  }, []);

  // 标记单个通知已读
  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      dispatch({ type: ActionTypes.MARK_AS_READ, payload: id });
      // 重新获取未读数量以保持同步
      fetchUnreadCount();
    } catch (error) {
      antdMessage.error(error.message);
      throw error;
    }
  }, [fetchUnreadCount]);

  // 标记所有通知已读
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch({ type: ActionTypes.MARK_ALL_AS_READ });
      // 重新获取未读数量以保持同步
      fetchUnreadCount();
      antdMessage.success('所有通知已标记为已读');
    } catch (error) {
      antdMessage.error(error.message);
      throw error;
    }
  }, [fetchUnreadCount]);

  // 删除通知
  const deleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
      antdMessage.success('通知已删除');
    } catch (error) {
      antdMessage.error(error.message);
      throw error;
    }
  };



  // 获取通知设置
  const fetchSettings = async () => {
    try {
      const data = await notificationService.getSettings();
      dispatch({ type: ActionTypes.SET_SETTINGS, payload: data });
      return data;
    } catch (error) {
      antdMessage.error(error.message);
      throw error;
    }
  };

  // 更新通知设置
  const updateSettings = async (newSettings) => {
    try {
      await notificationService.updateSettings(newSettings);
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: newSettings });
      antdMessage.success('设置已保存');
    } catch (error) {
      antdMessage.error(error.message);
      throw error;
    }
  };

  // 设置筛选条件
  const setFilters = (newFilters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: newFilters });
  };

  // 设置分页
  const setPagination = (newPagination) => {
    dispatch({ type: ActionTypes.SET_PAGINATION, payload: newPagination });
  };

  // 添加新通知 (用于模拟实时通知)
  const addNotification = (notification) => {
    dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
  };

  // 清空通知
  const clearNotifications = () => {
    dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS });
  };

  // 定期更新未读数量
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // 初始化设置
  useEffect(() => {
    fetchSettings();
  }, []);

  // 筛选条件变化时重新获取数据
  useEffect(() => {
    fetchNotifications();
  }, [state.filters.type, state.filters.unreadOnly, fetchNotifications]);

  // Context值
  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUnreadCount,
    fetchSettings,
    updateSettings,
    setFilters,
    setPagination,
    addNotification,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
