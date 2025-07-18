import React from 'react';
import { Badge as AntBadge, Tag } from 'antd';

/**
 * 徽章组件 - 基于Ant Design Badge
 * @param {Object} props - 徽章属性
 * @param {number|string} props.count - 展示的数字
 * @param {boolean} props.showZero - 当数值为 0 时，是否展示 Badge
 * @param {number} props.overflowCount - 展示封顶的数字值
 * @param {boolean} props.dot - 不展示数字，只有一个小红点
 * @param {React.ReactNode} props.children - 被包裹的元素
 * @param {string} props.status - 设置 Badge 为状态点
 * @param {string} props.color - 自定义小圆点的颜色
 * @param {string} props.text - 在设置了 status 的前提下有效，设置状态点的文本
 * @returns {React.ReactElement} Badge组件
 */
const Badge = ({
  count,
  showZero = false,
  overflowCount = 99,
  dot = false,
  children,
  status,
  color,
  text,
  ...props
}) => {
  return (
    <AntBadge
      count={count}
      showZero={showZero}
      overflowCount={overflowCount}
      dot={dot}
      status={status}
      color={color}
      text={text}
      {...props}
    >
      {children}
    </AntBadge>
  );
};

/**
 * 状态标签组件 - 基于Ant Design Tag
 * @param {Object} props - 标签属性
 * @param {string} props.color - 标签颜色
 * @param {React.ReactNode} props.children - 标签内容
 * @param {boolean} props.closable - 标签是否可以关闭
 * @param {Function} props.onClose - 关闭时的回调
 * @returns {React.ReactElement} StatusTag组件
 */
const StatusTag = ({
  color,
  children,
  closable = false,
  onClose,
  ...props
}) => {
  return (
    <Tag
      color={color}
      closable={closable}
      onClose={onClose}
      {...props}
    >
      {children}
    </Tag>
  );
};

Badge.StatusTag = StatusTag;

export default Badge;
