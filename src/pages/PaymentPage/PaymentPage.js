/**
 * 支付页面 - 模拟支付流程
 * 
 * 功能：
 * - 显示订单支付信息
 * - 模拟支付方式选择
 * - 模拟支付处理
 * - 支付结果反馈
 * 
 * 遵循设计标准：
 * - 严格按照后端API设计
 * - 使用Ant Design组件
 * - 支付安全提示
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Radio,
  Alert,
  Modal,
  Spin,
  Result,
  message
} from 'antd';
import { 
  PayCircleOutlined,
  WalletOutlined,
  CreditCardOutlined,
  MobileOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextNew';
import { orderService } from '../../services/orderService';
import PriceTag from '../../components/atoms/PriceTag/PriceTag';

const { Title, Text } = Typography;

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 状态管理
  const [paymentMethod, setPaymentMethod] = useState('campus_card');
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [countdown, setCountdown] = useState(15 * 60); // 15分钟倒计时

  // 从路由状态获取订单信息
  const { orderIds, totalAmount } = location.state || {};

  // 模拟支付方式
  const paymentMethods = [
    {
      key: 'campus_card',
      name: '余额支付',
      icon: <CreditCardOutlined />,
      description: '使用账户余额支付',
      balance: 1288.50
    },
    {
      key: 'mobile_pay',
      name: '手机支付',
      icon: <MobileOutlined />,
      description: '微信/支付宝扫码支付'
    },
    {
      key: 'wallet',
      name: '平台钱包',
      icon: <WalletOutlined />,
      description: '使用平台虚拟钱包余额',
      balance: 520.00
    }
  ];

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0 && !paymentResult) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !paymentResult) {
      // 支付超时
      setPaymentResult({
        success: false,
        message: '支付超时，订单已取消'
      });
    }
  }, [countdown, paymentResult]);

  // 格式化倒计时显示
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 处理支付
  const handlePayment = async () => {
    if (!orderIds || orderIds.length === 0) {
      message.error('订单信息错误');
      return;
    }

    // 检查余额（对于有余额的支付方式）
    const selectedMethod = paymentMethods.find(m => m.key === paymentMethod);
    if (selectedMethod?.balance !== undefined && selectedMethod.balance < totalAmount) {
      message.error('余额不足，请选择其他支付方式或充值');
      return;
    }

    Modal.confirm({
      title: '确认支付',
      content: (
        <div>
          <p>支付方式：{selectedMethod?.name}</p>
          <p>支付金额：<PriceTag price={totalAmount} /></p>
          <p>订单数量：{orderIds.length} 个</p>
        </div>
      ),
      okText: '确认支付',
      cancelText: '取消',
      onOk: async () => {
        try {
          setPaying(true);
          
          // 模拟支付延迟
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 调用支付API（逐个订单支付）
          const paymentPromises = orderIds.map(orderId => 
            orderService.processPayment(orderId)
          );
          
          const results = await Promise.all(paymentPromises);
          
          // 检查所有支付是否成功
          const allSuccess = results.every(result => result.status === 'SUCCESS');
          
          if (allSuccess) {
            setPaymentResult({
              success: true,
              message: '支付成功！订单已生成，卖家将尽快发货。'
            });
            message.success('支付成功');
          } else {
            setPaymentResult({
              success: false,
              message: '部分订单支付失败，请重试'
            });
          }
        } catch (error) {
          console.error('支付失败:', error);
          const errorMessage = error.response?.data?.error?.userTip || '支付失败，请重试';
          setPaymentResult({
            success: false,
            message: errorMessage
          });
        } finally {
          setPaying(false);
        }
      }
    });
  };

  // 处理重新支付
  const handleRetryPayment = () => {
    setPaymentResult(null);
    setCountdown(15 * 60); // 重置倒计时
  };

  // 未登录重定向
  if (!isAuthenticated) {
    navigate('/auth/login');
    return null;
  }

  // 参数验证
  if (!orderIds || !totalAmount) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Alert
          message="支付信息错误"
          description="没有找到有效的订单信息"
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/cart')}>
              返回购物车
            </Button>
          }
        />
      </div>
    );
  }

  // 支付结果页面
  if (paymentResult) {
    return (
      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <Result
          status={paymentResult.success ? 'success' : 'error'}
          title={paymentResult.success ? '支付成功' : '支付失败'}
          subTitle={paymentResult.message}
          extra={[
            paymentResult.success ? (
              <Button type="primary" key="orders" onClick={() => navigate('/orders')}>
                查看订单
              </Button>
            ) : (
              <Button type="primary" key="retry" onClick={handleRetryPayment}>
                重新支付
              </Button>
            ),
            <Button key="home" onClick={() => navigate('/home')}>
              返回首页
            </Button>
          ]}
        />
      </div>
    );
  }

  // 支付中状态
  if (paying) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Title level={4}>支付处理中...</Title>
          <Text type="secondary">请稍候，正在处理您的支付请求</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <PayCircleOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <Title level={3} style={{ marginTop: '16px' }}>订单支付</Title>
          <Text type="secondary">
            支付剩余时间：<Text strong style={{ color: '#ff4d4f' }}>
              {formatCountdown(countdown)}
            </Text>
          </Text>
        </div>

        {/* 订单信息 */}
        <Card title="订单信息" size="small" style={{ marginBottom: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text>订单数量：</Text>
              <Text>{orderIds.length} 个</Text>
            </Space>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Text strong>应付金额：</Text>
              <PriceTag 
                price={totalAmount} 
                size="large" 
                style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}
              />
            </Space>
          </Space>
        </Card>

        {/* 支付方式选择 */}
        <Card title="选择支付方式" size="small" style={{ marginBottom: '24px' }}>
          <Radio.Group
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {paymentMethods.map((method) => (
                <Radio key={method.key} value={method.key} style={{ width: '100%' }}>
                  <Card size="small" style={{ marginLeft: '8px', width: 'calc(100% - 32px)' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        {method.icon}
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{method.name}</div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {method.description}
                          </Text>
                        </div>
                      </Space>
                      {method.balance !== undefined && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#999' }}>余额</div>
                          <PriceTag price={method.balance} />
                        </div>
                      )}
                    </Space>
                  </Card>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Card>

        {/* 安全提示 */}
        <Alert
          message="支付安全提示"
          description={
            <div>
              <p><SafetyOutlined /> 请确认收货地址和商品信息无误后再进行支付</p>
              <p><SafetyOutlined /> 支付成功后，资金将暂时冻结，确认收货后转给卖家</p>
              <p><SafetyOutlined /> 如有问题，请及时联系平台客服</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        {/* 支付按钮 */}
        <div style={{ textAlign: 'center' }}>
          <Space size="large">
            <Button size="large" onClick={() => navigate(-1)}>
              返回修改
            </Button>
            <Button 
              type="primary" 
              size="large"
              onClick={handlePayment}
              style={{ minWidth: '120px' }}
            >
              立即支付 <PriceTag price={totalAmount} />
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default PaymentPage;
