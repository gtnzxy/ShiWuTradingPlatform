import React, { useState } from 'react';
import { Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

/**
 * 注册页面组件
 * @returns {React.ReactElement} RegisterPage组件
 */
const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 模拟注册API调用
      console.log('注册表单数据:', values);
      
      // 模拟注册处理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('注册成功！请登录');
      navigate('/auth/login');
    } catch (error) {
      message.error('注册失败，请稍后重试');
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
        name="register"
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
              max: 20,
              message: '用户名长度为3-20个字符！'
            },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: '用户名只能包含字母、数字和下划线！'
            }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="用户名" 
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: '请输入邮箱地址！'
            },
            {
              type: 'email',
              message: '请输入有效的邮箱地址！'
            }
          ]}
        >
          <Input 
            prefix={<MailOutlined />} 
            placeholder="邮箱地址" 
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
              max: 20,
              message: '密码长度为6-20个字符！'
            }
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="密码" 
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            {
              required: true,
              message: '请确认密码！'
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致！'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined />} 
            placeholder="确认密码" 
          />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ width: '100%' }}
          >
            注册
          </Button>
        </Form.Item>
      </Form>

      <Divider plain>已有账号？</Divider>
      
      <div style={{ textAlign: 'center' }}>
        <Link to="/auth/login">
          <Button type="link" size="large">
            立即登录
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
