import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfiniteScroll, DotLoading } from 'antd-mobile';
import { hotelAPI } from '../../api';
import useSearchStore from '../../stores/useSearchStore';
import { useT, useLanguageStore, translateCity, translateTag, formatDate } from '../../i18n';
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

  const loadMore = async () => {
    try {
      const params: Record<string, any> = { page: pageRef.current, pageSize };
      if (store.city) params.city = store.city;
      if (store.keyword) params.keyword = store.keyword;
      if (store.star) params.star = store.star;
      if (store.minPrice) params.minPrice = store.minPrice;
      if (store.maxPrice) params.maxPrice = store.maxPrice;
      if (store.tag) params.tag = store.tag;

      const res = await hotelAPI.search(params);
      const newData = res.data.data || [];
      if (pageRef.current === 1) {
        setHotels(newData);
      } else {
        setHotels((prev) => [...prev, ...newData]);
      }
      setHasMore(newData.length >= pageSize);
      pageRef.current += 1;
    } catch (err) {
      console.error(err);
      setHasMore(false);
    }
  };

  useEffect(() => {
    setHotels([]);
    pageRef.current = 1;
    setHasMore(true);
  }, [store.city, store.keyword, store.star, store.minPrice, store.maxPrice, store.tag]);

  const nights = dayjs(store.checkOut).diff(dayjs(store.checkIn), 'day');

  const parseJSON = (str: string) => {
    try { return JSON.parse(str); } catch { return []; }
  };

  const hasFilters = store.star || store.tag || store.minPrice || store.maxPrice;

  const getFirstImage = (hotel: any): string | null => {
    const images: string[] = parseJSON(hotel.images);
    return images.length > 0 ? images[0] : null;
  };

  return (
    <div className="lp-page">
      {/* Header */}
      <div className="lp-header">
        <button className="lp-back-btn" onClick={() => navigate('/m')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="lp-header-info">
          <span className="lp-header-city">
            {store.city ? translateCity(store.city, lang) : t('list.allCities')}
          </span>
          <span className="lp-header-date">
            {formatDate(store.checkIn, lang)} - {formatDate(store.checkOut, lang)} · {t('search.nights', { n: nights })}
          </span>
        </div>
        <div className="lp-header-right">
          {store.keyword && (
            <div className="lp-keyword-badge">"{store.keyword}"</div>
          )}
          <button className="lp-lang-btn" onClick={toggleLang}>
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>

      {/* Filter Tags */}
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

      {/* Hotel List */}
      <div className="lp-list">
        {hotels.map((hotel: any) => {
          const tags: string[] = parseJSON(hotel.tags);
          const hotelName = lang === 'en' && hotel.name_en ? hotel.name_en : hotel.name_cn;
          const imgUrl = getFirstImage(hotel);
          const hasError = imgErrors[hotel.id];

          return (
            <div key={hotel.id} className="lp-card" onClick={() => navigate(`/m/hotel/${hotel.id}`)}>
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
          );
        })}
      </div>

      <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
        <div className="lp-scroll-status">
          {hasMore ? (
            <DotLoading color="var(--primary)" />
          ) : hotels.length === 0 ? (
            <div className="lp-no-data">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-tertiary)' }}>search_off</span>
              <p>{t('list.noHotels')}</p>
            </div>
          ) : (
            <span className="lp-no-more">{t('common.noMore')}</span>
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
}
