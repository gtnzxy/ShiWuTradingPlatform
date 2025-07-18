/**
 * 购物车按钮 - 原子组件
 * 
 * 功能：
 * - 显示购物车图标和商品数量
 * - 支持点击跳转到购物车页面
 * - 响应式设计，适配移动端
 * 
 * 使用antd组件：Badge, Button
 */

import React from 'react';
import { Badge, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';

const CartButton = ({ 
  size = 'default',
  type = 'text',
  className = '',
  ...props 
}) => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/cart');
  };

  return (
    <Badge 
      count={totalItems} 
      size="small"
      className={className}
    >
      <Button
        type={type}
        size={size}
        icon={<ShoppingCartOutlined />}
        onClick={handleClick}
        {...props}
      >
        {size !== 'small' && '购物车'}
      </Button>
    </Badge>
  );
};

export default CartButton;
