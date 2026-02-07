import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../../api';
import useAuthStore from '../../stores/useAuthStore';
import './style.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authAPI.login(values);
      setAuth(res.data.token, res.data.user);
      message.success('登录成功');
      // Navigate based on role
      if (res.data.user.role === 'admin') {
        navigate('/admin/review');
      } else {
        navigate('/admin/hotels');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || '登录失败');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <h1>易宿管理后台</h1>
          <p>酒店信息管理系统</p>
        </div>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-footer">
          还没有账号？<Link to="/admin/register">立即注册</Link>
        </div>
      </Card>
    </div>
  );
}
