import React from 'react';
import { Avatar, Typography, Tag } from 'antd';
import { UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './MessageBubble.css';

const { Text } = Typography;

const MessageBubble = ({ message, isOwn, avatar }) => {
  // 格式化时间
  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 判断消息类型
  const isImage = message.type === 'image';
  const isProduct = message.type === 'product';

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <Avatar 
          src={avatar} 
          icon={<UserOutlined />}
          size={32}
          className="message-avatar"
        />
      )}
      
      <div className="message-content-wrapper">
        <div className={`message-content ${isOwn ? 'own-content' : 'other-content'}`}>
          {isImage ? (
            <div className="message-image">
              <img src={message.content} alt="图片消息" />
            </div>
          ) : isProduct ? (
            <div className="message-product">
              <Tag color="blue">商品分享</Tag>
              <div className="product-info">
                {/* 这里可以展示商品信息 */}
                <Text>{message.content}</Text>
              </div>
            </div>
          ) : (
            <Text className="message-text">{message.content}</Text>
          )}
          
          <div className="message-meta">
            <Text type="secondary" className="message-time">
              <ClockCircleOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
              {formatTime(message.createTime)}
            </Text>
            {isOwn && (
              <Text type="secondary" className="message-status">
                {message.isRead ? '已读' : '未读'}
              </Text>
            )}
          </div>
        </div>
      </div>
      
      {isOwn && (
        <Avatar 
          src={avatar} 
          icon={<UserOutlined />}
          size={32}
          className="message-avatar"
        />
      )}
    </div>
  );
};

export default MessageBubble;
