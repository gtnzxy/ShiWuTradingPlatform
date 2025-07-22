import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContextNew';
import { STORAGE_KEYS } from '../../utils/constants';
import Logo from '../../components/atoms/Logo';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { setLoginState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 获取重定向地址
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // 直接使用 authService，不通过 AuthContext
      const result = await authService.login({
        loginType: 'username',
        username: values.username,
        password: values.password,
        rememberMe: false
      });

      // 保存登录信息到localStorage
      if (result.success && result.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
        console.log('✅ 登录信息已保存到localStorage');

        // 更新AuthContext状态
        setLoginState(result.data.user, result.data.token);
        console.log('✅ AuthContext状态已更新');
      }

      // 登录成功
      setSuccessMessage('登录成功！正在跳转...');

      // 1.5秒后跳转
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);

    } catch (error) {
      console.error('❌ 登录失败:', error);

      // 设置错误信息
      let errorMsg = '登录失败，请稍后重试';
      if (error.message) {
        if (error.message.includes('密码错误') || error.message.includes('用户名或密码错误')) {
          errorMsg = '用户名或密码错误，请重新输入';
        } else if (error.message.includes('用户不存在')) {
          errorMsg = '用户不存在，请检查用户名或先注册账号';
        } else {
          errorMsg = error.message;
        }
      }
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '400px',
      background: 'white',
      borderRadius: '8px',
      padding: '40px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      margin: '20px auto'
    }}>
        {/* Logo和标题 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Logo size="large" />
          <Title level={2} style={{ margin: '16px 0 8px 0', color: '#1890ff' }}>
            登录账号
          </Title>
          <Text type="secondary">登录您的拾物平台账号</Text>
        </div>

        {/* 错误提示 */}
        {errorMessage && (
          <div style={{
            color: '#ff4d4f',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            padding: '8px 12px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {errorMessage}
          </div>
        )}

        {/* 成功提示 */}
        {successMessage && (
          <div style={{
            color: '#52c41a',
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: '4px',
            padding: '8px 12px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {successMessage}
          </div>
        )}

        {/* 登录表单 */}
        <Form
          form={form}
          name="login"
          size="large"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
              { max: 20, message: '用户名不超过20个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              maxLength={20}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              maxLength={50}
            />
          </Form.Item>

          {/* 登录按钮 */}
          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ height: '48px', fontSize: '16px' }}
            >
              立即登录
            </Button>
          </Form.Item>



          {/* 注册链接 */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              还没有账号？
              <Link to="/auth/register" style={{ color: '#1890ff', marginLeft: '4px' }}>
                立即注册
              </Link>
            </Text>
          </div>
        </Form>
      </div>
  );
};

export default Login;
