/**
 * 购物车页面 - 第4周核心功能
 * 
 * 功能：
 * - 显示购物车商品列表
 * - 支持批量选择/取消选择
 * - 支持数量调整
 * - 支持删除商品
 * - 结算功能
 * - 空购物车状态
 * 
 * 遵循设计标准：
 * - 使用Ant Design组件
 * - 响应式布局
 * - 原子设计模式
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Button, 
  Checkbox, 
  Typography, 
  Space, 
  Divider, 
  Empty,
  Spin,
  Alert,
  Row,
  Col,
  Affix
} from 'antd';
import { 
  ShoppingCartOutlined, 
  DeleteOutlined,
  WarningOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContextNew';
import CartItem from '../../components/molecules/CartItem/CartItem';
import PriceTag from '../../components/atoms/PriceTag/PriceTag';

const { Title, Text } = Typography;

const CartPage = () => {
  const { isAuthenticated } = useAuth(); // eslint-disable-line no-unused-vars
  const { 
    items, 
    loading, 
    error, 
    totalItems, 
    loadCartData,
    removeFromCart
  } = useCart();
  const navigate = useNavigate();

  // 选中的商品
  const [selectedItems, setSelectedItems] = useState(new Set());
  // 全选状态
  const [selectAll, setSelectAll] = useState(false);

  // 页面加载时获取购物车数据
  useEffect(() => {
    if (isAuthenticated) {
      loadCartData();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // 更新全选状态
  useEffect(() => {
    const availableItems = items.filter(item => item.status === 'ONSALE');
    const availableItemIds = availableItems.map(item => item.product_id);
    
    if (availableItems.length > 0) {
      const allSelected = availableItemIds.every(id => selectedItems.has(id));
      setSelectAll(allSelected);
    } else {
      setSelectAll(false);
    }
  }, [selectedItems, items]);

  // 处理单个商品选择
  const handleItemSelect = (productId, checked) => {
    const newSelectedItems = new Set(selectedItems);
    if (checked) {
      newSelectedItems.add(productId);
    } else {
      newSelectedItems.delete(productId);
    }
    setSelectedItems(newSelectedItems);
  };

  // 处理全选
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      // 只选择可用的商品
      const availableItems = items.filter(item => item.status === 'ONSALE');
      const availableItemIds = availableItems.map(item => item.product_id);
      setSelectedItems(new Set(availableItemIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  // 处理删除选中商品
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;
    
    try {
      // 批量删除选中商品
      const deletePromises = Array.from(selectedItems).map(productId => 
        removeFromCart(productId)
      );
      await Promise.all(deletePromises);
      
      // 清空选择
      setSelectedItems(new Set());
    } catch (error) {
      console.error('批量删除失败:', error);
    }
  };

  // 处理结算
  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      return;
    }
    
    // 跳转到结算页面，传递选中商品ID
    const selectedProductIds = Array.from(selectedItems);
    navigate('/checkout', { 
      state: { 
        productIds: selectedProductIds,
        fromCart: true 
      } 
    });
  };

  // 计算选中商品的总价
  const getSelectedTotalPrice = () => {
    return items
      .filter(item => selectedItems.has(item.product_id))
      .reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  // 获取选中的可用商品数量
  const getSelectedAvailableCount = () => {
    return items
      .filter(item => selectedItems.has(item.product_id) && item.status === 'ONSALE')
      .length;
  };

  // 未登录状态
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Empty
          image={<ShoppingCartOutlined style={{ fontSize: '64px', color: '#ccc' }} />}
          description="请先登录查看购物车"
        >
          <Button type="primary" onClick={() => navigate('/auth/login')}>
            立即登录
          </Button>
        </Empty>
      </div>
    );
  }

  // 加载状态
  if (loading && items.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">加载购物车中...</Text>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="加载购物车失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={loadCartData}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  // 空购物车状态
  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Empty
          image={<ShoppingCartOutlined style={{ fontSize: '64px', color: '#ccc' }} />}
          description="购物车是空的"
        >
          <Button type="primary" onClick={() => navigate('/products')}>
            去逛逛
          </Button>
        </Empty>
      </div>
    );
  }

  // 不可用商品数量
  const unavailableCount = items.filter(item => item.status !== 'ONSALE').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* 左侧 - 商品列表 */}
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ marginBottom: '16px' }}>
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Title level={4} style={{ margin: 0 }}>
                  <ShoppingCartOutlined /> 购物车 ({totalItems})
                </Title>
                
                <Space>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    disabled={items.filter(item => item.status === 'ONSALE').length === 0}
                  >
                    全选
                  </Checkbox>
                  
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteSelected}
                    disabled={selectedItems.size === 0}
                    danger
                  >
                    删除选中
                  </Button>
                </Space>
              </Space>
            </div>

            {/* 不可用商品提示 */}
            {unavailableCount > 0 && (
              <Alert
                message={`购物车中有 ${unavailableCount} 件商品已下架或不可购买`}
                type="warning"
                icon={<WarningOutlined />}
                style={{ marginBottom: '16px' }}
                closable
              />
            )}

            <Divider style={{ margin: '16px 0' }} />

            {/* 商品列表 */}
            <List
              dataSource={items}
              renderItem={(item) => (
                <CartItem
                  key={item.product_id}
                  item={item}
                  selected={selectedItems.has(item.product_id)}
                  onSelect={handleItemSelect}
                  style={{ padding: '16px 0' }}
                />
              )}
              split={true}
            />
          </Card>
        </Col>

        {/* 右侧 - 结算信息 */}
        <Col xs={24} lg={8}>
          <Affix offsetTop={24}>
            <Card>
              <Title level={5}>结算信息</Title>
              
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text>选中商品：</Text>
                    <Text>{getSelectedAvailableCount()} 件</Text>
                  </Space>
                </div>

                <div>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text>商品总价：</Text>
                    <PriceTag 
                      price={getSelectedTotalPrice()} 
                      size="large"
                      style={{ fontWeight: 'bold' }}
                    />
                  </Space>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text strong>实付款：</Text>
                    <PriceTag 
                      price={getSelectedTotalPrice()} 
                      size="large"
                      style={{ fontWeight: 'bold', fontSize: '18px' }}
                    />
                  </Space>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleCheckout}
                  disabled={getSelectedAvailableCount() === 0}
                >
                  结算 ({getSelectedAvailableCount()})
                </Button>

                <Button
                  type="default"
                  block
                  onClick={() => navigate('/products')}
                >
                  继续购物
                </Button>
              </Space>
            </Card>
          </Affix>
        </Col>
      </Row>
    </div>
  );
};

export default CartPage;
