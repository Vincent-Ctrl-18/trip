import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfiniteScroll, DotLoading } from 'antd-mobile';
import { hotelAPI } from '../../api';
import useSearchStore from '../../stores/useSearchStore';
import dayjs from 'dayjs';
import './style.css';

export default function ListPage() {
  const navigate = useNavigate();
  const store = useSearchStore();
  const [hotels, setHotels] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const pageSize = 10;

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

  // Reset when search params change
  useEffect(() => {
    setHotels([]);
    pageRef.current = 1;
    setHasMore(true);
  }, [store.city, store.keyword, store.star, store.minPrice, store.maxPrice, store.tag]);

  const nights = dayjs(store.checkOut).diff(dayjs(store.checkIn), 'day');

  const parseJSON = (str: string) => {
    try { return JSON.parse(str); } catch { return []; }
  };

  return (
    <div className="list-page">
      {/* Top filter bar */}
      <div className="list-header">
        <div className="header-back" onClick={() => navigate('/m')}>←</div>
        <div className="header-info">
          <span className="header-city">{store.city || '全部城市'}</span>
          <span className="header-date">
            {dayjs(store.checkIn).format('MM/DD')}-{dayjs(store.checkOut).format('MM/DD')} · {nights}晚
          </span>
        </div>
        {store.keyword && <div className="header-keyword">"{store.keyword}"</div>}
      </div>

      {/* Filter tags */}
      <div className="list-filters">
        {store.star && <span className="filter-tag">{store.star}星</span>}
        {store.tag && <span className="filter-tag">{store.tag}</span>}
        {(store.minPrice || store.maxPrice) && (
          <span className="filter-tag">
            ?{store.minPrice || 0}-{store.maxPrice || '不限'}
          </span>
        )}
        {(store.star || store.tag || store.minPrice || store.maxPrice) && (
          <span className="filter-clear" onClick={() => { store.setStar(null); store.setTag(''); store.setPriceRange(null, null); }}>
            清除筛选
          </span>
        )}
      </div>

      {/* Hotel list */}
      <div className="hotel-list">
        {hotels.map((hotel: any) => {
          const tags = parseJSON(hotel.tags);
          return (
            <div key={hotel.id} className="hotel-card" onClick={() => navigate(`/m/hotel/${hotel.id}`)}>
              <div className="hotel-card-img">
                <div className="hotel-card-placeholder">
                  <span>{hotel.name_cn.charAt(0)}</span>
                </div>
              </div>
              <div className="hotel-card-info">
                <div className="hotel-card-name">{hotel.name_cn}</div>
                <div className="hotel-card-star">{'★'.repeat(hotel.star)}{'☆'.repeat(5 - hotel.star)}</div>
                <div className="hotel-card-addr">{hotel.address}</div>
                <div className="hotel-card-tags">
                  {tags.slice(0, 3).map((t: string) => (
                    <span key={t} className="hotel-tag">{t}</span>
                  ))}
                </div>
                <div className="hotel-card-price">
                  {hotel.lowestPrice ? (
                    <>
                      <span className="price-symbol">?</span>
                      <span className="price-num">{hotel.lowestPrice}</span>
                      <span className="price-unit">起</span>
                    </>
                  ) : (
                    <span className="price-na">暂无报价</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
        {hasMore ? <DotLoading /> : hotels.length === 0 ? '暂无酒店数据' : '没有更多了'}
      </InfiniteScroll>
    </div>
  );
}
