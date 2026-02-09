import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { hotelAPI } from '../../api';
import { useT } from '../../i18n';

export default function HotelList() {
  const navigate = useNavigate();
  const { t } = useT();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: t('status.draft') },
    pending: { color: 'processing', text: t('status.pending') },
    approved: { color: 'success', text: t('status.approved') },
    rejected: { color: 'error', text: t('status.rejected') },
    offline: { color: 'warning', text: t('status.offline') },
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await hotelAPI.myHotels();
      setHotels(res.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.hotelList.fetchFailed'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (id: number) => {
    try {
      await hotelAPI.submit(id);
      message.success(t('admin.hotelList.submitSuccess'));
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.hotelList.submitFailed'));
    }
  };

  const columns = [
    {
      title: t('admin.hotelList.hotelName'),
      dataIndex: 'name_cn',
      key: 'name_cn',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.name_en}</div>
        </div>
      ),
    },
    { title: t('admin.hotelList.city'), dataIndex: 'city', key: 'city', width: 80 },
    {
      title: t('admin.hotelList.star'), dataIndex: 'star', key: 'star', width: 100,
      render: (star: number) => <span style={{ color: '#ffa940' }}>{'★'.repeat(star)}</span>,
    },
    {
      title: t('admin.hotelList.roomCount'),
      key: 'rooms',
      width: 80,
      render: (_: any, record: any) => (record.RoomTypes?.length || 0),
    },
    {
      title: t('admin.hotelList.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: any) => (
        <div>
          <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
          {status === 'rejected' && record.reject_reason && (
            <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
              {t('admin.hotelList.reason')}: {record.reject_reason}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('admin.hotelList.action'),
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/hotels/edit/${record.id}`)}>
            {t('admin.hotelList.edit')}
          </Button>
          {['draft', 'rejected'].includes(record.status) && (
            <Popconfirm title={t('admin.hotelList.submitConfirm')} onConfirm={() => handleSubmit(record.id)}>
              <Button size="small" type="primary" icon={<SendOutlined />}>
                {t('admin.hotelList.submit')}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{t('admin.hotelList.title')}</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/hotels/create')}>
          {t('admin.hotelList.add')}
        </Button>
      </div>
      <Table
        dataSource={hotels}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
}
