import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { sequelize, User, Hotel, RoomType, NearbyPlace } from './models';

// ========== SVG Placeholder Image Generator ==========

interface Theme {
  c1: string; c2: string; c3: string; accent: string;
}

const cityThemes: Record<string, Theme> = {
  '上海': { c1: '#0c4a6e', c2: '#0284c7', c3: '#38bdf8', accent: '#fbbf24' },
  '北京': { c1: '#7f1d1d', c2: '#dc2626', c3: '#f87171', accent: '#fbbf24' },
  '杭州': { c1: '#064e3b', c2: '#059669', c3: '#34d399', accent: '#fbbf24' },
  '三亚': { c1: '#164e63', c2: '#0891b2', c3: '#22d3ee', accent: '#fbbf24' },
  '成都': { c1: '#4c1d95', c2: '#7c3aed', c3: '#a78bfa', accent: '#fbbf24' },
  '广州': { c1: '#78350f', c2: '#d97706', c3: '#fbbf24', accent: '#ffffff' },
  '深圳': { c1: '#1e293b', c2: '#475569', c3: '#94a3b8', accent: '#38bdf8' },
  '西安': { c1: '#451a03', c2: '#b45309', c3: '#f59e0b', accent: '#fef3c7' },
  '苏州': { c1: '#134e4a', c2: '#0d9488', c3: '#5eead4', accent: '#fbbf24' },
  '重庆': { c1: '#831843', c2: '#db2777', c3: '#f472b6', accent: '#fbbf24' },
};

function getTheme(city: string): Theme {
  return cityThemes[city] || cityThemes['上海'];
}

function hotelSVG(name: string, nameEn: string, star: number, city: string, variant: number): string {
  const t = getTheme(city);
  const ch = name.charAt(0);
  const stars = '\u2605'.repeat(star);
  const cx = [650, 100, 400][variant] || 650;
  const cy = [120, 100, 80][variant] || 120;
  const x2 = variant === 1 ? '0' : '100';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
<defs>
<linearGradient id="bg" x1="0%" y1="0%" x2="${x2}%" y2="100%">
<stop offset="0%" stop-color="${t.c1}"/><stop offset="50%" stop-color="${t.c2}"/><stop offset="100%" stop-color="${t.c3}"/>
</linearGradient>
<linearGradient id="ov" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stop-color="rgba(0,0,0,0)"/><stop offset="65%" stop-color="rgba(0,0,0,0)"/><stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
</linearGradient>
</defs>
<rect width="800" height="500" fill="url(#bg)"/>
<rect width="800" height="500" fill="url(#ov)"/>
<circle cx="${cx}" cy="${cy}" r="200" fill="#fff" opacity=".06"/>
<circle cx="${cx + 80}" cy="${cy - 40}" r="120" fill="#fff" opacity=".04"/>
<circle cx="${800 - cx}" cy="${500 - cy}" r="160" fill="#fff" opacity=".04"/>
<text x="400" y="220" font-family="Arial,'Microsoft YaHei','PingFang SC',sans-serif" font-size="160" font-weight="bold" fill="#fff" opacity=".1" text-anchor="middle" dominant-baseline="middle">${ch}</text>
<text x="48" y="388" font-family="Arial,sans-serif" font-size="20" fill="${t.accent}">${stars}</text>
<text x="48" y="428" font-family="Arial,'Microsoft YaHei','PingFang SC',sans-serif" font-size="30" font-weight="bold" fill="#fff">${name}</text>
<text x="48" y="465" font-family="Arial,'Microsoft YaHei','PingFang SC',sans-serif" font-size="16" fill="#fff" opacity=".7">${nameEn}</text>
</svg>`;
}

function roomSVG(roomName: string, city: string, idx: number): string {
  const t = getTheme(city);
  // Slight color shift per room
  const colors = [
    [t.c1, t.c2],
    [t.c2, t.c3],
    [t.c1, t.c3],
  ];
  const [ca, cb] = colors[idx % colors.length];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
<defs>
<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" stop-color="${ca}"/><stop offset="100%" stop-color="${cb}"/>
</linearGradient>
</defs>
<rect width="600" height="400" fill="url(#bg)"/>
<circle cx="300" cy="155" r="100" fill="#fff" opacity=".07"/>
<circle cx="440" cy="100" r="55" fill="#fff" opacity=".05"/>
<g transform="translate(265,115)" fill="#fff" opacity=".18">
<rect x="0" y="30" width="70" height="7" rx="3.5"/>
<rect x="5" y="12" width="25" height="18" rx="5"/>
<rect x="-4" y="37" width="78" height="5" rx="2.5"/>
<rect x="0" y="42" width="4" height="9" rx="2"/>
<rect x="66" y="42" width="4" height="9" rx="2"/>
</g>
<text x="300" y="255" font-family="Arial,'Microsoft YaHei','PingFang SC',sans-serif" font-size="24" font-weight="bold" fill="#fff" text-anchor="middle">${roomName}</text>
<text x="300" y="288" font-family="Arial,'Microsoft YaHei','PingFang SC',sans-serif" font-size="13" fill="#fff" opacity=".55" text-anchor="middle">Room Type</text>
</svg>`;
}

// ========== Write SVGs to disk ==========

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeSVG(filePath: string, content: string) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ========== Main Seed ==========

async function seed() {
  await sequelize.sync({ force: true });
  console.log('Database reset');

  const uploadsDir = path.join(__dirname, 'uploads');
  ensureDir(uploadsDir);

  // Create users
  const adminHash = await bcrypt.hash('admin123', 10);
  const merchantHash = await bcrypt.hash('merchant123', 10);

  const admin = await User.create({ username: 'admin', password_hash: adminHash, role: 'admin' });
  const merchant = await User.create({ username: 'merchant', password_hash: merchantHash, role: 'merchant' });
  console.log('Users created: admin/admin123, merchant/merchant123');

  // Hotel seed data
  const hotelsData = [
    {
      name_cn: '上海外滩华尔道夫酒店', name_en: 'Waldorf Astoria Shanghai on the Bund',
      city: '上海', address: '上海市黄浦区中山东一路2号', star: 5, opening_date: '2010-01-01',
      description: '坐落于外滩标志性建筑群中，尽享黄浦江畔壮丽景色，传承百年历史底蕴。酒店拥有优雅的Art Deco风格装饰，提供世界级的餐饮和水疗服务，是体验老上海风情与现代奢华的完美结合。',
      tags: ['豪华', '江景', '历史建筑'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '免费停车场'],
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
      description: '位于繁华的王府井商业区，融合传统中式风格与现代奢华，享有紫禁城美景。酒店设计灵感源于北京的皇家文化遗产，每间客房都精心装饰，提供顶级的管家式服务体验。',
      tags: ['豪华', '城景', '新开业'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '商务中心'],
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
      description: '深藏西湖西岸，独享西湖美景，曾接待众多国家元首和政要。酒店坐拥36万平方米的私属园林，亭台楼阁、曲径通幽，是杭州最具历史底蕴的高端度假胜地。',
      tags: ['豪华', '湖景', '亲子', '历史建筑'], facilities: ['免费WiFi', '餐厅', '花园', '免费停车场', '会议室'],
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
      description: '坐落在国家海岸海棠湾，集酒店、水族馆、水上乐园于一体的综合度假目的地。酒店拥有1314间海景客房，失落的空间水族馆和亚特兰蒂斯水世界，是家庭度假的理想之选。',
      tags: ['豪华', '亲子', '海景', '度假'], facilities: ['免费WiFi', '水上乐园', '水族馆', '游泳池', '餐厅', 'SPA', '免费停车场'],
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
      description: '矗立于天府大道核心地段，俯瞰城市天际线，尽享管家式尊贵服务。酒店以现代蜀文化为设计灵感，融入成都特有的悠然生活美学，每位宾客均可享受专属管家服务。',
      tags: ['豪华', '商务'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '商务中心'],
      rooms: [
        { name: '豪华客房', price: 1088, original_price: 1388, capacity: 2, breakfast: false },
        { name: '瑞吉套房', price: 2488, original_price: null, capacity: 2, breakfast: true },
        { name: '总统套房', price: 6888, original_price: 7888, capacity: 4, breakfast: true },
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
      description: '中国第一家中外合作五星级酒店，坐落于沙面岛上，毗邻珠江。酒店以其标志性的故乡水室内瀑布闻名，融合岭南建筑风格与现代设施，是广州的城市地标。',
      tags: ['豪华', '江景', '历史建筑'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', '免费停车场'],
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
      description: '坐落于平安金融中心高层，享有城市全景视野，简约现代的艺术酒店。酒店位于全球第四高楼内，每间客房均可俯瞰深圳城市天际线，提供极致私密的入住体验。',
      tags: ['豪华', '商务', '新开业', '城景'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA'],
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
      name_cn: '西安悦榕庄', name_en: "Banyan Tree Xi'an",
      city: '西安', address: '西安市曲江新区曲江池东路988号', star: 4, opening_date: '2016-05-01',
      description: '融合盛唐文化底蕴，毗邻曲江池遗址公园，体验古都风情。酒店建筑融入唐代宫殿元素，每栋独立别墅均配有私人庭院和温泉泡池，是感受千年古都魅力的绝佳之选。',
      tags: ['度假', '亲子', '历史建筑'], facilities: ['免费WiFi', '游泳池', '餐厅', 'SPA', '免费停车场'],
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
    {
      name_cn: '苏州柏悦酒店', name_en: 'Park Hyatt Suzhou',
      city: '苏州', address: '苏州市工业园区苏惠路88号', star: 5, opening_date: '2022-06-18',
      description: '坐落于金鸡湖畔，将苏州园林美学与当代设计完美结合。酒店由日本著名建筑师设计，以"园中园"理念打造，处处可见移步换景的江南意趣，是艺术与奢华的完美交融。',
      tags: ['豪华', '湖景', '新开业'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '商务中心'],
      rooms: [
        { name: '园景客房', price: 1188, original_price: 1488, capacity: 2, breakfast: false },
        { name: '湖景大床房', price: 1688, original_price: 2088, capacity: 2, breakfast: true },
        { name: '柏悦套房', price: 3288, original_price: 3888, capacity: 3, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '金鸡湖', distance: '100米' },
        { type: 'attraction' as const, name: '拙政园', distance: '8公里' },
        { type: 'transport' as const, name: '文化博览中心站', distance: '600米' },
        { type: 'mall' as const, name: '苏州中心', distance: '500米' },
      ],
    },
    {
      name_cn: '重庆来福士洲际酒店', name_en: 'InterContinental Chongqing Raffles City',
      city: '重庆', address: '重庆市渝中区朝天门广场1号', star: 5, opening_date: '2020-09-01',
      description: '位于重庆标志性建筑来福士广场顶部，坐拥两江交汇壮丽景色。酒店设计灵感源自重庆山城地形，空中连廊横跨250米高空，提供独一无二的城市天际线体验。',
      tags: ['豪华', '江景', '新开业', '城景'], facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', 'SPA', '商务中心'],
      rooms: [
        { name: '江景大床房', price: 1188, original_price: 1488, capacity: 2, breakfast: false },
        { name: '洲际豪华房', price: 1588, original_price: 1888, capacity: 2, breakfast: true },
        { name: '行政套房', price: 2888, original_price: 3388, capacity: 3, breakfast: true },
        { name: '总统套房', price: 6888, original_price: null, capacity: 4, breakfast: true },
      ],
      nearby: [
        { type: 'attraction' as const, name: '朝天门广场', distance: '0米' },
        { type: 'attraction' as const, name: '洪崖洞', distance: '500米' },
        { type: 'transport' as const, name: '小什字地铁站', distance: '300米' },
        { type: 'mall' as const, name: '来福士购物中心', distance: '0米' },
      ],
    },
  ];

  // Generate SVG images and create hotels
  let totalImages = 0;

  for (let hi = 0; hi < hotelsData.length; hi++) {
    const data = hotelsData[hi];

    // Generate 3 hotel images
    const hotelImgPaths: string[] = [];
    for (let vi = 0; vi < 3; vi++) {
      const filename = `demo-hotel${hi + 1}-${vi + 1}.svg`;
      const svg = hotelSVG(data.name_cn, data.name_en, data.star, data.city, vi);
      writeSVG(path.join(uploadsDir, filename), svg);
      hotelImgPaths.push(`/uploads/${filename}`);
      totalImages++;
    }

    // Create hotel
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
      images: JSON.stringify(hotelImgPaths),
      merchant_id: merchant.id,
      status: 'approved',
    });

    // Create rooms with images
    for (let ri = 0; ri < data.rooms.length; ri++) {
      const room = data.rooms[ri];
      const roomFilename = `demo-room${hi + 1}-${ri + 1}.svg`;
      const svg = roomSVG(room.name, data.city, ri);
      writeSVG(path.join(uploadsDir, roomFilename), svg);
      totalImages++;

      await RoomType.create({
        hotel_id: hotel.id,
        name: room.name,
        price: room.price,
        original_price: room.original_price,
        capacity: room.capacity,
        breakfast: room.breakfast,
        images: JSON.stringify([`/uploads/${roomFilename}`]),
      });
    }

    // Create nearby places
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
  console.log(`Generated ${totalImages} demo SVG images`);
  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
