if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface FlightConcentrator_Params {
    currentPage?: number;
    curBp?: string;
    authMode?: 'login' | 'register' | 'entry';
    flightHistory?: FlightRecord[];
    sysUsername?: string;
    sysPassword?: string;
    airlineName?: string;
    airlineCode?: string;
    myUid?: string;
    formUser?: string;
    formPwd?: string;
    formAirName?: string;
    formAirCode?: string;
    authErrorMsg?: string;
    friendsList?: Friend[];
    friendUidInput?: string;
    friendAddMsg?: string;
    currentAirport?: string;
    currentAirportName?: string;
    currentAirportLng?: number;
    currentAirportLat?: number;
    coFlightSessions?: CoFlightSession[];
    activeCoFlight?: CoFlightSession | null;
    coFlightTaskInput?: string;
    coFlightJoinMsg?: string;
    coFlightCreateMsg?: string;
    isCreatingCoFlight?: boolean;
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
    coFlightOriginAirport?: Airport | null;
    coFlightDestAirport?: Airport | null;
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
    coFlightFriendDialog?: CustomDialogController | null;
    coFlightPlaneDialog?: CustomDialogController | null;
    coFlightOriginDialog?: CustomDialogController | null;
    coFlightDestDialog?: CustomDialogController | null;
    memCache?: MemCache;
    distObject?: distributedDataObject.DataObject | null;
    distSessionId?: string;
    isDistSyncReady?: boolean;
    remoteDeviceOnline?: boolean;
    focusSettlementData?: FocusSettlementData | null;
    highlightedAirportIata?: string;
}
interface AirportSelectDialog_Params {
    controller?: CustomDialogController;
    airports?: Airport[];
    title?: string;
    onConfirm?: (airport: Airport) => void;
    selectedAirport?: Airport | null;
}
interface PlaneSelectForCoFlightDialog_Params {
    controller?: CustomDialogController;
    ownedPlanes?: string[];
    onConfirm?: (planeModel: string) => void;
    selectedPlane?: string;
}
interface FriendSelectDialog_Params {
    controller?: CustomDialogController;
    friends?: Friend[];
    onConfirm?: (selectedUids: string[]) => void;
    selectedSet?: Set<string>;
}
interface PlaneIntroDialog_Params {
    controller?: CustomDialogController;
    plane?: Plane;
    isOwned?: boolean;
    onBuy?: (plane: Plane) => void;
}
import preferences from "@ohos:data.preferences";
import distributedDataObject from "@ohos:data.distributedDataObject";
import type common from "@ohos:app.ability.common";
import webview from "@ohos:web.webview";
import util from "@ohos:util";
import type { BusinessError } from "@ohos:base";
import pasteboard from "@ohos:pasteboard";
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
function generateUID(): string {
    // 使用时间戳+随机数确保全局唯一，避免碰撞
    let timestamp = Date.now().toString(36).slice(-6);
    let hex = '0123456789ABCDEF';
    let uid = 'U' + timestamp;
    for (let i = 0; i < 6; i++)
        uid += hex[Math.floor(Math.random() * 16)];
    return uid;
}
function generateCoFlightNumber(): string {
    let cs = 'CS';
    for (let i = 0; i < 4; i++)
        cs += Math.floor(Math.random() * 10).toString();
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
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private plane: Plane;
    private isOwned: boolean;
    private onBuy: (plane: Plane) => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.width('100%');
            Column.height('100%');
            Column.linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] });
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
            Text.fontColor('#000');
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
            Button.onClick(() => { this.controller?.close(); });
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
                this.controller?.close();
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
class FriendSelectDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.friends = [];
        this.onConfirm = () => { };
        this.__selectedSet = new ObservedPropertyObjectPU(new Set(), this, "selectedSet");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: FriendSelectDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.friends !== undefined) {
            this.friends = params.friends;
        }
        if (params.onConfirm !== undefined) {
            this.onConfirm = params.onConfirm;
        }
        if (params.selectedSet !== undefined) {
            this.selectedSet = params.selectedSet;
        }
    }
    updateStateVars(params: FriendSelectDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__selectedSet.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__selectedSet.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private friends: Friend[];
    private onConfirm: (selectedUids: string[]) => void;
    private __selectedSet: ObservedPropertyObjectPU<Set<string>>;
    get selectedSet() {
        return this.__selectedSet.get();
    }
    set selectedSet(newValue: Set<string>) {
        this.__selectedSet.set(newValue);
    }
    aboutToAppear() {
        this.selectedSet = new Set();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.width('100%');
            Column.height('100%');
            Column.linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] });
            Column.padding(25);
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('选择好友创建共享航班');
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.friends.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无好友，请先在好友系统中添加');
                        Text.fontColor('rgba(255,255,255,0.5)');
                        Text.fontSize(14);
                        Text.margin({ top: 20, bottom: 20 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 10 });
                        List.height(250);
                        List.width('100%');
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const friend = _item;
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
                                        Row.padding(12);
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Checkbox.create({ name: friend.uid, group: 'friendSelect' });
                                        Checkbox.onChange((value: boolean) => {
                                            if (value) {
                                                this.selectedSet.add(friend.uid);
                                            }
                                            else {
                                                this.selectedSet.delete(friend.uid);
                                            }
                                        });
                                    }, Checkbox);
                                    Checkbox.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create({ space: 2 });
                                        Column.alignItems(HorizontalAlign.Start);
                                        Column.margin({ left: 12 });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(friend.airlineName);
                                        Text.fontSize(16);
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontColor('#FFF');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(friend.uid);
                                        Text.fontSize(12);
                                        Text.fontColor('rgba(255,255,255,0.5)');
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.friends, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
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
            Button.onClick(() => { this.controller?.close(); });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('确认');
            Button.layoutWeight(1);
            Button.height(50);
            Button.backgroundColor('#00E5FF');
            Button.fontColor('#000');
            Button.enabled(this.selectedSet.size > 0);
            Button.onClick(() => {
                this.onConfirm(Array.from(ObservedObject.GetRawObject(this.selectedSet)));
                this.controller?.close();
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
class PlaneSelectForCoFlightDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.ownedPlanes = [];
        this.onConfirm = () => { };
        this.__selectedPlane = new ObservedPropertySimplePU('', this, "selectedPlane");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PlaneSelectForCoFlightDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.ownedPlanes !== undefined) {
            this.ownedPlanes = params.ownedPlanes;
        }
        if (params.onConfirm !== undefined) {
            this.onConfirm = params.onConfirm;
        }
        if (params.selectedPlane !== undefined) {
            this.selectedPlane = params.selectedPlane;
        }
    }
    updateStateVars(params: PlaneSelectForCoFlightDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__selectedPlane.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__selectedPlane.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private ownedPlanes: string[];
    private onConfirm: (planeModel: string) => void;
    private __selectedPlane: ObservedPropertySimplePU<string>;
    get selectedPlane() {
        return this.__selectedPlane.get();
    }
    set selectedPlane(newValue: string) {
        this.__selectedPlane.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.width('100%');
            Column.height('100%');
            Column.linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] });
            Column.padding(25);
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('选择本次共享航班使用的飞机');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('仅能从你的个人机队中选择');
            Text.fontSize(13);
            Text.fontColor('rgba(255,255,255,0.5)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 10 });
            List.height(250);
            List.width('100%');
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const model = _item;
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
                            Row.padding(12);
                            Row.backgroundColor(this.selectedPlane === model ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.06)');
                            Row.borderRadius(12);
                            Row.onClick(() => { this.selectedPlane = model; });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Radio.create({ value: model, group: 'planeSelect' });
                            Radio.onChange((checked: boolean) => {
                                if (checked) {
                                    this.selectedPlane = model;
                                }
                            });
                        }, Radio);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(model);
                            Text.fontSize(16);
                            Text.fontColor('#FFF');
                            Text.margin({ left: 12 });
                        }, Text);
                        Text.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.ownedPlanes, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        List.pop();
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
            Button.onClick(() => { this.controller?.close(); });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('确认');
            Button.layoutWeight(1);
            Button.height(50);
            Button.backgroundColor('#00E5FF');
            Button.fontColor('#000');
            Button.enabled(this.selectedPlane !== '');
            Button.onClick(() => {
                this.onConfirm(this.selectedPlane);
                this.controller?.close();
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
class AirportSelectDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.airports = [];
        this.title = '选择机场';
        this.onConfirm = () => { };
        this.__selectedAirport = new ObservedPropertyObjectPU(null, this, "selectedAirport");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: AirportSelectDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.airports !== undefined) {
            this.airports = params.airports;
        }
        if (params.title !== undefined) {
            this.title = params.title;
        }
        if (params.onConfirm !== undefined) {
            this.onConfirm = params.onConfirm;
        }
        if (params.selectedAirport !== undefined) {
            this.selectedAirport = params.selectedAirport;
        }
    }
    updateStateVars(params: AirportSelectDialog_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__selectedAirport.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__selectedAirport.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private controller?: CustomDialogController;
    setController(ctr: CustomDialogController) {
        this.controller = ctr;
    }
    private airports: Airport[];
    private title: string;
    private onConfirm: (airport: Airport) => void;
    private __selectedAirport: ObservedPropertyObjectPU<Airport | null>;
    get selectedAirport() {
        return this.__selectedAirport.get();
    }
    set selectedAirport(newValue: Airport | null) {
        this.__selectedAirport.set(newValue);
    }
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
            Text.create(this.title);
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 10 });
            List.height(300);
            List.width('100%');
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
                            Row.padding(12);
                            Row.backgroundColor(this.selectedAirport?.iata === apt.iata ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.06)');
                            Row.borderRadius(12);
                            Row.onClick(() => { this.selectedAirport = apt; });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Radio.create({ value: apt.iata, group: 'airportSelect' });
                            Radio.onChange((checked: boolean) => {
                                if (checked) {
                                    this.selectedAirport = apt;
                                }
                            });
                        }, Radio);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create({ space: 2 });
                            Column.margin({ left: 12 });
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`${apt.name} (${apt.iata})`);
                            Text.fontSize(16);
                            Text.fontWeight(FontWeight.Bold);
                            Text.fontColor('#FFF');
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`标准航程: ${apt.time} 分钟`);
                            Text.fontSize(12);
                            Text.fontColor('rgba(255,255,255,0.6)');
                        }, Text);
                        Text.pop();
                        Column.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.airports, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        List.pop();
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
            Button.onClick(() => { this.controller?.close(); });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('确认');
            Button.layoutWeight(1);
            Button.height(50);
            Button.backgroundColor('#00E5FF');
            Button.fontColor('#000');
            Button.enabled(this.selectedAirport !== null);
            Button.onClick(() => {
                if (this.selectedAirport) {
                    this.onConfirm(ObservedObject.GetRawObject(this.selectedAirport));
                    this.controller?.close();
                }
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
        this.__curBp = this.createStorageProp('currentBreakpoint', 'sm', "curBp");
        this.__authMode = new ObservedPropertySimplePU('entry', this, "authMode");
        this.__flightHistory = new ObservedPropertyObjectPU([], this, "flightHistory");
        this.__sysUsername = new ObservedPropertySimplePU('', this, "sysUsername");
        this.__sysPassword = new ObservedPropertySimplePU('', this, "sysPassword");
        this.__airlineName = new ObservedPropertySimplePU('', this, "airlineName");
        this.__airlineCode = new ObservedPropertySimplePU('', this, "airlineCode");
        this.__myUid = new ObservedPropertySimplePU('', this, "myUid");
        this.__formUser = new ObservedPropertySimplePU('', this, "formUser");
        this.__formPwd = new ObservedPropertySimplePU('', this, "formPwd");
        this.__formAirName = new ObservedPropertySimplePU('', this, "formAirName");
        this.__formAirCode = new ObservedPropertySimplePU('', this, "formAirCode");
        this.__authErrorMsg = new ObservedPropertySimplePU('', this, "authErrorMsg");
        this.__friendsList = new ObservedPropertyObjectPU([], this, "friendsList");
        this.__friendUidInput = new ObservedPropertySimplePU('', this, "friendUidInput");
        this.__friendAddMsg = new ObservedPropertySimplePU('', this, "friendAddMsg");
        this.__currentAirport = new ObservedPropertySimplePU('CAN', this, "currentAirport");
        this.__currentAirportName = new ObservedPropertySimplePU('广州白云', this, "currentAirportName");
        this.__currentAirportLng = new ObservedPropertySimplePU(113.29, this, "currentAirportLng");
        this.__currentAirportLat = new ObservedPropertySimplePU(23.39, this, "currentAirportLat");
        this.__coFlightSessions = new ObservedPropertyObjectPU([], this, "coFlightSessions");
        this.__activeCoFlight = new ObservedPropertyObjectPU(null, this, "activeCoFlight");
        this.__coFlightTaskInput = new ObservedPropertySimplePU('', this, "coFlightTaskInput");
        this.__coFlightJoinMsg = new ObservedPropertySimplePU('', this, "coFlightJoinMsg");
        this.__coFlightCreateMsg = new ObservedPropertySimplePU('', this, "coFlightCreateMsg");
        this.__isCreatingCoFlight = new ObservedPropertySimplePU(false, this, "isCreatingCoFlight");
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
        this.__coFlightOriginAirport = new ObservedPropertyObjectPU(null, this, "coFlightOriginAirport");
        this.__coFlightDestAirport = new ObservedPropertyObjectPU(null, this, "coFlightDestAirport");
        this.__targetPurchaseName = new ObservedPropertySimplePU('', this, "targetPurchaseName");
        this.__targetPurchasePrice = new ObservedPropertySimplePU(0, this, "targetPurchasePrice");
        this.__targetPurchaseType = new ObservedPropertySimplePU('airport', this, "targetPurchaseType");
        this.__targetPurchaseId = new ObservedPropertySimplePU('', this, "targetPurchaseId");
        this.__activeFlight = new ObservedPropertyObjectPU({ id: 0, taskType: '', startTime: new Date(), endTime: new Date(), originIata: '', originName: '', destIata: '', destName: '', planeModel: '', expectedProfit: 0, isCoFlight: false, coFlightId: '' }, this, "activeFlight");
        this.__remainingSeconds = new ObservedPropertySimplePU(0, this, "remainingSeconds");
        this.__totalFlightSeconds = new ObservedPropertySimplePU(1, this, "totalFlightSeconds");
        this.__currentAltitude = new ObservedPropertySimplePU(0, this, "currentAltitude");
        this.__currentSpeed = new ObservedPropertySimplePU(0, this, "currentSpeed");
        this.timerId = -1;
        this.webController = new webview.WebviewController();
        this.context = getContext(this) as common.UIAbilityContext;
        this.pref = preferences.getPreferencesSync(this.context, { name: 'aviation_pro_prefs' });
        this.introDialog = null;
        this.coFlightFriendDialog = null;
        this.coFlightPlaneDialog = null;
        this.coFlightOriginDialog = null;
        this.coFlightDestDialog = null;
        this.memCache = MemCache.getInstance();
        this.distObject = null;
        this.distSessionId = 'aviation_sync_session';
        this.isDistSyncReady = false;
        this.__remoteDeviceOnline = new ObservedPropertySimplePU(false, this, "remoteDeviceOnline");
        this.__focusSettlementData = new ObservedPropertyObjectPU(null, this, "focusSettlementData");
        this.__highlightedAirportIata = new ObservedPropertySimplePU('', this, "highlightedAirportIata");
        this.setInitiallyProvidedValue(params);
        this.declareWatch("currentPage", this.onPageChange);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: FlightConcentrator_Params) {
        if (params.currentPage !== undefined) {
            this.currentPage = params.currentPage;
        }
        if (params.authMode !== undefined) {
            this.authMode = params.authMode;
        }
        if (params.flightHistory !== undefined) {
            this.flightHistory = params.flightHistory;
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
        if (params.myUid !== undefined) {
            this.myUid = params.myUid;
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
        if (params.friendsList !== undefined) {
            this.friendsList = params.friendsList;
        }
        if (params.friendUidInput !== undefined) {
            this.friendUidInput = params.friendUidInput;
        }
        if (params.friendAddMsg !== undefined) {
            this.friendAddMsg = params.friendAddMsg;
        }
        if (params.currentAirport !== undefined) {
            this.currentAirport = params.currentAirport;
        }
        if (params.currentAirportName !== undefined) {
            this.currentAirportName = params.currentAirportName;
        }
        if (params.currentAirportLng !== undefined) {
            this.currentAirportLng = params.currentAirportLng;
        }
        if (params.currentAirportLat !== undefined) {
            this.currentAirportLat = params.currentAirportLat;
        }
        if (params.coFlightSessions !== undefined) {
            this.coFlightSessions = params.coFlightSessions;
        }
        if (params.activeCoFlight !== undefined) {
            this.activeCoFlight = params.activeCoFlight;
        }
        if (params.coFlightTaskInput !== undefined) {
            this.coFlightTaskInput = params.coFlightTaskInput;
        }
        if (params.coFlightJoinMsg !== undefined) {
            this.coFlightJoinMsg = params.coFlightJoinMsg;
        }
        if (params.coFlightCreateMsg !== undefined) {
            this.coFlightCreateMsg = params.coFlightCreateMsg;
        }
        if (params.isCreatingCoFlight !== undefined) {
            this.isCreatingCoFlight = params.isCreatingCoFlight;
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
        if (params.coFlightOriginAirport !== undefined) {
            this.coFlightOriginAirport = params.coFlightOriginAirport;
        }
        if (params.coFlightDestAirport !== undefined) {
            this.coFlightDestAirport = params.coFlightDestAirport;
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
        if (params.coFlightFriendDialog !== undefined) {
            this.coFlightFriendDialog = params.coFlightFriendDialog;
        }
        if (params.coFlightPlaneDialog !== undefined) {
            this.coFlightPlaneDialog = params.coFlightPlaneDialog;
        }
        if (params.coFlightOriginDialog !== undefined) {
            this.coFlightOriginDialog = params.coFlightOriginDialog;
        }
        if (params.coFlightDestDialog !== undefined) {
            this.coFlightDestDialog = params.coFlightDestDialog;
        }
        if (params.memCache !== undefined) {
            this.memCache = params.memCache;
        }
        if (params.distObject !== undefined) {
            this.distObject = params.distObject;
        }
        if (params.distSessionId !== undefined) {
            this.distSessionId = params.distSessionId;
        }
        if (params.isDistSyncReady !== undefined) {
            this.isDistSyncReady = params.isDistSyncReady;
        }
        if (params.remoteDeviceOnline !== undefined) {
            this.remoteDeviceOnline = params.remoteDeviceOnline;
        }
        if (params.focusSettlementData !== undefined) {
            this.focusSettlementData = params.focusSettlementData;
        }
        if (params.highlightedAirportIata !== undefined) {
            this.highlightedAirportIata = params.highlightedAirportIata;
        }
    }
    updateStateVars(params: FlightConcentrator_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__curBp.purgeDependencyOnElmtId(rmElmtId);
        this.__authMode.purgeDependencyOnElmtId(rmElmtId);
        this.__flightHistory.purgeDependencyOnElmtId(rmElmtId);
        this.__sysUsername.purgeDependencyOnElmtId(rmElmtId);
        this.__sysPassword.purgeDependencyOnElmtId(rmElmtId);
        this.__airlineName.purgeDependencyOnElmtId(rmElmtId);
        this.__airlineCode.purgeDependencyOnElmtId(rmElmtId);
        this.__myUid.purgeDependencyOnElmtId(rmElmtId);
        this.__formUser.purgeDependencyOnElmtId(rmElmtId);
        this.__formPwd.purgeDependencyOnElmtId(rmElmtId);
        this.__formAirName.purgeDependencyOnElmtId(rmElmtId);
        this.__formAirCode.purgeDependencyOnElmtId(rmElmtId);
        this.__authErrorMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__friendsList.purgeDependencyOnElmtId(rmElmtId);
        this.__friendUidInput.purgeDependencyOnElmtId(rmElmtId);
        this.__friendAddMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__currentAirport.purgeDependencyOnElmtId(rmElmtId);
        this.__currentAirportName.purgeDependencyOnElmtId(rmElmtId);
        this.__currentAirportLng.purgeDependencyOnElmtId(rmElmtId);
        this.__currentAirportLat.purgeDependencyOnElmtId(rmElmtId);
        this.__coFlightSessions.purgeDependencyOnElmtId(rmElmtId);
        this.__activeCoFlight.purgeDependencyOnElmtId(rmElmtId);
        this.__coFlightTaskInput.purgeDependencyOnElmtId(rmElmtId);
        this.__coFlightJoinMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__coFlightCreateMsg.purgeDependencyOnElmtId(rmElmtId);
        this.__isCreatingCoFlight.purgeDependencyOnElmtId(rmElmtId);
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
        this.__coFlightOriginAirport.purgeDependencyOnElmtId(rmElmtId);
        this.__coFlightDestAirport.purgeDependencyOnElmtId(rmElmtId);
        this.__targetPurchaseName.purgeDependencyOnElmtId(rmElmtId);
        this.__targetPurchasePrice.purgeDependencyOnElmtId(rmElmtId);
        this.__targetPurchaseType.purgeDependencyOnElmtId(rmElmtId);
        this.__targetPurchaseId.purgeDependencyOnElmtId(rmElmtId);
        this.__activeFlight.purgeDependencyOnElmtId(rmElmtId);
        this.__remainingSeconds.purgeDependencyOnElmtId(rmElmtId);
        this.__totalFlightSeconds.purgeDependencyOnElmtId(rmElmtId);
        this.__currentAltitude.purgeDependencyOnElmtId(rmElmtId);
        this.__currentSpeed.purgeDependencyOnElmtId(rmElmtId);
        this.__remoteDeviceOnline.purgeDependencyOnElmtId(rmElmtId);
        this.__focusSettlementData.purgeDependencyOnElmtId(rmElmtId);
        this.__highlightedAirportIata.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentPage.aboutToBeDeleted();
        this.__curBp.aboutToBeDeleted();
        this.__authMode.aboutToBeDeleted();
        this.__flightHistory.aboutToBeDeleted();
        this.__sysUsername.aboutToBeDeleted();
        this.__sysPassword.aboutToBeDeleted();
        this.__airlineName.aboutToBeDeleted();
        this.__airlineCode.aboutToBeDeleted();
        this.__myUid.aboutToBeDeleted();
        this.__formUser.aboutToBeDeleted();
        this.__formPwd.aboutToBeDeleted();
        this.__formAirName.aboutToBeDeleted();
        this.__formAirCode.aboutToBeDeleted();
        this.__authErrorMsg.aboutToBeDeleted();
        this.__friendsList.aboutToBeDeleted();
        this.__friendUidInput.aboutToBeDeleted();
        this.__friendAddMsg.aboutToBeDeleted();
        this.__currentAirport.aboutToBeDeleted();
        this.__currentAirportName.aboutToBeDeleted();
        this.__currentAirportLng.aboutToBeDeleted();
        this.__currentAirportLat.aboutToBeDeleted();
        this.__coFlightSessions.aboutToBeDeleted();
        this.__activeCoFlight.aboutToBeDeleted();
        this.__coFlightTaskInput.aboutToBeDeleted();
        this.__coFlightJoinMsg.aboutToBeDeleted();
        this.__coFlightCreateMsg.aboutToBeDeleted();
        this.__isCreatingCoFlight.aboutToBeDeleted();
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
        this.__coFlightOriginAirport.aboutToBeDeleted();
        this.__coFlightDestAirport.aboutToBeDeleted();
        this.__targetPurchaseName.aboutToBeDeleted();
        this.__targetPurchasePrice.aboutToBeDeleted();
        this.__targetPurchaseType.aboutToBeDeleted();
        this.__targetPurchaseId.aboutToBeDeleted();
        this.__activeFlight.aboutToBeDeleted();
        this.__remainingSeconds.aboutToBeDeleted();
        this.__totalFlightSeconds.aboutToBeDeleted();
        this.__currentAltitude.aboutToBeDeleted();
        this.__currentSpeed.aboutToBeDeleted();
        this.__remoteDeviceOnline.aboutToBeDeleted();
        this.__focusSettlementData.aboutToBeDeleted();
        this.__highlightedAirportIata.aboutToBeDeleted();
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
    // 新增回调函数：把当前页面同步到全局存储，供 EntryAbility 的 onContinue 读取
    onPageChange() {
        AppStorage.setOrCreate('currentActivePage', this.currentPage);
    }
    // 响应式断点：'sm'=手机/折叠态, 'md'=折叠展开/平板竖屏, 'lg'=平板横屏/三折叠G态, 'xl'=笔记本
    private __curBp: ObservedPropertyAbstractPU<string>;
    get curBp() {
        return this.__curBp.get();
    }
    set curBp(newValue: string) {
        this.__curBp.set(newValue);
    }
    // 认证状态控制：10-系统入口 (统一管理登录/注册)，0~9是业务页面
    private __authMode: ObservedPropertySimplePU<'login' | 'register' | 'entry'>;
    get authMode() {
        return this.__authMode.get();
    }
    set authMode(newValue: 'login' | 'register' | 'entry') {
        this.__authMode.set(newValue);
    }
    //飞行地图生成
    private __flightHistory: ObservedPropertyObjectPU<FlightRecord[]>;
    get flightHistory() {
        return this.__flightHistory.get();
    }
    set flightHistory(newValue: FlightRecord[]) {
        this.__flightHistory.set(newValue);
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
    private __myUid: ObservedPropertySimplePU<string>;
    get myUid() {
        return this.__myUid.get();
    }
    set myUid(newValue: string) {
        this.__myUid.set(newValue);
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
    // 好友系统
    private __friendsList: ObservedPropertyObjectPU<Friend[]>;
    get friendsList() {
        return this.__friendsList.get();
    }
    set friendsList(newValue: Friend[]) {
        this.__friendsList.set(newValue);
    }
    private __friendUidInput: ObservedPropertySimplePU<string>;
    get friendUidInput() {
        return this.__friendUidInput.get();
    }
    set friendUidInput(newValue: string) {
        this.__friendUidInput.set(newValue);
    }
    private __friendAddMsg: ObservedPropertySimplePU<string>;
    get friendAddMsg() {
        return this.__friendAddMsg.get();
    }
    set friendAddMsg(newValue: string) {
        this.__friendAddMsg.set(newValue);
    }
    // 到达机场连续性：记录上次执飞抵达的机场，绘制航线和结算
    private __currentAirport: ObservedPropertySimplePU<string>;
    get currentAirport() {
        return this.__currentAirport.get();
    }
    set currentAirport(newValue: string) {
        this.__currentAirport.set(newValue);
    }
    private __currentAirportName: ObservedPropertySimplePU<string>;
    get currentAirportName() {
        return this.__currentAirportName.get();
    }
    set currentAirportName(newValue: string) {
        this.__currentAirportName.set(newValue);
    }
    private __currentAirportLng: ObservedPropertySimplePU<number>;
    get currentAirportLng() {
        return this.__currentAirportLng.get();
    }
    set currentAirportLng(newValue: number) {
        this.__currentAirportLng.set(newValue);
    }
    private __currentAirportLat: ObservedPropertySimplePU<number>;
    get currentAirportLat() {
        return this.__currentAirportLat.get();
    }
    set currentAirportLat(newValue: number) {
        this.__currentAirportLat.set(newValue);
    }
    // 共享航班(Co-flight)
    private __coFlightSessions: ObservedPropertyObjectPU<CoFlightSession[]>;
    get coFlightSessions() {
        return this.__coFlightSessions.get();
    }
    set coFlightSessions(newValue: CoFlightSession[]) {
        this.__coFlightSessions.set(newValue);
    }
    private __activeCoFlight: ObservedPropertyObjectPU<CoFlightSession | null>;
    get activeCoFlight() {
        return this.__activeCoFlight.get();
    }
    set activeCoFlight(newValue: CoFlightSession | null) {
        this.__activeCoFlight.set(newValue);
    }
    private __coFlightTaskInput: ObservedPropertySimplePU<string>;
    get coFlightTaskInput() {
        return this.__coFlightTaskInput.get();
    }
    set coFlightTaskInput(newValue: string) {
        this.__coFlightTaskInput.set(newValue);
    }
    private __coFlightJoinMsg: ObservedPropertySimplePU<string>;
    get coFlightJoinMsg() {
        return this.__coFlightJoinMsg.get();
    }
    set coFlightJoinMsg(newValue: string) {
        this.__coFlightJoinMsg.set(newValue);
    }
    private __coFlightCreateMsg: ObservedPropertySimplePU<string>;
    get coFlightCreateMsg() {
        return this.__coFlightCreateMsg.get();
    }
    set coFlightCreateMsg(newValue: string) {
        this.__coFlightCreateMsg.set(newValue);
    }
    private __isCreatingCoFlight: ObservedPropertySimplePU<boolean>;
    get isCreatingCoFlight() {
        return this.__isCreatingCoFlight.get();
    }
    set isCreatingCoFlight(newValue: boolean) {
        this.__isCreatingCoFlight.set(newValue);
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
    private __coFlightOriginAirport: ObservedPropertyObjectPU<Airport | null>;
    get coFlightOriginAirport() {
        return this.__coFlightOriginAirport.get();
    }
    set coFlightOriginAirport(newValue: Airport | null) {
        this.__coFlightOriginAirport.set(newValue);
    }
    private __coFlightDestAirport: ObservedPropertyObjectPU<Airport | null>;
    get coFlightDestAirport() {
        return this.__coFlightDestAirport.get();
    }
    set coFlightDestAirport(newValue: Airport | null) {
        this.__coFlightDestAirport.set(newValue);
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
    private coFlightFriendDialog: CustomDialogController | null;
    private coFlightPlaneDialog: CustomDialogController | null;
    private coFlightOriginDialog: CustomDialogController | null;
    private coFlightDestDialog: CustomDialogController | null;
    // 内存缓存层 —— 读取数据时优先命中缓存，避免重复preferences磁盘IO
    private memCache: MemCache;
    // 分布式数据对象 —— 跨设备编辑进度同步
    private distObject: distributedDataObject.DataObject | null;
    private distSessionId: string;
    private isDistSyncReady: boolean;
    // 分布式设备在线状态
    private __remoteDeviceOnline: ObservedPropertySimplePU<boolean>;
    get remoteDeviceOnline() {
        return this.__remoteDeviceOnline.get();
    }
    set remoteDeviceOnline(newValue: boolean) {
        this.__remoteDeviceOnline.set(newValue);
    }
    // 执飞结束结算数据
    private __focusSettlementData: ObservedPropertyObjectPU<FocusSettlementData | null>;
    get focusSettlementData() {
        return this.__focusSettlementData.get();
    }
    set focusSettlementData(newValue: FocusSettlementData | null) {
        this.__focusSettlementData.set(newValue);
    }
    // 地图交互：当前高亮的机场IATA
    private __highlightedAirportIata: ObservedPropertySimplePU<string>;
    get highlightedAirportIata() {
        return this.__highlightedAirportIata.get();
    }
    set highlightedAirportIata(newValue: string) {
        this.__highlightedAirportIata.set(newValue);
    }
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
            }
            catch (e) {
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
        this.sysUsername = '';
        this.sysPassword = '';
        this.formUser = '';
        this.formPwd = '';
        this.formAirName = '';
        this.formAirCode = '';
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
                this.distObject!.on('status', (sessionId: string, networkId: string, status: 'online' | 'offline') => {
                    this.remoteDeviceOnline = (status === 'online');
                });
            }).catch((_err: BusinessError) => {
                this.isDistSyncReady = false;
            });
        }
        catch (_e) {
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
        }
        catch (_e) {
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
        }
        catch (_e) {
            // 同步失败忽略
        }
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
    // ================= 根路由渲染 =================
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // Full-screen safe area expansion
            Column.create();
            // Full-screen safe area expansion
            Column.width('100%');
            // Full-screen safe area expansion
            Column.height('100%');
            // Full-screen safe area expansion
            Column.expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM]);
        }, Column);
        // Full-screen safe area expansion
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 沉浸式深空高级渐变背景
            Column.create();
            // 沉浸式深空高级渐变背景
            Column.width('100%');
            // 沉浸式深空高级渐变背景
            Column.height('100%');
            // 沉浸式深空高级渐变背景
            Column.linearGradient({ direction: GradientDirection.Bottom, colors: [['#0f2027', 0.0], ['#203a43', 0.5], ['#2c5364', 1.0]] });
            // 沉浸式深空高级渐变背景
            Column.expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM]);
        }, Column);
        // 沉浸式深空高级渐变背景
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            // 分布式设备在线状态指示器
            if (this.isDistSyncReady) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.position({ x: '50%', y: 0 });
                        Row.translate({ x: '-50%' });
                        Row.padding({ top: 2, bottom: 2, left: 12, right: 12 });
                        Row.backgroundColor('rgba(0,0,0,0.6)');
                        Row.borderRadius(12);
                        Row.zIndex(100);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Circle.create({ width: 8, height: 8 });
                        Circle.fill(this.remoteDeviceOnline ? '#00E5FF' : '#666');
                    }, Circle);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.remoteDeviceOnline ? '多设备已连接' : '等待设备连接');
                        Text.fontSize(11);
                        Text.fontColor(this.remoteDeviceOnline ? '#00E5FF' : '#888');
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
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
            else if (this.currentPage === 11) {
                this.ifElseBranchUpdateFunction(11, () => {
                    this.FriendsView.bind(this)();
                });
            }
            else if (this.currentPage === 12) {
                this.ifElseBranchUpdateFunction(12, () => {
                    this.CoFlightView.bind(this)();
                });
            }
            else if (this.currentPage === 13) {
                this.ifElseBranchUpdateFunction(13, () => {
                    this.FocusSettlementView.bind(this)();
                });
            }
            else if (this.currentPage === 14) {
                this.ifElseBranchUpdateFunction(14, () => {
                    this.TrackMapView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(15, () => {
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
    TrackMapView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding(20);
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('← 返回简报');
            Button.height(45);
            Button.backgroundColor('rgba(255,255,255,0.15)');
            Button.fontColor('#FFF');
            Button.borderRadius(12);
            Button.padding({ left: 15, right: 15 });
            Button.onClick(() => this.currentPage = 6);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('个人航迹网络');
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`总轨迹数: ${this.flightHistory.length}`);
            Text.fontColor('rgba(255,255,255,0.6)');
            Text.fontSize(14);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.layoutWeight(1);
            Stack.width('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.flightHistory.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 10 });
                        Column.zIndex(10);
                        Column.justifyContent(FlexAlign.Center);
                        Column.width('100%');
                        Column.height('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🗺️ 暂无航迹数据');
                        Text.fontColor('#FFF');
                        Text.fontSize(18);
                        Text.fontWeight(FontWeight.Medium);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('执行完成任意一次专注飞行后即可生成路线连线');
                        Text.fontColor('rgba(255,255,255,0.5)');
                        Text.fontSize(13);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Web.create({ src: '', controller: this.webController });
            Web.width('100%');
            Web.height('100%');
            Web.javaScriptAccess(true);
            Web.domStorageAccess(true);
            Web.onControllerAttached(() => {
                this.webController.loadData(this.generateTrackMapHtml(), "text/html", "UTF-8", "https://webapi.amap.com", "https://webapi.amap.com");
            });
        }, Web);
        Stack.pop();
        Column.pop();
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
                                this.myUid = generateUID();
                                this.ownedPlanes = ["ARJ21", "A320neo"]; // 注册赠送初始机队
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
                            }
                            else if (this.formUser === this.sysUsername && this.formPwd === this.sysPassword && this.sysUsername !== '') {
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
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 核心适配：使用 GridRow 响应式栅格系统
            GridRow.create({ columns: { sm: 4, md: 8, lg: 12 }, gutter: 25 });
            // 核心适配：使用 GridRow 响应式栅格系统
            GridRow.width('92%');
            // 核心适配：使用 GridRow 响应式栅格系统
            GridRow.margin({ top: 70 });
        }, GridRow);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 👈 左半区 / 手机上半区：个人信息卡片
            GridCol.create({ span: { sm: 4, md: 8, lg: 5 } });
        }, GridCol);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.width('100%');
            Column.padding(35);
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
        // 👈 左半区 / 手机上半区：个人信息卡片
        GridCol.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 👉 右半区 / 手机下半区：功能菜单矩阵
            GridCol.create({ span: { sm: 4, md: 8, lg: 7 } });
        }, GridCol);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridRow.create({ columns: { sm: 2, md: 2, lg: 2 }, gutter: 15 });
        }, GridRow);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridCol.create({ span: 2 });
        }, GridCol);
        this.MenuButton.bind(this)('规划新航程', 'rgba(0, 229, 255, 0.3)', () => this.currentPage = 1, '#FFF', '100%');
        GridCol.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridCol.create({ span: 2 });
        }, GridCol);
        this.MenuButton.bind(this)('航班调度表', 'rgba(255, 255, 255, 0.15)', () => this.currentPage = 4, '#FFF', '100%');
        GridCol.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridCol.create({ span: 1 });
        }, GridCol);
        this.MenuButton.bind(this)('航空商店', 'rgba(255, 152, 0, 0.3)', () => this.currentPage = 7, '#FFF', '100%');
        GridCol.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridCol.create({ span: 1 });
        }, GridCol);
        this.MenuButton.bind(this)('我的简报', 'rgba(76, 175, 80, 0.3)', () => this.currentPage = 6, '#FFF', '100%');
        GridCol.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridCol.create({ span: 1 });
        }, GridCol);
        this.MenuButton.bind(this)('好友系统', 'rgba(156, 39, 176, 0.3)', () => this.currentPage = 11, '#FFF', '100%');
        GridCol.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridCol.create({ span: 1 });
        }, GridCol);
        this.MenuButton.bind(this)('共享航班', 'rgba(0, 229, 255, 0.3)', () => {
            this.candidateAirports = ALL_AIRPORTS.filter(a => a.time > 0);
            this.currentPage = 12;
        }, '#FFF', '100%');
        GridCol.pop();
        GridRow.pop();
        // 👉 右半区 / 手机下半区：功能菜单矩阵
        GridCol.pop();
        // 核心适配：使用 GridRow 响应式栅格系统
        GridRow.pop();
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
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.create({ placeholder: '在此输入专注事项，如：阅读文献...', text: { value: this.tempTaskType, changeEvent: newValue => { this.tempTaskType = newValue; } } });
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.width('90%');
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.height(65);
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.backgroundColor('rgba(255, 255, 255, 0.12)');
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.backdropBlur(25);
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.borderRadius(20);
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
            TextInput.fontColor('#FFF');
            // 修复核心：使用 $$ 实现双向绑定，直接删除冗长的 onChange 事件，彻底消除波浪线警告
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
            // 1. 底层地图 (保持不变)
            Web.create({ src: '', controller: this.webController });
            // 1. 底层地图 (保持不变)
            Web.width('100%');
            // 1. 底层地图 (保持不变)
            Web.height('100%');
            // 1. 底层地图 (保持不变)
            Web.javaScriptAccess(true);
            // 1. 底层地图 (保持不变)
            Web.domStorageAccess(true);
            // 1. 底层地图 (保持不变)
            Web.onControllerAttached(() => {
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
                            }
                            else if (msg['type'] === 'mapReady') {
                                // 地图加载完成
                            }
                        }
                        catch (_e) {
                        }
                    }
                }, 'harmony', ['postMessage']);
            });
        }, Web);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 2. 底部控制面板 (重构为横向卡片容器)
            Column.create();
            // 2. 底部控制面板 (重构为横向卡片容器)
            Column.width('100%');
            // 2. 底部控制面板 (重构为横向卡片容器)
            Column.padding({ bottom: 35 });
            // 2. 底部控制面板 (重构为横向卡片容器)
            Column.backgroundColor('rgba(15, 32, 39, 0.75)');
            // 2. 底部控制面板 (重构为横向卡片容器)
            Column.backdropBlur(25);
            // 2. 底部控制面板 (重构为横向卡片容器)
            Column.borderRadius({ topLeft: 35, topRight: 35 });
            // 2. 底部控制面板 (重构为横向卡片容器)
            Column.border({ width: 1, color: 'rgba(255,255,255,0.2)' });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ top: 20, left: 20, right: 20, bottom: 15 });
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
            // 核心修改 1：横向滚动列表
            List.create({ space: 15 });
            // 核心修改 1：横向滚动列表
            List.listDirection(Axis.Horizontal);
            // 核心修改 1：横向滚动列表
            List.width('100%');
            // 核心修改 1：横向滚动列表
            List.height(150);
            // 核心修改 1：横向滚动列表
            List.padding({ left: 20, right: 20 });
            // 核心修改 1：横向滚动列表
            List.scrollBar(BarState.Off);
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
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.create();
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.width(200);
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.height(130);
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.padding(16);
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.alignItems(HorizontalAlign.Start);
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.backgroundColor(this.highlightedAirportIata === apt.iata ? 'rgba(0,229,255,0.2)' : 'rgba(0,0,0,0.6)');
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.borderRadius(20);
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.border({ width: 2, color: this.highlightedAirportIata === apt.iata ? '#00E5FF' : 'rgba(255,255,255,0.1)' });
                            // 核心修改 2：把横排布局改成方形卡片布局
                            Column.onClick(() => {
                                this.highlightedAirportIata = apt.iata;
                                try {
                                    this.webController.runJavaScript(`panToAirport(${apt.lng}, ${apt.lat}); highlightMarker('${apt.iata}');`);
                                }
                                catch (_e) {
                                }
                            });
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
                            Text.fontSize(13);
                            Text.fontColor('rgba(255,255,255,0.7)');
                            Text.margin({ top: 6 });
                        }, Text);
                        Text.pop();
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
                                        Text.height(38);
                                    }, Text);
                                    Text.pop();
                                });
                            }
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('选择降落');
                                        Button.width('100%');
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
                        // 核心修改 2：把横排布局改成方形卡片布局
                        Column.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.candidateAirports, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        // 核心修改 1：横向滚动列表
        List.pop();
        // 2. 底部控制面板 (重构为横向卡片容器)
        Column.pop();
        Stack.pop();
    }
    // ==========================================
    // 【从这里开始替换原来的 PlanePickerForFlightView】
    // ==========================================
    PlanePickerForFlightView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.height('100%');
        }, Column);
        this.StepHeader.bind(this)('最后一步：确认执飞机型', 3);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`航线: ${this.currentAirport} ➔ ${this.selectedAirport?.iata} | 时长: ${this.selectedAirport?.time} 分钟`);
            Text.fontColor('#00E5FF');
            Text.width('90%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('👇 点击选择下方机型，立刻生成航班计划');
            Text.fontColor('rgba(255,255,255,0.7)');
            Text.fontSize(14);
            Text.width('90%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 15 });
            List.layoutWeight(1);
            List.width('92%');
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 【核心绝杀】不再信任本地缓存，通过 getSafePlanes 拿飞机，绝不让这里为空！
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
                        ListItem.onClick(() => this.confirmFlight(p));
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
                            Row.border({ width: 2, color: 'rgba(0, 229, 255, 0.4)' });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Image.create(p.logoUrl);
                            Image.width(60);
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
                            Text.fontSize(20);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`倍率: x${p.multiplier.toFixed(1)}`);
                            Text.fontColor('#FFD700');
                            Text.fontSize(14);
                            Text.margin({ top: 5 });
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
                            Text.fontSize(18);
                            Text.margin({ top: 5 });
                        }, Text);
                        Text.pop();
                        Column.pop();
                        Row.pop();
                        ListItem.pop();
                    };
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    ListItem.pop();
                }
            };
            this.forEachUpdateFunction(elmtId, this.getSafePlanes(), forEachItemGenFunction);
        }, ForEach);
        // 【核心绝杀】不再信任本地缓存，通过 getSafePlanes 拿飞机，绝不让这里为空！
        ForEach.pop();
        List.pop();
        Column.pop();
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
                builder: () => {
                    let jsDialog = new FriendSelectDialog(this, {
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
                    }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/FlightConcentrator.ets", line: 1514, col: 18 });
                    jsDialog.setController(this.coFlightFriendDialog);
                    ViewPU.create(jsDialog);
                    let paramsLambda = () => {
                        return {
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
                        };
                    };
                    jsDialog.paramsGenerator_ = paramsLambda;
                },
                autoCancel: true,
                alignment: DialogAlignment.Center
            }, this);
            this.coFlightFriendDialog!.open();
        }
        else {
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
                        List.padding({ left: 15, right: 15 });
                        List.lanes(this.curBp === 'lg' || this.curBp === 'xl' ? 2 : 1, 15);
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
                                        Text.create(`${item.originIata || 'CAN'} ➔ ${item.destIata}`);
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
                                        If.create();
                                        if (item.isCoFlight) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('✈ 共享航班 ' + item.coFlightId);
                                                    Text.fontColor('#FFD700');
                                                    Text.fontSize(13);
                                                    Text.backgroundColor('rgba(255,215,0,0.15)');
                                                    Text.padding({ left: 8, right: 8, top: 3, bottom: 3 });
                                                    Text.borderRadius(8);
                                                    Text.margin({ top: 5 });
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
    FlyingView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // ==========================================
            // 1. 顶部：航线与航班状态 (固定)
            // ==========================================
            Column.create({ space: 8 });
            // ==========================================
            // 1. 顶部：航线与航班状态 (固定)
            // ==========================================
            Column.width('100%');
            // ==========================================
            // 1. 顶部：航线与航班状态 (固定)
            // ==========================================
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((this.activeCoFlight && this.activeCoFlight.status === 'flying') ? '共享航班' : this.activeFlight.taskType);
            Text.fontSize(16);
            Text.fontColor('rgba(255,255,255,0.5)');
            Text.margin({ top: 60 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 15 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((this.activeCoFlight && this.activeCoFlight.status === 'flying') ? this.activeCoFlight.originIata : this.activeFlight.originIata);
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
            Text.create((this.activeCoFlight && this.activeCoFlight.status === 'flying') ? this.activeCoFlight.destIata : this.activeFlight.destIata);
            Text.fontSize(36);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create((this.activeCoFlight && this.activeCoFlight.status === 'flying') ? this.activeCoFlight.planeModel : this.activeFlight.planeModel);
            Text.fontSize(14);
            Text.fontColor('#FFF');
            Text.backgroundColor('rgba(255,255,255,0.1)');
            Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
            Text.borderRadius(10);
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.activeCoFlight && this.activeCoFlight.status === 'flying') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('共享航班: ' + this.activeCoFlight!.flightNumber);
                        Text.fontSize(13);
                        Text.fontColor('#FFD700');
                        Text.backgroundColor('rgba(255,215,0,0.15)');
                        Text.padding({ left: 10, right: 10, top: 4, bottom: 4 });
                        Text.borderRadius(10);
                        Text.margin({ top: 6 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('伙伴任务');
                        Text.fontSize(11);
                        Text.fontColor('rgba(255,255,255,0.4)');
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const uid = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(uid + ': ' + this.activeCoFlight!.participantTasks[uid]);
                                Text.fontSize(12);
                                Text.fontColor('rgba(255,255,255,0.6)');
                                Text.margin({ top: 2 });
                            }, Text);
                            Text.pop();
                        };
                        this.forEachUpdateFunction(elmtId, Object.keys(this.activeCoFlight.participantTasks), forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        // ==========================================
        // 1. 顶部：航线与航班状态 (固定)
        // ==========================================
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 使用 margin 替代 Blank，确保进度条离顶部的距离是固定的
            Column.create({ space: 10 });
            // 使用 margin 替代 Blank，确保进度条离顶部的距离是固定的
            Column.width('100%');
            // 使用 margin 替代 Blank，确保进度条离顶部的距离是固定的
            Column.alignItems(HorizontalAlign.Center);
            // 使用 margin 替代 Blank，确保进度条离顶部的距离是固定的
            Column.margin({ top: 30 });
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
        // 使用 margin 替代 Blank，确保进度条离顶部的距离是固定的
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 第一个弹性空间：推开上半部分和倒计时
            Blank.create();
        }, Blank);
        // 第一个弹性空间：推开上半部分和倒计时
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // ==========================================
            // 2. 中间：倒计时与速度仪表盘 (整体打包居中)
            // ==========================================
            Column.create();
            // ==========================================
            // 2. 中间：倒计时与速度仪表盘 (整体打包居中)
            // ==========================================
            Column.width('100%');
            // ==========================================
            // 2. 中间：倒计时与速度仪表盘 (整体打包居中)
            // ==========================================
            Column.alignItems(HorizontalAlign.Center);
        }, Column);
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
        // ==========================================
        // 2. 中间：倒计时与速度仪表盘 (整体打包居中)
        // ==========================================
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 第二个弹性空间：推开仪表盘和底部按钮
            Blank.create();
        }, Blank);
        // 第二个弹性空间：推开仪表盘和底部按钮
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // ==========================================
            // 3. 底部：操作按钮 (固定在底侧)
            // ==========================================
            Column.create();
            // ==========================================
            // 3. 底部：操作按钮 (固定在底侧)
            // ==========================================
            Column.margin({ bottom: 50 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.sysUsername === '白鹭') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('⚡ 跳过专注 (即刻结算)');
                        Button.width('80%');
                        Button.height(55);
                        Button.backgroundColor('rgba(255, 215, 0, 0.2)');
                        Button.border({ width: 1, color: 'rgba(255, 215, 0, 0.5)' });
                        Button.borderRadius(30);
                        Button.fontColor('#FFD700');
                        Button.fontWeight(FontWeight.Bold);
                        Button.onClick(() => {
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
                        });
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('紧急迫降');
                        Button.width('80%');
                        Button.height(60);
                        Button.backgroundColor('rgba(255, 77, 79, 0.15)');
                        Button.border({ width: 1, color: 'rgba(255, 77, 79, 0.3)' });
                        Button.borderRadius(30);
                        Button.fontColor('#FF4D4F');
                        Button.onClick(() => {
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
                                    action: () => { }
                                }
                            });
                        });
                    }, Button);
                    Button.pop();
                });
            }
        }, If);
        If.pop();
        // ==========================================
        // 3. 底部：操作按钮 (固定在底侧)
        // ==========================================
        Column.pop();
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
            List.lanes(this.curBp === 'lg' || this.curBp === 'xl' ? 2 : 1, 20);
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
                                        }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/FlightConcentrator.ets", line: 1983, col: 24 });
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
            Text.create('UID');
            Text.fontColor('rgba(255,255,255,0.6)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.myUid}`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#00E5FF');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        Row.pop();
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
            Text.create('飞行数据可视化');
            Text.width('90%');
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('rgba(255,255,255,0.5)');
            Text.fontSize(14);
            Text.margin({ top: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('查看全量航迹地图 🗺️');
            Button.width('90%');
            Button.height(55);
            Button.borderRadius(16);
            Button.backgroundColor('rgba(0, 229, 255, 0.25)');
            Button.border({ width: 1, color: 'rgba(0, 229, 255, 0.4)' });
            Button.fontColor('#00E5FF');
            Button.fontSize(16);
            Button.fontWeight(FontWeight.Medium);
            Button.margin({ top: 10 });
            Button.onClick(() => {
                this.currentPage = 14; // 跳转到新增的航迹地图页面
            });
        }, Button);
        Button.pop();
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
            Text.create('好友数量');
            Text.fontColor('rgba(255,255,255,0.6)');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.friendsList.length} 人`);
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
    FocusSettlementView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('🛬 航程结算');
            Text.fontSize(26);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.margin({ top: 60 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('任务圆满完成');
            Text.fontSize(14);
            Text.fontColor('#00E5FF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 地图显示航线
            Column.create();
            // 地图显示航线
            Column.width('90%');
            // 地图显示航线
            Column.height(200);
            // 地图显示航线
            Column.borderRadius(16);
            // 地图显示航线
            Column.border({ width: 1, color: 'rgba(255,255,255,0.2)' });
            // 地图显示航线
            Column.margin({ top: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Web.create({ src: '', controller: this.webController });
            Web.width('100%');
            Web.height(200);
            Web.onControllerAttached(() => {
                if (this.focusSettlementData) {
                    this.webController.loadData(this.generateSettlementMapHtml(ObservedObject.GetRawObject(this.focusSettlementData)), "text/html", "UTF-8", "https://webapi.amap.com", "https://webapi.amap.com");
                }
            });
        }, Web);
        // 地图显示航线
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 12 });
            Column.width('90%');
            Column.padding(25);
            Column.backgroundColor('rgba(255, 255, 255, 0.12)');
            Column.backdropBlur(25);
            Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
            Column.borderRadius(20);
            Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
            Column.margin({ top: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('航线');
            Text.fontColor('rgba(255,255,255,0.6)');
            Text.fontSize(15);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.focusSettlementData?.originName || 'CAN'} → ${this.focusSettlementData?.destName || ''}`);
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
            Text.create('任务内容');
            Text.fontColor('rgba(255,255,255,0.6)');
            Text.fontSize(15);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.focusSettlementData?.taskType || '');
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
            Text.create('执飞机型');
            Text.fontColor('rgba(255,255,255,0.6)');
            Text.fontSize(15);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.focusSettlementData?.planeModel || '');
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#00E5FF');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('飞行时长');
            Text.fontColor('rgba(255,255,255,0.6)');
            Text.fontSize(15);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.focusSettlementData?.focusMinutes || 0} 分钟`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('rgba(255,255,255,0.15)');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('本次收益');
            Text.fontColor('rgba(255,255,255,0.6)');
            Text.fontSize(16);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`+💰 ${this.focusSettlementData?.profit || 0}`);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFD700');
            Text.fontSize(22);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.focusSettlementData?.newRoute) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding({ top: 4, bottom: 4, left: 10, right: 10 });
                        Row.backgroundColor('rgba(0,229,255,0.1)');
                        Row.borderRadius(10);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('🏆 新航线开通!');
                        Text.fontColor('#00E5FF');
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontSize(14);
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('返回调度中心');
            Button.width('85%');
            Button.height(60);
            Button.backgroundColor('#00E5FF');
            Button.fontColor('#000');
            Button.borderRadius(20);
            Button.fontWeight(FontWeight.Bold);
            Button.margin({ bottom: 50 });
            Button.onClick(() => {
                this.focusSettlementData = null;
                this.currentPage = 0;
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    FriendsView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
        }, Column);
        this.StepHeader.bind(this)('好友系统', 0);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('90%');
            Row.margin({ top: 15 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '输入好友UID', text: this.friendUidInput });
            TextInput.layoutWeight(1);
            TextInput.height(55);
            TextInput.backgroundColor('rgba(255,255,255,0.08)');
            TextInput.fontColor('#FFF');
            TextInput.placeholderColor('rgba(255,255,255,0.4)');
            TextInput.borderRadius(14);
            TextInput.border({ width: 1, color: 'rgba(255,255,255,0.2)' });
            TextInput.onChange(v => this.friendUidInput = v);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('添加');
            Button.width(80);
            Button.height(55);
            Button.backgroundColor('#00E5FF');
            Button.fontColor('#000');
            Button.borderRadius(14);
            Button.margin({ left: 12 });
            Button.onClick(() => this.addFriendByUid());
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.friendAddMsg) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.friendAddMsg);
                        Text.fontColor(this.friendAddMsg.includes('成功') ? '#00E5FF' : '#FF5252');
                        Text.fontSize(14);
                        Text.margin({ top: 8 });
                        Text.width('90%');
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
            Text.create('我的UID');
            Text.fontColor('rgba(255,255,255,0.5)');
            Text.fontSize(13);
            Text.margin({ top: 15 });
            Text.width('90%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('90%');
            Row.padding(18);
            Row.backgroundColor('rgba(0,229,255,0.08)');
            Row.borderRadius(14);
            Row.border({ width: 1, color: 'rgba(0,229,255,0.2)' });
            Row.onClick(() => {
                let pasteData = pasteboard.createData(pasteboard.MIMETYPE_TEXT_PLAIN, this.myUid);
                let pasteboardSystem = pasteboard.getSystemPasteboard();
                pasteboardSystem.setData(pasteData).then(() => {
                    this.friendAddMsg = 'UID已复制到剪贴板';
                }).catch((err: BusinessError) => {
                    this.friendAddMsg = '复制失败，请手动记录';
                });
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.myUid);
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#00E5FF');
            Text.fontFeature('"tnum" 1');
            Text.letterSpacing(2);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('点击复制');
            Text.fontSize(12);
            Text.fontColor('rgba(255,255,255,0.5)');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.friendsList.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无好友，输入UID添加');
                        Text.fontColor('rgba(255,255,255,0.4)');
                        Text.margin({ top: 60 });
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create({ space: 12 });
                        List.layoutWeight(1);
                        List.width('90%');
                        List.margin({ top: 20 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const friend = _item;
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
                                        Row.padding(15);
                                        Row.backgroundColor('rgba(255,255,255,0.06)');
                                        Row.borderRadius(14);
                                        Row.border({ width: 1, color: 'rgba(255,255,255,0.1)' });
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create({ space: 4 });
                                        Column.alignItems(HorizontalAlign.Start);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(friend.airlineName);
                                        Text.fontSize(16);
                                        Text.fontWeight(FontWeight.Bold);
                                        Text.fontColor('#FFF');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(friend.uid);
                                        Text.fontSize(12);
                                        Text.fontColor('rgba(255,255,255,0.5)');
                                        Text.fontFeature('"tnum" 1');
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Blank.create();
                                    }, Blank);
                                    Blank.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Button.createWithLabel('删除');
                                        Button.height(36);
                                        Button.backgroundColor('rgba(255,77,79,0.2)');
                                        Button.fontColor('#FF4D4F');
                                        Button.border({ width: 1, color: 'rgba(255,77,79,0.3)' });
                                        Button.borderRadius(10);
                                        Button.fontSize(13);
                                        Button.onClick(() => this.removeFriend(friend.uid));
                                    }, Button);
                                    Button.pop();
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.friendsList, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    CoFlightView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
        }, Column);
        this.StepHeader.bind(this)('共享航班 (Codeshare)', 0);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.activeCoFlight) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create({ space: 12 });
                        Column.width('90%');
                        Column.padding(25);
                        Column.backgroundColor('rgba(255, 255, 255, 0.12)');
                        Column.backdropBlur(25);
                        Column.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
                        Column.borderRadius(20);
                        Column.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
                        Column.margin({ top: 20 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('航班 ' + this.activeCoFlight!.flightNumber);
                        Text.fontSize(24);
                        Text.fontWeight(FontWeight.Bold);
                        Text.fontColor('#FFD700');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('目的地: ' + this.activeCoFlight!.destName + ' (' + this.activeCoFlight!.destIata + ')');
                        Text.fontColor('#00E5FF');
                        Text.fontSize(16);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('时长: ' + this.activeCoFlight!.durationMinutes + ' 分钟');
                        Text.fontColor('rgba(255,255,255,0.7)');
                        Text.fontSize(14);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('参与人数: ' + this.activeCoFlight!.participants.length);
                        Text.fontColor('#FFD700');
                        Text.fontSize(14);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Divider.create();
                        Divider.color('rgba(255,255,255,0.1)');
                    }, Divider);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.activeCoFlight.status === 'waiting') {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    If.create();
                                    if (this.activeCoFlight.creatorUid === this.myUid) {
                                        this.ifElseBranchUpdateFunction(0, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Button.createWithLabel('机长起飞');
                                                Button.width('80%');
                                                Button.height(55);
                                                Button.backgroundColor('#00E5FF');
                                                Button.fontColor('#000');
                                                Button.borderRadius(20);
                                                Button.fontWeight(FontWeight.Bold);
                                                Button.onClick(() => this.startCoFlight(this.activeCoFlight!));
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                    else {
                                        this.ifElseBranchUpdateFunction(1, () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                TextInput.create({ placeholder: '输入你的专注任务', text: this.coFlightTaskInput });
                                                TextInput.width('80%');
                                                TextInput.height(50);
                                                TextInput.backgroundColor('rgba(255,255,255,0.08)');
                                                TextInput.fontColor('#FFF');
                                                TextInput.placeholderColor('rgba(255,255,255,0.4)');
                                                TextInput.borderRadius(14);
                                                TextInput.border({ width: 1, color: 'rgba(255,255,255,0.2)' });
                                                TextInput.onChange(v => this.coFlightTaskInput = v);
                                            }, TextInput);
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                If.create();
                                                if (this.coFlightJoinMsg) {
                                                    this.ifElseBranchUpdateFunction(0, () => {
                                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                            Text.create(this.coFlightJoinMsg);
                                                            Text.fontColor(this.coFlightJoinMsg.includes('成功') ? '#00E5FF' : '#FF5252');
                                                            Text.fontSize(13);
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
                                                Button.createWithLabel('加入共享航班');
                                                Button.width('80%');
                                                Button.height(55);
                                                Button.backgroundColor('#00E5FF');
                                                Button.fontColor('#000');
                                                Button.borderRadius(20);
                                                Button.fontWeight(FontWeight.Bold);
                                                Button.margin({ top: 8 });
                                                Button.onClick(() => this.joinCoFlight(this.activeCoFlight!));
                                            }, Button);
                                            Button.pop();
                                        });
                                    }
                                }, If);
                                If.pop();
                            });
                        }
                        else if (this.activeCoFlight.status === 'flying') {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('航班正在飞行中...');
                                    Text.fontColor('#FFD700');
                                    Text.fontSize(16);
                                }, Text);
                                Text.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(2, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('航班已完成');
                                    Text.fontColor('#4CAF50');
                                    Text.fontSize(16);
                                }, Text);
                                Text.pop();
                            });
                        }
                    }, If);
                    If.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.color('rgba(255,255,255,0.1)');
            Divider.margin({ top: 20, bottom: 10 });
            Divider.width('90%');
        }, Divider);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.coFlightSessions.length > 0 ? '可用共享航班' : '暂无共享航班，创建一个吧');
            Text.fontColor('rgba(255,255,255,0.5)');
            Text.fontSize(13);
            Text.width('90%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 12 });
            List.layoutWeight(1);
            List.width('90%');
            List.margin({ top: 10 });
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const session = _item;
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
                            Row.padding(15);
                            Row.backgroundColor('rgba(255, 255, 255, 0.12)');
                            Row.backdropBlur(25);
                            Row.border({ width: 1, color: 'rgba(255, 255, 255, 0.25)' });
                            Row.borderRadius(20);
                            Row.shadow({ radius: 15, color: 'rgba(0, 0, 0, 0.2)', offsetY: 10 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create({ space: 4 });
                            Column.alignItems(HorizontalAlign.Start);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create({ space: 8 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(session.flightNumber);
                            Text.fontWeight(FontWeight.Bold);
                            Text.fontColor('#FFD700');
                            Text.fontSize(16);
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('机长: ' + session.creatorName);
                            Text.fontColor('rgba(255,255,255,0.6)');
                            Text.fontSize(12);
                        }, Text);
                        Text.pop();
                        Row.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(session.destName + ' | ' + session.durationMinutes + '分钟');
                            Text.fontColor('#FFF');
                            Text.fontSize(14);
                        }, Text);
                        Text.pop();
                        Column.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Blank.create();
                        }, Blank);
                        Blank.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Button.createWithLabel('加入');
                            Button.height(40);
                            Button.backgroundColor('#00E5FF');
                            Button.fontColor('#000');
                            Button.borderRadius(12);
                            Button.fontSize(14);
                            Button.onClick(() => {
                                this.activeCoFlight = session;
                                this.coFlightJoinMsg = '';
                                this.coFlightTaskInput = '';
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
            this.forEachUpdateFunction(elmtId, this.coFlightSessions, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        List.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.coFlightCreateMsg) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.coFlightCreateMsg);
                        Text.fontColor(this.coFlightCreateMsg.includes('请先') ? '#FF5252' : '#00E5FF');
                        Text.fontSize(14);
                        Text.margin({ top: 5, bottom: 5 });
                        Text.width('90%');
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
            Button.createWithLabel('创建共享航班');
            Button.width('85%');
            Button.height(60);
            Button.backgroundColor('#00E5FF');
            Button.fontColor('#000');
            Button.borderRadius(20);
            Button.fontWeight(FontWeight.Bold);
            Button.margin({ bottom: 30 });
            Button.onClick(() => this.createCoFlightSession());
        }, Button);
        Button.pop();
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
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "FlightConcentrator";
    }
}
registerNamedRoute(() => new FlightConcentrator(undefined, {}), "", { bundleName: "com.example.class1", moduleName: "entry", pagePath: "pages/FlightConcentrator", pageFullPath: "entry/src/main/ets/pages/FlightConcentrator", integratedHsp: "false", moduleType: "followWithHap" });
