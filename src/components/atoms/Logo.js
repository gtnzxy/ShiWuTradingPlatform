import React from 'react';
import { Typography } from 'antd';
import { ShopOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * 网站Logo组件
 * @param {Object} props - Logo属性
 * @param {string} props.size - Logo尺寸 ('small' | 'medium' | 'large')
 * @param {boolean} props.showText - 是否显示文字
 * @param {string} props.className - 自定义CSS类名
 * @param {Object} props.style - 自定义样式
 * @returns {React.ReactElement} Logo组件
 */
const Logo = ({
  size = 'medium',
  showText = true,
  className,
  style,
  ...props
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { iconSize: 24, textLevel: 5 };
      case 'large':
        return { iconSize: 48, textLevel: 2 };
      default:
        return { iconSize: 32, textLevel: 3 };
    }
  };

  const { iconSize, textLevel } = getSizeConfig();

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#1890ff',
    ...style
  };

  return (
    <div className={className} style={logoStyle} {...props}>
      <ShopOutlined style={{ fontSize: iconSize }} />
      {showText && (
        <Title 
          level={textLevel} 
          style={{ 
            margin: 0, 
            color: '#1890ff',
            fontWeight: 'bold' 
          }}
        >
          校园二手
        </Title>
      )}
    </div>
  );
};

export default Logo;
