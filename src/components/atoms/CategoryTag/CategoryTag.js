import React from 'react';
import { Tag } from 'antd';
import PropTypes from 'prop-types';
import './CategoryTag.css';

const CategoryTag = ({ 
  category, 
  color = 'blue', 
  size = 'default',
  clickable = false,
  onClick 
}) => {
  const handleClick = () => {
    if (clickable && onClick) {
      onClick(category);
    }
  };

  return (
    <Tag 
      color={color} 
      className={`category-tag category-tag--${size} ${clickable ? 'category-tag--clickable' : ''}`}
      onClick={handleClick}
    >
      {category.icon && <span className="category-tag__icon">{category.icon}</span>}
      <span className="category-tag__name">{category.name}</span>
    </Tag>
  );
};

CategoryTag.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    icon: PropTypes.string
  }).isRequired,
  color: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  clickable: PropTypes.bool,
  onClick: PropTypes.func
};

export default CategoryTag;
