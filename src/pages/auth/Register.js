import React, { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContextNew';
import { STORAGE_KEYS } from '../../utils/constants';
import Logo from '../../components/atoms/Logo';

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 测试错误提示功能
  const testErrorMessage = () => {
    console.log('🧪 测试注册错误提示');
    setErrorMessage('这是一个测试注册错误提示');
  };
  const { setLoginState } = useAuth();
  const navigate = useNavigate();

  // 表单提交处理
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // 构造完整的注册数据
      const registerData = {
        username: values.username,
        password: values.password,
        nickname: values.nickname || values.username, // 如果没有填写昵称，使用用户名作为昵称
        email: values.email,
        phone: values.phone
      };

      // 直接使用 authService，不通过 AuthContext
      const result = await authService.register(registerData);
      console.log('✅ 注册成功，结果:', result);

      // 如果注册成功后返回了token，保存到localStorage
      if (result.success && result.data && result.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, result.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
        console.log('✅ 注册后登录信息已保存到localStorage');

        // 更新AuthContext状态
        setLoginState(result.data.user, result.data.token);
        console.log('✅ 注册后AuthContext状态已更新');
      }

      // 注册成功
      setSuccessMessage('注册成功！正在跳转到登录页面...');

      // 2秒后跳转到登录页面
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);

    } catch (error) {
      console.error('❌ 注册失败:', error);
      console.log('🔍 注册错误信息详情:', {
        message: error.message,
        type: typeof error.message,
        fullError: error
      });

      // 强制设置错误信息
      let errorMsg = '注册失败，请稍后重试';

      if (error.message) {
        if (error.message.includes('用户名已存在')) {
          errorMsg = '该用户名已被使用，请选择其他用户名';
          console.log('🎯 匹配到用户名已存在');
        } else if (error.message.includes('邮箱已被注册')) {
          errorMsg = '该邮箱已被注册，请使用其他邮箱';
          console.log('🎯 匹配到邮箱已存在');
        } else if (error.message.includes('手机号已被注册')) {
          errorMsg = '该手机号已被注册，请使用其他手机号';
          console.log('🎯 匹配到手机号已存在');
        } else if (error.message.includes('密码强度不足') || error.message.includes('密码')) {
          errorMsg = '密码强度不足，至少需要8个字符，包括字母和数字';
          console.log('🎯 匹配到密码相关错误');
        } else {
          errorMsg = error.message;
          console.log('🎯 使用原始错误信息');
        }
      }

      console.log('🔴 设置注册错误信息:', errorMsg);

      // 使用 setTimeout 确保状态更新
      setTimeout(() => {
        setErrorMessage(errorMsg);
        console.log('🔄 延迟设置注册错误信息完成:', errorMsg);
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  // 密码确认验证
  const validateConfirmPassword = (_, value) => {
    if (value && value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('两次输入的密码不一致'));
    }
    return Promise.resolve();
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
            注册账号
          </Title>
          <Text type="secondary">创建您的拾物平台账号</Text>
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

        {/* 注册表单 */}
        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          {/* 用户名 */}
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3位' },
              { max: 20, message: '用户名不超过20位' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              maxLength={20}
            />
          </Form.Item>

          {/* 密码 */}
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8位' },
              { max: 50, message: '密码不超过50位' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
                message: '密码必须包含字母和数字，至少8个字符'
              }
            ]}
            extra={
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                密码要求：至少8个字符，必须包含字母和数字
              </div>
            }
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              maxLength={50}
            />
          </Form.Item>

          {/* 确认密码 */}
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              { validator: validateConfirmPassword }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              maxLength={50}
            />
          </Form.Item>

          {/* 昵称 */}
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[
              { max: 20, message: '昵称不超过20位' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入昵称（可选）"
              maxLength={20}
            />
          </Form.Item>

          {/* 邮箱 */}
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱（可选）"
              maxLength={50}
            />
          </Form.Item>

          {/* 手机号 */}
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="请输入手机号（可选）"
              maxLength={11}
            />
          </Form.Item>

          {/* 注册按钮 */}
          <Form.Item style={{ marginBottom: '16px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ height: '48px', fontSize: '16px' }}
            >
              立即注册
            </Button>
          </Form.Item>

          {/* 测试按钮 - 开发环境 */}
          {process.env.NODE_ENV === 'development' && (
            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="default"
                onClick={testErrorMessage}
                block
                size="small"
                style={{ fontSize: '12px', color: '#666' }}
              >
                🧪 测试错误提示
              </Button>
            </Form.Item>
          )}

          {/* 登录链接 */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">
              已有账号？
              <Link to="/auth/login" style={{ color: '#1890ff', marginLeft: '4px' }}>
                立即登录
              </Link>
            </Text>
          </div>
        </Form>
      </div>
  );
};

export default Register;
