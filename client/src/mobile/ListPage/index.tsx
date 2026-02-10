import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLoading } from 'antd-mobile';
import { Virtuoso } from 'react-virtuoso';
import { hotelAPI } from '../../api';
import useSearchStore from '../../stores/useSearchStore';
import {
  useT, useLanguageStore,
  translateCity, translateTag, formatDate,
  CITIES_DATA, TAGS_DATA,
} from '../../i18n';
import type { Language } from '../../i18n';
import { parseJSON, getFirstImageUrl } from '../../utils';
import CalendarPicker from '../../components/CalendarPicker';
import dayjs from 'dayjs';
import './style.css';

export default function ListPage() {
  const navigate = useNavigate();
  const store = useSearchStore();
  const { t, lang } = useT();
  const toggleLang = useLanguageStore((s) => s.toggleLang);

  const [hotels, setHotels] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const pageSize = 10;
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const abortRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);

  // UI states
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Temp filter state (for the filter panel)
  const [tempStar, setTempStar] = useState<number | null>(store.star);
  const [tempTag, setTempTag] = useState(store.tag);
  const [tempMinPrice, setTempMinPrice] = useState<number | null>(store.minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState<number | null>(store.maxPrice);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params: Record<string, any> = { page: pageRef.current, pageSize };
      if (store.city) params.city = store.city;
      if (store.keyword) params.keyword = store.keyword;
      if (store.star) params.star = store.star;
      if (store.minPrice) params.minPrice = store.minPrice;
      if (store.maxPrice) params.maxPrice = store.maxPrice;
      if (store.tag) params.tag = store.tag;

      const res = await hotelAPI.search(params);
      if (controller.signal.aborted) return;

      const newData = res.data.data || [];
      if (pageRef.current === 1) {
        setHotels(newData);
      } else {
        setHotels((prev) => [...prev, ...newData]);
      }
      setHasMore(newData.length >= pageSize);
      pageRef.current += 1;
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error(err);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
    }
  }, [store.city, store.keyword, store.star, store.minPrice, store.maxPrice, store.tag]);

  // Load first page on mount & whenever filters change
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    loadingRef.current = false;
    pageRef.current = 1;
    setHotels([]);
    setHasMore(true);
    loadMore();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [loadMore]);

  const nights = dayjs(store.checkOut).diff(dayjs(store.checkIn), 'day');

  const hasFilters = store.star || store.tag || store.minPrice || store.maxPrice;

  const getFirstImage = (hotel: any): string | null => {
    return getFirstImageUrl(hotel.images);
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

  const openFilterPanel = () => {
    setTempStar(store.star);
    setTempTag(store.tag);
    setTempMinPrice(store.minPrice);
    setTempMaxPrice(store.maxPrice);
    setShowFilterPanel(true);
  };

  const applyFilters = () => {
    store.setStar(tempStar);
    store.setTag(tempTag);
    store.setPriceRange(tempMinPrice, tempMaxPrice);
    setShowFilterPanel(false);
  };

  const resetFilters = () => {
    setTempStar(null);
    setTempTag('');
    setTempMinPrice(null);
    setTempMaxPrice(null);
  };

  return (
    <div className="lp-page">
      {/* Header */}
      <div className="lp-header">
        <button className="lp-back-btn" onClick={() => navigate('/m')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="lp-header-info" onClick={() => setShowSearchPanel(!showSearchPanel)}>
          <span className="lp-header-city">
            {store.city ? translateCity(store.city, lang) : t('list.allCities')}
          </span>
          <span className="lp-header-date">
            {formatDate(store.checkIn, lang)} - {formatDate(store.checkOut, lang)} · {t('search.nights', { n: nights })}
          </span>
        </div>
        <div className="lp-header-right">
          <button className="lp-filter-btn" onClick={openFilterPanel}>
            <span className="material-symbols-outlined">tune</span>
          </button>
          <button className="lp-lang-btn" onClick={toggleLang}>
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>

      {/* Expandable Search Panel */}
      {showSearchPanel && (
        <div className="lp-search-panel">
          <div className="lp-search-mask" onClick={() => setShowSearchPanel(false)} />
          <div className="lp-search-sheet">
            <div className="lp-sheet-handle"><div className="lp-sheet-bar" /></div>
            <h3 className="lp-sheet-title">{t('list.modifySearch')}</h3>

            {/* City */}
            <div className="lp-sp-field" onClick={() => setShowCityPicker(!showCityPicker)}>
              <span className="material-symbols-outlined lp-sp-icon">location_on</span>
              <span className="lp-sp-label">{t('search.destination')}</span>
              <span className="lp-sp-value">{store.city ? translateCity(store.city, lang) : t('search.selectCity')}</span>
              <span className="material-symbols-outlined lp-sp-arrow">expand_more</span>
            </div>

            {showCityPicker && (
              <div className="lp-city-grid">
                {CITIES_DATA.map((c) => (
                  <div
                    key={c.key}
                    className={`lp-city-item ${store.city === c.zh ? 'active' : ''}`}
                    onClick={() => { store.setCity(c.zh); setShowCityPicker(false); }}
                  >
                    {c[lang as Language]}
                  </div>
                ))}
              </div>
            )}

            {/* Date */}
            <div className="lp-sp-date-row">
              <div className="lp-sp-date" onClick={() => openCalendar('checkIn')}>
                <span className="lp-sp-label">{t('search.checkIn')}</span>
                <span className="lp-sp-date-val">{formatDate(store.checkIn, lang)}</span>
              </div>
              <div className="lp-sp-nights">{t('search.nights', { n: nights })}</div>
              <div className="lp-sp-date" onClick={() => openCalendar('checkOut')}>
                <span className="lp-sp-label">{t('search.checkOut')}</span>
                <span className="lp-sp-date-val">{formatDate(store.checkOut, lang)}</span>
              </div>
            </div>

            {/* Room & Guest */}
            <div className="lp-sp-room-row">
              <div className="lp-sp-room-item">
                <span className="lp-sp-label">{t('search.roomCount')}</span>
                <div className="lp-sp-counter">
                  <button className="lp-sp-counter-btn" onClick={() => store.setRoomCount(store.roomCount - 1)} disabled={store.roomCount <= 1}>
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="lp-sp-counter-val">{store.roomCount}</span>
                  <button className="lp-sp-counter-btn" onClick={() => store.setRoomCount(store.roomCount + 1)} disabled={store.roomCount >= 10}>
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
              <div className="lp-sp-room-item">
                <span className="lp-sp-label">{t('search.adultCount')}</span>
                <div className="lp-sp-counter">
                  <button className="lp-sp-counter-btn" onClick={() => store.setAdultCount(store.adultCount - 1)} disabled={store.adultCount <= 1}>
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="lp-sp-counter-val">{store.adultCount}</span>
                  <button className="lp-sp-counter-btn" onClick={() => store.setAdultCount(store.adultCount + 1)} disabled={store.adultCount >= 20}>
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Keyword */}
            <div className="lp-sp-field">
              <span className="material-symbols-outlined lp-sp-icon">search</span>
              <input
                className="lp-sp-input"
                placeholder={t('search.keywordPlaceholder')}
                value={store.keyword}
                onChange={(e) => store.setKeyword(e.target.value)}
              />
            </div>

            <button className="lp-sp-confirm" onClick={() => setShowSearchPanel(false)}>
              {t('common.confirm')}
            </button>
          </div>
        </div>
      )}

      {/* Filter Panel (Bottom Sheet) */}
      {showFilterPanel && (
        <div className="lp-filter-panel">
          <div className="lp-filter-mask" onClick={() => setShowFilterPanel(false)} />
          <div className="lp-filter-sheet">
            <div className="lp-sheet-handle"><div className="lp-sheet-bar" /></div>
            <div className="lp-filter-header">
              <h3 className="lp-filter-title">{t('list.filterTitle')}</h3>
              <button className="lp-filter-reset" onClick={resetFilters}>{t('list.filterReset')}</button>
            </div>

            {/* Star */}
            <div className="lp-filter-section">
              <span className="lp-filter-section-title">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>star</span>
                {t('search.star')}
              </span>
              <div className="lp-filter-chips">
                {[null, 3, 4, 5].map((s) => (
                  <div
                    key={s ?? 'all'}
                    className={`lp-filter-chip ${tempStar === s ? 'active' : ''}`}
                    onClick={() => setTempStar(s)}
                  >
                    {s ? t('search.starN', { n: s }) : t('search.noLimit')}
                  </div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="lp-filter-section">
              <span className="lp-filter-section-title">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>payments</span>
                {t('search.price')}
              </span>
              <div className="lp-filter-chips">
                {[
                  { label: t('search.noLimit'), min: null, max: null },
                  { label: t('search.priceBelow', { n: 500 }), min: null, max: 500 },
                  { label: t('search.priceRange', { min: 500, max: 1000 }), min: 500, max: 1000 },
                  { label: t('search.priceRange', { min: 1000, max: 2000 }), min: 1000, max: 2000 },
                  { label: t('search.priceAbove', { n: 2000 }), min: 2000, max: null },
                ].map((p) => (
                  <div
                    key={p.label}
                    className={`lp-filter-chip ${tempMinPrice === p.min && tempMaxPrice === p.max ? 'active' : ''}`}
                    onClick={() => { setTempMinPrice(p.min); setTempMaxPrice(p.max); }}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="lp-filter-section">
              <span className="lp-filter-section-title">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sell</span>
                {t('search.tags')}
              </span>
              <div className="lp-filter-chips">
                {TAGS_DATA.map((td) => (
                  <div
                    key={td.zh}
                    className={`lp-filter-chip ${tempTag === td.zh ? 'active' : ''}`}
                    onClick={() => setTempTag(tempTag === td.zh ? '' : td.zh)}
                  >
                    {td[lang as Language]}
                  </div>
                ))}
              </div>
            </div>

            <button className="lp-filter-apply" onClick={applyFilters}>
              {t('list.filterApply')}
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Tags */}
      {hasFilters && (
        <div className="lp-filters">
          {store.star && (
            <span className="lp-filter-tag">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star</span>
              {t('search.starN', { n: store.star })}
            </span>
          )}
          {store.tag && (
            <span className="lp-filter-tag">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>sell</span>
              {translateTag(store.tag, lang)}
            </span>
          )}
          {(store.minPrice || store.maxPrice) && (
            <span className="lp-filter-tag">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>payments</span>
              ¥{store.minPrice || 0}-{store.maxPrice || '∞'}
            </span>
          )}
          <span
            className="lp-filter-clear"
            onClick={() => { store.setStar(null); store.setTag(''); store.setPriceRange(null, null); }}
          >
            {t('list.clearFilter')}
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
          </span>
        </div>
      )}

      {/* Hotel List with Virtual Scrolling */}
      {hotels.length > 0 ? (
        <Virtuoso
          useWindowScroll
          data={hotels}
          endReached={() => { if (hasMore && !loadingRef.current) loadMore(); }}
          overscan={200}
          itemContent={(_index, hotel) => {
            const tags: string[] = parseJSON(hotel.tags);
            const hotelName = lang === 'en' && hotel.name_en ? hotel.name_en : hotel.name_cn;
            const imgUrl = getFirstImage(hotel);
            const hasError = imgErrors[hotel.id];

            return (
              <div style={{ padding: '6px 16px' }}>
                <div className="lp-card" onClick={() => navigate(`/m/hotel/${hotel.id}`)}>
                  <div className="lp-card-img">
                    {imgUrl && !hasError ? (
                      <img
                        className="lp-card-real-img"
                        src={imgUrl}
                        alt={hotel.name_cn}
                        onError={() => setImgErrors((prev) => ({ ...prev, [hotel.id]: true }))}
                      />
                    ) : (
                      <div className="lp-card-placeholder">
                        <span className="lp-card-letter">{hotel.name_cn.charAt(0)}</span>
                      </div>
                    )}
                    <div className="lp-card-star-badge">
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>star</span>
                      {hotel.star}
                    </div>
                  </div>
                  <div className="lp-card-body">
                    <div className="lp-card-name">{hotelName}</div>
                    <div className="lp-card-addr">
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                      {hotel.address}
                    </div>
                    <div className="lp-card-tags">
                      {tags.slice(0, 3).map((tg: string) => (
                        <span key={tg} className="lp-tag">{translateTag(tg, lang)}</span>
                      ))}
                    </div>
                    <div className="lp-card-bottom">
                      {hotel.lowestPrice ? (
                        <div className="lp-card-price">
                          <span className="lp-price-sign">¥</span>
                          <span className="lp-price-num">{hotel.lowestPrice}</span>
                          <span className="lp-price-unit">{t('list.from')}</span>
                        </div>
                      ) : (
                        <span className="lp-price-na">{t('list.noPrice')}</span>
                      )}
                      <span className="material-symbols-outlined lp-card-arrow">chevron_right</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
          components={{
            Footer: () => (
              <div className="lp-scroll-status">
                {hasMore ? (
                  <DotLoading color="var(--primary)" />
                ) : (
                  <span className="lp-no-more">{t('common.noMore')}</span>
                )}
              </div>
            ),
          }}
        />
      ) : (
        <div className="lp-scroll-status">
          {hasMore ? (
            <div className="lp-skeleton-list">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="lp-skeleton-card">
                  <div className="lp-skeleton-img lp-skeleton-pulse" />
                  <div className="lp-skeleton-body">
                    <div className="lp-skeleton-line lp-skeleton-pulse" style={{ width: '70%', height: 16 }} />
                    <div className="lp-skeleton-line lp-skeleton-pulse" style={{ width: '50%', height: 12, marginTop: 8 }} />
                    <div className="lp-skeleton-tags">
                      <div className="lp-skeleton-tag lp-skeleton-pulse" />
                      <div className="lp-skeleton-tag lp-skeleton-pulse" />
                    </div>
                    <div className="lp-skeleton-line lp-skeleton-pulse" style={{ width: '30%', height: 18, marginTop: 8 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lp-no-data">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-tertiary)' }}>search_off</span>
              <p>{t('list.noHotels')}</p>
            </div>
          )}
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
