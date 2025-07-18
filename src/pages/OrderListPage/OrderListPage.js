/**
 * 订单列表页面 - 第4周核心功能
 * 
 * 功能：
 * - 我的购买订单列表
 * - 我的销售订单列表
 * - 订单状态筛选
 * - 订单操作（发货、确认收货、评价、申请退货）
 * - 分页展示
 * 
 * 遵循设计标准：
 * - 严格按照后端API设计
 * - 使用Ant Design组件
 * - 响应式布局
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Image, 
  Typography, 
  Modal, 
  message,
  Empty,
  Pagination
} from 'antd';
import { 
  ShoppingOutlined, 
  ShopOutlined, 
  TruckOutlined,
  CheckCircleOutlined,
  StarOutlined,
  RetweetOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextNew';
import { orderService, ORDER_STATUS, USER_ROLE } from '../../services/orderService';
import PriceTag from '../../components/atoms/PriceTag/PriceTag';

const { TabPane } = Tabs;
const { Text, Title } = Typography;

const OrderListPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('purchases');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedStatus] = useState('');

  // 订单状态标签映射
  const statusTagMap = {
    [ORDER_STATUS.AWAITING_PAYMENT]: { color: 'orange', text: '待支付' },
    [ORDER_STATUS.AWAITING_SHIPPING]: { color: 'blue', text: '待发货' },
    [ORDER_STATUS.SHIPPED]: { color: 'cyan', text: '已发货' },
    [ORDER_STATUS.COMPLETED]: { color: 'green', text: '已完成' },
    [ORDER_STATUS.CANCELLED]: { color: 'red', text: '已取消' },
    [ORDER_STATUS.RETURNED]: { color: 'purple', text: '已退货' }
  };

  // 加载订单数据
  const loadOrders = async (params = {}) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const role = activeTab === 'purchases' ? USER_ROLE.BUYER : USER_ROLE.SELLER;
      const queryParams = {
        role,
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params
      };

      if (selectedStatus) {
        queryParams.status = selectedStatus;
      }

      const response = await orderService.getOrderList(queryParams);
      
      setOrders(response.items || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));
    } catch (error) {
      console.error('加载订单失败:', error);
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    loadOrders();
  }, [activeTab, selectedStatus, pagination.current, pagination.pageSize, isAuthenticated]);

  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 处理分页
  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize
    }));
  };

  // 处理发货
  const handleShip = async (orderId) => {
    try {
      await orderService.shipOrder(orderId);
      message.success('发货成功');
      loadOrders();
    } catch (error) {
      console.error('发货失败:', error);
      message.error('发货失败');
    }
  };

  // 处理确认收货
  const handleConfirmReceived = async (orderId) => {
    Modal.confirm({
      title: '确认收货',
      content: '确认已收到商品吗？确认后将无法撤销。',
      onOk: async () => {
        try {
          await orderService.confirmReceived(orderId);
          message.success('确认收货成功');
          loadOrders();
        } catch (error) {
          console.error('确认收货失败:', error);
          message.error('确认收货失败');
        }
      }
    });
  };

  // 处理评价
  const handleReview = (orderId) => {
    navigate(`/orders/${orderId}/review`);
  };

  // 处理申请退货
  const handleRequestReturn = (orderId) => {
    navigate(`/orders/${orderId}/return`);
  };

  // 查看订单详情
  const handleViewDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // 购买订单操作按钮
  const getPurchaseActions = (record) => {
    const actions = [];
    
    actions.push(
      <Button 
        key="detail" 
        type="link" 
        icon={<EyeOutlined />}
        onClick={() => handleViewDetail(record.orderId)}
      >
        详情
      </Button>
    );

    switch (record.status) {
      case ORDER_STATUS.AWAITING_PAYMENT:
        actions.push(
          <Button 
            key="pay" 
            type="primary" 
            size="small"
            onClick={() => navigate('/payment', { 
              state: { 
                orderIds: [record.orderId], 
                totalAmount: record.priceAtPurchase 
              } 
            })}
          >
            立即支付
          </Button>
        );
        break;
      
      case ORDER_STATUS.SHIPPED:
        actions.push(
          <Button 
            key="confirm" 
            type="primary" 
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleConfirmReceived(record.orderId)}
          >
            确认收货
          </Button>
        );
        break;
      
      case ORDER_STATUS.COMPLETED:
        if (!record.hasReview) {
          actions.push(
            <Button 
              key="review" 
              type="default" 
              size="small"
              icon={<StarOutlined />}
              onClick={() => handleReview(record.orderId)}
            >
              评价
            </Button>
          );
        }
        actions.push(
          <Button 
            key="return" 
            type="default" 
            size="small"
            icon={<RetweetOutlined />}
            onClick={() => handleRequestReturn(record.orderId)}
          >
            申请退货
          </Button>
        );
        break;
    }

    return actions;
  };

  // 销售订单操作按钮
  const getSalesActions = (record) => {
    const actions = [];
    
    actions.push(
      <Button 
        key="detail" 
        type="link" 
        icon={<EyeOutlined />}
        onClick={() => handleViewDetail(record.orderId)}
      >
        详情
      </Button>
    );

    if (record.status === ORDER_STATUS.AWAITING_SHIPPING) {
      actions.push(
        <Button 
          key="ship" 
          type="primary" 
          size="small"
          icon={<TruckOutlined />}
          onClick={() => handleShip(record.orderId)}
        >
          发货
        </Button>
      );
    }

    return actions;
  };

  // 表格列定义
  const columns = [
    {
      title: '商品信息',
      dataIndex: 'product',
      key: 'product',
      width: '40%',
      render: (product, record) => (
        <Space>
          <Image
            width={60}
            height={60}
            src={record.productImageSnapshot}
            fallback="/placeholder-image.png"
            preview={false}
            style={{ borderRadius: '4px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {record.productTitleSnapshot}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              订单号：{record.orderId}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: activeTab === 'purchases' ? '卖家' : '买家',
      dataIndex: activeTab === 'purchases' ? 'seller' : 'buyer',
      key: 'user',
      width: '15%',
      render: (user) => (
        <Space direction="vertical" size="small">
          <Text>{user?.nickname || '用户'}</Text>
        </Space>
      )
    },
    {
      title: '金额',
      dataIndex: 'priceAtPurchase',
      key: 'price',
      width: '12%',
      render: (price) => <PriceTag price={price} />
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: (status) => {
        const statusInfo = statusTagMap[status];
        return statusInfo ? (
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        ) : (
          <Tag>{status}</Tag>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: '12%',
      render: (time) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {new Date(time).toLocaleDateString()}
        </Text>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {activeTab === 'purchases' 
            ? getPurchaseActions(record)
            : getSalesActions(record)
          }
        </Space>
      )
    }
  ];

  // 未登录重定向
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Empty
          description="请先登录查看订单"
          image={<ShoppingOutlined style={{ fontSize: '64px', color: '#ccc' }} />}
        >
          <Button type="primary" onClick={() => navigate('/auth/login')}>
            立即登录
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <Title level={3}>我的订单</Title>
        
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane 
            tab={
              <span>
                <ShoppingOutlined />
                我的购买
              </span>
            } 
            key="purchases"
          >
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="orderId"
              loading={loading}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    description="暂无购买订单"
                    image={<ShoppingOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
                  />
                )
              }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ShopOutlined />
                我的销售
              </span>
            } 
            key="sales"
          >
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="orderId"
              loading={loading}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    description="暂无销售订单"
                    image={<ShopOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
                  />
                )
              }}
            />
          </TabPane>
        </Tabs>

        {/* 分页 */}
        {pagination.total > 0 && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条订单`
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default OrderListPage;
