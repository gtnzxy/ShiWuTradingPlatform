import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Breadcrumb, 
  Empty, 
  Spin, 
  Pagination,
  Space,
  Tag,
  Button,
  message
} from 'antd';
import { HomeOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import ProductGrid from '../components/organisms/ProductGrid/ProductGrid';
import ProductFilter from '../components/organisms/ProductFilter/ProductFilter';
import searchService from '../services/searchService';
import { productService } from '../services/productService';
import './SearchResultPage.css';

const { Title, Text } = Typography;

/**
 * 搜索结果页面组件
 * 显示用户搜索的商品结果，支持筛选和分页
 */
const SearchResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 获取URL参数
  const searchParams = new URLSearchParams(location.search);
  const initialKeyword = searchParams.get('keyword') || '';
  const initialCategory = searchParams.get('category') || '';
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [filters, setFilters] = useState({
    category: initialCategory,
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: '',
    sortBy: 'created_time',
    sortOrder: 'desc'
  });

  // 搜索产品
  const searchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      
      const searchParams = {
        keyword: searchKeyword,
        page: currentPage,
        pageSize,
        ...filters,
        ...params
      };

      // 如果有关键词，使用搜索服务，否则使用产品列表
      let response;
      if (searchKeyword.trim()) {
        response = await searchService.searchProducts(searchParams);
      } else {
        response = await productService.getProducts(searchParams);
      }

      if (response.success) {
        setProducts(response.data.products || []);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.userTip || '搜索失败');
        setProducts([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('搜索商品失败:', error);
      message.error('搜索失败，请稍后重试');
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, currentPage, pageSize, filters]);

  // 初始加载
  useEffect(() => {
    searchProducts();
  }, [searchProducts]);

  // URL参数变化时重新搜索
  useEffect(() => {
    const newKeyword = searchParams.get('keyword') || '';
    const newCategory = searchParams.get('category') || '';
    
    if (newKeyword !== searchKeyword) {
      setSearchKeyword(newKeyword);
    }
    
    if (newCategory !== filters.category) {
      setFilters(prev => ({ ...prev, category: newCategory }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // 处理筛选
  const handleFilter = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // 处理搜索
  const handleSearch = useCallback((keyword, searchFilters = {}) => {
    setSearchKeyword(keyword);
    setFilters(prev => ({ ...prev, ...searchFilters }));
    setCurrentPage(1);
    
    // 更新URL
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (searchFilters.category) params.set('category', searchFilters.category);
    
    navigate(`/search?${params.toString()}`, { replace: true });
  }, [navigate]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchKeyword('');
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: '',
      sortBy: 'created_time',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
    navigate('/search', { replace: true });
  }, [navigate]);

  // 分页处理
  const handlePageChange = useCallback((page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setCurrentPage(1);
    }
  }, [pageSize]);

  // 面包屑导航
  const breadcrumbItems = [
    {
      href: '/home',
      title: <><HomeOutlined /><span>首页</span></>
    },
    {
      title: <><SearchOutlined /><span>搜索结果</span></>
    }
  ];

  return (
    <div className="search-result-page">
      {/* 面包屑导航 */}
      <Breadcrumb 
        items={breadcrumbItems}
        style={{ marginBottom: 16 }}
      />

      {/* 搜索标题和信息 */}
      <div className="search-result-header">
        <Space align="center" wrap>
          <Title level={3} style={{ margin: 0 }}>
            搜索结果
          </Title>
          
          {searchKeyword && (
            <Tag icon={<SearchOutlined />} color="blue" closable={false}>
              "{searchKeyword}"
            </Tag>
          )}
          
          {filters.category && (
            <Tag color="green" closable={false}>
              分类: {filters.category}
            </Tag>
          )}
          
          <Text type="secondary">
            共找到 {total} 件商品
          </Text>
          
          {(searchKeyword || filters.category) && (
            <Button 
              icon={<ClearOutlined />} 
              onClick={clearSearch}
              size="small"
            >
              清除搜索
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* 筛选器 */}
        <Col xs={24} md={6}>
          <ProductFilter
            filters={filters}
            onFilter={handleFilter}
            onSearch={handleSearch}
            loading={loading}
            showSearchBar={true}
            initialKeyword={searchKeyword}
          />
        </Col>

        {/* 商品列表 */}
        <Col xs={24} md={18}>
          <Spin spinning={loading}>
            {products.length > 0 ? (
              <>
                <ProductGrid
                  products={products}
                  loading={loading}
                />
                
                {/* 分页器 */}
                {total > pageSize && (
                  <Row justify="center" style={{ marginTop: 32 }}>
                    <Pagination
                      current={currentPage}
                      total={total}
                      pageSize={pageSize}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) => 
                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                      }
                      onChange={handlePageChange}
                    />
                  </Row>
                )}
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchKeyword ? 
                    `未找到与"${searchKeyword}"相关的商品` : 
                    '暂无商品'
                }
                style={{ marginTop: 64 }}
              >
                <Button 
                  type="primary" 
                  onClick={() => navigate('/products')}
                >
                  浏览所有商品
                </Button>
              </Empty>
            )}
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default SearchResultPage;
