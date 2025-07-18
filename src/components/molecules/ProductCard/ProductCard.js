import React, { useState } from 'react';
import { Card, Button, Image, Space, Avatar, Typography, message } from 'antd';
import { HeartOutlined, HeartFilled, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import PriceTag from '../../atoms/PriceTag/PriceTag';
import StatusBadge from '../../atoms/StatusBadge/StatusBadge';
import CategoryTag from '../../atoms/CategoryTag/CategoryTag';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContextNew';
import { PRODUCT_STATUS } from '../../../utils/constants';
import './ProductCard.css';

const { Meta } = Card;
const { Text } = Typography;

const ProductCard = ({ 
  product, 
  onFavorite, 
  onClick,
  showSeller = true,
  showCategory = true,
  size = 'default'
}) => {
  const [isFavorited, setIsFavorited] = useState(product.isFavorited || false);
  const [loading, setLoading] = useState(false);
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();

  // 处理收藏
  const handleFavorite = async (e) => {
    e.stopPropagation();
    setLoading(true);
    
    try {
      if (onFavorite) {
        await onFavorite(product.productId, !isFavorited);
        setIsFavorited(!isFavorited);
        message.success(isFavorited ? '已取消收藏' : '已收藏');
      }
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理加入购物车
  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      message.warning('请先登录再添加商品到购物车');
      return;
    }
    
    if (product.status !== PRODUCT_STATUS.ON_SALE) {
      message.warning('该商品暂不可购买');
      return;
    }
    
    // 检查是否已在购物车中
    if (isInCart(product.productId)) {
      message.info('商品已在购物车中');
      return;
    }
    
    try {
      await addToCart(product.productId);
    } catch (error) {
      // 错误处理已在addToCart中完成
    }
  };

  // 处理卡片点击
  const handleCardClick = () => {
    if (onClick) {
      onClick(product);
    }
  };

  // 获取主图
  const mainImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : '/placeholder-image.png';

  const isAvailable = product.status === PRODUCT_STATUS.ON_SALE;

  return (
    <Card
      className={`product-card product-card--${size} ${!isAvailable ? 'product-card--unavailable' : ''}`}
      cover={
        <div className="product-card__image-container">
          <Image
            src={mainImage}
            alt={product.title}
            preview={false}
            className="product-card__image"
            fallback="/placeholder-image.png"
          />
          <div className="product-card__overlay">
            <Space>
              <Button
                icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
                shape="circle"
                size="small"
                className={`product-card__favorite ${isFavorited ? 'product-card__favorite--active' : ''}`}
                loading={loading}
                onClick={handleFavorite}
              />
              {isAvailable && (
                <Button
                  icon={<ShoppingCartOutlined />}
                  shape="circle"
                  size="small"
                  className="product-card__cart"
                  onClick={handleAddToCart}
                />
              )}
            </Space>
          </div>
          <div className="product-card__status">
            <StatusBadge status={product.status} showIcon={false} />
          </div>
        </div>
      }
      onClick={handleCardClick}
      hoverable
    >
      <Meta
        title={
          <div className="product-card__title">
            <Text ellipsis={{ tooltip: product.title }} strong>
              {product.title}
            </Text>
          </div>
        }
        description={
          <div className="product-card__content">
            {/* 价格 */}
            <div className="product-card__price">
              <PriceTag 
                price={product.price} 
                originalPrice={product.originalPrice}
                size="medium"
                showDiscount={true}
              />
            </div>

            {/* 描述 */}
            <div className="product-card__description">
              <Text type="secondary" ellipsis={{ rows: 2, tooltip: product.description }}>
                {product.description}
              </Text>
            </div>

            {/* 分类和统计 */}
            <div className="product-card__meta">
              {showCategory && product.category && (
                <CategoryTag 
                  category={product.category} 
                  size="small"
                  color="processing"
                />
              )}
              
              <div className="product-card__stats">
                <Space size="small">
                  <span className="product-card__stat">
                    <EyeOutlined /> {product.viewCount || 0}
                  </span>
                  <span className="product-card__stat">
                    <HeartOutlined /> {product.favoriteCount || 0}
                  </span>
                </Space>
              </div>
            </div>

            {/* 卖家信息 */}
            {showSeller && product.seller && (
              <div className="product-card__seller">
                <Space size="small">
                  <Avatar 
                    src={product.seller.avatarUrl} 
                    size="small"
                    alt={product.seller.nickname}
                  >
                    {product.seller.nickname?.charAt(0)}
                  </Avatar>
                  <Text type="secondary" className="product-card__seller-name">
                    {product.seller.nickname}
                  </Text>
                </Space>
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    status: PropTypes.string.isRequired,
    imageUrls: PropTypes.arrayOf(PropTypes.string),
    category: PropTypes.object,
    seller: PropTypes.object,
    viewCount: PropTypes.number,
    favoriteCount: PropTypes.number,
    isFavorited: PropTypes.bool
  }).isRequired,
  onFavorite: PropTypes.func,
  onClick: PropTypes.func,
  showSeller: PropTypes.bool,
  showCategory: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large'])
};

export default ProductCard;
