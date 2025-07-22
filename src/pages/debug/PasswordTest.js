import React, { useState } from 'react';
import { Card, Button, Input, Space, Typography, message } from 'antd';

const { Title, Text } = Typography;

const PasswordTest = () => {
  const [username, setUsername] = useState('alice');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 测试登录
  const testLogin = async () => {
    try {
      setLoading(true);
      message.info('测试登录...');
      
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();
      console.log('登录响应:', data);
      setResult(data);
      
      if (data.success) {
        message.success('登录成功！');
      } else {
        message.error('登录失败: ' + (data.error?.message || data.message));
      }
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录错误: ' + error.message);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // 测试注册
  const testRegister = async () => {
    try {
      setLoading(true);
      message.info('测试注册...');

      const testUser = {
        username: 'testuser' + Date.now(),
        password: 'Password123!@#ABC',
        email: 'test' + Date.now() + '@example.com',
        phone: '138' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
      };
      
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      });

      const data = await response.json();
      console.log('注册响应:', data);
      setResult(data);
      
      if (data.success) {
        message.success('注册成功！');
        setUsername(testUser.username);
        setPassword(testUser.password);
      } else {
        message.error('注册失败: ' + (data.error?.message || data.message));
      }
    } catch (error) {
      console.error('注册错误:', error);
      message.error('注册错误: ' + error.message);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Title level={2}>密码测试工具</Title>
      
      <Card title="登录测试" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>用户名:</Text>
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </div>
          <div>
            <Text>密码:</Text>
            <Input.Password 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              style={{ marginLeft: '10px', width: '200px' }}
            />
          </div>
          <Space>
            <Button type="primary" onClick={testLogin} loading={loading}>
              测试登录
            </Button>
            <Button onClick={testRegister} loading={loading}>
              测试注册新用户
            </Button>
          </Space>
        </Space>
      </Card>

      {result && (
        <Card title="测试结果">
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}

      <Card title="预设测试用户" style={{ marginTop: '20px' }}>
        <Space direction="vertical">
          <Text><strong>数据库中的测试用户:</strong></Text>
          <Text>• alice / 123456</Text>
          <Text>• bob / 123456</Text>
          <Text>• charlie / 123456</Text>
          <Text>• diana / 123456</Text>
          <Text>• eve / 123456</Text>
          <Space>
            <Button size="small" onClick={() => { setUsername('alice'); setPassword('123456'); }}>
              使用 alice
            </Button>
            <Button size="small" onClick={() => { setUsername('bob'); setPassword('123456'); }}>
              使用 bob
            </Button>
            <Button size="small" onClick={() => { setUsername('charlie'); setPassword('123456'); }}>
              使用 charlie
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default PasswordTest;
