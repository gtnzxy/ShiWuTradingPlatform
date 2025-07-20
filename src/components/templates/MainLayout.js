import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Dropdown, Space, Avatar, Button } from 'antd';
import {
  HomeOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import Logo from '../atoms/Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContextNew';
import { useMessage } from '../../context/MessageContext';
import { useNotification } from '../../context/NotificationContext';

const { Header, Content, Footer } = Layout;

/**
 * 主布局组件
 * 包含顶部导航、主要内容区域和底部信息
 * @returns {React.ReactElement} MainLayout组件
 */
const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { logout, isAuthenticated, user } = useAuth();
  const { unreadCount: messageUnreadCount } = useMessage();
  const { unreadCount: notificationUnreadCount } = useNotification();

  // 顶部导航菜单项
  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: '商品'
    },
    {
      key: '/publish',
      icon: <PlusOutlined />,
      label: '发布'
    },
    {
      key: '/my-products',
      icon: <UnorderedListOutlined />,
      label: '我的商品'
    },
    {
      key: '/orders',
      icon: <UnorderedListOutlined />,
      label: '我的订单'
    }
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人主页',
      onClick: () => navigate('/profile/1') // 假设当前用户ID为1
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: async () => {
        try {
          await logout();
          navigate('/auth/login');
        } catch (error) {
          console.error('退出登录失败:', error);
        }
      }
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const currentPath = location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px'
      }}>
        {/* Logo */}
        <div style={{ marginRight: '24px' }}>
          <Logo size="medium" />
        </div>

        {/* 主导航菜单 */}
        <Menu
          mode="horizontal"
          selectedKeys={[currentPath]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            flex: 1, 
            border: 'none',
            background: 'transparent'
          }}
        />

        {/* 右侧功能区 */}
        <Space size="large">
          {/* 购物车 */}
          <Badge count={totalItems} size="small">
            <ShoppingCartOutlined 
              style={{ fontSize: '18px', cursor: 'pointer' }}
              onClick={() => navigate('/cart')}
            />
          </Badge>

          {/* 消息 */}
          <Badge count={messageUnreadCount} size="small">
            <MessageOutlined
              style={{ fontSize: '18px', cursor: 'pointer' }}
              onClick={() => navigate('/messages')}
            />
          </Badge>

          {/* 通知 */}
          <Badge count={notificationUnreadCount} size="small">
            <BellOutlined
              style={{ fontSize: '18px', cursor: 'pointer' }}
              onClick={() => navigate('/notifications')}
            />
          </Badge>

          {/* 用户头像和菜单 */}
          {isAuthenticated ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div style={{ cursor: 'pointer' }}>
                <Avatar
                  size="small"
                  src={user?.avatar}
                  icon={<UserOutlined />}
                />
                <span style={{ marginLeft: '8px', color: '#333' }}>
                  {user?.nickname || user?.username}
                </span>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Button
                type="link"
                onClick={() => navigate('/auth/login')}
              >
                登录
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => navigate('/auth/register')}
              >
                注册
              </Button>
            </Space>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <div style={{ 
          background: '#fff', 
          minHeight: '100%',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f5f5f5' }}>
        拾物 ©2025 Created by Shiwu Team
      </Footer>
    </Layout>
  );
};

export default MainLayout;
