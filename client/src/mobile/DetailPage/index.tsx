import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, DotLoading } from 'antd-mobile';
import { hotelAPI } from '../../api';
import useSearchStore from '../../stores/useSearchStore';
import { useT, useLanguageStore, translateTag, getFacilityInfo, getNearbyTypeLabel, formatDate } from '../../i18n';
import { parseJSON } from '../../utils';
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
  const [showNavTitle, setShowNavTitle] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const roomsSectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load favorite state from localStorage
  useEffect(() => {
    if (id) {
      const favs: string[] = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorited(favs.includes(String(id)));
    }
  }, [id]);

  const toggleFavorite = () => {
    const favs: string[] = JSON.parse(localStorage.getItem('favorites') || '[]');
    const hotelId = String(id);
    if (favs.includes(hotelId)) {
      localStorage.setItem('favorites', JSON.stringify(favs.filter(f => f !== hotelId)));
      setFavorited(false);
    } else {
      localStorage.setItem('favorites', JSON.stringify([...favs, hotelId]));
      setFavorited(true);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: hotel?.name_cn || 'EasyStay Hotel',
      text: hotel ? `${hotel.name_cn} - ${hotel.address}` : '',
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  // Show hotel name in nav when scrolled past hero
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setShowNavTitle(scrollRef.current.scrollTop > 300);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
      return () => el.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

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
      <div className="dp-page">
        {/* Skeleton Header */}
        <div className="dp-skeleton-header">
          <div className="dp-skeleton-img dp-skeleton-pulse" />
          <div className="dp-skeleton-header-bar">
            <div className="dp-skeleton-circle dp-skeleton-pulse" />
            <div className="dp-skeleton-line dp-skeleton-pulse" style={{ width: '40%', height: 14 }} />
          </div>
        </div>
        {/* Skeleton Body */}
        <div className="dp-skeleton-body">
          <div className="dp-skeleton-line dp-skeleton-pulse" style={{ width: '70%', height: 20, marginBottom: 12 }} />
          <div className="dp-skeleton-line dp-skeleton-pulse" style={{ width: '50%', height: 14, marginBottom: 20 }} />
          <div className="dp-skeleton-line dp-skeleton-pulse" style={{ width: '90%', height: 14, marginBottom: 8 }} />
          <div className="dp-skeleton-line dp-skeleton-pulse" style={{ width: '60%', height: 14, marginBottom: 24 }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="dp-skeleton-chip dp-skeleton-pulse" />
            ))}
          </div>
          <div className="dp-skeleton-line dp-skeleton-pulse" style={{ width: '40%', height: 16, marginBottom: 12 }} />
          <div className="dp-skeleton-card dp-skeleton-pulse" />
          <div className="dp-skeleton-card dp-skeleton-pulse" />
        </div>
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

  const tags: string[] = parseJSON(hotel.tags);
  const facilities: string[] = parseJSON(hotel.facilities);
  const images: string[] = parseJSON(hotel.images);
  const rooms = (hotel.RoomTypes || []).sort((a: any, b: any) => a.price - b.price);
  const nearby = hotel.NearbyPlaces || [];
  const nights = dayjs(store.checkOut).diff(dayjs(store.checkIn), 'day');
  const lowestPrice = rooms.length > 0 ? rooms[0].price : null;
  const displayPrice = selectedRoom ? selectedRoom.price : lowestPrice;

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

  const scrollToRooms = () => {
    if (roomsSectionRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const target = roomsSectionRef.current;
      const targetTop = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
      container.scrollTo({ top: targetTop - 10, behavior: 'smooth' });
    }
  };

  return (
    <div className="dp-page">
      {/* Scrollable Content */}
      <div className="dp-scroll no-scrollbar" ref={scrollRef}>
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
        <div className={`dp-float-nav ${showNavTitle ? 'dp-nav-solid' : ''}`}>
          <button className="dp-nav-btn" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          {showNavTitle && (
            <div className="dp-nav-title">{hotelDisplayName}</div>
          )}
          <div className="dp-nav-right">
            <button className="dp-nav-btn" onClick={toggleLang}>
              {lang === 'zh' ? 'EN' : '中'}
            </button>
            <button className="dp-nav-btn" onClick={toggleFavorite}>
              <span className="material-symbols-outlined" style={favorited ? { fontVariationSettings: "'FILL' 1", color: '#ef4444' } : undefined}>favorite</span>
            </button>
            <button className="dp-nav-btn" onClick={handleShare}>
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
                  <button className="dp-see-all" onClick={() => setShowAllAmenities(true)}>{t('detail.seeAll')}</button>
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

            {/* Your Stay - Date + Room/Guest */}
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
              {/* Room & Guest Info */}
              <div className="dp-stay-info">
                <div className="dp-stay-item">
                  <span className="material-symbols-outlined dp-stay-icon">meeting_room</span>
                  <span className="dp-stay-text">{t('search.rooms', { n: store.roomCount })}</span>
                  <div className="dp-stay-counter">
                    <button className="dp-stay-btn" onClick={() => store.setRoomCount(store.roomCount - 1)} disabled={store.roomCount <= 1}>
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="dp-stay-val">{store.roomCount}</span>
                    <button className="dp-stay-btn" onClick={() => store.setRoomCount(store.roomCount + 1)} disabled={store.roomCount >= 10}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
                <div className="dp-stay-item">
                  <span className="material-symbols-outlined dp-stay-icon">person</span>
                  <span className="dp-stay-text">{t('search.adults', { n: store.adultCount })}</span>
                  <div className="dp-stay-counter">
                    <button className="dp-stay-btn" onClick={() => store.setAdultCount(store.adultCount - 1)} disabled={store.adultCount <= 1}>
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="dp-stay-val">{store.adultCount}</span>
                    <button className="dp-stay-btn" onClick={() => store.setAdultCount(store.adultCount + 1)} disabled={store.adultCount >= 20}>
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Room Types */}
            <section className="dp-section" ref={roomsSectionRef}>
              <h3 className="dp-section-title">{t('detail.rooms')}</h3>
              {rooms.length === 0 ? (
                <p className="dp-empty-text">{t('detail.noRooms')}</p>
              ) : (
                <div className="dp-rooms">
                  {rooms.map((room: any) => {
                    const roomImg = getRoomImage(room);
                    const hasRoomImgError = roomImgErrors[room.id];
                    return (
                      <div key={room.id} className="dp-room-card" onClick={() => setSelectedRoom(room)}>
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
              {displayPrice ? `¥${displayPrice * nights * store.roomCount}` : '--'}
            </span>
            <span className="dp-price-per">
              {displayPrice ? t('detail.priceBreakdown', { price: displayPrice, nights, rooms: store.roomCount }) : t('detail.perNight')}
            </span>
          </div>
        </div>
        <button className="dp-select-btn" onClick={scrollToRooms}>
          {t('detail.selectRoom')}
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
        </button>
      </div>

      {/* Booking Bottom Sheet */}
      {selectedRoom && !bookingSuccess && (
        <div className="dp-booking-overlay">
          <div className="dp-booking-mask" onClick={() => setSelectedRoom(null)} />
          <div className="dp-booking-sheet">
            <div className="dp-sheet-handle"><div className="handle-bar" /></div>
            <h3 className="dp-booking-title">{t('detail.orderDetail')}</h3>

            {/* Room Header */}
            <div className="dp-booking-room-header">
              <div className="dp-booking-room-img">
                {getRoomImage(selectedRoom) ? (
                  <img src={getRoomImage(selectedRoom)!} alt={selectedRoom.name} />
                ) : (
                  <div className="dp-booking-room-placeholder">
                    <span className="material-symbols-outlined">bed</span>
                  </div>
                )}
              </div>
              <div className="dp-booking-room-info">
                <div className="dp-booking-room-name">{selectedRoom.name}</div>
                <div className="dp-booking-room-meta">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                  {t('detail.capacity', { n: selectedRoom.capacity })}
                  {selectedRoom.breakfast && (
                    <> · <span className="material-symbols-outlined" style={{ fontSize: 14 }}>restaurant</span>{t('detail.breakfast')}</>
                  )}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="dp-booking-details">
              <div className="dp-booking-row">
                <span className="dp-booking-label">{t('detail.dateRange')}</span>
                <span className="dp-booking-value">{formatDate(store.checkIn, lang)} - {formatDate(store.checkOut, lang)}</span>
              </div>
              <div className="dp-booking-row">
                <span className="dp-booking-label">{t('detail.nightCount')}</span>
                <span className="dp-booking-value">{nights}{t('detail.nightUnit')}</span>
              </div>
              <div className="dp-booking-row">
                <span className="dp-booking-label">{t('detail.roomCountLabel')}</span>
                <span className="dp-booking-value">{store.roomCount}{t('detail.roomUnit')}</span>
              </div>
              <div className="dp-booking-row">
                <span className="dp-booking-label">{t('detail.guestCount')}</span>
                <span className="dp-booking-value">{store.adultCount}{t('detail.adultUnit')}</span>
              </div>
              <div className="dp-booking-row">
                <span className="dp-booking-label">{t('detail.unitPrice')}</span>
                <span className="dp-booking-value dp-booking-price-val">¥{selectedRoom.price}{t('detail.perNight')}</span>
              </div>
              <div className="dp-booking-divider" />
              <div className="dp-booking-row dp-booking-total">
                <span className="dp-booking-label">{t('detail.totalAmount')}</span>
                <span className="dp-booking-value dp-booking-total-val">¥{selectedRoom.price * nights * store.roomCount}</span>
              </div>
            </div>

            <button
              className="dp-booking-confirm-btn"
              onClick={() => setBookingSuccess(true)}
            >
              {t('detail.bookConfirm')}
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>
            </button>
          </div>
        </div>
      )}

      {/* Booking Success Overlay */}
      {bookingSuccess && selectedRoom && (
        <div className="dp-success-overlay">
          <div className="dp-success-content">
            <div className="dp-success-icon">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <h2 className="dp-success-title">{t('detail.bookSuccess')}</h2>
            <p className="dp-success-msg">
              {t('detail.bookSuccessMsg', { hotel: hotelDisplayName, room: selectedRoom.name })}
            </p>
            <div className="dp-success-summary">
              <div className="dp-success-row">
                <span>{t('detail.dateRange')}</span>
                <span>{formatDate(store.checkIn, lang)} - {formatDate(store.checkOut, lang)}</span>
              </div>
              <div className="dp-success-row">
                <span>{t('detail.totalAmount')}</span>
                <span className="dp-success-amount">¥{selectedRoom.price * nights * store.roomCount}</span>
              </div>
            </div>
            <div className="dp-success-actions">
              <button className="dp-success-btn-secondary" onClick={() => { setBookingSuccess(false); setSelectedRoom(null); }}>
                {t('common.back')}
              </button>
              <button className="dp-success-btn-primary" onClick={() => navigate('/m')}>
                {t('detail.backToHome')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Amenities Modal */}
      {showAllAmenities && (
        <div className="dp-booking-overlay">
          <div className="dp-booking-mask" onClick={() => setShowAllAmenities(false)} />
          <div className="dp-booking-sheet" style={{ maxHeight: '60vh' }}>
            <div className="dp-sheet-handle"><div className="handle-bar" /></div>
            <h3 className="dp-booking-title">{t('detail.amenities')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 4px 16px' }}>
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
          </div>
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
