/**
 * 退货管理页面 - 第4周核心功能
 * 
 * 功能：
 * - 退货申请列表展示
 * - 买家和卖家视图切换
 * - 退货状态筛选
 * - 退货申请处理
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
  Tag, 
  Button, 
  Space, 
  Image, 
  Typography, 
  Select,
  message,
  Modal,
  Form,
  Input,
  Descriptions
} from 'antd';
import { 
  ExclamationCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  TruckOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextNew';
import { 
  returnService, 
  RETURN_STATUS, 
  RETURN_STATUS_TEXTS,
  RETURN_REASON_TEXTS 
} from '../../services/returnService';
import PriceTag from '../../components/atoms/PriceTag/PriceTag';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ReturnManagePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('buyer');
  
  // 模态框状态
  const [processModal, setProcessModal] = useState({ visible: false, return: null });
  const [shippingModal, setShippingModal] = useState({ visible: false, return: null });
  const [detailModal, setDetailModal] = useState({ visible: false, return: null });
  
  const [form] = Form.useForm();

  // 加载退货列表
  const loadReturns = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize: pageSize,
        role: activeTab,
        ...(statusFilter && { status: statusFilter })
      };
      
      const data = await returnService.getReturnRequests(params);
      setReturns(data.returns);
      setTotal(data.total);
    } catch (error) {
      console.error('加载退货列表失败:', error);
      message.error('加载退货列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载和参数变化时重新加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadReturns();
    }
  }, [isAuthenticated, currentPage, statusFilter, activeTab]);

  // 处理退货申请（卖家）
  const handleProcessReturn = async (values) => {
    try {
      const { action, reason } = values;
      await returnService.processReturnRequest(
        processModal.return.returnId, 
        action, 
        reason
      );
      
      message.success(action === 'approve' ? '已同意退货申请' : '已拒绝退货申请');
      setProcessModal({ visible: false, return: null });
      form.resetFields();
      loadReturns();
    } catch (error) {
      console.error('处理退货申请失败:', error);
      message.error('处理退货申请失败');
    }
  };

  // 处理发货（买家退货）
  const handleShipping = async (values) => {
    try {
      await returnService.buyerShipReturn(
        shippingModal.return.returnId,
        {
          trackingNumber: values.trackingNumber,
          shippingCompany: values.shippingCompany,
          shippingAddress: values.shippingAddress
        }
      );
      
      message.success('发货信息提交成功');
      setShippingModal({ visible: false, return: null });
      form.resetFields();
      loadReturns();
    } catch (error) {
      console.error('提交发货信息失败:', error);
      message.error('提交发货信息失败');
    }
  };

  // 确认收货（卖家）
  const handleConfirmReceived = async (returnItem) => {
    try {
      await returnService.sellerConfirmReceived(returnItem.returnId);
      message.success('确认收货成功');
      loadReturns();
    } catch (error) {
      console.error('确认收货失败:', error);
      message.error('确认收货失败');
    }
  };

  // 取消退货申请
  const handleCancelReturn = async (returnItem) => {
    Modal.confirm({
      title: '确认取消退货申请？',
      content: '取消后将无法恢复，请确认操作',
      onOk: async () => {
        try {
          await returnService.cancelReturnRequest(returnItem.returnId);
          message.success('已取消退货申请');
          loadReturns();
        } catch (error) {
          console.error('取消退货申请失败:', error);
          message.error('取消退货申请失败');
        }
      }
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '商品信息',
      dataIndex: 'order',
      key: 'product',
      width: 300,
      render: (order) => (
        <Space>
          <Image
            width={60}
            height={60}
            src={order?.productImage}
            fallback="/placeholder-image.png"
            style={{ borderRadius: '6px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: '4px' }}>
              {order?.productTitle}
            </div>
            <PriceTag price={order?.originalPrice} size="small" />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              订单号：{order?.orderId}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: '退货原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 120,
      render: (reason) => RETURN_REASON_TEXTS[reason] || reason
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 100,
      render: (amount) => <PriceTag price={amount} size="small" />
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = {
          [RETURN_STATUS.PENDING]: 'orange',
          [RETURN_STATUS.APPROVED]: 'blue',
          [RETURN_STATUS.REJECTED]: 'red',
          [RETURN_STATUS.BUYER_SHIPPED]: 'cyan',
          [RETURN_STATUS.SELLER_RECEIVED]: 'purple',
          [RETURN_STATUS.REFUNDED]: 'green',
          [RETURN_STATUS.CANCELLED]: 'default'
        };
        
        return (
          <Tag color={colors[status]}>
            {RETURN_STATUS_TEXTS[status] || status}
          </Tag>
        );
      }
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      render: (time) => new Date(time).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetailModal({ visible: true, return: record })}
          >
            详情
          </Button>
          
          {/* 买家操作 */}
          {activeTab === 'buyer' && (
            <>
              {record.status === RETURN_STATUS.PENDING && record.canCancel && (
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleCancelReturn(record)}
                >
                  取消
                </Button>
              )}
              
              {record.status === RETURN_STATUS.APPROVED && record.canShip && (
                <Button
                  size="small"
                  type="primary"
                  icon={<TruckOutlined />}
                  onClick={() => setShippingModal({ visible: true, return: record })}
                >
                  发货
                </Button>
              )}
            </>
          )}
          
          {/* 卖家操作 */}
          {activeTab === 'seller' && (
            <>
              {record.status === RETURN_STATUS.PENDING && record.canProcess && (
                <Button
                  size="small"
                  type="primary"
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => setProcessModal({ visible: true, return: record })}
                >
                  处理
                </Button>
              )}
              
              {record.status === RETURN_STATUS.BUYER_SHIPPED && record.canConfirmReceived && (
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleConfirmReceived(record)}
                >
                  确认收货
                </Button>
              )}
            </>
          )}
        </Space>
      )
    }
  ];

  // 未登录重定向
  if (!isAuthenticated) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>退货管理</Title>
      
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              <Select
                placeholder="状态筛选"
                style={{ width: 120 }}
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
              >
                {Object.entries(RETURN_STATUS_TEXTS).map(([key, text]) => (
                  <Option key={key} value={key}>{text}</Option>
                ))}
              </Select>
            </Space>
          }
        >
          <TabPane tab="我的退货申请" key="buyer">
            <Table
              columns={columns}
              dataSource={returns}
              rowKey="returnId"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>
          
          <TabPane tab="待处理退货" key="seller">
            <Table
              columns={columns}
              dataSource={returns}
              rowKey="returnId"
              loading={loading}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: setCurrentPage,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 处理退货申请模态框 */}
      <Modal
        title="处理退货申请"
        open={processModal.visible}
        onCancel={() => {
          setProcessModal({ visible: false, return: null });
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleProcessReturn}
        >
          <Form.Item
            label="处理结果"
            name="action"
            rules={[{ required: true, message: '请选择处理结果' }]}
          >
            <Select placeholder="请选择处理结果">
              <Option value="approve">同意退货</Option>
              <Option value="reject">拒绝退货</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="处理说明"
            name="reason"
            rules={[{ required: true, message: '请填写处理说明' }]}
          >
            <TextArea
              rows={3}
              placeholder="请说明处理原因，买家将会看到此信息"
              maxLength={200}
              showCount
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setProcessModal({ visible: false, return: null });
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认处理
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 发货信息模态框 */}
      <Modal
        title="填写退货发货信息"
        open={shippingModal.visible}
        onCancel={() => {
          setShippingModal({ visible: false, return: null });
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleShipping}
        >
          <Form.Item
            label="快递公司"
            name="shippingCompany"
            rules={[{ required: true, message: '请选择快递公司' }]}
          >
            <Select placeholder="请选择快递公司">
              <Option value="SF">顺丰速运</Option>
              <Option value="YTO">圆通速递</Option>
              <Option value="ZTO">中通快递</Option>
              <Option value="STO">申通快递</Option>
              <Option value="YUNDA">韵达速递</Option>
              <Option value="EMS">中国邮政EMS</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="快递单号"
            name="trackingNumber"
            rules={[{ required: true, message: '请输入快递单号' }]}
          >
            <Input placeholder="请输入快递单号" />
          </Form.Item>
          
          <Form.Item
            label="收货地址"
            name="shippingAddress"
            rules={[{ required: true, message: '请输入收货地址' }]}
          >
            <TextArea
              rows={2}
              placeholder="请输入卖家提供的退货收货地址"
              maxLength={200}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setShippingModal({ visible: false, return: null });
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                提交发货信息
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 退货详情模态框 */}
      <Modal
        title="退货详情"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, return: null })}
        footer={
          <Button onClick={() => setDetailModal({ visible: false, return: null })}>
            关闭
          </Button>
        }
        width={800}
      >
        {detailModal.return && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="退货编号">
                {detailModal.return.returnId}
              </Descriptions.Item>
              <Descriptions.Item label="订单编号">
                {detailModal.return.orderId}
              </Descriptions.Item>
              <Descriptions.Item label="退货原因">
                {RETURN_REASON_TEXTS[detailModal.return.reason]}
              </Descriptions.Item>
              <Descriptions.Item label="退款金额">
                <PriceTag price={detailModal.return.refundAmount} />
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {new Date(detailModal.return.createTime).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color="blue">
                  {RETURN_STATUS_TEXTS[detailModal.return.status]}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            
            {detailModal.return.description && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>问题描述</Title>
                <Text>{detailModal.return.description}</Text>
              </div>
            )}
            
            {detailModal.return.shipping && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>发货信息</Title>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="快递公司">
                    {detailModal.return.shipping.shippingCompany}
                  </Descriptions.Item>
                  <Descriptions.Item label="快递单号">
                    {detailModal.return.shipping.trackingNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="发货时间">
                    {new Date(detailModal.return.shipping.shipTime).toLocaleString()}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReturnManagePage;
