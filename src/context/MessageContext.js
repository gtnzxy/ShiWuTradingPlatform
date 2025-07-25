import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import messageService from '../services/messageService';
import { message as antdMessage } from 'antd';
import { useAuth } from './AuthContextNew';

// 初始状态
const initialState = {
  conversations: [],
  currentConversation: null,
  messages: {}, // { conversationId: messages[] }
  unreadCount: 0,
  loading: false,
  error: null,
  searchKeyword: '',
  searchResults: []
};

// Action 类型
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  SET_CURRENT_CONVERSATION: 'SET_CURRENT_CONVERSATION',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_CONVERSATION_READ: 'MARK_CONVERSATION_READ',
  DELETE_CONVERSATION: 'DELETE_CONVERSATION',
  SET_SEARCH_KEYWORD: 'SET_SEARCH_KEYWORD',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  CLEAR_SEARCH: 'CLEAR_SEARCH'
};

// Reducer
const messageReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.SET_CONVERSATIONS:
      return { 
        ...state, 
        conversations: action.payload,
        loading: false,
        error: null
      };
    
    case ActionTypes.SET_CURRENT_CONVERSATION:
      return { ...state, currentConversation: action.payload };
    
    case ActionTypes.SET_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.conversationId]: action.payload
        },
        loading: false,
        error: null
      };
    
    case ActionTypes.ADD_MESSAGE:
      const { conversationId, message } = action.payload;
      const existingMessages = state.messages[conversationId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message]
        },
        // 更新会话列表中的最后一条消息
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                lastMessage: message.content,
                lastMessageTime: message.createTime,
                unreadCount: conv.unreadCount + 1
              }
            : conv
        )
      };
    
    case ActionTypes.UPDATE_MESSAGE:
      const { messageId, updates } = action.payload;
      const updatedMessages = { ...state.messages };
      Object.keys(updatedMessages).forEach(convId => {
        updatedMessages[convId] = updatedMessages[convId].map(msg =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
      });
      return { ...state, messages: updatedMessages };
    
    case ActionTypes.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };
    
    case ActionTypes.MARK_CONVERSATION_READ:
      const readConversationId = action.payload;
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === readConversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        ),
        messages: {
          ...state.messages,
          [readConversationId]: state.messages[readConversationId]?.map(msg => ({
            ...msg,
            isRead: true
          })) || []
        }
      };
    
    case ActionTypes.DELETE_CONVERSATION:
      const deleteConversationId = action.payload;
      const newMessages = { ...state.messages };
      delete newMessages[deleteConversationId];
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== deleteConversationId),
        messages: newMessages,
        currentConversation: state.currentConversation?.id === deleteConversationId 
          ? null 
          : state.currentConversation
      };
    
    case ActionTypes.SET_SEARCH_KEYWORD:
      return { ...state, searchKeyword: action.payload };
    
    case ActionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };
    
    case ActionTypes.CLEAR_SEARCH:
      return { ...state, searchKeyword: '', searchResults: [] };
    
    default:
      return state;
  }
};

// Context
const MessageContext = createContext();

// Provider组件
export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const { isAuthenticated } = useAuth();

  // 获取会话列表
  const fetchConversations = useCallback(async (params = {}) => {
    // 检查用户认证状态
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      console.warn('用户未登录，跳过获取会话列表');
      dispatch({ type: ActionTypes.SET_CONVERSATIONS, payload: [] });
      return { data: [], total: 0 };
    }

    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const data = await messageService.getConversations(params);
      dispatch({ type: ActionTypes.SET_CONVERSATIONS, payload: data.data || [] });
      return data;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });

      // 如果是认证错误，设置空列表
      if (error.message.includes('未授权') || error.message.includes('认证')) {
        dispatch({ type: ActionTypes.SET_CONVERSATIONS, payload: [] });
      }

      return { data: [], total: 0 };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // 获取消息历史
  const fetchMessages = useCallback(async (conversationId, params = {}) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const data = await messageService.getMessages(conversationId, params);
      dispatch({
        type: ActionTypes.SET_MESSAGES,
        conversationId,
        payload: data.data || []
      });
      return data;
    } catch (error) {
      console.error('获取消息历史失败:', error.message);
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      // 设置空的消息列表
      dispatch({
        type: ActionTypes.SET_MESSAGES,
        conversationId,
        payload: []
      });
      return { data: [], total: 0 };
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // 发送消息
  const sendMessage = useCallback(async (messageData) => {
    try {
      const data = await messageService.sendMessage(messageData);
      dispatch({
        type: ActionTypes.ADD_MESSAGE,
        payload: {
          conversationId: data.conversationId,
          message: data
        }
      });
      return data;
    } catch (error) {
      antdMessage.error(error.message);
      throw error;
    }
  }, []);

  // 获取未读数量
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await messageService.getUnreadCount();
      dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: data.count || 0 });
      return data;
    } catch (error) {
      console.warn('获取消息未读数量失败，设置为0:', error.message);
      // 设置未读数量为0，避免显示错误状态
      dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: 0 });
      return { count: 0 };
    }
  }, []);

  // 标记会话已读
  const markConversationAsRead = useCallback(async (conversationId) => {
    try {
      await messageService.markAsRead(conversationId);
      dispatch({ type: ActionTypes.MARK_CONVERSATION_READ, payload: conversationId });
      // 重新获取未读数量以保持同步
      fetchUnreadCount();
    } catch (error) {
      antdMessage.error(error.message);
    }
  }, [fetchUnreadCount]);

  // 删除会话
  const deleteConversation = async (conversationId) => {
    try {
      await messageService.deleteConversation(conversationId);
      dispatch({ type: ActionTypes.DELETE_CONVERSATION, payload: conversationId });
      antdMessage.success('会话已删除');
    } catch (error) {
      antdMessage.error(error.message);
      throw error;
    }
  };

  // 设置当前会话
  const setCurrentConversation = (conversation) => {
    dispatch({ type: ActionTypes.SET_CURRENT_CONVERSATION, payload: conversation });
  };

  // 搜索消息
  const searchMessages = async (keyword, conversationId) => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });
      const data = await messageService.searchMessages({ keyword, conversationId });
      dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: data.items });
      dispatch({ type: ActionTypes.SET_SEARCH_KEYWORD, payload: keyword });
      return data;
    } catch (error) {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
      antdMessage.error(error.message);
      throw error;
    }
  };

  // 清除搜索
  const clearSearch = () => {
    dispatch({ type: ActionTypes.CLEAR_SEARCH });
  };



  // 定期更新未读数量（仅在已登录时）
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // 每30秒更新一次
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount, isAuthenticated]);

  // Context值
  const value = {
    ...state,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markConversationAsRead,
    deleteConversation,
    setCurrentConversation,
    searchMessages,
    clearSearch,
    fetchUnreadCount
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

// Hook
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};

export default MessageContext;
