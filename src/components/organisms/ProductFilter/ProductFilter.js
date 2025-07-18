import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Slider,
  Button,
  Space,
  Row,
  Col,
  Card,
  Tag,
  Divider,
  Collapse
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { categoryService } from '../../../services/categoryService';
import { PRODUCT_STATUS, PRODUCT_STATUS_LABELS, ITEM_CONDITIONS, ITEM_CONDITIONS_LABELS } from '../../../utils/constants';
import './ProductFilter.css';

const { Option } = Select;
const { Panel } = Collapse;

const ProductFilter = ({
  onSearch,
  onFilterChange,
  initialFilters = {},
  loading = false,
  className = ''
}) => {
  const [searchKeyword, setSearchKeyword] = useState(initialFilters.keyword || '');
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category_id: null,
    min_price: null,
    max_price: null,
    condition: null,
    status: 'available',
    location: null,
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialFilters
  });
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 价格范围选项
  const priceRangeOptions = [
    { label: '不限', value: [0, 10000] },
    { label: '￥0 - ￥50', value: [0, 50] },
    { label: '￥50 - ￥100', value: [50, 100] },
    { label: '￥100 - ￥200', value: [100, 200] },
    { label: '￥200 - ￥500', value: [200, 500] },
    { label: '￥500 - ￥1000', value: [500, 1000] },
    { label: '￥1000以上', value: [1000, 10000] }
  ];

  // 排序选项
  const sortOptions = [
    { label: '最新发布', value: 'created_at_desc' },
    { label: '价格从低到高', value: 'price_asc' },
    { label: '价格从高到低', value: 'price_desc' },
    { label: '最多收藏', value: 'favorites_desc' },
    { label: '最多浏览', value: 'views_desc' }
  ];

  // 商品状态选项
  const statusOptions = Object.entries(PRODUCT_STATUS).map(([key, value]) => ({
    label: PRODUCT_STATUS_LABELS[value],
    value: key.toLowerCase()
  }));

  // 商品状况选项
  const conditionOptions = Object.entries(ITEM_CONDITIONS).map(([key, value]) => ({
    label: ITEM_CONDITIONS_LABELS[value],
    value: key.toLowerCase()
  }));

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // 同步价格范围到filters
    if (filters.min_price !== null || filters.max_price !== null) {
      setPriceRange([
        filters.min_price || 0,
        filters.max_price || 1000
      ]);
    }
  }, [filters.min_price, filters.max_price]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSearch = () => {
    const searchParams = {
      keyword: searchKeyword.trim(),
      ...filters
    };
    onSearch?.(searchParams);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    const newFilters = {
      ...filters,
      min_price: range[0] > 0 ? range[0] : null,
      max_price: range[1] < 10000 ? range[1] : null
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleQuickPriceSelect = (range) => {
    handlePriceRangeChange(range);
  };

  const handleSortChange = (value) => {
    const [sort_by, sort_order] = value.split('_');
    const newFilters = {
      ...filters,
      sort_by: sort_by === 'created' ? 'created_at' : sort_by,
      sort_order: sort_order
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category_id: null,
      min_price: null,
      max_price: null,
      condition: null,
      status: 'available',
      location: null,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    setFilters(defaultFilters);
    setPriceRange([0, 1000]);
    setSearchKeyword('');
    onFilterChange?.(defaultFilters);
    onSearch?.({ keyword: '', ...defaultFilters });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category_id) count++;
    if (filters.min_price !== null || filters.max_price !== null) count++;
    if (filters.condition) count++;
    if (filters.location) count++;
    if (searchKeyword.trim()) count++;
    return count;
  };

  return (
    <Card className={`product-filter ${className}`} bodyStyle={{ padding: '16px' }}>
      {/* 搜索栏 */}
      <div className="product-filter__search">
        <Input.Search
          placeholder="搜索商品名称、描述..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
          size="large"
          loading={loading}
        />
      </div>

      {/* 快速筛选标签 */}
      <div className="product-filter__quick-filters">
        <Space wrap>
          <span className="product-filter__label">快速筛选:</span>
          {priceRangeOptions.slice(1, 4).map((option) => (
            <Tag.CheckableTag
              key={option.label}
              checked={
                priceRange[0] === option.value[0] && 
                priceRange[1] === option.value[1]
              }
              onChange={() => handleQuickPriceSelect(option.value)}
            >
              {option.label}
            </Tag.CheckableTag>
          ))}
        </Space>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 详细筛选 */}
      <Collapse ghost>
        <Panel 
          header={
            <Space>
              <FilterOutlined />
              详细筛选
              {getActiveFilterCount() > 0 && (
                <Tag color="blue">{getActiveFilterCount()}</Tag>
              )}
            </Space>
          }
          key="filters"
        >
          <Row gutter={[16, 16]}>
            {/* 分类筛选 */}
            <Col xs={24} sm={12} md={6}>
              <div className="product-filter__item">
                <label>商品分类</label>
                <Select
                  placeholder="选择分类"
                  value={filters.category_id}
                  onChange={(value) => handleFilterChange('category_id', value)}
                  allowClear
                  loading={categoriesLoading}
                  style={{ width: '100%' }}
                >
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            {/* 商品状况 */}
            <Col xs={24} sm={12} md={6}>
              <div className="product-filter__item">
                <label>商品状况</label>
                <Select
                  placeholder="选择状况"
                  value={filters.condition}
                  onChange={(value) => handleFilterChange('condition', value)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {conditionOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            {/* 商品状态 */}
            <Col xs={24} sm={12} md={6}>
              <div className="product-filter__item">
                <label>商品状态</label>
                <Select
                  value={filters.status}
                  onChange={(value) => handleFilterChange('status', value)}
                  style={{ width: '100%' }}
                >
                  {statusOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            {/* 排序方式 */}
            <Col xs={24} sm={12} md={6}>
              <div className="product-filter__item">
                <label>排序方式</label>
                <Select
                  value={`${filters.sort_by}_${filters.sort_order}`}
                  onChange={handleSortChange}
                  style={{ width: '100%' }}
                >
                  {sortOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            {/* 价格范围 */}
            <Col xs={24} md={12}>
              <div className="product-filter__item">
                <label>价格范围: ￥{priceRange[0]} - ￥{priceRange[1]}</label>
                <Slider
                  range
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  marks={{
                    0: '￥0',
                    200: '￥200',
                    500: '￥500',
                    1000: '￥1000+'
                  }}
                />
              </div>
            </Col>

            {/* 位置筛选 */}
            <Col xs={24} md={12}>
              <div className="product-filter__item">
                <label>
                  <EnvironmentOutlined /> 交易地点
                </label>
                <Input
                  placeholder="输入地点"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  allowClear
                />
              </div>
            </Col>
          </Row>

          {/* 操作按钮 */}
          <div className="product-filter__actions">
            <Space>
              <Button onClick={clearFilters} icon={<ClearOutlined />}>
                清空筛选
              </Button>
              <Button type="primary" onClick={handleSearch} loading={loading}>
                应用筛选
              </Button>
            </Space>
          </div>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default ProductFilter;
