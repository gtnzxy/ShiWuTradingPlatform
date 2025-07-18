import React, { useState, useEffect } from 'react';
import { 
  Card, 
  List, 
  Avatar, 
  Badge, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Row, 
  Col, 
  Segmented,
  Checkbox,
  Modal,
  message,
  Empty,
  Spin,
  Tooltip
} from 'antd';
import { 
  BellOutlined, 
  ShoppingOutlined, 
  UserAddOutlined, 
  MessageOutlined,
  DeleteOutlined,
  SettingOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  GiftOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { useNotification } from '../context/NotificationContext';
import { NOTIFICATION_TYPES } from '../services/notificationService';
import './NotificationPage.css';

const { Text, Title } = Typography;

const NotificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    settings,
    filters,
    loading,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    setFilters,
    setPagination
  } = useNotification();

  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // 通知类型选项
  const typeOptions = [
    { label: '全部', value: 'all' },
    { label: '系统', value: NOTIFICATION_TYPES.SYSTEM },
    { label: '订单', value: NOTIFICATION_TYPES.ORDER },
    { label: '商品', value: NOTIFICATION_TYPES.PRODUCT },
    { label: '关注', value: NOTIFICATION_TYPES.FOLLOW },
    { label: '消息', value: NOTIFICATION_TYPES.MESSAGE },
    { label: '促销', value: NOTIFICATION_TYPES.PROMOTION }
  ];

  // 通知图标映射
  const getNotificationIcon = (type) => {
    const iconMap = {
      [NOTIFICATION_TYPES.SYSTEM]: <BellOutlined />,
      [NOTIFICATION_TYPES.ORDER]: <ShoppingOutlined />,
      [NOTIFICATION_TYPES.PRODUCT]: <StarOutlined />,
      [NOTIFICATION_TYPES.FOLLOW]: <UserAddOutlined />,
      [NOTIFICATION_TYPES.MESSAGE]: <MessageOutlined />,
      [NOTIFICATION_TYPES.PROMOTION]: <GiftOutlined />
    };
    return iconMap[type] || <BellOutlined />;
  };

  // 通知颜色映射
  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return '#ff4d4f';
    
    const colorMap = {
      [NOTIFICATION_TYPES.SYSTEM]: '#1890ff',
      [NOTIFICATION_TYPES.ORDER]: '#52c41a',
      [NOTIFICATION_TYPES.PRODUCT]: '#faad14',
      [NOTIFICATION_TYPES.FOLLOW]: '#722ed1',
      [NOTIFICATION_TYPES.MESSAGE]: '#13c2c2',
      [NOTIFICATION_TYPES.PROMOTION]: '#f759ab'
    };
    return colorMap[type] || '#1890ff';
  };

  // 格式化时间
  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diff = now - time;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return time.toLocaleDateString();
  };

  // 处理通知点击
  const handleNotificationClick = async (notification) => {
    // 标记为已读
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // 根据通知类型跳转
    if (notification.data) {
      const { orderId, productId, userId, conversationId } = notification.data;
      
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else if (productId) {
        navigate(`/products/${productId}`);
      } else if (userId) {
        navigate(`/users/${userId}`);
      } else if (conversationId) {
        navigate(`/messages?conversationId=${conversationId}`);
      }
    }
  };

  // 批量操作
  const handleBatchRead = async () => {
    if (selectedNotifications.length === 0) {
      message.warning('请选择要标记的通知');
      return;
    }

    try {
      await Promise.all(
        selectedNotifications.map(id => markAsRead(id))
      );
      setSelectedNotifications([]);
      message.success('已标记为已读');
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleBatchDelete = () => {
    if (selectedNotifications.length === 0) {
      message.warning('请选择要删除的通知');
      return;
    }

    Modal.confirm({
      title: '删除通知',
      content: `确定要删除选中的 ${selectedNotifications.length} 条通知吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await Promise.all(
            selectedNotifications.map(id => deleteNotification(id))
          );
          setSelectedNotifications([]);
          message.success('删除成功');
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 设置更新
  const handleSettingsUpdate = async (newSettings) => {
    try {
      await updateSettings(newSettings);
      setSettingsVisible(false);
    } catch (error) {
      message.error('设置保存失败');
    }
  };

  // 分页变化
  const handlePageChange = (page, pageSize) => {
    setPagination({ page, pageSize });
    fetchNotifications({ page, pageSize });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchNotifications();
  }, [user, navigate, fetchNotifications]);

  if (!user) {
    return (
      <div className="notification-login-prompt">
        <Card style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
          <Empty 
            description="请先登录后查看通知"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/login')}>
              去登录
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div className="notification-page">
      <div className="notification-container">
        {/* 页面标题 */}
        <div className="page-header">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                <BellOutlined style={{ marginRight: 8 }} />
                通知中心
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ marginLeft: 8 }} />
                )}
              </Title>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setSettingsVisible(true)}
                >
                  设置
                </Button>
                {unreadCount > 0 && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={markAllAsRead}
                  >
                    全部已读
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        {/* 筛选器 */}
        <Card className="filter-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={16}>
              <Space size="middle">
                <Text strong>筛选：</Text>
                <Segmented
                  options={typeOptions}
                  value={filters.type}
                  onChange={value => setFilters({ type: value })}
                />
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space>
                <Checkbox
                  checked={filters.unreadOnly}
                  onChange={e => setFilters({ unreadOnly: e.target.checked })}
                >
                  只看未读
                </Checkbox>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 批量操作 */}
        {selectedNotifications.length > 0 && (
          <Card className="batch-actions">
            <Space>
              <Text>已选择 {selectedNotifications.length} 项</Text>
              <Button size="small" onClick={handleBatchRead}>
                标记已读
              </Button>
              <Button size="small" danger onClick={handleBatchDelete}>
                批量删除
              </Button>
              <Button size="small" onClick={() => setSelectedNotifications([])}>
                取消选择
              </Button>
            </Space>
          </Card>
        )}

        {/* 通知列表 */}
        <Card className="notification-list-card">
          <Spin spinning={loading}>
            {notifications.length > 0 ? (
              <List
                dataSource={notifications}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }}
                renderItem={notification => (
                  <List.Item
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    actions={[
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedNotifications(prev => [...prev, notification.id]);
                          } else {
                            setSelectedNotifications(prev => 
                              prev.filter(id => id !== notification.id)
                            );
                          }
                        }}
                      />,
                      !notification.isRead && (
                        <Tooltip title="标记已读">
                          <Button
                            type="text"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={e => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          />
                        </Tooltip>
                      ),
                      <Tooltip title="删除">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={e => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: '删除通知',
                              content: '确定要删除这条通知吗？',
                              okText: '删除',
                              okType: 'danger',
                              cancelText: '取消',
                              onOk: () => deleteNotification(notification.id)
                            });
                          }}
                        />
                      </Tooltip>
                    ]}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!notification.isRead}>
                          <Avatar
                            icon={getNotificationIcon(notification.type)}
                            style={{ 
                              backgroundColor: getNotificationColor(notification.type, notification.priority)
                            }}
                          />
                        </Badge>
                      }
                      title={
                        <div className="notification-title">
                          <Text strong={!notification.isRead}>
                            {notification.title}
                          </Text>
                          {notification.priority === 'high' && (
                            <Tag color="red" icon={<ExclamationCircleOutlined />}>
                              重要
                            </Tag>
                          )}
                          <Text type="secondary" className="notification-time">
                            {formatTime(notification.createTime)}
                          </Text>
                        </div>
                      }
                      description={
                        <Text className={!notification.isRead ? 'unread-content' : ''}>
                          {notification.content}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty 
                description={filters.unreadOnly ? "没有未读通知" : "暂无通知"}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Spin>
        </Card>
      </div>

      {/* 设置弹窗 */}
      <Modal
        title="通知设置"
        open={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        onOk={() => {
          handleSettingsUpdate(settings);
        }}
        width={500}
      >
        <div className="notification-settings">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>接收设置</Text>
              <div style={{ marginTop: 8 }}>
                <Space direction="vertical">
                  <Checkbox
                    checked={settings.enableSystemNotifications}
                    onChange={e => updateSettings({ enableSystemNotifications: e.target.checked })}
                  >
                    系统通知
                  </Checkbox>
                  <Checkbox
                    checked={settings.enableOrderNotifications}
                    onChange={e => updateSettings({ enableOrderNotifications: e.target.checked })}
                  >
                    订单通知
                  </Checkbox>
                  <Checkbox
                    checked={settings.enableProductNotifications}
                    onChange={e => updateSettings({ enableProductNotifications: e.target.checked })}
                  >
                    商品通知
                  </Checkbox>
                  <Checkbox
                    checked={settings.enableFollowNotifications}
                    onChange={e => updateSettings({ enableFollowNotifications: e.target.checked })}
                  >
                    关注通知
                  </Checkbox>
                  <Checkbox
                    checked={settings.enableMessageNotifications}
                    onChange={e => updateSettings({ enableMessageNotifications: e.target.checked })}
                  >
                    消息通知
                  </Checkbox>
                  <Checkbox
                    checked={settings.enablePromotionNotifications}
                    onChange={e => updateSettings({ enablePromotionNotifications: e.target.checked })}
                  >
                    促销通知
                  </Checkbox>
                </Space>
              </div>
            </div>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationPage;
