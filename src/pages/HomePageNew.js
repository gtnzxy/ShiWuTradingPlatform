import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Row, Col, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import ProductCard from '../components/molecules/ProductCard/ProductCard';
import './HomePage.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

/**
 * 首页组件 - 第3周更新版本
 * @returns {React.ReactElement} HomePage组件
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // 模拟数据加载
      setTimeout(() => {
        // 模拟产品数据
        const mockProducts = [
          {
            id: 1,
            title: '九成新 MacBook Pro 13寸',
            price: 8999,
            original_price: 12999,
            images: ['/api/placeholder/300/200'],
            status: 'on_sale',
            condition: 'like_new',
            seller: { name: '张同学', avatar: '/api/placeholder/40/40' },
            views_count: 128,
            favorites_count: 15,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: '全新未开封 AirPods Pro',
            price: 1599,
            images: ['/api/placeholder/300/200'],
            status: 'on_sale',
            condition: 'new',
            seller: { name: '李同学', avatar: '/api/placeholder/40/40' },
            views_count: 89,
            favorites_count: 23,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: '图书：高等数学教材',
            price: 25,
            original_price: 59,
            images: ['/api/placeholder/300/200'],
            status: 'on_sale',
            condition: 'good',
            seller: { name: '王同学', avatar: '/api/placeholder/40/40' },
            views_count: 45,
            favorites_count: 8,
            created_at: new Date().toISOString()
          },
          {
            id: 4,
            title: '小米手环6 NFC版',
            price: 199,
            original_price: 279,
            images: ['/api/placeholder/300/200'],
            status: 'on_sale',
            condition: 'like_new',
            seller: { name: '赵同学', avatar: '/api/placeholder/40/40' },
            views_count: 67,
            favorites_count: 12,
            created_at: new Date().toISOString()
          }
        ];

        const mockCategories = [
          { id: 1, name: '数码电子', icon: '📱', product_count: 256 },
          { id: 2, name: '图书教材', icon: '📚', product_count: 189 },
          { id: 3, name: '生活用品', icon: '🏠', product_count: 134 },
          { id: 4, name: '运动健身', icon: '⚽', product_count: 78 },
          { id: 5, name: '美妆护肤', icon: '💄', product_count: 92 },
          { id: 6, name: '服装配饰', icon: '👔', product_count: 167 }
        ];

        setFeaturedProducts(mockProducts);
        setPopularProducts(mockProducts.slice().reverse());
        setCategories(mockCategories);
      }, 1000);
    } catch (error) {
      console.error('加载首页数据失败:', error);
      message.error('加载数据失败，请刷新重试');
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category_id=${category.id}`);
  };

  const handleSearch = () => {
    navigate('/products');
  };

  const handlePublish = () => {
    navigate('/products/publish');
  };

  return (
    <Layout className="home-page">
      <Content>
        {/* 横幅区域 */}
        <div className="home-page__banner">
          <div className="home-page__banner-content">
            <Title level={1} className="home-page__title">
              拾物
            </Title>
            <Paragraph className="home-page__subtitle">
              发现身边好物，让闲置物品重新焕发价值
            </Paragraph>
            <div className="home-page__actions">
              <Button 
                type="primary" 
                size="large" 
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                开始淘宝
              </Button>
              <Button 
                size="large" 
                icon={<PlusOutlined />}
                onClick={handlePublish}
              >
                发布商品
              </Button>
            </div>
          </div>
        </div>

        <div className="home-page__content">
          {/* 热门分类 */}
          <section className="home-page__section">
            <Title level={2} className="home-page__section-title">
              <FireOutlined /> 热门分类
            </Title>
            <Row gutter={[16, 16]}>
              {categories.map((category) => (
                <Col key={category.id} xs={12} sm={8} md={6} lg={4}>
                  <Card 
                    hoverable
                    className="home-page__category-card"
                    onClick={() => handleCategoryClick(category)}
                    cover={
                      <div className="home-page__category-icon">
                        {category.icon}
                      </div>
                    }
                  >
                    <Card.Meta 
                      title={category.name}
                      description={`${category.product_count} 件商品`}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </section>

          {/* 最新商品 */}
          <section className="home-page__section">
            <div className="home-page__section-header">
              <Title level={2} className="home-page__section-title">
                🆕 最新发布
              </Title>
              <Button type="link" onClick={() => navigate('/products?sort_by=created_at&sort_order=desc')}>
                查看更多 →
              </Button>
            </div>
            <Row gutter={[16, 16]}>
              {featuredProducts.map((product) => (
                <Col key={product.id} xs={12} sm={6} md={6} lg={6}>
                  <ProductCard
                    product={product}
                    size="default"
                    onClick={() => handleProductClick(product)}
                  />
                </Col>
              ))}
            </Row>
          </section>

          {/* 热门商品 */}
          <section className="home-page__section">
            <div className="home-page__section-header">
              <Title level={2} className="home-page__section-title">
                <StarOutlined /> 热门商品
              </Title>
              <Button type="link" onClick={() => navigate('/products?sort_by=views&sort_order=desc')}>
                查看更多 →
              </Button>
            </div>
            <Row gutter={[16, 16]}>
              {popularProducts.map((product) => (
                <Col key={product.id} xs={12} sm={6} md={6} lg={6}>
                  <ProductCard
                    product={product}
                    size="default"
                    onClick={() => handleProductClick(product)}
                  />
                </Col>
              ))}
            </Row>
          </section>
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;
