import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form, Input, InputNumber, Select, DatePicker, Button, Card, Space, message, Upload, Switch, Divider,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { hotelAPI, uploadAPI } from '../../api';
import dayjs from 'dayjs';

const CITIES = ['上海', '北京', '杭州', '三亚', '成都', '广州', '深圳', '西安', '南京', '重庆'];
const TAGS_OPTIONS = ['豪华', '亲子', '度假', '商务', '江景', '海景', '湖景', '城景', '免费停车场', '历史建筑', '新开业'];
const FACILITIES_OPTIONS = ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '商务中心', '会议室', '免费停车场', '花园', '水上乐园', '水族馆'];

export default function HotelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      hotelAPI.detail(id!).then((res) => {
        const data = res.data;
        const parseJSON = (s: string) => { try { return JSON.parse(s); } catch { return []; } };
        form.setFieldsValue({
          name_cn: data.name_cn,
          name_en: data.name_en,
          city: data.city,
          address: data.address,
          star: data.star,
          opening_date: data.opening_date ? dayjs(data.opening_date) : null,
          description: data.description,
          tags: parseJSON(data.tags),
          facilities: parseJSON(data.facilities),
          rooms: (data.RoomTypes || []).map((r: any) => ({
            name: r.name,
            price: r.price,
            original_price: r.original_price,
            capacity: r.capacity,
            breakfast: r.breakfast,
          })),
          nearbyPlaces: (data.NearbyPlaces || []).map((p: any) => ({
            type: p.type,
            name: p.name,
            distance: p.distance,
          })),
        });
      }).catch(() => {
        message.error('加载酒店信息失败');
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit, form]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        opening_date: values.opening_date ? values.opening_date.format('YYYY-MM-DD') : '',
        tags: values.tags || [],
        facilities: values.facilities || [],
        images: [],
        rooms: values.rooms || [],
        nearbyPlaces: values.nearbyPlaces || [],
      };

      if (isEdit) {
        await hotelAPI.update(id!, payload);
        message.success('保存成功');
      } else {
        await hotelAPI.create(payload);
        message.success('创建成功');
      }
      navigate('/admin/hotels');
    } catch (err: any) {
      message.error(err.response?.data?.message || '保存失败');
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/hotels')}>返回</Button>
        <h2 style={{ margin: 0 }}>{isEdit ? '编辑酒店' : '新增酒店'}</h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{ star: 3, rooms: [{ capacity: 2, breakfast: false }], nearbyPlaces: [] }}
      >
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Form.Item name="name_cn" label="酒店名称（中文）" rules={[{ required: true, message: '请输入中文名' }]}>
            <Input placeholder="如：上海外滩华尔道夫酒店" />
          </Form.Item>
          <Form.Item name="name_en" label="酒店名称（英文）">
            <Input placeholder="如：Waldorf Astoria Shanghai" />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="city" label="城市" rules={[{ required: true, message: '请选择城市' }]} style={{ minWidth: 160 }}>
              <Select placeholder="选择城市" options={CITIES.map((c) => ({ value: c, label: c }))} />
            </Form.Item>
            <Form.Item name="star" label="星级" style={{ minWidth: 120 }}>
              <Select options={[1,2,3,4,5].map((s) => ({ value: s, label: `${s}星` }))} />
            </Form.Item>
            <Form.Item name="opening_date" label="开业时间">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="address" label="详细地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input placeholder="详细地址" />
          </Form.Item>
          <Form.Item name="description" label="酒店描述">
            <Input.TextArea rows={3} placeholder="描述酒店特色..." />
          </Form.Item>
          <Form.Item name="tags" label="酒店标签">
            <Select mode="multiple" placeholder="选择标签" options={TAGS_OPTIONS.map((t) => ({ value: t, label: t }))} />
          </Form.Item>
          <Form.Item name="facilities" label="酒店设施">
            <Select mode="multiple" placeholder="选择设施" options={FACILITIES_OPTIONS.map((f) => ({ value: f, label: f }))} />
          </Form.Item>
        </Card>

        <Card title="房型信息" style={{ marginBottom: 16 }}>
          <Form.List name="rooms">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start', flexWrap: 'wrap', padding: 12, background: '#fafafa', borderRadius: 8 }}>
                    <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: '房型名' }]} style={{ flex: 2, minWidth: 150, marginBottom: 0 }}>
                      <Input placeholder="房型名称" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true, message: '价格' }]} style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
                      <InputNumber placeholder="价格" min={0} style={{ width: '100%' }} prefix="?" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'original_price']} style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
                      <InputNumber placeholder="原价（可选）" min={0} style={{ width: '100%' }} prefix="?" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'capacity']} style={{ width: 90, marginBottom: 0 }}>
                      <InputNumber placeholder="人数" min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'breakfast']} valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Switch checkedChildren="含早" unCheckedChildren="无早" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ marginTop: 8, color: '#ff4d4f', fontSize: 18 }} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add({ capacity: 2, breakfast: false })} block icon={<PlusOutlined />}>
                  添加房型
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="周边信息（可选）" style={{ marginBottom: 16 }}>
          <Form.List name="nearbyPlaces">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <Form.Item {...restField} name={[name, 'type']} rules={[{ required: true }]} style={{ width: 120, marginBottom: 0 }}>
                      <Select placeholder="类型" options={[
                        { value: 'attraction', label: '景点' },
                        { value: 'transport', label: '交通' },
                        { value: 'mall', label: '商场' },
                      ]} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
                      <Input placeholder="名称" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'distance']} rules={[{ required: true }]} style={{ width: 120, marginBottom: 0 }}>
                      <Input placeholder="距离" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', fontSize: 18 }} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加周边信息
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => navigate('/admin/hotels')}>取消</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {isEdit ? '保存修改' : '创建酒店'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
