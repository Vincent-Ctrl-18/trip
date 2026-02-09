import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form, Input, InputNumber, Select, DatePicker, Button, Card, Space, message, Switch, Upload,
  Image,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { hotelAPI, uploadAPI } from '../../api';
import { useT, CITIES_DATA, TAGS_DATA } from '../../i18n';
import type { Language } from '../../i18n';
import dayjs from 'dayjs';

const FACILITIES_OPTIONS_DATA = [
  { zh: '免费WiFi', en: 'Free WiFi' },
  { zh: '游泳池', en: 'Swimming Pool' },
  { zh: '健身房', en: 'Gym' },
  { zh: '餐厅', en: 'Restaurant' },
  { zh: 'SPA', en: 'Spa' },
  { zh: '商务中心', en: 'Business Center' },
  { zh: '会议室', en: 'Meeting Room' },
  { zh: '免费停车场', en: 'Free Parking' },
  { zh: '花园', en: 'Garden' },
  { zh: '水上乐园', en: 'Water Park' },
  { zh: '水族馆', en: 'Aquarium' },
];

/* ========== Reusable Image Uploader Component ========== */

function ImageUploader({ value = [], onChange, maxCount = 10 }: {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
}) {
  const { t } = useT();
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const res = await uploadAPI.upload(file);
      const newUrls = [...value, res.data.url];
      onChange?.(newUrls);
      onSuccess?.(res.data);
    } catch (err: any) {
      message.error(t('admin.hotelForm.uploadFailed'));
      onError?.(err);
    } finally {
      setUploading(false);
    }
  }, [value, onChange, t]);

  const handleRemove = useCallback((idx: number) => {
    const newUrls = value.filter((_, i) => i !== idx);
    onChange?.(newUrls);
  }, [value, onChange]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {value.map((url, idx) => (
        <div
          key={`${url}-${idx}`}
          style={{
            position: 'relative',
            width: 104,
            height: 104,
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid #d9d9d9',
          }}
        >
          <Image
            src={url}
            alt={`img-${idx}`}
            width={104}
            height={104}
            style={{ objectFit: 'cover' }}
            preview={{ mask: false }}
          />
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(idx)}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 24,
              height: 24,
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              zIndex: 10,
            }}
          />
        </div>
      ))}
      {value.length < maxCount && (
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          accept="image/*"
          disabled={uploading}
        >
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 8,
              border: '1px dashed #d9d9d9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploading ? 'wait' : 'pointer',
              background: uploading ? '#fafafa' : '#fff',
              transition: 'border-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1677ff')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d9d9d9')}
          >
            <PlusOutlined style={{ fontSize: 20, color: '#999' }} />
            <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
              {uploading ? '...' : t('admin.hotelForm.uploadBtn')}
            </div>
          </div>
        </Upload>
      )}
    </div>
  );
}

/* ========== Mini Image Uploader for Room Types ========== */

function RoomImageUploader({ value = [], onChange }: {
  value?: string[];
  onChange?: (urls: string[]) => void;
}) {
  const { t } = useT();
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const res = await uploadAPI.upload(file);
      const newUrls = [...value, res.data.url];
      onChange?.(newUrls);
      onSuccess?.(res.data);
    } catch (err: any) {
      message.error(t('admin.hotelForm.uploadFailed'));
      onError?.(err);
    } finally {
      setUploading(false);
    }
  }, [value, onChange, t]);

  const handleRemove = useCallback((idx: number) => {
    const newUrls = value.filter((_, i) => i !== idx);
    onChange?.(newUrls);
  }, [value, onChange]);

  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {value.map((url, idx) => (
        <div
          key={`${url}-${idx}`}
          style={{
            position: 'relative',
            width: 56,
            height: 56,
            borderRadius: 6,
            overflow: 'hidden',
            border: '1px solid #d9d9d9',
            flexShrink: 0,
          }}
        >
          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <DeleteOutlined
            onClick={() => handleRemove(idx)}
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              color: '#ff4d4f',
              fontSize: 12,
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '50%',
              padding: 2,
            }}
          />
        </div>
      ))}
      {value.length < 3 && (
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          accept="image/*"
          disabled={uploading}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 6,
              border: '1px dashed #d9d9d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploading ? 'wait' : 'pointer',
              flexShrink: 0,
            }}
          >
            <PlusOutlined style={{ fontSize: 14, color: '#999' }} />
          </div>
        </Upload>
      )}
    </div>
  );
}

/* ========== Hotel Form Page ========== */

export default function HotelForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { t, lang } = useT();
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
          images: parseJSON(data.images),
          rooms: (data.RoomTypes || []).map((r: any) => ({
            name: r.name,
            price: r.price,
            original_price: r.original_price,
            capacity: r.capacity,
            breakfast: r.breakfast,
            images: parseJSON(r.images),
          })),
          nearbyPlaces: (data.NearbyPlaces || []).map((p: any) => ({
            type: p.type,
            name: p.name,
            distance: p.distance,
          })),
        });
      }).catch(() => {
        message.error(t('admin.hotelForm.loadFailed'));
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit, form, t]);

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        opening_date: values.opening_date ? values.opening_date.format('YYYY-MM-DD') : '',
        tags: values.tags || [],
        facilities: values.facilities || [],
        images: values.images || [],
        rooms: (values.rooms || []).map((r: any) => ({
          ...r,
          images: r.images || [],
        })),
        nearbyPlaces: values.nearbyPlaces || [],
      };

      if (isEdit) {
        await hotelAPI.update(id!, payload);
        message.success(t('admin.hotelForm.saveSuccess'));
      } else {
        await hotelAPI.create(payload);
        message.success(t('admin.hotelForm.createSuccess'));
      }
      navigate('/admin/hotels');
    } catch (err: any) {
      message.error(err.response?.data?.message || t('admin.hotelForm.saveFailed'));
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/hotels')}>{t('admin.hotelForm.back')}</Button>
        <h2 style={{ margin: 0 }}>{isEdit ? t('admin.hotelForm.edit') : t('admin.hotelForm.create')}</h2>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{ star: 3, images: [], rooms: [{ capacity: 2, breakfast: false, images: [] }], nearbyPlaces: [] }}
      >
        <Card title={t('admin.hotelForm.basicInfo')} style={{ marginBottom: 16 }}>
          <Form.Item name="name_cn" label={t('admin.hotelForm.nameCn')} rules={[{ required: true, message: t('admin.hotelForm.nameCnRequired') }]}>
            <Input placeholder={t('admin.hotelForm.nameCnPlaceholder')} />
          </Form.Item>
          <Form.Item name="name_en" label={t('admin.hotelForm.nameEn')}>
            <Input placeholder={t('admin.hotelForm.nameEnPlaceholder')} />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="city" label={t('admin.hotelForm.city')} rules={[{ required: true, message: t('admin.hotelForm.cityRequired') }]} style={{ minWidth: 160 }}>
              <Select
                placeholder={t('admin.hotelForm.cityPlaceholder')}
                options={CITIES_DATA.map((c) => ({ value: c.zh, label: c[lang as Language] }))}
              />
            </Form.Item>
            <Form.Item name="star" label={t('admin.hotelForm.star')} style={{ minWidth: 120 }}>
              <Select options={[1, 2, 3, 4, 5].map((s) => ({ value: s, label: `${s}★` }))} />
            </Form.Item>
            <Form.Item name="opening_date" label={t('admin.hotelForm.openingDate')}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="address" label={t('admin.hotelForm.address')} rules={[{ required: true, message: t('admin.hotelForm.addressRequired') }]}>
            <Input placeholder={t('admin.hotelForm.addressPlaceholder')} />
          </Form.Item>
          <Form.Item name="description" label={t('admin.hotelForm.description')}>
            <Input.TextArea rows={3} placeholder={t('admin.hotelForm.descriptionPlaceholder')} />
          </Form.Item>
          <Form.Item name="tags" label={t('admin.hotelForm.tags')}>
            <Select
              mode="multiple"
              placeholder={t('admin.hotelForm.tagsPlaceholder')}
              options={TAGS_DATA.map((td) => ({ value: td.zh, label: td[lang as Language] }))}
            />
          </Form.Item>
          <Form.Item name="facilities" label={t('admin.hotelForm.facilities')}>
            <Select
              mode="multiple"
              placeholder={t('admin.hotelForm.facilitiesPlaceholder')}
              options={FACILITIES_OPTIONS_DATA.map((f) => ({ value: f.zh, label: f[lang as Language] }))}
            />
          </Form.Item>

          {/* Hotel Images Upload */}
          <Form.Item
            name="images"
            label={t('admin.hotelForm.hotelImages')}
            extra={t('admin.hotelForm.hotelImagesHint')}
          >
            <ImageUploader maxCount={10} />
          </Form.Item>
        </Card>

        <Card title={t('admin.hotelForm.roomInfo')} style={{ marginBottom: 16 }}>
          <Form.List name="rooms">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    style={{
                      padding: 16,
                      background: '#fafafa',
                      borderRadius: 8,
                      marginBottom: 12,
                      border: '1px solid #f0f0f0',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 10 }}>
                      <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: t('admin.hotelForm.roomNameRequired') }]} style={{ flex: 2, minWidth: 150, marginBottom: 0 }}>
                        <Input placeholder={t('admin.hotelForm.roomName')} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true, message: t('admin.hotelForm.priceRequired') }]} style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
                        <InputNumber placeholder={t('admin.hotelForm.price')} min={0} style={{ width: '100%' }} prefix="¥" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'original_price']} style={{ flex: 1, minWidth: 100, marginBottom: 0 }}>
                        <InputNumber placeholder={t('admin.hotelForm.originalPrice')} min={0} style={{ width: '100%' }} prefix="¥" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'capacity']} style={{ width: 90, marginBottom: 0 }}>
                        <InputNumber placeholder={t('admin.hotelForm.capacity')} min={1} max={10} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, 'breakfast']} valuePropName="checked" style={{ marginBottom: 0 }}>
                        <Switch checkedChildren={t('admin.hotelForm.breakfastYes')} unCheckedChildren={t('admin.hotelForm.breakfastNo')} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ marginTop: 8, color: '#ff4d4f', fontSize: 18 }} />
                    </div>
                    {/* Room Images */}
                    <Form.Item
                      {...restField}
                      name={[name, 'images']}
                      label={<span style={{ fontSize: 13, color: '#666' }}>{t('admin.hotelForm.roomImages')}</span>}
                      style={{ marginBottom: 0 }}
                    >
                      <RoomImageUploader />
                    </Form.Item>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add({ capacity: 2, breakfast: false, images: [] })} block icon={<PlusOutlined />}>
                  {t('admin.hotelForm.addRoom')}
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Card title={t('admin.hotelForm.nearbyInfo')} style={{ marginBottom: 16 }}>
          <Form.List name="nearbyPlaces">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <Form.Item {...restField} name={[name, 'type']} rules={[{ required: true }]} style={{ width: 120, marginBottom: 0 }}>
                      <Select placeholder={t('admin.hotelForm.nearbyType')} options={[
                        { value: 'attraction', label: t('admin.hotelForm.nearbyAttraction') },
                        { value: 'transport', label: t('admin.hotelForm.nearbyTransport') },
                        { value: 'mall', label: t('admin.hotelForm.nearbyMall') },
                      ]} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true }]} style={{ flex: 1, marginBottom: 0 }}>
                      <Input placeholder={t('admin.hotelForm.nearbyName')} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'distance']} rules={[{ required: true }]} style={{ width: 120, marginBottom: 0 }}>
                      <Input placeholder={t('admin.hotelForm.nearbyDistance')} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', fontSize: 18 }} />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('admin.hotelForm.addNearby')}
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={() => navigate('/admin/hotels')}>{t('common.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {isEdit ? t('admin.hotelForm.saveBtn') : t('admin.hotelForm.createBtn')}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
}
