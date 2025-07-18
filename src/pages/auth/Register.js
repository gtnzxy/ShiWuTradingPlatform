import React, { useState, useContext } from 'react';
import { Form, Card, Steps, Typography, message, Row, Col, Divider } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined, MobileOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { AuthContext } from '../../context/AuthContextNew';
import { APP_CONFIG, REGEX_PATTERNS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import './Auth.css';

const { Title, Text } = Typography;
const { Step } = Steps;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const steps = [
    {
      title: '基本信息',
      description: '填写账号信息'
    },
    {
      title: '验证身份',
      description: '验证手机号码'
    },
    {
      title: '完成注册',
      description: '设置密码'
    }
  ];

  // 发送验证码
  const sendVerificationCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone || !REGEX_PATTERNS.PHONE.test(phone)) {
        message.error('请先输入正确的手机号');
        return;
      }

      setCodeLoading(true);
      
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('验证码已发送');
      
      // 开始倒计时
      let count = 60;
      setCountdown(count);
      const timer = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(timer);
        }
      }, 1000);

    } catch (error) {
      message.error('发送验证码失败');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      
      if (current === 0) {
        // 第一步：验证基本信息
        setCurrent(1);
      } else if (current === 1) {
        // 第二步：验证手机号
        if (!values.verificationCode) {
          message.error('请输入验证码');
          return;
        }
        setCurrent(2);
      } else if (current === 2) {
        // 第三步：完成注册
        await handleSubmit(values);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const registerData = {
        username: values.username,
        phone: values.phone,
        email: values.email,
        password: values.password,
        verificationCode: values.verificationCode
      };

      await register(registerData);
      
      message.success(SUCCESS_MESSAGES.REGISTER_SUCCESS);
      
      // 注册成功后跳转到登录页
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
      
    } catch (error) {
      console.error('注册失败:', error);
      message.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const validateConfirmPassword = (rule, value) => {
    if (value && value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('两次输入的密码不一致'));
    }
    return Promise.resolve();
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <>
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { pattern: REGEX_PATTERNS.USERNAME, message: '用户名格式不正确，支持3-20位字母、数字、下划线' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                maxLength={APP_CONFIG.USERNAME_MAX_LENGTH}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: REGEX_PATTERNS.PHONE, message: '手机号格式不正确' }
              ]}
            >
              <Input
                prefix={<MobileOutlined />}
                placeholder="请输入手机号"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱（可选）"
              rules={[
                { pattern: REGEX_PATTERNS.EMAIL, message: '邮箱格式不正确' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱地址"
              />
            </Form.Item>
          </>
        );

      case 1:
        return (
          <>
            <div className="verification-step">
              <Text type="secondary" className="verification-hint">
                我们已向 {form.getFieldValue('phone')} 发送验证码
              </Text>
              
              <Form.Item
                name="verificationCode"
                label="验证码"
                rules={[
                  { required: true, message: '请输入验证码' },
                  { len: 6, message: '请输入6位验证码' }
                ]}
              >
                <Row gutter={8}>
                  <Col span={16}>
                    <Input
                      prefix={<SafetyOutlined />}
                      placeholder="请输入6位验证码"
                      maxLength={6}
                    />
                  </Col>
                  <Col span={8}>
                    <Button
                      block
                      loading={codeLoading}
                      disabled={countdown > 0}
                      onClick={sendVerificationCode}
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </div>
          </>
        );

      case 2:
        return (
          <>
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

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              rules={[
                { required: true, message: '请确认密码' },
                { validator: validateConfirmPassword }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                maxLength={APP_CONFIG.PASSWORD_MAX_LENGTH}
              />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background" />
      <Card className="auth-card register-card" bordered={false}>
        <div className="auth-header">
          <Title level={2} className="auth-title">
            欢迎注册
          </Title>
          <Text type="secondary" className="auth-subtitle">
            加入 {APP_CONFIG.APP_NAME}
          </Text>
        </div>

        <Steps current={current} className="register-steps">
          {steps.map(item => (
            <Step key={item.title} title={item.title} description={item.description} />
          ))}
        </Steps>

        <Form
          form={form}
          name="register"
          size="large"
          layout="vertical"
          className="auth-form register-form"
        >
          {renderStepContent()}

          <Form.Item className="step-buttons">
            <Row gutter={16}>
              {current > 0 && (
                <Col span={12}>
                  <Button
                    size="large"
                    onClick={handlePrev}
                    block
                  >
                    上一步
                  </Button>
                </Col>
              )}
              <Col span={current > 0 ? 12 : 24}>
                <Button
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={handleNext}
                  block
                  className="auth-submit-btn"
                >
                  {current === steps.length - 1 ? (loading ? '注册中...' : '完成注册') : '下一步'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>

        <Divider />

        <div className="auth-footer">
          <Text type="secondary">
            已有账号？{' '}
            <Link to="/auth/login" className="auth-link">
              立即登录
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Register;
