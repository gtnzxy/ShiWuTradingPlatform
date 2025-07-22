import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Avatar,
  Button,
  message,
  Spin,
  Divider,
  Row,
  Col,
  Tag
} from 'antd';
import { 
  UserOutlined,
  ArrowLeftOutlined,
  HeartOutlined,
  HeartFilled,
  UserAddOutlined,
  UserDeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { userService } from '../services/userService';
import './UserProfilePage.css';

const { Title, Text, Paragraph } = Typography;

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 是否是当前用户的个人主页
  const isOwnProfile = !userId || (currentUser && currentUser.id === parseInt(userId));

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      let profileData;
      
      if (isOwnProfile) {
        // 获取当前用户信息
        profileData = await userService.getCurrentUserProfile();
      } else {
        // 获取其他用户信息
        profileData = await userService.getProfile(userId);
      }
      
      setUserProfile(profileData.data);
      
      // 如果不是自己的主页，获取关注状态
      if (!isOwnProfile && currentUser) {
        try {
          const followStatus = await userService.getFollowStatus(userId);
          setIsFollowing(followStatus.data?.isFollowing || false);
        } catch (error) {
          console.warn('获取关注状态失败:', error.message);
        }
      }
    } catch (error) {
      message.error('获取用户信息失败');
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 关注/取消关注
  const handleFollow = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      navigate('/auth/login');
      return;
    }

    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
        message.success('取消关注成功');
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
        message.success('关注成功');
      }
    } catch (error) {
      message.error(isFollowing ? '取消关注失败' : '关注失败');
      console.error('关注操作失败:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId, currentUser]);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Text>用户不存在</Text>
      </div>
    );
  }

  return (
    <div className="user-profile-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: '16px' }}
        >
          返回
        </Button>
      </div>

      {/* 用户基本信息 */}
      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
            <Avatar 
              size={120} 
              src={userProfile.avatar} 
              icon={<UserOutlined />}
              style={{ marginBottom: '16px' }}
            />
            
            {!isOwnProfile && currentUser && (
              <div>
                <Button
                  type={isFollowing ? "default" : "primary"}
                  icon={isFollowing ? <UserDeleteOutlined /> : <UserAddOutlined />}
                  loading={followLoading}
                  onClick={handleFollow}
                  block
                >
                  {isFollowing ? '取消关注' : '关注'}
                </Button>
              </div>
            )}
            
            {isOwnProfile && (
              <div>
                <Button type="primary" onClick={() => navigate('/settings')} block>
                  编辑资料
                </Button>
              </div>
            )}
          </Col>
          
          <Col xs={24} sm={16}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {userProfile.nickname || userProfile.username}
                </Title>
                <Text type="secondary">@{userProfile.username}</Text>
              </div>
              
              <div>
                <Space wrap>
                  <Tag color="blue">ID: {userProfile.id}</Tag>
                  {userProfile.email && <Tag color="green">邮箱已验证</Tag>}
                  {userProfile.phone && <Tag color="orange">手机已验证</Tag>}
                </Space>
              </div>
              
              {userProfile.bio && (
                <div>
                  <Text strong>个人简介</Text>
                  <Paragraph style={{ marginTop: '8px' }}>
                    {userProfile.bio}
                  </Paragraph>
                </div>
              )}
              
              <div>
                <Space size="large">
                  <div>
                    <Text strong>关注</Text>
                    <br />
                    <Text type="secondary">{userProfile.followingCount || 0}</Text>
                  </div>
                  <div>
                    <Text strong>粉丝</Text>
                    <br />
                    <Text type="secondary">{userProfile.followersCount || 0}</Text>
                  </div>
                  <div>
                    <Text strong>商品</Text>
                    <br />
                    <Text type="secondary">{userProfile.productCount || 0}</Text>
                  </div>
                </Space>
              </div>
              
              {userProfile.joinDate && (
                <div>
                  <Text type="secondary">
                    加入时间：{new Date(userProfile.joinDate).toLocaleDateString()}
                  </Text>
                </div>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 用户动态/商品等内容区域 */}
      <Card title="用户动态" style={{ marginTop: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text type="secondary">暂无动态内容</Text>
        </div>
      </Card>
    </div>
  );
};

export default UserProfilePage;
