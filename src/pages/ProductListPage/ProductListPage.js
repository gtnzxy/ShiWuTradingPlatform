import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout, message, FloatButton } from 'antd';
import { PlusOutlined, ArrowUpOutlined } from '@ant-design/icons';
import ProductFilter from '../../components/organisms/ProductFilter/ProductFilter';
import ProductGrid from '../../components/organisms/ProductGrid/ProductGrid';
import { productService } from '../../services/productService';
import { useAuth } from '../../hooks/useAuth';
import './ProductListPage.css';

const { Content } = Layout;

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    categoryId: searchParams.get('categoryId') || null,
    minPrice: searchParams.get('minPrice') || null,
    maxPrice: searchParams.get('maxPrice') || null,
    status: searchParams.get('status') || 'on_sale',
    location: searchParams.get('location') || null,
    sortBy: searchParams.get('sortBy') || 'create_time',
    sortDirection: searchParams.get('sortDirection') || 'desc'
  });

  // 从URL参数初始化分页
  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    const pageSize = parseInt(searchParams.get('page_size')) || 20;
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }));
  }, [searchParams]);

  // 加载产品数据
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadProducts = useCallback(async (params = {}) => {
    console.log('📦 ProductListPage开始加载商品数据...');
    console.log('🔧 传入参数:', params);
    console.log('🔧 当前filters:', filters);
    console.log('📄 当前分页:', pagination);

    setLoading(true);
    try {
      const searchFilters = { ...filters, ...params };
      console.log('🔍 合并后的搜索条件:', searchFilters);

      // 清理空值，但保留keyword即使为空字符串
      const cleanFilters = Object.entries(searchFilters).reduce((acc, [key, value]) => {
        if (key === 'keyword') {
          // keyword即使为空字符串也要保留，用于清空搜索
          acc[key] = value || '';
        } else if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('✨ 清理后的搜索条件:', cleanFilters);

      const finalParams = {
        ...cleanFilters,
        page: pagination.current,
        page_size: pagination.pageSize
      };

      console.log('📋 最终API请求参数:', finalParams);

      const response = await productService.searchProducts(finalParams);
      console.log('📦 商品搜索API响应:', response);

      if (response.success) {
        const products = response.data.products || [];
        console.log('✅ 获取到商品数据:', products.length, '个商品');

        setProducts(products);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      } else {
        console.error('❌ 商品搜索失败:', response.message);
        message.error(response.message || '加载商品失败');
      }
    } catch (error) {
      console.error('❌ 加载商品失败:', error);
      message.error('加载商品失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]); // 修复依赖

  // 初始加载
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 更新URL参数
  const updateSearchParams = useCallback((newParams) => {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...newParams }).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });

    // 添加分页参数
    if (pagination.current > 1) {
      params.set('page', pagination.current.toString());
    }
    if (pagination.pageSize !== 20) {
      params.set('page_size', pagination.pageSize.toString());
    }

    setSearchParams(params);
  }, [filters, pagination, setSearchParams]);

  // 处理搜索
  const handleSearch = useCallback((searchParams) => {
    console.log('🔍 ProductListPage处理搜索请求:', searchParams);

    const newFilters = { ...filters, ...searchParams };
    setFilters(newFilters);

    // 重置到第一页
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);

    // 更新URL参数
    updateSearchParams({ ...newFilters, page: 1 });

    // 重新加载商品数据，传递完整的筛选条件
    loadProducts(newFilters);
  }, [filters, pagination, updateSearchParams, loadProducts]);

  // 处理筛选变化
  const handleFilterChange = useCallback((newFilters) => {
    console.log('🔧 ProductListPage处理筛选变化:', newFilters);

    setFilters(newFilters);

    // 重置到第一页
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);

    // 更新URL参数
    updateSearchParams({ ...newFilters, page: 1 });

    // 重新加载商品数据
    loadProducts(newFilters);
  }, [pagination, updateSearchParams, loadProducts]);

  // 处理分页变化
  const handlePageChange = useCallback((page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }));
    updateSearchParams({ page, page_size: pageSize });
  }, [updateSearchParams]);

  // 处理商品点击
  const handleProductClick = useCallback((product) => {
    navigate(`/products/${product.id}`);
  }, [navigate]);

  // 处理收藏
  const handleFavoriteClick = useCallback(async (product) => {
    if (!user) {
      message.info('请先登录');
      navigate('/auth/login');
      return;
    }

    try {
      if (product.is_favorited) {
        await productService.unfavoriteProduct(product.id);
        message.success('已取消收藏');
      } else {
        await productService.favoriteProduct(product.id);
        message.success('收藏成功');
      }
      
      // 更新产品状态
      setProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, is_favorited: !p.is_favorited }
          : p
      ));
    } catch (error) {
      console.error('收藏操作失败:', error);
      message.error('操作失败，请重试');
    }
  }, [user, navigate]);

  // 处理加入购物车
  const handleAddToCart = useCallback(async (product) => {
    if (!user) {
      message.info('请先登录');
      navigate('/auth/login');
      return;
    }

    try {
      // 这里应该调用购物车服务，暂时使用本地存储模拟
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find(item => item.product_id === product.id);
      
      if (existingItem) {
        message.info('商品已在购物车中');
      } else {
        cart.push({
          product_id: product.id,
          product_title: product.title,
          product_price: product.price,
          product_image: product.images[0],
          quantity: 1
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        message.success('已加入购物车');
      }
    } catch (error) {
      console.error('加入购物车失败:', error);
      message.error('加入购物车失败，请重试');
    }
  }, [user, navigate]);

  // 跳转到发布商品页面
  const handlePublishProduct = () => {
    if (!user) {
      message.info('请先登录');
      navigate('/auth/login');
      return;
    }
    navigate('/products/publish');
  };

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Layout className="product-list-page">
      <Content className="product-list-page__content">
        <div className="product-list-page__container">
          {/* 搜索和筛选 */}
          <ProductFilter
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            loading={loading}
            className="product-list-page__filter"
          />

          {/* 产品网格 */}
          <ProductGrid
            products={products}
            loading={loading}
            cardSize="default"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50', '100']
            }}
            onPageChange={handlePageChange}
            onProductClick={handleProductClick}
            onFavoriteClick={handleFavoriteClick}
            onAddToCart={handleAddToCart}
            emptyText="暂无符合条件的商品"
            className="product-list-page__grid"
          />
        </div>

        {/* 悬浮按钮 */}
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ right: 24 }}
          icon={<PlusOutlined />}
          tooltip="快速操作"
        >
          <FloatButton
            icon={<PlusOutlined />}
            tooltip="发布商品"
            onClick={handlePublishProduct}
          />
          <FloatButton
            icon={<ArrowUpOutlined />}
            tooltip="回到顶部"
            onClick={scrollToTop}
          />
        </FloatButton.Group>
      </Content>
    </Layout>
  );
};

export default ProductListPage;
