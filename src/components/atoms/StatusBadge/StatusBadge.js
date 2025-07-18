import React from 'react';
import { Tag } from 'antd';
import PropTypes from 'prop-types';
import { PRODUCT_STATUS, PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS } from '../../../utils/constants';

const StatusBadge = ({ status, showIcon = true }) => {
  const label = PRODUCT_STATUS_LABELS[status] || status;
  const color = PRODUCT_STATUS_COLORS[status] || 'default';

  // 根据状态显示不同图标
  const getStatusIcon = (status) => {
    switch (status) {
      case PRODUCT_STATUS.ON_SALE:
        return '🔥';
      case PRODUCT_STATUS.SOLD:
        return '✅';
      case PRODUCT_STATUS.DRAFT:
        return '📝';
      case PRODUCT_STATUS.PENDING_REVIEW:
        return '⏳';
      case PRODUCT_STATUS.LOCKED:
        return '🔒';
      case PRODUCT_STATUS.DELISTED:
        return '📤';
      default:
        return '';
    }
  };

  return (
    <Tag color={color} className="status-badge">
      {showIcon && getStatusIcon(status)} {label}
    </Tag>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(Object.values(PRODUCT_STATUS)).isRequired,
  showIcon: PropTypes.bool
};

export default StatusBadge;
