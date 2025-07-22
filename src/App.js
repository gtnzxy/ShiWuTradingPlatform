import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from './context/AuthContextNew';
import { CartProvider } from './context/CartContext';
import { MessageProvider } from './context/MessageContext';
import { NotificationProvider } from './context/NotificationContext';
import router from './router';
import './App.css';

// 导入Mock Service Worker（仅在开发环境）
// 注释掉MSW以使用真实的后端API
// if (process.env.NODE_ENV === 'development') {
//   import('./mocks/browser');
// }

// 导入API测试工具（开发环境）
// 暂时禁用测试工具
// if (process.env.NODE_ENV === 'development') {
//   import('./test-api-integration');
// }

function App() {
  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <CartProvider>
          <MessageProvider>
            <NotificationProvider>
              <RouterProvider router={router} />
            </NotificationProvider>
          </MessageProvider>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
