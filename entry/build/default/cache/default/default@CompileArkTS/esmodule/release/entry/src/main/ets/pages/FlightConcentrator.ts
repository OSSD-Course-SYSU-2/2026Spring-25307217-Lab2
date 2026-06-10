if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface FlightConcentrator_Params {
    currentPage?: number;
    authMode?: 'login' | 'register' | 'entry';
    sysUsername?: string;
    sysPassword?: string;
    airlineName?: string;
    airlineCode?: string;
    formUser?: string;
    formPwd?: string;
    formAirName?: string;
    formAirCode?: string;
    authErrorMsg?: string;
    coinBalance?: number;
    airportLevel?: number;
    totalFocusMinutes?: number;
    unlockedAirports?: string[];
    unlockedRoutes?: string[];
    ownedPlanes?: string[];
    scheduleList?: Array<ScheduleItem>;
    displayYear?: number;
    displayMonth?: number;
    daysInMonthList?: (number | null)[];
    selectedDate?: Date;
    tempTaskType?: string;
    tempStartTime?: Date;
    tempEndTime?: Date;
    candidateAirports?: Airport[];
    selectedAirport?: Airport | null;
    targetPurchaseName?: string;
    targetPurchasePrice?: number;
    targetPurchaseType?: 'airport' | 'plane';
    targetPurchaseId?: string;
    activeFlight?: ScheduleItem;
    remainingSeconds?: number;
    totalFlightSeconds?: number;
    currentAltitude?: number;
    currentSpeed?: number;
    timerId?: number;
    webController?: webview.WebviewController;
    context?;
    pref?;
    introDialog?: CustomDialogController | null;
}
interface PlaneIntroDialog_Params {
    controller?: CustomDialogController;
    plane?: Plane;
    isOwned?: boolean;
    onBuy?: (plane: Plane) => void;
}
import preferences from "@ohos:data.preferences";
import type common from "@ohos:app.ability.common";
import webview from "@ohos:web.webview";
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
    gradient: [
        string,
        string
    ];
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
// ================= 满血机队数据库 (保留渐变UI) =================
const ALL_PLANES: Plane[] = [
    { model: 'ARJ21', brand: 'COMAC', price: 300, logoUrl: { "id": 16777230, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#f12711', '#f5af19'], multiplier: 1.0, intro: '中国首款自行研制的喷气式支线客机，适应高原与极端天气。' },
    { model: 'C919', brand: 'COMAC', price: 1200, logoUrl: { "id": 16777230, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#f12711', '#f5af19'], multiplier: 1.5, intro: '中国首款按照国际通行适航标准自行研制、具有自主知识产权的干线客机。' },
    { model: 'C929', brand: 'COMAC', price: 2500, logoUrl: { "id": 16777230, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#f12711', '#f5af19'], multiplier: 2.2, intro: '正在研制中的远程宽体客机，旨在打破远程宽体航线的垄断。' },
    { model: '737-700', brand: 'Boeing', price: 700, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.2, intro: '新一代波音737系列的基础型号，广受欢迎的单通道客机。' },
    { model: '737-800', brand: 'Boeing', price: 800, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.3, intro: '波音737NG系列中最成功的型号，全球单通道客机的中流砥柱。' },
    { model: '737-900ER', brand: 'Boeing', price: 900, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.4, intro: '波音737NG系列中航程最长、载客量最大的延程型号。' },
    { model: '737 MAX 7', brand: 'Boeing', price: 1000, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.4, intro: '波音737 MAX系列中最短的型号，拥有出色的高原高温性能。' },
    { model: '737 MAX 8', brand: 'Boeing', price: 1100, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.5, intro: '波音737 MAX系列的核心型号，燃油效率较上一代显著提升。' },
    { model: '737 MAX 9', brand: 'Boeing', price: 1200, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#36D1DC', '#5B86E5'], multiplier: 1.6, intro: '加长版的737 MAX，为航空公司提供更大的运力。' },
    { model: '757-200', brand: 'Boeing', price: 1500, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#283c86', '#45a247'], multiplier: 1.7, intro: '动力强劲的窄体干线客机，被誉为“空中法拉利”。' },
    { model: '757-300', brand: 'Boeing', price: 1700, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#283c86', '#45a247'], multiplier: 1.8, intro: '波音757的加长版，单通道客机中机身最长的型号之一。' },
    { model: '767-300ER', brand: 'Boeing', price: 2200, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#1c92d2', '#f2fcfe'], multiplier: 1.9, intro: '经典的双发宽体客机延程型，开创了跨大西洋双发飞行的先河。' },
    { model: '767-400ER', brand: 'Boeing', price: 2500, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#1c92d2', '#f2fcfe'], multiplier: 2.0, intro: '波音767系列的最终加长型号，融合了777的驾驶舱技术。' },
    { model: '787-8', brand: 'Boeing', price: 2600, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#141E30', '#243B55'], multiplier: 2.0, intro: '“梦想客机”系列的基础型号，大量采用复合材料制造。' },
    { model: '787-9', brand: 'Boeing', price: 2800, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#141E30', '#243B55'], multiplier: 2.1, intro: '最畅销的“梦想客机”型号，在航程与载客量间取得完美平衡。' },
    { model: '787-10', brand: 'Boeing', price: 3200, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#141E30', '#243B55'], multiplier: 2.2, intro: '“梦想客机”家族中最长的成员，具有极高的运营经济性。' },
    { model: '777-200ER', brand: 'Boeing', price: 3500, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#000046', '#1CB5E0'], multiplier: 2.3, intro: '波音777家族早期的主力延程型号，远程宽体客机的标杆。' },
    { model: '777-300ER', brand: 'Boeing', price: 4200, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#000046', '#1CB5E0'], multiplier: 2.5, intro: '全球最成功的远程宽体客机之一，以其强大的双发性能著称。' },
    { model: '777F', brand: 'Boeing', price: 4500, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#000046', '#1CB5E0'], multiplier: 2.6, intro: '基于777-200LR开发的全球最卓越的大型双发货机。' },
    { model: '777X', brand: 'Boeing', price: 5000, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#000046', '#1CB5E0'], multiplier: 2.8, intro: '波音最新一代旗舰宽体客机，拥有可折叠翼尖和惊人的复合材料机翼。' },
    { model: '747-400', brand: 'Boeing', price: 4000, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#141E30', '#243B55'], multiplier: 2.8, intro: '最经典的“空中女王”型号，统治远程民航市场数十载。' },
    { model: '747-8', brand: 'Boeing', price: 5500, logoUrl: { "id": 16777229, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#141E30', '#243B55'], multiplier: 3.0, intro: '“空中女王”的最终型号，航空史上的不可磨灭的巨无霸偶像。' },
    { model: 'A319', brand: 'Airbus', price: 700, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#8A2387', '#E94057'], multiplier: 1.2, intro: 'A320家族的缩短版，被誉为“高原雄鹰”。' },
    { model: 'A320ceo', brand: 'Airbus', price: 800, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#8A2387', '#E94057'], multiplier: 1.3, intro: '全球最畅销的单通道飞机之一，奠定了空客在窄体机市场的地位。' },
    { model: 'A320neo', brand: 'Airbus', price: 900, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#8A2387', '#E94057'], multiplier: 1.4, intro: '配备新型发动机和鲨鳍小翼的A320，燃油效率大幅提升。' },
    { model: 'A321ceo', brand: 'Airbus', price: 1000, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#8A2387', '#E94057'], multiplier: 1.4, intro: 'A320家族中最长的型号，提供接近宽体机的载客量。' },
    { model: 'A321neo', brand: 'Airbus', price: 1100, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#8A2387', '#E94057'], multiplier: 1.5, intro: '当今单通道客机市场的绝对明星，航程与运载力极其优秀。' },
    { model: 'A321XLR', brand: 'Airbus', price: 1400, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#8A2387', '#E94057'], multiplier: 1.7, intro: '超长航程窄体机，足以打破宽体客机对跨大西洋航线的垄断。' },
    { model: 'A330-200', brand: 'Airbus', price: 2300, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 1.9, intro: '经典的双发宽体客机，灵活胜任中远程各种航线。' },
    { model: 'A330-300', brand: 'Airbus', price: 2500, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 2.0, intro: '高密度中短程航线之王，区域宽体机的最佳选择。' },
    { model: 'A330-200F', brand: 'Airbus', price: 2600, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 2.1, intro: '基于A330系列改装的现代中型全货机。' },
    { model: 'A330-800', brand: 'Airbus', price: 2800, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 2.1, intro: 'A330neo家族的超长航程型号，采用了全新复合材料机翼。' },
    { model: 'A330-900', brand: 'Airbus', price: 3000, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#4CB8C4', '#3CD3AD'], multiplier: 2.2, intro: 'A330-300的完美继任者，以更低的油耗提供相同的运力。' },
    { model: 'A350-900', brand: 'Airbus', price: 3300, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#403B4A', '#E7E9BB'], multiplier: 2.3, intro: '空客新一代旗舰宽体客机，机身大面积采用碳纤维复合材料。' },
    { model: 'A350-1000', brand: 'Airbus', price: 3800, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#403B4A', '#E7E9BB'], multiplier: 2.5, intro: 'A350家族最大的成员，提供极致的静谧体验与卓越的运载能力。' },
    { model: 'A380-800', brand: 'Airbus', price: 7000, logoUrl: { "id": 16777228, "type": 20000, params: [], "bundleName": "com.example.class1", "moduleName": "entry" }, gradient: ['#1D2B64', '#F8CDDA'], multiplier: 4.0, intro: '双层巨无霸，世界上最大的民航客机，航空工程的巅峰之作。' }
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
class PlaneIntroDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.plane = ALL_PLANES[0];
        this.isOwned = false;
        this.onBuy = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PlaneIntroDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.plane !== undefined) {
            this.plane = params.plane;
        }
        if (params.isOwned !== undefined) {
            this.isOwned = params.isOwned;
        }
        if (params.onBuy !== undefined) {
            this.onBuy = params.onBuy;
        }
    }
    updateStateVars(params: PlaneIntroDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private plane: Plane;
    private isOwned: boolean;
    private onBuy: (plane: Plane) => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.padding(25);
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(this.plane.logoUrl);
            Image.width('80%');
            Image.height(70);
            Image.objectFit(ImageFit.Contain);
            Image.backgroundColor('rgba(255,255,255,0.9)');
            Image.borderRadius(15);
            Image.padding(10);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.plane.model);
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.plane.brand);
            Text.fontSize(16);
            Text.fontColor('#00E5FF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('rgba(255,255,255,0.2)');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.plane.intro);
            Text.fontSize(16);
            Text.fontColor('#EEE');
            Text.lineHeight(24);
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 10, bottom: 15 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('收益系数: ');
            Text.fontColor('#AAA');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`x${this.plane.multiplier.toFixed(1)}`);
            Text.fontColor('#FFD700');
            Text.fontWeight(FontWeight.Bold);
            Text.fontSize(20);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 15 });
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.layoutWeight(1);
            Button.height(50);
            Button.backgroundColor('rgba(255,255,255,0.2)');
            Button.fontColor('#FFF');
            Button.onClick(() => this.controller.close());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isOwned ? '已在库' : `购买 💰${this.plane.price}`);
            Button.layoutWeight(1);
            Button.height(50);
            Button.backgroundColor(this.isOwned ? 'rgba(255,255,255,0.1)' : '#00E5FF');
            Button.fontColor(this.isOwned ? '#999' : '#000');
            Button.enabled(!this.isOwned);
            Button.onClick(() => {
                this.onBuy(this.plane);
                this.controller.close();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class FlightConcentrator extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__currentPage = new ObservedPropertySimplePU(10, this, "currentPage");
        this.__authMode = new ObservedPropertySimplePU('entry', this, "authMode");
        this.__sysUsername = new ObservedPropertySimplePU('', this, "sysUsername");
        this.__sysPassword = new ObservedPropertySimplePU('', this, "sysPassword");
        this.__airlineName = new ObservedPropertySimplePU('', this, "airlineName");
        this.__airlineCode = new ObservedPropertySimplePU('', this, "airlineCode");
        this.__formUser = new ObservedPropertySimplePU('', this, "formUser");
        this.__formPwd = new ObservedPropertySimplePU('', this, "formPwd");
        this.__formAirName = new ObservedPropertySimplePU('', this, "formAirName");
        this.__formAirCode = new ObservedPropertySimplePU('', this, "formAirCode");
        this.__authErrorMsg = new ObservedPropertySimplePU('', this, "authErrorMsg");
        this.__coinBalance = new ObservedPropertySimplePU(0, this, "coinBalance");
        this.__airportLevel = new ObservedPropertySimplePU(1, this, "airportLevel");
        this.__totalFocusMinutes = new ObservedPropertySimplePU(0, this, "totalFocusMinutes");
        this.__unlockedAirports = new ObservedPropertyObjectPU([], this, "unlockedAirports");
        this.__unlockedRoutes = new ObservedPropertyObjectPU([], this, "unlockedRoutes");
        this.__ownedPlanes = new ObservedPropertyObjectPU([], this, "ownedPlanes");
        this.__scheduleList = new ObservedPropertyObjectPU([], this, "scheduleList");
        this.__displayYear = new ObservedPropertySimplePU(new Date().getFullYear(), this, "displayYear");
        this.__displayMonth = new ObservedPropertySimplePU(new Date().getMonth(), this, "displayMonth");
        this.__daysInMonthList = new ObservedPropertyObjectPU([], this, "daysInMonthList");
        this.__selectedDate = new ObservedPropertyObjectPU(new Date(), this, "selectedDate");
        this.__tempTaskType = new ObservedPropertySimplePU('', this, "tempTaskType");
        this.__tempStartTime = new ObservedPropertyObjectPU(new Date(), this, "tempStartTime");
        this.__tempEndTime = new ObservedPropertyObjectPU(new Date(), this, "tempEndTime");
        this.__candidateAirports = new ObservedPropertyObjectPU([], this, "candidateAirports");
        this.__selectedAirport = new ObservedPropertyObjectPU(null, this, "selectedAirport");
        this.__targetPurchaseName = new ObservedPropertySimplePU('', this, "targetPurchaseName");
        this.__targetPurchasePrice = new ObservedPropertySimplePU(0, this, "targetPurchasePrice");
        this.__targetPurchaseType = new ObservedPropertySimplePU('airport', this, "targetPurchaseType");
        this.__targetPurchaseId = new ObservedPropertySimplePU('', this, "targetPurchaseId");
        this.__activeFlight = new ObservedPropertyObjectPU({ id: 0, taskType: '', startTime: new Date(), endTime: new Date(), destIata: '', destName: '', planeModel: '', expectedProfit: 0 }, this, "activeFlight");
        this.__remainingSeconds = new ObservedPropertySimplePU(0, this, "remainingSeconds");
        this.__totalFlightSeconds = new ObservedPropertySimplePU(1, this, "totalFlightSeconds");
        this.__currentAltitude = new ObservedPropertySimplePU(0, this, "currentAltitude");
        this.__currentSpeed = new ObservedPropertySimplePU(0, this, "currentSpeed");
        this.timerId = -1;
        this.webController = new webview.WebviewController();
        this.context = getContext(this) as common.UIAbilityContext;
        this.pref = preferences.getPreferencesSync(this.context, { name: 'aviation_pro_prefs' });
        this.introDialog = null;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: FlightConcentrator_Params) {
        if (params.currentPage !== undefined) {
            this.currentPage = params.currentPage;
        }
        if (params.authMode !== undefined) {
            this.authMode = params.authMode;
        }
        if (params.sysUsername !== undefined) {
            this.sysUsername = params.sysUsername;
        }
        if (params.sysPassword !== undefined) {
            this.sysPassword = params.sysPassword;
        }
        if (params.airlineName !== undefined) {
            this.airlineName = params.airlineName;
        }
        if (params.airlineCode !== undefined) {
            this.airlineCode = params.airlineCode;
        }
        if (params.formUser !== undefined) {
            this.formUser = params.formUser;
        }
        if (params.formPwd !== undefined) {
            this.formPwd = params.formPwd;
        }
        if (params.formAirName !== undefined) {
            this.formAirName = params.formAirName;
        }
        if (params.formAirCode !== undefined) {
            this.formAirCode = params.formAirCode;
        }
        if (params.authErrorMsg !== undefined) {
            this.authErrorMsg = params.authErrorMsg;
        }
        if (params.coinBalance !== undefined) {
            this.coinBalance = params.coinBalance;
        }
        if (params.airportLevel !== undefined) {
            this.airportLevel = params.airportLevel;
        }
        if (params.totalFocusMinutes !== undefined) {
            this.totalFocusMinutes = params.totalFocusMinutes;
        }
        if (params.unlockedAirports !== undefined) {
            this.unlockedAirports = params.unlockedAirports;
        }
        if (params.unlockedRoutes !== undefined) {
            this.unlockedRoutes = params.unlockedRoutes;
        }
        if (params.ownedPlanes !== undefined) {
            this.ownedPlanes = params.ownedPlanes;
        }
        if (params.scheduleList !== undefined) {
            this.scheduleList = params.scheduleList;
        }
        if (params.displayYear !== undefined) {
            this.displayYear = params.displayYear;
        }
        if (params.displayMonth !== undefined) {
            this.displayMonth = params.displayMonth;
        }
        if (params.daysInMonthList !== undefined) {
            this.daysInMonthList = params.daysInMonthList;
        }
        if (params.selectedDate !== undefined) {
            this.selectedDate = params.selectedDate;
        }
        if (params.tempTaskType !== undefined) {
            this.tempTaskType = params.tempTaskType;
        }
        if (params.tempStartTime !== undefined) {
            this.tempStartTime = params.tempStartTime;
        }
        if (params.tempEndTime !== undefined) {
            this.tempEndTime = params.tempEndTime;
        }
        if (params.candidateAirports !== undefined) {
            this.candidateAirports = params.candidateAirports;
        }
        if (params.selectedAirport !== undefined) {
            this.selectedAirport = params.selectedAirport;
        }
        if (params.targetPurchaseName !== undefined) {
            this.targetPurchaseName = params.targetPurchaseName;
        }
        if (params.targetPurchasePrice !== undefined) {
            this.targetPurchasePrice = params.targetPurchasePrice;
        }
        if (params.targetPurchaseType !== undefined) {
            this.targetPurchaseType = params.targetPurchaseType;
        }
        if (params.targetPurchaseId !== undefined) {
            this.targetPurchaseId = params.targetPurchaseId;
        }
        if (params.activeFlight !== undefined) {
            this.activeFlight = params.activeFlight;
        }
        if (params.remainingSeconds !== undefined) {
            this.remainingSeconds = params.remainingSeconds;
        }
        if (params.totalFlightSeconds !== undefined) {
            this.totalFlightSeconds = params.totalFlightSeconds;
        }
        if (params.currentAltitude !== undefined) {
            this.currentAltitude = params.currentAltitude;
        }
        if (params.currentSpeed !== undefined) {
            this.currentSpeed = params.currentSpeed;
        }
        if (params.timerId !== undefined) {
            this.timerId = params.timerId;
        }
        if (params.webController !== undefined) {
            this.webController = params.webController;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.pref !== undefined) {
            this.pref = params.pref;
        }
        if (params.introDialog !== undefined) {
            this.introDialog = params.introDialog;
        }
    }
    updateStateVars(params: FlightConcentrator_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__authMode.purgeDependencyOnElmtId(rmElmtId);
        this.__sysUsername.purgeDependencyOnElmtId(rmElmtId);
        this.__sysPassword.purgeDependencyOnElmtId(rmElmtId);
        this.__airlineName.purgeDependencyOnElmtId(rmElmtId);
        this.__airlineCode.purgeDependencyOnElmtId(rmElmtId);
        this.__formUser.purgeDependencyOnElmtId(rmElmtId);
        this.__formPwd.purgeDependencyOnElmtId(rmElmtId);
        this.__formAirName.purgeDependencyOnElmtId(rmElmtId);
        this.__formAirCode.purgeDependencyOnElmtId(rmElmtId);
        this.__authErrorMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__coinBalance.purgeDependencyOnElmtId(rmElmtId);
        this.__airportLevel.purgeDependencyOnElmtId(rmElmtId);
        this.__totalFocusMinutes.purgeDependencyOnElmtId(rmElmtId);
        this.__unlockedAirports.purgeDependencyOnElmtId(rmElmtId);
        this.__unlockedRoutes.purgeDependencyOnElmtId(rmElmtId);
        this.__ownedPlanes.purgeDependencyOnElmtId(rmElmtId);
        this.__scheduleList.purgeDependencyOnElmtId(rmElmtId);
        this.__displayYear.purgeDependencyOnElmtId(rmElmtId);
        this.__displayMonth.purgeDependencyOnElmtId(rmElmtId);
        this.__daysInMonthList.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedDate.purgeDependencyOnElmtId(rmElmtId);
        this.__tempTaskType.purgeDependencyOnElmtId(rmElmtId);
        this.__tempStartTime.purgeDependencyOnElmtId(rmElmtId);
        this.__tempEndTime.purgeDependencyOnElmtId(rmElmtId);
        this.__candidateAirports.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedAirport.purgeDependencyOnElmtId(rmElmtId);
        this.__targetPurchaseName.purgeDependencyOnElmtId(rmElmtId);
        this.__targetPurchasePrice.purgeDependencyOnElmtId(rmElmtId);
        this.__targetPurchaseType.purgeDependencyOnElmtId(rmElmtId);
        this.__targetPurchaseId.purgeDependencyOnElmtId(rmElmtId);
        this.__activeFlight.purgeDependencyOnElmtId(rmElmtId);
        this.__remainingSeconds.purgeDependencyOnElmtId(rmElmtId);
        this.__totalFlightSeconds.purgeDependencyOnElmtId(rmElmtId);
        this.__currentAltitude.purgeDependencyOnElmtId(rmElmtId);
        this.__currentSpeed.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentPage.aboutToBeDeleted();
        this.__authMode.aboutToBeDeleted();
        this.__sysUsername.aboutToBeDeleted();
        this.__sysPassword.aboutToBeDeleted();
        this.__airlineName.aboutToBeDeleted();
        this.__airlineCode.aboutToBeDeleted();
        this.__formUser.aboutToBeDeleted();
        this.__formPwd.aboutToBeDeleted();
        this.__formAirName.aboutToBeDeleted();
        this.__formAirCode.aboutToBeDeleted();
        this.__authErrorMsg.aboutToBeDeleted();
        this.__coinBalance.aboutToBeDeleted();
        this.__airportLevel.aboutToBeDeleted();
        this.__totalFocusMinutes.aboutToBeDeleted();
        this.__unlockedAirports.aboutToBeDeleted();
        this.__unlockedRoutes.aboutToBeDeleted();
        this.__ownedPlanes.aboutToBeDeleted();
        this.__scheduleList.aboutToBeDeleted();
        this.__displayYear.aboutToBeDeleted();
        this.__displayMonth.aboutToBeDeleted();
        this.__daysInMonthList.aboutToBeDeleted();
        this.__selectedDate.aboutToBeDeleted();
        this.__tempTaskType.aboutToBeDeleted();
        this.__tempStartTime.aboutToBeDeleted();
        this.__tempEndTime.aboutToBeDeleted();
        this.__candidateAirports.aboutToBeDeleted();
        this.__selectedAirport.aboutToBeDeleted();
        this.__targetPurchaseName.aboutToBeDeleted();
        this.__targetPurchasePrice.aboutToBeDeleted();
        this.__targetPurchaseType.aboutToBeDeleted();
        this.__targetPurchaseId.aboutToBeDeleted();
        this.__activeFlight.aboutToBeDeleted();
        this.__remainingSeconds.aboutToBeDeleted();
        this.__totalFlightSeconds.aboutToBeDeleted();
        this.__currentAltitude.aboutToBeDeleted();
        this.__currentSpeed.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __currentPage: ObservedPropertySimplePU<number>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(newValue: number) {
        this.__currentPage.set(newValue);
    }
    // 认证状态控制：10-系统入口 (统一管理登录/注册)，0~9是业务页面
    private __authMode: ObservedPropertySimplePU<'login' | 'register' | 'entry'>;
    get authMode() {
        return this.__authMode.get();
    }
    set authMode(newValue: 'login' | 'register' | 'entry') {
        this.__authMode.set(newValue);
    }
    // 认证信息
    private __sysUsername: ObservedPropertySimplePU<string>;
    get sysUsername() {
        return this.__sysUsername.get();
    }
    set sysUsername(newValue: string) {
        this.__sysUsername.set(newValue);
    }
    private __sysPassword: ObservedPropertySimplePU<string>;
    get sysPassword() {
        return this.__sysPassword.get();
    }
    set sysPassword(newValue: string) {
        this.__sysPassword.set(newValue);
    }
    private __airlineName: ObservedPropertySimplePU<string>;
    get airlineName() {
        return this.__airlineName.get();
    }
    set airlineName(newValue: string) {
        this.__airlineName.set(newValue);
    }
    private __airlineCode: ObservedPropertySimplePU<string>;
    get airlineCode() {
        return this.__airlineCode.get();
    }
    set airlineCode(newValue: string) {
        this.__airlineCode.set(newValue);
    }
    // 登录/注册表单
    private __formUser: ObservedPropertySimplePU<string>;
    get formUser() {
        return this.__formUser.get();
    }
    set formUser(newValue: string) {
        this.__formUser.set(newValue);
    }
    private __formPwd: ObservedPropertySimplePU<string>;
    get formPwd() {
        return this.__formPwd.get();
    }
    set formPwd(newValue: string) {
        this.__formPwd.set(newValue);
    }
    private __formAirName: ObservedPropertySimplePU<string>;
    get formAirName() {
        return this.__formAirName.get();
    }
    set formAirName(newValue: string) {
        this.__formAirName.set(newValue);
    }
    private __formAirCode: ObservedPropertySimplePU<string>;
    get formAirCode() {
        return this.__formAirCode.get();
    }
    set formAirCode(newValue: string) {
        this.__formAirCode.set(newValue);
    }
    private __authErrorMsg: ObservedPropertySimplePU<string>;
    get authErrorMsg() {
        return this.__authErrorMsg.get();
    }
    set authErrorMsg(newValue: string) {
        this.__authErrorMsg.set(newValue);
    }
    // 业务数据
    private __coinBalance: ObservedPropertySimplePU<number>;
    get coinBalance() {
        return this.__coinBalance.get();
    }
    set coinBalance(newValue: number) {
        this.__coinBalance.set(newValue);
    }
    private __airportLevel: ObservedPropertySimplePU<number>;
    get airportLevel() {
        return this.__airportLevel.get();
    }
    set airportLevel(newValue: number) {
        this.__airportLevel.set(newValue);
    }
    private __totalFocusMinutes: ObservedPropertySimplePU<number>;
    get totalFocusMinutes() {
        return this.__totalFocusMinutes.get();
    }
    set totalFocusMinutes(newValue: number) {
        this.__totalFocusMinutes.set(newValue);
    }
    private __unlockedAirports: ObservedPropertyObjectPU<string[]>;
    get unlockedAirports() {
        return this.__unlockedAirports.get();
    }
    set unlockedAirports(newValue: string[]) {
        this.__unlockedAirports.set(newValue);
    }
    private __unlockedRoutes: ObservedPropertyObjectPU<string[]>;
    get unlockedRoutes() {
        return this.__unlockedRoutes.get();
    }
    set unlockedRoutes(newValue: string[]) {
        this.__unlockedRoutes.set(newValue);
    }
    private __ownedPlanes: ObservedPropertyObjectPU<string[]>;
    get ownedPlanes() {
        return this.__ownedPlanes.get();
    }
    set ownedPlanes(newValue: string[]) {
        this.__ownedPlanes.set(newValue);
    }
    private __scheduleList: ObservedPropertyObjectPU<Array<ScheduleItem>>;
    get scheduleList() {
        return this.__scheduleList.get();
    }
    set scheduleList(newValue: Array<ScheduleItem>) {
        this.__scheduleList.set(newValue);
    }
    // 临时状态
    private __displayYear: ObservedPropertySimplePU<number>;
    get displayYear() {
        return this.__displayYear.get();
    }
    set displayYear(newValue: number) {
        this.__displayYear.set(newValue);
    }
    private __displayMonth: ObservedPropertySimplePU<number>;
    get displayMonth() {
        return this.__displayMonth.get();
    }
    set displayMonth(newValue: number) {
        this.__displayMonth.set(newValue);
    }
    private __daysInMonthList: ObservedPropertyObjectPU<(number | null)[]>;
    get daysInMonthList() {
        return this.__daysInMonthList.get();
    }
    set daysInMonthList(newValue: (number | null)[]) {
        this.__daysInMonthList.set(newValue);
    }
    private __selectedDate: ObservedPropertyObjectPU<Date>;
    get selectedDate() {
        return this.__selectedDate.get();
    }
    set selectedDate(newValue: Date) {
        this.__selectedDate.set(newValue);
    }
    private __tempTaskType: ObservedPropertySimplePU<string>;
    get tempTaskType() {
        return this.__tempTaskType.get();
    }
    set tempTaskType(newValue: string) {
        this.__tempTaskType.set(newValue);
    }
    private __tempStartTime: ObservedPropertyObjectPU<Date>;
    get tempStartTime() {
        return this.__tempStartTime.get();
    }
    set tempStartTime(newValue: Date) {
        this.__tempStartTime.set(newValue);
    }
    private __tempEndTime: ObservedPropertyObjectPU<Date>;
    get tempEndTime() {
        return this.__tempEndTime.get();
    }
    set tempEndTime(newValue: Date) {
        this.__tempEndTime.set(newValue);
    }
    private __candidateAirports: ObservedPropertyObjectPU<Airport[]>;
    get candidateAirports() {
        return this.__candidateAirports.get();
    }
    set candidateAirports(newValue: Airport[]) {
        this.__candidateAirports.set(newValue);
    }
    private __selectedAirport: ObservedPropertyObjectPU<Airport | null>;
    get selectedAirport() {
        return this.__selectedAirport.get();
    }
    set selectedAirport(newValue: Airport | null) {
        this.__selectedAirport.set(newValue);
    }
    private __targetPurchaseName: ObservedPropertySimplePU<string>;
    get targetPurchaseName() {
        return this.__targetPurchaseName.get();
    }
    set targetPurchaseName(newValue: string) {
        this.__targetPurchaseName.set(newValue);
    }
    private __targetPurchasePrice: ObservedPropertySimplePU<number>;
    get targetPurchasePrice() {
        return this.__targetPurchasePrice.get();
    }
    set targetPurchasePrice(newValue: number) {
        this.__targetPurchasePrice.set(newValue);
    }
    private __targetPurchaseType: ObservedPropertySimplePU<'airport' | 'plane'>;
    get targetPurchaseType() {
        return this.__targetPurchaseType.get();
    }
    set targetPurchaseType(newValue: 'airport' | 'plane') {
        this.__targetPurchaseType.set(newValue);
    }
    private __targetPurchaseId: ObservedPropertySimplePU<string>;
    get targetPurchaseId() {
        return this.__targetPurchaseId.get();
    }
    set targetPurchaseId(newValue: string) {
        this.__targetPurchaseId.set(newValue);
    }
    // 执飞状态
    private __activeFlight: ObservedPropertyObjectPU<ScheduleItem>;
    get activeFlight() {
        return this.__activeFlight.get();
    }
    set activeFlight(newValue: ScheduleItem) {
        this.__activeFlight.set(newValue);
    }
    private __remainingSeconds: ObservedPropertySimplePU<number>;
    get remainingSeconds() {
        return this.__remainingSeconds.get();
    }
    set remainingSeconds(newValue: number) {
        this.__remainingSeconds.set(newValue);
    }
    private __totalFlightSeconds: ObservedPropertySimplePU<number>;
    get totalFlightSeconds() {
        return this.__totalFlightSeconds.get();
    }
    set totalFlightSeconds(newValue: number) {
        this.__totalFlightSeconds.set(newValue);
    }
    private __currentAltitude: ObservedPropertySimplePU<number>;
    get currentAltitude() {
        return this.__currentAltitude.get();
    }
    set currentAltitude(newValue: number) {
        this.__currentAltitude.set(newValue);
    }
    private __currentSpeed: ObservedPropertySimplePU<number>;
    get currentSpeed() {
        return this.__currentSpeed.get();
    }
    set currentSpeed(newValue: number) {
        this.__currentSpeed.set(newValue);
    }
    private timerId: number;
    private webController: webview.WebviewController;
    private context;
    private pref;
    private introDialog: CustomDialogController | null;
    aboutToAppear() {
        this.updateCalendarDays();
        this.checkAuthStatus();
    }
    // 初始化与鉴权
    checkAuthStatus() {
        this.sysUsername = this.pref.getSync('sys_username', '') as string;
        if (!this.sysUsername) {
            // 没账号，进入选择入口状态
            this.currentPage = 10;
            this.authMode = 'entry';
        }
        else {
            // 有缓存账号，引导至登录页（让用户输密码）
            this.currentPage = 10;
            this.authMode = 'login';
            this.sysPassword = this.pref.getSync('sys_password', '') as string;
            this.airlineName = this.pref.getSync('airline_name', '') as string;
            this.airlineCode = this.pref.getSync('airline_code', '') as string;
        }
    }
    loadBusinessData() {
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
            this.ownedPlanes = ["737-800", "ARJ21"]; // 这里给你加上了 737
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
            startTime: new Date(i.startTime as string),
            endTime: new Date(i.endTime as string)
        } as ScheduleItem));
    }
    saveAllData() {
        this.pref.putSync('sys_username', this.sysUsername);
        this.pref.putSync('sys_password', this.sysPassword);
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
        this.pref.flushSync();
    }
    resetSystem() {
        this.pref.clearSync();
        this.pref.flushSync();
        this.sysUsername = '';
        this.sysPassword = '';
        this.formUser = '';
        this.formPwd = '';
        this.formAirName = '';
        this.formAirCode = '';
        this.currentPage = 10;
        this.authMode = 'entry'; // 清理后返回主入口
    }
    // ================= 核心业务补全 =================
    updateCalendarDays() {
        let firstDayOfMonth = new Date(this.displayYear, this.displayMonth, 1).getDay();
        let daysCount = new Date(this.displayYear, this.displayMonth + 1, 0).getDate();
        let tempArr: (number | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++)
            tempArr.push(null);
        for (let i = 1; i <= daysCount; i++)
            tempArr.push(i);
        this.daysInMonthList = tempArr;
    }
    filterAirports() {
        let duration = (this.tempEndTime.getTime() - this.tempStartTime.getTime()) / 60000;
        if (duration <= 0)
            duration += 24 * 60;
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
            position: [113.2988, 23.3924],
            content: '<div class="custom-marker" style="border-color:#FFF; color:#FFF; font-weight:bold;">CAN (总部)</div>',
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
                path: [ [113.2988, 23.3924], item.position ], strokeColor: item.color,
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 沉浸式深空高级渐变背景
            Column.create();
            // 沉浸式深空高级渐变背景
            Column.width('100%');
            // 沉浸式深空高级渐变背景
            Column.height('100%');
            // 沉浸式深空高级渐变背景
            Column.linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] });
        }, Column);
        // 沉浸式深空高级渐变背景
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.currentPage === 10) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.AuthSystemView.bind(this)();
                });
            }
            else if (this.currentPage === 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.HomeView.bind(this)();
                });
            }
            else if (this.currentPage === 1) {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.CalendarView.bind(this)();
                });
            }
            else if (this.currentPage === 2) {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.TaskSettingView.bind(this)();
                });
            }
            else if (this.currentPage === 3) {
                this.ifElseBranchUpdateFunction(4, () => {
                    this.RoutePickerView.bind(this)();
                });
            }
            else if (this.currentPage === 4) {
                this.ifElseBranchUpdateFunction(5, () => {
                    this.FlightListView.bind(this)();
                });
            }
            else if (this.currentPage === 5) {
                this.ifElseBranchUpdateFunction(6, () => {
                    this.FlyingView.bind(this)();
                });
            }
            else if (this.currentPage === 6) {
                this.ifElseBranchUpdateFunction(7, () => {
                    this.ProfileView.bind(this)();
                });
            }
            else if (this.currentPage === 7) {
                this.ifElseBranchUpdateFunction(8, () => {
                    this.ShopView.bind(this)();
                });
            }
            else if (this.currentPage === 8) {
                this.ifElseBranchUpdateFunction(9, () => {
                    this.SettlementView.bind(this)();
                });
            }
            else if (this.currentPage === 9) {
                this.ifElseBranchUpdateFunction(10, () => {
                    this.PlanePickerForFlightView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(11, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Stack.pop();
    }
    // ================= 模块化：认证系统入口 =================
    InputField(placeholder: string, type: InputType, onChange: (v: string) => void, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: placeholder });
            TextInput.type(type);
            TextInput.onChange(onChange);
            TextInput.width('100%');
            TextInput.height(60);
            TextInput.backgroundColor('rgba(255, 255, 255, 0.08)');
            TextInput.fontColor('#FFF');
            TextInput.placeholderColor('rgba(255,255,255,0.4)');
            TextInput.borderRadius(16);
            TextInput.border({ width: 1, color: 'rgba(255, 255, 255, 0.2)' });
        }, TextInput);
    }
    AuthSystemView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 30 });
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.authMode === 'entry' ? '航司调度中心' : (this.authMode === 'login' ? '机长登录' : '新航司入网'));
            Text.fontSize(32);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.margin({ top: 80, bottom: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.authMode === 'entry') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 20 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('登录已有账号');
                        Button.width('85%');
                        Button.height(60);
                        Button.backgroundColor('#FFF');
                        Button.fontColor('#000');
                        Button.fontWeight(FontWeight.Medium);
                        Button.borderRadius(30);
                        Button.onClick(() => { this.authMode = 'login'; this.authErrorMsg = ''; });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('注册新航司账号');
                        Button.width('85%');
                        Button.height(60);
                        Button.backgroundColor('rgba(255,255,255,0.15)');
                        Button.fontColor('#FFF');
                        Button.borderRadius(30);
                        Button.border({ width: 1, color: 'rgba(255,255,255,0.3)' });
                        Button.onClick(() => { this.authMode = 'register'; this.authErrorMsg = ''; });
                    }, Button);
                    Button.pop();
                    Column.pop();
                });
            }
            else if (this.authMode === 'register') {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 15 });
                        Column.width('85%');
                    }, Column);
                    this.InputField.bind(this)('机长用户名', InputType.Normal, v => this.formUser = v);
                    this.InputField.bind(this)('设置密码', InputType.Password, v => this.formPwd = v);
                    this.InputField.bind(this)('航空公司名称', InputType.Normal, v => this.formAirName = v);
                    this.InputField.bind(this)('航司三字代码 (如：UAA)', InputType.Normal, v => this.formAirCode = v.toUpperCase());
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.authErrorMsg) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.authErrorMsg);
                                    Text.fontColor('#FF5252');
                                    Text.fontSize(14);
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('确认注册并登录');
                        Button.width('100%');
                        Button.height(60);
                        Button.backgroundColor('#00E5FF');
                        Button.fontColor('#000');
                        Button.borderRadius(30);
                        Button.margin({ top: 10 });
                        Button.onClick(() => {
                            if (!this.formUser || !this.formPwd || !this.formAirName || !this.formAirCode) {
                                this.authErrorMsg = '请完整填写所有信息';
                            }
                            else {
                                this.sysUsername = this.formUser;
                                this.sysPassword = this.formPwd;
                                this.airlineName = this.formAirName;
                                this.airlineCode = this.formAirCode;
                                this.ownedPlanes = ["ARJ21", "A320neo"]; // 注册赠送初始机队
                                this.loadBusinessData();
                                this.saveAllData();
                                this.currentPage = 0;
                            }
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('返回选择');
                        Text.fontColor('rgba(255,255,255,0.5)');
                        Text.fontSize(14);
                        Text.onClick(() => this.authMode = 'entry');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else if (this.authMode === 'login') {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 15 });
                        Column.width('85%');
                    }, Column);
                    this.InputField.bind(this)('机长用户名', InputType.Normal, v => this.formUser = v);
                    this.InputField.bind(this)('输入密码', InputType.Password, v => this.formPwd = v);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.authErrorMsg) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(this.authErrorMsg);
                                    Text.fontColor('#FF5252');
                                    Text.fontSize(14);
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('验证起飞');
                        Button.width('100%');
                        Button.height(60);
                        Button.backgroundColor('#00E5FF');
                        Button.fontColor('#000');
                        Button.borderRadius(30);
                        Button.margin({ top: 10 });
                        Button.onClick(() => {
                            if (this.formUser === this.sysUsername && this.formPwd === this.sysPassword && this.sysUsername !== '') {
                                this.authErrorMsg = '';
                                this.loadBusinessData();
                                this.currentPage = 0;
                            }
                            else {
                                this.authErrorMsg = '机长身份验证失败，请核对信息';
                            }
                        });
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('没有账号？去注册');
                        Text.fontColor('rgba(255,255,255,0.5)');
                        Text.fontSize(14);
                        Text.onClick(() => this.authMode = 'register');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('返回选择');
                        Text.fontColor('rgba(255,255,255,0.5)');
                        Text.fontSize(14);
                        Text.onClick(() => this.authMode = 'entry');
                        Text.margin({ top: 10 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(3, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    // ================= 页面组件 =================
    StepHeader(title: string, prevPage: number, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(25);
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('←');
            Button.width(50);
            Button.height(50);
            Button.backgroundColor('rgba(255,255,255,0.15)');
            Button.fontColor('#FFF');
            Button.borderRadius(15);
            Button.fontSize(20);
            Button.onClick(() => this.currentPage = prevPage);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(title);
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.margin({ left: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        Row.pop();
    }
    HomeView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 25 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.width('92%');
            Column.padding(35);
            Column.margin({ top: 70 });
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.airlineName} (${this.airlineCode})`);
            Text.fontSize(26);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.letterSpacing(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`欢迎登机，${this.sysUsername} 机长`);
            Text.fontSize(16);
            Text.fontColor('rgba(255,255,255,0.6)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('rgba(255,255,255,0.1)');
            Divider.margin({ top: 10, bottom: 10 });
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceBetween);
        }, Row);
        this.DataStat.bind(this)('资金结余', `💰 ${this.coinBalance}`);
        this.DataStat.bind(this)('在役机队', `✈️ ${this.ownedPlanes.length}`);
        this.DataStat.bind(this)('通航城市', `📍 ${this.unlockedRoutes.length}`);
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.margin({ top: 30 });
        }, Column);
        this.MenuButton.bind(this)('规划新航程', 'rgba(0, 229, 255, 0.3)', () => this.currentPage = 1, '#FFF');
        this.MenuButton.bind(this)('航班调度表', 'rgba(255, 255, 255, 0.15)', () => this.currentPage = 4, '#FFF');
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 20 });
            Row.width('90%');
        }, Row);
        this.MenuButton.bind(this)('航空商店', 'rgba(255, 152, 0, 0.3)', () => this.currentPage = 7, '#FFF', '45%');
        this.MenuButton.bind(this)('我的简报', 'rgba(76, 175, 80, 0.3)', () => this.currentPage = 6, '#FFF', '45%');
        Row.pop();
        Column.pop();
        Column.pop();
    }
    DataStat(label: string, val: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(val);
            Text.fontColor('#FFF');
            Text.fontWeight(FontWeight.Bold);
            Text.fontSize(16);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontColor('rgba(255,255,255,0.5)');
            Text.fontSize(12);
        }, Text);
        Text.pop();
        Column.pop();
    }
    MenuButton(label: string, bg: string, click: () => void, textCol: string = '#FFF', w: string = '90%', parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(label);
            Button.width(w);
            Button.height(75);
            Button.borderRadius(20);
            Button.backgroundColor(bg);
            Button.backdropBlur(20);
            Button.border({ width: 1, color: 'rgba(255, 255, 255, 0.3)' });
            Button.fontColor(textCol);
            Button.fontSize(18);
            Button.fontWeight(FontWeight.Medium);
            Button.shadow({ radius: 10, color: 'rgba(0,0,0,0.2)', offsetY: 5 });
            Button.onClick(click);
        }, Button);
        Button.pop();
    }
    CalendarView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
        }, Column);
        this.StepHeader.bind(this)('第1步：确定航行日期', 0);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('92%');
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.padding(20);
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.displayYear}年${this.displayMonth + 1}月`);
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 15 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('◀');
            Text.fontSize(20);
            Text.fontColor('#00E5FF');
            Text.onClick(() => {
                if (this.displayMonth === 0) {
                    this.displayMonth = 11;
                    this.displayYear--;
                }
                else {
                    this.displayMonth--;
                }
                this.updateCalendarDays();
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('▶');
            Text.fontSize(20);
            Text.fontColor('#00E5FF');
            Text.onClick(() => {
                if (this.displayMonth === 11) {
                    this.displayMonth = 0;
                    this.displayYear++;
                }
                else {
                    this.displayMonth++;
                }
                this.updateCalendarDays();
            });
        }, Text);
        Text.pop();
        Row.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const w = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(w);
                    Text.layoutWeight(1);
                    Text.textAlign(TextAlign.Center);
                    Text.fontColor('rgba(255, 255, 255, 0.7)');
                    Text.margin({ bottom: 10 });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, ['日', '一', '二', '三', '四', '五', '六'], forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridRow.create({ columns: 7, gutter: 8 });
            GridRow.padding(15);
        }, GridRow);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const day = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    GridCol.create();
                }, GridCol);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    If.create();
                    if (day !== null) {
                        this.ifElseBranchUpdateFunction(0, () => {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(day.toString());
                                Text.fontColor(this.isSelectedDay(day) ? '#000' : '#FFF');
                                Text.fontWeight(FontWeight.Bold);
                                Text.width('100%');
                                Text.height(50);
                                Text.textAlign(TextAlign.Center);
                                Text.backgroundColor(this.isSelectedDay(day) ? '#00E5FF' : 'rgba(255,255,255,0.1)');
                                Text.borderRadius(12);
                                Text.onClick(() => this.selectedDate = new Date(this.displayYear, this.displayMonth, day));
                            }, Text);
                            Text.pop();
                        });
                    }
                    else {
                        this.ifElseBranchUpdateFunction(1, () => {
                        });
                    }
                }, If);
                If.pop();
                GridCol.pop();
            };
            this.forEachUpdateFunction(elmtId, this.daysInMonthList, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        GridRow.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('下一步：设定任务');
            Button.width('90%');
            Button.height(65);
            Button.backgroundColor('#00E5FF');
            Button.fontColor('#000');
            Button.borderRadius(20);
            Button.fontWeight(FontWeight.Bold);
            Button.margin({ bottom: 50 });
            Button.onClick(() => this.currentPage = 2);
        }, Button);
        Button.pop();
        Column.pop();
    }
    TaskSettingView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 25 });
            Column.height('100%');
        }, Column);
        this.StepHeader.bind(this)('第2步：设定专注任务', 1);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '在此输入专注事项，如：阅读文献...', text: this.tempTaskType });
            TextInput.width('90%');
            TextInput.height(65);
            TextInput.backgroundColor('rgba(255, 255, 255, 0.12)');
            TextInput.backdropBlur(25);
            TextInput.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            TextInput.borderRadius(20);
            TextInput.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
            TextInput.onChange(v => this.tempTaskType = v);
            TextInput.fontColor('#FFF');
            TextInput.placeholderColor('rgba(255,255,255,0.6)');
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.width('90%');
            Column.padding(25);
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('预估飞行时间段');
            Text.width('100%');
            Text.fontColor('rgba(255,255,255,0.8)');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TimePicker.create();
            TimePicker.useMilitaryTime(true);
            TimePicker.height(140);
            TimePicker.layoutWeight(1);
            TimePicker.onChange(v => this.tempStartTime.setHours(v.hour, v.minute));
        }, TimePicker);
        TimePicker.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('至');
            Text.fontColor('#FFF');
            Text.margin({ left: 10, right: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TimePicker.create();
            TimePicker.useMilitaryTime(true);
            TimePicker.height(140);
            TimePicker.layoutWeight(1);
            TimePicker.onChange(v => this.tempEndTime.setHours(v.hour, v.minute));
        }, TimePicker);
        TimePicker.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('下一步：匹配航线');
            Button.width('90%');
            Button.height(65);
            Button.borderRadius(20);
            Button.backgroundColor('#00E5FF');
            Button.fontColor('#000');
            Button.fontWeight(FontWeight.Bold);
            Button.onClick(() => { this.filterAirports(); this.currentPage = 3; });
            Button.margin({ bottom: 50 });
        }, Button);
        Button.pop();
        Column.pop();
    }
    RoutePickerView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.Bottom });
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Web.create({ src: '', controller: this.webController });
            Web.width('100%');
            Web.height('100%');
            Web.javaScriptAccess(true);
            Web.domStorageAccess(true);
            Web.onControllerAttached(() => { this.webController.loadData(this.generateMapHtml(), "text/html", "UTF-8", "https://webapi.amap.com", "https://webapi.amap.com"); });
        }, Web);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('60%');
            Column.backgroundColor('rgba(15, 32, 39, 0.85)');
            Column.backdropBlur(30);
            Column.borderRadius({ topLeft: 35, topRight: 35 });
            Column.border({ width: 1, color: 'rgba(255,255,255,0.2)' });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(20);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('← 返回');
            Button.height(40);
            Button.backgroundColor('rgba(255,255,255,0.2)');
            Button.fontColor('#FFF');
            Button.onClick(() => this.currentPage = 2);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('第3步：选择目的地');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.margin({ left: 15 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 12 });
            List.layoutWeight(1);
            List.width('92%');
            List.margin({ bottom: 20 });
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const apt = _item;
                {
                    const itemCreation = (elmtId, isInitialRender) => {
                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                        ListItem.create(deepRenderFunction, true);
                        if (!isInitialRender) {
                            ListItem.pop();
                        }
                        ViewStackProcessor.StopGetAccessRecording();
                    };
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        ListItem.create(deepRenderFunction, true);
                    };
                    const deepRenderFunction = (elmtId, isInitialRender) => {
                        itemCreation(elmtId, isInitialRender);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.width('100%');
                            Row.padding(18);
                            Row.backgroundColor('rgba(0,0,0,0.5)');
                            Row.borderRadius(15);
                            Row.border({ width: 1, color: 'rgba(255,255,255,0.2)' });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create({ space: 5 });
                            Column.alignItems(HorizontalAlign.Start);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`${apt.name} ${apt.iata}`);
                            Text.fontSize(18);
                            Text.fontWeight(FontWeight.Bold);
                            Text.fontColor('#FFF');
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`标准航程: ${apt.time} 分钟`);
                            Text.fontSize(14);
                            Text.fontColor('rgba(255,255,255,0.7)');
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Blank.create();
                        }, Blank);
                        Blank.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (apt.isPremium && !this.unlockedAirports.includes(apt.iata)) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('需要解锁');
                                        Text.fontColor('#FF5252');
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontSize(14);
                                    }, Text);
                                    Text.pop();
                                });
                            }
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('选择降落');
                                        Button.height(38);
                                        Button.backgroundColor('#00E5FF');
                                        Button.fontColor('#000');
                                        Button.onClick(() => { this.selectedAirport = apt; this.currentPage = 9; });
                                    }, Button);
                                    Button.pop();
                                });
                            }
                        }, If);
                        If.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.candidateAirports, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        List.pop();
        Column.pop();
        Stack.pop();
    }
    PlanePickerForFlightView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.height('100%');
        }, Column);
        this.StepHeader.bind(this)('最后一步：确认执飞机型', 3);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`航线: CAN ➔ ${this.selectedAirport?.iata} | 时长: ${this.selectedAirport?.time} 分钟`);
            Text.fontColor('#00E5FF');
            Text.width('90%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.ownedPlanes.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('机库暂无可用机型，请联系维修中心');
                        Text.fontColor('#FF5252');
                        Text.margin({ top: 50 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 15 });
                        List.layoutWeight(1);
                        List.width('92%');
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const p = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.width('100%');
                                        Row.padding(20);
                                        Row.backgroundColor('rgba(255, 255, 255, 0.12)');
                                        Row.backdropBlur(25);
                                        Row.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
                                        Row.borderRadius(20);
                                        Row.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Image.create(p.logoUrl);
                                        Image.width(50);
                                        Image.height(50);
                                        Image.objectFit(ImageFit.Contain);
                                        Image.backgroundColor('rgba(255,255,255,0.9)');
                                        Image.borderRadius(10);
                                        Image.padding(5);
                                        Image.margin({ right: 15 });
                                    }, Image);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.alignItems(HorizontalAlign.Start);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(p.model);
                                        Text.fontColor('#FFF');
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontSize(18);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`倍率: x${p.multiplier.toFixed(1)}`);
                                        Text.fontColor('#FFD700');
                                        Text.fontSize(14);
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Blank.create();
                                    }, Blank);
                                    Blank.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.alignItems(HorizontalAlign.End);
                                        Column.margin({ right: 15 });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('预期收益');
                                        Text.fontColor('rgba(255,255,255,0.6)');
                                        Text.fontSize(12);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`💰 ${Math.floor((this.selectedAirport?.time || 0) * p.multiplier)}`);
                                        Text.fontColor('#00E5FF');
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontSize(16);
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('派飞');
                                        Button.backgroundColor('#4CAF50');
                                        Button.onClick(() => this.confirmFlight(p));
                                    }, Button);
                                    Button.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, ALL_PLANES.filter(p => this.ownedPlanes.includes(p.model)), forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
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
    FlightListView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
        }, Column);
        this.StepHeader.bind(this)('航班调度表', 0);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.scheduleList.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无航班计划，请先前往规划航程');
                        Text.fontColor('rgba(255,255,255,0.6)');
                        Text.margin({ top: 100 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 18 });
                        List.layoutWeight(1);
                        List.alignListItem(ListItemAlign.Center);
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const item = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.alignItems(HorizontalAlign.Start);
                                        Column.padding(25);
                                        Column.width('92%');
                                        Column.backgroundColor('rgba(255, 255, 255, 0.12)');
                                        Column.backdropBlur(25);
                                        Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
                                        Column.borderRadius(20);
                                        Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.width('100%');
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`CAN ➔ ${item.destIata}`);
                                        Text.fontSize(22);
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontColor('#00E5FF');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Blank.create();
                                    }, Blank);
                                    Blank.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`机型: ${item.planeModel}`);
                                        Text.fontColor('#FFD700');
                                        Text.fontSize(14);
                                        Text.backgroundColor('rgba(255,215,0,0.2)');
                                        Text.padding(5);
                                        Text.borderRadius(5);
                                    }, Text);
                                    Text.pop();
                                    Row.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(item.taskType);
                                        Text.margin({ top: 10 });
                                        Text.fontColor('rgba(255,255,255,0.8)');
                                        Text.fontSize(16);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.width('100%');
                                        Row.margin({ top: 15 });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`收益预测: 💰${item.expectedProfit}`);
                                        Text.fontColor('#AAA');
                                        Text.fontSize(14);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Blank.create();
                                    }, Blank);
                                    Blank.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('取消');
                                        Button.height(38);
                                        Button.backgroundColor('rgba(255, 77, 79, 0.8)');
                                        Button.margin({ right: 10 });
                                        Button.onClick(() => this.deleteFlight(item.id));
                                    }, Button);
                                    Button.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('立刻起飞');
                                        Button.height(38);
                                        Button.backgroundColor('#4CAF50');
                                        Button.onClick(() => this.startFlight(item));
                                    }, Button);
                                    Button.pop();
                                    Row.pop();
                                    Column.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.scheduleList, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    deleteFlight(id: number) {
        this.scheduleList = this.scheduleList.filter(item => item.id !== id);
        this.saveAllData();
    }
    startFlight(item: ScheduleItem) {
        this.activeFlight = item;
        let durationMs = item.endTime.getTime() - item.startTime.getTime();
        if (durationMs <= 0)
            durationMs += 24 * 3600 * 1000;
        this.totalFlightSeconds = Math.floor(durationMs / 1000);
        this.remainingSeconds = this.totalFlightSeconds;
        this.currentPage = 5;
        this.currentAltitude = 0;
        this.currentSpeed = 0;
        if (this.timerId !== -1)
            clearInterval(this.timerId);
        this.timerId = setInterval(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
                let progress = 1 - (this.remainingSeconds / this.totalFlightSeconds);
                if (progress < 0.1) {
                    this.currentAltitude += 300;
                    this.currentSpeed += 80;
                }
                else if (progress > 0.9) {
                    this.currentAltitude -= 300;
                    this.currentSpeed -= 80;
                }
                else {
                    this.currentAltitude = 30000 + Math.floor(Math.random() * 500 - 250);
                    this.currentSpeed = 850 + Math.floor(Math.random() * 20 - 10);
                }
            }
            else {
                clearInterval(this.timerId);
                this.coinBalance += item.expectedProfit;
                let mins = Math.floor(this.totalFlightSeconds / 60);
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
    FlyingView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 8 });
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.activeFlight.taskType);
            Text.fontSize(16);
            Text.fontColor('rgba(255,255,255,0.5)');
            Text.margin({ top: 60 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 15 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('CAN');
            Text.fontSize(36);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('✈');
            Text.fontSize(24);
            Text.fontColor('rgba(255,255,255,0.4)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.activeFlight.destIata);
            Text.fontSize(36);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.activeFlight.planeModel);
            Text.fontSize(14);
            Text.fontColor('#FFF');
            Text.backgroundColor('rgba(255,255,255,0.1)');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.borderRadius(10);
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.width('100%');
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('85%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Departure');
            Text.fontSize(12);
            Text.fontColor('rgba(255,255,255,0.5)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Arrival');
            Text.fontSize(12);
            Text.fontColor('rgba(255,255,255,0.5)');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create({ alignContent: Alignment.Start });
            Stack.width('85%');
            Stack.height(30);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.width('100%');
            Divider.color('rgba(255,255,255,0.2)');
            Divider.strokeWidth(4);
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.width(`${((this.totalFlightSeconds - this.remainingSeconds) / this.totalFlightSeconds) * 100}%`);
            Divider.color('#00E5FF');
            Divider.strokeWidth(4);
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('✈️');
            Text.fontSize(20);
            Text.margin({ left: `calc(${((this.totalFlightSeconds - this.remainingSeconds) / this.totalFlightSeconds) * 100}% - 10px)` });
            Text.offset({ y: -12 });
        }, Text);
        Text.pop();
        Stack.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Circle.create({ width: 260, height: 260 });
            Circle.fill('transparent');
            Circle.stroke('rgba(255,255,255,0.05)');
            Circle.strokeWidth(1);
        }, Circle);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 5 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.formatRemainingTime());
            Text.fontSize(55);
            Text.fontWeight(FontWeight.Regular);
            Text.fontColor('#FFF');
            Text.fontFeature('"tnum" 1');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('REMAINING TIME');
            Text.fontSize(12);
            Text.fontColor('rgba(255,255,255,0.3)');
            Text.letterSpacing(2);
        }, Text);
        Text.pop();
        Column.pop();
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('80%');
            Row.margin({ top: 40 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Center);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('ALTITUDE');
            Text.fontSize(10);
            Text.fontColor('rgba(255,255,255,0.4)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${Math.max(0, this.currentAltitude)} FT`);
            Text.fontSize(18);
            Text.fontColor('#FFF');
            Text.fontFeature('"tnum" 1');
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.vertical(true);
            Divider.height(30);
            Divider.color('rgba(255,255,255,0.1)');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Center);
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('SPEED');
            Text.fontSize(10);
            Text.fontColor('rgba(255,255,255,0.4)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${Math.max(0, this.currentSpeed)} KTS`);
            Text.fontSize(18);
            Text.fontColor('#FFF');
            Text.fontFeature('"tnum" 1');
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('紧急迫降 (中止且无收益)');
            Button.width('80%');
            Button.height(60);
            Button.backgroundColor('rgba(255, 77, 79, 0.15)');
            Button.border({ width: 1, color: 'rgba(255, 77, 79, 0.3)' });
            Button.borderRadius(30);
            Button.fontColor('#FF4D4F');
            Button.margin({ bottom: 50 });
            Button.onClick(() => { clearInterval(this.timerId); this.currentPage = 4; });
        }, Button);
        Button.pop();
        Column.pop();
    }
    ShopView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(25);
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('←');
            Button.width(45);
            Button.height(45);
            Button.backgroundColor('rgba(255,255,255,0.15)');
            Button.fontColor('#FFF');
            Button.borderRadius(12);
            Button.onClick(() => this.currentPage = 0);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('航空商店');
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.margin({ left: 15 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`💰 ${this.coinBalance}`);
            Text.fontColor('#FFD700');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 20 });
            List.layoutWeight(1);
            List.width('100%');
            List.alignListItem(ListItemAlign.Center);
        }, List);
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('🛬 繁忙枢纽解锁');
                    Text.fontSize(20);
                    Text.fontWeight(FontWeight.Bold);
                    Text.fontColor('#FFF');
                    Text.margin({ left: 15 });
                }, Text);
                Text.pop();
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            ListItem.pop();
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const apt = _item;
                {
                    const itemCreation = (elmtId, isInitialRender) => {
                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                        ListItem.create(deepRenderFunction, true);
                        if (!isInitialRender) {
                            ListItem.pop();
                        }
                        ViewStackProcessor.StopGetAccessRecording();
                    };
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        ListItem.create(deepRenderFunction, true);
                    };
                    const deepRenderFunction = (elmtId, isInitialRender) => {
                        itemCreation(elmtId, isInitialRender);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.width('92%');
                            Row.padding(20);
                            Row.backgroundColor('rgba(255, 255, 255, 0.12)');
                            Row.backdropBlur(25);
                            Row.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
                            Row.borderRadius(20);
                            Row.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`${apt.name} (${apt.iata})`);
                            Text.layoutWeight(1);
                            Text.fontColor('#FFF');
                            Text.fontSize(16);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Button.createWithLabel(this.unlockedAirports.includes(apt.iata) ? '已拥有' : '💰 500');
                            Button.backgroundColor(this.unlockedAirports.includes(apt.iata) ? 'rgba(255,255,255,0.2)' : '#00E5FF');
                            Button.fontColor(this.unlockedAirports.includes(apt.iata) ? '#CCC' : '#000');
                            Button.enabled(!this.unlockedAirports.includes(apt.iata));
                            Button.onClick(() => {
                                this.targetPurchaseName = `${apt.name} (${apt.iata})`;
                                this.targetPurchasePrice = 500;
                                this.targetPurchaseType = 'airport';
                                this.targetPurchaseId = apt.iata;
                                this.currentPage = 8;
                            });
                        }, Button);
                        Button.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, ALL_AIRPORTS.filter(a => a.isPremium), forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('✈️ 机队扩建目录');
                    Text.fontSize(20);
                    Text.fontWeight(FontWeight.Bold);
                    Text.fontColor('#FFF');
                    Text.margin({ left: 15, top: 20 });
                }, Text);
                Text.pop();
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            ListItem.pop();
        }
        this.ShopGroup.bind(this)('中国商飞 COMAC', 'COMAC');
        this.ShopGroup.bind(this)('波音 Boeing', 'Boeing');
        this.ShopGroup.bind(this)('空客 Airbus', 'Airbus');
        List.pop();
        Column.pop();
    }
    ShopGroup(title: string, brand: string, parent = null) {
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                ListItem.create(deepRenderFunction, true);
                if (!isInitialRender) {
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true);
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(title);
                    Text.fontColor('rgba(255,255,255,0.6)');
                    Text.margin({ left: 10, bottom: 10, top: 10 });
                    Text.width('100%');
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    ForEach.create();
                    const forEachItemGenFunction = _item => {
                        const p = _item;
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create({ space: 15 });
                            Row.width('92%');
                            Row.padding(18);
                            Row.margin({ bottom: 12 });
                            Row.backgroundColor('rgba(255, 255, 255, 0.12)');
                            Row.backdropBlur(25);
                            Row.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
                            Row.borderRadius(20);
                            Row.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
                            Row.linearGradient({ direction: GradientDirection.Right, colors: [[p.gradient[0], 0.0], [p.gradient[1], 1.0]] });
                            Row.onClick(() => {
                                this.introDialog = new CustomDialogController({
                                    builder: () => {
                                        let jsDialog = new PlaneIntroDialog(this, {
                                            plane: p,
                                            isOwned: this.ownedPlanes.includes(p.model),
                                            onBuy: (buyPlane: Plane) => {
                                                this.targetPurchaseName = buyPlane.model;
                                                this.targetPurchasePrice = buyPlane.price;
                                                this.targetPurchaseType = 'plane';
                                                this.targetPurchaseId = buyPlane.model;
                                                this.currentPage = 8;
                                            }
                                        }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/FlightConcentrator.ets", line: 904, col: 24 });
                                        jsDialog.setController(this.introDialog);
                                        ViewPU.create(jsDialog);
                                        let paramsLambda = () => {
                                            return {
                                                plane: p,
                                                isOwned: this.ownedPlanes.includes(p.model),
                                                onBuy: (buyPlane: Plane) => {
                                                    this.targetPurchaseName = buyPlane.model;
                                                    this.targetPurchasePrice = buyPlane.price;
                                                    this.targetPurchaseType = 'plane';
                                                    this.targetPurchaseId = buyPlane.model;
                                                    this.currentPage = 8;
                                                }
                                            };
                                        };
                                        jsDialog.paramsGenerator_ = paramsLambda;
                                    },
                                    customStyle: true,
                                    autoCancel: true
                                }, this);
                                this.introDialog.open();
                            });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Image.create(p.logoUrl);
                            Image.width(80);
                            Image.height(45);
                            Image.objectFit(ImageFit.Contain);
                            Image.backgroundColor('rgba(255,255,255,0.9)');
                            Image.borderRadius(10);
                            Image.padding(5);
                        }, Image);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Blank.create();
                        }, Blank);
                        Blank.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.alignItems(HorizontalAlign.End);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(p.model);
                            Text.fontColor('#FFF');
                            Text.fontWeight(FontWeight.Bold);
                            Text.fontSize(20);
                            Text.textAlign(TextAlign.End);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (this.ownedPlanes.includes(p.model)) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('✓ 已在库');
                                        Text.fontSize(12);
                                        Text.fontColor('#4CAF50');
                                        Text.margin({ top: 4 });
                                    }, Text);
                                    Text.pop();
                                });
                            }
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`💰 ${p.price}`);
                                        Text.fontSize(14);
                                        Text.fontColor('#FFD700');
                                        Text.margin({ top: 4 });
                                    }, Text);
                                    Text.pop();
                                });
                            }
                        }, If);
                        If.pop();
                        Column.pop();
                        Row.pop();
                    };
                    this.forEachUpdateFunction(elmtId, ALL_PLANES.filter(p => p.brand === brand), forEachItemGenFunction);
                }, ForEach);
                ForEach.pop();
                Column.pop();
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            ListItem.pop();
        }
    }
    SettlementView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.StepHeader.bind(this)('订单结算中心', 7);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 25 });
            Column.width('90%');
            Column.padding(30);
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('购买项目');
            Text.fontColor('rgba(255,255,255,0.8)');
            Text.fontSize(18);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.targetPurchaseName);
            Text.fontWeight(FontWeight.Bold);
            Text.fontSize(20);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('所需资金');
            Text.fontColor('rgba(255,255,255,0.8)');
            Text.fontSize(18);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.targetPurchasePrice} 币`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontSize(20);
            Text.fontColor('#FF5252');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('rgba(255,255,255,0.3)');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('当前余额');
            Text.fontColor('rgba(255,255,255,0.8)');
            Text.fontSize(18);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.coinBalance} 币`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontSize(20);
            Text.fontColor('#FFD700');
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.coinBalance < this.targetPurchasePrice) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('⚠️ 余额不足，请先执飞赚取资金');
                        Text.fontColor('#FF5252');
                        Text.fontSize(16);
                        Text.margin({ top: 30 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 20 });
            Row.padding({ bottom: 50 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.width('40%');
            Button.height(65);
            Button.backgroundColor('rgba(255,255,255,0.2)');
            Button.fontColor('#FFF');
            Button.borderRadius(20);
            Button.onClick(() => this.currentPage = 7);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('确认支付');
            Button.width('40%');
            Button.height(65);
            Button.backgroundColor(this.coinBalance >= this.targetPurchasePrice ? '#00E5FF' : 'rgba(255,255,255,0.1)');
            Button.fontColor(this.coinBalance >= this.targetPurchasePrice ? '#000' : 'rgba(255,255,255,0.4)');
            Button.enabled(this.coinBalance >= this.targetPurchasePrice);
            Button.borderRadius(20);
            Button.onClick(() => {
                if (this.coinBalance >= this.targetPurchasePrice) {
                    this.coinBalance -= this.targetPurchasePrice;
                    if (this.targetPurchaseType === 'airport') {
                        this.unlockedAirports.push(this.targetPurchaseId);
                    }
                    else {
                        this.ownedPlanes.push(this.targetPurchaseId);
                    }
                    this.saveAllData();
                    this.currentPage = 7;
                }
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    ProfileView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 25 });
            Column.height('100%');
        }, Column);
        this.StepHeader.bind(this)('系统简报', 0);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.width('90%');
            Column.padding(30);
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('总飞行专注');
            Text.fontColor('rgba(255,255,255,0.6)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.totalFocusMinutes} 分钟`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('通航覆盖率');
            Text.fontColor('rgba(255,255,255,0.6)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.unlockedRoutes.length} 条航线`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('机队总规模');
            Text.fontColor('rgba(255,255,255,0.6)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.ownedPlanes.length} 架飞机`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('总部基建');
            Text.fontColor('rgba(255,255,255,0.6)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`Lv.${this.airportLevel}`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('飞行足迹');
            Text.width('90%');
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('rgba(255,255,255,0.5)');
            Text.fontSize(14);
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ wrap: FlexWrap.Wrap });
            Flex.width('90%');
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const iata = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(iata);
                    Text.padding({ left: 15, right: 15, top: 8, bottom: 8 });
                    Text.margin(6);
                    Text.backgroundColor('rgba(0, 229, 255, 0.1)');
                    Text.fontColor('#00E5FF');
                    Text.border({ width: 1, color: 'rgba(0, 229, 255, 0.5)' });
                    Text.borderRadius(16);
                    Text.fontSize(14);
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, this.unlockedRoutes, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Flex.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
            Column.width('100%');
            Column.margin({ bottom: 40 });
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('危险操作');
            Text.fontColor('rgba(255, 77, 79, 0.8)');
            Text.fontSize(12);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('破产清算 (注销并重置所有数据)');
            Button.width('90%');
            Button.height(60);
            Button.backgroundColor('rgba(255, 77, 79, 0.15)');
            Button.border({ width: 1, color: 'rgba(255, 77, 79, 0.3)' });
            Button.borderRadius(30);
            Button.fontColor('#FF4D4F');
            Button.onClick(() => {
                this.resetSystem();
            });
        }, Button);
        Button.pop();
        Column.pop();
        Column.pop();
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
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "FlightConcentrator";
    }
}
registerNamedRoute(() => new FlightConcentrator(undefined, {}), "", { bundleName: "com.example.class1", moduleName: "entry", pagePath: "pages/FlightConcentrator", pageFullPath: "entry/src/main/ets/pages/FlightConcentrator", integratedHsp: "false", moduleType: "followWithHap" });
