import bcrypt from 'bcryptjs';
import { sequelize, User, Hotel, RoomType, NearbyPlace } from './models';

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database reset');

  // Create users
  const adminHash = await bcrypt.hash('admin123', 10);
  const merchantHash = await bcrypt.hash('merchant123', 10);

  const admin = await User.create({ username: 'admin', password_hash: adminHash, role: 'admin' });
  const merchant = await User.create({ username: 'merchant', password_hash: merchantHash, role: 'merchant' });
  console.log('Users created: admin/admin123, merchant/merchant123');

  // Create hotels
  const hotelsData = [
    {
      name_cn: '上海外滩华尔道夫酒店', name_en: 'Waldorf Astoria Shanghai on the Bund',
      city: '上海', address: '上海市黄浦区中山东一路2号', star: 5, opening_date: '2010-01-01',
      description: '坐落于外滩标志性建筑群中，尽享黄浦江畔壮丽景色，传承百年历史底蕴。',
      tags: ['豪华', '江景', '历史建筑'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '免费停车场'],
      images: ['/demo/hotel1-1.jpg', '/demo/hotel1-2.jpg', '/demo/hotel1-3.jpg'],
      rooms: [
        { name: '豪华大床房', price: 1688, original_price: 1988, capacity: 2, breakfast: true },
        { name: '外滩景观双床房', price: 2188, original_price: 2588, capacity: 2, breakfast: true },
        { name: '行政套房', price: 3888, original_price: 4588, capacity: 3, breakfast: true },
        { name: '总统套房', price: 8888, original_price: null, capacity: 4, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '外滩', distance: '100米' },
        { type: 'attraction' as const, name: '东方明珠', distance: '1.5公里' },
        { type: 'transport' as const, name: '南京东路地铁站', distance: '500米' },
        { type: 'mall' as const, name: '南京路步行街', distance: '300米' },
      ],
    },
    {
      name_cn: '北京王府井文华东方酒店', name_en: 'Mandarin Oriental Wangfujing Beijing',
      city: '北京', address: '北京市东城区王府井大街269号', star: 5, opening_date: '2019-03-15',
      description: '位于繁华的王府井商业区，融合传统中式风格与现代奢华，享有紫禁城美景。',
      tags: ['豪华', '城景', '新开业'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '商务中心'],
      images: ['/demo/hotel2-1.jpg', '/demo/hotel2-2.jpg'],
      rooms: [
        { name: '精致大床房', price: 1488, original_price: 1788, capacity: 2, breakfast: false },
        { name: '豪华双床房', price: 1688, original_price: 1988, capacity: 2, breakfast: true },
        { name: '文华套房', price: 3288, original_price: null, capacity: 3, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '故宫博物院', distance: '800米' },
        { type: 'attraction' as const, name: '天安门广场', distance: '1公里' },
        { type: 'transport' as const, name: '王府井地铁站', distance: '200米' },
        { type: 'mall' as const, name: '王府井百货', distance: '100米' },
      ],
    },
    {
      name_cn: '杭州西湖国宾馆', name_en: 'West Lake State Guest House',
      city: '杭州', address: '杭州市西湖区杨公堤18号', star: 5, opening_date: '1958-06-01',
      description: '深藏西湖西岸，独享西湖美景，曾接待众多国家元首和政要。',
      tags: ['豪华', '湖景', '亲子', '历史建筑'], facilities: ['免费WiFi', '餐厅', '花园', '免费停车场', '会议室'],
      images: ['/demo/hotel3-1.jpg', '/demo/hotel3-2.jpg'],
      rooms: [
        { name: '园景标准间', price: 988, original_price: 1188, capacity: 2, breakfast: true },
        { name: '湖景大床房', price: 1588, original_price: 1888, capacity: 2, breakfast: true },
        { name: '湖景套房', price: 2688, original_price: null, capacity: 3, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '西湖', distance: '50米' },
        { type: 'attraction' as const, name: '灵隐寺', distance: '3公里' },
        { type: 'transport' as const, name: '杭州站', distance: '5公里' },
      ],
    },
    {
      name_cn: '三亚亚特兰蒂斯酒店', name_en: 'Atlantis Sanya',
      city: '三亚', address: '三亚市海棠区海棠北路36号', star: 5, opening_date: '2018-04-28',
      description: '坐落在国家海岸海棠湾，集酒店、水族馆、水上乐园于一体的综合度假目的地。',
      tags: ['豪华', '亲子', '海景', '度假'], facilities: ['免费WiFi', '水上乐园', '水族馆', '游泳池', '餐厅', 'SPA', '免费停车场'],
      images: ['/demo/hotel4-1.jpg', '/demo/hotel4-2.jpg'],
      rooms: [
        { name: '海景大床房', price: 1388, original_price: 1688, capacity: 2, breakfast: false },
        { name: '亲子家庭房', price: 1888, original_price: 2288, capacity: 4, breakfast: true },
        { name: '水底套房', price: 5888, original_price: 6888, capacity: 2, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '海棠湾', distance: '0米' },
        { type: 'attraction' as const, name: '蜈支洲岛', distance: '8公里' },
        { type: 'transport' as const, name: '三亚凤凰机场', distance: '40公里' },
        { type: 'mall' as const, name: '海棠湾免税店', distance: '2公里' },
      ],
    },
    {
      name_cn: '成都瑞吉酒店', name_en: 'The St. Regis Chengdu',
      city: '成都', address: '成都市高新区天府大道北段1号', star: 5, opening_date: '2014-09-01',
      description: '矗立于天府大道核心地段，俯瞰城市天际线，尽享管家式尊贵服务。',
      tags: ['豪华', '商务'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '商务中心'],
      images: ['/demo/hotel5-1.jpg', '/demo/hotel5-2.jpg'],
      rooms: [
        { name: '豪华客房', price: 1088, original_price: 1388, capacity: 2, breakfast: false },
        { name: '瑞吉套房', price: 2488, original_price: null, capacity: 2, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '春熙路', distance: '5公里' },
        { type: 'attraction' as const, name: '武侯祠', distance: '6公里' },
        { type: 'transport' as const, name: '火车南站地铁站', distance: '1公里' },
        { type: 'mall' as const, name: '银泰中心', distance: '500米' },
      ],
    },
    {
      name_cn: '广州白天鹅宾馆', name_en: 'White Swan Hotel Guangzhou',
      city: '广州', address: '广州市荔湾区沙面南街1号', star: 5, opening_date: '1983-02-06',
      description: '中国第一家中外合作五星级酒店，坐落于沙面岛上，毗邻珠江。',
      tags: ['豪华', '江景', '历史建筑'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', '免费停车场'],
      images: ['/demo/hotel6-1.jpg', '/demo/hotel6-2.jpg'],
      rooms: [
        { name: '标准双床房', price: 688, original_price: 888, capacity: 2, breakfast: false },
        { name: '江景大床房', price: 988, original_price: 1188, capacity: 2, breakfast: true },
        { name: '行政套房', price: 1888, original_price: null, capacity: 3, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '沙面岛', distance: '0米' },
        { type: 'attraction' as const, name: '上下九步行街', distance: '1公里' },
        { type: 'transport' as const, name: '黄沙地铁站', distance: '500米' },
      ],
    },
    {
      name_cn: '深圳柏悦酒店', name_en: 'Park Hyatt Shenzhen',
      city: '深圳', address: '深圳市福田区益田路5033号', star: 5, opening_date: '2020-11-01',
      description: '坐落于平安金融中心高层，享有城市全景视野，简约现代的艺术酒店。',
      tags: ['豪华', '商务', '新开业', '城景'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA'],
      images: ['/demo/hotel7-1.jpg', '/demo/hotel7-2.jpg'],
      rooms: [
        { name: '柏悦客房', price: 1288, original_price: 1588, capacity: 2, breakfast: false },
        { name: '柏悦套房', price: 2888, original_price: 3388, capacity: 2, breakfast: true },
        { name: '总统套房', price: 9888, original_price: null, capacity: 4, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '莲花山公园', distance: '2公里' },
        { type: 'transport' as const, name: '购物公园地铁站', distance: '300米' },
        { type: 'mall' as const, name: 'COCO Park', distance: '200米' },
      ],
    },
    {
      name_cn: '西安悦榕庄', name_en: 'Banyan Tree Xi\'an',
      city: '西安', address: '西安市曲江新区曲江池东路988号', star: 4, opening_date: '2016-05-01',
      description: '融合盛唐文化底蕴，毗邻曲江池遗址公园，体验古都风情。',
      tags: ['度假', '亲子', '历史建筑'], facilities: ['免费WiFi', '游泳池', '餐厅', 'SPA', '免费停车场'],
      images: ['/demo/hotel8-1.jpg', '/demo/hotel8-2.jpg'],
      rooms: [
        { name: '庭院大床房', price: 788, original_price: 988, capacity: 2, breakfast: true },
        { name: '豪华别墅', price: 1888, original_price: 2388, capacity: 4, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '大雁塔', distance: '2公里' },
        { type: 'attraction' as const, name: '曲江池遗址公园', distance: '200米' },
        { type: 'transport' as const, name: '曲江站', distance: '1公里' },
      ],
    },
  ];

  for (const data of hotelsData) {
    const hotel = await Hotel.create({
      name_cn: data.name_cn,
      name_en: data.name_en,
      city: data.city,
      address: data.address,
      star: data.star,
      opening_date: data.opening_date,
      description: data.description,
      tags: JSON.stringify(data.tags),
      facilities: JSON.stringify(data.facilities),
      images: JSON.stringify(data.images),
      merchant_id: merchant.id,
      status: 'approved',
    });

    for (const room of data.rooms) {
      await RoomType.create({
        hotel_id: hotel.id,
        name: room.name,
        price: room.price,
        original_price: room.original_price,
        capacity: room.capacity,
        breakfast: room.breakfast,
        images: '[]',
      });
    }

    for (const place of data.nearby) {
      await NearbyPlace.create({
        hotel_id: hotel.id,
        type: place.type,
        name: place.name,
        distance: place.distance,
      });
    }
  }

  console.log(`Created ${hotelsData.length} hotels with rooms and nearby places`);
  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
