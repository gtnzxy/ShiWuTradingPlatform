import React from 'react';
import { Spin } from 'antd';

/**
 * 加载指示器组件 - 基于Ant Design Spin
 * @param {Object} props - 加载组件属性
 * @param {boolean} props.spinning - 是否显示加载状态
 * @param {string} props.size - 加载指示器尺寸 ('small' | 'default' | 'large')
 * @param {string} props.tip - 加载提示文本
 * @param {React.ReactNode} props.children - 被包裹的内容
 * @param {number} props.delay - 延迟显示加载状态的时间(ms)
 * @returns {React.ReactElement} Loading组件
 */
const Loading = ({
  spinning = true,
  size = 'default',
  tip,
  children,
  delay = 0,
  ...props
}) => {
  return (
    <Spin
      spinning={spinning}
      size={size}
      tip={tip}
      delay={delay}
      {...props}
    >
      {children}
    </Spin>
  );
};

export default Loading;
