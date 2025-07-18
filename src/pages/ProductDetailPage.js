/**
 * 商品详情页面 - 第3周核心功能
 * 
 * 功能：
 * - 商品详细信息展示
 * - 商品图片轮播
 * - 卖家信息展示
 * - 添加购物车功能
 * - 立即购买功能
 * - 收藏功能
 * 
 * 遵循设计标准：
 * - 严格按照后端API设计
 * - 使用Ant Design组件
 * - 响应式布局
 */

import React, { useState, useEffect } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Image, 
  Descriptions, 
  Avatar,
  Rate,
  Spin,
  Alert,
  message
} from 'antd';
import { 
  ShoppingCartOutlined, 
  HeartOutlined, 
  HeartFilled,
  UserOutlined,
  EyeOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import PriceTag from '../components/atoms/PriceTag/PriceTag';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 加载商品详情
  const loadProductDetail = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(id);
      setProduct(productData);
      setIsFavorited(productData.isFavorited || false);
      setError(null);
    } catch (error) {
      console.error('加载商品详情失败:', error);
      setError('加载商品详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    if (id) {
      loadProductDetail();
    }
  }, [id]);

  // 添加到购物车
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }
    
    if (product.isOwner) {
      message.warning('不能购买自己的商品');
      return;
    }

    try {
      await addToCart(product);
      message.success('已添加到购物车');
    } catch (error) {
      console.error('添加购物车失败:', error);
      message.error('添加购物车失败');
    }
  };

  // 立即购买
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }
    
    if (product.isOwner) {
      message.warning('不能购买自己的商品');
      return;
    }

    // 直接跳转到结算页面
    navigate('/checkout', {
      state: {
        products: [product],
        totalAmount: product.price
      }
    });
  };

  // 收藏/取消收藏
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }

    try {
      if (isFavorited) {
        await productService.unfavoriteProduct(product.productId);
        message.success('取消收藏成功');
      } else {
        await productService.favoriteProduct(product.productId);
        message.success('收藏成功');
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('收藏操作失败:', error);
      message.error('操作失败');
    }
  };

  // 查看卖家主页
  const handleViewSeller = () => {
    navigate(`/profile/${product.seller.userId}`);
  };

  // 分享商品
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: url
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(url);
      message.success('链接已复制到剪贴板');
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">加载商品详情中...</Text>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !product) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="加载失败"
          description={error || '商品不存在'}
          type="error"
          showIcon
          action={
            <Space>
              <Button onClick={() => navigate('/products')}>返回商品列表</Button>
              <Button type="primary" onClick={loadProductDetail}>重试</Button>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={[24, 24]}>
        {/* 商品图片 */}
        <Col xs={24} md={12}>
          <Card>
            {product.images && product.images.length > 0 ? (
              <div>
                <Image
                  width="100%"
                  height={400}
                  src={product.images[currentImageIndex]}
                  fallback="/placeholder-image.png"
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
                {product.images.length > 1 && (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {product.images.map((image, index) => (
                      <Image
                        key={index}
                        width={60}
                        height={60}
                        src={image}
                        preview={false}
                        style={{ 
                          cursor: 'pointer',
                          border: currentImageIndex === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                          borderRadius: '4px',
                          objectFit: 'cover'
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                height: '400px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <Text type="secondary">暂无图片</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* 商品信息 */}
        <Col xs={24} md={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 标题和价格 */}
              <div>
                <Title level={3}>{product.title}</Title>
                <PriceTag price={product.price} size="large" />
                <div style={{ marginTop: '8px' }}>
                  <Space>
                    <Tag color="blue">{product.categoryName}</Tag>
                    <Tag color="green">{product.condition}</Tag>
                    <Text type="secondary">
                      <EyeOutlined /> {product.viewCount} 浏览
                    </Text>
                  </Space>
                </div>
              </div>

              {/* 操作按钮 */}
              {!product.isOwner && (
                <Space style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    style={{ flex: 1 }}
                  >
                    加入购物车
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleBuyNow}
                    style={{ flex: 1 }}
                    danger
                  >
                    立即购买
                  </Button>
                  <Button 
                    size="large"
                    icon={isFavorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                    onClick={handleToggleFavorite}
                  />
                  <Button 
                    size="large"
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                  />
                </Space>
              )}

              {/* 商品详情 */}
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="商品描述">
                  <Paragraph>{product.description}</Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="成色">
                  {product.condition}
                </Descriptions.Item>
                <Descriptions.Item label="交易地点">
                  {product.location}
                </Descriptions.Item>
                <Descriptions.Item label="发布时间">
                  {new Date(product.createTime).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 卖家信息 */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="卖家信息">
            <Meta
              avatar={
                <Avatar 
                  size={64} 
                  src={product.seller?.avatar} 
                  icon={<UserOutlined />}
                />
              }
              title={
                <Space>
                  <span>{product.seller?.nickname}</span>
                  {product.seller?.isVerified && <Tag color="gold">已认证</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical">
                  <Rate disabled defaultValue={product.seller?.rating || 0} />
                  <Button type="primary" onClick={handleViewSeller}>
                    查看主页
                  </Button>
                </Space>
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProductDetailPage;
