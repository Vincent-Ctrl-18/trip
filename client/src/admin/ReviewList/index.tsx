import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Select, message, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined, CloudUploadOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons';
import { hotelAPI } from '../../api';

const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '待审核' },
  approved: { color: 'success', text: '已通过' },
  rejected: { color: 'error', text: '已拒绝' },
  offline: { color: 'warning', text: '已下线' },
};

export default function ReviewList() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; hotelId: number | null }>({ open: false, hotelId: null });
  const [rejectReason, setRejectReason] = useState('');

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await hotelAPI.reviewList(params);
      setHotels(res.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || '获取列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    try {
      await hotelAPI.approve(id);
      message.success('审核通过');
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleReject = async () => {
    if (!rejectModal.hotelId) return;
    try {
      await hotelAPI.reject(rejectModal.hotelId, rejectReason);
      message.success('已拒绝');
      setRejectModal({ open: false, hotelId: null });
      setRejectReason('');
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleOffline = async (id: number) => {
    try {
      await hotelAPI.offline(id);
      message.success('已下线');
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleOnline = async (id: number) => {
    try {
      await hotelAPI.online(id);
      message.success('已恢复上线');
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: 'name_cn',
      key: 'name_cn',
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.name_en}</div>
        </div>
      ),
    },
    { title: '城市', dataIndex: 'city', key: 'city', width: 80 },
    {
      title: '星级', dataIndex: 'star', key: 'star', width: 100,
      render: (star: number) => <span style={{ color: '#ffa940' }}>{'★'.repeat(star)}</span>,
    },
    {
      title: '房型数', key: 'rooms', width: 80,
      render: (_: any, record: any) => (record.RoomTypes?.length || 0) + '个',
    },
    {
      title: '状态',
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
      title: '操作',
      key: 'action',
      width: 280,
      render: (_: any, record: any) => (
        <Space wrap>
          {record.status === 'pending' && (
            <>
              <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>
                通过
              </Button>
              <Button size="small" danger icon={<CloseOutlined />} onClick={() => {
                setRejectModal({ open: true, hotelId: record.id });
                setRejectReason('');
              }}>
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Button size="small" icon={<StopOutlined />} onClick={() => handleOffline(record.id)}>
              下线
            </Button>
          )}
          {record.status === 'offline' && (
            <Button size="small" type="primary" icon={<ReloadOutlined />} onClick={() => handleOnline(record.id)}>
              恢复上线
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>审核管理</h2>
        <Space>
          <Select
            placeholder="按状态筛选"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.text }))}
          />
          <Button onClick={fetchHotels} icon={<ReloadOutlined />}>刷新</Button>
        </Space>
      </div>

      <Table
        dataSource={hotels}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      <Modal
        title="拒绝审核"
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => setRejectModal({ open: false, hotelId: null })}
        okText="确认拒绝"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>请输入拒绝原因：</p>
        <Input.TextArea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="请说明拒绝原因..."
        />
      </Modal>
    </div>
  );
}
