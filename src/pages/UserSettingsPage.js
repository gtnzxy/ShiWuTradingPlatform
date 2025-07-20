import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  message,
  Modal,
  List,
  Tag,
  Space,
  Divider,
  Typography,
  Empty
} from 'antd';
import { 
  UserOutlined, 
  CameraOutlined, 
  LockOutlined, 
  SecurityScanOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { userService } from '../services/userService';
import dayjs from 'dayjs';
import './UserSettingsPage.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const UserSettingsPage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({});
  const [securitySettings, setSecuritySettings] = useState({});
  const [loginDevices, setLoginDevices] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  // 获取用户完整信息
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getProfile();
      setUserProfile(profileData);
      form.setFieldsValue({
        nickname: profileData.nickname,
        realName: profileData.realName,
        email: profileData.email,
        phone: profileData.phone,
        gender: profileData.gender,
        birthday: profileData.birthday ? dayjs(profileData.birthday) : null,
        location: profileData.location,
        bio: profileData.bio
      });

      // 获取隐私设置
      const privacyData = await userService.getPrivacySettings();
      setPrivacySettings(privacyData.data || {});

      // 获取安全设置
      const securityData = await userService.getSecuritySettings();
      setSecuritySettings(securityData.data || {});
    } catch (error) {
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取登录设备
  const fetchLoginDevices = async () => {
    try {
      const devices = await userService.getLoginDevices();
      setLoginDevices(devices.data || []);
    } catch (error) {
      console.error('获取登录设备失败:', error);
    }
  };

  // 获取活动日志
  const fetchActivityLog = async () => {
    try {
      const log = await userService.getActivityLog({ limit: 10 });
      setActivityLog(log.data || []);
    } catch (error) {
      console.error('获取活动日志失败:', error);
    }
  };

  // 更新个人信息
  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      const updateData = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null
      };
      const updatedProfile = await userService.updateProfile(updateData);
      setUserProfile(updatedProfile);
      updateUser(updatedProfile);
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  // 头像上传
  const handleAvatarUpload = async (file) => {
    try {
      setAvatarLoading(true);
      const result = await userService.updateAvatar(file);
      setUserProfile(prev => ({ ...prev, avatar: result.avatar }));
      updateUser({ ...user, avatar: result.avatar });
      message.success('头像更新成功');
      return false; // 阻止默认上传行为
    } catch (error) {
      message.error('头像上传失败');
      return false;
    } finally {
      setAvatarLoading(false);
    }
  };

  // 修改密码
  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      await userService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      passwordForm.resetFields();
      message.success('密码修改成功');
    } catch (error) {
      message.error('密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新隐私设置
  const handlePrivacyUpdate = async (key, value) => {
    try {
      const newSettings = { ...privacySettings, [key]: value };
      await userService.updatePrivacySettings(newSettings);
      setPrivacySettings(newSettings);
      message.success('设置已保存');
    } catch (error) {
      message.error('设置保存失败');
    }
  };

  // 更新安全设置
  const handleSecurityUpdate = async (key, value) => {
    try {
      const newSettings = { ...securitySettings, [key]: value };
      await userService.updateSecuritySettings(newSettings);
      setSecuritySettings(newSettings);
      message.success('设置已保存');
    } catch (error) {
      message.error('设置保存失败');
    }
  };

  // 移除设备
  const handleRemoveDevice = (deviceId) => {
    Modal.confirm({
      title: '移除设备',
      content: '确定要移除此设备的登录吗？该设备将需要重新登录。',
      okText: '移除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await userService.removeLoginDevice(deviceId);
          setLoginDevices(prev => prev.filter(device => device.id !== deviceId));
          message.success('设备已移除');
        } catch (error) {
          message.error('移除失败');
        }
      }
    });
  };

  // 注销账户
  const handleAccountDeactivation = () => {
    Modal.confirm({
      title: '注销账户',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>注销账户后：</p>
          <ul>
            <li>您的所有数据将被永久删除</li>
            <li>无法恢复账户和相关信息</li>
            <li>正在进行的交易将被取消</li>
          </ul>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>此操作不可逆，请谨慎考虑！</p>
        </div>
      ),
      okText: '确认注销',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        // 这里应该跳转到注销确认页面
        navigate('/account/deactivate');
      }
    });
  };

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchLoginDevices();
      fetchActivityLog();
    }
  }, [user]);

  // 未登录状态
  if (!user) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Empty
          image={<SecurityScanOutlined style={{ fontSize: '64px', color: '#ccc' }} />}
          description="请先登录查看账户设置"
        >
          <Button type="primary" onClick={() => navigate('/auth/login')}>
            立即登录
          </Button>
        </Empty>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'profile',
      label: '基本信息',
      children: (
        <Card>
          <Row gutter={24}>
            <Col xs={24} sm={8} md={6}>
              <div className="avatar-section">
                <Avatar 
                  size={120} 
                  src={userProfile?.avatar} 
                  icon={<UserOutlined />}
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                  accept="image/*"
                >
                  <Button 
                    icon={<CameraOutlined />} 
                    loading={avatarLoading}
                    style={{ marginTop: 16 }}
                  >
                    更换头像
                  </Button>
                </Upload>
              </div>
            </Col>
            <Col xs={24} sm={16} md={18}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleProfileUpdate}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="昵称"
                      name="nickname"
                      rules={[{ required: true, message: '请输入昵称' }]}
                    >
                      <Input placeholder="请输入昵称" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="真实姓名"
                      name="realName"
                    >
                      <Input placeholder="请输入真实姓名" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="性别"
                      name="gender"
                    >
                      <Select placeholder="请选择性别">
                        <Option value="male">男</Option>
                        <Option value="female">女</Option>
                        <Option value="other">其他</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="生日"
                      name="birthday"
                    >
                      <DatePicker style={{ width: '100%' }} placeholder="请选择生日" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="邮箱"
                      name="email"
                      rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="手机号"
                      name="phone"
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      label="所在地"
                      name="location"
                    >
                      <Input placeholder="请输入所在地" />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      label="个人简介"
                      name="bio"
                    >
                      <TextArea 
                        rows={4} 
                        placeholder="介绍一下自己吧..."
                        maxLength={200}
                        showCount
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存更改
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      )
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Card>
          <Row justify="center">
            <Col xs={24} sm={16} md={12} lg={8}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  label="当前密码"
                  name="oldPassword"
                  rules={[{ required: true, message: '请输入当前密码' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
                </Form.Item>
                <Form.Item
                  label="新密码"
                  name="newPassword"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, message: '密码长度至少6位' }
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
                </Form.Item>
                <Form.Item
                  label="确认新密码"
                  name="confirmPassword"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: '请确认新密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    修改密码
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      )
    },
    {
      key: 'privacy',
      label: '隐私设置',
      children: (
        <Card>
          <div className="settings-section">
            <Title level={4}>个人信息可见性</Title>
            <List
              dataSource={[
                {
                  key: 'showEmail',
                  title: '显示邮箱',
                  description: '其他用户可以看到您的邮箱地址'
                },
                {
                  key: 'showPhone',
                  title: '显示手机号',
                  description: '其他用户可以看到您的手机号码'
                },
                {
                  key: 'showRealName',
                  title: '显示真实姓名',
                  description: '其他用户可以看到您的真实姓名'
                },
                {
                  key: 'allowMessage',
                  title: '允许陌生人发消息',
                  description: '允许非关注用户向您发送私信'
                },
                {
                  key: 'showActivity',
                  title: '显示活动状态',
                  description: '其他用户可以看到您的在线状态'
                }
              ]}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Switch
                      checked={privacySettings[item.key]}
                      onChange={checked => handlePrivacyUpdate(item.key, checked)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </div>
        </Card>
      )
    },
    {
      key: 'security',
      label: '账户安全',
      children: (
        <Card>
          <div className="settings-section">
            <Title level={4}>安全设置</Title>
            <List
              dataSource={[
                {
                  key: 'twoFactorAuth',
                  title: '两步验证',
                  description: '为您的账户添加额外的安全保护',
                  action: (
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onChange={checked => handleSecurityUpdate('twoFactorEnabled', checked)}
                    />
                  )
                },
                {
                  key: 'loginNotification',
                  title: '登录通知',
                  description: '新设备登录时通过邮箱通知您',
                  action: (
                    <Switch
                      checked={securitySettings.loginNotification}
                      onChange={checked => handleSecurityUpdate('loginNotification', checked)}
                    />
                  )
                }
              ]}
              renderItem={item => (
                <List.Item actions={[item.action]}>
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />

            <Divider />

            <Title level={4}>登录设备管理</Title>
            <List
              dataSource={loginDevices}
              renderItem={device => (
                <List.Item
                  actions={[
                    device.isCurrent ? (
                      <Tag color="green">当前设备</Tag>
                    ) : (
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveDevice(device.id)}
                      >
                        移除
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    title={`${device.deviceType} - ${device.browser}`}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary">IP: {device.ipAddress}</Text>
                        <Text type="secondary">
                          最后活动: {dayjs(device.lastActivity).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider />

            <Title level={4}>危险操作</Title>
            <div className="danger-zone">
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleAccountDeactivation}
              >
                注销账户
              </Button>
              <Text type="secondary" style={{ marginLeft: 16 }}>
                永久删除您的账户和所有数据
              </Text>
            </div>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="user-settings-page">
      <div className="settings-container">
        <div className="page-header">
          <Title level={2}>账户设置</Title>
          <Text type="secondary">管理您的个人信息和账户安全</Text>
        </div>
        
        <Tabs 
          defaultActiveKey="profile" 
          items={tabItems}
          tabPosition="left"
          className="settings-tabs"
        />
      </div>
    </div>
  );
};

export default UserSettingsPage;
