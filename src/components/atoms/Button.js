import React from 'react';
import { Button as AntButton } from 'antd';

/**
 * 基础按钮组件 - 基于Ant Design Button
 * @param {Object} props - 按钮属性
 * @param {React.ReactNode} props.children - 按钮内容
 * @param {string} props.type - 按钮类型 ('primary' | 'default' | 'dashed' | 'text' | 'link')
 * @param {string} props.size - 按钮尺寸 ('large' | 'middle' | 'small')
 * @param {boolean} props.loading - 是否加载中
 * @param {boolean} props.disabled - 是否禁用
 * @param {Function} props.onClick - 点击事件处理函数
 * @param {string} props.className - 自定义CSS类名
 * @param {Object} props.style - 自定义样式
 * @returns {React.ReactElement} Button组件
 */
const Button = ({
  children,
  type = 'default',
  size = 'middle',
  loading = false,
  disabled = false,
  onClick,
  className,
  style,
  ...props
}) => {
  return (
    <AntButton
      type={type}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;
