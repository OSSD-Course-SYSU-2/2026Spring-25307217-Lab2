import { preferences, distributedDataObject } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';
import { webview } from '@kit.ArkWeb';
import { util } from '@kit.ArkTS';
import { BusinessError, pasteboard } from '@kit.BasicServicesKit';


// ==========================================
// 数据模型与常量定义
// ==========================================
interface Airport {
  name: string;
  iata: string;
  time: number;
  isPremium: boolean;
  lng: number;
  lat: number;
}

interface Plane {
  model: string;
  brand: 'Boeing' | 'Airbus' | 'COMAC';
  price: number;
  logoUrl: ResourceStr;
  gradient: [string, string];
  intro: string;
  multiplier: number;
}

interface ScheduleItem {
  id: number;
  taskType: string;
  startTime: Date;
  endTime: Date;
  originIata: string;
  originName: string;
  destIata: string;
  destName: string;
  planeModel: string;
  expectedProfit: number;
  isCoFlight: boolean;
  coFlightId: string;
}

interface Friend {
  uid: string;
  airlineName: string;
  airlineCode: string;
  addedAt: number;
}

interface CoFlightSession {
  sessionId: string;
  flightNumber: string;
  creatorUid: string;
  creatorName: string;
  durationMinutes: number;
  originIata: string;
  originName: string;
  destIata: string;
  destName: string;
  planeModel: string;
  participants: string[];
  participantTasks: Record<string, string>;
  startTime: number;
  status: 'waiting' | 'flying' | 'completed';
}

interface FocusSettlementData {
  taskType: string;
  destIata: string;
  destName: string;
  planeModel: string;
  profit: number;
  focusMinutes: number;
  newRoute: boolean;
  originIata: string;
  originName: string;
  destLng: number;
  destLat: number;
  originLng: number;
  originLat: number;
}

interface FlightRecord {
  id: number;
  originIata: string;
  originName: string;
  destIata: string;
  destName: string;
  originLng: number;
  originLat: number;
  destLng: number;
  destLat: number;
  timestamp: number;
}

interface PlanTask {
  id: number;
  name: string;
  duration: number;
}

interface RoutePoint {
  originIata: string;
  originLng: number;
  originLat: number;
  destIata: string;
  destLng: number;
  destLat: number;
}

// ================= 满血机队数据库 (保留渐变UI) =================
const ALL_PLANES: Plane[] = [
  { model: 'ARJ21', brand: 'COMAC', price: 300, logoUrl: $r('app.media.comac_logo'), gradient: ['#f12711', '#f5af19'], multiplier: 1.0, intro: '中国首款自行研制的喷气式支线客机，适应高原与极端天气。' },
  { model: 'C919', brand: 'COMAC', price: 1200, logoUrl: $r('app.media.comac_logo'), gradient: ['#f12711', '#f5af19'], multiplier: 1.5, intro: '中国首款按照国际通行适航标准自行研制、具有自主知识产权的干线客机。' },
  { model: 'C929', brand: 'COMAC', price: 2500, logoUrl: $r('app.media.comac_logo'), gradient: ['#f12711', '#f5af19'], multiplier: 2.2, intro: '正在研制中的远程宽体客机，旨在打破远程宽体航线的垄断。' },
  { model: '737-700', brand: 'Boeing', price: 700, logoUrl: $r('app.media.boeing_logo'), gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.2, intro: '新一代波音737系列的基础型号，广受欢迎的单通道客机。' },
  { model: '737-800', brand: 'Boeing', price: 800, logoUrl: $r('app.media.boeing_logo'), gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.3, intro: '波音737NG系列中最成功的型号，全球单通道客机的中流砥柱。' },
  { model: '737-900ER', brand: 'Boeing', price: 900, logoUrl: $r('app.media.boeing_logo'), gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.4, intro: '波音737NG系列中航程最长、载客量最大的延程型号。' },
  { model: '737 MAX 7', brand: 'Boeing', price: 1000, logoUrl: $r('app.media.boeing_logo'), gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.4, intro: '波音737 MAX系列中最短的型号，拥有出色的高原高温性能。' },
  { model: '737 MAX 8', brand: 'Boeing', price: 1100, logoUrl: $r('app.media.boeing_logo'), gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.5, intro: '波音737 MAX系列的核心型号，燃油效率较上一代显著提升。' },
  { model: '737 MAX 9', brand: 'Boeing', price: 1200, logoUrl: $r('app.media.boeing_logo'), gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.6, intro: '加长版的737 MAX，为航空公司提供更大的运力。' },
  { model: '757-200', brand: 'Boeing', price: 1500, logoUrl: $r('app.media.boeing_logo'), gradient: ['#283c86', '#45a247'], multiplier: 1.7, intro: '动力强劲的窄体干线客机，被誉为“空中法拉利”。' },
  { model: '757-300', brand: 'Boeing', price: 1700, logoUrl: $r('app.media.boeing_logo'), gradient: ['#283c86', '#45a247'], multiplier: 1.8, intro: '波音757的加长版，单通道客机中机身最长的型号之一。' },
  { model: '767-300ER', brand: 'Boeing', price: 2200, logoUrl: $r('app.media.boeing_logo'), gradient: ['#1c92d2', '#f2fcfe'], multiplier: 1.9, intro: '经典的双发宽体客机延程型，开创了跨大西洋双发飞行的先河。' },
  { model: '767-400ER', brand: 'Boeing', price: 2500, logoUrl: $r('app.media.boeing_logo'), gradient: ['#1c92d2', '#f2fcfe'], multiplier: 2.0, intro: '波音767系列的最终加长型号，融合了777的驾驶舱技术。' },
  { model: '787-8', brand: 'Boeing', price: 2600, logoUrl: $r('app.media.boeing_logo'), gradient: ['#141E30', '#243B55'], multiplier: 2.0, intro: '“梦想客机”系列的基础型号，大量采用复合材料制造。' },
  { model: '787-9', brand: 'Boeing', price: 2800, logoUrl: $r('app.media.boeing_logo'), gradient: ['#141E30', '#243B55'], multiplier: 2.1, intro: '最畅销的“梦想客机”型号，在航程与载客量间取得完美平衡。' },
  { model: '787-10', brand: 'Boeing', price: 3200, logoUrl: $r('app.media.boeing_logo'), gradient: ['#141E30', '#243B55'], multiplier: 2.2, intro: '“梦想客机”家族中最长的成员，具有极高的运营经济性。' },
  { model: '777-200ER', brand: 'Boeing', price: 3500, logoUrl: $r('app.media.boeing_logo'), gradient: ['#000046', '#1CB5E0'], multiplier: 2.3, intro: '波音777家族早期的主力延程型号，远程宽体客机的标杆。' },
  { model: '777-300ER', brand: 'Boeing', price: 4200, logoUrl: $r('app.media.boeing_logo'), gradient: ['#000046', '#1CB5E0'], multiplier: 2.5, intro: '全球最成功的远程宽体客机之一，以其强大的双发性能著称。' },
  { model: '777F', brand: 'Boeing', price: 4500, logoUrl: $r('app.media.boeing_logo'), gradient: ['#000046', '#1CB5E0'], multiplier: 2.6, intro: '基于777-200LR开发的全球最卓越的大型双发货机。' },
  { model: '777X', brand: 'Boeing', price: 5000, logoUrl: $r('app.media.boeing_logo'), gradient: ['#000046', '#1CB5E0'], multiplier: 2.8, intro: '波音最新一代旗舰宽体客机，拥有可折叠翼尖和惊人的复合材料机翼。' },
  { model: '747-400', brand: 'Boeing', price: 4000, logoUrl: $r('app.media.boeing_logo'), gradient: ['#141E30', '#243B55'], multiplier: 2.8, intro: '最经典的“空中女王”型号，统治远程民航市场数十载。' },
  { model: '747-8', brand: 'Boeing', price: 5500, logoUrl: $r('app.media.boeing_logo'), gradient: ['#141E30', '#243B55'], multiplier: 3.0, intro: '“空中女王”的最终型号，航空史上的不可磨灭的巨无霸偶像。' },
  { model: 'A319', brand: 'Airbus', price: 700, logoUrl: $r('app.media.airbus_logo'), gradient: ['#8A2387', '#E94057'], multiplier: 1.2, intro: 'A320家族的缩短版，被誉为“高原雄鹰”。' },
  { model: 'A320ceo', brand: 'Airbus', price: 800, logoUrl: $r('app.media.airbus_logo'), gradient: ['#8A2387', '#E94057'], multiplier: 1.3, intro: '全球最畅销的单通道飞机之一，奠定了空客在窄体机市场的地位。' },
  { model: 'A320neo', brand: 'Airbus', price: 900, logoUrl: $r('app.media.airbus_logo'), gradient: ['#8A2387', '#E94057'], multiplier: 1.4, intro: '配备新型发动机和鲨鳍小翼的A320，燃油效率大幅提升。' },
  { model: 'A321ceo', brand: 'Airbus', price: 1000, logoUrl: $r('app.media.airbus_logo'), gradient: ['#8A2387', '#E94057'], multiplier: 1.4, intro: 'A320家族中最长的型号，提供接近宽体机的载客量。' },
  { model: 'A321neo', brand: 'Airbus', price: 1100, logoUrl: $r('app.media.airbus_logo'), gradient: ['#8A2387', '#E94057'], multiplier: 1.5, intro: '当今单通道客机市场的绝对明星，航程与运载力极其优秀。' },
  { model: 'A321XLR', brand: 'Airbus', price: 1400, logoUrl: $r('app.media.airbus_logo'), gradient: ['#8A2387', '#E94057'], multiplier: 1.7, intro: '超长航程窄体机，足以打破宽体客机对跨大西洋航线的垄断。' },
  { model: 'A330-200', brand: 'Airbus', price: 2300, logoUrl: $r('app.media.airbus_logo'), gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 1.9, intro: '经典的双发宽体客机，灵活胜任中远程各种航线。' },
  { model: 'A330-300', brand: 'Airbus', price: 2500, logoUrl: $r('app.media.airbus_logo'), gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 2.0, intro: '高密度中短程航线之王，区域宽体机的最佳选择。' },
  { model: 'A330-200F', brand: 'Airbus', price: 2600, logoUrl: $r('app.media.airbus_logo'), gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 2.1, intro: '基于A330系列改装的现代中型全货机。' },
  { model: 'A330-800', brand: 'Airbus', price: 2800, logoUrl: $r('app.media.airbus_logo'), gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 2.1, intro: 'A330neo家族的超长航程型号，采用了全新复合材料机翼。' },
  { model: 'A330-900', brand: 'Airbus', price: 3000, logoUrl: $r('app.media.airbus_logo'), gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 2.2, intro: 'A330-300的完美继任者，以更低的油耗提供相同的运力。' },
  { model: 'A350-900', brand: 'Airbus', price: 3300, logoUrl: $r('app.media.airbus_logo'), gradient: ['#403B4A', '#E7E9BB'], multiplier: 2.3, intro: '空客新一代旗舰宽体客机，机身大面积采用碳纤维复合材料。' },
  { model: 'A350-1000', brand: 'Airbus', price: 3800, logoUrl: $r('app.media.airbus_logo'), gradient: ['#403B4A', '#E7E9BB'], multiplier: 2.5, intro: 'A350家族最大的成员，提供极致的静谧体验与卓越的运载能力。' },
  { model: 'A380-800', brand: 'Airbus', price: 7000, logoUrl: $r('app.media.airbus_logo'), gradient: ['#1D2B64', '#F8CDDA'], multiplier: 4.0, intro: '双层巨无霸，世界上最大的民航客机，航空工程的巅峰之作。' }
];

// ================= 55个全国机场矩阵 =================
const ALL_AIRPORTS: Airport[] = [
  { name: '广州白云', iata: 'CAN', time: 0, isPremium: true, lng: 113.29, lat: 23.39 },
  { name: '北京首都', iata: 'PEK', time: 180, isPremium: true, lng: 116.58, lat: 40.08 },
  { name: '北京大兴', iata: 'PKX', time: 185, isPremium: true, lng: 116.41, lat: 39.51 },
  { name: '上海浦东', iata: 'PVG', time: 135, isPremium: true, lng: 121.80, lat: 31.14 },
  { name: '上海虹桥', iata: 'SHA', time: 130, isPremium: true, lng: 121.33, lat: 31.19 },
  { name: '深圳宝安', iata: 'SZX', time: 40, isPremium: true, lng: 113.81, lat: 22.64 },
  { name: '成都天府', iata: 'TFU', time: 145, isPremium: true, lng: 104.44, lat: 30.27 },
  { name: '成都双流', iata: 'CTU', time: 140, isPremium: true, lng: 103.94, lat: 30.57 },
  { name: '西安咸阳', iata: 'XIY', time: 155, isPremium: true, lng: 108.75, lat: 34.45 },
  { name: '杭州萧山', iata: 'HGH', time: 120, isPremium: true, lng: 120.43, lat: 30.23 },
  { name: '重庆江北', iata: 'CKG', time: 140, isPremium: true, lng: 106.64, lat: 29.72 },
  { name: '南京禄口', iata: 'NKG', time: 135, isPremium: true, lng: 118.86, lat: 31.74 },
  { name: '武汉天河', iata: 'WUH', time: 105, isPremium: true, lng: 114.21, lat: 30.78 },
  { name: '昆明长水', iata: 'KMG', time: 160, isPremium: true, lng: 102.93, lat: 25.10 },
  { name: '厦门高崎', iata: 'XMN', time: 80, isPremium: true, lng: 118.13, lat: 24.54 },
  { name: '郑州新郑', iata: 'CGO', time: 130, isPremium: true, lng: 113.84, lat: 34.52 },
  { name: '长沙黄花', iata: 'CSX', time: 80, isPremium: true, lng: 113.22, lat: 28.19 },
  { name: '青岛胶东', iata: 'TAO', time: 170, isPremium: true, lng: 120.08, lat: 36.26 },
  { name: '天津滨海', iata: 'TSN', time: 175, isPremium: true, lng: 117.34, lat: 39.12 },
  { name: '沈阳桃仙', iata: 'SHE', time: 200, isPremium: true, lng: 123.48, lat: 41.64 },
  { name: '哈尔滨太平', iata: 'HRB', time: 240, isPremium: true, lng: 126.25, lat: 45.62 },
  { name: '乌鲁木齐', iata: 'URC', time: 300, isPremium: true, lng: 87.47, lat: 43.90 },

  // 免费支线/次级枢纽 (isPremium: false)
  { name: '珠海金湾', iata: 'ZUH', time: 30, isPremium: false, lng: 113.37, lat: 22.01 },
  { name: '揭阳潮汕', iata: 'SWA', time: 45, isPremium: false, lng: 116.51, lat: 23.55 },
  { name: '湛江吴川', iata: 'ZJA', time: 55, isPremium: false, lng: 110.46, lat: 21.42 },
  { name: '梅州梅县', iata: 'MXZ', time: 40, isPremium: false, lng: 116.10, lat: 24.26 },
  { name: '海口美兰', iata: 'HAK', time: 65, isPremium: false, lng: 110.46, lat: 19.93 },
  { name: '三亚凤凰', iata: 'SYX', time: 90, isPremium: false, lng: 109.41, lat: 18.30 },
  { name: '桂林两江', iata: 'KWL', time: 70, isPremium: false, lng: 110.04, lat: 25.22 },
  { name: '北海福成', iata: 'BHY', time: 85, isPremium: false, lng: 109.29, lat: 21.54 },
  { name: '南宁吴圩', iata: 'NNG', time: 75, isPremium: false, lng: 108.11, lat: 22.60 },
  { name: '贵阳龙洞堡', iata: 'KWE', time: 100, isPremium: false, lng: 106.80, lat: 26.53 },
  { name: '泉州晋江', iata: 'JJN', time: 75, isPremium: false, lng: 118.59, lat: 24.80 },
  { name: '福州长乐', iata: 'FOC', time: 90, isPremium: false, lng: 119.66, lat: 25.93 },
  { name: '武夷山', iata: 'WUS', time: 95, isPremium: false, lng: 118.00, lat: 27.70 },
  { name: '赣州黄金', iata: 'KOW', time: 60, isPremium: false, lng: 114.78, lat: 25.85 },
  { name: '南昌昌北', iata: 'KHN', time: 80, isPremium: false, lng: 115.90, lat: 28.86 },
  { name: '井冈山', iata: 'JGS', time: 70, isPremium: false, lng: 114.74, lat: 26.85 },
  { name: '遵义新舟', iata: 'ZYI', time: 110, isPremium: false, lng: 107.24, lat: 27.81 },
  { name: '张家界', iata: 'DYG', time: 90, isPremium: false, lng: 110.45, lat: 29.10 },
  { name: '宜昌三峡', iata: 'YIH', time: 110, isPremium: false, lng: 111.48, lat: 30.55 },
  { name: '合肥新桥', iata: 'HFE', time: 110, isPremium: false, lng: 116.98, lat: 31.99 },
  { name: '宁波栎社', iata: 'NGB', time: 110, isPremium: false, lng: 121.46, lat: 29.82 },
  { name: '温州龙湾', iata: 'WNZ', time: 100, isPremium: false, lng: 120.85, lat: 27.91 },
  { name: '济南遥墙', iata: 'TNA', time: 150, isPremium: false, lng: 117.21, lat: 36.85 },
  { name: '太原武宿', iata: 'TYN', time: 160, isPremium: false, lng: 112.63, lat: 37.75 },
  { name: '石家庄', iata: 'SJW', time: 160, isPremium: false, lng: 114.69, lat: 38.28 },
  { name: '呼和浩特', iata: 'HET', time: 190, isPremium: false, lng: 111.82, lat: 40.85 },
  { name: '兰州中川', iata: 'LHW', time: 190, isPremium: false, lng: 103.62, lat: 36.51 },
  { name: '银川河东', iata: 'INC', time: 180, isPremium: false, lng: 106.39, lat: 38.32 },
  { name: '丽江三义', iata: 'LJG', time: 165, isPremium: false, lng: 100.25, lat: 26.68 },
  { name: '大理荒草坝', iata: 'DLU', time: 155, isPremium: false, lng: 100.32, lat: 25.65 },
  { name: '西双版纳', iata: 'JHG', time: 170, isPremium: false, lng: 100.76, lat: 21.97 },
  { name: '大连周水子', iata: 'DLC', time: 185, isPremium: false, lng: 121.54, lat: 38.96 },
  { name: '烟台蓬莱', iata: 'YNT', time: 175, isPremium: false, lng: 120.98, lat: 37.66 }
];

function padZero(num: number): string { return num < 10 ? '0' + num : num.toString(); }

function generateUID(): string {
  // 使用时间戳+随机数确保全局唯一，避免碰撞
  let timestamp = Date.now().toString(36).slice(-6);
  let hex = '0123456789ABCDEF';
  let uid = 'U' + timestamp;
  for (let i = 0; i < 6; i++) uid += hex[Math.floor(Math.random() * 16)];
  return uid;
}

function generateCoFlightNumber(): string {
  let cs = 'CS';
  for (let i = 0; i < 4; i++) cs += Math.floor(Math.random() * 10).toString();
  return cs;
}

// ==========================================
// 内存级LRU缓存层 —— 提升缓存命中率，减少preferences磁盘IO
// ==========================================
class MemCache {
  private lru: util.LRUCache<string, Object>;
  private static instance: MemCache;

  private constructor() {
    this.lru = new util.LRUCache(256);
  }

  static getInstance(): MemCache {
    if (!MemCache.instance) {
      MemCache.instance = new MemCache();
    }
    return MemCache.instance;
  }

  get(key: string): Object | undefined {
    return this.lru.get(key);
  }

  put(key: string, value: Object): void {
    this.lru.put(key, value);
  }

  remove(key: string): void {
    this.lru.remove(key);
  }

  clear(): void {
    this.lru.clear();
    this.lru.updateCapacity(256);
  }

  contains(key: string): boolean {
    return this.lru.contains(key);
  }
}

// ==========================================
// 分布式同步状态数据结构 —— 跨设备编辑进度同步
// ==========================================
class DistributedFlightState {
  coinBalance: number = 0;
  airportLevel: number = 1;
  totalFocusMinutes: number = 0;
  ownedPlanes: string[] = [];
  unlockedAirports: string[] = [];
  unlockedRoutes: string[] = [];
  scheduleListJson: string = '[]';
  activeFlightId: number = 0;
  activeFlightProgress: number = 0;
  lastUpdateDevice: string = '';
  lastUpdateTime: number = 0;
}

@Styles function glassEffect() {
  .backgroundColor('rgba(255, 255, 255, 0.12)')
  .backdropBlur(25)
  .border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' })
  .borderRadius(20)
  .shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 })
}

// ==========================================
// 弹窗：机型百科与购机确认
// ==========================================
@CustomDialog
struct PlaneIntroDialog {
  controller?: CustomDialogController;
  plane: Plane = ALL_PLANES[0];
  isOwned: boolean = false;
  onBuy: (plane: Plane) => void = () => {};

  build() {
    Column({ space: 15 }) {
      Image(this.plane.logoUrl).width('80%').height(70).objectFit(ImageFit.Contain)
        .backgroundColor('rgba(255,255,255,0.9)').borderRadius(15).padding(10)

      Text(this.plane.model).fontSize(28).fontWeight(FontWeight.Bold).fontColor('#000').margin({ top: 10 })
      Text(this.plane.brand).fontSize(16).fontColor('#00E5FF')
      Divider().color('rgba(255,255,255,0.2)')

      Text(this.plane.intro).fontSize(16).fontColor('#EEE').lineHeight(24).width('100%')

      Row() {
        Text('收益系数: ').fontColor('#AAA').fontSize(16)
        Text(`x${this.plane.multiplier.toFixed(1)}`).fontColor('#FFD700').fontWeight(FontWeight.Bold).fontSize(20)
      }.width('100%').margin({ top: 10, bottom: 15 })

      Row({ space: 15 }) {
        Button('取消').layoutWeight(1).height(50).backgroundColor('rgba(255,255,255,0.2)').fontColor('#FFF')
          .onClick(() => { this.controller?.close(); })

        Button(this.isOwned ? '已在库' : `购买 💰${this.plane.price}`)
          .layoutWeight(1).height(50)
          .backgroundColor(this.isOwned ? 'rgba(255,255,255,0.1)' : '#00E5FF')
          .fontColor(this.isOwned ? '#999' : '#000')
          .enabled(!this.isOwned)
          .onClick(() => {
            this.onBuy(this.plane);
            this.controller?.close();
          })
      }.width('100%')
    }.width('100%').height('100%').linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] }).padding(25).glassEffect()
  }
}

// ==========================================
// 弹窗：选择好友创建共享航班（多选）
// ==========================================
@CustomDialog
struct FriendSelectDialog {
  controller?: CustomDialogController;
  friends: Friend[] = [];
  onConfirm: (selectedUids: string[]) => void = () => {};

  @State selectedSet: Set<string> = new Set();

  aboutToAppear() {
    this.selectedSet = new Set();
  }

  build() {
    Column({ space: 15 }) {
      Text('选择好友创建共享航班').fontSize(22).fontWeight(FontWeight.Bold).fontColor('#FFF')

      if (this.friends.length === 0) {
        Text('暂无好友，请先在好友系统中添加').fontColor('rgba(255,255,255,0.5)').fontSize(14).margin({ top: 20, bottom: 20 })
      } else {
        List({ space: 10 }) {
          ForEach(this.friends, (friend: Friend) => {
            ListItem() {
              Row() {
                Checkbox({ name: friend.uid, group: 'friendSelect' })
                  .onChange((value: boolean) => {
                    if (value) {
                      this.selectedSet.add(friend.uid);
                    } else {
                      this.selectedSet.delete(friend.uid);
                    }
                  })
                Column({ space: 2 }) {
                  Text(friend.airlineName).fontSize(16).fontWeight(FontWeight.Bold).fontColor('#FFF')
                  Text(friend.uid).fontSize(12).fontColor('rgba(255,255,255,0.5)')
                }.alignItems(HorizontalAlign.Start).margin({ left: 12 })
              }.width('100%').padding(12)
            }
          })
        }.height(250).width('100%')
      }

      Row({ space: 15 }) {
        Button('取消').layoutWeight(1).height(50).backgroundColor('rgba(255,255,255,0.2)').fontColor('#FFF')
          .onClick(() => { this.controller?.close(); })
        Button('确认').layoutWeight(1).height(50).backgroundColor('#00E5FF').fontColor('#000')
          .enabled(this.selectedSet.size > 0)
          .onClick(() => {
            this.onConfirm(Array.from(this.selectedSet));
            this.controller?.close();
          })
      }.width('100%')
    }.width('100%').height('100%').linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] }).padding(25).glassEffect()
  }
}

// ==========================================
// 弹窗：选择共享航班飞机（仅发起者机队）
// ==========================================
@CustomDialog
struct PlaneSelectForCoFlightDialog {
  controller?: CustomDialogController;
  ownedPlanes: string[] = [];
  onConfirm: (planeModel: string) => void = () => {};
  @State selectedPlane: string = '';

  build() {
    Column({ space: 15 }) {
      Text('选择本次共享航班使用的飞机').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#FFF')
      Text('仅能从你的个人机队中选择').fontSize(13).fontColor('rgba(255,255,255,0.5)')

      List({ space: 10 }) {
        ForEach(this.ownedPlanes, (model: string) => {
          ListItem() {
            Row() {
              Radio({ value: model, group: 'planeSelect' })
                .onChange((checked: boolean) => {
                  if (checked) {
                    this.selectedPlane = model;
                  }
                })
              Text(model).fontSize(16).fontColor('#FFF').margin({ left: 12 })
            }.width('100%').padding(12)
            .backgroundColor(this.selectedPlane === model ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.06)')
            .borderRadius(12)
            .onClick(() => { this.selectedPlane = model; })
          }
        })
      }.height(250).width('100%')

      Row({ space: 15 }) {
        Button('取消').layoutWeight(1).height(50).backgroundColor('rgba(255,255,255,0.2)').fontColor('#FFF')
          .onClick(() => { this.controller?.close(); })
        Button('确认').layoutWeight(1).height(50).backgroundColor('#00E5FF').fontColor('#000')
          .enabled(this.selectedPlane !== '')
          .onClick(() => {
            this.onConfirm(this.selectedPlane);
            this.controller?.close();
          })
      }.width('100%')
    }.width('100%').height('100%').linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] }).padding(25).glassEffect()
  }
}

// ==========================================
// 弹窗：选择起降机场
// ==========================================
@CustomDialog
struct AirportSelectDialog {
  controller?: CustomDialogController;
  airports: Airport[] = [];
  title: string = '选择机场';
  onConfirm: (airport: Airport) => void = () => {};
  @State selectedAirport: Airport | null = null;

  build() {
    Column({ space: 15 }) {
      Text(this.title).fontSize(22).fontWeight(FontWeight.Bold).fontColor('#FFF')

      List({ space: 10 }) {
        ForEach(this.airports, (apt: Airport) => {
          ListItem() {
            Row() {
              Radio({ value: apt.iata, group: 'airportSelect' })
                .onChange((checked: boolean) => {
                  if (checked) {
                    this.selectedAirport = apt;
                  }
                })
              Column({ space: 2 }) {
                Text(`${apt.name} (${apt.iata})`).fontSize(16).fontWeight(FontWeight.Bold).fontColor('#FFF')
                Text(`标准航程: ${apt.time} 分钟`).fontSize(12).fontColor('rgba(255,255,255,0.6)')
              }.margin({ left: 12 })
            }.width('100%').padding(12)
            .backgroundColor(this.selectedAirport?.iata === apt.iata ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.06)')
            .borderRadius(12)
            .onClick(() => { this.selectedAirport = apt; })
          }
        })
      }.height(300).width('100%')

      Row({ space: 15 }) {
        Button('取消').layoutWeight(1).height(50).backgroundColor('rgba(255,255,255,0.2)').fontColor('#FFF')
          .onClick(() => { this.controller?.close(); })
        Button('确认').layoutWeight(1).height(50).backgroundColor('#00E5FF').fontColor('#000')
          .enabled(this.selectedAirport !== null)
          .onClick(() => {
            if (this.selectedAirport) {
              this.onConfirm(this.selectedAirport);
              this.controller?.close();
            }
          })
      }.width('100%')
    }.padding(25).glassEffect()
  }
}

// ==========================================
// 主程序页面
// ==========================================
@Entry
@Component
struct FlightConcentrator {
  @State @Watch('onPageChange') currentPage: number = 10;

  // 新增回调函数：把当前页面同步到全局存储，供 EntryAbility 的 onContinue 读取
  onPageChange() {
    AppStorage.setOrCreate('currentActivePage', this.currentPage);
  }
  // 响应式断点：'sm'=手机/折叠态, 'md'=折叠展开/平板竖屏, 'lg'=平板横屏/三折叠G态, 'xl'=笔记本
  @StorageProp('currentBreakpoint') curBp: string = 'sm';

  // 认证状态控制：10-系统入口 (统一管理登录/注册)，0~9是业务页面
  @State authMode: 'login' | 'register' | 'entry' = 'entry';

  //飞行地图生成
  @State flightHistory: FlightRecord[] = [];
  // 认证信息
  @State sysUsername: string = '';
  @State sysPassword: string = '';
  @State airlineName: string = '';
  @State airlineCode: string = '';
  @State myUid: string = '';

  // 登录/注册表单
  @State formUser: string = '';
  @State formPwd: string = '';
  @State formAirName: string = '';
  @State formAirCode: string = '';
  @State authErrorMsg: string = '';

  // 好友系统
  @State friendsList: Friend[] = [];
  @State friendUidInput: string = '';
  @State friendAddMsg: string = '';

  // 到达机场连续性：记录上次执飞抵达的机场，绘制航线和结算
  @State currentAirport: string = 'CAN';
  @State currentAirportName: string = '广州白云';
  @State currentAirportLng: number = 113.29;
  @State currentAirportLat: number = 23.39;

  // 共享航班(Co-flight)
  @State coFlightSessions: CoFlightSession[] = [];
  @State activeCoFlight: CoFlightSession | null = null;
  @State coFlightTaskInput: string = '';
  @State coFlightJoinMsg: string = '';
  @State coFlightCreateMsg: string = '';
  @State isCreatingCoFlight: boolean = false;

  // 业务数据
  @State coinBalance: number = 0;
  @State airportLevel: number = 1;
  @State totalFocusMinutes: number = 0;
  @State unlockedAirports: string[] = [];
  @State unlockedRoutes: string[] = [];
  @State ownedPlanes: string[] = [];
  @State scheduleList: Array<ScheduleItem> = [];

  // 临时状态
  @State displayYear: number = new Date().getFullYear();
  @State displayMonth: number = new Date().getMonth();
  @State daysInMonthList: (number | null)[] = [];
  @State selectedDate: Date = new Date();
  @State tempTaskType: string = '';
  @State tempStartTime: Date = new Date();
  @State tempEndTime: Date = new Date();
  @State candidateAirports: Airport[] = [];
  @State selectedAirport: Airport | null = null;
  @State coFlightOriginAirport: Airport | null = null;
  @State coFlightDestAirport: Airport | null = null;
  @State targetPurchaseName: string = '';
  @State targetPurchasePrice: number = 0;
  @State targetPurchaseType: 'airport' | 'plane' = 'airport';
  @State targetPurchaseId: string = '';

  // ================= 本地多段连飞推演 =================
  @State planTasks: PlanTask[] = [
    { id: Date.now(), name: '深度阅读', duration: 45 }
  ];
  @State plannedRoute: ScheduleItem[] = []; // 生成的连飞航线
  @State isCalculatingRoute: boolean = false;
  @State aiIsCalculating: boolean = false;
  @State hasAiResult: boolean = false;
  @State aiTargetMinutes: number = 60;
  @State aiRecommendFlight: ScheduleItem = { id:0, taskType:'', startTime:new Date(), endTime:new Date(), originIata:'', originName:'', destIata:'', destName:'', planeModel:'', expectedProfit:0, isCoFlight:false, coFlightId:'' };

  // 执飞状态
  @State activeFlight: ScheduleItem = { id:0, taskType:'', startTime:new Date(), endTime:new Date(), originIata:'', originName:'', destIata:'', destName:'', planeModel:'', expectedProfit:0, isCoFlight:false, coFlightId:'' };
  @State remainingSeconds: number = 0;
  @State totalFlightSeconds: number = 1;
  @State currentAltitude: number = 0;
  @State currentSpeed: number = 0;
  private timerId: number = -1;

  private webController: webview.WebviewController = new webview.WebviewController();
  private context = getContext(this) as common.UIAbilityContext;
  private pref = preferences.getPreferencesSync(this.context, { name: 'aviation_pro_prefs' });
  private introDialog: CustomDialogController | null = null;
  private coFlightFriendDialog: CustomDialogController | null = null;
  private coFlightPlaneDialog: CustomDialogController | null = null;
  private coFlightOriginDialog: CustomDialogController | null = null;
  private coFlightDestDialog: CustomDialogController | null = null;

  // 内存缓存层 —— 读取数据时优先命中缓存，避免重复preferences磁盘IO
  private memCache: MemCache = MemCache.getInstance();

  // 分布式数据对象 —— 跨设备编辑进度同步
  private distObject: distributedDataObject.DataObject | null = null;
  private distSessionId: string = 'aviation_sync_session';
  private isDistSyncReady: boolean = false;

  // 分布式设备在线状态
  @State remoteDeviceOnline: boolean = false;

  // 执飞结束结算数据
  @State focusSettlementData: FocusSettlementData | null = null;

  // 地图交互：当前高亮的机场IATA
  @State highlightedAirportIata: string = '';

  aboutToAppear() {
    this.updateCalendarDays();
    this.checkAuthStatus();
    this.initDistributedSync();

    // 新增接续恢复逻辑
    // 检查 AppStorage 中是否有刚从 EntryAbility 传过来的页面参数
    let targetPage = AppStorage.get<number>('targetPageFromContinuation');
    if (targetPage !== undefined) {
      // 如果有，说明是接续过来的，直接跳转到目标页面！
      this.currentPage = targetPage;
      // 读完之后清空缓存，防止后续普通启动被误导
      AppStorage.delete('targetPageFromContinuation');
    }
  }

  aboutToDisappear() {
    if (this.timerId !== -1) {
      clearInterval(this.timerId);
      this.timerId = -1;
    }
    if (this.distObject) {
      try {
        this.distObject.off('change');
        this.distObject.off('status');
      } catch (e) {
        // ignore
      }
    }
  }

  // 初始化与鉴权
  checkAuthStatus() {
    this.sysUsername = this.pref.getSync('sys_username', '') as string;
    this.myUid = this.pref.getSync('my_uid', '') as string;
    // BUG修复：首次进入APP时自动生成全局唯一UID
    if (!this.myUid) {
      this.myUid = generateUID();
      this.pref.putSync('my_uid', this.myUid);
      this.pref.flushSync();
    }
    if (!this.sysUsername) {
      // 没账号，进入选择入口状态
      this.currentPage = 10;
      this.authMode = 'entry';
    } else {
      // 有缓存账号，引导至登录页（让用户输密码）
      this.currentPage = 10;
      this.authMode = 'login';
      this.sysPassword = this.pref.getSync('sys_password', '') as string;
      this.airlineName = this.pref.getSync('airline_name', '') as string;
      this.airlineCode = this.pref.getSync('airline_code', '') as string;
    }
  }

  loadBusinessData() {
    // 白鹭账号不加载本地存储数据，直接使用内存中的作弊数据
    if (this.sysUsername === '白鹭') {
      return;
    }
    this.coinBalance = this.pref.getSync('coin_balance', 0) as number;
    this.airportLevel = this.pref.getSync('airport_level', 1) as number;
    this.totalFocusMinutes = this.pref.getSync('total_focus', 0) as number;

    let freeAirports = ALL_AIRPORTS.filter(a => !a.isPremium).map(a => a.iata);
    let savedAirports: string[] = JSON.parse(this.pref.getSync('unlocked_airports', '[]') as string);
    this.unlockedAirports = Array.from(new Set(savedAirports.concat(freeAirports)));

    this.unlockedRoutes = JSON.parse(this.pref.getSync('unlocked_routes', '[]') as string) as string[];
    this.ownedPlanes = JSON.parse(this.pref.getSync('owned_planes', '[]') as string) as string[];

    // 【强制修复】无论何时读取，如果机库为空，强制发放 737-800 和 ARJ21
    if (!this.ownedPlanes || this.ownedPlanes.length === 0) {
      this.ownedPlanes = ["ARJ21", "A320neo"]; // 这里给你加上了 737
      // 必须立刻保存，覆盖掉本地错误的空数据
      this.pref.putSync('owned_planes', JSON.stringify(this.ownedPlanes));
      this.pref.flushSync();
    }

    let listJson = this.pref.getSync('flight_list', '[]') as string;
    let rawList: Record<string, Object>[] = JSON.parse(listJson);
    this.scheduleList = rawList.map((i: Record<string, Object>) => ({
      id: i.id as number,
      taskType: i.taskType as string,
      destIata: i.destIata as string,
      destName: i.destName as string,
      planeModel: i.planeModel as string,
      expectedProfit: i.expectedProfit as number,
      isCoFlight: (i.isCoFlight as boolean) || false,
      coFlightId: (i.coFlightId as string) || '',
      startTime: new Date(i.startTime as string),
      endTime: new Date(i.endTime as string)
    } as ScheduleItem));

    // 加载好友列表
    let friendsJson = this.pref.getSync('friends_list', '[]') as string;
    this.friendsList = JSON.parse(friendsJson) as Friend[];

    // 加载历史飞行记录
    let historyJson = this.pref.getSync('flight_history_list', '[]') as string;
    this.flightHistory = JSON.parse(historyJson) as FlightRecord[];

    // 加载共享航班
    let coFlightJson = this.pref.getSync('coflight_sessions', '[]') as string;
    this.coFlightSessions = JSON.parse(coFlightJson) as CoFlightSession[];
  }

  saveAllData() {
    // 白鹭账号数据不保存到本地存储，防止污染普通账号数据
    if (this.sysUsername === '白鹭') {
      return;
    }
    this.pref.putSync('sys_username', this.sysUsername);
    this.pref.putSync('sys_password', this.sysPassword);
    this.pref.putSync('my_uid', this.myUid);
    this.pref.putSync('airline_name', this.airlineName);
    this.pref.putSync('airline_code', this.airlineCode);
    this.pref.putSync('coin_balance', this.coinBalance);
    this.pref.putSync('airport_level', this.airportLevel);
    this.pref.putSync('total_focus', this.totalFocusMinutes);
    let premiumUnlocked = this.unlockedAirports.filter(iata => ALL_AIRPORTS.find(a => a.iata === iata)?.isPremium);
    this.pref.putSync('unlocked_airports', JSON.stringify(premiumUnlocked));
    this.pref.putSync('unlocked_routes', JSON.stringify(this.unlockedRoutes));
    this.pref.putSync('owned_planes', JSON.stringify(this.ownedPlanes));
    this.pref.putSync('flight_list', JSON.stringify(this.scheduleList));
    this.pref.putSync('friends_list', JSON.stringify(this.friendsList));
    this.pref.putSync('coflight_sessions', JSON.stringify(this.coFlightSessions));
    this.pref.putSync('flight_history_list', JSON.stringify(this.flightHistory));
    this.pref.flushSync();
    // 数据持久化后同步到分布式数据对象，供其他设备拉取
    this.syncLocalToDistributed();
  }

  resetSystem() {
    this.pref.clearSync();
    this.pref.flushSync();
    this.sysUsername = ''; this.sysPassword = '';
    this.formUser = ''; this.formPwd = ''; this.formAirName = ''; this.formAirCode = '';
    this.currentPage = 10;
    this.authMode = 'entry'; // 清理后返回主入口
  }

  // ================= 分布式同步 =================
  // 初始化分布式数据对象，实现跨设备编辑进度同步
  initDistributedSync() {
    try {
      let permissionGranted = AppStorage.get<boolean>('distributedPermissionGranted');
      if (!permissionGranted) {
        return;
      }
      let source = new DistributedFlightState();
      this.distObject = distributedDataObject.create(this.context, source);
      this.distObject.setSessionId(this.distSessionId).then(() => {
        this.isDistSyncReady = true;
        this.syncLocalToDistributed();
        this.distObject!.on('change', (sessionId: string, fields: Array<string>) => {
          this.onDistributedDataChanged(fields);
        });
        this.distObject!.on('status',
          (sessionId: string, networkId: string, status: 'online' | 'offline') => {
            this.remoteDeviceOnline = (status === 'online');
          });
      }).catch((_err: BusinessError) => {
        this.isDistSyncReady = false;
      });
    } catch (_e) {
      this.isDistSyncReady = false;
    }
  }

  // 将本地数据同步到分布式对象，供其他设备拉取
  syncLocalToDistributed() {
    if (!this.distObject || !this.isDistSyncReady) {
      return;
    }
    try {
      this.distObject['coinBalance'] = this.coinBalance;
      this.distObject['airportLevel'] = this.airportLevel;
      this.distObject['totalFocusMinutes'] = this.totalFocusMinutes;
      this.distObject['ownedPlanes'] = this.ownedPlanes;
      this.distObject['unlockedAirports'] = this.unlockedAirports;
      this.distObject['unlockedRoutes'] = this.unlockedRoutes;
      this.distObject['scheduleListJson'] = JSON.stringify(this.scheduleList);
      this.distObject['friendsListJson'] = JSON.stringify(this.friendsList);
      this.distObject['coFlightSessionsJson'] = JSON.stringify(this.coFlightSessions);
      this.distObject['activeFlightId'] = this.activeFlight.id;
      this.distObject['activeFlightProgress'] =
        this.totalFlightSeconds > 0 ? Math.round((1 - this.remainingSeconds / this.totalFlightSeconds) * 100) : 0;
      this.distObject['lastUpdateDevice'] = 'current';
      this.distObject['lastUpdateTime'] = Date.now();
    } catch (_e) {
      // 同步失败忽略
    }
  }

  // 当其他设备数据变更时，同步到本地
  onDistributedDataChanged(fields: Array<string>) {
    if (!this.distObject || !this.isDistSyncReady) {
      return;
    }
    try {
      for (let field of fields) {
        let val: Object = this.distObject[field];
        switch (field) {
          case 'coinBalance':
            this.coinBalance = val as number;
            break;
          case 'airportLevel':
            this.airportLevel = val as number;
            break;
          case 'totalFocusMinutes':
            this.totalFocusMinutes = val as number;
            break;
          case 'ownedPlanes':
            this.ownedPlanes = val as string[];
            break;
          case 'unlockedAirports':
            this.unlockedAirports = val as string[];
            break;
          case 'unlockedRoutes':
            this.unlockedRoutes = val as string[];
            break;
          case 'scheduleListJson':
            let rawList: Record<string, Object>[] = JSON.parse(val as string);
            this.scheduleList = rawList.map((i: Record<string, Object>) => ({
              id: i.id as number,
              taskType: i.taskType as string,
              destIata: i.destIata as string,
              destName: i.destName as string,
              planeModel: i.planeModel as string,
              expectedProfit: i.expectedProfit as number,
              isCoFlight: (i.isCoFlight as boolean) || false,
              coFlightId: (i.coFlightId as string) || '',
              startTime: new Date(i.startTime as string),
              endTime: new Date(i.endTime as string)
            } as ScheduleItem));
            break;
          case 'friendsListJson':
            this.friendsList = JSON.parse(val as string) as Friend[];
            break;
          case 'coFlightSessionsJson':
            this.coFlightSessions = JSON.parse(val as string) as CoFlightSession[];
            break;
          case 'activeFlightId':
            // 仅记录flightId，不自动启动飞行
            break;
          case 'activeFlightProgress':
            // 进度信息由业务层处理
            break;
        }
      }
      // 同步完成后保存到本地持久化
      this.saveAllData();
    } catch (_e) {
      // 同步失败忽略
    }
  }

  // ================= 核心业务补全 =================
  updateCalendarDays() {
    let firstDayOfMonth = new Date(this.displayYear, this.displayMonth, 1).getDay();
    let daysCount = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();
    let tempArr: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) tempArr.push(null);
    for (let i = 1; i <= daysCount; i++) tempArr.push(i);
    this.daysInMonthList = tempArr;
  }

  filterAirports() {
    let duration = (this.tempEndTime.getTime() - this.tempStartTime.getTime()) / 60000;
    if (duration <= 0) duration += 24 * 60;
    this.candidateAirports = ALL_AIRPORTS.filter(a => a.time > 0 && Math.abs(a.time - duration) <= 40);
  }

  // ================= 地图 Web GIS =================
  generateTrackMapHtml(): string {
    let recordsJson = JSON.stringify(this.flightHistory);
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width">
        <style>
            html, body, #container { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background-color: #0f2027;}
            .custom-marker {
                background: rgba(15,32,39,0.85); border: 1px solid #00E5FF; border-radius: 10px;
                padding: 3px 8px; font-weight: bold; font-size: 11px; color: #FFF; backdrop-filter: blur(5px);
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
            }
        </style>
        <script src="https://webapi.amap.com/maps?v=2.0&key=038b3400dd8b54da0a149c95eb9c7d42"></script>
    </head>
    <body>
    <div id="container"></div>
    <script>
        var map = new AMap.Map('container', { zoom: 4, center: [105.0, 35.0], mapStyle: 'amap://styles/darkblue' });
        var historyData = ${recordsJson};

        if (historyData && historyData.length > 0) {
            var airports = {};

            // 依次连线
            historyData.forEach(function(record, index) {
                airports[record.originIata] = [record.originLng, record.originLat];
                airports[record.destIata] = [record.destLng, record.destLat];

                // 绘制航线线段
                var polyline = new AMap.Polyline({
                    path: [ [record.originLng, record.originLat], [record.destLng, record.destLat] ],
                    strokeColor: '#00E5FF',
                    strokeWeight: 3,
                    strokeOpacity: 0.75,
                    lineJoin: 'round',
                    showDir: true // 显示航向箭头
                });
                map.add(polyline);
            });

            // 绘制通航标记
            for (var iata in airports) {
                var marker = new AMap.Marker({
                    position: airports[iata],
                    content: '<div class="custom-marker">' + iata + '</div>',
                    offset: new AMap.Pixel(-20, -10)
                });
                map.add(marker);
            }
            map.setFitView();
        }
    </script>
    </body>
    </html>`;
  }

  generateMapHtml(): string {
    let markers = this.candidateAirports.map(apt => {
      let isLocked = apt.isPremium && !this.unlockedAirports.includes(apt.iata);
      let color = isLocked ? '#999999' : (apt.isPremium ? '#FFD700' : '#00E5FF');
      return `{ position: [${apt.lng}, ${apt.lat}], title: '${apt.iata}', name: '${apt.name}', color: '${color}', locked: ${isLocked} }`;
    }).join(',');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width">
        <style>
            html, body, #container { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background-color: #0f2027;}
            .custom-marker {
                background: rgba(255,255,255,0.1); border: 1px solid; border-radius: 12px;
                padding: 4px 10px; font-weight: 500; font-size: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5); backdrop-filter: blur(10px); color: #FFF;
                cursor: pointer; pointer-events: auto;
            }
            .custom-marker.highlight {
                background: rgba(0,229,255,0.3); border-color: #00E5FF; transform: scale(1.15);
            }
        </style>
        <script src="https://webapi.amap.com/maps?v=2.0&key=038b3400dd8b54da0a149c95eb9c7d42"></script>
    </head>
    <body>
    <div id="container"></div>
    <script>
        var map = new AMap.Map('container', { zoom: 4, center: [105.0, 35.0], mapStyle: 'amap://styles/darkblue' });
        var allMarkers = {};
        var canMarker = new AMap.Marker({
            position: [113.2988, 23.3924],
            content: '<div class="custom-marker" style="border-color:#FFF; color:#FFF; font-weight:bold;">CAN (总部)</div>',
            offset: new AMap.Pixel(-35, -15), zIndex: 999
        });
        map.add(canMarker);
        var candidates = [${markers}];
        candidates.forEach(function(item) {
            var content = '<div class="custom-marker" id="mkr_' + item.title + '" style="border-color:' + item.color + ';">' + item.title + '</div>';
            var marker = new AMap.Marker({
                position: item.position,
                content: content,
                offset: new AMap.Pixel(-20, -10),
                zIndex: 100
            });
            marker.on('click', function() {
                window.harmony.postMessage(JSON.stringify({ type: 'markerClick', iata: item.title, lng: item.position[0], lat: item.position[1] }));
            });
            map.add(marker);
            allMarkers[item.title] = marker;
            var polyline = new AMap.Polyline({
                path: [ [113.2988, 23.3924], item.position ], strokeColor: item.color,
                strokeWeight: 2, strokeStyle: 'dashed', lineJoin: 'round'
            });
            map.add(polyline);
        });
        map.setFitView();
        function highlightMarker(iata) {
            for (var key in allMarkers) {
                var el = document.getElementById('mkr_' + key);
                if (el) {
                    if (key === iata) {
                        el.classList.add('highlight');
                    } else {
                        el.classList.remove('highlight');
                    }
                }
            }
        }
        function panToAirport(lng, lat) {
            map.setZoomAndCenter(7, [lng, lat]);
        }
        window.harmony.postMessage(JSON.stringify({ type: 'mapReady' }));
    </script>
    </body>
    </html>`;
  }

  generateSettlementMapHtml(data: FocusSettlementData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width">
        <style>
            html, body, #container { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background-color: #0f2027;}
            .custom-marker {
                background: rgba(255,255,255,0.12); border: 1px solid; border-radius: 12px;
                padding: 4px 10px; font-weight: 500; font-size: 12px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.5); backdrop-filter: blur(10px); color: #FFF;
            }
        </style>
        <script src="https://webapi.amap.com/maps?v=2.0&key=038b3400dd8b54da0a149c95eb9c7d42"></script>
    </head>
    <body>
    <div id="container"></div>
    <script>
        var map = new AMap.Map('container', { zoom: 4, center: [105.0, 35.0], mapStyle: 'amap://styles/darkblue' });
        var originLng = ${data.originLng}, originLat = ${data.originLat};
        var destLng = ${data.destLng}, destLat = ${data.destLat};
        var originMarker = new AMap.Marker({
            position: [originLng, originLat],
            content: '<div class="custom-marker" style="border-color:#FFF;font-weight:bold;">${data.originIata}</div>',
            offset: new AMap.Pixel(-20, -10)
        });
        map.add(originMarker);
        var destMarker = new AMap.Marker({
            position: [destLng, destLat],
            content: '<div class="custom-marker" style="border-color:#00E5FF;font-weight:bold;">${data.destIata}</div>',
            offset: new AMap.Pixel(-20, -10)
        });
        map.add(destMarker);
        var routeLine = new AMap.Polyline({
            path: [ [originLng, originLat], [destLng, destLat] ],
            strokeColor: '#00E5FF', strokeWeight: 3, strokeStyle: 'solid',
            strokeOpacity: 0.9, lineJoin: 'round', showDir: true
        });
        map.add(routeLine);
        map.setFitView(null, false, [80, 80, 80, 80]);
    </script>
    </body>
    </html>`;
  }

  // 专门用于多段连飞拓扑展示的地图生成器
  generateMultiLegMapHtml(): string {
    let routeJson = JSON.stringify(this.plannedRoute.map((item: ScheduleItem): RoutePoint => {
      let ori = ALL_AIRPORTS.find(a => a.iata === item.originIata) || ALL_AIRPORTS.find(a => a.iata === 'CAN');
      let des = ALL_AIRPORTS.find(a => a.iata === item.destIata) || ALL_AIRPORTS.find(a => a.iata === 'SZX');
      return {
        originIata: item.originIata, originLng: ori?.lng || 113.29, originLat: ori?.lat || 23.39,
        destIata: item.destIata, destLng: des?.lng || 113.81, destLat: des?.lat || 22.64
      };
    }));

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no, width=device-width">
        <style>
            html, body, #container { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background-color: #0f2027;}
            .custom-marker {
                background: rgba(15,32,39,0.9); border: 1px solid #00E5FF; border-radius: 8px;
                padding: 4px 8px; font-weight: bold; font-size: 12px; color: #FFF; backdrop-filter: blur(5px);
                box-shadow: 0 4px 15px rgba(0,229,255,0.4); white-space: nowrap;
            }
            .start-marker { border-color: #FFD700; color: #FFD700; box-shadow: 0 4px 15px rgba(255,215,0,0.4); }
        </style>
        <script src="https://webapi.amap.com/maps?v=2.0&key=038b3400dd8b54da0a149c95eb9c7d42"></script>
    </head>
    <body>
    <div id="container"></div>
    <script>
        var map = new AMap.Map('container', { zoom: 4, center: [105.0, 35.0], mapStyle: 'amap://styles/darkblue' });
        var routeData = ${routeJson};

        if (routeData && routeData.length > 0) {
            var path = [];

            // 绘制起点
            path.push([routeData[0].originLng, routeData[0].originLat]);
            var startMarker = new AMap.Marker({
                position: path[0],
                content: '<div class="custom-marker start-marker">起点: ' + routeData[0].originIata + '</div>',
                offset: new AMap.Pixel(-30, -15), zIndex: 110
            });
            map.add(startMarker);

            // 绘制各个途径点和终点
            routeData.forEach(function(leg, index) {
                var destPoint = [leg.destLng, leg.destLat];
                path.push(destPoint);
                var m = new AMap.Marker({
                    position: destPoint,
                    content: '<div class="custom-marker">第' + (index+1) + '站: ' + leg.destIata + '</div>',
                    offset: new AMap.Pixel(-30, -15), zIndex: 100
                });
                map.add(m);
            });

            // 将所有点用带箭头的线连起来
            var polyline = new AMap.Polyline({
                path: path, strokeColor: '#00E5FF', strokeWeight: 4,
                strokeOpacity: 0.9, lineJoin: 'round', showDir: true
            });
            map.add(polyline);
            map.setFitView(null, false, [60, 60, 60, 60]); // 自动缩放视野包围整个航线
        }
    </script>
    </body>
    </html>`;
  }

  // ================= 根路由渲染 =================
  build() {
    Stack() {
      // Full-screen safe area expansion
      Column().width('100%').height('100%').expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])

      // 沉浸式深空高级渐变背景
      Column().width('100%').height('100%')
        .linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] })
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])

      // 分布式设备在线状态指示器
      if (this.isDistSyncReady) {
        Row() {
          Circle({ width: 8, height: 8 })
            .fill(this.remoteDeviceOnline ? '#00E5FF' : '#666')
          Text(this.remoteDeviceOnline ? '多设备已连接' : '等待设备连接')
            .fontSize(11).fontColor(this.remoteDeviceOnline ? '#00E5FF' : '#888')
        }
        .position({ x: '50%', y: 0 })
        .translate({ x: '-50%' })
        .padding({ top: 2, bottom: 2, left: 12, right: 12 })
        .backgroundColor('rgba(0,0,0,0.6)')
        .borderRadius(12)
        .zIndex(100)
      }

      Column() {
        if (this.currentPage === 10) this.AuthSystemView();
        else if (this.currentPage === 0) this.HomeView();
        else if (this.currentPage === 1) this.CalendarView();
        else if (this.currentPage === 2) this.TaskSettingView();
        else if (this.currentPage === 3) this.RoutePickerView();
        else if (this.currentPage === 4) this.FlightListView();
        else if (this.currentPage === 5) this.FlyingView();
        else if (this.currentPage === 6) this.ProfileView();
        else if (this.currentPage === 7) this.ShopView();
        else if (this.currentPage === 8) this.SettlementView();
        else if (this.currentPage === 9) this.PlanePickerForFlightView();
        else if (this.currentPage === 11) this.FriendsView();
        else if (this.currentPage === 12) this.CoFlightView();
        else if (this.currentPage === 13) this.FocusSettlementView();
        else if (this.currentPage === 14) this.TrackMapView();
        else if (this.currentPage === 15) this.AiPlannerView(); // 👈 新增：AI智能规划页面
      }.width('100%').height('100%')
    }
  }

  // ==========================================
  // AI 智能航线规划系统
  // ==========================================
  // ==========================================
  // 本地算法：多段连飞智能推演系统
  // ==========================================
  // ==========================================
  // 核心功能：多段连飞智能推演系统
  // ==========================================
  @Builder AiPlannerView() {
    Column() {
      // 1. 顶部标题
      Row() {
        Button('← 返回').height(40).backgroundColor('rgba(255,255,255,0.15)').fontColor('#FFF')
          .borderRadius(12).padding({ left: 15, right: 15 })
          .onClick(() => { this.currentPage = 1; })
        Text('SkyMind™ 连飞推演').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#E040FB').margin({ left: 15 })
      }.width('100%').padding(20).margin({ top: 20 })

      List({ space: 15 }) {
        ListItem() {
          // 2. 任务输入区域
          Column({ space: 15 }) {
            Text('配置你的专注日程组合').fontColor('rgba(255,255,255,0.6)').fontSize(14).width('100%')

            ForEach(this.planTasks, (task: PlanTask, index: number) => {
              Row({ space: 10 }) {
                Text(`${index + 1}`).fontColor('#E040FB').fontWeight(FontWeight.Bold).fontSize(16).width(20).textAlign(TextAlign.Center)
                TextInput({ placeholder: '任务名称', text: task.name })
                  .layoutWeight(1).height(45).backgroundColor('rgba(255,255,255,0.1)').fontColor('#FFF')
                  .onChange(v => { task.name = v; })
                TextInput({ placeholder: '分钟', text: task.duration.toString() })
                  .type(InputType.Number).width(70).height(45).backgroundColor('rgba(255,255,255,0.1)').fontColor('#FFF')
                  .onChange(v => { task.duration = parseInt(v) || 0; })

                Button('✖').width(40).height(45).backgroundColor('rgba(255,77,79,0.2)').fontColor('#FF4D4F')
                  .onClick(() => {
                    this.planTasks = this.planTasks.filter(t => t.id !== task.id);
                  })
              }.width('100%')
            })

            Button('+ 追加新任务段')
              .width('100%').height(45).backgroundColor('rgba(224, 64, 251, 0.15)')
              .border({ width: 1, color: 'rgba(224, 64, 251, 0.4)' }).fontColor('#E040FB').borderRadius(12)
              .onClick(() => {
                this.planTasks.push({ id: Date.now(), name: '', duration: 60 });
              })

            Button(this.isCalculatingRoute ? '算力过载推演中...' : '执行航线推演算力 ⚡')
              .width('100%').height(55)
              .backgroundColor(this.isCalculatingRoute ? 'rgba(224, 64, 251, 0.3)' : '#E040FB')
              .fontColor(this.isCalculatingRoute ? '#E040FB' : '#FFF')
              .fontWeight(FontWeight.Bold).borderRadius(16).margin({ top: 10 })
              .enabled(!this.isCalculatingRoute && this.planTasks.length > 0)
              .onClick(() => this.generateLocalRouteChain())
          }.width('100%').padding(20).glassEffect()
        }

        // 3. 连飞推演结果展示区
        if (this.plannedRoute.length > 0 && !this.isCalculatingRoute) {
          ListItem() {
            Column({ space: 15 }) {
              Row() {
                Text('🗺️ 航线拓扑图已生成').fontColor('#FFF').fontWeight(FontWeight.Bold).fontSize(18)
              }.width('100%')

              // 嵌套地图展示连线
              Web({ src: '', controller: this.webController }).width('100%').height(220).borderRadius(16)
                .onControllerAttached(() => {
                  this.webController.loadData(this.generateMultiLegMapHtml(), "text/html", "UTF-8", "https://webapi.amap.com", "https://webapi.amap.com");
                })

              // 展示具体的排班序列
              Column({ space: 10 }) {
                ForEach(this.plannedRoute, (flight: ScheduleItem, idx: number) => {
                  Row() {
                    Text(`${idx + 1}`).width(24).height(24).backgroundColor('#E040FB').fontColor('#FFF')
                      .borderRadius(12).textAlign(TextAlign.Center).fontSize(12).fontWeight(FontWeight.Bold)
                    Column({ space: 4 }) {
                      Text(`${flight.originIata} ➔ ${flight.destIata}`).fontWeight(FontWeight.Bold).fontColor('#FFF')
                      Text(`${flight.taskType} | 收益 💰${flight.expectedProfit}`).fontColor('rgba(255,255,255,0.6)').fontSize(12)
                    }.alignItems(HorizontalAlign.Start).margin({ left: 10 })
                    Blank()
                    Text(flight.planeModel).fontColor('#FFD700').fontSize(12).backgroundColor('rgba(255,215,0,0.15)').padding(4).borderRadius(6)
                  }.width('100%').padding(12).backgroundColor('rgba(255,255,255,0.05)').borderRadius(12)
                })
              }.width('100%')

              Button('确认！一键写入调度表起飞')
                .width('100%').height(55).backgroundColor('#00E5FF').fontColor('#000').fontWeight(FontWeight.Bold).borderRadius(16).margin({ top: 10 })
                .onClick(() => {
                  for(let i=0; i<this.plannedRoute.length; i++) {
                    this.scheduleList.push(this.plannedRoute[i]);
                  }
                  this.plannedRoute = []; // 写入完毕后清空面板
                  this.saveAllData();
                  this.currentPage = 4; // 瞬间传送至航班调度表
                })
            }.width('100%').padding(20).glassEffect().margin({ bottom: 50 })
          }
        }
      }.layoutWeight(1).width('92%').alignListItem(ListItemAlign.Center).scrollBar(BarState.Off)
    }.width('100%').height('100%')
  }

  // 核心算法：多段连飞闭环计算
  generateLocalRouteChain() {
    this.isCalculatingRoute = true;
    this.plannedRoute = [];

    // 增加 800ms 的动画延迟感，让系统显得在深度推演
    setTimeout(() => {
      let simulatedCurrentLoc = this.currentAirport;
      let simulatedCurrentName = this.currentAirportName;
      let accumulatedTime = 0;
      let tempRoute: ScheduleItem[] = [];

      for (let i = 0; i < this.planTasks.length; i++) {
        let task = this.planTasks[i];
        if (!task.name || task.duration <= 0) continue;

        let candidates = ALL_AIRPORTS.filter(a => a.time > 0 && a.iata !== simulatedCurrentLoc && Math.abs(a.time - task.duration) <= 40);
        if (candidates.length === 0) {
          candidates = ALL_AIRPORTS.filter(a => a.iata !== simulatedCurrentLoc).sort((a, b) => Math.abs(a.time - task.duration) - Math.abs(b.time - task.duration)).slice(0, 5);
        }

        let dest = candidates[Math.floor(Math.random() * candidates.length)];
        let myPlanesData = ALL_PLANES.filter(p => this.getSafePlanes().map(sp => sp.model).includes(p.model));
        let bestPlane = myPlanesData.sort((a, b) => b.multiplier - a.multiplier)[0] || ALL_PLANES[0];
        let profit = Math.floor(dest.time * bestPlane.multiplier);

        let now = new Date();
        let startTime = new Date(now.getTime() + accumulatedTime * 60000);
        accumulatedTime += dest.time;
        let endTime = new Date(now.getTime() + accumulatedTime * 60000);

        tempRoute.push({
          id: Date.now() + i,
          taskType: task.name,
          startTime: startTime,
          endTime: endTime,
          originIata: simulatedCurrentLoc,
          originName: simulatedCurrentName,
          destIata: dest.iata,
          destName: dest.name,
          planeModel: bestPlane.model,
          expectedProfit: profit,
          isCoFlight: false,
          coFlightId: ''
        });

        // 将当前航段的目的地，作为下一段的起点
        simulatedCurrentLoc = dest.iata;
        simulatedCurrentName = dest.name;
      }

      this.plannedRoute = tempRoute;
      this.isCalculatingRoute = false; // 计算完毕，出结果
    }, 800);
  }

  // 核心 AI 规划算法
  executeAiPlanning() {
    this.aiIsCalculating = true;
    this.hasAiResult = false;
    this.hasAiResult = true;

    // 模拟 AI 计算的延迟动画感
    setTimeout(() => {
      // 1. 寻找时长最匹配的目的地
      // 允许有 ±40 分钟的误差，优先找离目标时长最接近的
      let candidates = ALL_AIRPORTS.filter(a => a.time > 0 && Math.abs(a.time - this.aiTargetMinutes) <= 40);
      if (candidates.length === 0) {
        // 如果严格条件没找到，退化为寻找全局最接近的
        candidates = ALL_AIRPORTS.slice().sort((a, b) => Math.abs(a.time - this.aiTargetMinutes) - Math.abs(b.time - this.aiTargetMinutes)).slice(0, 5);
      }

      // 在候选者中随机挑一个，增加每次运算的不可预测感
      let bestDest = candidates[Math.floor(Math.random() * candidates.length)];

      // 2. 从用户的机库中，寻找该航线下收益系数最高的飞机
      let myPlanesData = ALL_PLANES.filter(p => this.getSafePlanes().map(sp => sp.model).includes(p.model));
      let bestPlane = myPlanesData.sort((a, b) => b.multiplier - a.multiplier)[0]; // 降序取第一

      // 3. 计算收益和时间
      let profit = Math.floor(bestDest.time * bestPlane.multiplier);
      let now = new Date();
      let endTime = new Date(now.getTime() + bestDest.time * 60000);

      // 4. 生成虚拟排班对象
      this.aiRecommendFlight = {
        id: Date.now(),
        taskType: `AI 智能分配任务 (专注 ${this.aiTargetMinutes}min)`,
        startTime: now,
        endTime: endTime,
        originIata: this.currentAirport,
        originName: this.currentAirportName,
        destIata: bestDest.iata,
        destName: bestDest.name,
        planeModel: bestPlane.model,
        expectedProfit: profit,
        isCoFlight: false,
        coFlightId: ''
      };

      this.aiIsCalculating = false;
    }, 1200); // 1.2秒延迟营造“AI思考中”的感觉
  }

  // ================= 模块化：认证系统入口 =================
  @Builder InputField(placeholder: string, type: InputType, onChange: (v: string) => void) {
    TextInput({ placeholder: placeholder })
      .type(type).onChange(onChange).width('100%').height(60)
      .backgroundColor('rgba(255, 255, 255, 0.08)').fontColor('#FFF')
      .placeholderColor('rgba(255,255,255,0.4)').borderRadius(16)
      .border({ width: 1, color: 'rgba(255, 255, 255, 0.2)' })
  }

  @Builder TrackMapView() {
    Column() {
      Row() {
        Button('← 返回简报').height(45).backgroundColor('rgba(255,255,255,0.15)').fontColor('#FFF')
          .borderRadius(12).padding({ left: 15, right: 15 })
          .onClick(() => this.currentPage = 6)
        Text('个人航迹网络').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ left: 15 })
        Blank()
        Text(`总轨迹数: ${this.flightHistory.length}`).fontColor('rgba(255,255,255,0.6)').fontSize(14)
      }.width('100%').padding(20).margin({ top: 20 })

      Stack() {
        if (this.flightHistory.length === 0) {
          Column({ space: 10 }) {
            Text('🗺️ 暂无航迹数据').fontColor('#FFF').fontSize(18).fontWeight(FontWeight.Medium)
            Text('执行完成任意一次专注飞行后即可生成路线连线').fontColor('rgba(255,255,255,0.5)').fontSize(13)
          }.zIndex(10).justifyContent(FlexAlign.Center).width('100%').height('100%')
        }

        Web({ src: '', controller: this.webController }).width('100%').height('100%')
          .javaScriptAccess(true).domStorageAccess(true)
          .onControllerAttached(() => {
            this.webController.loadData(this.generateTrackMapHtml(), "text/html", "UTF-8", "https://webapi.amap.com", "https://webapi.amap.com");
          })
      }.layoutWeight(1).width('100%')
    }.width('100%').height('100%')
  }

  @Builder AuthSystemView() {
    Column({ space: 30 }) {
      Text(this.authMode === 'entry' ? '航司调度中心' : (this.authMode === 'login' ? '机长登录' : '新航司入网'))
        .fontSize(32).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ top: 80, bottom: 20 })

      if (this.authMode === 'entry') {
        Column({ space: 20 }) {
          Button('登录已有账号')
            .width('85%').height(60).backgroundColor('#FFF').fontColor('#000').fontWeight(FontWeight.Medium).borderRadius(30)
            .onClick(() => { this.authMode = 'login'; this.authErrorMsg = ''; })

          Button('注册新航司账号')
            .width('85%').height(60).backgroundColor('rgba(255,255,255,0.15)').fontColor('#FFF').borderRadius(30)
            .border({ width: 1, color: 'rgba(255,255,255,0.3)' })
            .onClick(() => { this.authMode = 'register'; this.authErrorMsg = ''; })
        }
      } else if (this.authMode === 'register') {
        Column({ space: 15 }) {
          this.InputField('机长用户名', InputType.Normal, v => this.formUser = v)
          this.InputField('设置密码', InputType.Password, v => this.formPwd = v)
          this.InputField('航空公司名称', InputType.Normal, v => this.formAirName = v)
          this.InputField('航司三字代码 (如：UAA)', InputType.Normal, v => this.formAirCode = v.toUpperCase())

          if (this.authErrorMsg) Text(this.authErrorMsg).fontColor('#FF5252').fontSize(14)

          Button('确认注册并登录')
            .width('100%').height(60).backgroundColor('#00E5FF').fontColor('#000').borderRadius(30).margin({ top: 10 })
            .onClick(() => {
              if (!this.formUser || !this.formPwd || !this.formAirName || !this.formAirCode) {
                this.authErrorMsg = '请完整填写所有信息';
              } else {
                this.sysUsername = this.formUser;
                this.sysPassword = this.formPwd;
                this.airlineName = this.formAirName;
                this.airlineCode = this.formAirCode;
                this.myUid = generateUID();
                this.ownedPlanes = ["ARJ21", "A320neo"]; // 注册赠送初始机队
                this.currentPage = 0;
              }
            })
          Text('返回选择').fontColor('rgba(255,255,255,0.5)').fontSize(14).onClick(() => this.authMode = 'entry')
        }.width('85%')

      } else if (this.authMode === 'login') {
        Column({ space: 15 }) {
          this.InputField('机长用户名', InputType.Normal, v => this.formUser = v)
          this.InputField('输入密码', InputType.Password, v => this.formPwd = v)

          if (this.authErrorMsg) Text(this.authErrorMsg).fontColor('#FF5252').fontSize(14)

          Button('验证起飞')
            .width('100%').height(60).backgroundColor('#00E5FF').fontColor('#000').borderRadius(30).margin({ top: 10 })
            .onClick(() => {
              // 作弊演示账号：白鹭 / SYSU123456，自动解锁全部功能与物品
              if (this.formUser === '白鹭' && this.formPwd === 'SYSU123456') {
                this.authErrorMsg = '';
                this.sysUsername = '白鹭';
                this.sysPassword = 'SYSU123456';
                this.airlineName = '白鹭航空';
                this.airlineCode = 'BLH';
                this.myUid = 'UDEMO00001';
                this.ownedPlanes = ALL_PLANES.map(p => p.model);
                this.unlockedAirports = ALL_AIRPORTS.filter(a => a.isPremium).map(a => a.iata);
                this.unlockedRoutes = ALL_AIRPORTS.filter(a => a.time > 0).map(a => a.iata);
                this.coinBalance = 999999;
                this.airportLevel = 99;
                this.totalFocusMinutes = 99999;
                // 预设好友：4家合作航司
                let presetFriends: Friend[] = [
                  { uid: 'UCHINA001', airlineName: '中国联合航空', airlineCode: 'CUA', addedAt: Date.now() },
                  { uid: 'USKY002', airlineName: '天际航空', airlineCode: 'SKY', addedAt: Date.now() },
                  { uid: 'UOCEAN003', airlineName: '远洋航空', airlineCode: 'OCN', addedAt: Date.now() },
                  { uid: 'UPHOENIX04', airlineName: '凤凰航空', airlineCode: 'PHX', addedAt: Date.now() }
                ];
                this.friendsList = presetFriends;
                this.saveAllData();
                this.loadBusinessData();
                this.currentPage = 0;
              } else if (this.formUser === this.sysUsername && this.formPwd === this.sysPassword && this.sysUsername !== '') {
                this.authErrorMsg = '';
                this.loadBusinessData();
                this.currentPage = 0;
              } else {
                this.authErrorMsg = '机长身份验证失败，请核对信息';
              }
            })
          Text('没有账号？去注册').fontColor('rgba(255,255,255,0.5)').fontSize(14).onClick(() => this.authMode = 'register')
          Text('返回选择').fontColor('rgba(255,255,255,0.5)').fontSize(14).onClick(() => this.authMode = 'entry').margin({ top: 10 })
        }.width('85%')
      }
    }.width('100%').height('100%')
  }


  // ================= 页面组件 =================
  @Builder StepHeader(title: string, prevPage: number) {
    Row() {
      Button('←').width(50).height(50).backgroundColor('rgba(255,255,255,0.15)').fontColor('#FFF').borderRadius(15).fontSize(20)
        .onClick(() => this.currentPage = prevPage)
      Text(title).fontSize(22).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ left: 20 })
      Blank()
    }.width('100%').padding(25).margin({ top: 20 })
  }

  @Builder HomeView() {
    Column() {
      // 核心适配：使用 GridRow 响应式栅格系统
      GridRow({ columns: { sm: 4, md: 8, lg: 12 }, gutter: 25 }) {

        // 👈 左半区 / 手机上半区：个人信息卡片
        GridCol({ span: { sm: 4, md: 8, lg: 5 } }) {
          Column({ space: 15 }) {
            Text(`${this.airlineName} (${this.airlineCode})`).fontSize(26).fontWeight(FontWeight.Bold).fontColor('#FFF').letterSpacing(1)
            Text(`欢迎登机，${this.sysUsername} 机长`).fontSize(16).fontColor('rgba(255,255,255,0.6)')
            Divider().color('rgba(255,255,255,0.1)').margin({ top: 10, bottom: 10 })
            Row() {
              this.DataStat('资金结余', `💰 ${this.coinBalance}`)
              this.DataStat('在役机队', `✈️ ${this.ownedPlanes.length}`)
              this.DataStat('通航城市', `📍 ${this.unlockedRoutes.length}`)
            }.width('100%').justifyContent(FlexAlign.SpaceBetween)
          }.glassEffect().width('100%').padding(35)
        }

        // 👉 右半区 / 手机下半区：功能菜单矩阵
        GridCol({ span: { sm: 4, md: 8, lg: 7 } }) {
          GridRow({ columns: { sm: 2, md: 2, lg: 2 }, gutter: 15 }) {
            GridCol({ span: 2 }) { this.MenuButton('规划新航程', 'rgba(0, 229, 255, 0.3)', () => this.currentPage = 1, '#FFF', '100%') }
            GridCol({ span: 2 }) { this.MenuButton('航班调度表', 'rgba(255, 255, 255, 0.15)', () => this.currentPage = 4, '#FFF', '100%') }
            GridCol({ span: 1 }) { this.MenuButton('航空商店', 'rgba(255, 152, 0, 0.3)', () => this.currentPage = 7, '#FFF', '100%') }
            GridCol({ span: 1 }) { this.MenuButton('我的简报', 'rgba(76, 175, 80, 0.3)', () => this.currentPage = 6, '#FFF', '100%') }
            GridCol({ span: 1 }) { this.MenuButton('好友系统', 'rgba(156, 39, 176, 0.3)', () => this.currentPage = 11, '#FFF', '100%') }
            GridCol({ span: 1 }) { this.MenuButton('共享航班', 'rgba(0, 229, 255, 0.3)', () => {
              this.candidateAirports = ALL_AIRPORTS.filter(a => a.time > 0);
              this.currentPage = 12;
            }, '#FFF', '100%') }
          }
        }
      }.width('92%').margin({ top: 70 })
    }.width('100%')
  }

  @Builder DataStat(label: string, val: string) {
    Column({ space: 8 }) {
      Text(val).fontColor('#FFF').fontWeight(FontWeight.Bold).fontSize(16)
      Text(label).fontColor('rgba(255,255,255,0.5)').fontSize(12)
    }.alignItems(HorizontalAlign.Start)
  }

  @Builder MenuButton(label: string, bg: string, click: () => void, textCol: string = '#FFF', w: string = '90%') {
    Button(label).width(w).height(75).borderRadius(20)
      .backgroundColor(bg).backdropBlur(20)
      .border({ width: 1, color: 'rgba(255, 255, 255, 0.3)' })
      .fontColor(textCol).fontSize(18).fontWeight(FontWeight.Medium)
      .shadow({ radius: 10, color: 'rgba(0,0,0,0.2)', offsetY: 5 })
      .onClick(click)
  }

  @Builder CalendarView() {
    Column() {
      this.StepHeader('第1步：确定航行日期', 0)
      Column() {
        Row() {
          Text(`${this.displayYear}年${this.displayMonth + 1}月`).fontSize(24).fontWeight(FontWeight.Bold).fontColor('#FFF')
          Blank()
          Row({ space: 15 }) {
            Text('◀').fontSize(20).fontColor('#00E5FF').onClick(() => {
              if (this.displayMonth === 0) { this.displayMonth = 11; this.displayYear--; } else { this.displayMonth--; }
              this.updateCalendarDays();
            })
            Text('▶').fontSize(20).fontColor('#00E5FF').onClick(() => {
              if (this.displayMonth === 11) { this.displayMonth = 0; this.displayYear++; } else { this.displayMonth++; }
              this.updateCalendarDays();
            })
          }
        }.padding(20).width('100%')

        Row() {
          ForEach(['日', '一', '二', '三', '四', '五', '六'], (w: string) => {
            Text(w).layoutWeight(1).textAlign(TextAlign.Center).fontColor('rgba(255, 255, 255, 0.7)').margin({ bottom: 10 })
          })
        }.width('100%')

        GridRow({ columns: 7, gutter: 8 }) {
          ForEach(this.daysInMonthList, (day: number | null) => {
            GridCol() {
              if (day !== null) {
                Text(day.toString()).fontColor(this.isSelectedDay(day) ? '#000' : '#FFF').fontWeight(FontWeight.Bold)
                  .width('100%').height(50).textAlign(TextAlign.Center)
                  .backgroundColor(this.isSelectedDay(day) ? '#00E5FF' : 'rgba(255,255,255,0.1)')
                  .borderRadius(12)
                  .onClick(() => this.selectedDate = new Date(this.displayYear, this.displayMonth, day))
              }
            }
          })
        }.padding(15)
      }.width('92%').glassEffect()
      Blank()
      // 👇 修复：这是全新的连飞系统入口，不再调用旧变量 👇
      Button('✨ 唤醒智能连飞推演系统 ✨')
        .width('90%').height(55).borderRadius(20)
        .backgroundColor('rgba(156, 39, 176, 0.2)')
        .border({ width: 1, color: 'rgba(156, 39, 176, 0.5)' })
        .fontColor('#E040FB').fontWeight(FontWeight.Bold).margin({ bottom: 15 })
        .onClick(() => {
          this.plannedRoute = []; // 清空上一次的推演路线
          this.currentPage = 15;  // 跳转到多段推演页面
        })

      Button('下一步：手动设定任务').width('90%').height(65).backgroundColor('#00E5FF').fontColor('#000').borderRadius(20).fontWeight(FontWeight.Bold).margin({ bottom: 50 }).onClick(() => this.currentPage = 2)
    }.height('100%')
  }

  @Builder TaskSettingView() {
    Column({ space: 25 }) {
      this.StepHeader('第2步：设定专注任务', 1)

      // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
      TextInput({ placeholder: '在此输入专注事项，如：阅读文献...', text: $$this.tempTaskType })
        .width('90%')
        .height(65)
        .glassEffect()
        .fontColor('#FFF')
        .placeholderColor('rgba(255,255,255,0.6)')

      Column({ space: 15 }) {
        Text('预估飞行时间段').width('100%').fontColor('rgba(255,255,255,0.8)').fontSize(16)
        Row() {
          TimePicker().useMilitaryTime(true).height(140).layoutWeight(1).onChange(v => this.tempStartTime.setHours(v.hour, v.minute))
          Text('至').fontColor('#FFF').margin({ left: 10, right: 10 })
          TimePicker().useMilitaryTime(true).height(140).layoutWeight(1).onChange(v => this.tempEndTime.setHours(v.hour, v.minute))
        }.width('100%')
      }.width('90%').padding(25).glassEffect()

      Blank()
      Button('下一步：匹配航线').width('90%').height(65).borderRadius(20).backgroundColor('#00E5FF').fontColor('#000').fontWeight(FontWeight.Bold)
        .onClick(() => { this.filterAirports(); this.currentPage = 3; }).margin({ bottom: 50 })
    }.height('100%')
  }

  @Builder RoutePickerView() {
    Stack({ alignContent: Alignment.Bottom }) {
      // 1. 底层地图 (保持不变)
      Web({ src: '', controller: this.webController }).width('100%').height('100%').javaScriptAccess(true).domStorageAccess(true)
        .onControllerAttached(() => {
          this.webController.loadData(this.generateMapHtml(), "text/html", "UTF-8", "https://webapi.amap.com", "https://webapi.amap.com");
          this.webController.registerJavaScriptProxy({
            postMessage: (message: string) => {
              try {
                let msg: Record<string, Object> = JSON.parse(message) as Record<string, Object>;
                if (msg['type'] === 'markerClick') {
                  let iata = msg['iata'] as string;
                  let apt = this.candidateAirports.find(a => a.iata === iata);
                  if (apt && (!apt.isPremium || this.unlockedAirports.includes(apt.iata))) {
                    this.selectedAirport = apt;
                    this.currentPage = 9;
                  }
                } else if (msg['type'] === 'mapReady') {
                  // 地图加载完成
                }
              } catch (_e) {
              }
            }
          }, 'harmony', ['postMessage']);
        })

      // 2. 底部控制面板 (重构为横向卡片容器)
      Column() {
        Row() {
          Button('← 返回').height(40).backgroundColor('rgba(255,255,255,0.2)').fontColor('#FFF').onClick(() => this.currentPage = 2)
          Text('第3步：选择目的地').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ left: 15 })
          Blank()
        }.width('100%').padding({ top: 20, left: 20, right: 20, bottom: 15 })

        // 核心修改 1：横向滚动列表
        List({ space: 15 }) {
          ForEach(this.candidateAirports, (apt: Airport) => {
            ListItem() {
              // 核心修改 2：把横排布局改成方形卡片布局
              Column() {
                Text(`${apt.name} ${apt.iata}`).fontSize(18).fontWeight(FontWeight.Bold).fontColor('#FFF')
                Text(`标准航程: ${apt.time} 分钟`).fontSize(13).fontColor('rgba(255,255,255,0.7)').margin({ top: 6 })

                Blank() // 将按钮推到卡片最底部

                if (apt.isPremium && !this.unlockedAirports.includes(apt.iata)) {
                  Text('需要解锁').fontColor('#FF5252').fontWeight(FontWeight.Bold).fontSize(14).height(38)
                } else {
                  Button('选择降落').width('100%').height(38).backgroundColor('#00E5FF').fontColor('#000')
                    .onClick(() => { this.selectedAirport = apt; this.currentPage = 9; })
                }
              }.width(200).height(130).padding(16).alignItems(HorizontalAlign.Start) // 固定卡片宽高
              .backgroundColor(this.highlightedAirportIata === apt.iata ? 'rgba(0,229,255,0.2)' : 'rgba(0,0,0,0.6)')
              .borderRadius(20).border({ width: 2, color: this.highlightedAirportIata === apt.iata ? '#00E5FF' : 'rgba(255,255,255,0.1)' })
              .onClick(() => {
                this.highlightedAirportIata = apt.iata;
                try {
                  this.webController.runJavaScript(`panToAirport(${apt.lng}, ${apt.lat}); highlightMarker('${apt.iata}');`);
                } catch (_e) {
                }
              })
            }
          })
        }
        .listDirection(Axis.Horizontal) // 设置为横向滚动
        .width('100%')
        .height(150) // 限制列表容器的高度
        .padding({ left: 20, right: 20 })
        .scrollBar(BarState.Off) // 隐藏丑陋的滚动条

      }
      .width('100%')
      // 核心修改 3：删除了死板的 .height('60%')，让面板只占据所需的最小高度
      .padding({ bottom: 35 }) // 底部留出安全区
      .backgroundColor('rgba(15, 32, 39, 0.75)') // 稍微增加一点透明度，让底下的地图透出来
      .backdropBlur(25)
      .borderRadius({ topLeft: 35, topRight: 35 })
      .border({ width: 1, color: 'rgba(255,255,255,0.2)' })

    }.width('100%').height('100%')
  }

  // ==========================================
  // 【从这里开始替换原来的 PlanePickerForFlightView】
  // ==========================================
  @Builder PlanePickerForFlightView() {
    Column({ space: 20 }) {
      this.StepHeader('最后一步：确认执飞机型', 3)
      Text(`航线: ${this.currentAirport} ➔ ${this.selectedAirport?.iata} | 时长: ${this.selectedAirport?.time} 分钟`).fontColor('#00E5FF').width('90%')

      Text('👇 点击选择下方机型，立刻生成航班计划').fontColor('rgba(255,255,255,0.7)').fontSize(14).width('90%')

      List({ space: 15 }) {
        // 【核心绝杀】不再信任本地缓存，通过 getSafePlanes 拿飞机，绝不让这里为空！
        ForEach(this.getSafePlanes(), (p: Plane) => {
          ListItem() {
            Row() {
              Image(p.logoUrl).width(60).height(50).objectFit(ImageFit.Contain).backgroundColor('rgba(255,255,255,0.9)').borderRadius(10).padding(5).margin({ right: 15 })
              Column() {
                Text(p.model).fontColor('#FFF').fontWeight(FontWeight.Bold).fontSize(20)
                Text(`倍率: x${p.multiplier.toFixed(1)}`).fontColor('#FFD700').fontSize(14).margin({ top: 5 })
              }.alignItems(HorizontalAlign.Start)
              Blank()
              Column() {
                Text('预期收益').fontColor('rgba(255,255,255,0.6)').fontSize(12)
                Text(`💰 ${Math.floor((this.selectedAirport?.time || 0) * p.multiplier)}`).fontColor('#00E5FF').fontWeight(FontWeight.Bold).fontSize(18).margin({ top: 5 })
              }.alignItems(HorizontalAlign.End)
            }
            .width('100%').padding(20).glassEffect()
            .border({ width: 2, color: 'rgba(0, 229, 255, 0.4)' })
          }
          // 点击整张卡片直接起飞
          .onClick(() => this.confirmFlight(p))
        })
      }.layoutWeight(1).width('92%')
    }.height('100%')
  }

  // ==========================================
  // 【新增防空大招】安全获取机库数据
  // ==========================================
  getSafePlanes(): Plane[] {
    let availablePlanes = ALL_PLANES.filter(p => this.ownedPlanes.includes(p.model));
    // 如果匹配出来的飞机是 0 架（证明本地缓存坏了，名字对不上），无条件送 737 和 ARJ21 兜底！
    if (availablePlanes.length === 0) {
      return ALL_PLANES.filter(p => ["ARJ21", "A320neo"].includes(p.model));
    }
    return availablePlanes;
  }

  // ==========================================
  // 【替换原来的 confirmFlight 方法】
  // ==========================================
  confirmFlight(p: Plane) {
    // 【自动修复】如果你点了兜底送的 737，立刻把它永久写入你的机库，修复你的坏缓存！
    if (!this.ownedPlanes.includes(p.model)) {
      this.ownedPlanes.push(p.model);
    }

    let profit = Math.floor((this.selectedAirport?.time || 0) * p.multiplier);
    // 共享航班模式：在确认机型后弹出好友选择对话框
    if (this.isCreatingCoFlight) {
      this.isCreatingCoFlight = false;
      this.coFlightFriendDialog = new CustomDialogController({
        builder: FriendSelectDialog({
          friends: this.friendsList,
          onConfirm: (selectedUids: string[]) => {
            let coFlightNum = generateCoFlightNumber();
            this.scheduleList.push({
              id: Date.now(),
              taskType: this.tempTaskType || '共享航班',
              startTime: new Date(this.tempStartTime),
              endTime: new Date(this.tempEndTime),
              originIata: this.currentAirport,
              originName: this.currentAirportName,
              destIata: this.selectedAirport?.iata || '',
              destName: this.selectedAirport?.name || '',
              planeModel: p.model,
              expectedProfit: profit,
              isCoFlight: true,
              coFlightId: coFlightNum
            });
            // 同时创建共享航班会话，用于好友加入和显示
            let session: CoFlightSession = {
              sessionId: generateUID(),
              flightNumber: coFlightNum,
              creatorUid: this.myUid,
              creatorName: this.airlineName || this.sysUsername,
              durationMinutes: this.selectedAirport?.time || 0,
              originIata: this.currentAirport,
              originName: this.currentAirportName,
              destIata: this.selectedAirport?.iata || '',
              destName: this.selectedAirport?.name || '',
              planeModel: p.model,
              participants: [this.myUid].concat(selectedUids),
              participantTasks: {},
              startTime: Date.now(),
              status: 'waiting'
            };
            this.coFlightSessions.push(session);
            this.saveAllData();
            this.currentPage = 4; // 跳转到航班调度表
          }
        }),
        autoCancel: true,
        alignment: DialogAlignment.Center
      });
      this.coFlightFriendDialog!.open();
    } else {
      this.scheduleList.push({
        id: Date.now(),
        taskType: this.tempTaskType || '常规巡航',
        startTime: new Date(this.tempStartTime),
        endTime: new Date(this.tempEndTime),
        originIata: this.currentAirport,
        originName: this.currentAirportName,
        destIata: this.selectedAirport?.iata || '',
        destName: this.selectedAirport?.name || '',
        planeModel: p.model,
        expectedProfit: profit,
        isCoFlight: false,
        coFlightId: ''
      });
      this.saveAllData();
      this.currentPage = 4;
    }
  }
  // ==========================================
  // 【替换到 confirmFlight 结束为止】
  // ==========================================

  @Builder FlightListView() {
    Column() {
      this.StepHeader('航班调度表', 0)

      if (this.scheduleList.length === 0) {
        Text('暂无航班计划，请先前往规划航程').fontColor('rgba(255,255,255,0.6)').margin({ top: 100 })
      } else {
        List({ space: 18 }) {
          ForEach(this.scheduleList, (item: ScheduleItem) => {
            ListItem() {
              Column() {
                Row() {
                  Text(`${item.originIata || 'CAN'} ➔ ${item.destIata}`).fontSize(22).fontWeight(FontWeight.Bold).fontColor('#00E5FF')
                  Blank()
                  Text(`机型: ${item.planeModel}`).fontColor('#FFD700').fontSize(14).backgroundColor('rgba(255,215,0,0.2)').padding(5).borderRadius(5)
                }.width('100%')

                Text(item.taskType).margin({ top: 10 }).fontColor('rgba(255,255,255,0.8)').fontSize(16)
                if (item.isCoFlight) {
                  Text('✈ 共享航班 ' + item.coFlightId).fontColor('#FFD700').fontSize(13)
                    .backgroundColor('rgba(255,215,0,0.15)').padding({ left: 8, right: 8, top: 3, bottom: 3 })
                    .borderRadius(8).margin({ top: 5 })
                }

                Row() {
                  Text(`收益预测: 💰${item.expectedProfit}`).fontColor('#AAA').fontSize(14)
                  Blank()
                  Button('取消').height(38).backgroundColor('rgba(255, 77, 79, 0.8)').margin({ right: 10 })
                    .onClick(() => this.deleteFlight(item.id))
                  Button('立刻起飞').height(38).backgroundColor('#4CAF50').onClick(() => this.startFlight(item))
                }.width('100%').margin({ top: 15 })
              }.alignItems(HorizontalAlign.Start).padding(25).width('92%').glassEffect()
            }
          })
        }.layoutWeight(1).alignListItem(ListItemAlign.Center)
        .padding({ left: 15, right: 15 }) // 增加一点边距更好看
        .lanes(this.curBp === 'lg' || this.curBp === 'xl' ? 2 : 1, 15)
      }
    }.height('100%')
  }

  deleteFlight(id: number) {
    this.scheduleList = this.scheduleList.filter(item => item.id !== id);
    this.saveAllData();
  }

  startFlight(item: ScheduleItem) {
    this.activeFlight = item;
    // 共享航班：自动关联到对应的 CoFlightSession
    if (item.isCoFlight) {
      let session = this.coFlightSessions.find(s => s.flightNumber === item.coFlightId);
      if (session) {
        this.activeCoFlight = session;
        session.status = 'flying';
      }
    }
    let destAirport = ALL_AIRPORTS.find(a => a.iata === item.destIata);
    let flightMinutes = destAirport ? destAirport.time : 0;
    this.totalFlightSeconds = flightMinutes * 60;
    this.remainingSeconds = this.totalFlightSeconds;
    this.currentPage = 5;

    this.currentAltitude = 0;
    this.currentSpeed = 0;

    if (this.timerId !== -1) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        let progress = 1 - (this.remainingSeconds / this.totalFlightSeconds);
        if (progress < 0.1) {
          this.currentAltitude += 300; this.currentSpeed += 80;
        } else if (progress > 0.9) {
          this.currentAltitude -= 300; this.currentSpeed -= 80;
        } else {
          this.currentAltitude = 30000 + Math.floor(Math.random() * 500 - 250);
          this.currentSpeed = 850 + Math.floor(Math.random() * 20 - 10);
        }
      } else {
        clearInterval(this.timerId);
        let mins = Math.floor(this.totalFlightSeconds / 60);
        let newRoute = !this.unlockedRoutes.includes(this.activeFlight.destIata);
        this.coinBalance += item.expectedProfit;
        this.totalFocusMinutes += mins;
        if (newRoute) {
          this.unlockedRoutes.push(this.activeFlight.destIata);
        }
        let destAirport = ALL_AIRPORTS.find(a => a.iata === this.activeFlight.destIata);
        // 更新当前机场位置为抵达机场，确保下次从该机场起飞
        this.currentAirport = this.activeFlight.destIata;
        this.currentAirportName = this.activeFlight.destName;
        this.currentAirportLng = destAirport?.lng || 113.29;
        this.currentAirportLat = destAirport?.lat || 23.39;
        this.focusSettlementData = {
          taskType: this.activeFlight.taskType,
          destIata: this.activeFlight.destIata,
          destName: this.activeFlight.destName,
          planeModel: this.activeFlight.planeModel,
          profit: item.expectedProfit,
          focusMinutes: mins,
          newRoute: newRoute,
          originIata: this.currentAirport,
          originName: this.currentAirportName,
          destLng: destAirport?.lng || 113.29,
          destLat: destAirport?.lat || 23.39,
          originLng: this.currentAirportLng,
          originLat: this.currentAirportLat
        };
        this.scheduleList = this.scheduleList.filter(i => i.id !== this.activeFlight.id);
        // 寻找起飞机场和降落机场的完整对象以获取精准坐标
        let oriAptObj = ALL_AIRPORTS.find(a => a.iata === this.activeFlight.originIata) || ALL_AIRPORTS.find(a => a.iata === 'CAN');
        let desAptObj = ALL_AIRPORTS.find(a => a.iata === this.activeFlight.destIata);

        this.flightHistory.push({
          id: Date.now(),
          originIata: this.activeFlight.originIata || 'CAN',
          originName: this.activeFlight.originName || '广州白云',
          destIata: this.activeFlight.destIata,
          destName: this.activeFlight.destName,
          originLng: oriAptObj?.lng || 113.29,
          originLat: oriAptObj?.lat || 23.39,
          destLng: desAptObj?.lng || 113.29,
          destLat: desAptObj?.lat || 23.39,
          timestamp: Date.now()
        });
        this.saveAllData();
        this.currentPage = 13;
      }
    }, 1000);
  }

  settleCheatFlight() {
    let skippedFlight = this.scheduleList.find(i => i.id === this.activeFlight.id) || this.scheduleList[this.scheduleList.length - 1] || this.activeFlight;
    this.activeFlight = skippedFlight;

    // 获取起飞机场信息（使用当前机场，如果当前机场无效则使用CAN）
    let originAirport = ALL_AIRPORTS.find(a => a.iata === this.currentAirport) || ALL_AIRPORTS.find(a => a.iata === 'CAN');
    let destAirport = ALL_AIRPORTS.find(a => a.iata === (skippedFlight?.destIata || 'SZX')) || ALL_AIRPORTS.find(a => a.iata === 'SZX');

    this.focusSettlementData = {
      originName: originAirport?.name || '广州白云',
      destName: skippedFlight?.destName || skippedFlight?.destIata || 'SZX',
      taskType: '作弊跳过专注',
      planeModel: skippedFlight?.planeModel || this.activeFlight?.planeModel || 'C919',
      focusMinutes: 0,
      profit: skippedFlight?.expectedProfit || 0,
      newRoute: false,
      originIata: originAirport?.iata || 'CAN',
      destIata: skippedFlight?.destIata || 'SZX',
      originLng: originAirport?.lng || 113.29,
      originLat: originAirport?.lat || 23.39,
      destLng: destAirport?.lng || 113.81,
      destLat: destAirport?.lat || 22.64
    };
    this.flightHistory.push({
      id: Date.now(),
      originIata: originAirport?.iata || 'CAN',
      originName: originAirport?.name || '广州白云',
      destIata: skippedFlight?.destIata || 'SZX',
      destName: skippedFlight?.destName || skippedFlight?.destIata || 'SZX',
      originLng: originAirport?.lng || 113.29,
      originLat: originAirport?.lat || 23.39,
      destLng: destAirport?.lng || 113.81,
      destLat: destAirport?.lat || 22.64,
      timestamp: Date.now()
    });
    this.currentPage = 13;
  }

  @Builder FlyingView() {
    Column() {
      // 1. 顶部：航线与航班状态 (固定高度，不被压缩)
      Column({ space: 8 }) {
        Text((this.activeCoFlight && this.activeCoFlight.status === 'flying') ? '共享航班' : this.activeFlight.taskType).fontSize(16).fontColor('rgba(255,255,255,0.5)').margin({ top: 60 })
        Row({ space: 15 }) {
          Text((this.activeCoFlight && this.activeCoFlight.status === 'flying') ? this.activeCoFlight.originIata : this.activeFlight.originIata).fontSize(36).fontWeight(FontWeight.Bold).fontColor('#FFF')
          Text('✈').fontSize(24).fontColor('rgba(255,255,255,0.4)')
          Text((this.activeCoFlight && this.activeCoFlight.status === 'flying') ? this.activeCoFlight.destIata : this.activeFlight.destIata).fontSize(36).fontWeight(FontWeight.Bold).fontColor('#FFF')
        }
        Text((this.activeCoFlight && this.activeCoFlight.status === 'flying') ? this.activeCoFlight.planeModel : this.activeFlight.planeModel).fontSize(14).fontColor('#FFF').backgroundColor('rgba(255,255,255,0.1)').padding({ left: 10, right: 10, top: 4, bottom: 4 }).borderRadius(10).margin({ top: 10 })

        if (this.activeCoFlight && this.activeCoFlight.status === 'flying') {
          Text('共享航班: ' + this.activeCoFlight!.flightNumber).fontSize(13).fontColor('#FFD700')
            .backgroundColor('rgba(255,215,0,0.15)').padding({ left: 10, right: 10, top: 4, bottom: 4 }).borderRadius(10).margin({ top: 6 })
          Text('伙伴任务').fontSize(11).fontColor('rgba(255,255,255,0.4)').margin({ top: 12 })
          ForEach(Object.keys(this.activeCoFlight.participantTasks), (uid: string) => {
            Text(uid + ': ' + this.activeCoFlight!.participantTasks[uid]).fontSize(12).fontColor('rgba(255,255,255,0.6)').margin({ top: 2 })
          })
        }
      }.width('100%').alignItems(HorizontalAlign.Center)

      // 2. 进度条区域 (固定高度)
      Column({ space: 10 }) {
        Row() {
          Text('Departure').fontSize(12).fontColor('rgba(255,255,255,0.5)')
          Blank()
          Text('Arrival').fontSize(12).fontColor('rgba(255,255,255,0.5)')
        }.width('85%')

        Stack({ alignContent: Alignment.Start }) {
          Divider().width('100%').color('rgba(255,255,255,0.2)').strokeWidth(4)
          Divider().width(`${((this.totalFlightSeconds - this.remainingSeconds) / this.totalFlightSeconds) * 100}%`)
            .color('#00E5FF').strokeWidth(4)
          Text('✈️').fontSize(20).margin({ left: `calc(${((this.totalFlightSeconds - this.remainingSeconds) / this.totalFlightSeconds) * 100}% - 10px)` }).offset({ y: -12 })
        }.width('85%').height(30)
      }.width('100%').alignItems(HorizontalAlign.Center).margin({ top: 30 })


      // 👇 3. 中间弹性核心区：倒计时与仪表盘 👇
      // 这个 Column 会乖乖填满中间的空隙，内容在中间垂直居中
      Column() {
        Stack() {
          Circle({ width: 260, height: 260 }).fill('transparent').stroke('rgba(255,255,255,0.05)').strokeWidth(1)
          Column({ space: 5 }) {
            Text(this.formatRemainingTime()).fontSize(55).fontWeight(FontWeight.Regular).fontColor('#FFF').fontFeature('"tnum" 1')
            Text('REMAINING TIME').fontSize(12).fontColor('rgba(255,255,255,0.3)').letterSpacing(2)
          }
        }

        Row() {
          Column() {
            Text('ALTITUDE').fontSize(10).fontColor('rgba(255,255,255,0.4)')
            Text(`${Math.max(0, this.currentAltitude)} FT`).fontSize(18).fontColor('#FFF').fontFeature('"tnum" 1')
          }.alignItems(HorizontalAlign.Center).layoutWeight(1)
          Divider().vertical(true).height(30).color('rgba(255,255,255,0.1)')
          Column() {
            Text('SPEED').fontSize(10).fontColor('rgba(255,255,255,0.4)')
            Text(`${Math.max(0, this.currentSpeed)} KTS`).fontSize(18).fontColor('#FFF').fontFeature('"tnum" 1')
          }.alignItems(HorizontalAlign.Center).layoutWeight(1)
        }.width('80%').margin({ top: 40 })
      }
      .width('100%')
      .layoutWeight(1) // 👈 绝对杀手锏：接管所有剩余空间，不再硬撑
      .justifyContent(FlexAlign.Center) // 让里面的圆圈和仪表盘在剩余空间里居中


      // 4. 底部：操作按钮 (固定在底侧，绝对不会再被挤出去)
      Column() {
        if (this.sysUsername === '白鹭') {
          Button('⚡ 跳过专注 (即刻结算)').width('80%').height(55)
            .backgroundColor('rgba(255, 215, 0, 0.2)')
            .border({ width: 1, color: 'rgba(255, 215, 0, 0.5)' }).borderRadius(30)
            .fontColor('#FFD700').fontWeight(FontWeight.Bold)
            .onClick(() => {
              clearInterval(this.timerId);
              let isSharedFlight = !!(this.activeCoFlight && this.activeCoFlight.status === 'flying');
              let destIata = isSharedFlight ? this.activeCoFlight!.destIata : this.activeFlight.destIata;
              let destName = isSharedFlight ? this.activeCoFlight!.destName : this.activeFlight.destName;
              let planeModel = isSharedFlight ? this.activeCoFlight!.planeModel : this.activeFlight.planeModel;
              let originIata = isSharedFlight ? this.activeCoFlight!.originIata : this.activeFlight.originIata;
              let originName = isSharedFlight ? this.activeCoFlight!.originName : this.activeFlight.originName;
              let profit = isSharedFlight ? Math.floor(this.totalFlightSeconds / 60 * 3) : this.activeFlight.expectedProfit;
              let mins = Math.floor(this.totalFlightSeconds / 60);
              let newRoute = !this.unlockedRoutes.includes(destIata);
              this.coinBalance += profit;
              this.totalFocusMinutes += mins;
              if (newRoute) {
                this.unlockedRoutes.push(destIata);
              }
              let destAirport = ALL_AIRPORTS.find(a => a.iata === destIata);
              let originAirport = ALL_AIRPORTS.find(a => a.iata === originIata);
              this.currentAirport = destIata;
              this.currentAirportName = destName;
              this.currentAirportLng = destAirport?.lng || 113.29;
              this.currentAirportLat = destAirport?.lat || 23.39;
              this.focusSettlementData = {
                taskType: isSharedFlight ? '共享航班' : this.activeFlight.taskType,
                destIata: destIata,
                destName: destName,
                planeModel: planeModel,
                profit: profit,
                focusMinutes: mins,
                newRoute: newRoute,
                originIata: originIata,
                originName: originName,
                destLng: destAirport?.lng || 113.29,
                destLat: destAirport?.lat || 23.39,
                originLng: originAirport?.lng || 113.29,
                originLat: originAirport?.lat || 23.39
              };
              if (!isSharedFlight) {
                this.scheduleList = this.scheduleList.filter(i => i.id !== this.activeFlight.id);
              }
              this.activeCoFlight = null;
              let oriAptObj = ALL_AIRPORTS.find(a => a.iata === originIata) || ALL_AIRPORTS.find(a => a.iata === 'CAN');
              this.flightHistory.push({
                id: Date.now(),
                originIata: originIata,
                originName: originName,
                destIata: destIata,
                destName: destName,
                originLng: oriAptObj?.lng || 113.29,
                originLat: oriAptObj?.lat || 23.39,
                destLng: destAirport?.lng || 113.29,
                destLat: destAirport?.lat || 23.39,
                timestamp: Date.now()
              });
              this.saveAllData();
              this.currentPage = 13;
            })
        } else {
          Button('紧急迫降').width('80%').height(60).backgroundColor('rgba(255, 77, 79, 0.15)')
            .border({ width: 1, color: 'rgba(255, 77, 79, 0.3)' }).borderRadius(30).fontColor('#FF4D4F')
            .onClick(() => {
              AlertDialog.show({
                title: '确认紧急迫降？',
                message: '本次飞行时长将不计入任何统计报表',
                autoCancel: true,
                alignment: DialogAlignment.Center,
                primaryButton: {
                  value: '确认迫降',
                  fontColor: '#FF4D4F',
                  action: () => {
                    clearInterval(this.timerId);
                    this.timerId = -1;
                    this.currentPage = 0;
                  }
                },
                secondaryButton: {
                  value: '取消',
                  fontColor: '#AAA',
                  action: () => {}
                }
              });
            })
        }
      }.margin({ bottom: 50 })

    }.width('100%').height('100%')
  }

  @Builder ShopView() {
    Column() {
      Row() {
        Button('←').width(45).height(45).backgroundColor('rgba(255,255,255,0.15)').fontColor('#FFF').borderRadius(12).onClick(() => this.currentPage = 0)
        Text('航空商店').fontSize(24).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ left: 15 })
        Blank()
        Text(`💰 ${this.coinBalance}`).fontColor('#FFD700').fontSize(18).fontWeight(FontWeight.Bold)
      }.width('100%').padding(25).margin({ top: 20 })

      List({ space: 20 }) {
        ListItem() { Text('🛬 繁忙枢纽解锁').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ left: 15 }) }
        ForEach(ALL_AIRPORTS.filter(a => a.isPremium), (apt: Airport) => {
          ListItem() {
            Row() {
              Text(`${apt.name} (${apt.iata})`).layoutWeight(1).fontColor('#FFF').fontSize(16)
              Button(this.unlockedAirports.includes(apt.iata) ? '已拥有' : '💰 500')
                .backgroundColor(this.unlockedAirports.includes(apt.iata) ? 'rgba(255,255,255,0.2)' : '#00E5FF')
                .fontColor(this.unlockedAirports.includes(apt.iata) ? '#CCC' : '#000')
                .enabled(!this.unlockedAirports.includes(apt.iata))
                .onClick(() => {
                  this.targetPurchaseName = `${apt.name} (${apt.iata})`;
                  this.targetPurchasePrice = 500;
                  this.targetPurchaseType = 'airport';
                  this.targetPurchaseId = apt.iata;
                  this.currentPage = 8;
                })
            }.width('92%').padding(20).glassEffect()
          }
        })

        ListItem() { Text('✈️ 机队扩建目录').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ left: 15, top: 20 }) }
        this.ShopGroup('中国商飞 COMAC', 'COMAC')
        this.ShopGroup('波音 Boeing', 'Boeing')
        this.ShopGroup('空客 Airbus', 'Airbus')
      }.layoutWeight(1).width('100%').alignListItem(ListItemAlign.Center)
      .lanes(this.curBp === 'lg' || this.curBp === 'xl' ? 2 : 1, 20)
    }.height('100%')
  }

  @Builder ShopGroup(title: string, brand: string) {
    ListItem() {
      Column() {
        Text(title).fontColor('rgba(255,255,255,0.6)').margin({ left: 10, bottom: 10, top: 10 }).width('100%')
        ForEach(ALL_PLANES.filter(p => p.brand === brand), (p: Plane) => {
          Row({ space: 15 }) {
            Image(p.logoUrl)
              .width(80).height(45).objectFit(ImageFit.Contain)
              .backgroundColor('rgba(255,255,255,0.9)').borderRadius(10).padding(5)

            Blank()

            Column() {
              Text(p.model).fontColor('#FFF').fontWeight(FontWeight.Bold).fontSize(20).textAlign(TextAlign.End)
              if (this.ownedPlanes.includes(p.model)) {
                Text('✓ 已在库').fontSize(12).fontColor('#4CAF50').margin({ top: 4 })
              } else {
                Text(`💰 ${p.price}`).fontSize(14).fontColor('#FFD700').margin({ top: 4 })
              }
            }.alignItems(HorizontalAlign.End)
          }
          .width('92%').padding(18).margin({ bottom: 12 }).glassEffect()
          .linearGradient({ direction: GradientDirection.Right, colors: [[p.gradient[0], 0.0], [p.gradient[1], 1.0]] })
          .onClick(() => {
            this.introDialog = new CustomDialogController({
              builder: PlaneIntroDialog({
                plane: p,
                isOwned: this.ownedPlanes.includes(p.model),
                onBuy: (buyPlane: Plane) => {
                  this.targetPurchaseName = buyPlane.model;
                  this.targetPurchasePrice = buyPlane.price;
                  this.targetPurchaseType = 'plane';
                  this.targetPurchaseId = buyPlane.model;
                  this.currentPage = 8;
                }
              }),
              customStyle: true,
              autoCancel: true
            });
            this.introDialog.open();
          })
        })
      }
    }
  }

  @Builder SettlementView() {
    Column() {
      this.StepHeader('订单结算中心', 7)

      Column({ space: 25 }) {
        Row() { Text('购买项目').fontColor('rgba(255,255,255,0.8)').fontSize(18); Blank(); Text(this.targetPurchaseName).fontWeight(FontWeight.Bold).fontSize(20).fontColor('#FFF') }.width('100%')
        Row() { Text('所需资金').fontColor('rgba(255,255,255,0.8)').fontSize(18); Blank(); Text(`${this.targetPurchasePrice} 币`).fontWeight(FontWeight.Bold).fontSize(20).fontColor('#FF5252') }.width('100%')
        Divider().color('rgba(255,255,255,0.3)')
        Row() { Text('当前余额').fontColor('rgba(255,255,255,0.8)').fontSize(18); Blank(); Text(`${this.coinBalance} 币`).fontWeight(FontWeight.Bold).fontSize(20).fontColor('#FFD700') }.width('100%')
      }.width('90%').padding(30).glassEffect()

      if (this.coinBalance < this.targetPurchasePrice) {
        Text('⚠️ 余额不足，请先执飞赚取资金').fontColor('#FF5252').fontSize(16).margin({ top: 30 })
      }

      Blank()

      Row({ space: 20 }) {
        Button('取消').width('40%').height(65).backgroundColor('rgba(255,255,255,0.2)').fontColor('#FFF').borderRadius(20)
          .onClick(() => this.currentPage = 7)

        Button('确认支付').width('40%').height(65)
          .backgroundColor(this.coinBalance >= this.targetPurchasePrice ? '#00E5FF' : 'rgba(255,255,255,0.1)')
          .fontColor(this.coinBalance >= this.targetPurchasePrice ? '#000' : 'rgba(255,255,255,0.4)')
          .enabled(this.coinBalance >= this.targetPurchasePrice).borderRadius(20)
          .onClick(() => {
            if (this.coinBalance >= this.targetPurchasePrice) {
              this.coinBalance -= this.targetPurchasePrice;
              if (this.targetPurchaseType === 'airport') { this.unlockedAirports.push(this.targetPurchaseId); }
              else { this.ownedPlanes.push(this.targetPurchaseId); }
              this.saveAllData();
              this.currentPage = 7;
            }
          })
      }.padding({ bottom: 50 })
    }.height('100%').width('100%')
  }

  @Builder ProfileView() {
    Column({ space: 25 }) {
      this.StepHeader('系统简报', 0)

      Column({ space: 20 }) {
        Row() { Text('UID').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`${this.myUid}`).fontWeight(FontWeight.Bold).fontColor('#00E5FF').fontSize(16) }.width('100%')
        Row() { Text('总飞行专注').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`${this.totalFocusMinutes} 分钟`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16) }.width('100%')
        Row() { Text('通航覆盖率').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`${this.unlockedRoutes.length} 条航线`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16) }.width('100%')
        Text('飞行数据可视化').width('90%').fontWeight(FontWeight.Bold).fontColor('rgba(255,255,255,0.5)').fontSize(14).margin({ top: 20 })

        Button('查看全量航迹地图 🗺️')
          .width('90%').height(55).borderRadius(16)
          .backgroundColor('rgba(0, 229, 255, 0.25)')
          .border({ width: 1, color: 'rgba(0, 229, 255, 0.4)' })
          .fontColor('#00E5FF').fontSize(16).fontWeight(FontWeight.Medium)
          .margin({ top: 10 })
          .onClick(() => {
            this.currentPage = 14; // 跳转到新增的航迹地图页面
          })
        Row() { Text('机队总规模').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`${this.ownedPlanes.length} 架飞机`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16) }.width('100%')
        Row() { Text('好友数量').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`${this.friendsList.length} 人`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16) }.width('100%')
        Row() { Text('总部基建').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`Lv.${this.airportLevel}`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16) }.width('100%')
      }.width('90%').padding(30).glassEffect()

      Text('飞行足迹').width('90%').fontWeight(FontWeight.Bold).fontColor('rgba(255,255,255,0.5)').fontSize(14).margin({ top: 10 })
      Flex({ wrap: FlexWrap.Wrap }) {
        ForEach(this.unlockedRoutes, (iata: string) => {
          Text(iata)
            .padding({ left: 15, right: 15, top: 8, bottom: 8 }).margin(6)
            .backgroundColor('rgba(0, 229, 255, 0.1)').fontColor('#00E5FF')
            .border({ width: 1, color: 'rgba(0, 229, 255, 0.5)' }).borderRadius(16).fontSize(14)
        })
      }.width('90%')

      Blank()

      Column({ space: 10 }) {
        Text('危险操作').fontColor('rgba(255, 77, 79, 0.8)').fontSize(12)
        Button('破产清算 (注销并重置所有数据)')
          .width('90%').height(60).backgroundColor('rgba(255, 77, 79, 0.15)')
          .border({ width: 1, color: 'rgba(255, 77, 79, 0.3)' }).borderRadius(30).fontColor('#FF4D4F')
          .onClick(() => {
            this.resetSystem();
          })
      }.width('100%').margin({ bottom: 40 }).alignItems(HorizontalAlign.Center)

    }.height('100%')
  }


  @Builder FocusSettlementView() {
    Column({ space: 15 }) {
      Text('🛬 航程结算').fontSize(26).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ top: 60 })
      Text('任务圆满完成').fontSize(14).fontColor('#00E5FF')

      // 地图显示航线
      Column() {
        Web({ src: '', controller: this.webController }).width('100%').height(200)
          .onControllerAttached(() => {
            if (this.focusSettlementData) {
              this.webController.loadData(this.generateSettlementMapHtml(this.focusSettlementData),
                "text/html", "UTF-8", "https://webapi.amap.com", "https://webapi.amap.com");
            }
          })
      }
      .width('90%').height(200).borderRadius(16)
      .border({ width: 1, color: 'rgba(255,255,255,0.2)' }).margin({ top: 10 })

      Column({ space: 12 }) {
        Row() {
          Text('航线').fontColor('rgba(255,255,255,0.6)').fontSize(15)
          Blank()
          Text(`${this.focusSettlementData?.originName || 'CAN'} → ${this.focusSettlementData?.destName || ''}`)
            .fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16)
        }.width('100%')

        Row() {
          Text('任务内容').fontColor('rgba(255,255,255,0.6)').fontSize(15)
          Blank()
          Text(this.focusSettlementData?.taskType || '').fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16)
        }.width('100%')

        Row() {
          Text('执飞机型').fontColor('rgba(255,255,255,0.6)').fontSize(15)
          Blank()
          Text(this.focusSettlementData?.planeModel || '').fontWeight(FontWeight.Bold).fontColor('#00E5FF').fontSize(16)
        }.width('100%')

        Row() {
          Text('飞行时长').fontColor('rgba(255,255,255,0.6)').fontSize(15)
          Blank()
          Text(`${this.focusSettlementData?.focusMinutes || 0} 分钟`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16)
        }.width('100%')

        Divider().color('rgba(255,255,255,0.15)')

        Row() {
          Text('本次收益').fontColor('rgba(255,255,255,0.6)').fontSize(16)
          Blank()
          Text(`+💰 ${this.focusSettlementData?.profit || 0}`).fontWeight(FontWeight.Bold).fontColor('#FFD700').fontSize(22)
        }.width('100%')

        if (this.focusSettlementData?.newRoute) {
          Row() {
            Text('🏆 新航线开通!').fontColor('#00E5FF').fontWeight(FontWeight.Bold).fontSize(14)
          }.width('100%').padding({ top: 4, bottom: 4, left: 10, right: 10 })
          .backgroundColor('rgba(0,229,255,0.1)').borderRadius(10)
        }
      }.width('90%').padding(25).glassEffect().margin({ top: 10 })

      Blank()

      Button('返回调度中心').width('85%').height(60).backgroundColor('#00E5FF').fontColor('#000')
        .borderRadius(20).fontWeight(FontWeight.Bold).margin({ bottom: 50 })
        .onClick(() => {
          this.focusSettlementData = null;
          this.currentPage = 0;
        })
    }.height('100%').width('100%')
  }

  @Builder FriendsView() {
    Column() {
      this.StepHeader('好友系统', 0)
      Row() {
        TextInput({ placeholder: '输入好友UID', text: this.friendUidInput })
          .layoutWeight(1).height(55).backgroundColor('rgba(255,255,255,0.08)').fontColor('#FFF')
          .placeholderColor('rgba(255,255,255,0.4)').borderRadius(14)
          .border({ width: 1, color: 'rgba(255,255,255,0.2)' })
          .onChange(v => this.friendUidInput = v)
        Button('添加').width(80).height(55).backgroundColor('#00E5FF').fontColor('#000').borderRadius(14).margin({ left: 12 })
          .onClick(() => this.addFriendByUid())
      }.width('90%').margin({ top: 15 })

      if (this.friendAddMsg) {
        Text(this.friendAddMsg).fontColor(this.friendAddMsg.includes('成功') ? '#00E5FF' : '#FF5252')
          .fontSize(14).margin({ top: 8 }).width('90%')
      }

      Text('我的UID').fontColor('rgba(255,255,255,0.5)').fontSize(13).margin({ top: 15 }).width('90%')
      Row() {
        Text(this.myUid).fontSize(20).fontWeight(FontWeight.Bold).fontColor('#00E5FF')
          .fontFeature('"tnum" 1').letterSpacing(2)
        Blank()
        Text('点击复制').fontSize(12).fontColor('rgba(255,255,255,0.5)')
      }.width('90%').padding(18).backgroundColor('rgba(0,229,255,0.08)').borderRadius(14)
      .border({ width: 1, color: 'rgba(0,229,255,0.2)' })
      .onClick(() => {
        let pasteData = pasteboard.createData(pasteboard.MIMETYPE_TEXT_PLAIN, this.myUid);
        let pasteboardSystem = pasteboard.getSystemPasteboard();
        pasteboardSystem.setData(pasteData).then(() => {
          this.friendAddMsg = 'UID已复制到剪贴板';
        }).catch((err: BusinessError) => {
          this.friendAddMsg = '复制失败，请手动记录';
        });
      })

      if (this.friendsList.length === 0) {
        Text('暂无好友，输入UID添加').fontColor('rgba(255,255,255,0.4)').margin({ top: 60 })
      } else {
        List({ space: 12 }) {
          ForEach(this.friendsList, (friend: Friend) => {
            ListItem() {
              Row() {
                Column({ space: 4 }) {
                  Text(friend.airlineName).fontSize(16).fontWeight(FontWeight.Bold).fontColor('#FFF')
                  Text(friend.uid).fontSize(12).fontColor('rgba(255,255,255,0.5)').fontFeature('"tnum" 1')
                }.alignItems(HorizontalAlign.Start)
                Blank()
                Button('删除').height(36).backgroundColor('rgba(255,77,79,0.2)').fontColor('#FF4D4F')
                  .border({ width: 1, color: 'rgba(255,77,79,0.3)' }).borderRadius(10).fontSize(13)
                  .onClick(() => this.removeFriend(friend.uid))
              }.width('100%').padding(15).backgroundColor('rgba(255,255,255,0.06)').borderRadius(14)
              .border({ width: 1, color: 'rgba(255,255,255,0.1)' })
            }
          })
        }.layoutWeight(1).width('90%').margin({ top: 20 })
      }
    }.height('100%')
  }

  @Builder CoFlightView() {
    Column() {
      this.StepHeader('共享航班 (Codeshare)', 0)

      if (this.activeCoFlight) {
        Column({ space: 12 }) {
          Text('航班 ' + this.activeCoFlight!.flightNumber).fontSize(24).fontWeight(FontWeight.Bold).fontColor('#FFD700')
          Text('目的地: ' + this.activeCoFlight!.destName + ' (' + this.activeCoFlight!.destIata + ')').fontColor('#00E5FF').fontSize(16)
          Text('时长: ' + this.activeCoFlight!.durationMinutes + ' 分钟').fontColor('rgba(255,255,255,0.7)').fontSize(14)
          Text('参与人数: ' + this.activeCoFlight!.participants.length).fontColor('#FFD700').fontSize(14)
          Divider().color('rgba(255,255,255,0.1)')

          if (this.activeCoFlight.status === 'waiting') {
            if (this.activeCoFlight.creatorUid === this.myUid) {
              Button('机长起飞').width('80%').height(55).backgroundColor('#00E5FF').fontColor('#000')
                .borderRadius(20).fontWeight(FontWeight.Bold)
                .onClick(() => this.startCoFlight(this.activeCoFlight!))
            } else {
              TextInput({ placeholder: '输入你的专注任务', text: this.coFlightTaskInput })
                .width('80%').height(50).backgroundColor('rgba(255,255,255,0.08)').fontColor('#FFF')
                .placeholderColor('rgba(255,255,255,0.4)').borderRadius(14)
                .border({ width: 1, color: 'rgba(255,255,255,0.2)' })
                .onChange(v => this.coFlightTaskInput = v)
              if (this.coFlightJoinMsg) {
                Text(this.coFlightJoinMsg).fontColor(this.coFlightJoinMsg.includes('成功') ? '#00E5FF' : '#FF5252').fontSize(13)
              }
              Button('加入共享航班').width('80%').height(55).backgroundColor('#00E5FF').fontColor('#000')
                .borderRadius(20).fontWeight(FontWeight.Bold).margin({ top: 8 })
                .onClick(() => this.joinCoFlight(this.activeCoFlight!))
            }
          } else if (this.activeCoFlight.status === 'flying') {
            Text('航班正在飞行中...').fontColor('#FFD700').fontSize(16)
          } else {
            Text('航班已完成').fontColor('#4CAF50').fontSize(16)
          }
        }.width('90%').padding(25).glassEffect().margin({ top: 20 })
      }

      Divider().color('rgba(255,255,255,0.1)').margin({ top: 20, bottom: 10 }).width('90%')

      Text(this.coFlightSessions.length > 0 ? '可用共享航班' : '暂无共享航班，创建一个吧').fontColor('rgba(255,255,255,0.5)').fontSize(13).width('90%')

      List({ space: 12 }) {
        ForEach(this.coFlightSessions, (session: CoFlightSession) => {
          ListItem() {
            Row() {
              Column({ space: 4 }) {
                Row({ space: 8 }) {
                  Text(session.flightNumber).fontWeight(FontWeight.Bold).fontColor('#FFD700').fontSize(16)
                  Text('机长: ' + session.creatorName).fontColor('rgba(255,255,255,0.6)').fontSize(12)
                }
                Text(session.destName + ' | ' + session.durationMinutes + '分钟').fontColor('#FFF').fontSize(14)
              }.alignItems(HorizontalAlign.Start)
              Blank()
              Button('加入').height(40).backgroundColor('#00E5FF').fontColor('#000')
                .borderRadius(12).fontSize(14)
                .onClick(() => {
                  this.activeCoFlight = session;
                  this.coFlightJoinMsg = '';
                  this.coFlightTaskInput = '';
                })
            }.width('100%').padding(15).glassEffect()
          }
        })
      }.layoutWeight(1).width('90%').margin({ top: 10 })

      if (this.coFlightCreateMsg) {
        Text(this.coFlightCreateMsg)
          .fontColor(this.coFlightCreateMsg.includes('请先') ? '#FF5252' : '#00E5FF')
          .fontSize(14).margin({ top: 5, bottom: 5 }).width('90%')
      }

      Button('创建共享航班').width('85%').height(60).backgroundColor('#00E5FF').fontColor('#000')
        .borderRadius(20).fontWeight(FontWeight.Bold).margin({ bottom: 30 })
        .onClick(() => this.createCoFlightSession())
    }.height('100%')
  }
  formatRemainingTime(): string {
    let h = Math.floor(this.remainingSeconds / 3600);
    let m = Math.floor((this.remainingSeconds % 3600) / 60);
    let s = this.remainingSeconds % 60;
    return `${padZero(h)}:${padZero(m)}:${padZero(s)}`;
  }

  private isSelectedDay(day: number): boolean {
    return this.selectedDate.getDate() === day && this.selectedDate.getMonth() === this.displayMonth && this.selectedDate.getFullYear() === this.displayYear;
  }

  // ================= 好友系统 =================
  addFriendByUid() {
    if (!this.friendUidInput.trim()) {
      this.friendAddMsg = '请输入好友UID';
      return;
    }
    if (this.friendUidInput.trim() === this.myUid) {
      this.friendAddMsg = '不能添加自己';
      return;
    }
    if (this.friendsList.some(f => f.uid === this.friendUidInput.trim())) {
      this.friendAddMsg = '该好友已在列表中';
      return;
    }

    // 【修复关键点】将 airlineName 设定为 "航司_" + UID前6位，而不是直接使用整个 UID
    this.friendsList.push({
      uid: this.friendUidInput.trim(),
      airlineName: '航司_' + this.friendUidInput.trim().substring(0, 6),
      airlineCode: 'N/A',
      addedAt: Date.now()
    });

    this.friendAddMsg = '好友添加成功';
    this.friendUidInput = '';
    this.saveAllData();
  }

  removeFriend(uid: string) {
    this.friendsList = this.friendsList.filter(f => f.uid !== uid);
    this.saveAllData();
  }

  // ================= 共享航班(Codeshare)系统 =================
  createCoFlightSession() {
    if (this.friendsList.length === 0) {
      this.coFlightCreateMsg = '请先在好友系统中添加好友';
      return;
    }
    this.coFlightCreateMsg = '';
    this.isCreatingCoFlight = true;
    // 复用普通航班创建流程：跳转到日期选择页
    this.currentPage = 1;
  }

  joinCoFlight(session: CoFlightSession) {
    if (!session || session.status !== 'waiting') {
      this.coFlightJoinMsg = '该航班不在等待状态';
      return;
    }
    if (this.myUid === session.creatorUid) {
      this.coFlightJoinMsg = '你是机长，无需加入';
      return;
    }
    if (session.participants.includes(this.myUid)) {
      this.coFlightJoinMsg = '你已在该航班中';
      return;
    }
    if (!this.coFlightTaskInput.trim()) {
      this.coFlightJoinMsg = '请输入你的专注任务';
      return;
    }
    session.participants.push(this.myUid);
    session.participantTasks[this.myUid] = this.coFlightTaskInput.trim();
    this.activeCoFlight = session;
    this.coFlightJoinMsg = '加入成功！等待机长起飞';
    this.coFlightTaskInput = '';
    this.saveAllData();
  }

  startCoFlight(session: CoFlightSession) {
    if (session.creatorUid !== this.myUid) {
      return;
    }
    let durationSec = session.durationMinutes * 60;
    session.startTime = Date.now();
    session.status = 'flying';
    this.activeCoFlight = session;
    this.totalFlightSeconds = durationSec;
    this.remainingSeconds = durationSec;
    this.currentAltitude = 0;
    this.currentSpeed = 0;

    if (this.timerId !== -1) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
        let progress = 1 - (this.remainingSeconds / this.totalFlightSeconds);
        if (progress < 0.1) {
          this.currentAltitude += 300;
          this.currentSpeed += 80;
        } else if (progress > 0.9) {
          this.currentAltitude -= 300;
          this.currentSpeed -= 80;
        } else {
          this.currentAltitude = 30000 + Math.floor(Math.random() * 500 - 250);
          this.currentSpeed = 850 + Math.floor(Math.random() * 20 - 10);
        }
      } else {
        clearInterval(this.timerId);

        // 共享航班结束：更新当前机场并跳转到结算页面
        let destAirportObj = ALL_AIRPORTS.find(a => a.iata === session.destIata);
        this.currentAirport = session.destIata;
        this.currentAirportName = session.destName;
        this.currentAirportLng = destAirportObj?.lng || 113.29;
        this.currentAirportLat = destAirportObj?.lat || 23.39;

        this.totalFocusMinutes += session.durationMinutes;
        this.coinBalance += Math.floor(session.durationMinutes * 3);
        if (!this.unlockedRoutes.includes(session.destIata)) {
          this.unlockedRoutes.push(session.destIata);
        }

        // 创建结算数据
        this.focusSettlementData = {
          taskType: '共享航班',
          destIata: session.destIata,
          destName: session.destName,
          planeModel: session.planeModel,
          profit: Math.floor(session.durationMinutes * 3),
          focusMinutes: session.durationMinutes,
          newRoute: !this.unlockedRoutes.includes(session.destIata),
          originIata: session.originIata,
          originName: session.originName,
          destLng: destAirportObj?.lng || 113.29,
          destLat: destAirportObj?.lat || 23.39,
          originLng: ALL_AIRPORTS.find(a => a.iata === session.originIata)?.lng || 113.29,
          originLat: ALL_AIRPORTS.find(a => a.iata === session.originIata)?.lat || 23.39
        };

        session.status = 'completed';
        this.activeCoFlight = null;
        this.saveAllData();
        this.currentPage = 13; // 跳转到结算页面
      }
    }, 1000);
    this.currentPage = 5;
  }
}