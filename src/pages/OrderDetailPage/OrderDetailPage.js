/**
 * 订单详情页面 - 第4周核心功能
 * 
 * 功能：
 * - 显示完整订单信息
 * - 订单状态跟踪
 * - 订单操作按钮
 * - 物流信息展示
 * - 评价信息显示
 * 
 * 遵循设计标准：
 * - 严格按照后端API设计
 * - 使用Ant Design组件
 * - 响应式布局
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Steps, 
  Descriptions, 
  Button, 
  Space, 
  Tag, 
  Image, 
  Typography, 
  Timeline,
  Spin,
  Alert,
  Rate,
  message
} from 'antd';
import { 
  ShoppingCartOutlined,
  PayCircleOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextNew';
import { orderService, ORDER_STATUS } from '../../services/orderService';
import PriceTag from '../../components/atoms/PriceTag/PriceTag';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  // 订单状态步骤映射
  const getOrderSteps = (status) => {
    const steps = [
      { title: '订单创建', icon: <ShoppingCartOutlined /> },
      { title: '付款完成', icon: <PayCircleOutlined /> },
      { title: '商家发货', icon: <TruckOutlined /> },
      { title: '确认收货', icon: <CheckCircleOutlined /> }
    ];

    let current = 0;
    switch (status) {
      case ORDER_STATUS.AWAITING_PAYMENT:
        current = 0;
        break;
      case ORDER_STATUS.AWAITING_SHIPPING:
        current = 1;
        break;
      case ORDER_STATUS.SHIPPED:
        current = 2;
        break;
      case ORDER_STATUS.COMPLETED:
        current = 3;
        break;
      case ORDER_STATUS.CANCELLED:
      case ORDER_STATUS.RETURNED:
        steps.push({ title: '订单关闭', icon: <CloseCircleOutlined /> });
        current = steps.length - 1;
        break;
      default:
        current = 0;
        break;
    }

    return { steps, current };
  };

  // 加载订单详情
  const loadOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderDetail(orderId);
      setOrder(orderData);
      setError(null);
    } catch (error) {
      console.error('加载订单详情失败:', error);
      setError('加载订单详情失败');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // 页面加载时获取数据
  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadOrderDetail();
    }
  }, [isAuthenticated, orderId, loadOrderDetail]);

  // 处理发货
  const handleShip = async () => {
    try {
      await orderService.shipOrder(orderId);
      message.success('发货成功');
      loadOrderDetail();
    } catch (error) {
      console.error('发货失败:', error);
      message.error('发货失败');
    }
  };

  // 处理确认收货
  const handleConfirmReceived = async () => {
    try {
      await orderService.confirmReceived(orderId);
      message.success('确认收货成功');
      loadOrderDetail();
    } catch (error) {
      console.error('确认收货失败:', error);
      message.error('确认收货失败');
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
          <Text type="secondary">加载订单详情中...</Text>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !order) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="加载失败"
          description={error || '订单不存在'}
          type="error"
          showIcon
          action={
            <Space>
              <Button onClick={() => navigate(-1)}>返回</Button>
              <Button type="primary" onClick={loadOrderDetail}>重试</Button>
            </Space>
          }
        />
      </div>
    );
  }

  const { steps, current } = getOrderSteps(order.status);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space align="center" style={{ marginBottom: '16px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            订单详情
          </Title>
        </Space>

        {/* 订单状态步骤 */}
        <Steps current={current} style={{ marginBottom: '24px' }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} icon={step.icon} />
          ))}
        </Steps>

        {/* 订单操作按钮 */}
        <Space>
          {order.status === ORDER_STATUS.AWAITING_PAYMENT && (
            <Button 
              type="primary" 
              onClick={() => navigate('/payment', { 
                state: { 
                  orderIds: [order.orderId], 
                  totalAmount: order.priceAtPurchase 
                } 
              })}
            >
              立即支付
            </Button>
          )}
          
          {order.status === ORDER_STATUS.AWAITING_SHIPPING && order.isSeller && (
            <Button type="primary" icon={<TruckOutlined />} onClick={handleShip}>
              发货
            </Button>
          )}
          
          {order.status === ORDER_STATUS.SHIPPED && order.isBuyer && (
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleConfirmReceived}>
              确认收货
            </Button>
          )}
          
          {order.status === ORDER_STATUS.COMPLETED && order.isBuyer && !order.hasReview && (
            <Button icon={<StarOutlined />} onClick={() => navigate(`/orders/${orderId}/review`)}>
              评价订单
            </Button>
          )}
        </Space>
      </Card>

      {/* 商品信息 */}
      <Card title="商品信息" style={{ marginBottom: '16px' }}>
        <Space>
          <Image
            width={100}
            height={100}
            src={order.productImageSnapshot}
            fallback="/placeholder-image.png"
            style={{ borderRadius: '8px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <Title level={5}>{order.productTitleSnapshot}</Title>
            <Space direction="vertical" size="small">
              <PriceTag price={order.priceAtPurchase} size="large" />
              <Text type="secondary">数量：1</Text>
            </Space>
          </div>
        </Space>
      </Card>

      {/* 订单信息 */}
      <Card title="订单信息" style={{ marginBottom: '16px' }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="订单编号">{order.orderId}</Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <Tag color={order.status === ORDER_STATUS.COMPLETED ? 'green' : 'blue'}>
              {order.statusText || order.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(order.createTime).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="支付金额">
            <PriceTag price={order.priceAtPurchase} />
          </Descriptions.Item>
          {order.paymentTime && (
            <Descriptions.Item label="支付时间">
              {new Date(order.paymentTime).toLocaleString()}
            </Descriptions.Item>
          )}
          {order.shipmentTime && (
            <Descriptions.Item label="发货时间">
              {new Date(order.shipmentTime).toLocaleString()}
            </Descriptions.Item>
          )}
          {order.completedTime && (
            <Descriptions.Item label="完成时间">
              {new Date(order.completedTime).toLocaleString()}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 收货地址 */}
      <Card title="收货地址" style={{ marginBottom: '16px' }}>
        <Descriptions column={1}>
          <Descriptions.Item label="收货人">
            {order.receiverName} {order.receiverPhone}
          </Descriptions.Item>
          <Descriptions.Item label="收货地址">
            {order.receiverAddress}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 交易双方信息 */}
      <Card title="交易信息" style={{ marginBottom: '16px' }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="买家">
            {order.buyer?.nickname || '买家'}
          </Descriptions.Item>
          <Descriptions.Item label="卖家">
            {order.seller?.nickname || '卖家'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 订单时间线 */}
      {order.timeline && order.timeline.length > 0 && (
        <Card title="订单跟踪" style={{ marginBottom: '16px' }}>
          <Timeline>
            {order.timeline.map((item, index) => (
              <Timeline.Item key={index} color={item.type === 'success' ? 'green' : 'blue'}>
                <div>
                  <Text strong>{item.title}</Text>
                  <br />
                  <Text type="secondary">{item.description}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(item.time).toLocaleString()}
                  </Text>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* 评价信息 */}
      {order.review && (
        <Card title="买家评价" style={{ marginBottom: '16px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Rate disabled defaultValue={order.review.rating} />
            <Paragraph>{order.review.comment}</Paragraph>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              评价时间：{new Date(order.review.createTime).toLocaleString()}
            </Text>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default OrderDetailPage;
