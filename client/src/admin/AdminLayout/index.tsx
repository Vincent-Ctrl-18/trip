import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
import { ShopOutlined, AuditOutlined, LogoutOutlined } from '@ant-design/icons';
import useAuthStore from '../../stores/useAuthStore';
import { useT, useLanguageStore } from '../../i18n';
import './style.css';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t } = useT();
  const toggleLang = useLanguageStore((s) => s.toggleLang);
  const lang = useLanguageStore((s) => s.lang);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else if (location.pathname === '/admin' || location.pathname === '/admin/') {
      // Default redirect based on role
      navigate(user.role === 'admin' ? '/admin/review' : '/admin/hotels', { replace: true });
    }
  }, [user, navigate, location.pathname]);

  if (!user) return null;

  const merchantMenuItems = [
    { key: '/admin/hotels', icon: <ShopOutlined />, label: t('admin.sidebar.myHotels') },
  ];

  const adminMenuItems = [
    { key: '/admin/review', icon: <AuditOutlined />, label: t('admin.sidebar.review') },
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
          <h2>{t('admin.sidebar.title')}</h2>
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
              {user.role === 'admin' ? t('admin.header.admin') : t('admin.header.merchant')}: {user.username}
            </Typography.Text>
          </div>
          <div className="header-right-actions">
            <button className="lang-switch-inline" onClick={toggleLang}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>language</span>
              {lang === 'zh' ? 'English' : '中文'}
            </button>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              {t('admin.logout')}
            </Button>
          </div>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
