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
  HeartOutlined,
  EyeOutlined,
  MessageOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { followService } from '../services/followService';
import { messageService } from '../services/messageService';
import './FollowersPage.css';

const { Title, Text } = Typography;

/**
 * 我的粉丝页面组件
 * 显示关注当前用户的其他用户列表
 */
const FollowersPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [total, setTotal] = useState(0);

  // 加载粉丝列表
  const loadFollowersList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await followService.getFollowersList();
      
      if (response.success) {
        setFollowersList(response.data.users || []);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.userTip || '加载粉丝列表失败');
      }
    } catch (error) {
      console.error('加载粉丝列表失败:', error);
      message.error('加载粉丝列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowersList();
  }, [loadFollowersList]);

  // 关注用户
  const handleFollowUser = useCallback(async (userId) => {
    try {
      const response = await followService.followUser(userId);
      
      if (response.success) {
        message.success('关注成功');
        loadFollowersList();
      } else {
        message.error(response.userTip || '关注失败');
      }
    } catch (error) {
      console.error('关注失败:', error);
      message.error('关注失败，请稍后重试');
    }
  }, [loadFollowersList]);

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

  // 渲染粉丝用户项
  const renderFollowerItem = (user) => (
    <List.Item key={user.userId}>
      <Card 
        className="follower-user-card"
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
                {user.isFollowing && (
                  <Tag color="blue" size="small" style={{ marginTop: 4 }}>
                    互相关注
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
                {!user.isFollowing && (
                  <Button 
                    type="primary"
                    ghost
                    icon={<HeartOutlined />}
                    onClick={() => handleFollowUser(user.userId)}
                  >
                    回关
                  </Button>
                )}
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>
    </List.Item>
  );

  return (
    <div className="followers-page">
      <Card>
        <div className="page-header">
          <Title level={3}>我的粉丝</Title>
          <Text type="secondary">
            共有 {total} 个粉丝
          </Text>
        </div>

        <Divider />

        <Spin spinning={loading}>
          {followersList.length > 0 ? (
            <List
              dataSource={followersList}
              renderItem={renderFollowerItem}
              pagination={followersList.length > 10 ? {
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
              description="还没有粉丝"
              style={{ margin: '64px 0' }}
            >
              <Button 
                type="primary" 
                onClick={() => navigate('/products/publish')}
              >
                发布商品吸引粉丝
              </Button>
            </Empty>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default FollowersPage;
