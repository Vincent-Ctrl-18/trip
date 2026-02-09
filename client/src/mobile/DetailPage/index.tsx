import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, DotLoading } from 'antd-mobile';
import { hotelAPI } from '../../api';
import useSearchStore from '../../stores/useSearchStore';
import { useT, useLanguageStore, translateTag, getFacilityInfo, getNearbyTypeLabel, formatDate } from '../../i18n';
import CalendarPicker from '../../components/CalendarPicker';
import dayjs from 'dayjs';
import './style.css';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useSearchStore();
  const { t, lang } = useT();
  const toggleLang = useLanguageStore((s) => s.toggleLang);

  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarType, setCalendarType] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [expanded, setExpanded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [heroImgErrors, setHeroImgErrors] = useState<Record<number, boolean>>({});
  const [roomImgErrors, setRoomImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    hotelAPI
      .detail(id)
      .then((res) => setHotel(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="dp-loading">
        <DotLoading color="var(--primary)" />
        <span>{t('common.loading')}</span>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="dp-empty">
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-tertiary)' }}>hotel</span>
        <p>{t('detail.hotelNotFound')}</p>
      </div>
    );
  }

  const parseJSON = (str: string) => {
    try { return JSON.parse(str); } catch { return []; }
  };

  const tags: string[] = parseJSON(hotel.tags);
  const facilities: string[] = parseJSON(hotel.facilities);
  const images: string[] = parseJSON(hotel.images);
  const rooms = (hotel.RoomTypes || []).sort((a: any, b: any) => a.price - b.price);
  const nearby = hotel.NearbyPlaces || [];
  const nights = dayjs(store.checkOut).diff(dayjs(store.checkIn), 'day');
  const lowestPrice = rooms.length > 0 ? rooms[0].price : null;

  const tagColors = ['blue', 'purple', 'orange', 'green', 'pink'];
  const hotelDisplayName = lang === 'en' && hotel.name_en ? hotel.name_en : hotel.name_cn;

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

  const getRoomImage = (room: any): string | null => {
    const imgs: string[] = parseJSON(room.images || '[]');
    return imgs.length > 0 ? imgs[0] : null;
  };

  return (
    <div className="dp-page">
      {/* Scrollable Content */}
      <div className="dp-scroll no-scrollbar">
        {/* Hero Image */}
        <div className="dp-hero">
          {images.length > 0 ? (
            <Swiper
              loop
              onIndexChange={setActiveImg}
              style={{ '--height': '380px' } as React.CSSProperties}
              indicator={() => null}
            >
              {images.map((img: string, idx: number) => (
                <Swiper.Item key={idx}>
                  <div className="dp-hero-img">
                    {!heroImgErrors[idx] ? (
                      <img
                        className="dp-hero-real-img"
                        src={img}
                        alt={`${hotel.name_cn} ${idx + 1}`}
                        onError={() => setHeroImgErrors((prev) => ({ ...prev, [idx]: true }))}
                      />
                    ) : (
                      <div className="dp-hero-placeholder">
                        <span className="hero-letter">{hotel.name_cn.charAt(0)}</span>
                        <span className="hero-label">{idx + 1}/{images.length}</span>
                      </div>
                    )}
                  </div>
                </Swiper.Item>
              ))}
            </Swiper>
          ) : (
            <div className="dp-hero-img">
              <div className="dp-hero-placeholder">
                <span className="hero-letter">{hotel.name_cn.charAt(0)}</span>
              </div>
            </div>
          )}

          {/* Carousel Dots */}
          {images.length > 1 && (
            <div className="dp-hero-dots">
              {images.map((_: string, idx: number) => (
                <div key={idx} className={`hero-dot ${idx === activeImg ? 'active' : ''}`} />
              ))}
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="dp-img-counter">
              {activeImg + 1}/{images.length}
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="dp-hero-gradient" />
        </div>

        {/* Floating Nav */}
        <div className="dp-float-nav">
          <button className="dp-nav-btn" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="dp-nav-right">
            <button className="dp-nav-btn" onClick={toggleLang}>
              {lang === 'zh' ? 'EN' : '中'}
            </button>
            <button className="dp-nav-btn">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            <button className="dp-nav-btn">
              <span className="material-symbols-outlined">ios_share</span>
            </button>
          </div>
        </div>

        {/* Content Sheet */}
        <div className="dp-content">
          <div className="dp-sheet-handle">
            <div className="handle-bar" />
          </div>

          <div className="dp-inner">
            {/* Header: Name + Rating */}
            <div className="dp-header">
              <div className="dp-header-left">
                <h1 className="dp-name">{hotelDisplayName}</h1>
                {lang === 'en' && hotel.name_cn && (
                  <p className="dp-name-sub">{hotel.name_cn}</p>
                )}
                {lang === 'zh' && hotel.name_en && (
                  <p className="dp-name-sub">{hotel.name_en}</p>
                )}
              </div>
              <div className="dp-rating">
                <span className="dp-rating-num">{hotel.star}.0</span>
                <span className="material-symbols-outlined dp-rating-star">star</span>
              </div>
            </div>

            {/* Location */}
            <div className="dp-location">
              <span className="material-symbols-outlined dp-loc-icon">location_on</span>
              <p className="dp-loc-text">{hotel.address}</p>
              <span className="dp-loc-sep">•</span>
              <span className="dp-loc-star">{t('detail.starHotel', { n: hotel.star })}</span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="dp-tags">
                {tags.map((tag: string, idx: number) => (
                  <span key={tag} className={`dp-tag dp-tag-${tagColors[idx % tagColors.length]}`}>
                    {translateTag(tag, lang)}
                  </span>
                ))}
              </div>
            )}

            <div className="dp-divider" />

            {/* About */}
            {hotel.description && (
              <section className="dp-section">
                <h3 className="dp-section-title">{t('detail.about')}</h3>
                <div className="dp-about">
                  <p className={`dp-about-text ${expanded ? '' : 'clamped'}`}>
                    {hotel.description}
                  </p>
                  <button className="dp-read-more" onClick={() => setExpanded(!expanded)}>
                    {expanded ? t('common.cancel') : t('detail.readMore')}
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {expanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>
              </section>
            )}

            {/* Amenities */}
            {facilities.length > 0 && (
              <section className="dp-section">
                <div className="dp-section-header">
                  <h3 className="dp-section-title">{t('detail.amenities')}</h3>
                  <button className="dp-see-all">{t('detail.seeAll')}</button>
                </div>
                <div className="dp-amenities no-scrollbar">
                  {facilities.map((f: string) => {
                    const info = getFacilityInfo(f, lang);
                    return (
                      <div key={f} className="dp-amenity-card">
                        <div className="dp-amenity-icon">
                          <span className="material-symbols-outlined">{info.icon}</span>
                        </div>
                        <span className="dp-amenity-name">{info.name}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Your Stay - Date Selection */}
            <section className="dp-section">
              <h3 className="dp-section-title">{t('detail.yourStay')}</h3>
              <div className="dp-date-card">
                <div className="dp-date-item" onClick={() => openCalendar('checkIn')}>
                  <span className="dp-date-label">{t('search.checkIn')}</span>
                  <span className="dp-date-value">{formatDate(store.checkIn, lang)}</span>
                </div>
                <div className="dp-date-nights">{t('search.nights', { n: nights })}</div>
                <div className="dp-date-item" onClick={() => openCalendar('checkOut')}>
                  <span className="dp-date-label">{t('search.checkOut')}</span>
                  <span className="dp-date-value">{formatDate(store.checkOut, lang)}</span>
                </div>
              </div>
            </section>

            {/* Room Types */}
            <section className="dp-section">
              <h3 className="dp-section-title">{t('detail.rooms')}</h3>
              {rooms.length === 0 ? (
                <p className="dp-empty-text">{t('detail.noRooms')}</p>
              ) : (
                <div className="dp-rooms">
                  {rooms.map((room: any) => {
                    const roomImg = getRoomImage(room);
                    const hasRoomImgError = roomImgErrors[room.id];
                    return (
                      <div key={room.id} className="dp-room-card">
                        {/* Room Image */}
                        <div className="dp-room-img-wrap">
                          {roomImg && !hasRoomImgError ? (
                            <img
                              className="dp-room-img"
                              src={roomImg}
                              alt={room.name}
                              onError={() => setRoomImgErrors((prev) => ({ ...prev, [room.id]: true }))}
                            />
                          ) : (
                            <div className="dp-room-img-placeholder">
                              <span className="material-symbols-outlined">bed</span>
                            </div>
                          )}
                        </div>
                        <div className="dp-room-info">
                          <div className="dp-room-name">{room.name}</div>
                          <div className="dp-room-meta">
                            <span className="dp-room-capacity">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                              {t('detail.capacity', { n: room.capacity })}
                            </span>
                            {room.breakfast && (
                              <span className="dp-room-breakfast">
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>restaurant</span>
                                {t('detail.breakfast')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="dp-room-price">
                          {room.original_price && room.original_price > room.price && (
                            <span className="dp-room-original">¥{room.original_price}</span>
                          )}
                          <div className="dp-room-current">
                            <span className="dp-price-sign">¥</span>
                            <span className="dp-price-num">{room.price}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Nearby Places */}
            {nearby.length > 0 && (
              <section className="dp-section">
                <h3 className="dp-section-title">{t('detail.nearby')}</h3>
                <div className="dp-nearby">
                  {nearby.map((place: any) => (
                    <div key={place.id} className="dp-nearby-item">
                      <span className={`dp-nearby-badge ${place.type}`}>
                        {getNearbyTypeLabel(place.type, lang)}
                      </span>
                      <span className="dp-nearby-name">{place.name}</span>
                      <span className="dp-nearby-dist">{place.distance}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="dp-bottom-bar">
        <div className="dp-bottom-price">
          <span className="dp-price-label">{t('detail.totalPrice')}</span>
          <div className="dp-price-row">
            <span className="dp-bottom-amount">
              {lowestPrice ? `¥${lowestPrice}` : '--'}
            </span>
            <span className="dp-price-per">{t('detail.perNight')}</span>
          </div>
        </div>
        <button className="dp-select-btn">
          {t('detail.selectRoom')}
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
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
