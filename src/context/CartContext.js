/**
 * 购物车上下文 - 全局购物车状态管理
 * 
 * 功能：
 * - 管理购物车商品列表
 * - 提供添加/删除商品的方法
 * - 购物车数量实时更新
 * - 结算功能
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { message } from 'antd';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContextNew';

// 购物车上下文
const CartContext = createContext();

// 购物车状态初始值
const initialState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0
};

// 购物车动作类型
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART_DATA: 'SET_CART_DATA',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_ITEM_COUNT: 'UPDATE_ITEM_COUNT',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR'
};

// 购物车状态管理reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case CART_ACTIONS.SET_CART_DATA:
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.items ? action.payload.items.length : 0,
        loading: false,
        error: null
      };

    case CART_ACTIONS.ADD_ITEM:
      const newItems = [...state.items, action.payload];
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        loading: false,
        error: null
      };

    case CART_ACTIONS.REMOVE_ITEM:
      const filteredItems = state.items.filter(
        item => item.product_id !== action.payload
      );
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.length,
        loading: false,
        error: null
      };

    case CART_ACTIONS.UPDATE_ITEM_COUNT:
      return {
        ...state,
        totalItems: action.payload,
        loading: false,
        error: null
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalItems: 0,
        loading: false,
        error: null
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    default:
      return state;
  }
}

/**
 * 购物车Provider组件
 */
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth(); // eslint-disable-line no-unused-vars

  // 加载购物车数据
  const loadCartData = async () => {
    if (!isAuthenticated) return;

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const cartData = await cartService.getCart();
      dispatch({ type: CART_ACTIONS.SET_CART_DATA, payload: cartData });
    } catch (error) {
      console.error('加载购物车失败:', error);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // 添加商品到购物车
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      message.warning('请先登录再添加商品到购物车');
      return false;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      await cartService.addToCart({ productId, quantity });
      
      // 重新加载购物车数据以获取最新状态
      await loadCartData();
      
      message.success('商品已添加到购物车');
      return true;
    } catch (error) {
      console.error('添加到购物车失败:', error);
      const errorMessage = error.response?.data?.error?.userTip || '添加到购物车失败';
      message.error(errorMessage);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // 从购物车移除商品
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      return false;
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      await cartService.removeFromCart(productId);
      
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
      message.success('商品已从购物车移除');
      return true;
    } catch (error) {
      console.error('从购物车移除失败:', error);
      const errorMessage = error.response?.data?.error?.userTip || '移除商品失败';
      message.error(errorMessage);
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // 清空购物车
  const clearCart = async () => {
    if (!isAuthenticated || state.items.length === 0) return;

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const productIds = state.items.map(item => item.product_id);
      await cartService.clearCart(productIds);
      
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      message.success('购物车已清空');
      return true;
    } catch (error) {
      console.error('清空购物车失败:', error);
      message.error('清空购物车失败');
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      return false;
    }
  };

  // 检查商品是否在购物车中
  const isInCart = (productId) => {
    return state.items.some(item => item.product_id === productId);
  };

  // 获取购物车总价
  const getTotalPrice = () => {
    return state.items.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  // 用户登录状态变化时重新加载购物车
  useEffect(() => {
    if (isAuthenticated) {
      loadCartData();
    } else {
      // 用户登出时清空购物车状态
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue = {
    // 状态
    ...state,
    
    // 方法
    addToCart,
    removeFromCart,
    clearCart,
    loadCartData,
    isInCart,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * 使用购物车上下文的Hook
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
