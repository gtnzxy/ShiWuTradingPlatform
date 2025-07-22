import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Row, Col, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, FireOutlined, StarOutlined } from '@ant-design/icons';
import ProductCard from '../components/molecules/ProductCard/ProductCard';
import { productService } from '../services/productService';
import { PRODUCT_STATUS } from '../utils/constants';
import './HomePage.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

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
      console.log('🏠 开始加载首页数据...');

      // 加载分类数据
      const categoriesData = await productService.getCategories();
      console.log('📋 分类数据:', categoriesData);

      // 转换分类数据格式，添加商品数量（暂时使用随机数）
      const formattedCategories = categoriesData.map(category => ({
        ...category,
        product_count: Math.floor(Math.random() * 200) + 50 // 随机生成50-250的商品数量
      }));
      setCategories(formattedCategories);

      // 加载最新商品（按创建时间排序）
      const featuredResponse = await productService.getProducts({
        page: 1,
        pageSize: 8,
        sortBy: 'CREATE_TIME_DESC' // 使用后端支持的排序参数
      });
      console.log('🆕 最新商品数据:', featuredResponse);

      const featuredProducts = featuredResponse.data || featuredResponse.products || featuredResponse.list || [];
      // 转换数据格式以匹配ProductCard期望的格式
      const formattedFeaturedProducts = featuredProducts.map(product => {
        console.log('🔄 转换商品数据:', product);
        return {
          ...product,
          productId: product.id, // ProductCard期望productId字段
          imageUrls: product.imageUrls || [product.mainImageUrl || '/placeholder-image.svg'],
          status: product.status === 1 ? PRODUCT_STATUS.ON_SALE : (product.status === 'AVAILABLE' ? PRODUCT_STATUS.ON_SALE : PRODUCT_STATUS.DELISTED), // 转换状态格式
          viewCount: product.views || product.viewCount || 0, // 统一字段名
          favoriteCount: product.likes || product.favoriteCount || 0, // 统一字段名
          category: product.categoryName ? { name: product.categoryName } : null, // CategoryTag期望的格式
          seller: product.seller || {
            nickname: `用户${product.sellerId}`,
            avatarUrl: '/placeholder-avatar.svg' // 使用本地占位头像
          }
        };
      });
      console.log('✅ 转换后的最新商品:', formattedFeaturedProducts);
      setFeaturedProducts(formattedFeaturedProducts.slice(0, 4)); // 只显示前4个

      // 加载热门商品（暂时使用相同数据，但顺序不同）
      const popularResponse = await productService.getProducts({
        page: 1,
        pageSize: 8,
        sortBy: 'CREATE_TIME_DESC'
      });
      console.log('🔥 热门商品数据:', popularResponse);

      const popularProducts = popularResponse.data || popularResponse.products || popularResponse.list || [];
      // 转换数据格式并将数组反转作为热门商品
      const formattedPopularProducts = popularProducts.map(product => {
        console.log('🔄 转换热门商品数据:', product);
        return {
          ...product,
          productId: product.id, // ProductCard期望productId字段
          imageUrls: product.imageUrls || [product.mainImageUrl || '/placeholder-image.svg'],
          status: product.status === 1 ? PRODUCT_STATUS.ON_SALE : (product.status === 'AVAILABLE' ? PRODUCT_STATUS.ON_SALE : PRODUCT_STATUS.DELISTED), // 转换状态格式
          viewCount: product.views || product.viewCount || 0, // 统一字段名
          favoriteCount: product.likes || product.favoriteCount || 0, // 统一字段名
          category: product.categoryName ? { name: product.categoryName } : null, // CategoryTag期望的格式
          seller: product.seller || {
            nickname: `用户${product.sellerId}`,
            avatarUrl: '/placeholder-avatar.svg' // 使用本地占位头像
          }
        };
      });
      console.log('✅ 转换后的热门商品:', formattedPopularProducts);
      setPopularProducts(formattedPopularProducts.slice().reverse().slice(0, 4));

      console.log('✅ 首页数据加载完成');
    } catch (error) {
      console.error('❌ 加载首页数据失败:', error);
      message.error('加载数据失败，请刷新重试');

      // 设置空数据避免页面崩溃
      setFeaturedProducts([]);
      setPopularProducts([]);
      setCategories([]);
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?categoryId=${category.id}`);
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
                      description={`${category.product_count || 0} 件商品`}
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
              <Button type="link" onClick={() => navigate('/products?sortBy=CREATE_TIME_DESC')}>
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
              <Button type="link" onClick={() => navigate('/products')}>
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
