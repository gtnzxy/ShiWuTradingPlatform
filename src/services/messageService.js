import apiClient from './apiClient';
import { 
  mockConversations, 
  mockMessages,
  simulateDelay, 
  generateId 
} from '../utils/mockData';

// 开发环境使用Mock数据
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

const messageService = {
  /**
   * 获取会话列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise} 会话列表
   */
  getConversations: async (params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      return {
        data: mockConversations,
        total: mockConversations.length,
        page: params.page || 1,
        pageSize: params.pageSize || 20
      };
    }
    
    try {
      const response = await apiClient.get('/messages/conversations', { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取会话列表失败: ${error.message}`);
    }
  },

  /**
   * 获取单个会话的消息历史
   * @param {string} conversationId - 会话ID
   * @param {Object} params - 查询参数
   * @returns {Promise} 消息列表
   */
  getMessages: async (conversationId, params = {}) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      const messages = mockMessages[conversationId] || [];
      return {
        data: messages,
        total: messages.length,
        page: params.page || 1,
        pageSize: params.pageSize || 50
      };
    }
    
    try {
      const response = await apiClient.get(`/messages/conversations/${conversationId}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(`获取消息历史失败: ${error.message}`);
    }
  },

  /**
   * 发送消息
   * @param {Object} data - 消息数据
   * @param {number} data.receiverId - 接收者ID
   * @param {string} data.content - 消息内容
   * @param {string} data.type - 消息类型 (text, image, product)
   * @param {number} data.productId - 商品ID (可选)
   * @returns {Promise} 发送的消息
   */
  sendMessage: async (data) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(400);
      const newMessage = {
        id: generateId(),
        senderId: 1, // 当前用户ID
        receiverId: data.receiverId,
        content: data.content,
        type: data.type || 'text',
        timestamp: new Date().toISOString(),
        isRead: false,
        productId: data.productId
      };
      
      // 添加到mock数据中
      const conversationId = data.receiverId;
      if (!mockMessages[conversationId]) {
        mockMessages[conversationId] = [];
      }
      mockMessages[conversationId].push(newMessage);
      
      // 更新会话列表
      const conversation = mockConversations.find(c => c.userId === data.receiverId);
      if (conversation) {
        conversation.lastMessage = newMessage;
        conversation.updatedAt = newMessage.timestamp;
      }
      
      return newMessage;
    }
    
    try {
      const response = await apiClient.post('/messages', data);
      return response.data;
    } catch (error) {
      throw new Error(`发送消息失败: ${error.message}`);
    }
  },

  /**
   * 标记会话消息为已读
   * @param {string} conversationId - 会话ID
   * @returns {Promise} 操作结果
   */
  markAsRead: async (conversationId) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(200);
      // 更新mock数据中的消息为已读状态
      const messages = mockMessages[conversationId] || [];
      messages.forEach(message => {
        if (message.receiverId === 1) { // 当前用户接收的消息
          message.isRead = true;
        }
      });
      
      // 更新会话中的未读数量
      const conversation = mockConversations.find(c => c.userId === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
      
      return { success: true };
    }
    
    try {
      const response = await apiClient.put(`/messages/conversations/${conversationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(`标记已读失败: ${error.message}`);
    }
  },

  /**
   * 删除会话
   * @param {string} conversationId - 会话ID
   * @returns {Promise} 操作结果
   */
  deleteConversation: async (conversationId) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      // 从mock数据中删除会话
      const index = mockConversations.findIndex(c => c.userId === conversationId);
      if (index > -1) {
        mockConversations.splice(index, 1);
      }
      // 删除相关消息
      delete mockMessages[conversationId];
      return { success: true };
    }
    
    try {
      const response = await apiClient.delete(`/messages/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      throw new Error(`删除会话失败: ${error.message}`);
    }
  },

  /**
   * 搜索消息
   * @param {Object} params - 搜索参数
   * @param {string} params.keyword - 搜索关键词
   * @param {string} params.conversationId - 会话ID (可选)
   * @returns {Promise} 搜索结果
   */
  searchMessages: async (params) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(400);
      const keyword = params.keyword?.toLowerCase() || '';
      let results = [];
      
      if (params.conversationId) {
        // 在特定会话中搜索
        const messages = mockMessages[params.conversationId] || [];
        results = messages.filter(msg => 
          msg.content.toLowerCase().includes(keyword)
        );
      } else {
        // 在所有会话中搜索
        Object.values(mockMessages).forEach(messages => {
          results.push(...messages.filter(msg => 
            msg.content.toLowerCase().includes(keyword)
          ));
        });
      }
      
      return {
        data: results,
        total: results.length,
        keyword: params.keyword
      };
    }
    
    try {
      const response = await apiClient.get('/messages/search', { params });
      return response.data;
    } catch (error) {
      throw new Error(`搜索消息失败: ${error.message}`);
    }
  },

  /**
   * 获取未读消息数量
   * @returns {Promise} 未读数量
   */
  getUnreadCount: async () => {
    if (USE_MOCK_DATA) {
      await simulateDelay(150);
      let unreadCount = 0;
      mockConversations.forEach(conversation => {
        unreadCount += conversation.unreadCount || 0;
      });
      return { count: unreadCount };
    }
    
    try {
      const response = await apiClient.get('/messages/unread-count');
      return response.data;
    } catch (error) {
      throw new Error(`获取未读数量失败: ${error.message}`);
    }
  },

  /**
   * 发送图片消息
   * @param {Object} data - 消息数据
   * @param {number} data.receiverId - 接收者ID
   * @param {File} data.file - 图片文件
   * @returns {Promise} 发送的消息
   */
  sendImageMessage: async (data) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(800);
      // 模拟图片上传，生成一个模拟图片URL
      const imageUrl = `https://via.placeholder.com/300x200/87CEEB/000000?text=Image_${Date.now()}`;
      
      return await messageService.sendMessage({
        receiverId: data.receiverId,
        content: imageUrl,
        type: 'image'
      });
    }
    
    try {
      const formData = new FormData();
      formData.append('receiverId', data.receiverId);
      formData.append('file', data.file);
      
      const response = await apiClient.post('/messages/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`发送图片失败: ${error.message}`);
    }
  },

  /**
   * 分享商品到对话
   * @param {Object} data - 消息数据
   * @param {number} data.receiverId - 接收者ID
   * @param {number} data.productId - 商品ID
   * @returns {Promise} 发送的消息
   */
  shareProduct: async (data) => {
    if (USE_MOCK_DATA) {
      await simulateDelay(300);
      const productInfo = `[商品分享] 商品ID: ${data.productId}`;
      
      return await messageService.sendMessage({
        receiverId: data.receiverId,
        content: productInfo,
        type: 'product',
        productId: data.productId
      });
    }
    
    try {
      const response = await apiClient.post('/messages/share-product', data);
      return response.data;
    } catch (error) {
      throw new Error(`分享商品失败: ${error.message}`);
    }
  }
};

export default messageService;
