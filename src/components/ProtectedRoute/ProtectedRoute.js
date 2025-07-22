import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../context/AuthContextNew';

/**
 * 路由保护组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {boolean} props.requireAuth - 是否需要认证
 * @param {boolean} props.requireAdmin - 是否需要管理员权限
 * @param {string[]} props.permissions - 需要的权限列表
 * @param {React.ReactNode} props.fallback - 权限不足时显示的组件
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  permissions = [], 
  fallback = null 
}) => {
  const { isAuthenticated, isLoading, user, hasPermission, isAdmin } = useAuth();
  const location = useLocation();

  // 加载中显示
  if (isLoading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 需要认证但未登录
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location }}
        replace 
      />
    );
  }

  // 需要管理员权限但不是管理员
  if (requireAdmin && !isAdmin()) {
    return fallback || (
      <Navigate 
        to="/403" 
        state={{ message: '需要管理员权限' }}
        replace 
      />
    );
  }

  // 检查特定权限
  if (permissions.length > 0) {
    const hasRequiredPermissions = permissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermissions) {
      return fallback || (
        <Navigate 
          to="/403" 
          state={{ message: '权限不足' }}
          replace 
        />
      );
    }
  }

  // 检查用户状态
  if (user?.status === 'BANNED') {
    return (
      <Navigate 
        to="/banned" 
        state={{ message: '账号已被封禁' }}
        replace 
      />
    );
  }

  // 权限验证通过，渲染子组件
  return children;
};



/**
 * 管理员路由组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {React.ReactNode} props.fallback - 权限不足时显示的组件
 */
export const AdminRoute = ({ children, fallback }) => {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      requireAdmin={true} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * 权限路由组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {string[]} props.permissions - 需要的权限列表
 * @param {React.ReactNode} props.fallback - 权限不足时显示的组件
 */
export const PermissionRoute = ({ children, permissions, fallback }) => {
  return (
    <ProtectedRoute 
      requireAuth={true} 
      permissions={permissions} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

/**
 * 公共路由组件 - 已登录用户不能访问（如登录、注册页面）
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // 正在加载时显示加载状态
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 已登录用户重定向到首页
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // 未登录用户可以访问
  return children;
};

export default ProtectedRoute;
