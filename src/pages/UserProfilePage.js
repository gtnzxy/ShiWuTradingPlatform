import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Avatar, 
  Button, 
  Tabs, 
  List, 
  Rate, 
  Tag, 
  Statistic, 
  Row, 
  Col, 
  Space, 
  message, 
  Modal,
  Spin,
  Empty,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  HeartOutlined, 
  HeartFilled, 
  MessageOutlined,
  ShopOutlined,
  StarOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { userService } from '../services/userService';
import followService from '../services/followService';
import { productService } from '../services/productService';
import ProductCard from '../components/molecules/ProductCard/ProductCard';
import './UserProfilePage.css';

const { TabPane } = Tabs;

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const isOwnProfile = !userId || (currentUser && parseInt(userId) === currentUser.id);

  // 获取用户资料
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profileData = isOwnProfile 
        ? await userService.getProfile()
        : await userService.getPublicProfile(userId);
      setUserProfile(profileData.data || profileData); // 处理不同的数据结构

      const statsData = await userService.getUserStats(userId);
      setUserStats(statsData.data || statsData); // 处理不同的数据结构

      if (!isOwnProfile && currentUser) {
        const followStatus = await followService.checkFollowStatus(userId);
        setIsFollowing(followStatus.isFollowing);
      }
    } catch (error) {
      message.error('获取用户信息失败');
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户商品
  const fetchUserProducts = async () => {
    try {
      setProductsLoading(true);
      const data = await productService.getUserProducts(userId || currentUser?.id, {
        page: 1,
        pageSize: 12,
        status: 'active'
      });
      setUserProducts(data.data || []); // 使用data.data，如果没有则设为空数组
    } catch (error) {
      console.error('Error fetching user products:', error);
      message.error('获取商品列表失败');
      setUserProducts([]); // 确保在错误时设置为空数组
    } finally {
      setProductsLoading(false);
    }
  };

  // 获取用户评价
  const fetchUserReviews = async () => {
    try {
      setReviewsLoading(true);
      // 这里应该调用评价相关的API
      // const data = await reviewService.getUserReviews(userId || currentUser?.id);
      // setUserReviews(data.items);
      
      // 临时数据
      setUserReviews([]);
    } catch (error) {
      message.error('获取评价列表失败');
    } finally {
      setReviewsLoading(false);
    }
  };

  // 关注/取消关注
  const handleFollow = async () => {
    if (!currentUser) {
      Modal.confirm({
        title: '需要登录',
        content: '请先登录后再进行关注操作',
        onOk: () => navigate('/login')
      });
      return;
    }

    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        setUserStats(prev => prev ? { ...prev, followersCount: prev.followersCount - 1 } : null);
        message.success('已取消关注');
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        setUserStats(prev => prev ? { ...prev, followersCount: prev.followersCount + 1 } : null);
        message.success('关注成功');
      }
    } catch (error) {
      message.error(isFollowing ? '取消关注失败' : '关注失败');
    }
  };

  // 发送私信
  const handleSendMessage = () => {
    if (!currentUser) {
      Modal.confirm({
        title: '需要登录',
        content: '请先登录后再发送私信',
        onOk: () => navigate('/login')
      });
      return;
    }
    navigate(`/messages?userId=${userId}`);
  };

  // Tab切换处理
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'products' && (!userProducts || userProducts.length === 0)) {
      fetchUserProducts();
    } else if (key === 'reviews' && (!userReviews || userReviews.length === 0)) {
      fetchUserReviews();
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserProducts(); // 默认加载商品数据
  }, [userId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <Empty 
        description="用户不存在"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="user-profile-page">
      <Card className="profile-header">
        <Row gutter={24}>
          <Col xs={24} sm={8} md={6}>
            <div className="avatar-section">
              <Avatar 
                size={120} 
                src={userProfile.avatar} 
                icon={<UserOutlined />}
              />
              {userProfile.verified && (
                <Tag color="blue" className="verified-tag">
                  <StarOutlined /> 已认证
                </Tag>
              )}
            </div>
          </Col>
          
          <Col xs={24} sm={16} md={18}>
            <div className="profile-info">
              <div className="user-basic">
                <h2 className="username">{userProfile.nickname || userProfile.username}</h2>
                {userProfile.bio && (
                  <p className="bio">{userProfile.bio}</p>
                )}
                
                <Space size="large" className="user-meta">
                  {userProfile.location && (
                    <span>
                      <EnvironmentOutlined /> {userProfile.location}
                    </span>
                  )}
                  {userProfile.joinDate && (
                    <span>
                      <CalendarOutlined /> {new Date(userProfile.joinDate).getFullYear()}年加入
                    </span>
                  )}
                </Space>
              </div>

              <Row gutter={16} className="stats-row">
                <Col span={6}>
                  <Statistic 
                    title="商品数量" 
                    value={userStats?.productCount || 0} 
                    prefix={<ShopOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="关注" 
                    value={userStats?.followingCount || 0} 
                  />
                </Col>
                <Col span={6}>
                  <Statistic 
                    title="粉丝" 
                    value={userStats?.followersCount || 0} 
                  />
                </Col>
                <Col span={6}>
                  <div className="rating-stat">
                    <div className="stat-title">信用评分</div>
                    <div className="stat-value">
                      <Rate disabled defaultValue={userProfile.rating || 5} />
                      <span className="rating-text">({userProfile.rating || 5.0})</span>
                    </div>
                  </div>
                </Col>
              </Row>

              {!isOwnProfile && currentUser && (
                <Space className="action-buttons">
                  <Button 
                    type={isFollowing ? "default" : "primary"}
                    icon={isFollowing ? <HeartFilled /> : <HeartOutlined />}
                    onClick={handleFollow}
                  >
                    {isFollowing ? '已关注' : '关注'}
                  </Button>
                  <Button 
                    icon={<MessageOutlined />}
                    onClick={handleSendMessage}
                  >
                    私信
                  </Button>
                </Space>
              )}

              {isOwnProfile && (
                <Button 
                  type="primary"
                  onClick={() => navigate('/settings')}
                >
                  编辑资料
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="profile-content">
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={[
            {
              key: 'products',
              label: `商品 (${userStats?.productCount || 0})`,
              children: (
                <Spin spinning={productsLoading}>
                  {(userProducts && userProducts.length > 0) ? (
                    <Row gutter={[16, 16]}>
                      {userProducts.map(product => (
                        <Col xs={12} sm={8} md={6} lg={4} key={product.id}>
                          <ProductCard 
                            product={product}
                            onClick={() => navigate(`/products/${product.id}`)}
                          />
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Empty description="暂无商品" />
                  )}
                </Spin>
              )
            },
            {
              key: 'reviews',
              label: '评价',
              children: (
                <Spin spinning={reviewsLoading}>
                  {(userReviews && userReviews.length > 0) ? (
                    <List
                      dataSource={userReviews}
                      renderItem={review => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar src={review.reviewer?.avatar} />}
                            title={review.reviewer?.nickname}
                            description={
                              <div>
                                <Rate disabled defaultValue={review.rating} />
                                <p>{review.content}</p>
                                <span className="review-time">{review.createTime}</span>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="暂无评价" />
                  )}
                </Spin>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default UserProfilePage;
