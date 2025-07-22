import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, message, Input, Avatar, List } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContextNew';
import { userService } from '../../services/userService';

const { Title, Text } = Typography;

const UserFunctionTest = () => {
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState('2');
  const [testResults, setTestResults] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const { user: currentUser } = useAuth();

  // 测试获取用户信息
  const testGetProfile = async () => {
    try {
      setLoading(true);
      message.info('测试获取用户信息...');
      
      const result = await userService.getProfile(testUserId);
      setUserProfile(result.data);
      setTestResults(prev => ({
        ...prev,
        getProfile: { success: true, data: result }
      }));
      message.success('✅ 获取用户信息成功');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        getProfile: { success: false, error: error.message }
      }));
      message.error('❌ 获取用户信息失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 测试获取当前用户信息
  const testGetCurrentProfile = async () => {
    try {
      setLoading(true);
      message.info('测试获取当前用户信息...');
      
      const result = await userService.getCurrentUserProfile();
      setTestResults(prev => ({
        ...prev,
        getCurrentProfile: { success: true, data: result }
      }));
      message.success('✅ 获取当前用户信息成功');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        getCurrentProfile: { success: false, error: error.message }
      }));
      message.error('❌ 获取当前用户信息失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 测试关注功能
  const testFollow = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }

    try {
      setLoading(true);
      message.info('测试关注功能...');
      
      const result = await userService.followUser(testUserId);
      setTestResults(prev => ({
        ...prev,
        follow: { success: true, data: result }
      }));
      message.success('✅ 关注成功');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        follow: { success: false, error: error.message }
      }));
      message.error('❌ 关注失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 测试取消关注功能
  const testUnfollow = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }

    try {
      setLoading(true);
      message.info('测试取消关注功能...');
      
      const result = await userService.unfollowUser(testUserId);
      setTestResults(prev => ({
        ...prev,
        unfollow: { success: true, data: result }
      }));
      message.success('✅ 取消关注成功');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        unfollow: { success: false, error: error.message }
      }));
      message.error('❌ 取消关注失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 测试获取关注状态
  const testGetFollowStatus = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }

    try {
      setLoading(true);
      message.info('测试获取关注状态...');
      
      const result = await userService.getFollowStatus(testUserId);
      setTestResults(prev => ({
        ...prev,
        followStatus: { success: true, data: result }
      }));
      message.success('✅ 获取关注状态成功');
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        followStatus: { success: false, error: error.message }
      }));
      message.error('❌ 获取关注状态失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>用户功能测试</Title>
      
      {/* 当前用户状态 */}
      <Card title="当前用户状态" style={{ marginBottom: '20px' }}>
        {currentUser ? (
          <Space>
            <Avatar src={currentUser.avatar} icon={<UserOutlined />} />
            <div>
              <Text strong>{currentUser.nickname || currentUser.username}</Text>
              <br />
              <Text type="secondary">ID: {currentUser.id}</Text>
            </div>
          </Space>
        ) : (
          <Text type="secondary">未登录</Text>
        )}
      </Card>

      {/* 测试控制 */}
      <Card title="测试控制" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>测试用户ID: </Text>
            <Input
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              placeholder="输入要测试的用户ID"
              style={{ width: '200px', marginLeft: '10px' }}
            />
          </div>
          
          <Space wrap>
            <Button type="primary" onClick={testGetProfile} loading={loading}>
              测试获取用户信息
            </Button>
            <Button onClick={testGetCurrentProfile} loading={loading}>
              测试获取当前用户信息
            </Button>
            <Button onClick={testFollow} loading={loading} disabled={!currentUser}>
              测试关注
            </Button>
            <Button onClick={testUnfollow} loading={loading} disabled={!currentUser}>
              测试取消关注
            </Button>
            <Button onClick={testGetFollowStatus} loading={loading} disabled={!currentUser}>
              测试获取关注状态
            </Button>
          </Space>
        </Space>
      </Card>

      {/* 用户信息预览 */}
      {userProfile && (
        <Card title="用户信息预览" style={{ marginBottom: '20px' }}>
          <Space>
            <Avatar size={64} src={userProfile.avatar} icon={<UserOutlined />} />
            <div>
              <Title level={4}>{userProfile.nickname || userProfile.username}</Title>
              <Text type="secondary">@{userProfile.username}</Text>
              <br />
              <Text>ID: {userProfile.id}</Text>
              {userProfile.email && (
                <>
                  <br />
                  <Text>邮箱: {userProfile.email}</Text>
                </>
              )}
            </div>
          </Space>
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

      {/* 功能说明 */}
      <Card title="支持的功能">
        <List
          dataSource={[
            { title: '获取用户信息', desc: 'GET /api/user/{userId}', status: '✅ 支持' },
            { title: '获取当前用户信息', desc: '从localStorage获取', status: '✅ 支持' },
            { title: '关注用户', desc: 'POST /api/user/{userId}/follow', status: '✅ 支持' },
            { title: '取消关注用户', desc: 'DELETE /api/user/{userId}/follow', status: '✅ 支持' },
            { title: '获取关注状态', desc: 'GET /api/user/{userId}/follow', status: '✅ 支持' }
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.title}
                description={item.desc}
              />
              <Text type={item.status.includes('✅') ? 'success' : 'secondary'}>
                {item.status}
              </Text>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default UserFunctionTest;
