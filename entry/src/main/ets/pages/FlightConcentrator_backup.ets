import { preferences, distributedDataObject } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';
import { webview } from '@kit.ArkWeb';
import { util } from '@kit.ArkTS';
import { BusinessError } from '@kit.BasicServicesKit';

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
  destIata: string;
  destName: string;
  planeModel: string;
  expectedProfit: number;
}

interface FriendInfo {
  uid: string;
  airlineName: string;
  airlineCode: string;
  username: string;
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

// ==========================================
// 内存级LRU缓存层 —— 提升缓存命中率，减少preferences磁盘IO
// ==========================================
class MemCache {
  private lru: util.LRUCache<string, Object>;
  private static instance: MemCache;

  private constructor() {
    this.lru = new util.LRUCache(64);
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
    this.lru.updateCapacity(64);
  }

  contains(key: string): boolean {
    return this.lru.contains(key);
  }
}

// 分布式同步状态数据结构
class DistributedFlightState {
  coinBalance: number = 0;
  airportLevel: number = 1;
  totalFocusMinutes: number = 0;
  ownedPlanes: string[] = [];
  unlockedAirports: string[] = [];
  unlockedRoutes: string[] = [];
  scheduleListJson: string = '[]';
  activeFlightId: number = 0;
  activeFlightProgress: number = 0;  // 0-100 飞行进度百分比
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
  controller: CustomDialogController;
  plane: Plane = ALL_PLANES[0];
  isOwned: boolean = false;
  onBuy: (plane: Plane) => void = () => {};

  build() {
    Column({ space: 15 }) {
      Image(this.plane.logoUrl).width('80%').height(70).objectFit(ImageFit.Contain)
        .backgroundColor('rgba(255,255,255,0.9)').borderRadius(15).padding(10)

      Text(this.plane.model).fontSize(28).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ top: 10 })
      Text(this.plane.brand).fontSize(16).fontColor('#00E5FF')
      Divider().color('rgba(255,255,255,0.2)')

      Text(this.plane.intro).fontSize(16).fontColor('#EEE').lineHeight(24).width('100%')

      Row() {
        Text('收益系数: ').fontColor('#AAA').fontSize(16)
        Text(`x${this.plane.multiplier.toFixed(1)}`).fontColor('#FFD700').fontWeight(FontWeight.Bold).fontSize(20)
      }.width('100%').margin({ top: 10, bottom: 15 })

      Row({ space: 15 }) {
        Button('取消').layoutWeight(1).height(50).backgroundColor('rgba(255,255,255,0.2)').fontColor('#FFF')
          .onClick(() => this.controller.close())

        Button(this.isOwned ? '已在库' : `购买 💰${this.plane.price}`)
          .layoutWeight(1).height(50)
          .backgroundColor(this.isOwned ? 'rgba(255,255,255,0.1)' : '#00E5FF')
          .fontColor(this.isOwned ? '#999' : '#000')
          .enabled(!this.isOwned)
          .onClick(() => {
            this.onBuy(this.plane);
            this.controller.close();
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
  @State currentPage: number = 10;
  // 响应式断点：'sm'=手机/折叠态, 'md'=折叠展开/平板竖屏, 'lg'=平板横屏/三折叠G态, 'xl'=笔记本
  @StorageProp('currentBreakpoint') curBp: string = 'sm';

  // 认证状态控制：10-系统入口 (统一管理登录/注册)，0~9是业务页面
  @State authMode: 'login' | 'register' | 'entry' = 'entry';

  // 认证信息
  @State sysUsername: string = '';
  @State sysPassword: string = '';
  @State airlineName: string = '';
  @State airlineCode: string = '';

  // 登录/注册表单
  @State formUser: string = '';
  @State formPwd: string = '';
  @State formAirName: string = '';
  @State formAirCode: string = '';
  @State authErrorMsg: string = '';

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
  @State targetPurchaseName: string = '';
  @State targetPurchasePrice: number = 0;
  @State targetPurchaseType: 'airport' | 'plane' = 'airport';
  @State targetPurchaseId: string = '';

  // 到达机场连续性：记录上次专注抵达的机场，下次从该机场起飞
  @State currentAirport: string = 'CAN';
  @State currentAirportName: string = '广州白云';
  @State currentAirportLng: number = 113.29;
  @State currentAirportLat: number = 23.39;

  // 好友系统
  @State myUid: string = '';
  @State friendsList: Array<FriendInfo> = [];
  @State shareCodeEnabled: boolean = false;
  @State selectedFriendUid: string = '';
  @State friendAddInput: string = '';
  @State friendAddMsg: string = '';

  // 执飞状态
  @State activeFlight: ScheduleItem = { id:0, taskType:'', startTime:new Date(), endTime:new Date(), destIata:'', destName:'', planeModel:'', expectedProfit:0 };
  @State remainingSeconds: number = 0;
  @State totalFlightSeconds: number = 1;
  @State currentAltitude: number = 0;
  @State currentSpeed: number = 0;
  // 共享代码好友专注：记录正在共享的好友UID和任务类型
  @State sharingFriendUid: string = '';
  @State sharingFriendTask: string = '';
  private timerId: number = -1;

  private webController: webview.WebviewController = new webview.WebviewController();
  private context = getContext(this) as common.UIAbilityContext;
  private pref = preferences.getPreferencesSync(this.context, { name: 'aviation_pro_prefs' });
  private introDialog: CustomDialogController | null = null;

  // 内存缓存层 —— 读取数据时优先命中缓存，避免重复preferences磁盘IO
  private memCache: MemCache = MemCache.getInstance();

  // 分布式数据对象 —— 跨设备多段协同与进度同步
  private distObject: distributedDataObject.DataObject | null = null;
  private distSessionId: string = 'aviation_sync_session';
  private isDistSyncReady: boolean = false;

  // 分布式设备在线状态
  @State remoteDeviceOnline: boolean = false;

  aboutToAppear() {
    this.updateCalendarDays();
    this.checkAuthStatus();
    // 初始化内存缓存与分布式同步
    this.initMemCache();
    this.initDistributedSync();
  }

  // 从preferences预加载热点数据到内存缓存，提升后续读取命中率
  initMemCache() {
    let keys = ['coin_balance', 'airport_level', 'total_focus',
      'unlocked_airports', 'unlocked_routes', 'owned_planes', 'flight_list',
      'sys_username', 'sys_password', 'airline_name', 'airline_code',
      'current_airport', 'current_airport_name', 'current_airport_lng', 'current_airport_lat',
      'my_uid', 'friends_list'];
    for (let key of keys) {
      try {
        let val = this.pref.getSync(key, '');
        if (val !== '' && val !== undefined) {
          this.memCache.put(key, val as Object);
        }
      } catch (e) {
        // 键不存在则跳过
      }
    }
  }

  // 初始化分布式数据对象，实现跨设备多段协同
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
        // 将本地数据推送到分布式组网
        this.syncLocalToDistributed();
        // 监听远端设备数据变更
        this.distObject!.on('change', (sessionId: string, fields: Array<string>) => {
          this.onDistributedDataChanged(fields);
        });
        // 监听设备上下线
        this.distObject!.on('status', (sessionId: string, networkId: string, status: 'online' | 'offline') => {
          this.remoteDeviceOnline = (status === 'online');
        });
      }).catch((err: BusinessError) => {
        // 分布式同步初始化失败，降级为单机模式
        this.isDistSyncReady = false;
      });
    } catch (e) {
      this.isDistSyncReady = false;
    }
  }

  // 将本地数据推送至分布式组网
  syncLocalToDistributed() {
    if (!this.distObject || !this.isDistSyncReady) return;
    try {
      this.distObject['coinBalance'] = this.coinBalance;
      this.distObject['airportLevel'] = this.airportLevel;
      this.distObject['totalFocusMinutes'] = this.totalFocusMinutes;
      this.distObject['ownedPlanes'] = this.ownedPlanes;
      this.distObject['unlockedAirports'] = this.unlockedAirports;
      this.distObject['unlockedRoutes'] = this.unlockedRoutes;
      this.distObject['scheduleListJson'] = JSON.stringify(this.scheduleList);
      this.distObject['activeFlightId'] = this.activeFlight.id;
      this.distObject['activeFlightProgress'] = this.totalFlightSeconds > 0 ?
        Math.floor(((this.totalFlightSeconds - this.remainingSeconds) / this.totalFlightSeconds) * 100) : 0;
      this.distObject['lastUpdateDevice'] = 'local';
      this.distObject['lastUpdateTime'] = Date.now();
    } catch (e) {
      // 同步失败不影响本地功能
    }
  }

  // 接收远端设备数据变更，实现进度同步
  onDistributedDataChanged(fields: Array<string>) {
    if (!this.distObject || !this.isDistSyncReady) return;
    try {
      if (fields.includes('coinBalance')) this.coinBalance = this.distObject['coinBalance'] as number;
      if (fields.includes('totalFocusMinutes')) this.totalFocusMinutes = this.distObject['totalFocusMinutes'] as number;
      if (fields.includes('ownedPlanes')) {
        let remotePlanes = this.distObject['ownedPlanes'] as string[];
        if (remotePlanes && remotePlanes.length > 0) {
          this.ownedPlanes = Array.from(new Set([...this.ownedPlanes, ...remotePlanes]));
        }
      }
      if (fields.includes('unlockedAirports')) {
        let remoteAirports = this.distObject['unlockedAirports'] as string[];
        if (remoteAirports && remoteAirports.length > 0) {
          this.unlockedAirports = Array.from(new Set([...this.unlockedAirports, ...remoteAirports]));
        }
      }
      if (fields.includes('unlockedRoutes')) {
        let remoteRoutes = this.distObject['unlockedRoutes'] as string[];
        if (remoteRoutes && remoteRoutes.length > 0) {
          this.unlockedRoutes = Array.from(new Set([...this.unlockedRoutes, ...remoteRoutes]));
        }
      }
      if (fields.includes('scheduleListJson')) {
        let rawList: Record<string, Object>[] = JSON.parse(this.distObject['scheduleListJson'] as string);
        let distList = rawList.map((i: Record<string, Object>) => ({
          id: i.id as number, taskType: i.taskType as string,
          destIata: i.destIata as string, destName: i.destName as string,
          planeModel: i.planeModel as string, expectedProfit: i.expectedProfit as number,
          startTime: new Date(i.startTime as string), endTime: new Date(i.endTime as string)
        } as ScheduleItem));
        // 合并远端航班列表（去重）
        let existingIds = new Set(this.scheduleList.map(s => s.id));
        for (let item of distList) {
          if (!existingIds.has(item.id)) {
            this.scheduleList.push(item);
            existingIds.add(item.id);
          }
        }
      }
      if (fields.includes('activeFlightProgress')) {
        let remoteProgress = this.distObject['activeFlightProgress'] as number;
        // 远端有在飞的航班时，可以展示进度（不自动接管本地的飞行任务）
        if (remoteProgress > 0 && this.activeFlight.id === 0) {
          // 仅做UI提示，不改变本地状态
        }
      }
      // 同步后保存到本地
      this.saveAllData();
    } catch (e) {
      // 数据同步异常，保持本地数据不变
    }
  }

  // 初始化与鉴权
  checkAuthStatus() {
    this.sysUsername = this.pref.getSync('sys_username', '') as string;
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
    // 优先命中内存缓存，缓存未命中才从preferences磁盘读取
    let cachedCoin = this.memCache.get('coin_balance');
    this.coinBalance = cachedCoin !== undefined ? (cachedCoin as number) : (this.pref.getSync('coin_balance', 0) as number);
    if (cachedCoin === undefined) this.memCache.put('coin_balance', this.coinBalance);

    let cachedLevel = this.memCache.get('airport_level');
    this.airportLevel = cachedLevel !== undefined ? (cachedLevel as number) : (this.pref.getSync('airport_level', 1) as number);
    if (cachedLevel === undefined) this.memCache.put('airport_level', this.airportLevel);

    let cachedFocus = this.memCache.get('total_focus');
    this.totalFocusMinutes = cachedFocus !== undefined ? (cachedFocus as number) : (this.pref.getSync('total_focus', 0) as number);
    if (cachedFocus === undefined) this.memCache.put('total_focus', this.totalFocusMinutes);

    let freeAirports = ALL_AIRPORTS.filter(a => !a.isPremium).map(a => a.iata);
    let cachedAirportsRaw = this.memCache.get('unlocked_airports');
    let savedAirports: string[];
    if (cachedAirportsRaw !== undefined) {
      savedAirports = JSON.parse(cachedAirportsRaw as string);
    } else {
      savedAirports = JSON.parse(this.pref.getSync('unlocked_airports', '[]') as string);
      this.memCache.put('unlocked_airports', JSON.stringify(savedAirports));
    }
    this.unlockedAirports = Array.from(new Set(savedAirports.concat(freeAirports)));

    let cachedRoutesRaw = this.memCache.get('unlocked_routes');
    if (cachedRoutesRaw !== undefined) {
      this.unlockedRoutes = JSON.parse(cachedRoutesRaw as string) as string[];
    } else {
      this.unlockedRoutes = JSON.parse(this.pref.getSync('unlocked_routes', '[]') as string) as string[];
      this.memCache.put('unlocked_routes', JSON.stringify(this.unlockedRoutes));
    }

    let cachedPlanesRaw = this.memCache.get('owned_planes');
    if (cachedPlanesRaw !== undefined) {
      this.ownedPlanes = JSON.parse(cachedPlanesRaw as string) as string[];
    } else {
      this.ownedPlanes = JSON.parse(this.pref.getSync('owned_planes', '[]') as string) as string[];
      this.memCache.put('owned_planes', JSON.stringify(this.ownedPlanes));
    }

    if (!this.ownedPlanes || this.ownedPlanes.length === 0) {
      this.ownedPlanes = ["737-800", "ARJ21"];
      this.memCache.put('owned_planes', JSON.stringify(this.ownedPlanes));
      this.pref.putSync('owned_planes', JSON.stringify(this.ownedPlanes));
      this.pref.flushSync();
    }

    let cachedListRaw = this.memCache.get('flight_list');
    let listJson: string;
    if (cachedListRaw !== undefined) {
      listJson = cachedListRaw as string;
    } else {
      listJson = this.pref.getSync('flight_list', '[]') as string;
      this.memCache.put('flight_list', listJson);
    }
    let rawList: Record<string, Object>[] = JSON.parse(listJson);
    this.scheduleList = rawList.map((i: Record<string, Object>) => ({
      id: i.id as number,
      taskType: i.taskType as string,
      destIata: i.destIata as string,
      destName: i.destName as string,
      planeModel: i.planeModel as string,
      expectedProfit: i.expectedProfit as number,
      startTime: new Date(i.startTime as string),
      endTime: new Date(i.endTime as string)
    } as ScheduleItem));

    // 加载到达机场（连续性）
    let cachedCurAp = this.memCache.get('current_airport');
    this.currentAirport = cachedCurAp !== undefined ? (cachedCurAp as string) : (this.pref.getSync('current_airport', 'CAN') as string);
    if (cachedCurAp === undefined) this.memCache.put('current_airport', this.currentAirport);
    let cachedCurApName = this.memCache.get('current_airport_name');
    this.currentAirportName = cachedCurApName !== undefined ? (cachedCurApName as string) : (this.pref.getSync('current_airport_name', '广州白云') as string);
    if (cachedCurApName === undefined) this.memCache.put('current_airport_name', this.currentAirportName);
    let cachedCurApLng = this.memCache.get('current_airport_lng');
    this.currentAirportLng = cachedCurApLng !== undefined ? (cachedCurApLng as number) : (this.pref.getSync('current_airport_lng', 113.29) as number);
    if (cachedCurApLng === undefined) this.memCache.put('current_airport_lng', this.currentAirportLng);
    let cachedCurApLat = this.memCache.get('current_airport_lat');
    this.currentAirportLat = cachedCurApLat !== undefined ? (cachedCurApLat as number) : (this.pref.getSync('current_airport_lat', 23.39) as number);
    if (cachedCurApLat === undefined) this.memCache.put('current_airport_lat', this.currentAirportLat);

    // 加载UID
    let cachedUid = this.memCache.get('my_uid');
    this.myUid = cachedUid !== undefined ? (cachedUid as string) : (this.pref.getSync('my_uid', '') as string);
    if (cachedUid === undefined && this.myUid) this.memCache.put('my_uid', this.myUid);

    // 加载好友列表
    let cachedFriends = this.memCache.get('friends_list');
    if (cachedFriends !== undefined) {
      this.friendsList = JSON.parse(cachedFriends as string) as FriendInfo[];
    } else {
      let friendsJson = this.pref.getSync('friends_list', '[]') as string;
      this.friendsList = JSON.parse(friendsJson) as FriendInfo[];
      this.memCache.put('friends_list', friendsJson);
    }
  }

  saveAllData() {
    // 同时写入内存缓存和preferences持久化文件
    this.memCache.put('sys_username', this.sysUsername);
    this.memCache.put('sys_password', this.sysPassword);
    this.memCache.put('airline_name', this.airlineName);
    this.memCache.put('airline_code', this.airlineCode);
    this.memCache.put('coin_balance', this.coinBalance);
    this.memCache.put('airport_level', this.airportLevel);
    this.memCache.put('total_focus', this.totalFocusMinutes);
    let premiumUnlocked = this.unlockedAirports.filter(iata => ALL_AIRPORTS.find(a => a.iata === iata)?.isPremium);
    this.memCache.put('unlocked_airports', JSON.stringify(premiumUnlocked));
    this.memCache.put('unlocked_routes', JSON.stringify(this.unlockedRoutes));
    this.memCache.put('owned_planes', JSON.stringify(this.ownedPlanes));
    let listJson = JSON.stringify(this.scheduleList);
    this.memCache.put('flight_list', listJson);

    this.pref.putSync('sys_username', this.sysUsername);
    this.pref.putSync('sys_password', this.sysPassword);
    this.pref.putSync('airline_name', this.airlineName);
    this.pref.putSync('airline_code', this.airlineCode);
    this.pref.putSync('coin_balance', this.coinBalance);
    this.pref.putSync('airport_level', this.airportLevel);
    this.pref.putSync('total_focus', this.totalFocusMinutes);
    this.pref.putSync('unlocked_airports', JSON.stringify(premiumUnlocked));
    this.pref.putSync('unlocked_routes', JSON.stringify(this.unlockedRoutes));
    this.pref.putSync('owned_planes', JSON.stringify(this.ownedPlanes));
    this.pref.putSync('flight_list', listJson);
    // 保存到达机场、UID、好友
    this.memCache.put('current_airport', this.currentAirport);
    this.memCache.put('current_airport_name', this.currentAirportName);
    this.memCache.put('current_airport_lng', this.currentAirportLng);
    this.memCache.put('current_airport_lat', this.currentAirportLat);
    this.memCache.put('my_uid', this.myUid);
    this.memCache.put('friends_list', JSON.stringify(this.friendsList));
    this.pref.putSync('current_airport', this.currentAirport);
    this.pref.putSync('current_airport_name', this.currentAirportName);
    this.pref.putSync('current_airport_lng', this.currentAirportLng);
    this.pref.putSync('current_airport_lat', this.currentAirportLat);
    this.pref.putSync('my_uid', this.myUid);
    this.pref.putSync('friends_list', JSON.stringify(this.friendsList));
    this.pref.flushSync();

    // 同步到分布式组网，其他设备可实时接收
    this.syncLocalToDistributed();
  }

  resetSystem() {
    this.pref.clearSync();
    this.pref.flushSync();
    this.memCache.clear();
    this.sysUsername = ''; this.sysPassword = '';
    this.formUser = ''; this.formPwd = ''; this.formAirName = ''; this.formAirCode = '';
    this.currentAirport = 'CAN'; this.currentAirportName = '广州白云';
    this.currentAirportLng = 113.29; this.currentAirportLat = 23.39;
    this.myUid = ''; this.friendsList = [];
    this.currentPage = 10;
    this.authMode = 'entry';
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
  generateMapHtml(): string {
    let markers = this.candidateAirports.map(apt => {
      let isLocked = apt.isPremium && !this.unlockedAirports.includes(apt.iata);
      let color = isLocked ? '#999999' : (apt.isPremium ? '#FFD700' : '#00E5FF');
      return `{ position: [${apt.lng}, ${apt.lat}], title: '${apt.iata}', color: '${color}' }`;
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
            }
        </style>
        <script src="https://webapi.amap.com/maps?v=2.0&key=038b3400dd8b54da0a149c95eb9c7d42"></script>
    </head>
    <body>
    <div id="container"></div>
    <script>
        var map = new AMap.Map('container', { zoom: 4, center: [105.0, 35.0], mapStyle: 'amap://styles/darkblue' });
        var canMarker = new AMap.Marker({
            position: [${this.currentAirportLng}, ${this.currentAirportLat}],
            content: '<div class="custom-marker" style="border-color:#FFF; color:#FFF; font-weight:bold;">${this.currentAirport} (当前驻地)</div>',
            offset: new AMap.Pixel(-35, -15), zIndex: 999
        });
        map.add(canMarker);
        var candidates = [${markers}];
        candidates.forEach(function(item) {
            var marker = new AMap.Marker({
                position: item.position,
                content: '<div class="custom-marker" style="border-color:' + item.color + ';">' + item.title + '</div>',
                offset: new AMap.Pixel(-20, -10)
            });
            map.add(marker);
            var polyline = new AMap.Polyline({
                path: [ [${this.currentAirportLng}, ${this.currentAirportLat}], item.position ], strokeColor: item.color,
                strokeWeight: 2, strokeStyle: 'dashed', lineJoin: 'round'
            });
            map.add(polyline);
        });
        map.setFitView();
    </script>
    </body>
    </html>`;
  }

  // ================= 根路由渲染 =================
  build() {
    Stack() {
      // 沉浸式深空高级渐变背景
      Column().width('100%').height('100%')
        .linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] })

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
      }.width('100%').height('100%')
    }
  }

  // ================= 模块化：认证系统入口 =================
  @Builder InputField(placeholder: string, type: InputType, onChange: (v: string) => void) {
    TextInput({ placeholder: placeholder })
      .type(type).onChange(onChange).width('100%').height(60)
      .backgroundColor('rgba(255, 255, 255, 0.08)').fontColor('#FFF')
      .placeholderColor('rgba(255,255,255,0.4)').borderRadius(16)
      .border({ width: 1, color: 'rgba(255, 255, 255, 0.2)' })
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
                // 生成6位随机UID
                this.myUid = this.generateUid();
                this.ownedPlanes = ["ARJ21", "A320neo"];
                this.loadBusinessData();
                this.saveAllData();
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
              if (this.formUser === this.sysUsername && this.formPwd === this.sysPassword && this.sysUsername !== '') {
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
    Column({ space: 25 }) {
      Column({ space: 15 }) {
        Text(`${this.airlineName} (${this.airlineCode})`).fontSize(26).fontWeight(FontWeight.Bold).fontColor('#FFF').letterSpacing(1)
        Text(`欢迎登机，${this.sysUsername} 机长`).fontSize(16).fontColor('rgba(255,255,255,0.6)')
        Divider().color('rgba(255,255,255,0.1)').margin({ top: 10, bottom: 10 })
        // 分布式协同状态指示
        if (this.isDistSyncReady) {
          Row() {
            Circle({ width: 8, height: 8 }).fill(this.remoteDeviceOnline ? '#00E5FF' : '#FFD700')
            Text(this.remoteDeviceOnline ? ' 多设备协同在线' : ' 等待设备接入...')
              .fontSize(12).fontColor(this.remoteDeviceOnline ? '#00E5FF' : '#FFD700')
          }.margin({ bottom: 5 })
        }
        Row() {
          this.DataStat('资金结余', `💰 ${this.coinBalance}`)
          this.DataStat('在役机队', `✈️ ${this.ownedPlanes.length}`)
          this.DataStat('通航城市', `📍 ${this.unlockedRoutes.length}`)
        }.width('100%').justifyContent(FlexAlign.SpaceBetween)
      }.width('92%').padding(35).margin({ top: 70 }).glassEffect()

      Column({ space: 20 }) {
        this.MenuButton('规划新航程', 'rgba(0, 229, 255, 0.3)', () => this.currentPage = 1, '#FFF')
        this.MenuButton('航班调度表', 'rgba(255, 255, 255, 0.15)', () => this.currentPage = 4, '#FFF')
        Row({ space: 20 }) {
          this.MenuButton('航空商店', 'rgba(255, 152, 0, 0.3)', () => this.currentPage = 7, '#FFF', '45%')
          this.MenuButton('我的简报', 'rgba(76, 175, 80, 0.3)', () => this.currentPage = 6, '#FFF', '45%')
        }.width('90%')
      }.margin({ top: 30 })
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
      Button('下一步：设定任务').width('90%').height(65).backgroundColor('#00E5FF').fontColor('#000').borderRadius(20).fontWeight(FontWeight.Bold).margin({ bottom: 50 }).onClick(() => this.currentPage = 2)
    }.height('100%')
  }

  @Builder TaskSettingView() {
    Column({ space: 25 }) {
      this.StepHeader('第2步：设定专注任务', 1)
      TextInput({ placeholder: '在此输入专注事项，如：阅读文献...', text: this.tempTaskType })
        .width('90%').height(65).glassEffect().onChange(v => this.tempTaskType = v).fontColor('#FFF').placeholderColor('rgba(255,255,255,0.6)')

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
      Web({ src: '', controller: this.webController }).width('100%').height('100%').javaScriptAccess(true).domStorageAccess(true)
        .onControllerAttached(() => { this.webController.loadData(this.generateMapHtml(), "text/html", "UTF-8", "https://webapi.amap.com", "https://webapi.amap.com"); })

      Column() {
        Row() {
          Button('← 返回').height(40).backgroundColor('rgba(255,255,255,0.2)').fontColor('#FFF').onClick(() => this.currentPage = 2)
          Text('第3步：选择目的地').fontSize(20).fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ left: 15 })
          Blank()
        }.width('100%').padding(20)

        List({ space: 12 }) {
          ForEach(this.candidateAirports, (apt: Airport) => {
            ListItem() {
              Row() {
                Column({ space: 5 }) {
                  Text(`${apt.name} ${apt.iata}`).fontSize(18).fontWeight(FontWeight.Bold).fontColor('#FFF')
                  Text(`标准航程: ${apt.time} 分钟`).fontSize(14).fontColor('rgba(255,255,255,0.7)')
                }.alignItems(HorizontalAlign.Start)
                Blank()
                if (apt.isPremium && !this.unlockedAirports.includes(apt.iata)) {
                  Text('需要解锁').fontColor('#FF5252').fontWeight(FontWeight.Bold).fontSize(14)
                } else {
                  Button('选择降落').height(38).backgroundColor('#00E5FF').fontColor('#000').onClick(() => { this.selectedAirport = apt; this.currentPage = 9; })
                }
              }.width('100%').padding(18).backgroundColor('rgba(0,0,0,0.5)').borderRadius(15).border({ width: 1, color: 'rgba(255,255,255,0.2)' })
            }
          })
        }.layoutWeight(1).width('92%').margin({ bottom: 20 })
      }.width('100%').height('60%').backgroundColor('rgba(15, 32, 39, 0.85)').backdropBlur(30).borderRadius({ topLeft: 35, topRight: 35 }).border({ width: 1, color: 'rgba(255,255,255,0.2)' })
    }.width('100%').height('100%')
  }

  // ==========================================
  // 【从这里开始替换原来的 PlanePickerForFlightView】
  // ==========================================
  @Builder PlanePickerForFlightView() {
    Column({ space: 20 }) {
      this.StepHeader('最后一步：确认执飞机型', 3)
      Text(`航线: CAN ➔ ${this.selectedAirport?.iata} | 时长: ${this.selectedAirport?.time} 分钟`).fontColor('#00E5FF').width('90%')

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
      return ALL_PLANES.filter(p => ["737-800", "ARJ21"].includes(p.model));
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
    this.scheduleList.push({
      id: Date.now(),
      taskType: this.tempTaskType || '常规巡航',
      startTime: new Date(this.tempStartTime),
      endTime: new Date(this.tempEndTime),
      destIata: this.selectedAirport?.iata || '',
      destName: this.selectedAirport?.name || '',
      planeModel: p.model,
      expectedProfit: profit
    });
    this.saveAllData();
    this.currentPage = 4;
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
                  Text(`CAN ➔ ${item.destIata}`).fontSize(22).fontWeight(FontWeight.Bold).fontColor('#00E5FF')
                  Blank()
                  Text(`机型: ${item.planeModel}`).fontColor('#FFD700').fontSize(14).backgroundColor('rgba(255,215,0,0.2)').padding(5).borderRadius(5)
                }.width('100%')

                Text(item.taskType).margin({ top: 10 }).fontColor('rgba(255,255,255,0.8)').fontSize(16)

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
      }
    }.height('100%')
  }

  deleteFlight(id: number) {
    this.scheduleList = this.scheduleList.filter(item => item.id !== id);
    this.saveAllData();
  }

  startFlight(item: ScheduleItem) {
    this.activeFlight = item;
    let durationMs = item.endTime.getTime() - item.startTime.getTime();
    if (durationMs <= 0) durationMs += 24 * 3600 * 1000;
    this.totalFlightSeconds = Math.floor(durationMs / 1000);
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
        // 每5秒广播一次飞行进度到分布式组网，实现跨设备进度同步
        if (Math.floor(this.remainingSeconds) % 5 === 0 && this.isDistSyncReady && this.distObject) {
          try {
            this.distObject['activeFlightProgress'] = Math.floor(progress * 100);
            this.distObject['lastUpdateDevice'] = 'local';
            this.distObject['lastUpdateTime'] = Date.now();
          } catch (e) {
            // 分布式广播失败不影响本地飞行
          }
        }
      } else {
        clearInterval(this.timerId);
        this.coinBalance += item.expectedProfit;
        let mins = Math.floor(this.totalFlightSeconds / 60);
        this.totalFocusMinutes += mins;
        if (!this.unlockedRoutes.includes(this.activeFlight.destIata)) {
          this.unlockedRoutes.push(this.activeFlight.destIata);
        }
        // 记录到达机场，下次专注从此起飞
        let arrivedAp = ALL_AIRPORTS.find(a => a.iata === this.activeFlight.destIata);
        if (arrivedAp) {
          this.currentAirport = arrivedAp.iata;
          this.currentAirportName = arrivedAp.name;
          this.currentAirportLng = arrivedAp.lng;
          this.currentAirportLat = arrivedAp.lat;
        }
        this.scheduleList = this.scheduleList.filter(i => i.id !== this.activeFlight.id);
        // 飞行结束，清除分布式进度
        if (this.isDistSyncReady && this.distObject) {
          try {
            this.distObject['activeFlightProgress'] = 0;
          } catch (e) {}
        }
        this.saveAllData();
        this.currentPage = 0;
      }
    }, 1000);
  }

  @Builder FlyingView() {
    Column() {
      Column({ space: 8 }) {
        Text(this.activeFlight.taskType).fontSize(16).fontColor('rgba(255,255,255,0.5)').margin({ top: 60 })
        Row({ space: 15 }) {
          Text(this.currentAirport).fontSize(36).fontWeight(FontWeight.Bold).fontColor('#FFF')
          Text('✈').fontSize(24).fontColor('rgba(255,255,255,0.4)')
          Text(this.activeFlight.destIata).fontSize(36).fontWeight(FontWeight.Bold).fontColor('#FFF')
        }
        Text(this.activeFlight.planeModel).fontSize(14).fontColor('#FFF').backgroundColor('rgba(255,255,255,0.1)').padding({ left: 10, right: 10, top: 4, bottom: 4 }).borderRadius(10).margin({ top: 10 })
      }.width('100%').alignItems(HorizontalAlign.Center)

      Blank()

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
      }.width('100%').alignItems(HorizontalAlign.Center)

      Blank()

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

      Blank()

      Button('紧急迫降 (中止且无收益)').width('80%').height(60).backgroundColor('rgba(255, 77, 79, 0.15)')
        .border({ width: 1, color: 'rgba(255, 77, 79, 0.3)' }).borderRadius(30).fontColor('#FF4D4F').margin({ bottom: 50 })
        .onClick(() => { clearInterval(this.timerId); this.currentPage = 4; })
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
        Row() { Text('总飞行专注').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`${this.totalFocusMinutes} 分钟`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16) }.width('100%')
        Row() { Text('通航覆盖率').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`${this.unlockedRoutes.length} 条航线`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16) }.width('100%')
        Row() { Text('机队总规模').fontColor('rgba(255,255,255,0.6)'); Blank(); Text(`${this.ownedPlanes.length} 架飞机`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(16) }.width('100%')
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

  formatRemainingTime(): string {
    let h = Math.floor(this.remainingSeconds / 3600);
    let m = Math.floor((this.remainingSeconds % 3600) / 60);
    let s = this.remainingSeconds % 60;
    return `${padZero(h)}:${padZero(m)}:${padZero(s)}`;
  }

  private isSelectedDay(day: number): boolean {
    return this.selectedDate.getDate() === day && this.selectedDate.getMonth() === this.displayMonth && this.selectedDate.getFullYear() === this.displayYear;
  }
}
