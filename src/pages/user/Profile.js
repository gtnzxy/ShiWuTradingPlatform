import React, { useState, useContext, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Row, 
  Col, 
  Avatar, 
  Upload, 
  Typography, 
  Divider, 
  message, 
  Space, 
  Tag,
  Modal,
  Descriptions
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  CameraOutlined, 
  SaveOutlined,
  CloseOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import Button from '../../components/atoms/Button/Button';
import Input from '../../components/atoms/Input/Input';
import { AuthContext } from '../../context/AuthContextNew';
import { userService } from '../../services/userService';
import { 
  APP_CONFIG, 
  REGEX_PATTERNS, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES,
  USER_STATUS,
  USER_STATUS_LABELS
} from '../../utils/constants';
import './Profile.css';

const { Title, Text, Paragraph } = Typography;

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [bindPhoneVisible, setBindPhoneVisible] = useState(false);
  const [bindEmailVisible, setBindEmailVisible] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const { user, updateUser } = useContext(AuthContext);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setUserProfile(response.data);
      form.setFieldsValue(response.data);
    } catch (error) {
      console.error('加载用户信息失败:', error);
      message.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const updateData = {
        nickname: values.nickname,
        realName: values.realName,
        gender: values.gender,
        birthday: values.birthday,
        bio: values.bio,
        location: values.location
      };

      const response = await userService.updateProfile(updateData);
      
      setUserProfile(response.data);
      updateUser(response.data);
      setEditing(false);
      
      message.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      
    } catch (error) {
      console.error('更新用户信息失败:', error);
      message.error(error.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(userProfile);
    setEditing(false);
  };

  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      try {
        const response = await userService.updateAvatar(info.file);
        setUserProfile(prev => ({ ...prev, avatar: response.data.avatar }));
        updateUser({ ...user, avatar: response.data.avatar });
        message.success('头像更新成功');
      } catch (error) {
        message.error('头像上传失败');
      } finally {
        setUploadLoading(false);
      }
    }
    
    if (info.file.status === 'error') {
      setUploadLoading(false);
      message.error('头像上传失败');
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return false;
    }
    
    return true;
  };

  const getUserStatusTag = (status) => {
    const colors = {
      [USER_STATUS.ACTIVE]: 'success',
      [USER_STATUS.BANNED]: 'error',
      [USER_STATUS.MUTED]: 'warning'
    };
    
    return (
      <Tag color={colors[status] || 'default'}>
        {USER_STATUS_LABELS[status] || '未知'}
      </Tag>
    );
  };

  if (loading && !userProfile) {
    return (
      <div className="profile-loading">
        <Card loading={true} />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Row gutter={[24, 24]}>
        {/* 用户基本信息卡片 */}
        <Col xs={24} lg={8}>
          <Card className="profile-info-card">
            <div className="profile-avatar-section">
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleAvatarUpload}
                disabled={!editing}
              >
                <div className="avatar-upload-wrapper">
                  <Avatar
                    size={120}
                    src={userProfile?.avatar}
                    icon={<UserOutlined />}
                    className="profile-avatar"
                  />
                  {editing && (
                    <div className="avatar-upload-overlay">
                      <CameraOutlined />
                      <Text>更换头像</Text>
                    </div>
                  )}
                </div>
              </Upload>
              
              <div className="profile-basic-info">
                <Title level={4} className="profile-username">
                  {userProfile?.nickname || userProfile?.username}
                </Title>
                <Text type="secondary" className="profile-user-id">
                  ID: {userProfile?.userId}
                </Text>
                <div className="profile-status">
                  {getUserStatusTag(userProfile?.status)}
                </div>
              </div>
            </div>

            <Divider />

            <Descriptions column={1} size="small" className="profile-descriptions">
              <Descriptions.Item 
                label={<><PhoneOutlined /> 手机号</>}
              >
                {userProfile?.phone ? (
                  <Text>{userProfile.phone}</Text>
                ) : (
                  <Button type="link" size="small" onClick={() => setBindPhoneVisible(true)}>
                    绑定手机号
                  </Button>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<><MailOutlined /> 邮箱</>}
              >
                {userProfile?.email ? (
                  <Text>{userProfile.email}</Text>
                ) : (
                  <Button type="link" size="small" onClick={() => setBindEmailVisible(true)}>
                    绑定邮箱
                  </Button>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<><CalendarOutlined /> 注册时间</>}
              >
                <Text>{userProfile?.createTime}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item 
                label={<><SafetyOutlined /> 安全设置</>}
              >
                <Space direction="vertical" size="small">
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={() => setChangePasswordVisible(true)}
                  >
                    修改密码
                  </Button>
                  {userProfile?.twoFactorEnabled ? (
                    <Text type="success">已启用二步验证</Text>
                  ) : (
                    <Button type="link" size="small">
                      启用二步验证
                    </Button>
                  )}
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* 详细信息编辑卡片 */}
        <Col xs={24} lg={16}>
          <Card 
            title="个人信息"
            extra={
              <Space>
                {editing ? (
                  <>
                    <Button 
                      icon={<SaveOutlined />} 
                      type="primary"
                      loading={loading}
                      onClick={handleSave}
                    >
                      保存
                    </Button>
                    <Button 
                      icon={<CloseOutlined />}
                      onClick={handleCancel}
                    >
                      取消
                    </Button>
                  </>
                ) : (
                  <Button 
                    icon={<EditOutlined />}
                    type="primary"
                    onClick={() => setEditing(true)}
                  >
                    编辑
                  </Button>
                )}
              </Space>
            }
            className="profile-detail-card"
          >
            <Form
              form={form}
              layout="vertical"
              disabled={!editing}
              className="profile-form"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="nickname"
                    label="昵称"
                    rules={[
                      { required: true, message: '请输入昵称' },
                      { max: 20, message: '昵称不能超过20个字符' }
                    ]}
                  >
                    <Input placeholder="请输入昵称" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="realName"
                    label="真实姓名"
                    rules={[
                      { pattern: REGEX_PATTERNS.CHINESE_NAME, message: '请输入正确的中文姓名' }
                    ]}
                  >
                    <Input placeholder="请输入真实姓名" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="gender"
                    label="性别"
                  >
                    <Input placeholder="请选择性别" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="birthday"
                    label="生日"
                  >
                    <Input placeholder="请选择生日" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="location"
                label="所在地"
              >
                <Input 
                  prefix={<EnvironmentOutlined />}
                  placeholder="请输入所在地" 
                />
              </Form.Item>

              <Form.Item
                name="bio"
                label="个人简介"
                rules={[
                  { max: 200, message: '个人简介不能超过200个字符' }
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="介绍一下自己吧..."
                  showCount
                  maxLength={200}
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={changePasswordVisible}
        onCancel={() => setChangePasswordVisible(false)}
        footer={null}
        destroyOnClose
      >
        <ChangePasswordForm onSuccess={() => setChangePasswordVisible(false)} />
      </Modal>

      {/* 绑定手机号模态框 */}
      <Modal
        title="绑定手机号"
        open={bindPhoneVisible}
        onCancel={() => setBindPhoneVisible(false)}
        footer={null}
        destroyOnClose
      >
        <BindPhoneForm onSuccess={() => {
          setBindPhoneVisible(false);
          loadUserProfile();
        }} />
      </Modal>

      {/* 绑定邮箱模态框 */}
      <Modal
        title="绑定邮箱"
        open={bindEmailVisible}
        onCancel={() => setBindEmailVisible(false)}
        footer={null}
        destroyOnClose
      >
        <BindEmailForm onSuccess={() => {
          setBindEmailVisible(false);
          loadUserProfile();
        }} />
      </Modal>
    </div>
  );
};

// 修改密码表单组件
const ChangePasswordForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await userService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      
      message.success('密码修改成功');
      onSuccess?.();
    } catch (error) {
      message.error(error.message || '修改密码失败');
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

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="oldPassword"
        label="当前密码"
        rules={[{ required: true, message: '请输入当前密码' }]}
      >
        <Input.Password placeholder="请输入当前密码" />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label="新密码"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: APP_CONFIG.PASSWORD_MIN_LENGTH, message: `密码至少${APP_CONFIG.PASSWORD_MIN_LENGTH}位` },
          { max: APP_CONFIG.PASSWORD_MAX_LENGTH, message: `密码不超过${APP_CONFIG.PASSWORD_MAX_LENGTH}位` }
        ]}
      >
        <Input.Password placeholder="请输入新密码" />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="确认新密码"
        rules={[
          { required: true, message: '请确认新密码' },
          { validator: validateConfirmPassword }
        ]}
      >
        <Input.Password placeholder="请再次输入新密码" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
        >
          修改密码
        </Button>
      </Form.Item>
    </Form>
  );
};

// 绑定手机号表单组件
const BindPhoneForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const sendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone || !REGEX_PATTERNS.PHONE.test(phone)) {
        message.error('请输入正确的手机号');
        return;
      }

      setCodeLoading(true);
      await userService.sendBindPhoneCode({ phone });
      message.success('验证码已发送');

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

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await userService.bindPhone({
        phone: values.phone,
        verificationCode: values.verificationCode
      });
      
      message.success('手机号绑定成功');
      onSuccess?.();
    } catch (error) {
      message.error(error.message || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="phone"
        label="手机号"
        rules={[
          { required: true, message: '请输入手机号' },
          { pattern: REGEX_PATTERNS.PHONE, message: '手机号格式不正确' }
        ]}
      >
        <Input placeholder="请输入手机号" />
      </Form.Item>

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
            <Input placeholder="请输入验证码" />
          </Col>
          <Col span={8}>
            <Button
              block
              loading={codeLoading}
              disabled={countdown > 0}
              onClick={sendCode}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </Col>
        </Row>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
        >
          绑定手机号
        </Button>
      </Form.Item>
    </Form>
  );
};

// 绑定邮箱表单组件
const BindEmailForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await userService.bindEmail({
        email: values.email,
        verificationCode: values.verificationCode
      });
      
      message.success('邮箱绑定成功');
      onSuccess?.();
    } catch (error) {
      message.error(error.message || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { pattern: REGEX_PATTERNS.EMAIL, message: '邮箱格式不正确' }
        ]}
      >
        <Input placeholder="请输入邮箱地址" />
      </Form.Item>

      <Form.Item
        name="verificationCode"
        label="验证码"
        rules={[
          { required: true, message: '请输入验证码' }
        ]}
      >
        <Input placeholder="请输入邮箱验证码" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          block
        >
          绑定邮箱
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Profile;
