import React from 'react';
import { Input as AntInput } from 'antd';

/**
 * 基础输入框组件 - 基于Ant Design Input
 * @param {Object} props - 输入框属性
 * @param {string} props.type - 输入框类型
 * @param {string} props.placeholder - 占位符文本
 * @param {any} props.value - 输入框值
 * @param {Function} props.onChange - 值变化事件处理函数
 * @param {string} props.size - 输入框尺寸 ('large' | 'middle' | 'small')
 * @param {boolean} props.disabled - 是否禁用
 * @param {string} props.className - 自定义CSS类名
 * @param {Object} props.style - 自定义样式
 * @returns {React.ReactElement} Input组件
 */
const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  size = 'middle',
  disabled = false,
  className,
  style,
  ...props
}) => {
  return (
    <AntInput
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      size={size}
      disabled={disabled}
      className={className}
      style={style}
      {...props}
    />
  );
};

// Password输入框
const Password = (props) => (
  <AntInput.Password {...props} />
);

// TextArea文本域
const TextArea = (props) => (
  <AntInput.TextArea {...props} />
);

// Search搜索框
const Search = (props) => (
  <AntInput.Search {...props} />
);

Input.Password = Password;
Input.TextArea = TextArea;
Input.Search = Search;

export default Input;
