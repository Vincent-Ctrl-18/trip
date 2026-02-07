import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import { ShopOutlined, AuditOutlined, LogoutOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/useAuthStore';
import './style.css';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const merchantMenuItems = [
    { key: '/admin/hotels', icon: <ShopOutlined />, label: '我的酒店' },
  ];

  const adminMenuItems = [
    { key: '/admin/review', icon: <AuditOutlined />, label: '审核管理' },
  ];

  const menuItems = user.role === 'admin' ? adminMenuItems : merchantMenuItems;

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <Layout className="admin-layout">
      <Sider theme="light" className="admin-sider">
        <div className="admin-logo">
          <h2>易宿管理</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="admin-header">
          <div className="header-left">
            <Typography.Text type="secondary">
              {user.role === 'admin' ? '管理员' : '商户'}: {user.username}
            </Typography.Text>
          </div>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出登录
          </Button>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
