import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Radio, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../../api';
import useAuthStore from '../../stores/useAuthStore';
import './style.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string; role: string }) => {
    setLoading(true);
    try {
      const res = await authAPI.register(values);
      setAuth(res.data.token, res.data.user);
      message.success('注册成功');
      if (res.data.user.role === 'admin') {
        navigate('/admin/review');
      } else {
        navigate('/admin/hotels');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '注册失败');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <h1>注册账号</h1>
          <p>加入易宿管理平台</p>
        </div>
        <Form onFinish={onFinish} size="large" initialValues={{ role: 'merchant' }}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码（至少6位）" />
          </Form.Item>
          <Form.Item name="role" label="选择角色" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="merchant">商户</Radio>
              <Radio value="admin">管理员</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-footer">
          已有账号？<Link to="/admin/login">立即登录</Link>
        </div>
      </Card>
    </div>
  );
}
