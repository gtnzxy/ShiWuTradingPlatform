import React from 'react';
import PropTypes from 'prop-types';
import './PriceTag.css';

const PriceTag = ({ 
  price, 
  originalPrice, 
  size = 'medium',
  showDiscount = false,
  currency = '¥' 
}) => {
  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;

  return (
    <div className={`price-tag price-tag--${size}`}>
      <span className="price-tag__current">
        {currency}{price.toFixed(2)}
      </span>
      
      {hasDiscount && (
        <>
          <span className="price-tag__original">
            {currency}{originalPrice.toFixed(2)}
          </span>
          {showDiscount && (
            <span className="price-tag__discount">
              -{discountPercent}%
            </span>
          )}
        </>
      )}
    </div>
  );
};

PriceTag.propTypes = {
  price: PropTypes.number.isRequired,
  originalPrice: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  showDiscount: PropTypes.bool,
  currency: PropTypes.string
};

export default PriceTag;
