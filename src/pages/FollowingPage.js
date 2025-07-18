import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Button, 
  Typography, 
  Space, 
  Empty, 
  Spin, 
  message,
  Row,
  Col,
  Statistic,
  Divider,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  HeartFilled, 
  EyeOutlined,
  MessageOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import followService from '../services/followService';
import messageService from '../services/messageService';
import './FollowingPage.css';

const { Title, Text } = Typography;

/**
 * 我的关注页面组件
 * 显示用户关注的其他用户列表
 */
const FollowingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [total, setTotal] = useState(0);

  // 加载关注列表
  const loadFollowingList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await followService.getFollowingList();
      
      if (response.success) {
        setFollowingList(response.data.users || []);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.userTip || '加载关注列表失败');
      }
    } catch (error) {
      console.error('加载关注列表失败:', error);
      message.error('加载关注列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowingList();
  }, [loadFollowingList]);

  // 取消关注
  const handleUnfollow = useCallback(async (userId) => {
    try {
      const response = await followService.unfollowUser(userId);
      
      if (response.success) {
        message.success('已取消关注');
        loadFollowingList();
      } else {
        message.error(response.userTip || '取消关注失败');
      }
    } catch (error) {
      console.error('取消关注失败:', error);
      message.error('取消关注失败，请稍后重试');
    }
  }, [loadFollowingList]);

  // 发送消息
  const handleSendMessage = useCallback(async (user) => {
    try {
      // 创建会话
      const response = await messageService.createConversation({
        participantId: user.userId,
        type: 'user'
      });
      
      if (response.success) {
        navigate(`/messages?conversationId=${response.data.conversationId}`);
      } else {
        message.error(response.userTip || '发送消息失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败，请稍后重试');
    }
  }, [navigate]);

  // 查看用户主页
  const handleViewProfile = useCallback((userId) => {
    navigate(`/user/${userId}`);
  }, [navigate]);

  // 查看用户商品
  const handleViewProducts = useCallback((userId) => {
    navigate(`/products?sellerId=${userId}`);
  }, [navigate]);

  // 渲染关注用户项
  const renderFollowingItem = (user) => (
    <List.Item key={user.userId}>
      <Card 
        className="following-user-card"
        hoverable
      >
        <Row gutter={[16, 16]} align="middle">
          {/* 用户信息 */}
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Avatar 
                size={64}
                src={user.avatarUrl}
                icon={<UserOutlined />}
              />
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  {user.nickname || user.username}
                </Title>
                <Text type="secondary">
                  关注时间: {user.followTime}
                </Text>
                {user.isOnline && (
                  <Tag color="green" size="small" style={{ marginTop: 4 }}>
                    在线
                  </Tag>
                )}
              </div>
            </Space>
          </Col>

          {/* 用户统计 */}
          <Col xs={24} sm={12} md={8}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="商品"
                  value={user.productCount || 0}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="粉丝"
                  value={user.followerCount || 0}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="评分"
                  value={user.averageRating || 0}
                  precision={1}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>
          </Col>

          {/* 操作按钮 */}
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space wrap>
                <Button 
                  icon={<EyeOutlined />}
                  onClick={() => handleViewProfile(user.userId)}
                >
                  查看主页
                </Button>
                <Button 
                  icon={<ShopOutlined />}
                  onClick={() => handleViewProducts(user.userId)}
                >
                  查看商品
                </Button>
              </Space>
              
              <Space wrap>
                <Button 
                  type="primary"
                  icon={<MessageOutlined />}
                  onClick={() => handleSendMessage(user)}
                >
                  发消息
                </Button>
                <Button 
                  danger
                  icon={<HeartFilled />}
                  onClick={() => handleUnfollow(user.userId)}
                >
                  取消关注
                </Button>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>
    </List.Item>
  );

  return (
    <div className="following-page">
      <Card>
        <div className="page-header">
          <Title level={3}>我的关注</Title>
          <Text type="secondary">
            共关注了 {total} 个用户
          </Text>
        </div>

        <Divider />

        <Spin spinning={loading}>
          {followingList.length > 0 ? (
            <List
              dataSource={followingList}
              renderItem={renderFollowingItem}
              pagination={followingList.length > 10 ? {
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              } : false}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="还没有关注任何用户"
              style={{ margin: '64px 0' }}
            >
              <Button 
                type="primary" 
                onClick={() => navigate('/users')}
              >
                发现用户
              </Button>
            </Empty>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default FollowingPage;
