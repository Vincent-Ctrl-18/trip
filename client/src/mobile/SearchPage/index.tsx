import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper } from 'antd-mobile';
import { hotelAPI } from '../../api';
import useSearchStore from '../../stores/useSearchStore';
import { getFirstImageUrl, parseJSON } from '../../utils';
import {
  useT, useLanguageStore,
  CITIES_DATA, TAGS_DATA,
  translateCity, formatDate,
} from '../../i18n';
import type { Language } from '../../i18n';
import CalendarPicker from '../../components/CalendarPicker';
import dayjs from 'dayjs';
import './style.css';

const SEARCH_HISTORY_KEY = 'trip-search-history';
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
  return parseJSON<string[]>(localStorage.getItem(SEARCH_HISTORY_KEY)) ?? [];
}

function addSearchHistory(keyword: string) {
  if (!keyword.trim()) return;
  const history = getSearchHistory().filter((h) => h !== keyword.trim());
  history.unshift(keyword.trim());
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export default function SearchPage() {
  const navigate = useNavigate();
  const store = useSearchStore();
  const { t, lang } = useT();
  const toggleLang = useLanguageStore((s) => s.toggleLang);

  const [banners, setBanners] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [searchHistory, setSearchHistory] = useState<string[]>(getSearchHistory);

  useEffect(() => {
    hotelAPI.banner().then((res) => setBanners(res.data)).catch(() => {});
  }, []);

  const handleSearch = () => {
    if (store.keyword.trim()) {
      addSearchHistory(store.keyword);
      setSearchHistory(getSearchHistory());
    }
    navigate('/m/list');
  };

  const clearHistory = useCallback(() => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setSearchHistory([]);
  }, []);

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

  const getBannerImg = (h: any): string | null => {
    return getFirstImageUrl(h.images);
  };

  return (
    <div className="sp-page">
      {/* Hero Banner */}
      <div className="sp-hero">
        {banners.length > 0 ? (
          <Swiper autoplay loop indicator={() => null} style={{ '--height': '280px' } as React.CSSProperties}>
            {banners.map((h: any) => {
              const imgUrl = getBannerImg(h);
              const hasError = imgErrors[h.id];
              return (
                <Swiper.Item key={h.id}>
                  <div className="sp-banner-item" onClick={() => handleBannerClick(h.id)}>
                    {imgUrl && !hasError ? (
                      <img
                        className="sp-banner-img"
                        src={imgUrl}
                        alt={h.name_cn}
                        onError={() => setImgErrors((prev) => ({ ...prev, [h.id]: true }))}
                      />
                    ) : (
                      <div className="sp-banner-bg-fallback" />
                    )}
                    <div className="sp-banner-overlay" />
                    <div className="sp-banner-content">
                      <div className="sp-banner-star">{'★'.repeat(h.star)}</div>
                      <div className="sp-banner-name">
                        {lang === 'en' && h.name_en ? h.name_en : h.name_cn}
                      </div>
                      {lang === 'en' && h.name_cn && (
                        <div className="sp-banner-sub">{h.name_cn}</div>
                      )}
                      {lang === 'zh' && h.name_en && (
                        <div className="sp-banner-sub">{h.name_en}</div>
                      )}
                      <div className="sp-banner-city">
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                        {translateCity(h.city, lang)}
                      </div>
                    </div>
                  </div>
                </Swiper.Item>
              );
            })}
          </Swiper>
        ) : (
          <div className="sp-hero-placeholder">
            <span className="sp-hero-logo">{t('app.name')}</span>
            <span className="sp-hero-tagline">{t('app.tagline')}</span>
          </div>
        )}

        {/* Floating language switcher */}
        <div className="sp-hero-actions">
          <button className="lang-switch-btn" onClick={toggleLang}>
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>

        {/* Gradient overlay */}
        <div className="sp-hero-gradient" />
      </div>

      {/* Search Card */}
      <div className="sp-search-card">
        <h2 className="sp-search-title">{t('search.title')}</h2>

        {/* Destination */}
        <div className="sp-field" onClick={() => setShowCityPicker(!showCityPicker)}>
          <div className="sp-field-icon">
            <span className="material-symbols-outlined">location_on</span>
          </div>
          <div className="sp-field-body">
            <span className="sp-field-label">{t('search.destination')}</span>
            <span className="sp-field-value">
              {store.city ? translateCity(store.city, lang) : t('search.selectCity')}
            </span>
          </div>
          <span className="material-symbols-outlined sp-field-arrow">expand_more</span>
        </div>

        {/* City Picker */}
        {showCityPicker && (
          <div className="sp-city-grid">
            {CITIES_DATA.map((c) => (
              <div
                key={c.key}
                className={`sp-city-item ${store.city === c.zh ? 'active' : ''}`}
                onClick={() => { store.setCity(c.zh); setShowCityPicker(false); }}
              >
                <span className="sp-city-icon">
                  <span className="material-symbols-outlined">apartment</span>
                </span>
                <span className="sp-city-name">{c[lang as Language]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Date Row */}
        <div className="sp-date-row">
          <div className="sp-date-field" onClick={() => openCalendar('checkIn')}>
            <span className="material-symbols-outlined sp-date-icon">calendar_today</span>
            <div className="sp-date-body">
              <span className="sp-field-label">{t('search.checkIn')}</span>
              <span className="sp-date-value">{formatDate(store.checkIn, lang)}</span>
            </div>
          </div>
          <div className="sp-date-nights">{t('search.nights', { n: nights })}</div>
          <div className="sp-date-field" onClick={() => openCalendar('checkOut')}>
            <span className="material-symbols-outlined sp-date-icon">calendar_today</span>
            <div className="sp-date-body">
              <span className="sp-field-label">{t('search.checkOut')}</span>
              <span className="sp-date-value">{formatDate(store.checkOut, lang)}</span>
            </div>
          </div>
        </div>

        {/* Room & Guest */}
        <div className="sp-field" onClick={() => setShowRoomPicker(!showRoomPicker)}>
          <div className="sp-field-icon">
            <span className="material-symbols-outlined">hotel</span>
          </div>
          <div className="sp-field-body">
            <span className="sp-field-label">{t('search.roomGuest')}</span>
            <span className="sp-field-value">
              {t('search.rooms', { n: store.roomCount })} · {t('search.adults', { n: store.adultCount })}
            </span>
          </div>
          <span className="material-symbols-outlined sp-field-arrow">expand_more</span>
        </div>

        {/* Room/Guest Picker */}
        {showRoomPicker && (
          <div className="sp-room-picker">
            <div className="sp-room-picker-row">
              <span className="sp-room-picker-label">{t('search.roomCount')}</span>
              <div className="sp-counter">
                <button className="sp-counter-btn" onClick={() => store.setRoomCount(store.roomCount - 1)} disabled={store.roomCount <= 1}>
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="sp-counter-value">{store.roomCount}</span>
                <button className="sp-counter-btn" onClick={() => store.setRoomCount(store.roomCount + 1)} disabled={store.roomCount >= 10}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
            <div className="sp-room-picker-row">
              <span className="sp-room-picker-label">{t('search.adultCount')}</span>
              <div className="sp-counter">
                <button className="sp-counter-btn" onClick={() => store.setAdultCount(store.adultCount - 1)} disabled={store.adultCount <= 1}>
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <span className="sp-counter-value">{store.adultCount}</span>
                <button className="sp-counter-btn" onClick={() => store.setAdultCount(store.adultCount + 1)} disabled={store.adultCount >= 20}>
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keyword */}
        <div className="sp-field">
          <div className="sp-field-icon">
            <span className="material-symbols-outlined">search</span>
          </div>
          <div className="sp-field-body">
            <span className="sp-field-label">{t('search.keyword')}</span>
            <input
              className="sp-field-input"
              placeholder={t('search.keywordPlaceholder')}
              value={store.keyword}
              onChange={(e) => store.setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="sp-history">
            <div className="sp-history-header">
              <span className="sp-history-title">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>history</span>
                {t('search.history')}
              </span>
              <button className="sp-history-clear" onClick={clearHistory}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                {t('search.clearHistory')}
              </button>
            </div>
            <div className="sp-history-chips">
              {searchHistory.map((kw) => (
                <span
                  key={kw}
                  className="sp-history-chip"
                  onClick={() => { store.setKeyword(kw); }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Star Filter */}
        <div className="sp-filter">
          <span className="sp-filter-label">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>star</span>
            {t('search.star')}
          </span>
          <div className="sp-filter-chips">
            {[null, 3, 4, 5].map((s) => (
              <div
                key={s ?? 'all'}
                className={`sp-chip ${store.star === s ? 'active' : ''}`}
                onClick={() => store.setStar(s)}
              >
                {s ? t('search.starN', { n: s }) : t('search.noLimit')}
              </div>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="sp-filter">
          <span className="sp-filter-label">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>payments</span>
            {t('search.price')}
          </span>
          <div className="sp-filter-chips">
            {[
              { label: t('search.noLimit'), min: null, max: null },
              { label: t('search.priceBelow', { n: 500 }), min: null, max: 500 },
              { label: t('search.priceRange', { min: 500, max: 1000 }), min: 500, max: 1000 },
              { label: t('search.priceRange', { min: 1000, max: 2000 }), min: 1000, max: 2000 },
              { label: t('search.priceAbove', { n: 2000 }), min: 2000, max: null },
            ].map((p) => (
              <div
                key={p.label}
                className={`sp-chip ${store.minPrice === p.min && store.maxPrice === p.max ? 'active' : ''}`}
                onClick={() => store.setPriceRange(p.min, p.max)}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="sp-filter">
          <span className="sp-filter-label">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sell</span>
            {t('search.tags')}
          </span>
          <div className="sp-filter-chips tags">
            {TAGS_DATA.map((td) => (
              <div
                key={td.zh}
                className={`sp-chip tag ${store.tag === td.zh ? 'active' : ''}`}
                onClick={() => store.setTag(store.tag === td.zh ? '' : td.zh)}
              >
                {td[lang as Language]}
              </div>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <button className="sp-search-btn" onClick={handleSearch}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
          {t('search.button')}
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
