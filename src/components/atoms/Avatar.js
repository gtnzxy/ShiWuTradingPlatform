import React from 'react';
import { Avatar as AntAvatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

/**
 * 头像组件 - 基于Ant Design Avatar
 * @param {Object} props - 头像属性
 * @param {string} props.src - 头像图片地址
 * @param {string} props.alt - 图片alt属性
 * @param {string|number} props.size - 头像尺寸 ('large' | 'small' | 'default' | number)
 * @param {string} props.shape - 头像形状 ('circle' | 'square')
 * @param {React.ReactNode} props.icon - 自定义图标
 * @param {React.ReactNode} props.children - 头像内容（通常是文字）
 * @param {string} props.className - 自定义CSS类名
 * @param {Object} props.style - 自定义样式
 * @returns {React.ReactElement} Avatar组件
 */
const Avatar = ({
  src,
  alt,
  size = 'default',
  shape = 'circle',
  icon = <UserOutlined />,
  children,
  className,
  style,
  ...props
}) => {
  return (
    <AntAvatar
      src={src}
      alt={alt}
      size={size}
      shape={shape}
      icon={!src && !children ? icon : undefined}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </AntAvatar>
  );
};

export default Avatar;
