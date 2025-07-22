import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout components
import MainLayout from '../components/templates/MainLayout';
import AuthLayout from '../components/templates/AuthLayout';

// Route protection components
import ProtectedRoute, { PublicRoute } from '../components/ProtectedRoute/ProtectedRoute';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Main pages
import HomePage from '../pages/HomePage';
import ProductListPage from '../pages/ProductListPage/ProductListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import PublishProductPage from '../pages/PublishProductPage';
import MyProductsPage from '../pages/MyProductsPage';
import CartPage from '../pages/CartPage/CartPage';
import CheckoutPage from '../pages/CheckoutPage/CheckoutPage';
import PaymentPage from '../pages/PaymentPage/PaymentPage';
import OrderListPage from '../pages/OrderListPage/OrderListPage';
import OrderDetailPage from '../pages/OrderDetailPage/OrderDetailPage';
import OrderReviewPage from '../pages/OrderReviewPage/OrderReviewPage';
import ReturnRequestPage from '../pages/ReturnRequestPage/ReturnRequestPage';
import UserProfilePage from '../pages/UserProfilePage';
import UserSettingsPage from '../pages/UserSettingsPage';
import MessageCenterPage from '../pages/MessageCenterPage';
import NotificationPage from '../pages/NotificationPage';

// New pages
import SearchResultPage from '../pages/SearchResultPage';
import AddressManagePage from '../pages/AddressManagePage';
import FollowingPage from '../pages/FollowingPage';
import FollowersPage from '../pages/FollowersPage';

// Error page
import NotFoundPage from '../pages/NotFoundPage';

// Debug pages (development only)
import AuthDebug from '../pages/debug/AuthDebug';
import PasswordTest from '../pages/debug/PasswordTest';
import MessageNotificationTest from '../pages/debug/MessageNotificationTest';
import UserFunctionTest from '../pages/debug/UserFunctionTest';

// Create router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: 'home',
        element: <HomePage />
      },
      {
        path: 'products',
        element: <ProductListPage />
      },
      {
        path: 'search',
        element: <SearchResultPage />
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />
      },
      {
        path: 'publish',
        element: (
          <ProtectedRoute>
            <PublishProductPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'my-products',
        element: (
          <ProtectedRoute>
            <MyProductsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'payment',
        element: (
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrderListPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'orders/:orderId/review',
        element: (
          <ProtectedRoute>
            <OrderReviewPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'orders/:orderId/return',
        element: (
          <ProtectedRoute>
            <ReturnRequestPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile/:id',
        element: <UserProfilePage />
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <UserSettingsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'addresses',
        element: (
          <ProtectedRoute>
            <AddressManagePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'following',
        element: (
          <ProtectedRoute>
            <FollowingPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'followers',
        element: (
          <ProtectedRoute>
            <FollowersPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <MessageCenterPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <NotificationPage />
          </ProtectedRoute>
        )
      },
      // Debug routes (development only)
      {
        path: 'debug/auth',
        element: <AuthDebug />
      },
      {
        path: 'debug/password',
        element: <PasswordTest />
      },
      {
        path: 'debug/message-notification',
        element: <MessageNotificationTest />
      },
      {
        path: 'debug/user-function',
        element: <UserFunctionTest />
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        )
      },
      {
        path: 'register',
        element: (
          <PublicRoute>
            <Register />
          </PublicRoute>
        )
      }
    ]
  },
  // 便捷路由重定向
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: '/register',
    element: <Navigate to="/auth/register" replace />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

export default router;
