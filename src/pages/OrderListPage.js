import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const OrderListPage = () => {
  const navigate = useNavigate();
  return (
    <Result
      title="订单列表页面"
      subTitle="此页面正在开发中，将在后续版本中实现"
      extra={<Button type="primary" onClick={() => navigate('/home')}>返回首页</Button>}
    />
  );
};

export default OrderListPage;
