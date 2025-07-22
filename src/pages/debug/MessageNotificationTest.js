import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Divider, message, Badge, List, Avatar } from 'antd';
import { MessageOutlined, BellOutlined, UserOutlined } from '@ant-design/icons';
import { useMessage } from '../../context/MessageContext';
import { useNotification } from '../../context/NotificationContext';
import messageService from '../../services/messageService';
import notificationService from '../../services/notificationService';

const { Title, Text, Paragraph } = Typography;

const MessageNotificationTest = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});

  // 使用Context
  const {
    conversations,
    unreadCount: messageUnreadCount,
    fetchConversations,
    fetchUnreadCount: fetchMessageUnreadCount
  } = useMessage();

  const {
    notifications,
    unreadCount: notificationUnreadCount,
    fetchNotifications,
    fetchUnreadCount: fetchNotificationUnreadCount,
    markAsRead,
    markAllAsRead
  } = useNotification();

  // 测试消息API
  const testMessageAPI = async () => {
    try {
      setLoading(true);
      message.info('开始测试消息API...');
      
      const results = {};

      // 1. 测试获取会话列表
      try {
        const conversationsResult = await messageService.getConversations();
        results.conversations = {
          success: true,
          data: conversationsResult,
          count: conversationsResult.data?.length || 0
        };
        message.success('✅ 获取会话列表成功');
      } catch (error) {
        results.conversations = {
          success: false,
          error: error.message
        };
        message.error('❌ 获取会话列表失败: ' + error.message);
      }

      // 2. 测试获取未读数量
      try {
        const unreadResult = await messageService.getUnreadCount();
        results.unreadCount = {
          success: true,
          data: unreadResult
        };
        message.success('✅ 获取未读数量成功');
      } catch (error) {
        results.unreadCount = {
          success: false,
          error: error.message
        };
        message.error('❌ 获取未读数量失败: ' + error.message);
      }

      // 3. 测试发送消息
      try {
        const sendResult = await messageService.sendMessage({
          receiverId: 2,
          content: '测试消息 - ' + new Date().toLocaleTimeString(),
          type: 'text'
        });
        results.sendMessage = {
          success: true,
          data: sendResult
        };
        message.success('✅ 发送消息成功');
      } catch (error) {
        results.sendMessage = {
          success: false,
          error: error.message
        };
        message.error('❌ 发送消息失败: ' + error.message);
      }

      setTestResults(prev => ({ ...prev, message: results }));
    } catch (error) {
      message.error('消息API测试失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 测试通知API
  const testNotificationAPI = async () => {
    try {
      setLoading(true);
      message.info('开始测试通知API...');
      
      const results = {};

      // 1. 测试获取通知列表
      try {
        const notificationsResult = await notificationService.getNotifications();
        results.notifications = {
          success: true,
          data: notificationsResult,
          count: notificationsResult.data?.length || 0
        };
        message.success('✅ 获取通知列表成功');
      } catch (error) {
        results.notifications = {
          success: false,
          error: error.message
        };
        message.error('❌ 获取通知列表失败: ' + error.message);
      }

      // 2. 测试获取未读数量
      try {
        const unreadResult = await notificationService.getUnreadCount();
        results.unreadCount = {
          success: true,
          data: unreadResult
        };
        message.success('✅ 获取通知未读数量成功');
      } catch (error) {
        results.unreadCount = {
          success: false,
          error: error.message
        };
        message.error('❌ 获取通知未读数量失败: ' + error.message);
      }

      setTestResults(prev => ({ ...prev, notification: results }));
    } catch (error) {
      message.error('通知API测试失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 测试Context功能
  const testContexts = async () => {
    try {
      setLoading(true);
      message.info('开始测试Context功能...');

      // 测试消息Context
      await fetchConversations();
      await fetchMessageUnreadCount();
      
      // 测试通知Context
      await fetchNotifications();
      await fetchNotificationUnreadCount();

      message.success('✅ Context功能测试完成');
    } catch (error) {
      message.error('Context功能测试失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 测试标记已读功能
  const testMarkAsRead = async () => {
    try {
      setLoading(true);
      message.info('测试标记已读功能...');

      if (notifications.length > 0) {
        const firstNotification = notifications[0];
        if (!firstNotification.isRead) {
          await markAsRead(firstNotification.id);
          message.success('✅ 标记单个通知已读成功');
        } else {
          message.info('第一个通知已经是已读状态');
        }
      } else {
        message.warning('没有通知可以标记');
      }
    } catch (error) {
      message.error('标记已读失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>消息和通知功能测试</Title>
      
      {/* 状态概览 */}
      <Card title="当前状态" style={{ marginBottom: '20px' }}>
        <Space size="large">
          <div>
            <Badge count={messageUnreadCount} showZero>
              <MessageOutlined style={{ fontSize: '24px' }} />
            </Badge>
            <div>消息未读: {messageUnreadCount}</div>
            <div>会话数量: {conversations.length}</div>
          </div>
          <div>
            <Badge count={notificationUnreadCount} showZero>
              <BellOutlined style={{ fontSize: '24px' }} />
            </Badge>
            <div>通知未读: {notificationUnreadCount}</div>
            <div>通知数量: {notifications.length}</div>
          </div>
        </Space>
      </Card>

      {/* 测试按钮 */}
      <Card title="API测试" style={{ marginBottom: '20px' }}>
        <Space wrap>
          <Button type="primary" onClick={testMessageAPI} loading={loading}>
            测试消息API
          </Button>
          <Button type="primary" onClick={testNotificationAPI} loading={loading}>
            测试通知API
          </Button>
          <Button onClick={testContexts} loading={loading}>
            测试Context功能
          </Button>
          <Button onClick={testMarkAsRead} loading={loading}>
            测试标记已读
          </Button>
          <Button onClick={() => markAllAsRead()} loading={loading}>
            标记所有通知已读
          </Button>
        </Space>
      </Card>

      {/* 会话列表预览 */}
      {conversations.length > 0 && (
        <Card title="会话列表预览" style={{ marginBottom: '20px' }}>
          <List
            dataSource={conversations.slice(0, 3)}
            renderItem={conversation => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={conversation.userName || `用户${conversation.userId}`}
                  description={conversation.lastMessage?.content || '暂无消息'}
                />
                <Badge count={conversation.unreadCount} />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 通知列表预览 */}
      {notifications.length > 0 && (
        <Card title="通知列表预览" style={{ marginBottom: '20px' }}>
          <List
            dataSource={notifications.slice(0, 3)}
            renderItem={notification => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<BellOutlined />} />}
                  title={notification.title}
                  description={notification.content}
                />
                <Space>
                  {!notification.isRead && <Badge status="processing" text="未读" />}
                  <Text type="secondary">
                    {new Date(notification.createdAt).toLocaleString()}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 测试结果 */}
      {Object.keys(testResults).length > 0 && (
        <Card title="测试结果">
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};

export default MessageNotificationTest;
