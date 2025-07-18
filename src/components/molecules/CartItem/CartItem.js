/**
 * 购物车商品项 - 分子组件
 * 
 * 功能：
 * - 展示购物车中的商品信息
 * - 支持数量调整
 * - 支持删除操作
 * - 支持选择/取消选择
 * 
 * 使用antd组件：List.Item, Image, InputNumber, Button, Checkbox
 */

import React, { useState } from 'react';
import { List, Image, InputNumber, Button, Checkbox, Typography, Space, message } from 'antd';
import { DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { useCart } from '../../../context/CartContext';
import PriceTag from '../../atoms/PriceTag/PriceTag';
import StatusBadge from '../../atoms/StatusBadge/StatusBadge';

const { Text, Link } = Typography;

const CartItem = ({ 
  item, 
  selected = false, 
  onSelect, 
  onQuantityChange,
  className = '',
  ...props 
}) => {
  const { removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);

  // 处理删除商品
  const handleRemove = async () => {
    try {
      setLoading(true);
      const success = await removeFromCart(item.product_id);
      if (success && onSelect) {
        // 删除成功后取消选择
        onSelect(item.product_id, false);
      }
    } catch (error) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理数量变化
  const handleQuantityChange = (value) => {
    if (onQuantityChange) {
      onQuantityChange(item.product_id, value);
    }
  };

  // 处理选择状态变化
  const handleSelectChange = (e) => {
    if (onSelect) {
      onSelect(item.product_id, e.target.checked);
    }
  };

  // 商品图片
  const productImage = item.image_urls && item.image_urls.length > 0 
    ? item.image_urls[0] 
    : null;

  // 商品状态是否可用
  const isAvailable = item.status === 'ONSALE';

  return (
    <List.Item
      className={className}
      actions={[
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={handleRemove}
          loading={loading}
          danger
        >
          删除
        </Button>
      ]}
      {...props}
    >
      <List.Item.Meta
        avatar={
          <Space align="start">
            <Checkbox
              checked={selected}
              onChange={handleSelectChange}
              disabled={!isAvailable}
            />
            <Image
              width={80}
              height={80}
              src={productImage}
              fallback="/images/placeholder.png"
              preview={false}
              style={{ borderRadius: '4px', objectFit: 'cover' }}
            />
          </Space>
        }
        title={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Link href={`/products/${item.product_id}`} target="_blank">
              {item.title}
            </Link>
            <Space>
              <StatusBadge status={item.status} />
              {!isAvailable && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  商品已下架
                </Text>
              )}
            </Space>
          </Space>
        }
        description={
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space align="center">
              <ShopOutlined style={{ color: '#666' }} />
              <Text type="secondary">{item.seller_name || '卖家'}</Text>
            </Space>
            
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <PriceTag price={item.price} size="large" />
              
              <Space align="center">
                <Text type="secondary">数量：</Text>
                <InputNumber
                  min={1}
                  max={99}
                  value={item.quantity}
                  onChange={handleQuantityChange}
                  size="small"
                  disabled={!isAvailable}
                  style={{ width: '60px' }}
                />
              </Space>
            </Space>
            
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text type="secondary">
                小计：
              </Text>
              <PriceTag 
                price={item.price * item.quantity} 
                size="large" 
                style={{ fontWeight: 'bold' }}
              />
            </Space>
          </Space>
        }
      />
    </List.Item>
  );
};

export default CartItem;
