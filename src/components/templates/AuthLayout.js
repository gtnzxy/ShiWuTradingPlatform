import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Card } from 'antd';
import Logo from '../atoms/Logo';

const { Content } = Layout;

/**
 * 认证页面布局组件
 * 用于登录和注册页面的布局
 * @returns {React.ReactElement} AuthLayout组件
 */
const AuthLayout = () => {
  return (
    <Layout style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Content style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px'
      }}>
        <Card
          style={{ 
            width: '100%',
            maxWidth: '400px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
          bodyStyle={{ padding: '40px' }}
        >
          {/* Logo区域 */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '32px'
          }}>
            <Logo size="large" />
            <div style={{ 
              marginTop: '8px',
              color: '#666',
              fontSize: '14px'
            }}>
              欢迎来到校园二手交易平台
            </div>
          </div>

          {/* 认证表单内容 */}
          <Outlet />

          {/* 底部版权信息 */}
          <div style={{ 
            textAlign: 'center',
            marginTop: '24px',
            color: '#999',
            fontSize: '12px'
          }}>
            © 2025 校园二手交易平台. All rights reserved.
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
