/**
 * 我的商品页面 - 第3周核心功能
 * 
 * 功能：
 * - 我发布的商品列表
 * - 商品状态筛选
 * - 商品编辑和删除
 * - 商品上下架管理
 * - 商品数据统计
 * 
 * 遵循设计标准：
 * - 严格按照后端API设计
 * - 使用Ant Design组件
 * - 响应式布局
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Image, 
  Typography, 
  Select,
  Statistic,
  Row,
  Col,
  message,
  Popconfirm
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  PlusOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { productService, PRODUCT_STATUS, STATUS_TEXTS } from '../services/productService';
import PriceTag from '../components/atoms/PriceTag/PriceTag';

const { Title, Text } = Typography;
const { Option } = Select;

const MyProductsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    offShelf: 0
  });

  // 加载我的商品列表
  const loadMyProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...(statusFilter && { status: statusFilter })
      };

      const response = await productService.getMyProducts(params);
      
      setProducts(response.products || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0
      }));
      
      // 更新统计数据
      updateStats(response.products || []);
    } catch (error) {
      console.error('加载商品列表失败:', error);
      message.error('加载商品列表失败');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, statusFilter]);

  // 更新统计数据
  const updateStats = (productList) => {
    const newStats = {
      total: productList.length,
      available: productList.filter(p => p.status === PRODUCT_STATUS.AVAILABLE).length,
      sold: productList.filter(p => p.status === PRODUCT_STATUS.SOLD).length,
      offShelf: productList.filter(p => p.status === PRODUCT_STATUS.OFF_SHELF).length
    };
    setStats(newStats);
  };

  // 页面加载时获取数据
  useEffect(() => {
    if (isAuthenticated) {
      loadMyProducts();
    } else {
      // 未登录重定向到登录页面
      navigate('/auth/login');
    }
  }, [isAuthenticated, loadMyProducts, navigate]);

  // 处理分页
  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize
    }));
  };

  // 查看商品详情
  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  // 编辑商品
  const handleEditProduct = (productId) => {
    navigate(`/products/${productId}/edit`);
  };

  // 删除商品
  const handleDeleteProduct = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      message.success('删除成功');
      loadMyProducts();
    } catch (error) {
      console.error('删除商品失败:', error);
      message.error('删除失败');
    }
  };

  // 上架/下架商品
  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const action = currentStatus === PRODUCT_STATUS.AVAILABLE ? 'off_shelf' : 'on_shelf';
      await productService.toggleProductStatus(productId, action);
      
      const actionText = action === 'off_shelf' ? '下架' : '上架';
      message.success(`${actionText}成功`);
      loadMyProducts();
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error('操作失败');
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '商品信息',
      dataIndex: 'product',
      key: 'product',
      width: '40%',
      render: (_, record) => (
        <Space>
          <Image
            width={60}
            height={60}
            src={record.mainImage}
            fallback="/placeholder-image.png"
            preview={false}
            style={{ borderRadius: '4px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {record.title}
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              分类：{record.categoryName}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: '价格',
      dataIndex: 'price',
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
        const colors = {
          [PRODUCT_STATUS.AVAILABLE]: 'green',
          [PRODUCT_STATUS.SOLD]: 'blue',
          [PRODUCT_STATUS.OFF_SHELF]: 'orange',
          [PRODUCT_STATUS.PENDING]: 'purple'
        };
        
        return (
          <Tag color={colors[status]}>
            {STATUS_TEXTS[status] || status}
          </Tag>
        );
      }
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      width: '10%',
      render: (count) => <Text type="secondary">{count}</Text>
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
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
      width: '16%',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space size="small">
            <Button
              size="small"
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewProduct(record.id)}
            >
              查看
            </Button>
            
            {record.status !== PRODUCT_STATUS.SOLD && (
              <Button
                size="small"
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditProduct(record.id)}
              >
                编辑
              </Button>
            )}
          </Space>
          
          <Space size="small">
            {record.status === PRODUCT_STATUS.AVAILABLE && (
              <Button
                size="small"
                type="link"
                icon={<DownOutlined />}
                onClick={() => handleToggleStatus(record.id, record.status)}
              >
                下架
              </Button>
            )}
            
            {record.status === PRODUCT_STATUS.OFF_SHELF && (
              <Button
                size="small"
                type="link"
                icon={<UpOutlined />}
                onClick={() => handleToggleStatus(record.id, record.status)}
              >
                上架
              </Button>
            )}
            
            {record.status !== PRODUCT_STATUS.SOLD && (
              <Popconfirm
                title="确定删除这个商品吗？"
                onConfirm={() => handleDeleteProduct(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  size="small"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Space>
      )
    }
  ];

  // 未登录时显示加载状态，避免在render中导航
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={3}>我的商品</Title>
      
      {/* 统计数据 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="总商品数" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="在售中" value={stats.available} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已售出" value={stats.sold} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已下架" value={stats.offShelf} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>

      {/* 商品列表 */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Select
              placeholder="状态筛选"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              {Object.entries(STATUS_TEXTS).map(([key, text]) => (
                <Option key={key} value={key}>{text}</Option>
              ))}
            </Select>
          </Space>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/publish')}
          >
            发布新商品
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条商品`
          }}
        />
      </Card>
    </div>
  );
};

export default MyProductsPage;
