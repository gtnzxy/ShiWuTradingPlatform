import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Layout, 
  List, 
  Avatar, 
  Input, 
  Button, 
  Space, 
  Badge, 
  Empty, 
  Spin, 
  message,
  Modal,
  Divider,
  Card,
  Typography
} from 'antd';
import { 
  SendOutlined, 
  SearchOutlined, 
  DeleteOutlined,
  MoreOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContextNew';
import { useMessage } from '../context/MessageContext';
import MessageBubble from '../components/atoms/MessageBubble';
import './MessageCenterPage.css';

const { Sider, Content } = Layout;
const { Search } = Input;
const { Text } = Typography;

const MessageCenterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markConversationAsRead,
    deleteConversation,
    setCurrentConversation
  } = useMessage();

  const [newMessage, setNewMessage] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 过滤会话列表
  const filterConversations = useCallback(() => {
    if (!searchKeyword) {
      setFilteredConversations(conversations);
      return;
    }
    
    const filtered = conversations.filter(conv => 
      conv.otherUser?.nickname?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      conv.otherUser?.username?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchKeyword, conversations]);

  // 选择会话
  const handleConversationSelect = async (conversation) => {
    setCurrentConversation(conversation);
    
    // 获取消息历史
    if (!messages[conversation.id]) {
      await fetchMessages(conversation.id);
    }
    
    // 标记为已读
    if (conversation.unreadCount > 0) {
      await markConversationAsRead(conversation.id);
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;
    
    try {
      setSendingMessage(true);
      await sendMessage({
        receiverId: currentConversation.otherUser.id,
        content: newMessage.trim(),
        type: 'text'
      });
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      message.error('发送失败');
    } finally {
      setSendingMessage(false);
    }
  };

  // 删除会话
  const handleDeleteConversation = (conversationId, e) => {
    e.stopPropagation();
    
    Modal.confirm({
      title: '删除会话',
      content: '确定要删除这个会话吗？删除后将无法恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteConversation(conversationId);
          if (currentConversation?.id === conversationId) {
            setCurrentConversation(null);
          }
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };

  // 格式化时间
  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const now = new Date();
    const diff = now - time;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return time.toLocaleDateString();
  };

  // 处理键盘事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 初始化
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchConversations();
  }, [user, navigate, fetchConversations]);

  // 搜索关键词变化时过滤会话
  useEffect(() => {
    filterConversations();
  }, [filterConversations]);

  // 消息变化时滚动到底部
  useEffect(() => {
    if (currentConversation && messages[currentConversation.id]) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, currentConversation]);

  // 如果没有登录用户，显示登录提示
  if (!user) {
    return (
      <div className="message-center-login-prompt">
        <Card style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="请先登录后使用消息功能"
          >
            <Button type="primary" onClick={() => navigate('/login')}>
              去登录
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const currentMessages = currentConversation ? messages[currentConversation.id] || [] : [];

  return (
    <div className="message-center-page">
      <Layout className="message-layout">
        {/* 会话列表侧边栏 */}
        <Sider width={320} className="conversation-sider">
          <div className="sider-header">
            <h3>消息中心</h3>
            {unreadCount > 0 && (
              <Badge count={unreadCount} className="unread-badge" />
            )}
          </div>
          
          <div className="search-section">
            <Search
              placeholder="搜索会话..."
              allowClear
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </div>

          <div className="conversation-list">
            <Spin spinning={loading}>
              {filteredConversations.length > 0 ? (
                <List
                  dataSource={filteredConversations}
                  renderItem={conversation => (
                    <List.Item
                      className={`conversation-item ${
                        currentConversation?.id === conversation.id ? 'active' : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge count={conversation.unreadCount} size="small">
                            <Avatar 
                              src={conversation.otherUser?.avatar} 
                              icon={<UserOutlined />}
                              size={48}
                            />
                          </Badge>
                        }
                        title={
                          <div className="conversation-title">
                            <span className="user-name">
                              {conversation.otherUser?.nickname || conversation.otherUser?.username}
                            </span>
                            <span className="time-stamp">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                        }
                        description={
                          <div className="last-message">
                            <Text ellipsis className={conversation.unreadCount > 0 ? 'unread-text' : ''}>
                              {conversation.lastMessage || '暂无消息'}
                            </Text>
                          </div>
                        }
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="delete-btn"
                        onClick={(e) => handleDeleteConversation(conversation.id, e)}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description={searchKeyword ? "没有找到相关会话" : "暂无消息"} 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Spin>
          </div>
        </Sider>

        {/* 消息内容区域 */}
        <Content className="message-content">
          {currentConversation ? (
            <>
              {/* 聊天标题栏 */}
              <div className="chat-header">
                <div className="chat-user-info">
                  <Avatar 
                    src={currentConversation.otherUser?.avatar} 
                    icon={<UserOutlined />}
                    size={32}
                  />
                  <span className="chat-user-name">
                    {currentConversation.otherUser?.nickname || currentConversation.otherUser?.username}
                  </span>
                </div>
                <Button 
                  type="text" 
                  icon={<MoreOutlined />}
                  onClick={() => navigate(`/users/${currentConversation.otherUser?.id}`)}
                >
                  查看资料
                </Button>
              </div>

              <Divider style={{ margin: 0 }} />

              {/* 消息列表 */}
              <div className="messages-container">
                <div className="messages-list">
                  {currentMessages.length > 0 ? (
                    currentMessages.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.senderId === user.id}
                        avatar={msg.senderId === user.id ? user.avatar : currentConversation.otherUser?.avatar}
                      />
                    ))
                  ) : (
                    <div className="no-messages">
                      <Empty 
                        description="开始你们的第一次对话吧！" 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* 输入框 */}
              <div className="message-input-area">
                <Space.Compact style={{ width: '100%' }}>
                  <Input.TextArea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入消息..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    loading={sendingMessage}
                    disabled={!newMessage.trim()}
                  >
                    发送
                  </Button>
                </Space.Compact>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <Empty 
                description="选择一个会话开始聊天" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Content>
      </Layout>
    </div>
  );
};

export default MessageCenterPage;
