import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Select, message, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import { hotelAPI } from '../../api';
import { useT } from '../../i18n';

export default function ReviewList() {
  const { t } = useT();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; hotelId: number | null }>({ open: false, hotelId: null });
  const [rejectReason, setRejectReason] = useState('');

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
      const params: Record<string, any> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await hotelAPI.reviewList(params);
      setHotels(res.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.review.fetchFailed'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    try {
      await hotelAPI.approve(id);
      message.success(t('admin.review.approveSuccess'));
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.review.operationFailed'));
    }
  };

  const handleReject = async () => {
    if (!rejectModal.hotelId) return;
    try {
      await hotelAPI.reject(rejectModal.hotelId, rejectReason);
      message.success(t('admin.review.rejectSuccess'));
      setRejectModal({ open: false, hotelId: null });
      setRejectReason('');
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.review.operationFailed'));
    }
  };

  const handleOffline = async (id: number) => {
    try {
      await hotelAPI.offline(id);
      message.success(t('admin.review.offlineSuccess'));
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.review.operationFailed'));
    }
  };

  const handleOnline = async (id: number) => {
    try {
      await hotelAPI.online(id);
      message.success(t('admin.review.onlineSuccess'));
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.review.operationFailed'));
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
      title: t('admin.hotelList.roomCount'), key: 'rooms', width: 80,
      render: (_: any, record: any) => (record.RoomTypes?.length || 0),
    },
    {
      title: t('admin.hotelList.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string, record: any) => (
        <div>
          <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
          {status === 'rejected' && record.reject_reason && (
            <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
              {record.reject_reason}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('admin.hotelList.action'),
      key: 'action',
      width: 280,
      render: (_: any, record: any) => (
        <Space wrap>
          {record.status === 'pending' && (
            <>
              <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>
                {t('admin.review.approve')}
              </Button>
              <Button size="small" danger icon={<CloseOutlined />} onClick={() => {
                setRejectModal({ open: true, hotelId: record.id });
                setRejectReason('');
              }}>
                {t('admin.review.reject')}
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button size="small" icon={<StopOutlined />} onClick={() => handleOffline(record.id)}>
              {t('admin.review.offline')}
            </Button>
          )}
          {record.status === 'offline' && (
            <Button size="small" type="primary" icon={<ReloadOutlined />} onClick={() => handleOnline(record.id)}>
              {t('admin.review.online')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{t('admin.review.title')}</h2>
        <Space>
          <Select
            placeholder={t('admin.review.statusFilter')}
            allowClear
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.text }))}
          />
          <Button onClick={fetchHotels} icon={<ReloadOutlined />}>{t('admin.review.refresh')}</Button>
        </Space>
      </div>

      <Table
        dataSource={hotels}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} items` }}
      />

      <Modal
        title={t('admin.review.rejectTitle')}
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => setRejectModal({ open: false, hotelId: null })}
        okText={t('admin.review.confirmReject')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('admin.review.rejectReason')}</p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder={t('admin.review.rejectPlaceholder')}
        />
      </Modal>
    </div>
  );
}
