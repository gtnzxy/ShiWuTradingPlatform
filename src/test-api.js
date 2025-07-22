// 临时测试文件 - 用于验证API连接
import axios from 'axios';

const testAPI = async () => {
  try {
    console.log('测试API连接...');
    
    // 测试注册API
    const response = await axios.post('/api/user/register', {
      username: 'testuser' + Date.now(),
      password: 'password123'
    });
    
    console.log('API测试成功:', response.data);
    return true;
  } catch (error) {
    console.error('API测试失败:', error);
    return false;
  }
};

// 在控制台中运行: testAPI()
window.testAPI = testAPI;

export default testAPI;
