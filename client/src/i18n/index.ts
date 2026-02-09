import { create } from 'zustand';

export type Language = 'zh' | 'en';

interface LanguageState {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  lang: (localStorage.getItem('lang') as Language) || 'zh',
  setLang: (lang) => {
    localStorage.setItem('lang', lang);
    set({ lang });
  },
  toggleLang: () => {
    const newLang = get().lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('lang', newLang);
    set({ lang: newLang });
  },
}));

/* ========== Translation Dictionaries ========== */

const translations: Record<Language, Record<string, string | string[]>> = {
  zh: {
    // Common
    'app.name': '易宿',
    'app.tagline': '找到理想住处',
    'common.loading': '加载中...',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.back': '返回',
    'common.noData': '暂无数据',
    'common.noMore': '没有更多了',

    // SearchPage
    'search.title': '易宿 · 找到理想住处',
    'search.destination': '目的地',
    'search.selectCity': '请选择城市',
    'search.checkIn': '入住',
    'search.checkOut': '离店',
    'search.nights': '{n}晚',
    'search.keyword': '搜索',
    'search.keywordPlaceholder': '酒店名/地址',
    'search.star': '星级',
    'search.starN': '{n}星',
    'search.noLimit': '不限',
    'search.price': '价格',
    'search.priceBelow': '¥{n}以下',
    'search.priceRange': '¥{min}-{max}',
    'search.priceAbove': '¥{n}以上',
    'search.tags': '快捷标签',
    'search.button': '查询酒店',
    'search.popularDest': '热门目的地',
    'search.travelDates': '出行日期',

    // ListPage
    'list.allCities': '全部城市',
    'list.clearFilter': '清除筛选',
    'list.from': '起',
    'list.noPrice': '暂无报价',
    'list.noHotels': '暂无酒店数据',
    'list.results': '搜索结果',

    // DetailPage
    'detail.hotelNotFound': '酒店不存在',
    'detail.starHotel': '{n}星级酒店',
    'detail.address': '地址',
    'detail.openingDate': '开业时间',
    'detail.unknown': '未知',
    'detail.about': '酒店简介',
    'detail.readMore': '展开更多',
    'detail.amenities': '酒店设施',
    'detail.seeAll': '查看全部',
    'detail.location': '位置信息',
    'detail.mapView': '查看地图',
    'detail.yourStay': '入住日期',
    'detail.rooms': '房型价格',
    'detail.noRooms': '暂无房型信息',
    'detail.capacity': '{n}人入住',
    'detail.breakfast': '含早餐',
    'detail.noBreakfast': '不含早',
    'detail.nearby': '周边信息',
    'detail.selectRoom': '选择房型',
    'detail.perNight': '/晚',
    'detail.totalPrice': '房价',

    // Calendar
    'calendar.weekdays': ['日', '一', '二', '三', '四', '五', '六'],

    // Admin - Login
    'admin.login.title': '易宿管理后台',
    'admin.login.subtitle': '酒店信息管理系统',
    'admin.login.username': '用户名',
    'admin.login.password': '密码',
    'admin.login.button': '登录',
    'admin.login.noAccount': '还没有账号？',
    'admin.login.register': '立即注册',
    'admin.login.success': '登录成功',
    'admin.login.failed': '登录失败',
    'admin.login.usernameRequired': '请输入用户名',
    'admin.login.passwordRequired': '请输入密码',

    // Admin - Register
    'admin.register.title': '注册账号',
    'admin.register.subtitle': '加入易宿管理平台',
    'admin.register.passwordPlaceholder': '密码（至少6位）',
    'admin.register.passwordMin': '密码至少6位',
    'admin.register.role': '选择角色',
    'admin.register.merchant': '商户',
    'admin.register.admin': '管理员',
    'admin.register.button': '注册',
    'admin.register.hasAccount': '已有账号？',
    'admin.register.login': '立即登录',
    'admin.register.success': '注册成功',
    'admin.register.failed': '注册失败',

    // Admin - Layout
    'admin.sidebar.title': '易宿管理',
    'admin.sidebar.myHotels': '我的酒店',
    'admin.sidebar.review': '审核管理',
    'admin.header.admin': '管理员',
    'admin.header.merchant': '商户',
    'admin.logout': '退出登录',

    // Admin - Hotel List
    'admin.hotelList.title': '我的酒店',
    'admin.hotelList.add': '新增酒店',
    'admin.hotelList.edit': '编辑',
    'admin.hotelList.submit': '提交审核',
    'admin.hotelList.submitConfirm': '确认提交审核？',
    'admin.hotelList.submitSuccess': '已提交审核',
    'admin.hotelList.submitFailed': '提交失败',
    'admin.hotelList.fetchFailed': '获取酒店列表失败',
    'admin.hotelList.hotelName': '酒店名称',
    'admin.hotelList.city': '城市',
    'admin.hotelList.star': '星级',
    'admin.hotelList.roomCount': '房型数',
    'admin.hotelList.status': '状态',
    'admin.hotelList.action': '操作',
    'admin.hotelList.reason': '原因',

    // Status
    'status.draft': '草稿',
    'status.pending': '审核中',
    'status.approved': '已通过',
    'status.rejected': '已拒绝',
    'status.offline': '已下线',

    // Admin - Hotel Form
    'admin.hotelForm.create': '新增酒店',
    'admin.hotelForm.edit': '编辑酒店',
    'admin.hotelForm.back': '返回',
    'admin.hotelForm.basicInfo': '基本信息',
    'admin.hotelForm.nameCn': '酒店名称（中文）',
    'admin.hotelForm.nameCnPlaceholder': '如：上海外滩华尔道夫酒店',
    'admin.hotelForm.nameCnRequired': '请输入中文名',
    'admin.hotelForm.nameEn': '酒店名称（英文）',
    'admin.hotelForm.nameEnPlaceholder': '如：Waldorf Astoria Shanghai',
    'admin.hotelForm.city': '城市',
    'admin.hotelForm.cityRequired': '请选择城市',
    'admin.hotelForm.cityPlaceholder': '选择城市',
    'admin.hotelForm.star': '星级',
    'admin.hotelForm.openingDate': '开业时间',
    'admin.hotelForm.address': '详细地址',
    'admin.hotelForm.addressRequired': '请输入地址',
    'admin.hotelForm.addressPlaceholder': '详细地址',
    'admin.hotelForm.description': '酒店描述',
    'admin.hotelForm.descriptionPlaceholder': '描述酒店特色...',
    'admin.hotelForm.tags': '酒店标签',
    'admin.hotelForm.tagsPlaceholder': '选择标签',
    'admin.hotelForm.facilities': '酒店设施',
    'admin.hotelForm.facilitiesPlaceholder': '选择设施',
    'admin.hotelForm.roomInfo': '房型信息',
    'admin.hotelForm.roomName': '房型名称',
    'admin.hotelForm.roomNameRequired': '房型名',
    'admin.hotelForm.price': '价格',
    'admin.hotelForm.priceRequired': '价格',
    'admin.hotelForm.originalPrice': '原价（可选）',
    'admin.hotelForm.capacity': '人数',
    'admin.hotelForm.breakfastYes': '含早',
    'admin.hotelForm.breakfastNo': '无早',
    'admin.hotelForm.addRoom': '添加房型',
    'admin.hotelForm.nearbyInfo': '周边信息（可选）',
    'admin.hotelForm.nearbyType': '类型',
    'admin.hotelForm.nearbyName': '名称',
    'admin.hotelForm.nearbyDistance': '距离',
    'admin.hotelForm.addNearby': '添加周边信息',
    'admin.hotelForm.createBtn': '创建酒店',
    'admin.hotelForm.saveBtn': '保存修改',
    'admin.hotelForm.createSuccess': '创建成功',
    'admin.hotelForm.saveSuccess': '保存成功',
    'admin.hotelForm.saveFailed': '保存失败',
    'admin.hotelForm.loadFailed': '加载酒店信息失败',
    'admin.hotelForm.nearbyAttraction': '景点',
    'admin.hotelForm.nearbyTransport': '交通',
    'admin.hotelForm.nearbyMall': '商场',
    'admin.hotelForm.hotelImages': '酒店图片',
    'admin.hotelForm.hotelImagesHint': '支持 JPG/PNG/WebP/SVG，最多上传 10 张',
    'admin.hotelForm.uploadBtn': '上传图片',
    'admin.hotelForm.roomImages': '房型图片',
    'admin.hotelForm.uploadFailed': '上传失败',

    // Admin - Review
    'admin.review.title': '审核管理',
    'admin.review.statusFilter': '按状态筛选',
    'admin.review.refresh': '刷新',
    'admin.review.approve': '通过',
    'admin.review.reject': '拒绝',
    'admin.review.offline': '下线',
    'admin.review.online': '恢复上线',
    'admin.review.rejectTitle': '拒绝审核',
    'admin.review.rejectReason': '请输入拒绝原因：',
    'admin.review.rejectPlaceholder': '请说明拒绝原因...',
    'admin.review.confirmReject': '确认拒绝',
    'admin.review.approveSuccess': '审核通过',
    'admin.review.rejectSuccess': '已拒绝',
    'admin.review.offlineSuccess': '已下线',
    'admin.review.onlineSuccess': '已恢复上线',
    'admin.review.fetchFailed': '获取列表失败',
    'admin.review.operationFailed': '操作失败',

    // Language
    'lang.zh': '中文',
    'lang.en': 'EN',
  },

  en: {
    // Common
    'app.name': 'EasyStay',
    'app.tagline': 'Find Your Perfect Stay',
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.back': 'Back',
    'common.noData': 'No data',
    'common.noMore': 'No more data',

    // SearchPage
    'search.title': 'EasyStay · Find Your Perfect Stay',
    'search.destination': 'Destination',
    'search.selectCity': 'Select City',
    'search.checkIn': 'Check-in',
    'search.checkOut': 'Check-out',
    'search.nights': '{n} nights',
    'search.keyword': 'Search',
    'search.keywordPlaceholder': 'Hotel name / address',
    'search.star': 'Star Rating',
    'search.starN': '{n} Star',
    'search.noLimit': 'All',
    'search.price': 'Price',
    'search.priceBelow': 'Under ¥{n}',
    'search.priceRange': '¥{min}-{max}',
    'search.priceAbove': 'Over ¥{n}',
    'search.tags': 'Quick Tags',
    'search.button': 'Search Hotels',
    'search.popularDest': 'Popular Destinations',
    'search.travelDates': 'Travel Dates',

    // ListPage
    'list.allCities': 'All Cities',
    'list.clearFilter': 'Clear Filters',
    'list.from': 'from',
    'list.noPrice': 'Price N/A',
    'list.noHotels': 'No hotels found',
    'list.results': 'Results',

    // DetailPage
    'detail.hotelNotFound': 'Hotel not found',
    'detail.starHotel': '{n}-Star Hotel',
    'detail.address': 'Address',
    'detail.openingDate': 'Opened',
    'detail.unknown': 'Unknown',
    'detail.about': 'About',
    'detail.readMore': 'Read more',
    'detail.amenities': 'Amenities',
    'detail.seeAll': 'See All',
    'detail.location': 'Location',
    'detail.mapView': 'Map View',
    'detail.yourStay': 'Your Stay',
    'detail.rooms': 'Room Types',
    'detail.noRooms': 'No rooms available',
    'detail.capacity': '{n} guests',
    'detail.breakfast': 'Breakfast included',
    'detail.noBreakfast': 'No breakfast',
    'detail.nearby': 'Nearby',
    'detail.selectRoom': 'Select Room',
    'detail.perNight': '/ night',
    'detail.totalPrice': 'Total Price',

    // Calendar
    'calendar.weekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    // Admin - Login
    'admin.login.title': 'EasyStay Admin',
    'admin.login.subtitle': 'Hotel Management System',
    'admin.login.username': 'Username',
    'admin.login.password': 'Password',
    'admin.login.button': 'Sign In',
    'admin.login.noAccount': "Don't have an account? ",
    'admin.login.register': 'Sign Up',
    'admin.login.success': 'Login successful',
    'admin.login.failed': 'Login failed',
    'admin.login.usernameRequired': 'Please enter username',
    'admin.login.passwordRequired': 'Please enter password',

    // Admin - Register
    'admin.register.title': 'Create Account',
    'admin.register.subtitle': 'Join EasyStay Platform',
    'admin.register.passwordPlaceholder': 'Password (min 6 chars)',
    'admin.register.passwordMin': 'Minimum 6 characters',
    'admin.register.role': 'Select Role',
    'admin.register.merchant': 'Merchant',
    'admin.register.admin': 'Admin',
    'admin.register.button': 'Sign Up',
    'admin.register.hasAccount': 'Already have an account? ',
    'admin.register.login': 'Sign In',
    'admin.register.success': 'Registration successful',
    'admin.register.failed': 'Registration failed',

    // Admin - Layout
    'admin.sidebar.title': 'EasyStay',
    'admin.sidebar.myHotels': 'My Hotels',
    'admin.sidebar.review': 'Review',
    'admin.header.admin': 'Admin',
    'admin.header.merchant': 'Merchant',
    'admin.logout': 'Logout',

    // Admin - Hotel List
    'admin.hotelList.title': 'My Hotels',
    'admin.hotelList.add': 'Add Hotel',
    'admin.hotelList.edit': 'Edit',
    'admin.hotelList.submit': 'Submit',
    'admin.hotelList.submitConfirm': 'Submit for review?',
    'admin.hotelList.submitSuccess': 'Submitted for review',
    'admin.hotelList.submitFailed': 'Submit failed',
    'admin.hotelList.fetchFailed': 'Failed to fetch hotels',
    'admin.hotelList.hotelName': 'Hotel Name',
    'admin.hotelList.city': 'City',
    'admin.hotelList.star': 'Stars',
    'admin.hotelList.roomCount': 'Rooms',
    'admin.hotelList.status': 'Status',
    'admin.hotelList.action': 'Action',
    'admin.hotelList.reason': 'Reason',

    // Status
    'status.draft': 'Draft',
    'status.pending': 'Pending',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.offline': 'Offline',

    // Admin - Hotel Form
    'admin.hotelForm.create': 'Add Hotel',
    'admin.hotelForm.edit': 'Edit Hotel',
    'admin.hotelForm.back': 'Back',
    'admin.hotelForm.basicInfo': 'Basic Information',
    'admin.hotelForm.nameCn': 'Hotel Name (Chinese)',
    'admin.hotelForm.nameCnPlaceholder': 'e.g. Shanghai Waldorf Astoria',
    'admin.hotelForm.nameCnRequired': 'Please enter Chinese name',
    'admin.hotelForm.nameEn': 'Hotel Name (English)',
    'admin.hotelForm.nameEnPlaceholder': 'e.g. Waldorf Astoria Shanghai',
    'admin.hotelForm.city': 'City',
    'admin.hotelForm.cityRequired': 'Please select a city',
    'admin.hotelForm.cityPlaceholder': 'Select City',
    'admin.hotelForm.star': 'Star Rating',
    'admin.hotelForm.openingDate': 'Opening Date',
    'admin.hotelForm.address': 'Address',
    'admin.hotelForm.addressRequired': 'Please enter address',
    'admin.hotelForm.addressPlaceholder': 'Full address',
    'admin.hotelForm.description': 'Description',
    'admin.hotelForm.descriptionPlaceholder': 'Describe the hotel...',
    'admin.hotelForm.tags': 'Tags',
    'admin.hotelForm.tagsPlaceholder': 'Select tags',
    'admin.hotelForm.facilities': 'Facilities',
    'admin.hotelForm.facilitiesPlaceholder': 'Select facilities',
    'admin.hotelForm.roomInfo': 'Room Types',
    'admin.hotelForm.roomName': 'Room Name',
    'admin.hotelForm.roomNameRequired': 'Room name required',
    'admin.hotelForm.price': 'Price',
    'admin.hotelForm.priceRequired': 'Price required',
    'admin.hotelForm.originalPrice': 'Original Price',
    'admin.hotelForm.capacity': 'Capacity',
    'admin.hotelForm.breakfastYes': 'With',
    'admin.hotelForm.breakfastNo': 'Without',
    'admin.hotelForm.addRoom': 'Add Room Type',
    'admin.hotelForm.nearbyInfo': 'Nearby Places (Optional)',
    'admin.hotelForm.nearbyType': 'Type',
    'admin.hotelForm.nearbyName': 'Name',
    'admin.hotelForm.nearbyDistance': 'Distance',
    'admin.hotelForm.addNearby': 'Add Nearby Place',
    'admin.hotelForm.createBtn': 'Create Hotel',
    'admin.hotelForm.saveBtn': 'Save Changes',
    'admin.hotelForm.createSuccess': 'Hotel created',
    'admin.hotelForm.saveSuccess': 'Changes saved',
    'admin.hotelForm.saveFailed': 'Save failed',
    'admin.hotelForm.loadFailed': 'Failed to load hotel',
    'admin.hotelForm.nearbyAttraction': 'Attraction',
    'admin.hotelForm.nearbyTransport': 'Transport',
    'admin.hotelForm.nearbyMall': 'Shopping',
    'admin.hotelForm.hotelImages': 'Hotel Images',
    'admin.hotelForm.hotelImagesHint': 'Supports JPG/PNG/WebP/SVG, max 10 images',
    'admin.hotelForm.uploadBtn': 'Upload',
    'admin.hotelForm.roomImages': 'Room Images',
    'admin.hotelForm.uploadFailed': 'Upload failed',

    // Admin - Review
    'admin.review.title': 'Review Management',
    'admin.review.statusFilter': 'Filter by Status',
    'admin.review.refresh': 'Refresh',
    'admin.review.approve': 'Approve',
    'admin.review.reject': 'Reject',
    'admin.review.offline': 'Offline',
    'admin.review.online': 'Bring Online',
    'admin.review.rejectTitle': 'Reject Review',
    'admin.review.rejectReason': 'Please enter rejection reason:',
    'admin.review.rejectPlaceholder': 'Reason for rejection...',
    'admin.review.confirmReject': 'Confirm Reject',
    'admin.review.approveSuccess': 'Approved',
    'admin.review.rejectSuccess': 'Rejected',
    'admin.review.offlineSuccess': 'Taken offline',
    'admin.review.onlineSuccess': 'Back online',
    'admin.review.fetchFailed': 'Failed to fetch list',
    'admin.review.operationFailed': 'Operation failed',

    // Language
    'lang.zh': '中',
    'lang.en': 'EN',
  },
};

/* ========== Translation Hook ========== */

export function useT() {
  const { lang } = useLanguageStore();

  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = translations[lang]?.[key];
    if (typeof value !== 'string') {
      // Fallback to Chinese
      const fallback = translations['zh']?.[key];
      if (typeof fallback === 'string') return fallback;
      return key;
    }
    if (!params) return value;
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
      value
    );
  };

  const tArray = (key: string): string[] => {
    const value = translations[lang]?.[key];
    return Array.isArray(value) ? value : [];
  };

  return { t, tArray, lang };
}

/* ========== City Data ========== */

export const CITIES_DATA = [
  { key: 'shanghai', zh: '上海', en: 'Shanghai' },
  { key: 'beijing', zh: '北京', en: 'Beijing' },
  { key: 'hangzhou', zh: '杭州', en: 'Hangzhou' },
  { key: 'sanya', zh: '三亚', en: 'Sanya' },
  { key: 'chengdu', zh: '成都', en: 'Chengdu' },
  { key: 'guangzhou', zh: '广州', en: 'Guangzhou' },
  { key: 'shenzhen', zh: '深圳', en: 'Shenzhen' },
  { key: 'xian', zh: '西安', en: "Xi'an" },
  { key: 'suzhou', zh: '苏州', en: 'Suzhou' },
  { key: 'chongqing', zh: '重庆', en: 'Chongqing' },
];

/* ========== Tag Data ========== */

export const TAGS_DATA = [
  { zh: '豪华', en: 'Luxury' },
  { zh: '亲子', en: 'Family' },
  { zh: '度假', en: 'Resort' },
  { zh: '商务', en: 'Business' },
  { zh: '江景', en: 'River View' },
  { zh: '海景', en: 'Sea View' },
  { zh: '湖景', en: 'Lake View' },
  { zh: '城景', en: 'City View' },
  { zh: '免费停车场', en: 'Free Parking' },
  { zh: '历史建筑', en: 'Historic' },
  { zh: '新开业', en: 'New Opening' },
];

/* ========== Facility Map ========== */

export const FACILITY_MAP: Record<string, { icon: string; en: string }> = {
  '免费WiFi': { icon: 'wifi', en: 'WiFi' },
  '游泳池': { icon: 'pool', en: 'Pool' },
  '健身房': { icon: 'fitness_center', en: 'Gym' },
  '餐厅': { icon: 'restaurant', en: 'Dining' },
  'SPA': { icon: 'spa', en: 'Spa' },
  '商务中心': { icon: 'business_center', en: 'Business' },
  '会议室': { icon: 'meeting_room', en: 'Meeting' },
  '免费停车场': { icon: 'local_parking', en: 'Parking' },
  '花园': { icon: 'yard', en: 'Garden' },
  '水上乐园': { icon: 'attractions', en: 'Water Park' },
  '水族馆': { icon: 'water', en: 'Aquarium' },
};

/* ========== Utility Functions ========== */

export function translateCity(city: string, lang: Language): string {
  const found = CITIES_DATA.find((c) => c.zh === city);
  return found ? found[lang] : city;
}

export function translateTag(tag: string, lang: Language): string {
  const found = TAGS_DATA.find((t) => t.zh === tag);
  return found ? found[lang] : tag;
}

export function getFacilityInfo(facility: string, lang: Language): { name: string; icon: string } {
  const info = FACILITY_MAP[facility];
  if (!info) return { name: facility, icon: 'help_outline' };
  return { name: lang === 'en' ? info.en : facility, icon: info.icon };
}

export function getNearbyTypeLabel(type: string, lang: Language): string {
  const map: Record<string, Record<Language, string>> = {
    attraction: { zh: '景点', en: 'Attraction' },
    transport: { zh: '交通', en: 'Transport' },
    mall: { zh: '商场', en: 'Shopping' },
  };
  return map[type]?.[lang] || type;
}

export function formatDate(date: string, lang: Language): string {
  const d = new Date(date);
  if (lang === 'en') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatCalendarTitle(year: number, month: number, lang: Language): string {
  if (lang === 'en') {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${months[month]} ${year}`;
  }
  return `${year}年${month + 1}月`;
}
