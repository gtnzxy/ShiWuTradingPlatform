import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Button, 
  List, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Typography, 
  message,
  Popconfirm,
  Empty,
  Spin,
  Tag,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { addressService } from '../services/addressService';
import './AddressManagePage.css';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 地址管理页面组件
 * 用于管理用户的收货地址
 */
const AddressManagePage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form] = Form.useForm();

  // 省市区数据（简化版，实际项目中应该从API获取）
  const provinces = [
    '北京市', '上海市', '天津市', '重庆市',
    '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
    '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
    '河南省', '湖北省', '湖南省', '广东省', '海南省',
    '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省',
    '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区'
  ];

  // 加载地址列表
  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await addressService.getAddresses();
      
      if (response.success) {
        setAddresses(response.data || []);
      } else {
        message.error(response.userTip || '加载地址失败');
      }
    } catch (error) {
      console.error('加载地址失败:', error);
      message.error('加载地址失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // 显示添加/编辑地址弹窗
  const showAddressModal = useCallback((address = null) => {
    setEditingAddress(address);
    setModalVisible(true);
    
    if (address) {
      form.setFieldsValue({
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        province: address.province,
        city: address.city,
        district: address.district,
        detailAddress: address.detailAddress,
        isDefault: address.isDefault
      });
    } else {
      form.resetFields();
    }
  }, [form]);

  // 关闭弹窗
  const hideAddressModal = useCallback(() => {
    setModalVisible(false);
    setEditingAddress(null);
    form.resetFields();
  }, [form]);

  // 保存地址
  const handleSaveAddress = useCallback(async (values) => {
    try {
      let response;
      
      if (editingAddress) {
        // 编辑地址
        response = await addressService.updateAddress(editingAddress.addressId, values);
      } else {
        // 添加地址
        response = await addressService.addAddress(values);
      }

      if (response.success) {
        message.success(editingAddress ? '地址更新成功' : '地址添加成功');
        hideAddressModal();
        loadAddresses();
      } else {
        message.error(response.userTip || '保存地址失败');
      }
    } catch (error) {
      console.error('保存地址失败:', error);
      message.error('保存地址失败，请稍后重试');
    }
  }, [editingAddress, hideAddressModal, loadAddresses]);

  // 删除地址
  const handleDeleteAddress = useCallback(async (addressId) => {
    try {
      const response = await addressService.deleteAddress(addressId);
      
      if (response.success) {
        message.success('地址删除成功');
        loadAddresses();
      } else {
        message.error(response.userTip || '删除地址失败');
      }
    } catch (error) {
      console.error('删除地址失败:', error);
      message.error('删除地址失败，请稍后重试');
    }
  }, [loadAddresses]);

  // 设置默认地址
  const handleSetDefaultAddress = useCallback(async (addressId) => {
    try {
      const response = await addressService.setDefaultAddress(addressId);
      
      if (response.success) {
        message.success('默认地址设置成功');
        loadAddresses();
      } else {
        message.error(response.userTip || '设置默认地址失败');
      }
    } catch (error) {
      console.error('设置默认地址失败:', error);
      message.error('设置默认地址失败，请稍后重试');
    }
  }, [loadAddresses]);

  // 地址项渲染
  const renderAddressItem = (address) => (
    <List.Item
      key={address.addressId}
      className="address-item"
    >
      <Card 
        className={`address-card ${address.isDefault ? 'default-address' : ''}`}
        hoverable
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space align="center">
              <UserOutlined />
              <Text strong>{address.receiverName}</Text>
              <PhoneOutlined />
              <Text>{address.receiverPhone}</Text>
              {address.isDefault && (
                <Tag color="gold" icon={<HomeOutlined />}>
                  默认地址
                </Tag>
              )}
            </Space>
          </Col>
          
          <Col span={24}>
            <Space align="start">
              <EnvironmentOutlined />
              <Text>
                {address.province} {address.city} {address.district} {address.detailAddress}
              </Text>
            </Space>
          </Col>
          
          <Col span={24}>
            <Divider style={{ margin: '12px 0' }} />
            <Space>
              {!address.isDefault && (
                <Button 
                  size="small"
                  onClick={() => handleSetDefaultAddress(address.addressId)}
                >
                  设为默认
                </Button>
              )}
              
              <Button 
                size="small"
                icon={<EditOutlined />}
                onClick={() => showAddressModal(address)}
              >
                编辑
              </Button>
              
              <Popconfirm
                title="确定要删除这个地址吗？"
                onConfirm={() => handleDeleteAddress(address.addressId)}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                >
                  删除
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      </Card>
    </List.Item>
  );

  return (
    <div className="address-manage-page">
      <Card>
        <div className="page-header">
          <Title level={3}>收货地址管理</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => showAddressModal()}
          >
            添加地址
          </Button>
        </div>

        <Spin spinning={loading}>
          {addresses.length > 0 ? (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 2,
                lg: 2,
                xl: 3,
                xxl: 3,
              }}
              dataSource={addresses}
              renderItem={renderAddressItem}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无收货地址"
              style={{ margin: '64px 0' }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => showAddressModal()}
              >
                添加地址
              </Button>
            </Empty>
          )}
        </Spin>
      </Card>

      {/* 添加/编辑地址弹窗 */}
      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={modalVisible}
        onCancel={hideAddressModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveAddress}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="receiverName"
                label="收货人姓名"
                rules={[
                  { required: true, message: '请输入收货人姓名' },
                  { max: 20, message: '姓名不能超过20个字符' }
                ]}
              >
                <Input 
                  placeholder="请输入收货人姓名"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="receiverPhone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                ]}
              >
                <Input 
                  placeholder="请输入联系电话"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province"
                label="省份"
                rules={[{ required: true, message: '请选择省份' }]}
              >
                <Select placeholder="请选择省份">
                  {provinces.map(province => (
                    <Option key={province} value={province}>
                      {province}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="city"
                label="城市"
                rules={[{ required: true, message: '请输入城市' }]}
              >
                <Input placeholder="请输入城市" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="district"
                label="区县"
                rules={[{ required: true, message: '请输入区县' }]}
              >
                <Input placeholder="请输入区县" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="detailAddress"
            label="详细地址"
            rules={[
              { required: true, message: '请输入详细地址' },
              { max: 100, message: '详细地址不能超过100个字符' }
            ]}
          >
            <Input.TextArea 
              rows={3}
              placeholder="请输入详细地址，如街道、楼层、门牌号等"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={hideAddressModal}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingAddress ? '更新地址' : '添加地址'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressManagePage;
