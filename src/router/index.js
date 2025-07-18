import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout components
import MainLayout from '../components/templates/MainLayout';
import AuthLayout from '../components/templates/AuthLayout';

// Auth pages
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

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
        element: <PublishProductPage />
      },
      {
        path: 'my-products',
        element: <MyProductsPage />
      },
      {
        path: 'cart',
        element: <CartPage />
      },
      {
        path: 'checkout',
        element: <CheckoutPage />
      },
      {
        path: 'payment',
        element: <PaymentPage />
      },
      {
        path: 'orders',
        element: <OrderListPage />
      },
      {
        path: 'orders/:id',
        element: <OrderDetailPage />
      },
      {
        path: 'orders/:orderId/review',
        element: <OrderReviewPage />
      },
      {
        path: 'orders/:orderId/return',
        element: <ReturnRequestPage />
      },
      {
        path: 'profile/:id',
        element: <UserProfilePage />
      },
      {
        path: 'settings',
        element: <UserSettingsPage />
      },
      {
        path: 'addresses',
        element: <AddressManagePage />
      },
      {
        path: 'following',
        element: <FollowingPage />
      },
      {
        path: 'followers',
        element: <FollowersPage />
      },
      {
        path: 'messages',
        element: <MessageCenterPage />
      },
      {
        path: 'notifications',
        element: <NotificationPage />
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
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
