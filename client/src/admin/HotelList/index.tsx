import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, SendOutlined } from '@ant-design/icons';
import { hotelAPI } from '../../api';

const statusMap: Record<string, { color: string; text: string }> = {
  draft: { color: 'default', text: '草稿' },
  pending: { color: 'processing', text: '审核中' },
  approved: { color: 'success', text: '已通过' },
  rejected: { color: 'error', text: '已拒绝' },
  offline: { color: 'warning', text: '已下线' },
};

export default function HotelList() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await hotelAPI.myHotels();
      setHotels(res.data);
    } catch (err: any) {
      message.error(err.response?.data?.message || '获取酒店列表失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSubmit = async (id: number) => {
    try {
      await hotelAPI.submit(id);
      message.success('已提交审核');
      fetchHotels();
    } catch (err: any) {
      message.error(err.response?.data?.message || '提交失败');
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
      title: '房型数',
      key: 'rooms',
      width: 80,
      render: (_: any, record: any) => (record.RoomTypes?.length || 0) + '个',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: any) => (
        <div>
          <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>
          {status === 'rejected' && record.reject_reason && (
            <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
              原因: {record.reject_reason}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/hotels/edit/${record.id}`)}>
            编辑
          </Button>
          {['draft', 'rejected'].includes(record.status) && (
            <Popconfirm title="确认提交审核？" onConfirm={() => handleSubmit(record.id)}>
              <Button size="small" type="primary" icon={<SendOutlined />}>
                提交审核
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
        <h2 style={{ margin: 0 }}>我的酒店</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/hotels/create')}>
          新增酒店
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
