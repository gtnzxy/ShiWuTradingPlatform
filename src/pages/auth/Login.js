import React, { useState, useContext } from 'react';
import { Form, Card, Row, Col, Typography, Divider, message, Checkbox } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { AuthContext } from '../../context/AuthContextNew';
import { APP_CONFIG, REGEX_PATTERNS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import './Auth.css';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('username'); // username | phone
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 获取重定向地址
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // 构造登录数据
      const loginData = {
        loginType,
        [loginType]: values.account,
        password: values.password,
        rememberMe: values.rememberMe || false
      };

      await login(loginData);
      
      message.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
      
      // 登录成功后跳转
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('登录失败:', error);
      message.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const validateAccount = (rule, value) => {
    if (!value) {
      return Promise.reject(new Error('请输入账号'));
    }
    
    if (loginType === 'username') {
      if (!REGEX_PATTERNS.USERNAME.test(value)) {
        return Promise.reject(new Error('用户名格式不正确，支持3-20位字母、数字、下划线'));
      }
    } else if (loginType === 'phone') {
      if (!REGEX_PATTERNS.PHONE.test(value)) {
        return Promise.reject(new Error('手机号格式不正确'));
      }
    }
    
    return Promise.resolve();
  };

  const switchLoginType = () => {
    setLoginType(loginType === 'username' ? 'phone' : 'username');
    form.resetFields(['account']);
  };

  return (
    <div className="auth-container">
      <div className="auth-background" />
      <Card className="auth-card" bordered={false}>
        <div className="auth-header">
          <Title level={2} className="auth-title">
            欢迎回来
          </Title>
          <Text type="secondary" className="auth-subtitle">
            登录 {APP_CONFIG.APP_NAME}
          </Text>
        </div>

        <Form
          form={form}
          name="login"
          size="large"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
          className="auth-form"
        >
          <Form.Item
            name="account"
            label={loginType === 'username' ? '用户名' : '手机号'}
            rules={[{ validator: validateAccount }]}
          >
            <Input
              prefix={loginType === 'username' ? <UserOutlined /> : <MobileOutlined />}
              placeholder={loginType === 'username' ? '请输入用户名' : '请输入手机号'}
              maxLength={loginType === 'username' ? APP_CONFIG.USERNAME_MAX_LENGTH : 11}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: APP_CONFIG.PASSWORD_MIN_LENGTH, message: `密码至少${APP_CONFIG.PASSWORD_MIN_LENGTH}位` },
              { max: APP_CONFIG.PASSWORD_MAX_LENGTH, message: `密码不超过${APP_CONFIG.PASSWORD_MAX_LENGTH}位` }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              maxLength={APP_CONFIG.PASSWORD_MAX_LENGTH}
            />
          </Form.Item>

          <Form.Item>
            <Row justify="space-between" align="middle">
              <Col>
                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
              </Col>
              <Col>
                <Link to="/auth/forgot-password" className="auth-link">
                  忘记密码？
                </Link>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className="auth-submit-btn"
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="auth-switch">
              <Button
                type="link"
                onClick={switchLoginType}
                className="switch-login-type"
              >
                {loginType === 'username' ? '手机号登录' : '用户名登录'}
              </Button>
            </div>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">其他登录方式</Text>
        </Divider>

        <div className="auth-social">
          <Row gutter={16}>
            <Col span={12}>
              <Button
                block
                size="large"
                className="social-btn wechat-btn"
                onClick={() => message.info('微信登录功能开发中')}
              >
                微信登录
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                size="large"
                className="social-btn qq-btn"
                onClick={() => message.info('QQ登录功能开发中')}
              >
                QQ登录
              </Button>
            </Col>
          </Row>
        </div>

        <div className="auth-footer">
          <Text type="secondary">
            还没有账号？{' '}
            <Link to="/auth/register" className="auth-link">
              立即注册
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
