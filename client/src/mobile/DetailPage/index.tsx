import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, DotLoading } from 'antd-mobile';
import { hotelAPI } from '../../api';
import useSearchStore from '../../stores/useSearchStore';
import CalendarPicker from '../../components/CalendarPicker';
import dayjs from 'dayjs';
import './style.css';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useSearchStore();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'checkIn' | 'checkOut'>('checkIn');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    hotelAPI.detail(id).then((res) => {
      setHotel(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <DotLoading />
      </div>
    );
  }

  if (!hotel) {
    return <div className="detail-empty">酒店不存在</div>;
  }

  const parseJSON = (str: string) => {
    try { return JSON.parse(str); } catch { return []; }
  };

  const tags = parseJSON(hotel.tags);
  const facilities = parseJSON(hotel.facilities);
  const images = parseJSON(hotel.images);
  const rooms = (hotel.RoomTypes || []).sort((a: any, b: any) => a.price - b.price);
  const nearby = hotel.NearbyPlaces || [];
  const nights = dayjs(store.checkOut).diff(dayjs(store.checkIn), 'day');

  const openCalendar = (type: 'checkIn' | 'checkOut') => {
    setCalendarType(type);
    setShowCalendar(true);
  };

  const handleDateSelect = (date: string) => {
    if (calendarType === 'checkIn') {
      store.setCheckIn(date);
      if (dayjs(date).isAfter(dayjs(store.checkOut).subtract(1, 'day'))) {
        store.setCheckOut(dayjs(date).add(1, 'day').format('YYYY-MM-DD'));
      }
    } else {
      store.setCheckOut(date);
    }
    setShowCalendar(false);
  };

  return (
    <div className="detail-page">
      {/* Top Nav */}
      <div className="detail-nav">
        <div className="nav-back" onClick={() => navigate(-1)}>←</div>
        <div className="nav-title">{hotel.name_cn}</div>
      </div>

      {/* Image Banner */}
      <div className="detail-banner">
        {images.length > 0 ? (
          <Swiper loop>
            {images.map((img: string, idx: number) => (
              <Swiper.Item key={idx}>
                <div className="banner-img-item">
                  <div className="banner-img-placeholder">
                    <span>{hotel.name_cn.charAt(0)}</span>
                    <small>图片 {idx + 1}/{images.length}</small>
                  </div>
                </div>
              </Swiper.Item>
            ))}
          </Swiper>
        ) : (
          <div className="banner-img-item">
            <div className="banner-img-placeholder">
              <span>{hotel.name_cn.charAt(0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Hotel Info */}
      <div className="detail-info">
        <h1 className="info-name">{hotel.name_cn}</h1>
        <div className="info-name-en">{hotel.name_en}</div>
        <div className="info-star">{'★'.repeat(hotel.star)}{'☆'.repeat(5 - hotel.star)} {hotel.star}星级酒店</div>

        {hotel.description && (
          <div className="info-desc">{hotel.description}</div>
        )}

        <div className="info-row">
          <span className="info-label">地址</span>
          <span className="info-value">{hotel.address}</span>
        </div>
        <div className="info-row">
          <span className="info-label">开业时间</span>
          <span className="info-value">{hotel.opening_date || '未知'}</span>
        </div>

        {facilities.length > 0 && (
          <div className="info-facilities">
            <div className="section-title">酒店设施</div>
            <div className="facility-list">
              {facilities.map((f: string) => (
                <span key={f} className="facility-item">{f}</span>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="info-tags">
            {tags.map((t: string) => (
              <span key={t} className="detail-tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Date Banner */}
      <div className="detail-date-banner">
        <div className="date-section" onClick={() => openCalendar('checkIn')}>
          <span className="date-label">入住</span>
          <span className="date-val">{dayjs(store.checkIn).format('MM月DD日')}</span>
        </div>
        <div className="date-nights-badge">{nights}晚</div>
        <div className="date-section" onClick={() => openCalendar('checkOut')}>
          <span className="date-label">离店</span>
          <span className="date-val">{dayjs(store.checkOut).format('MM月DD日')}</span>
        </div>
      </div>

      {/* Room List */}
      <div className="detail-rooms">
        <div className="section-title">房型价格</div>
        {rooms.length === 0 ? (
          <div className="no-rooms">暂无房型信息</div>
        ) : (
          rooms.map((room: any) => (
            <div key={room.id} className="room-card">
              <div className="room-info">
                <div className="room-name">{room.name}</div>
                <div className="room-details">
                  <span>{room.capacity}人入住</span>
                  {room.breakfast && <span className="room-breakfast">含早餐</span>}
                </div>
              </div>
              <div className="room-price-area">
                {room.original_price && room.original_price > room.price && (
                  <div className="room-original-price">?{room.original_price}</div>
                )}
                <div className="room-price">
                  <span className="price-sign">?</span>
                  <span className="price-amount">{room.price}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Nearby Places */}
      {nearby.length > 0 && (
        <div className="detail-nearby">
          <div className="section-title">周边信息</div>
          {nearby.map((place: any) => (
            <div key={place.id} className="nearby-item">
              <span className={`nearby-type ${place.type}`}>
                {place.type === 'attraction' ? '景点' : place.type === 'transport' ? '交通' : '商场'}
              </span>
              <span className="nearby-name">{place.name}</span>
              <span className="nearby-distance">{place.distance}</span>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarPicker
          value={calendarType === 'checkIn' ? store.checkIn : store.checkOut}
          minDate={calendarType === 'checkOut' ? dayjs(store.checkIn).add(1, 'day').format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')}
          onSelect={handleDateSelect}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
