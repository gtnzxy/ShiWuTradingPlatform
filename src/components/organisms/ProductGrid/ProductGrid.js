import React from 'react';
import { Row, Col, Empty, Spin, Pagination } from 'antd';
import ProductCard from '../../molecules/ProductCard/ProductCard';
import './ProductGrid.css';

const ProductGrid = ({
  products = [],
  loading = false,
  cardSize = 'default',
  gutter = [16, 16],
  pagination = null,
  onPageChange,
  onProductClick,
  onFavoriteClick,
  onAddToCart,
  emptyText = '暂无商品',
  showSeller = true,
  showStats = true,
  className = ''
}) => {
  // 根据屏幕尺寸动态计算列数
  const getResponsiveProps = () => {
    switch (cardSize) {
      case 'small':
        return {
          xs: 12,
          sm: 8,
          md: 6,
          lg: 4,
          xl: 4,
          xxl: 3
        };
      case 'large':
        return {
          xs: 24,
          sm: 12,
          md: 12,
          lg: 8,
          xl: 6,
          xxl: 6
        };
      default:
        return {
          xs: 12,
          sm: 12,
          md: 8,
          lg: 6,
          xl: 6,
          xxl: 4
        };
    }
  };

  const responsiveProps = getResponsiveProps();

  const handleProductClick = (product, e) => {
    // 阻止卡片内按钮的点击事件冒泡
    if (e.target.closest('.ant-btn')) {
      return;
    }
    onProductClick?.(product);
  };

  if (loading) {
    return (
      <div className={`product-grid product-grid--loading ${className}`}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={`product-grid product-grid--empty ${className}`}>
        <Empty
          description={emptyText}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className={`product-grid ${className}`}>
      <Row gutter={gutter} className="product-grid__row">
        {products.map((product, index) => (
          <Col
            key={product.id || index}
            {...responsiveProps}
            className="product-grid__col"
          >
            <div
              className="product-grid__item"
              onClick={(e) => handleProductClick(product, e)}
            >
              <ProductCard
                product={product}
                size={cardSize}
                showSeller={showSeller}
                showStats={showStats}
                onFavoriteClick={() => onFavoriteClick?.(product)}
                onAddToCart={() => onAddToCart?.(product)}
              />
            </div>
          </Col>
        ))}
      </Row>

      {pagination && (
        <div className="product-grid__pagination">
          <Pagination
            {...pagination}
            onChange={onPageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
            }
          />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
