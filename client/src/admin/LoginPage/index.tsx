import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../../api';
import useAuthStore from '../../stores/useAuthStore';
import { useT, useLanguageStore } from '../../i18n';
import '../shared/auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { t } = useT();
  const toggleLang = useLanguageStore((s) => s.toggleLang);
  const lang = useLanguageStore((s) => s.lang);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authAPI.login(values);
      setAuth(res.data.token, res.data.user);
      message.success(t('admin.login.success'));
      if (res.data.user.role === 'admin') {
        navigate('/admin/review');
      } else {
        navigate('/admin/hotels');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.login.failed'));
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-lang-switch">
          <button className="lang-switch-inline" onClick={toggleLang}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>language</span>
            {lang === 'zh' ? 'English' : '中文'}
          </button>
        </div>
        <div className="auth-header">
          <h1>{t('admin.login.title')}</h1>
          <p>{t('admin.login.subtitle')}</p>
        </div>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: t('admin.login.usernameRequired') }]}>
            <Input prefix={<UserOutlined />} placeholder={t('admin.login.username')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('admin.login.passwordRequired') }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('admin.login.password')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t('admin.login.button')}
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-footer">
          {t('admin.login.noAccount')}<Link to="/admin/register">{t('admin.login.register')}</Link>
        </div>
      </Card>
    </div>
  );
}
