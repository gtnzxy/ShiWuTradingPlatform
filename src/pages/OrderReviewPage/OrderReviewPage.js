/**
 * 订单评价页面 - 第4周核心功能
 * 
 * 功能：
 * - 订单评价表单
 * - 评分和文字评价
 * - 图片上传(可选)
 * - 评价提交
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
  Rate, 
  Input, 
  Upload, 
  Button, 
  Space, 
  Typography, 
  Image,
  Spin,
  Alert,
  message
} from 'antd';
import { 
  StarOutlined,
  ArrowLeftOutlined,
  CameraOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextNew';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import PriceTag from '../../components/atoms/PriceTag/PriceTag';

const { TextArea } = Input;
const { Title, Text } = Typography;

const OrderReviewPage = () => {
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

  // 评分描述
  const ratingDescriptions = {
    1: '非常不满意',
    2: '不满意',
    3: '一般',
    4: '满意',
    5: '非常满意'
  };

  // 加载订单详情
  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await orderService.getOrderDetail(orderId);
      
      // 检查订单状态和评价权限
      if (orderData.status !== 'COMPLETED') {
        setError('只能对已完成的订单进行评价');
        return;
      }
      
      if (orderData.hasReview) {
        setError('该订单已经评价过了');
        return;
      }
      
      if (!orderData.isBuyer) {
        setError('只有买家可以评价订单');
        return;
      }
      
      setOrder(orderData);
      setError(null);
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

  // 提交评价
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
      
      // 提交评价数据
      const reviewData = {
        orderId: orderId,
        rating: values.rating,
        comment: values.comment || '',
        images: imageUrls
      };
      
      await reviewService.createReview(reviewData);
      
      message.success('评价提交成功');
      navigate(`/orders/${orderId}`);
      
    } catch (error) {
      console.error('提交评价失败:', error);
      message.error('提交评价失败');
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
          message="无法评价"
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
            评价订单
          </Title>
        </Space>
      </Card>

      {/* 商品信息 */}
      <Card title="评价商品" style={{ marginBottom: '16px' }}>
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
            </Space>
          </div>
        </Space>
      </Card>

      {/* 评价表单 */}
      <Card title="发表评价">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            rating: 5
          }}
        >
          {/* 评分 */}
          <Form.Item
            label="评分"
            name="rating"
            rules={[
              { required: true, message: '请选择评分' }
            ]}
          >
            <div>
              <Rate 
                style={{ fontSize: '24px' }}
                character={<StarOutlined />}
              />
              <Form.Item dependencies={['rating']} noStyle>
                {({ getFieldValue }) => {
                  const rating = getFieldValue('rating');
                  return rating ? (
                    <Text 
                      type="secondary" 
                      style={{ marginLeft: '16px', fontSize: '14px' }}
                    >
                      {ratingDescriptions[rating]}
                    </Text>
                  ) : null;
                }}
              </Form.Item>
            </div>
          </Form.Item>

          {/* 评价内容 */}
          <Form.Item
            label="评价内容"
            name="comment"
            rules={[
              { max: 500, message: '评价内容不能超过500字' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="分享你的购买体验，帮助其他用户做出更好的选择"
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* 图片上传 */}
          <Form.Item label="上传图片（可选）">
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
              最多上传5张图片，每张不超过2MB
            </Text>
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<StarOutlined />}
                size="large"
              >
                提交评价
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

      {/* 评价说明 */}
      <Card style={{ marginTop: '16px', backgroundColor: '#f9f9f9' }}>
        <Title level={5}>评价说明</Title>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>评价一旦提交将无法修改，请谨慎填写</li>
          <li>请客观真实地评价商品和服务</li>
          <li>恶意评价或虚假评价将被系统删除</li>
          <li>评价内容将公开显示，请注意隐私保护</li>
        </ul>
      </Card>
    </div>
  );
};

export default OrderReviewPage;
