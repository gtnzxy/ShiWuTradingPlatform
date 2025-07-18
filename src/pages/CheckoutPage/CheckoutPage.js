/**
 * 结算页面 - 第4周核心功能
 * 
 * 功能：
 * - 显示待结算商品列表
 * - 地址选择（模拟）
 * - 价格明细
 * - 创建订单
 * - 跳转支付
 * 
 * 遵循设计标准：
 * - 严格按照后端API设计
 * - 使用Ant Design组件
 * - 响应式布局
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Steps, 
  List, 
  Button, 
  Space, 
  Divider, 
  Typography,
  Radio,
  Input,
  message,
  Spin
} from 'antd';
import { 
  ShoppingCartOutlined, 
  EnvironmentOutlined, 
  PayCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextNew';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import PriceTag from '../../components/atoms/PriceTag/PriceTag';

const { Title, Text } = Typography;
const { Step } = Steps;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  
  // 状态管理
  const [currentStep, setCurrentStep] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('default');
  const [remark, setRemark] = useState('');

  // 从路由状态获取商品ID列表
  const { productIds, fromCart } = location.state || {};

  // 模拟收货地址
  const addresses = [
    {
      id: 'default',
      name: '张三',
      phone: '13800138000',
      address: '北京市海淀区中关村大街1号 北京大学',
      isDefault: true
    },
    {
      id: 'dormitory',
      name: '张三',
      phone: '13800138000', 
      address: '北京市海淀区中关村大街1号 北京大学 宿舍楼A座201',
      isDefault: false
    }
  ];

  // 步骤配置
  const steps = [
    {
      title: '确认商品',
      icon: <ShoppingCartOutlined />
    },
    {
      title: '选择地址',
      icon: <EnvironmentOutlined />
    },
    {
      title: '确认订单',
      icon: <CheckCircleOutlined />
    },
    {
      title: '支付',
      icon: <PayCircleOutlined />
    }
  ];

  // 加载商品详情
  useEffect(() => {
    const loadProducts = async () => {
      if (!productIds || productIds.length === 0) {
        message.error('没有选择商品');
        navigate('/cart');
        return;
      }

      try {
        setLoading(true);
        // 获取商品详情
        const productPromises = productIds.map(id => 
          productService.getProductDetail(id)
        );
        const productResults = await Promise.all(productPromises);
        setProducts(productResults);
      } catch (error) {
        console.error('加载商品详情失败:', error);
        message.error('加载商品信息失败');
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProducts();
    }
  }, [productIds, isAuthenticated, navigate]);

  // 计算总价
  const getTotalPrice = () => {
    return products.reduce((total, product) => total + parseFloat(product.price), 0);
  };

  // 处理下一步
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 处理上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 创建订单
  const handleCreateOrder = async () => {
    try {
      setSubmitting(true);
      
      // 调用创建订单API
      const result = await orderService.createOrder({
        productIds: productIds
      });

      message.success('订单创建成功');
      
      // 如果是从购物车来的，清空对应商品
      if (fromCart) {
        await clearCart();
      }

      // 跳转到支付页面
      navigate('/payment', {
        state: {
          orderIds: result.orderIds,
          totalAmount: getTotalPrice()
        }
      });
      
    } catch (error) {
      console.error('创建订单失败:', error);
      const errorMessage = error.response?.data?.error?.userTip || '创建订单失败';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // 未登录重定向
  if (!isAuthenticated) {
    navigate('/auth/login');
    return null;
  }

  // 加载状态
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">加载商品信息中...</Text>
        </div>
      </div>
    );
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // 确认商品
        return (
          <Card title="确认商品信息">
            <List
              dataSource={products}
              renderItem={(product) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <img 
                        src={product.imageUrls?.[0] || '/placeholder-image.png'}
                        alt={product.title}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    }
                    title={product.title}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">卖家：{product.seller?.nickname}</Text>
                        <PriceTag price={product.price} size="large" />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        );

      case 1:
        // 选择地址
        return (
          <Card title="选择收货地址">
            <Radio.Group
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {addresses.map((addr) => (
                  <Radio key={addr.id} value={addr.id} style={{ width: '100%' }}>
                    <Card size="small" style={{ marginLeft: '8px', width: 'calc(100% - 32px)' }}>
                      <Space direction="vertical" size="small">
                        <Space>
                          <Text strong>{addr.name}</Text>
                          <Text>{addr.phone}</Text>
                          {addr.isDefault && <Text type="secondary">[默认]</Text>}
                        </Space>
                        <Text type="secondary">{addr.address}</Text>
                      </Space>
                    </Card>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>
        );

      case 2:
        // 确认订单
        return (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* 商品信息 */}
            <Card title="商品信息">
              <List
                size="small"
                dataSource={products}
                renderItem={(product) => (
                  <List.Item>
                    <Space>
                      <img 
                        src={product.imageUrls?.[0] || '/placeholder-image.png'}
                        alt={product.title}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div>
                        <div>{product.title}</div>
                        <PriceTag price={product.price} />
                      </div>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>

            {/* 收货地址 */}
            <Card title="收货地址">
              {(() => {
                const addr = addresses.find(a => a.id === selectedAddress);
                return (
                  <Space direction="vertical">
                    <Space>
                      <Text strong>{addr?.name}</Text>
                      <Text>{addr?.phone}</Text>
                    </Space>
                    <Text type="secondary">{addr?.address}</Text>
                  </Space>
                );
              })()}
            </Card>

            {/* 订单备注 */}
            <Card title="订单备注">
              <Input.TextArea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="选填，对本次交易的说明（建议填写交易要求）"
                rows={3}
                maxLength={200}
                showCount
              />
            </Card>

            {/* 价格明细 */}
            <Card title="价格明细">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>商品总价：</Text>
                  <PriceTag price={getTotalPrice()} />
                </Space>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text>运费：</Text>
                  <Text type="secondary">免运费</Text>
                </Space>
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Text strong>实付款：</Text>
                  <PriceTag 
                    price={getTotalPrice()} 
                    size="large" 
                    style={{ fontSize: '18px', fontWeight: 'bold' }}
                  />
                </Space>
              </Space>
            </Card>
          </Space>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={3}>订单结算</Title>
        
        {/* 步骤指示器 */}
        <Steps current={currentStep} style={{ marginBottom: '24px' }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} icon={step.icon} />
          ))}
        </Steps>

        {/* 步骤内容 */}
        <div style={{ marginBottom: '24px' }}>
          {renderStepContent()}
        </div>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                上一步
              </Button>
            )}
            
            {currentStep < 2 && (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            )}
            
            {currentStep === 2 && (
              <Button 
                type="primary" 
                onClick={handleCreateOrder}
                loading={submitting}
                size="large"
              >
                提交订单
              </Button>
            )}
          </Space>
        </div>

        {/* 价格汇总（固定在底部） */}
        {currentStep < 2 && (
          <Card style={{ marginTop: '16px', backgroundColor: '#fafafa' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text>
                共 {products.length} 件商品
              </Text>
              <Space>
                <Text>总计：</Text>
                <PriceTag 
                  price={getTotalPrice()} 
                  size="large" 
                  style={{ fontWeight: 'bold' }}
                />
              </Space>
            </Space>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default CheckoutPage;
