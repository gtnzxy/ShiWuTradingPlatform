import React, { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';

/**
 * 登录页面组件
 * @returns {React.ReactElement} LoginPage组件
 */
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // 获取重定向地址
  const from = location.state?.from?.pathname || '/home';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 使用AuthContext的login方法
      const loginData = {
        loginType: 'username',
        username: values.username,
        password: values.password,
        rememberMe: false
      };

      await login(loginData);

      message.success('登录成功！');

      // 登录成功后跳转
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);

    } catch (error) {
      console.error('登录失败:', error);
      message.error(error.message || '登录失败，请检查用户名和密码');
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

      <Divider plain>测试账号</Divider>

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
          测试账号：alice / bob / charlie
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          密码：123456
        </div>
      </div>

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
