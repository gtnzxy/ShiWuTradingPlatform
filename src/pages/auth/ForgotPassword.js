import React, { useState } from 'react';
import { Form, Card, Steps, Typography, message, Row, Col } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { MobileOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { APP_CONFIG, REGEX_PATTERNS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import { authService } from '../../services/authService';
import './Auth.css';

const { Title, Text } = Typography;
const { Step } = Steps;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: '验证身份',
      description: '输入手机号'
    },
    {
      title: '验证码确认',
      description: '输入验证码'
    },
    {
      title: '重置密码',
      description: '设置新密码'
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
      
      // 调用发送验证码API
      await authService.sendResetCode({ phone });
      
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
      message.error(error.message || '发送验证码失败');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      
      if (current === 0) {
        // 第一步：验证手机号是否存在
        setLoading(true);
        try {
          await authService.checkPhoneExists({ phone: values.phone });
          setCurrent(1);
          // 自动发送验证码
          await sendVerificationCode();
        } catch (error) {
          message.error(error.message || '手机号不存在');
        } finally {
          setLoading(false);
        }
      } else if (current === 1) {
        // 第二步：验证验证码
        if (!values.verificationCode) {
          message.error('请输入验证码');
          return;
        }
        setCurrent(2);
      } else if (current === 2) {
        // 第三步：重置密码
        await handleResetPassword(values);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const handleResetPassword = async (values) => {
    try {
      setLoading(true);
      
      const resetData = {
        phone: values.phone,
        verificationCode: values.verificationCode,
        newPassword: values.newPassword
      };

      await authService.resetPassword(resetData);
      
      message.success('密码重置成功');
      
      // 重置成功后跳转到登录页
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
      
    } catch (error) {
      console.error('重置密码失败:', error);
      message.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const validateConfirmPassword = (rule, value) => {
    if (value && value !== form.getFieldValue('newPassword')) {
      return Promise.reject(new Error('两次输入的密码不一致'));
    }
    return Promise.resolve();
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <>
            <div className="forgot-password-hint">
              <Text type="secondary">
                请输入您注册时使用的手机号，我们将向该手机号发送验证码
              </Text>
            </div>
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
                placeholder="请输入注册时的手机号"
                maxLength={11}
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
                      {countdown > 0 ? `${countdown}s` : '重新发送'}
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
            <div className="reset-password-hint">
              <Text type="secondary">
                请设置新密码，密码长度为{APP_CONFIG.PASSWORD_MIN_LENGTH}-{APP_CONFIG.PASSWORD_MAX_LENGTH}位
              </Text>
            </div>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: APP_CONFIG.PASSWORD_MIN_LENGTH, message: `密码至少${APP_CONFIG.PASSWORD_MIN_LENGTH}位` },
                { max: APP_CONFIG.PASSWORD_MAX_LENGTH, message: `密码不超过${APP_CONFIG.PASSWORD_MAX_LENGTH}位` }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入新密码"
                maxLength={APP_CONFIG.PASSWORD_MAX_LENGTH}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[
                { required: true, message: '请确认新密码' },
                { validator: validateConfirmPassword }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入新密码"
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
      <Card className="auth-card forgot-password-card" bordered={false}>
        <div className="auth-header">
          <Title level={2} className="auth-title">
            重置密码
          </Title>
          <Text type="secondary" className="auth-subtitle">
            找回您的 {APP_CONFIG.APP_NAME} 账号
          </Text>
        </div>

        <Steps current={current} className="forgot-password-steps">
          {steps.map(item => (
            <Step key={item.title} title={item.title} description={item.description} />
          ))}
        </Steps>

        <Form
          form={form}
          name="forgotPassword"
          size="large"
          layout="vertical"
          className="auth-form forgot-password-form"
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
                  {current === steps.length - 1 ? (loading ? '重置中...' : '完成重置') : '下一步'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text type="secondary">
            想起密码了？{' '}
            <Link to="/auth/login" className="auth-link">
              返回登录
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
