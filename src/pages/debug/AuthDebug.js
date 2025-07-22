import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Divider, message } from 'antd';
import { cartService } from '../../services/cartService';
import { authService } from '../../services/authService';
import apiClient from '../../services/api';
import { STORAGE_KEYS } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;

const AuthDebug = () => {
  const [authInfo, setAuthInfo] = useState({});
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 检查认证状态
  const checkAuthStatus = () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    
    setAuthInfo({
      hasToken: !!token,
      tokenValue: token ? token.substring(0, 50) + '...' : 'null',
      hasUser: !!user,
      userValue: user ? JSON.parse(user) : null,
      storageKeys: Object.keys(localStorage),
      tokenKey: STORAGE_KEYS.TOKEN,
      userKey: STORAGE_KEYS.USER
    });
  };

  // 测试登录
  const testLogin = async () => {
    try {
      setLoading(true);
      message.info('开始测试登录...');

      const result = await authService.login({
        loginType: 'username',
        username: 'alice',
        password: '123456',
        rememberMe: false
      });

      console.log('登录结果:', result);
      
      if (result.success) {
        // 保存登录信息
        localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
        message.success('登录成功！');
        checkAuthStatus();
      } else {
        message.error('登录失败: ' + (result.error?.message || '未知错误'));
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录错误: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 测试购物车API
  const testCartAPI = async () => {
    try {
      setLoading(true);
      message.info('开始测试购物车API...');
      
      const result = await cartService.getCart();
      console.log('购物车结果:', result);
      setCartData(result);
      
      if (result.success) {
        message.success('购物车API调用成功！');
      } else {
        message.error('购物车API调用失败');
      }
    } catch (error) {
      console.error('购物车API错误:', error);
      message.error('购物车API错误: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 直接测试API请求
  const testDirectAPI = async () => {
    try {
      setLoading(true);
      message.info('开始直接测试API...');
      
      const response = await apiClient.get('/cart/');
      console.log('直接API响应:', response);
      message.success('直接API调用成功！');
    } catch (error) {
      console.error('直接API错误:', error);
      message.error('直接API错误: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 清除认证信息
  const clearAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setAuthInfo({});
    setCartData(null);
    message.info('认证信息已清除');
    checkAuthStatus();
  };

  // 测试完整流程
  const testFullFlow = async () => {
    try {
      setLoading(true);
      message.info('开始完整流程测试...');

      // 1. 清除现有认证
      clearAuth();
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. 测试登录
      message.info('步骤1: 测试登录...');
      const loginResult = await authService.login({
        loginType: 'username',
        username: 'alice',
        password: '123456',
        rememberMe: false
      });

      if (loginResult.success) {
        // 保存登录信息
        localStorage.setItem(STORAGE_KEYS.TOKEN, loginResult.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loginResult.data.user));
        message.success('登录成功！');
        checkAuthStatus();

        // 3. 测试购物车
        await new Promise(resolve => setTimeout(resolve, 1000));
        message.info('步骤2: 测试购物车API...');
        const cartResult = await cartService.getCart();
        console.log('购物车结果:', cartResult);
        setCartData(cartResult);

        if (cartResult.success) {
          message.success('购物车API调用成功！');
          message.success('🎉 完整流程测试通过！');
        } else {
          message.error('购物车API调用失败');
        }
      } else {
        message.error('登录失败: ' + (loginResult.error?.message || '未知错误'));
      }
    } catch (error) {
      console.error('完整流程测试错误:', error);
      message.error('完整流程测试错误: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>认证和购物车调试页面</Title>
      
      <Card title="认证状态" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text><strong>Token存在:</strong> {authInfo.hasToken ? '是' : '否'}</Text>
          <Text><strong>Token值:</strong> {authInfo.tokenValue}</Text>
          <Text><strong>用户信息存在:</strong> {authInfo.hasUser ? '是' : '否'}</Text>
          <Text><strong>用户信息:</strong> {authInfo.userValue ? JSON.stringify(authInfo.userValue, null, 2) : 'null'}</Text>
          <Text><strong>Token键名:</strong> {authInfo.tokenKey}</Text>
          <Text><strong>用户键名:</strong> {authInfo.userKey}</Text>
          <Text><strong>本地存储所有键:</strong> {authInfo.storageKeys?.join(', ')}</Text>
        </Space>
      </Card>

      <Card title="操作" style={{ marginBottom: '20px' }}>
        <Space wrap>
          <Button onClick={checkAuthStatus}>刷新认证状态</Button>
          <Button type="primary" onClick={testLogin} loading={loading}>测试登录</Button>
          <Button onClick={testCartAPI} loading={loading}>测试购物车API</Button>
          <Button onClick={testDirectAPI} loading={loading}>直接测试API</Button>
          <Button onClick={testFullFlow} loading={loading} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
            🚀 完整流程测试
          </Button>
          <Button danger onClick={clearAuth}>清除认证信息</Button>
        </Space>
      </Card>

      {cartData && (
        <Card title="购物车数据">
          <Paragraph>
            <pre>{JSON.stringify(cartData, null, 2)}</pre>
          </Paragraph>
        </Card>
      )}
    </div>
  );
};

export default AuthDebug;
