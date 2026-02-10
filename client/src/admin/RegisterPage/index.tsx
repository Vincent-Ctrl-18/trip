import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Radio, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../../api';
import useAuthStore from '../../stores/useAuthStore';
import { useT, useLanguageStore } from '../../i18n';
import '../shared/auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { t } = useT();
  const toggleLang = useLanguageStore((s) => s.toggleLang);
  const lang = useLanguageStore((s) => s.lang);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('merchant');

  const onFinish = async (values: { username: string; password: string; role: string; inviteCode?: string }) => {
    setLoading(true);
    try {
      const res = await authAPI.register(values);
      setAuth(res.data.token, res.data.user);
      message.success(t('admin.register.success'));
      if (res.data.user.role === 'admin') {
        navigate('/admin/review');
      } else {
        navigate('/admin/hotels');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.register.failed'));
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
          <h1>{t('admin.register.title')}</h1>
          <p>{t('admin.register.subtitle')}</p>
        </div>
        <Form onFinish={onFinish} size="large" initialValues={{ role: 'merchant' }}>
          <Form.Item name="username" rules={[{ required: true, message: t('admin.login.usernameRequired') }]}>
            <Input prefix={<UserOutlined />} placeholder={t('admin.login.username')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: t('admin.login.passwordRequired') }, { min: 6, message: t('admin.register.passwordMin') }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('admin.register.passwordPlaceholder')} />
          </Form.Item>
          <Form.Item name="role" label={t('admin.register.role')} rules={[{ required: true }]}>
            <Radio.Group onChange={(e) => setSelectedRole(e.target.value)}>
              <Radio value="merchant">{t('admin.register.merchant')}</Radio>
              <Radio value="admin">{t('admin.register.admin')}</Radio>
            </Radio.Group>
          </Form.Item>
          {selectedRole === 'admin' && (
            <Form.Item name="inviteCode" rules={[{ required: true, message: t('admin.register.inviteCodeRequired') }]}>
              <Input prefix={<LockOutlined />} placeholder={t('admin.register.inviteCodePlaceholder')} />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {t('admin.register.button')}
            </Button>
          </Form.Item>
        </Form>
        <div className="auth-footer">
          {t('admin.register.hasAccount')}<Link to="/admin/login">{t('admin.register.login')}</Link>
        </div>
      </Card>
    </div>
  );
}
