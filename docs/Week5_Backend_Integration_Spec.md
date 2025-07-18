# 后端接口集成规范 - 第5周用户中心与消息系统

## 📋 文档信息
- **版本**: v1.0
- **创建时间**: 2025年7月18日
- **目标**: 为前端第5周功能提供后端集成规范
- **遵循标准**: Java Servlet + JDBC 四层架构

## 🏗️ 后端架构要求

### 1. 分层架构 (严格遵循)

#### 1.1 Web层 (Servlet Controller)
```
MessageServlet.java          # 消息相关接口
NotificationServlet.java     # 通知相关接口
UserServlet.java            # 用户相关接口
FollowServlet.java          # 关注相关接口
AddressServlet.java         # 地址相关接口
SearchServlet.java          # 搜索相关接口
```

#### 1.2 Service层 (业务逻辑)
```
MessageService.java         # 消息业务逻辑
NotificationService.java    # 通知业务逻辑
UserService.java           # 用户业务逻辑
FollowService.java         # 关注业务逻辑
AddressService.java        # 地址业务逻辑
SearchService.java         # 搜索业务逻辑
```

#### 1.3 Manager层 (通用能力)
```
MessageManager.java        # 消息数据管理
NotificationManager.java   # 通知数据管理
UserManager.java          # 用户数据管理
CacheManager.java         # 缓存管理
```

#### 1.4 DAO层 (数据访问)
```
MessageDAO.java           # 消息数据访问
ConversationDAO.java      # 会话数据访问
NotificationDAO.java      # 通知数据访问
UserDAO.java             # 用户数据访问
FollowDAO.java           # 关注数据访问
AddressDAO.java          # 地址数据访问
```

### 2. 数据模型 (Domain Objects)

#### 2.1 DO (数据对象)
```java
// 消息DO
public class MessageDO {
    private String messageId;
    private String conversationId;
    private String senderId;
    private String receiverId;
    private String content;
    private String type;
    private Boolean isRead;
    private Date createdAt;
    // getters and setters
}

// 会话DO
public class ConversationDO {
    private String conversationId;
    private String participant1Id;
    private String participant2Id;
    private String lastMessageId;
    private Integer unreadCount1;
    private Integer unreadCount2;
    private Date updatedAt;
    // getters and setters
}

// 通知DO
public class NotificationDO {
    private String notificationId;
    private String userId;
    private String type;
    private String title;
    private String content;
    private String relatedId;
    private String relatedType;
    private Boolean isRead;
    private Date createdAt;
    // getters and setters
}
```

#### 2.2 DTO (传输对象)
```java
// 发送消息DTO
public class SendMessageDTO {
    private String receiverId;
    private String content;
    private String type;
    private Map<String, Object> metadata;
    // getters and setters
}

// 更新用户资料DTO
public class UpdateProfileDTO {
    private String nickname;
    private String avatar;
    private String bio;
    private String location;
    private Map<String, String> contactInfo;
    // getters and setters
}

// 创建地址DTO
public class CreateAddressDTO {
    private String receiverName;
    private String phone;
    private String province;
    private String city;
    private String district;
    private String detail;
    private Boolean isDefault;
    // getters and setters
}
```

#### 2.3 VO (视图对象)
```java
// 用户资料VO
public class UserProfileVO {
    private String userId;
    private String username;
    private String nickname;
    private String avatarUrl;
    private String bio;
    private Integer followerCount;
    private Integer followingCount;
    private Boolean isFollowing;
    private ProductStatsVO productStats;
    private List<ProductVO> recentProducts;
    // getters and setters
}

// 会话VO
public class ConversationVO {
    private String conversationId;
    private List<UserVO> participants;
    private MessageVO lastMessage;
    private Integer unreadCount;
    private Date updatedAt;
    // getters and setters
}
```

## 📡 API接口实现规范

### 1. 消息系统接口

#### 1.1 MessageServlet.java
```java
@WebServlet("/api/v1/messages/*")
public class MessageServlet extends HttpServlet {
    
    private MessageService messageService = new MessageService();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        
        try {
            if ("/conversations".equals(pathInfo)) {
                handleGetConversations(request, response);
            } else if (pathInfo.matches("/conversations/\\w+/messages")) {
                handleGetMessages(request, response);
            } else {
                sendErrorResponse(response, "A0404", "接口不存在");
            }
        } catch (Exception e) {
            logger.error("消息接口异常", e);
            sendErrorResponse(response, "B0100", "系统繁忙，请稍后重试");
        }
    }
    
    private void handleGetConversations(HttpServletRequest request, 
                                      HttpServletResponse response) throws IOException {
        String userId = getCurrentUserId(request);
        ConversationsQuery query = parseConversationsQuery(request);
        
        PaginatedResult<ConversationVO> result = messageService.getConversations(userId, query);
        sendSuccessResponse(response, result);
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        
        if ("/send".equals(pathInfo)) {
            handleSendMessage(request, response);
        }
    }
    
    private void handleSendMessage(HttpServletRequest request, 
                                 HttpServletResponse response) throws IOException {
        String senderId = getCurrentUserId(request);
        SendMessageDTO dto = parseRequestBody(request, SendMessageDTO.class);
        
        // 业务验证
        if (senderId.equals(dto.getReceiverId())) {
            sendErrorResponse(response, "A0203", "不能给自己发送消息");
            return;
        }
        
        MessageVO message = messageService.sendMessage(senderId, dto);
        sendSuccessResponse(response, message);
    }
}
```

#### 1.2 MessageService.java
```java
public class MessageService {
    
    private MessageManager messageManager = new MessageManager();
    private NotificationService notificationService = new NotificationService();
    
    public PaginatedResult<ConversationVO> getConversations(String userId, ConversationsQuery query) {
        // 1. 参数验证
        validateConversationsQuery(query);
        
        // 2. 获取会话列表
        List<ConversationDO> conversations = messageManager.getConversations(userId, query);
        
        // 3. 转换为VO
        List<ConversationVO> conversationVOs = conversations.stream()
            .map(this::convertToConversationVO)
            .collect(Collectors.toList());
        
        // 4. 获取总数
        int total = messageManager.getConversationsCount(userId, query);
        
        return new PaginatedResult<>(conversationVOs, total, query.getPage(), query.getPageSize());
    }
    
    public MessageVO sendMessage(String senderId, SendMessageDTO dto) {
        // 1. 参数验证
        validateSendMessageDTO(dto);
        
        // 2. 检查接收者是否存在
        if (!userManager.userExists(dto.getReceiverId())) {
            throw new BusinessException("A0102", "用户不存在");
        }
        
        // 3. 检查是否允许发送消息
        if (!checkCanSendMessage(senderId, dto.getReceiverId())) {
            throw new BusinessException("A0204", "用户不允许接收消息");
        }
        
        // 4. 创建消息
        MessageDO messageDO = new MessageDO();
        messageDO.setMessageId(generateMessageId());
        messageDO.setSenderId(senderId);
        messageDO.setReceiverId(dto.getReceiverId());
        messageDO.setContent(dto.getContent());
        messageDO.setType(dto.getType());
        messageDO.setIsRead(false);
        messageDO.setCreatedAt(new Date());
        
        // 5. 获取或创建会话
        String conversationId = messageManager.getOrCreateConversation(senderId, dto.getReceiverId());
        messageDO.setConversationId(conversationId);
        
        // 6. 保存消息
        messageManager.saveMessage(messageDO);
        
        // 7. 更新会话
        messageManager.updateConversation(conversationId, messageDO);
        
        // 8. 发送通知
        notificationService.createMessageNotification(dto.getReceiverId(), messageDO);
        
        // 9. 转换为VO返回
        return convertToMessageVO(messageDO);
    }
}
```

### 2. 通知系统接口

#### 2.1 NotificationServlet.java
```java
@WebServlet("/api/v1/notifications/*")
public class NotificationServlet extends HttpServlet {
    
    private NotificationService notificationService = new NotificationService();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        String userId = getCurrentUserId(request);
        
        if (pathInfo == null || "/".equals(pathInfo)) {
            handleGetNotifications(request, response, userId);
        } else if ("/unread-count".equals(pathInfo)) {
            handleGetUnreadCount(request, response, userId);
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        String userId = getCurrentUserId(request);
        
        if ("/read-all".equals(pathInfo)) {
            handleMarkAllAsRead(request, response, userId);
        } else if (pathInfo.matches("/\\w+/read")) {
            String notificationId = extractNotificationId(pathInfo);
            handleMarkAsRead(request, response, userId, notificationId);
        }
    }
}
```

### 3. 用户系统接口

#### 3.1 UserServlet.java
```java
@WebServlet("/api/v1/users/*")
public class UserServlet extends HttpServlet {
    
    private UserService userService = new UserService();
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        
        if (pathInfo.matches("/\\w+/profile")) {
            String userId = extractUserId(pathInfo);
            handleGetUserProfile(request, response, userId);
        } else if (pathInfo.matches("/\\w+/stats")) {
            String userId = extractUserId(pathInfo);
            handleGetUserStats(request, response, userId);
        } else if ("/profile".equals(pathInfo)) {
            String currentUserId = getCurrentUserId(request);
            handleGetCurrentUserProfile(request, response, currentUserId);
        }
    }
    
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();
        String currentUserId = getCurrentUserId(request);
        
        if ("/profile".equals(pathInfo)) {
            handleUpdateProfile(request, response, currentUserId);
        } else if ("/password".equals(pathInfo)) {
            handleChangePassword(request, response, currentUserId);
        }
    }
}
```

## 🗄️ 数据库设计

### 1. 消息相关表

#### 1.1 messages表
```sql
CREATE TABLE messages (
    message_id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('TEXT', 'IMAGE', 'PRODUCT') DEFAULT 'TEXT',
    metadata JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_receiver_id (receiver_id),
    INDEX idx_created_at (created_at)
);
```

#### 1.2 conversations表
```sql
CREATE TABLE conversations (
    conversation_id VARCHAR(36) PRIMARY KEY,
    participant1_id VARCHAR(36) NOT NULL,
    participant2_id VARCHAR(36) NOT NULL,
    last_message_id VARCHAR(36),
    unread_count_1 INT DEFAULT 0,
    unread_count_2 INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_participants (participant1_id, participant2_id),
    INDEX idx_participant1 (participant1_id),
    INDEX idx_participant2 (participant2_id),
    INDEX idx_updated_at (updated_at)
);
```

### 2. 通知相关表

#### 2.1 notifications表
```sql
CREATE TABLE notifications (
    notification_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('ORDER', 'PRODUCT', 'SYSTEM', 'MESSAGE', 'REVIEW') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    related_id VARCHAR(36),
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);
```

### 3. 用户扩展表

#### 3.1 user_profiles表
```sql
CREATE TABLE user_profiles (
    user_id VARCHAR(36) PRIMARY KEY,
    bio TEXT,
    location VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    contact_wechat VARCHAR(50),
    profile_visibility ENUM('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE') DEFAULT 'PUBLIC',
    show_contact BOOLEAN DEFAULT TRUE,
    show_products BOOLEAN DEFAULT TRUE,
    allow_messages ENUM('EVERYONE', 'FOLLOWERS_ONLY', 'NONE') DEFAULT 'EVERYONE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

#### 3.2 user_follows表
```sql
CREATE TABLE user_follows (
    follow_id VARCHAR(36) PRIMARY KEY,
    follower_id VARCHAR(36) NOT NULL,
    followee_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_follow (follower_id, followee_id),
    INDEX idx_follower_id (follower_id),
    INDEX idx_followee_id (followee_id),
    
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### 4. 地址管理表

#### 4.1 user_addresses表
```sql
CREATE TABLE user_addresses (
    address_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    receiver_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    detail VARCHAR(200) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

## 🔒 安全实现

### 1. 认证授权

#### 1.1 JWT Token验证
```java
public class AuthenticationFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendUnauthorizedResponse(httpResponse);
            return;
        }
        
        String token = authHeader.substring(7);
        try {
            Claims claims = validateJwtToken(token);
            String userId = claims.getSubject();
            httpRequest.setAttribute("currentUserId", userId);
            
            chain.doFilter(request, response);
        } catch (JwtException e) {
            sendUnauthorizedResponse(httpResponse);
        }
    }
}
```

### 2. 输入验证

#### 2.1 参数验证工具
```java
public class ValidationUtil {
    
    public static void validateSendMessageDTO(SendMessageDTO dto) {
        if (dto == null) {
            throw new ValidationException("A0400", "请求参数不能为空");
        }
        
        if (StringUtils.isBlank(dto.getReceiverId())) {
            throw new ValidationException("A0400", "接收者ID不能为空");
        }
        
        if (StringUtils.isBlank(dto.getContent())) {
            throw new ValidationException("A0400", "消息内容不能为空");
        }
        
        if (dto.getContent().length() > 1000) {
            throw new ValidationException("A0400", "消息内容不能超过1000字符");
        }
        
        // XSS检查
        if (containsXssContent(dto.getContent())) {
            throw new ValidationException("A0400", "消息内容包含非法字符");
        }
    }
    
    private static boolean containsXssContent(String content) {
        String[] xssPatterns = {
            "<script", "javascript:", "on\\w+="
        };
        
        for (String pattern : xssPatterns) {
            if (content.toLowerCase().matches(".*" + pattern + ".*")) {
                return true;
            }
        }
        return false;
    }
}
```

### 3. SQL注入防护

#### 3.1 PreparedStatement使用
```java
public class MessageDAO {
    
    public List<MessageDO> getMessagesByConversation(String conversationId, int offset, int limit) {
        String sql = "SELECT * FROM messages WHERE conversation_id = ? " +
                    "ORDER BY created_at DESC LIMIT ? OFFSET ?";
        
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, conversationId);
            stmt.setInt(2, limit);
            stmt.setInt(3, offset);
            
            ResultSet rs = stmt.executeQuery();
            return mapResultSetToMessages(rs);
        } catch (SQLException e) {
            throw new DataAccessException("查询消息失败", e);
        }
    }
}
```

## 📊 性能优化

### 1. 数据库优化

#### 1.1 索引策略
```sql
-- 会话查询优化
CREATE INDEX idx_conversations_user_updated 
ON conversations(participant1_id, updated_at DESC);

CREATE INDEX idx_conversations_user2_updated 
ON conversations(participant2_id, updated_at DESC);

-- 消息查询优化
CREATE INDEX idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

-- 通知查询优化
CREATE INDEX idx_notifications_user_read_created 
ON notifications(user_id, is_read, created_at DESC);
```

#### 1.2 分页查询优化
```java
public class MessageManager {
    
    public List<MessageDO> getMessages(String conversationId, String beforeMessageId, int limit) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT * FROM messages WHERE conversation_id = ?");
        
        List<Object> params = new ArrayList<>();
        params.add(conversationId);
        
        if (StringUtils.isNotBlank(beforeMessageId)) {
            sql.append(" AND created_at < (SELECT created_at FROM messages WHERE message_id = ?)");
            params.add(beforeMessageId);
        }
        
        sql.append(" ORDER BY created_at DESC LIMIT ?");
        params.add(limit);
        
        return executeQuery(sql.toString(), params);
    }
}
```

### 2. 缓存策略

#### 2.1 用户信息缓存
```java
public class UserManager {
    
    private CacheManager cacheManager = new CacheManager();
    
    public UserVO getUserProfile(String userId) {
        String cacheKey = "user:profile:" + userId;
        UserVO cached = cacheManager.get(cacheKey, UserVO.class);
        
        if (cached != null) {
            return cached;
        }
        
        UserDO userDO = userDAO.getUserById(userId);
        if (userDO == null) {
            throw new BusinessException("A0102", "用户不存在");
        }
        
        UserVO userVO = convertToUserVO(userDO);
        cacheManager.set(cacheKey, userVO, 300); // 5分钟缓存
        
        return userVO;
    }
}
```

## 🚀 部署配置

### 1. Tomcat配置

#### 1.1 web.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://java.sun.com/xml/ns/javaee"
         version="3.0">
    
    <!-- 认证过滤器 -->
    <filter>
        <filter-name>AuthenticationFilter</filter-name>
        <filter-class>com.marketplace.filter.AuthenticationFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>AuthenticationFilter</filter-name>
        <url-pattern>/api/v1/*</url-pattern>
    </filter-mapping>
    
    <!-- CORS过滤器 -->
    <filter>
        <filter-name>CorsFilter</filter-name>
        <filter-class>com.marketplace.filter.CorsFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>CorsFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    
    <!-- 编码过滤器 -->
    <filter>
        <filter-name>CharacterEncodingFilter</filter-name>
        <filter-class>com.marketplace.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>CharacterEncodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>
    
</web-app>
```

### 2. 数据库连接池

#### 2.1 数据源配置
```java
public class DataSourceConfig {
    
    private static HikariDataSource dataSource;
    
    static {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/marketplace?useSSL=true");
        config.setUsername("marketplace_user");
        config.setPassword("marketplace_password");
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        
        // 连接池配置
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        
        dataSource = new HikariDataSource(config);
    }
    
    public static Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
}
```

## 📝 开发清单

### 后端开发任务
- [ ] **环境搭建**: Tomcat + MySQL + JDK 1.8
- [ ] **数据库设计**: 创建所有表结构
- [ ] **基础框架**: 配置过滤器、异常处理
- [ ] **消息系统**: 实现所有消息相关接口
- [ ] **通知系统**: 实现所有通知相关接口
- [ ] **用户系统**: 实现用户资料管理接口
- [ ] **关注系统**: 实现关注/取消关注接口
- [ ] **地址管理**: 实现地址CRUD接口
- [ ] **搜索功能**: 实现搜索相关接口
- [ ] **安全配置**: JWT认证、HTTPS配置
- [ ] **性能优化**: 数据库索引、缓存配置
- [ ] **测试验证**: 单元测试、集成测试
- [ ] **文档完善**: API文档、部署文档

---

**文档状态**: ✅ 已完成  
**适用版本**: 后端 v1.0  
**最后更新**: 2025年7月18日  
**维护责任**: 后端开发团队
