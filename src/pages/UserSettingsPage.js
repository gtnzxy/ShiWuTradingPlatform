import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Avatar,
  Button,
  message,
  Empty,
  Spin
} from 'antd';
import { 
  UserOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { userService } from '../services/userService';
import './UserSettingsPage.css';

const { Title, Text } = Typography;

const UserSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getCurrentUserProfile();
      setUserProfile(profileData.data);
    } catch (error) {
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="user-settings-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          style={{ marginBottom: '16px' }}
        >
          返回
        </Button>
        <Title level={2}>用户设置</Title>
      </div>

      {/* 用户基本信息展示 */}
      <Card title="个人信息" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Avatar 
              size={100} 
              src={userProfile?.avatar} 
              icon={<UserOutlined />}
              style={{ marginBottom: '16px' }}
            />
            <div>
              <Title level={4}>{userProfile?.nickname || userProfile?.username || '未设置昵称'}</Title>
              <Text type="secondary">@{userProfile?.username}</Text>
            </div>
          </div>

          <div>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>用户名：</Text>
                <Text>{userProfile?.username || '未设置'}</Text>
              </div>
              <div>
                <Text strong>昵称：</Text>
                <Text>{userProfile?.nickname || '未设置'}</Text>
              </div>
              <div>
                <Text strong>邮箱：</Text>
                <Text>{userProfile?.email || '未设置'}</Text>
              </div>
              <div>
                <Text strong>手机：</Text>
                <Text>{userProfile?.phone || '未设置'}</Text>
              </div>
              <div>
                <Text strong>个人简介：</Text>
                <Text>{userProfile?.bio || '这个人很懒，什么都没留下'}</Text>
              </div>
            </Space>
          </div>
        </Space>
      </Card>

      {/* 功能说明 */}
      <Card title="功能说明">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <Text>用户设置功能正在开发中</Text>
              <br />
              <Text type="secondary">
                目前支持的功能：查看个人信息、关注其他用户
              </Text>
              <br />
              <Text type="secondary">
                即将推出：资料编辑、密码修改、隐私设置等功能
              </Text>
            </div>
          }
        >
          <Space>
            <Button type="primary" onClick={() => navigate('/profile')}>
              查看我的主页
            </Button>
            <Button onClick={() => navigate('/home')}>
              返回首页
            </Button>
          </Space>
        </Empty>
      </Card>
    </div>
  );
};

export default UserSettingsPage;
