/**
 * 退货申请页面 - 第4周核心功能
 * 
 * 功能：
 * - 退货申请表单
 * - 退货原因选择
 * - 退款金额设置
 * - 凭证图片上传
 * 
 * 遵循设计标准：
 * - 严格按照后端API设计
 * - 使用Ant Design组件
 * - 表单验证和错误处理
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Select, 
  Input, 
  Upload, 
  Button, 
  Space, 
  Typography, 
  Image,
  Spin,
  Alert,
  message,
  InputNumber
} from 'antd';
import { 
  ArrowLeftOutlined,
  CameraOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextNew';
import { orderService } from '../../services/orderService';
import { returnService, RETURN_REASON_TEXTS } from '../../services/returnService';
import PriceTag from '../../components/atoms/PriceTag/PriceTag';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const ReturnRequestPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [fileList, setFileList] = useState([]);

  // 加载订单详情
  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderDetail(orderId);
      
      // 检查退货权限
      if (!orderData.isBuyer) {
        setError('只有买家可以申请退货');
        return;
      }
      
      if (orderData.status !== 'COMPLETED' && orderData.status !== 'SHIPPED') {
        setError('只能对已发货或已完成的订单申请退货');
        return;
      }
      
      if (orderData.hasReturnRequest) {
        setError('该订单已经申请过退货');
        return;
      }
      
      // 检查退货时限（通常7-15天）
      const orderTime = new Date(orderData.completedTime || orderData.shipmentTime);
      const now = new Date();
      const daysDiff = (now - orderTime) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) { // 假设退货期限是7天
        setError('已超过退货时限（7天）');
        return;
      }
      
      setOrder(orderData);
      setError(null);
      
      // 设置默认退款金额
      form.setFieldsValue({
        refundAmount: orderData.priceAtPurchase
      });
      
    } catch (error) {
      console.error('加载订单详情失败:', error);
      setError('加载订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadOrderDetail();
    }
  }, [orderId, isAuthenticated]);

  // 处理图片上传
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 上传前检查
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return false;
    }
    
    return false; // 阻止自动上传，手动处理
  };

  // 提交退货申请
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // 处理上传的图片
      const imageUrls = [];
      for (const file of fileList) {
        if (file.originFileObj) {
          // 这里应该调用图片上传服务
          // const imageUrl = await uploadService.uploadImage(file.originFileObj);
          // imageUrls.push(imageUrl);
          
          // 临时处理：使用本地URL（实际项目中需要上传到服务器）
          const reader = new FileReader();
          reader.onload = (e) => {
            imageUrls.push(e.target.result);
          };
          reader.readAsDataURL(file.originFileObj);
        }
      }
      
      // 提交退货申请数据
      const returnData = {
        orderId: orderId,
        reason: values.reason,
        description: values.description || '',
        refundAmount: values.refundAmount,
        images: imageUrls
      };
      
      const result = await returnService.createReturnRequest(returnData);
      
      message.success('退货申请提交成功');
      navigate(`/returns/${result.returnId}`);
      
    } catch (error) {
      console.error('提交退货申请失败:', error);
      message.error('提交退货申请失败');
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
          <Text type="secondary">加载订单信息中...</Text>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !order) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="无法申请退货"
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

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
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
            申请退货退款
          </Title>
        </Space>
      </Card>

      {/* 商品信息 */}
      <Card title="退货商品" style={{ marginBottom: '16px' }}>
        <Space>
          <Image
            width={80}
            height={80}
            src={order.productImageSnapshot}
            fallback="/placeholder-image.png"
            style={{ borderRadius: '8px', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <Title level={5}>{order.productTitleSnapshot}</Title>
            <Space direction="vertical" size="small">
              <PriceTag price={order.priceAtPurchase} />
              <Text type="secondary">订单号：{order.orderId}</Text>
              <Text type="secondary">
                购买时间：{new Date(order.createTime).toLocaleDateString()}
              </Text>
            </Space>
          </div>
        </Space>
      </Card>

      {/* 退货申请表单 */}
      <Card title="退货信息">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            refundAmount: order?.priceAtPurchase
          }}
        >
          {/* 退货原因 */}
          <Form.Item
            label="退货原因"
            name="reason"
            rules={[
              { required: true, message: '请选择退货原因' }
            ]}
          >
            <Select placeholder="请选择退货原因">
              {Object.entries(RETURN_REASON_TEXTS).map(([key, text]) => (
                <Option key={key} value={key}>{text}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* 问题描述 */}
          <Form.Item
            label="问题描述"
            name="description"
            rules={[
              { required: true, message: '请详细描述遇到的问题' },
              { max: 500, message: '描述内容不能超过500字' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述商品存在的问题，这有助于我们更好地处理您的退货申请"
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* 退款金额 */}
          <Form.Item
            label="申请退款金额"
            name="refundAmount"
            rules={[
              { required: true, message: '请输入退款金额' },
              { 
                type: 'number', 
                min: 0.01, 
                max: order?.priceAtPurchase, 
                message: `退款金额应在0.01-${order?.priceAtPurchase}之间` 
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0.01}
              max={order?.priceAtPurchase}
              precision={2}
              step={0.01}
              addonBefore="¥"
              placeholder="请输入退款金额"
            />
          </Form.Item>

          {/* 凭证图片 */}
          <Form.Item label="问题凭证（必填）">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              beforeUpload={beforeUpload}
              multiple
              maxCount={5}
            >
              {fileList.length < 5 && (
                <div>
                  <CameraOutlined style={{ fontSize: '16px' }} />
                  <div style={{ marginTop: 8, fontSize: '12px' }}>
                    添加图片
                  </div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              请上传能说明问题的图片，最多5张，每张不超过2MB
            </Text>
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<ExclamationCircleOutlined />}
                size="large"
              >
                提交退货申请
              </Button>
              <Button 
                onClick={() => navigate(-1)}
                size="large"
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 退货说明 */}
      <Card style={{ marginTop: '16px', backgroundColor: '#f9f9f9' }}>
        <Title level={5}>退货说明</Title>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>退货申请提交后，卖家将在24小时内处理</li>
          <li>退货商品必须保持原有状态，包装完好</li>
          <li>买家需承担退货运费（商品质量问题除外）</li>
          <li>退款将在卖家确认收货后3-5个工作日内到账</li>
          <li>恶意退货申请将被系统记录并可能影响信用</li>
        </ul>
      </Card>
    </div>
  );
};

export default ReturnRequestPage;
