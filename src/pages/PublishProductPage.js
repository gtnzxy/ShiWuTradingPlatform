/**
 * 商品发布页面 - 第3周核心功能
 * 
 * 功能：
 * - 商品信息填写表单
 * - 图片上传和预览
 * - 商品分类选择
 * - 价格设置
 * - 交易地点设置
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
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Space,
  Typography,
  Row,
  Col,
  message,
  Empty
} from 'antd';
import {
  ArrowLeftOutlined,
  CameraOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { productService } from '../services/productService';
import { CATEGORY_TEXTS } from '../services/productService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PublishProductPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fileList, setFileList] = useState([]);

  // 商品成色选项
  const conditionOptions = [
    { value: '全新', label: '全新' },
    { value: '99新', label: '99新' },
    { value: '95新', label: '95新' },
    { value: '9成新', label: '9成新' },
    { value: '8成新', label: '8成新' },
    { value: '7成新', label: '7成新' },
    { value: '其他', label: '其他' }
  ];

  // 加载商品分类
  const loadCategories = async () => {
    try {
      const categoryData = await productService.getCategories();
      setCategories(categoryData);
    } catch (error) {
      console.error('加载分类失败:', error);
      // 使用默认分类
      setCategories(Object.entries(CATEGORY_TEXTS).map(([id, name]) => ({
        id: parseInt(id),
        name
      })));
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

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

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // 处理上传的图片 - 按照uploadService规范
      const imageUrls = [];
      
      if (fileList && fileList.length > 0) {
        for (const file of fileList) {
          if (file.originFileObj) {
            try {
              // 调用图片上传服务
              const uploadResult = await productService.uploadImage(file.originFileObj);
              imageUrls.push(uploadResult.url);
            } catch (uploadError) {
              console.error('图片上传失败:', uploadError);
              message.warning(`图片 ${file.name} 上传失败`);
            }
          } else if (file.url) {
            // 已经上传的图片
            imageUrls.push(file.url);
          }
        }
      }
      
      // 构建商品数据 - 严格按照API规范
      const productData = {
        title: values.title,
        description: values.description,
        price: values.price,
        categoryId: values.categoryId,
        condition: values.condition,
        location: values.location,
        images: imageUrls,
        // 添加分类名称以便显示
        categoryName: categories.find(cat => cat.id === values.categoryId)?.name || '其他'
      };
      
      console.log('发布商品数据:', productData);
      
      const result = await productService.createProduct(productData);
      
      message.success('商品发布成功！');
      
      // 重置表单
      form.resetFields();
      setFileList([]);
      
      // 跳转到我的商品页面
      navigate('/my-products');
      
    } catch (error) {
      console.error('发布商品失败:', error);
      message.error(error.message || '发布商品失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 未登录状态
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Empty
          image={<PlusOutlined style={{ fontSize: '64px', color: '#ccc' }} />}
          description="请先登录发布商品"
        >
          <Button type="primary" onClick={() => navigate('/auth/login')}>
            立即登录
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 页面标题 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space align="center">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            发布商品
          </Title>
        </Space>
      </Card>

      {/* 发布表单 */}
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            condition: '9成新',
            location: '校内'
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              {/* 商品标题 */}
              <Form.Item
                label="商品标题"
                name="title"
                rules={[
                  { required: true, message: '请输入商品标题' },
                  { max: 100, message: '标题不能超过100字符' }
                ]}
              >
                <Input
                  placeholder="请输入商品标题，简洁明了"
                  showCount
                  maxLength={100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              {/* 商品分类 */}
              <Form.Item
                label="商品分类"
                name="categoryId"
                rules={[{ required: true, message: '请选择商品分类' }]}
              >
                <Select placeholder="请选择商品分类">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              {/* 商品价格 */}
              <Form.Item
                label="商品价格"
                name="price"
                rules={[
                  { required: true, message: '请输入商品价格' },
                  { type: 'number', min: 0.01, message: '价格必须大于0' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0.01}
                  max={99999.99}
                  precision={2}
                  step={0.01}
                  addonBefore="¥"
                  placeholder="请输入价格"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              {/* 商品成色 */}
              <Form.Item
                label="商品成色"
                name="condition"
                rules={[{ required: true, message: '请选择商品成色' }]}
              >
                <Select placeholder="请选择商品成色">
                  {conditionOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              {/* 交易地点 */}
              <Form.Item
                label="交易地点"
                name="location"
                rules={[{ required: true, message: '请输入交易地点' }]}
              >
                <Input placeholder="如：校内、宿舍楼下等" />
              </Form.Item>
            </Col>
          </Row>

          {/* 商品描述 */}
          <Form.Item
            label="商品描述"
            name="description"
            rules={[
              { required: true, message: '请输入商品描述' },
              { max: 2000, message: '描述不能超过2000字符' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="详细描述商品的特点、使用情况、购买原因等，帮助买家更好地了解商品"
              showCount
              maxLength={2000}
            />
          </Form.Item>

          {/* 商品图片 */}
          <Form.Item label="商品图片">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              beforeUpload={beforeUpload}
              multiple
              maxCount={9}
            >
              {fileList.length < 9 && (
                <div>
                  <CameraOutlined style={{ fontSize: '16px' }} />
                  <div style={{ marginTop: 8, fontSize: '12px' }}>
                    添加图片
                  </div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              最多上传9张图片，建议第一张作为封面图片
            </Text>
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                size="large"
              >
                发布商品
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

      {/* 发布说明 */}
      <Card style={{ marginTop: '16px', backgroundColor: '#f9f9f9' }}>
        <Title level={5}>发布说明</Title>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>请确保商品信息真实有效</li>
          <li>禁止发布违法违规商品</li>
          <li>建议上传清晰的商品图片</li>
          <li>价格设置要合理，避免过高或过低</li>
          <li>交易过程中请注意安全</li>
        </ul>
      </Card>
    </div>
  );
};

export default PublishProductPage;
