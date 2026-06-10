import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';
import { webview } from '@kit.ArkWeb';

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
  intro: string; // 机型简介
  multiplier: number; // 收益系数
}

interface ScheduleItem {
  id: number;
  taskType: string;
  startTime: Date;
  endTime: Date;
  destIata: string;
  destName: string;
  planeModel: string; // 执飞机型
  expectedProfit: number; // 预期收益
}

// 飞机数据库：全系列机型与品牌分类 (已扩充完整波音、空客机队)
const ALL_PLANES: Plane[] = [
  // ================= COMAC (中国商飞) =================
  { model: 'ARJ21', brand: 'COMAC', price: 300, logoUrl: $r('app.media.comac_logo'), gradient: ['#f12711', '#f5af19'], multiplier: 1.0, intro: '中国首款自行研制的喷气式支线客机，适应高原与极端天气。' },
  { model: 'C919', brand: 'COMAC', price: 1200, logoUrl: $r('app.media.comac_logo'), gradient: ['#f12711', '#f5af19'], multiplier: 1.5, intro: '中国首款按照国际通行适航标准自行研制、具有自主知识产权的喷气式干线客机。' },
  { model: 'C929', brand: 'COMAC', price: 2500, logoUrl: $r('app.media.comac_logo'), gradient: ['#f12711', '#f5af19'], multiplier: 2.2, intro: '正在研制中的远程宽体客机，旨在打破远程宽体航线的垄断。' },

  // ================= Boeing (波音) =================
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

  // ================= Airbus (空客) =================
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

const ALL_AIRPORTS: Airport[] = [
  { name: '北京首都', iata: 'PEK', time: 180, isPremium: true, lng: 116.58, lat: 40.08 },
  { name: '上海浦东', iata: 'PVG', time: 135, isPremium: true, lng: 121.80, lat: 31.14 },
  { name: '北京大兴', iata: 'PKX', time: 185, isPremium: true, lng: 116.41, lat: 39.51 },
  { name: '深圳宝安', iata: 'SZX', time: 40, isPremium: true, lng: 113.81, lat: 22.64 },
  { name: '成都天府', iata: 'TFU', time: 145, isPremium: true, lng: 104.44, lat: 30.27 },
  { name: '西安咸阳', iata: 'XIY', time: 155, isPremium: true, lng: 108.75, lat: 34.45 },
  { name: '广州白云', iata: 'CAN', time: 0, isPremium: true, lng: 113.29, lat: 23.39 },
  { name: '杭州萧山', iata: 'HGH', time: 120, isPremium: true, lng: 120.43, lat: 30.23 },
  { name: '重庆江北', iata: 'CKG', time: 140, isPremium: true, lng: 106.64, lat: 29.72 },
  { name: '南京禄口', iata: 'NKG', time: 135, isPremium: true, lng: 118.86, lat: 31.74 },
  { name: '武汉天河', iata: 'WUH', time: 105, isPremium: true, lng: 114.21, lat: 30.78 }
  // (受限于显示长度，可自行补充剩余机场数据，格式同上)
];

// ==========================================
// 辅助函数与全局样式
// ==========================================
function padZero(num: number): string {
  return num < 10 ? '0' + num : num.toString();
}

@Styles function glassEffect() {
  .backgroundColor('rgba(255, 255, 255, 0.12)')
  .backdropBlur(25)
  .border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' })
  .borderRadius(20)
  .shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 })
}

// ==========================================
// 弹窗1：创建航空公司
// ==========================================
@CustomDialog
struct InitDialog {
  controller: CustomDialogController;
  @State name: string = '';
  @State selectedPlane: string = 'ARJ21';
  onConfirm: (name: string, plane: string) => void = () => {};

  build() {
    Column({ space: 20 }) {
      Text('组建你的航空公司').fontSize(24).fontWeight(FontWeight.Bold).fontColor('#FFF')

      TextInput({ placeholder: '输入公司名称，例如：寰宇航空' })
        .onChange(v => this.name = v).width('100%').height(55)
        .backgroundColor('rgba(255, 255, 255, 0.2)')
        .fontColor('#FFF').placeholderColor('rgba(255,255,255,0.5)')

      Text('免费分配初始机队').width('100%').fontColor('rgba(255, 255, 255, 0.8)')
      Row({ space: 20 }) {
        Column({ space: 10 }) {
          Text('🇨🇳').fontSize(35)
          Text('ARJ21').fontWeight(this.selectedPlane === 'ARJ21' ? FontWeight.Bold : FontWeight.Normal).fontColor('#FFF')
        }.onClick(() => this.selectedPlane = 'ARJ21')
        .border({ width: this.selectedPlane === 'ARJ21' ? 2 : 0, color: '#00E5FF' }).padding(15).borderRadius(15)
        .backgroundColor(this.selectedPlane === 'ARJ21' ? 'rgba(0,229,255,0.2)' : 'transparent')

        Column({ space: 10 }) {
          Text('🇪🇺').fontSize(35)
          Text('A320ceo').fontWeight(this.selectedPlane === 'A320ceo' ? FontWeight.Bold : FontWeight.Normal).fontColor('#FFF')
        }.onClick(() => this.selectedPlane = 'A320ceo')
        .border({ width: this.selectedPlane === 'A320ceo' ? 2 : 0, color: '#00E5FF' }).padding(15).borderRadius(15)
        .backgroundColor(this.selectedPlane === 'A320ceo' ? 'rgba(0,229,255,0.2)' : 'transparent')
      }

      Button('开始航向星辰')
        .width('100%').height(55).backgroundColor('#00E5FF').fontColor('#000').fontWeight(FontWeight.Bold)
        .enabled(this.name.length > 0)
        .onClick(() => {
          this.onConfirm(this.name, this.selectedPlane);
          this.controller.close();
        }).margin({ top: 10 })
    }.padding(30).glassEffect()
  }
}

// ==========================================
// 弹窗2：机型百科与购机确认
// ==========================================
@CustomDialog
struct PlaneIntroDialog {
  controller: CustomDialogController;
  plane: Plane = ALL_PLANES[0];
  isOwned: boolean = false;
  onBuy: (plane: Plane) => void = () => {};

  build() {
    Column({ space: 15 }) {
      // 完整展示 Logo
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

      // 交互按钮重构：可选择购买或取消
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
  // 页面状态：0-首页, 1-日历, 2-任务设置, 3-路线选择, 4-航班列表, 5-飞行中, 6-我的简报, 7-商店, 8-结算界面, 9-执飞机型选择
  @State currentPage: number = 0;

  @State airlineName: string = '未命名航空';
  @State coinBalance: number = 0;
  @State airportLevel: number = 1;
  @State totalFocusMinutes: number = 0;
  @State unlockedAirports: string[] = [];
  @State unlockedRoutes: string[] = [];
  @State ownedPlanes: string[] = [];

  @State scheduleList: Array<ScheduleItem> = [];
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

  @State activeFlight: ScheduleItem = { id:0, taskType:'', startTime:new Date(), endTime:new Date(), destIata:'', destName:'', planeModel:'', expectedProfit:0 };
  @State remainingSeconds: number = 0;
  private timerId: number = -1;

  private webController: webview.WebviewController = new webview.WebviewController();
  private context = getContext(this) as common.UIAbilityContext;
  private pref = preferences.getPreferencesSync(this.context, { name: 'aviation_pro_prefs' });

  private initDialogController: CustomDialogController = new CustomDialogController({
    builder: InitDialog({
      onConfirm: (name: string, plane: string) => {
        this.airlineName = name;
        this.ownedPlanes = [plane];
        this.saveAllData();
      }
    }),
    autoCancel: false, alignment: DialogAlignment.Center, customStyle: true
  });

  // 用于动态加载详情页的数据
  private introDialog: CustomDialogController | null = null;

  aboutToAppear() {
    this.loadAllData();
    this.updateCalendarDays();
    if (this.airlineName === '未命名航空') {
      setTimeout(() => { this.initDialogController.open(); }, 100);
    }
  }

  loadAllData() {
    this.airlineName = this.pref.getSync('airline_name', '未命名航空') as string;
    this.coinBalance = this.pref.getSync('coin_balance', 0) as number;
    this.airportLevel = this.pref.getSync('airport_level', 1) as number;
    this.totalFocusMinutes = this.pref.getSync('total_focus', 0) as number;
    this.unlockedAirports = JSON.parse(this.pref.getSync('unlocked_airports', '[]') as string);
    this.unlockedRoutes = JSON.parse(this.pref.getSync('unlocked_routes', '[]') as string);
    this.ownedPlanes = JSON.parse(this.pref.getSync('owned_planes', '[]') as string);

    let listJson = this.pref.getSync('flight_list', '[]') as string;
    let rawList: Record<string, Object>[] = JSON.parse(listJson);
    this.scheduleList = rawList.map((i: Record<string, Object>) => ({
      id: i.id as number,
      taskType: i.taskType as string,
      startTime: new Date(i.startTime as string),
      endTime: new Date(i.endTime as string),
      destIata: i.destIata as string,
      destName: i.destName as string,
      planeModel: (i.planeModel as string) || 'A320ceo',
      expectedProfit: (i.expectedProfit as number) || 0
    } as ScheduleItem));
  }

  saveAllData() {
    this.pref.putSync('airline_name', this.airlineName);
    this.pref.putSync('coin_balance', this.coinBalance);
    this.pref.putSync('airport_level', this.airportLevel);
    this.pref.putSync('total_focus', this.totalFocusMinutes);
    this.pref.putSync('unlocked_airports', JSON.stringify(this.unlockedAirports));
    this.pref.putSync('unlocked_routes', JSON.stringify(this.unlockedRoutes));
    this.pref.putSync('owned_planes', JSON.stringify(this.ownedPlanes));
    this.pref.putSync('flight_list', JSON.stringify(this.scheduleList));
    this.pref.flushSync();
  }

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

  // 地图 HTML
  generateMapHtml(): string {
    let markers = this.candidateAirports.map(apt => {
      let isLocked = apt.isPremium && !this.unlockedAirports.includes(apt.iata);
      let color = isLocked ? '#999999' : '#00E5FF';
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
                background: rgba(0,0,0,0.8); border: 2px solid; border-radius: 8px;
                padding: 4px 8px; font-weight: bold; font-size: 12px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.6); backdrop-filter: blur(5px); color: #FFF;
            }
        </style>
        <script type="text/javascript">
          window._AMapSecurityConfig = { securityJsCode: "16ca0d00fddb10c5bc61eb6de4ab2f3a" }
        </script>
        <script src="https://webapi.amap.com/maps?v=2.0&key=038b3400dd8b54da0a149c95eb9c7d42"></script>
    </head>
    <body>
    <div id="container"></div>
    <script>
        var map = new AMap.Map('container', {
            zoom: 4,
            center: [110.0, 32.0],
            mapStyle: 'amap://styles/darkblue'
        });

        var canMarker = new AMap.Marker({
            position: [113.2988, 23.3924],
            content: '<div class="custom-marker" style="border-color:#4CAF50;">CAN (广州)</div>',
            offset: new AMap.Pixel(-35, -15),
            zIndex: 999
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
                path: [ [113.2988, 23.3924], item.position ],
                strokeColor: item.color,
                strokeWeight: 3,
                strokeStyle: 'dashed',
                lineJoin: 'round'
            });
            map.add(polyline);
        });
        map.setFitView();
    </script>
    </body>
    </html>`;
  }

  build() {
    Stack() {
      Column()
        .width('100%').height('100%')
        .linearGradient({ direction: GradientDirection.BottomRight, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] })

      Column() {
        if (this.currentPage === 0) this.HomeView();
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
        Text(this.airlineName).fontSize(30).fontWeight(FontWeight.Bold).fontColor('#FFF').letterSpacing(2)
        Row({ space: 20 }) {
          Text(`💰 ${this.coinBalance}`).fontColor('#FFD700').fontWeight(FontWeight.Bold).fontSize(16)
          Text(`✈️ 机队: ${this.ownedPlanes.length}`).fontColor('#E0F7FA').fontSize(16)
          Text(`📊 航线: ${this.unlockedRoutes.length}`).fontColor('#E0F7FA').fontSize(16)
        }
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

  @Builder PlanePickerForFlightView() {
    Column({ space: 20 }) {
      this.StepHeader('最后一步：确认执飞机型', 3)
      Text(`航线: CAN ➔ ${this.selectedAirport?.iata} | 时长: ${this.selectedAirport?.time} 分钟`).fontColor('#00E5FF').width('90%')

      List({ space: 15 }) {
        ForEach(ALL_PLANES.filter(p => this.ownedPlanes.includes(p.model)), (p: Plane) => {
          ListItem() {
            Row() {
              Image(p.logoUrl).width(50).height(50).objectFit(ImageFit.Contain).backgroundColor('rgba(255,255,255,0.9)').borderRadius(10).padding(5).margin({ right: 15 })
              Column() {
                Text(p.model).fontColor('#FFF').fontWeight(FontWeight.Bold).fontSize(18)
                Text(`倍率: x${p.multiplier.toFixed(1)}`).fontColor('#FFD700').fontSize(14)
              }.alignItems(HorizontalAlign.Start)
              Blank()
              Column() {
                Text('预期收益').fontColor('rgba(255,255,255,0.6)').fontSize(12)
                Text(`💰 ${Math.floor((this.selectedAirport?.time || 0) * p.multiplier)}`).fontColor('#00E5FF').fontWeight(FontWeight.Bold).fontSize(16)
              }.alignItems(HorizontalAlign.End).margin({ right: 15 })

              Button('派飞').backgroundColor('#4CAF50').onClick(() => this.confirmFlight(p))
            }.width('100%').padding(20).glassEffect()
          }
        })
      }.layoutWeight(1).width('92%')
    }.height('100%')
  }

  confirmFlight(p: Plane) {
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

  // 优化点：增加删除计划功能
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
                  // 新增：删除计划按钮
                  Button('删除计划').height(38).backgroundColor('rgba(255, 77, 79, 0.8)').margin({ right: 10 })
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
    this.remainingSeconds = Math.floor(durationMs / 1000);
    this.currentPage = 5;

    if (this.timerId !== -1) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        clearInterval(this.timerId);
        this.coinBalance += item.expectedProfit;
        let mins = Math.floor(durationMs / 60000);
        this.totalFocusMinutes += mins;
        if (!this.unlockedRoutes.includes(this.activeFlight.destIata)) {
          this.unlockedRoutes.push(this.activeFlight.destIata);
        }
        this.scheduleList = this.scheduleList.filter(i => i.id !== this.activeFlight.id);
        this.saveAllData();
        this.currentPage = 0;
      }
    }, 1000);
  }

  @Builder FlyingView() {
    Column({ space: 40 }) {
      Text(`执飞 CAN ➔ ${this.activeFlight.destIata}`).fontSize(28).fontWeight(FontWeight.Bold).margin({ top: 100 }).fontColor('#00E5FF')
      Text(`[任务] ${this.activeFlight.taskType}`).fontSize(20).fontColor('#FFF')
      Text(`[机型] ${this.activeFlight.planeModel}`).fontSize(16).fontColor('#FFD700')

      Stack() {
        Circle({ width: 280, height: 280 }).fill('transparent').stroke('rgba(255,255,255,0.1)').strokeWidth(15)
        Circle({ width: 280, height: 280 }).fill('transparent').stroke('#00E5FF').strokeWidth(15).strokeDashArray([10, 20])
        Column() {
          Text(this.formatRemainingTime()).fontSize(55).fontWeight(FontWeight.Lighter).fontColor('#FFF')
          Text('距降落还有').fontSize(16).fontColor('rgba(255,255,255,0.6)').margin({ top: 10 })
        }
      }

      Button('紧急返航 (无收益)').width('70%').height(65).backgroundColor('rgba(255, 77, 79, 0.8)').borderRadius(30).fontColor('#FFF').margin({ top: 40 })
        .onClick(() => { clearInterval(this.timerId); this.currentPage = 4; })
    }.width('100%').height('100%')
  }

  // 优化点：商店 UI 重构，完整呈现 Logo 并右对齐机型，点击进入详情弹窗
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
          // 点击进入机型百科详情页
          Row({ space: 15 }) {
            // 左侧完整 Logo 显示
            Image(p.logoUrl)
              .width(80).height(45).objectFit(ImageFit.Contain)
              .backgroundColor('rgba(255,255,255,0.9)').borderRadius(10).padding(5)

            Blank()

            // 右侧机型文字对齐
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
            // 打开专门的交互弹窗进行查看与购买决策
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
      this.StepHeader('航空公司简报', 0)

      Column({ space: 20 }) {
        Row() { Text('总专注时长').fontColor('rgba(255,255,255,0.8)'); Blank(); Text(`${this.totalFocusMinutes} 分钟`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(18) }.width('100%')
        Row() { Text('已开通航线').fontColor('rgba(255,255,255,0.8)'); Blank(); Text(`${this.unlockedRoutes.length} 条`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(18) }.width('100%')
        Row() { Text('机队规模').fontColor('rgba(255,255,255,0.8)'); Blank(); Text(`${this.ownedPlanes.length} 架`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(18) }.width('100%')
        Row() { Text('枢纽等级').fontColor('rgba(255,255,255,0.8)'); Blank(); Text(`白云枢纽 Lv.${this.airportLevel}`).fontWeight(FontWeight.Bold).fontColor('#FFF').fontSize(18) }.width('100%')
      }.width('90%').padding(30).glassEffect()

      Text('已解锁航线图谱').width('90%').fontWeight(FontWeight.Bold).fontColor('#FFF').margin({ top: 10 })
      Flex({ wrap: FlexWrap.Wrap }) {
        ForEach(this.unlockedRoutes, (iata: string) => {
          Text(`CAN ➔ ${iata}`)
            .padding(10).margin(6).backgroundColor('rgba(0, 229, 255, 0.2)').fontColor('#00E5FF')
            .border({ width: 1, color: '#00E5FF' }).borderRadius(10).fontSize(14)
        })
      }.width('90%')
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