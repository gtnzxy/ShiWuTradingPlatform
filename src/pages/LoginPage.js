import React, { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

/**
 * 登录页面组件
 * @returns {React.ReactElement} LoginPage组件
 */
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 模拟登录API调用
      console.log('登录表单数据:', values);
      
      // 模拟登录成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 保存登录状态
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: values.username,
        nickname: '测试用户',
        avatar: null
      }));
      
      message.success('登录成功！');
      navigate('/home');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('表单验证失败:', errorInfo);
  };

  return (
    <div>
      <Form
        name="login"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="username"
          rules={[
            {
              required: true,
              message: '请输入用户名！'
            },
            {
              min: 3,
              message: '用户名至少3个字符！'
            }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名" 
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: '请输入密码！'
            },
            {
              min: 6,
              message: '密码至少6个字符！'
            }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="密码" 
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ width: '100%' }}
          >
            登录
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>还没有账号？</Divider>
      
      <div style={{ textAlign: 'center' }}>
        <Link to="/auth/register">
          <Button type="link" size="large">
            立即注册
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
