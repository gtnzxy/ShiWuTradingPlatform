# 拾物 - 前端技术规范文档

## 文档概述
- **项目名称**: 拾物（Shiwu）二手交易平台
- **文档类型**: 前端开发技术规范
- **版本**: v1.0
- **适用范围**: 前端开发团队

## 1. 技术栈规范

### 1.1 核心技术
- **框架**: React 19.x (最新稳定版)
- **构建工具**: Create React App (CRA)
- **UI库**: Ant Design 5.26.5
- **路由**: React Router v6+
- **状态管理**: React Context API + useState/useReducer
- **HTTP客户端**: Axios
- **图标**: Ant Design Icons

### 1.2 开发工具
- **代码编辑器**: VS Code (推荐)
- **版本控制**: Git
- **包管理**: npm (yarn可选)
- **代码格式化**: Prettier
- **代码检查**: ESLint

### 1.3 浏览器支持
- Chrome (最新2个版本)
- Firefox (最新2个版本)
- Safari (最新2个版本)
- Edge (最新2个版本)

## 2. 项目架构规范

### 2.1 文件夹结构
```
src/
├── components/          # 组件库（原子设计模式）
│   ├── atoms/          # 原子组件
│   │   ├── Button/     # 自定义按钮组件
│   │   ├── Input/      # 自定义输入组件
│   │   └── index.js    # 统一导出
│   ├── molecules/      # 分子组件
│   │   ├── SearchBar/  # 搜索栏组件
│   │   ├── ProductCard/ # 商品卡片组件
│   │   └── index.js    # 统一导出
│   ├── organisms/      # 生物体组件
│   │   ├── Navigation/ # 导航栏组件
│   │   ├── ProductList/ # 商品列表组件
│   │   └── index.js    # 统一导出
│   └── templates/      # 模板组件
│       ├── PageLayout/ # 页面布局模板
│       └── index.js    # 统一导出
├── pages/              # 页面组件
│   ├── HomePage/
│   ├── LoginPage/
│   └── index.js        # 统一导出
├── hooks/              # 自定义Hooks
│   ├── useAuth.js      # 认证Hook
│   ├── useApi.js       # API调用Hook
│   └── index.js        # 统一导出
├── services/           # API服务层
│   ├── authService.js  # 认证服务
│   ├── userService.js  # 用户服务
│   └── index.js        # 统一导出
├── context/            # React Context
│   ├── AuthContext.js  # 认证上下文
│   ├── CartContext.js  # 购物车上下文
│   └── index.js        # 统一导出
├── utils/              # 工具函数
│   ├── constants.js    # 常量定义
│   ├── helpers.js      # 辅助函数
│   ├── validators.js   # 验证函数
│   └── index.js        # 统一导出
├── styles/             # 样式文件
│   ├── globals.css     # 全局样式
│   ├── variables.css   # CSS变量
│   └── components/     # 组件样式
├── types/              # 类型定义
│   ├── api.js          # API类型
│   ├── common.js       # 通用类型
│   └── index.js        # 统一导出
└── router/             # 路由配置
    ├── Router.js       # 路由主文件
    ├── routes.js       # 路由定义
    └── ProtectedRoute.js # 路由保护
```

### 2.2 组件设计原则
- **原子设计模式**: 严格按照atoms → molecules → organisms → templates → pages分层
- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 组件设计要考虑复用性
- **Props接口**: 明确定义组件的Props接口

### 2.3 状态管理规范
- **全局状态**: 使用React Context管理（用户信息、购物车等）
- **局部状态**: 使用useState/useReducer管理
- **异步状态**: 使用自定义Hooks封装
- **状态分离**: 不同业务模块的状态分离管理

## 3. 编码规范

### 3.1 命名规范

#### 文件命名
- **组件文件**: PascalCase (例: `ProductCard.js`)
- **Hook文件**: camelCase, use开头 (例: `useAuth.js`)
- **工具文件**: camelCase (例: `helpers.js`)
- **常量文件**: camelCase (例: `constants.js`)

#### 变量命名
```javascript
// 组件名 - PascalCase
const ProductCard = () => {};

// 函数名 - camelCase
const handleSubmit = () => {};

// 变量名 - camelCase
const userInfo = {};

// 常量 - UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// 私有变量 - 下划线开头
const _privateMethod = () => {};

// Boolean变量 - is/has/can开头
const isLoading = false;
const hasPermission = true;
const canEdit = false;
```

#### 组件Props
```javascript
// Props命名 - camelCase
<ProductCard 
  productId={123}
  onAddToCart={handleAddToCart}
  isLoading={false}
/>

// 事件处理函数 - on + 动词
onClick={handleClick}
onSubmit={handleSubmit}
onChange={handleChange}
```

### 3.2 组件编写规范

#### 函数组件结构
```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card } from 'antd';
import PropTypes from 'prop-types';
import './ProductCard.css';

/**
 * 商品卡片组件
 * @param {Object} props - 组件属性
 * @param {number} props.productId - 商品ID
 * @param {Function} props.onAddToCart - 添加到购物车回调
 */
const ProductCard = ({ 
  productId, 
  title, 
  price, 
  image, 
  onAddToCart 
}) => {
  // 状态定义
  const [isLoading, setIsLoading] = useState(false);
  
  // 副作用
  useEffect(() => {
    // 组件挂载后的逻辑
  }, []);
  
  // 事件处理函数
  const handleAddToCart = useCallback(() => {
    setIsLoading(true);
    onAddToCart(productId);
    setIsLoading(false);
  }, [productId, onAddToCart]);
  
  // 渲染函数
  return (
    <Card
      cover={<img src={image} alt={title} />}
      actions={[
        <Button 
          key="add-to-cart"
          onClick={handleAddToCart}
          loading={isLoading}
        >
          加入购物车
        </Button>
      ]}
    >
      <Card.Meta
        title={title}
        description={`¥${price}`}
      />
    </Card>
  );
};

// PropTypes定义
ProductCard.propTypes = {
  productId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  image: PropTypes.string,
  onAddToCart: PropTypes.func.isRequired
};

// 默认props
ProductCard.defaultProps = {
  image: '/default-product.jpg'
};

export default ProductCard;
```

#### Hooks使用规范
```javascript
// 自定义Hook命名必须以use开头
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.data);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    user,
    isLoading,
    login
  };
};

// 使用useCallback优化函数引用
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 使用useMemo优化计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.items);
}, [props.items]);
```

### 3.3 API服务规范

#### 服务文件结构
```javascript
// userService.js
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

// 创建服务类
class UserService {
  /**
   * 获取用户信息
   * @param {number} userId - 用户ID
   * @returns {Promise} API响应
   */
  async getUserInfo(userId) {
    try {
      const response = await axios.get(`${API_ENDPOINTS.USERS}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
  
  /**
   * 更新用户信息
   * @param {number} userId - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise} API响应
   */
  async updateUserInfo(userId, userData) {
    try {
      const response = await axios.put(
        `${API_ENDPOINTS.USERS}/${userId}`, 
        userData
      );
      return response.data;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      throw error;
    }
  }
}

// 导出服务实例
const userService = new UserService();
export default userService;

// 同时导出常量（如果需要）
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned'
};
```

### 3.4 错误处理规范

#### 错误边界组件
```javascript
// ErrorBoundary.js
import React from 'react';
import { Result, Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('错误边界捕获错误:', error, errorInfo);
    // 可以在这里上报错误到监控系统
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="500"
          title="页面出错了"
          subTitle="抱歉，页面发生了意外错误"
          extra={
            <Button 
              type="primary" 
              onClick={() => window.location.reload()}
            >
              刷新页面
            </Button>
          }
        />
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### API错误处理
```javascript
// api错误拦截器
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，跳转到登录页
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      // 服务器错误
      message.error('服务器错误，请稍后重试');
    }
    return Promise.reject(error);
  }
);
```

## 4. 性能优化规范

### 4.1 组件优化
```javascript
// 使用React.memo优化组件渲染
const ProductCard = React.memo(({ product, onAddToCart }) => {
  return (
    <Card>
      {/* 组件内容 */}
    </Card>
  );
});

// 使用useCallback优化函数引用
const handleClick = useCallback(() => {
  onClick(id);
}, [id, onClick]);

// 使用useMemo优化计算
const filteredProducts = useMemo(() => {
  return products.filter(product => product.price < maxPrice);
}, [products, maxPrice]);
```

### 4.2 路由懒加载
```javascript
// Router.js
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

// 懒加载页面组件
const HomePage = lazy(() => import('../pages/HomePage'));
const ProductListPage = lazy(() => import('../pages/ProductListPage'));

const Router = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spin size="large" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
```

### 4.3 图片优化
```javascript
// 图片懒加载组件
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={imgRef} {...props}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{ opacity: isLoaded ? 1 : 0 }}
        />
      )}
    </div>
  );
};
```

## 5. 测试规范

### 5.1 单元测试
```javascript
// ProductCard.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  const mockProps = {
    productId: 123,
    title: '测试商品',
    price: 99.99,
    onAddToCart: jest.fn()
  };
  
  test('应该正确渲染商品信息', () => {
    render(<ProductCard {...mockProps} />);
    
    expect(screen.getByText('测试商品')).toBeInTheDocument();
    expect(screen.getByText('¥99.99')).toBeInTheDocument();
  });
  
  test('点击添加到购物车按钮应该调用回调函数', () => {
    render(<ProductCard {...mockProps} />);
    
    const addButton = screen.getByText('加入购物车');
    fireEvent.click(addButton);
    
    expect(mockProps.onAddToCart).toHaveBeenCalledWith(123);
  });
});
```

### 5.2 集成测试
```javascript
// LoginPage.integration.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as authService from '../services/authService';

jest.mock('../services/authService');

describe('LoginPage Integration', () => {
  test('应该能够完成登录流程', async () => {
    authService.login.mockResolvedValue({
      success: true,
      data: { token: 'mock-token' }
    });
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    // 填写表单
    fireEvent.change(screen.getByLabelText('用户名'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'password123' }
    });
    
    // 提交表单
    fireEvent.click(screen.getByText('登录'));
    
    // 验证API调用
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
  });
});
```

## 6. 代码质量规范

### 6.1 ESLint配置
```json
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "react-hooks/exhaustive-deps": "warn",
    "no-unused-vars": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 6.2 Prettier配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 6.3 代码注释规范
```javascript
/**
 * 计算商品折扣价格
 * @param {number} originalPrice - 原价
 * @param {number} discountRate - 折扣率 (0-1)
 * @returns {number} 折扣后价格
 * @example
 * // 计算8折价格
 * const discountPrice = calculateDiscountPrice(100, 0.8);
 * // 返回 80
 */
const calculateDiscountPrice = (originalPrice, discountRate) => {
  return originalPrice * discountRate;
};

// 单行注释用于解释复杂逻辑
const complexCalculation = () => {
  // 这里使用特殊算法计算商品推荐权重
  const weight = Math.random() * 0.5 + 0.5;
  return weight;
};
```

## 7. Git工作流规范

### 7.1 分支管理
- `main`: 主分支，生产环境代码
- `develop`: 开发分支，测试环境代码
- `feature/*`: 功能分支，开发新功能
- `hotfix/*`: 热修复分支，紧急修复

### 7.2 提交信息规范
```
type(scope): subject

body

footer
```

类型说明：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档修改
- `style`: 代码格式修改
- `refactor`: 代码重构
- `test`: 测试用例修改
- `chore`: 构建或工具修改

示例：
```
feat(auth): 添加用户登录功能

- 实现用户名密码登录
- 添加表单验证
- 集成JWT token管理

Closes #123
```

## 8. 安全规范

### 8.1 XSS防护
```javascript
// 使用dangerouslySetInnerHTML时必须进行HTML转义
import DOMPurify from 'dompurify';

const SafeHtml = ({ htmlContent }) => {
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
```

### 8.2 敏感信息处理
```javascript
// 不在前端存储敏感信息
const UserProfile = ({ user }) => {
  return (
    <div>
      <p>用户名: {user.username}</p>
      {/* 电话号码脱敏显示 */}
      <p>电话: {user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
    </div>
  );
};
```

## 9. 国际化规范

### 9.1 多语言支持
```javascript
// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: {
        translation: {
          'welcome': '欢迎',
          'login': '登录'
        }
      },
      en: {
        translation: {
          'welcome': 'Welcome',
          'login': 'Login'
        }
      }
    },
    lng: 'zh',
    fallbackLng: 'en'
  });

export default i18n;
```

---

**文档维护**: 前端开发团队  
**更新频率**: 随技术栈变更及时更新  
**版本**: v1.0
