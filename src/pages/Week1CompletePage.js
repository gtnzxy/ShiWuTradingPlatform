import React from 'react';
import { Card, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

/**
 * 第一周开发完成展示页面
 */
const Week1CompletePage = () => {
  const completedFeatures = [
    {
      title: '项目基础搭建',
      items: [
        '✅ React + Ant Design 项目架构',
        '✅ 原子设计模式组件结构',
        '✅ React Router 路由配置',
        '✅ Create React App 构建工具'
      ]
    },
    {
      title: '核心原子组件',
      items: [
        '✅ Button - 按钮组件',
        '✅ Input - 输入框组件',
        '✅ Loading - 加载指示器',
        '✅ Avatar - 头像组件',
        '✅ Logo - 网站Logo',
        '✅ Badge - 徽章组件'
      ]
    },
    {
      title: '布局模板',
      items: [
        '✅ MainLayout - 主要布局模板',
        '✅ AuthLayout - 认证页面布局',
        '✅ 响应式设计支持'
      ]
    },
    {
      title: '路由系统',
      items: [
        '✅ 14个页面路由配置',
        '✅ 嵌套路由结构',
        '✅ 路由保护机制'
      ]
    },
    {
      title: 'Mock API系统',
      items: [
        '✅ Mock Service Worker 配置',
        '✅ 认证API模拟',
        '✅ 商品API模拟',
        '✅ 用户API模拟'
      ]
    },
    {
      title: '状态管理',
      items: [
        '✅ React Context 认证状态',
        '✅ 本地存储集成',
        '✅ 错误处理机制'
      ]
    },
    {
      title: '基础页面',
      items: [
        '✅ 首页展示页面',
        '✅ 登录页面',
        '✅ 注册页面',
        '✅ 404页面'
      ]
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <CheckCircleOutlined 
            style={{ 
              fontSize: '48px', 
              color: '#52c41a',
              marginBottom: '16px'
            }} 
          />
          <Title level={1}>🎉 第一周开发完成！</Title>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            拾物 - 第一周里程碑达成
          </Paragraph>
        </div>

        <Divider />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {completedFeatures.map((feature, index) => (
            <Card 
              key={index}
              size="small"
              title={
                <Text strong style={{ color: '#1890ff' }}>
                  {feature.title}
                </Text>
              }
              style={{ backgroundColor: '#fafafa' }}
            >
              <Space direction="vertical" size="small">
                {feature.items.map((item, itemIndex) => (
                  <Text key={itemIndex} style={{ display: 'block' }}>
                    {item}
                  </Text>
                ))}
              </Space>
            </Card>
          ))}
        </Space>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Title level={3}>🚀 下周计划</Title>
          <Paragraph>
            第二周将重点开发用户认证与管理功能，包括：
          </Paragraph>
          <ul style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
            <li>完善登录注册功能</li>
            <li>用户个人主页开发</li>
            <li>权限路由守卫</li>
            <li>用户状态管理</li>
            <li>表单验证优化</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Week1CompletePage;
