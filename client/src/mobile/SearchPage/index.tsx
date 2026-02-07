import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, Toast } from 'antd-mobile';
import { hotelAPI } from '../../api';
import useSearchStore from '../../stores/useSearchStore';
import CalendarPicker from '../../components/CalendarPicker';
import dayjs from 'dayjs';
import './style.css';

const CITIES = ['上海', '北京', '杭州', '三亚', '成都', '广州', '深圳', '西安'];
const TAGS = ['豪华', '亲子', '度假', '商务', '江景', '海景', '湖景', '免费停车场', '历史建筑', '新开业'];

export default function SearchPage() {
  const navigate = useNavigate();
  const store = useSearchStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    hotelAPI.banner().then((res) => setBanners(res.data)).catch(() => {});
  }, []);

  const handleSearch = () => {
    navigate('/m/list');
  };

  const handleBannerClick = (id: number) => {
    navigate(`/m/hotel/${id}`);
  };

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

  const nights = dayjs(store.checkOut).diff(dayjs(store.checkIn), 'day');

  return (
    <div className="search-page">
      {/* Banner */}
      {banners.length > 0 && (
        <Swiper autoplay loop className="banner-swiper">
          {banners.map((h: any) => (
            <Swiper.Item key={h.id} onClick={() => handleBannerClick(h.id)}>
              <div className="banner-item">
                <div className="banner-bg" style={{ background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` }}>
                  <div className="banner-content">
                    <div className="banner-star">{'★'.repeat(h.star)}</div>
                    <div className="banner-name">{h.name_cn}</div>
                    <div className="banner-name-en">{h.name_en}</div>
                    <div className="banner-city">{h.city}</div>
                  </div>
                </div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      )}

      {/* Search Area */}
      <div className="search-area">
        <h2 className="search-title">易宿 · 找到理想住处</h2>

        {/* City */}
        <div className="search-field" onClick={() => setShowCityPicker(!showCityPicker)}>
          <span className="field-label">目的地</span>
          <span className="field-value">{store.city || '请选择城市'}</span>
        </div>
        {showCityPicker && (
          <div className="city-picker">
            {CITIES.map((c) => (
              <div
                key={c}
                className={`city-item ${store.city === c ? 'active' : ''}`}
                onClick={() => { store.setCity(c); setShowCityPicker(false); }}
              >
                {c}
              </div>
            ))}
          </div>
        )}

        {/* Date */}
        <div className="date-row">
          <div className="date-field" onClick={() => openCalendar('checkIn')}>
            <span className="field-label">入住</span>
            <span className="field-value">{dayjs(store.checkIn).format('MM月DD日')}</span>
          </div>
          <div className="date-nights">{nights}晚</div>
          <div className="date-field" onClick={() => openCalendar('checkOut')}>
            <span className="field-label">离店</span>
            <span className="field-value">{dayjs(store.checkOut).format('MM月DD日')}</span>
          </div>
        </div>

        {/* Keyword */}
        <div className="search-field">
          <span className="field-label">搜索</span>
          <input
            className="field-input"
            placeholder="酒店名/地址"
            value={store.keyword}
            onChange={(e) => store.setKeyword(e.target.value)}
          />
        </div>

        {/* Star Filter */}
        <div className="filter-section">
          <span className="filter-label">星级</span>
          <div className="filter-options">
            {[null, 3, 4, 5].map((s) => (
              <div
                key={s ?? 'all'}
                className={`filter-chip ${store.star === s ? 'active' : ''}`}
                onClick={() => store.setStar(s)}
              >
                {s ? `${s}星` : '不限'}
              </div>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="filter-section">
          <span className="filter-label">价格</span>
          <div className="filter-options">
            {[
              { label: '不限', min: null, max: null },
              { label: '¥500以下', min: null, max: 500 },
              { label: '¥500-1000', min: 500, max: 1000 },
              { label: '¥1000-2000', min: 1000, max: 2000 },
              { label: '¥2000以上', min: 2000, max: null },
            ].map((p) => (
              <div
                key={p.label}
                className={`filter-chip ${store.minPrice === p.min && store.maxPrice === p.max ? 'active' : ''}`}
                onClick={() => store.setPriceRange(p.min, p.max)}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="filter-section">
          <span className="filter-label">快捷标签</span>
          <div className="filter-options tags">
            {TAGS.map((t) => (
              <div
                key={t}
                className={`filter-chip tag ${store.tag === t ? 'active' : ''}`}
                onClick={() => store.setTag(store.tag === t ? '' : t)}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button className="search-btn" onClick={handleSearch}>
          查询酒店
        </button>
      </div>

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
