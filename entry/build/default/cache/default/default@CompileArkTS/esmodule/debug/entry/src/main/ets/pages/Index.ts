if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SchedulePlanner_Params {
    currentPage?: number;
    scheduleList?: Array<ScheduleItem>;
    coinBalance?: number;
    airportLevel?: number;
    unlockedPlanes?: Array<string>;
    displayYear?: number;
    displayMonth?: number;
    daysInMonthList?: (number | null)[];
    selectedDate?: Date;
    tempTaskType?: string;
    tempStartTime?: Date;
    tempEndTime?: Date;
    activeItem?: ScheduleItem;
    remainingSeconds?: number;
    currentRouteDest?: string;
    timerId?: number;
    dialogController?: CustomDialogController | null;
    context?;
    pref?;
}
interface ActionDialog_Params {
    controller?: CustomDialogController;
    item?: ScheduleItem;
    onStart?: (item: ScheduleItem) => void;
    onDelete?: (id: number) => void;
}
import preferences from "@ohos:data.preferences";
import type common from "@ohos:app.ability.common";
// ==========================================
// 数据模型 & 航线数据
// ==========================================
interface ScheduleItemData {
    id?: number;
    taskType: string;
    startTime: string;
    endTime: string;
}
class ScheduleItem {
    id: number = 0;
    taskType: string = '';
    startTime: Date = new Date();
    endTime: Date = new Date();
}
interface FlightRoute {
    dest: string;
    time: number; // 飞行时长(分钟)
}
// 以广州白云国际机场为起点的 21 条国内主要航线（预估飞行时长分钟）
const CAN_ROUTES: FlightRoute[] = [
    { dest: '深圳宝安', time: 40 },
    { dest: '珠海金湾', time: 50 },
    { dest: '揭阳潮汕', time: 60 },
    { dest: '厦门高崎', time: 70 },
    { dest: '长沙黄花', time: 80 },
    { dest: '福州长乐', time: 90 },
    { dest: '海口美兰', time: 95 },
    { dest: '武汉天河', time: 105 },
    { dest: '三亚凤凰', time: 110 },
    { dest: '杭州萧山', time: 120 },
    { dest: '上海虹桥', time: 130 },
    { dest: '南京禄口', time: 135 },
    { dest: '重庆江北', time: 140 },
    { dest: '成都天府', time: 145 },
    { dest: '西安咸阳', time: 155 },
    { dest: '昆明长水', time: 160 },
    { dest: '青岛胶东', time: 175 },
    { dest: '北京大兴', time: 180 },
    { dest: '大连周水子', time: 200 },
    { dest: '哈尔滨太平', time: 240 },
    { dest: '乌鲁木齐地窝堡', time: 300 }
];
function padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
}
class ActionDialog extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = undefined;
        this.item = new ScheduleItem();
        this.onStart = () => { };
        this.onDelete = () => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ActionDialog_Params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.item !== undefined) {
            this.item = params.item;
        }
        if (params.onStart !== undefined) {
            this.onStart = params.onStart;
        }
        if (params.onDelete !== undefined) {
            this.onDelete = params.onDelete;
        }
    }
    updateStateVars(params: ActionDialog_Params) {
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
    private item: ScheduleItem;
    private onStart: (item: ScheduleItem) => void;
    private onDelete: (id: number) => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.padding(25);
            Column.backgroundColor('#FFF');
            Column.borderRadius(20);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`飞行计划: ${this.item.taskType}`);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ bottom: 10 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('开始航程 (进入专注)');
            Button.width('100%');
            Button.height(50);
            Button.backgroundColor('#007DFF');
            Button.onClick(() => {
                this.onStart(this.item);
                this.controller.close();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消航班 (彻底删除)');
            Button.width('100%');
            Button.height(50);
            Button.backgroundColor('#FF4D4F');
            Button.onClick(() => {
                this.onDelete(this.item.id);
                this.controller.close();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('返回');
            Text.fontSize(14);
            Text.fontColor('#666');
            Text.onClick(() => this.controller.close());
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class SchedulePlanner extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__currentPage = new ObservedPropertySimplePU(0, this, "currentPage");
        this.__scheduleList = new ObservedPropertyObjectPU([], this, "scheduleList");
        this.__coinBalance = new ObservedPropertySimplePU(0, this, "coinBalance");
        this.__airportLevel = new ObservedPropertySimplePU(1, this, "airportLevel");
        this.__unlockedPlanes = new ObservedPropertyObjectPU(['波音 B737 (初始)'], this, "unlockedPlanes");
        this.__displayYear = new ObservedPropertySimplePU(new Date().getFullYear(), this, "displayYear");
        this.__displayMonth = new ObservedPropertySimplePU(new Date().getMonth(), this, "displayMonth");
        this.__daysInMonthList = new ObservedPropertyObjectPU([], this, "daysInMonthList");
        this.__selectedDate = new ObservedPropertyObjectPU(new Date(), this, "selectedDate");
        this.__tempTaskType = new ObservedPropertySimplePU('', this, "tempTaskType");
        this.__tempStartTime = new ObservedPropertyObjectPU(new Date(), this, "tempStartTime");
        this.__tempEndTime = new ObservedPropertyObjectPU(new Date(), this, "tempEndTime");
        this.__activeItem = new ObservedPropertyObjectPU(new ScheduleItem(), this, "activeItem");
        this.__remainingSeconds = new ObservedPropertySimplePU(0, this, "remainingSeconds");
        this.__currentRouteDest = new ObservedPropertySimplePU('', this, "currentRouteDest");
        this.timerId = -1;
        this.dialogController = null;
        this.context = getContext(this) as common.UIAbilityContext;
        this.pref = preferences.getPreferencesSync(this.context, { name: 'my_schedule_prefs' });
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SchedulePlanner_Params) {
        if (params.currentPage !== undefined) {
            this.currentPage = params.currentPage;
        }
        if (params.scheduleList !== undefined) {
            this.scheduleList = params.scheduleList;
        }
        if (params.coinBalance !== undefined) {
            this.coinBalance = params.coinBalance;
        }
        if (params.airportLevel !== undefined) {
            this.airportLevel = params.airportLevel;
        }
        if (params.unlockedPlanes !== undefined) {
            this.unlockedPlanes = params.unlockedPlanes;
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
        if (params.activeItem !== undefined) {
            this.activeItem = params.activeItem;
        }
        if (params.remainingSeconds !== undefined) {
            this.remainingSeconds = params.remainingSeconds;
        }
        if (params.currentRouteDest !== undefined) {
            this.currentRouteDest = params.currentRouteDest;
        }
        if (params.timerId !== undefined) {
            this.timerId = params.timerId;
        }
        if (params.dialogController !== undefined) {
            this.dialogController = params.dialogController;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
        if (params.pref !== undefined) {
            this.pref = params.pref;
        }
    }
    updateStateVars(params: SchedulePlanner_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__scheduleList.purgeDependencyOnElmtId(rmElmtId);
        this.__coinBalance.purgeDependencyOnElmtId(rmElmtId);
        this.__airportLevel.purgeDependencyOnElmtId(rmElmtId);
        this.__unlockedPlanes.purgeDependencyOnElmtId(rmElmtId);
        this.__displayYear.purgeDependencyOnElmtId(rmElmtId);
        this.__displayMonth.purgeDependencyOnElmtId(rmElmtId);
        this.__daysInMonthList.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedDate.purgeDependencyOnElmtId(rmElmtId);
        this.__tempTaskType.purgeDependencyOnElmtId(rmElmtId);
        this.__tempStartTime.purgeDependencyOnElmtId(rmElmtId);
        this.__tempEndTime.purgeDependencyOnElmtId(rmElmtId);
        this.__activeItem.purgeDependencyOnElmtId(rmElmtId);
        this.__remainingSeconds.purgeDependencyOnElmtId(rmElmtId);
        this.__currentRouteDest.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentPage.aboutToBeDeleted();
        this.__scheduleList.aboutToBeDeleted();
        this.__coinBalance.aboutToBeDeleted();
        this.__airportLevel.aboutToBeDeleted();
        this.__unlockedPlanes.aboutToBeDeleted();
        this.__displayYear.aboutToBeDeleted();
        this.__displayMonth.aboutToBeDeleted();
        this.__daysInMonthList.aboutToBeDeleted();
        this.__selectedDate.aboutToBeDeleted();
        this.__tempTaskType.aboutToBeDeleted();
        this.__tempStartTime.aboutToBeDeleted();
        this.__tempEndTime.aboutToBeDeleted();
        this.__activeItem.aboutToBeDeleted();
        this.__remainingSeconds.aboutToBeDeleted();
        this.__currentRouteDest.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    // 页面状态：0-首页, 1-日历, 2-设置, 3-列表, 4-倒计时, 5-航空商城
    private __currentPage: ObservedPropertySimplePU<number>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(newValue: number) {
        this.__currentPage.set(newValue);
    }
    private __scheduleList: ObservedPropertyObjectPU<Array<ScheduleItem>>;
    get scheduleList() {
        return this.__scheduleList.get();
    }
    set scheduleList(newValue: Array<ScheduleItem>) {
        this.__scheduleList.set(newValue);
    }
    // 玩家成就状态
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
    private __unlockedPlanes: ObservedPropertyObjectPU<Array<string>>;
    get unlockedPlanes() {
        return this.__unlockedPlanes.get();
    }
    set unlockedPlanes(newValue: Array<string>) {
        this.__unlockedPlanes.set(newValue);
    }
    // 日历逻辑
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
    // 临时任务数据
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
    // 倒计时逻辑
    private __activeItem: ObservedPropertyObjectPU<ScheduleItem>;
    get activeItem() {
        return this.__activeItem.get();
    }
    set activeItem(newValue: ScheduleItem) {
        this.__activeItem.set(newValue);
    }
    private __remainingSeconds: ObservedPropertySimplePU<number>;
    get remainingSeconds() {
        return this.__remainingSeconds.get();
    }
    set remainingSeconds(newValue: number) {
        this.__remainingSeconds.set(newValue);
    }
    private __currentRouteDest: ObservedPropertySimplePU<string>; // 匹配的目的地
    get currentRouteDest() {
        return this.__currentRouteDest.get();
    }
    set currentRouteDest(newValue: string) {
        this.__currentRouteDest.set(newValue);
    }
    private timerId: number;
    // 弹窗控制器
    private dialogController: CustomDialogController | null;
    private context;
    private pref;
    aboutToAppear() {
        this.loadData();
        this.updateCalendarDays();
    }
    // ================= 数据持久化 =================
    loadData() {
        // 读取航班日程
        let jsonStr = this.pref.getSync('schedule_list', '[]') as string;
        let list: Array<ScheduleItemData> = JSON.parse(jsonStr);
        this.scheduleList = list.map(item => {
            let newItem = new ScheduleItem();
            newItem.id = item.id || Math.random();
            newItem.taskType = item.taskType;
            newItem.startTime = new Date(item.startTime);
            newItem.endTime = new Date(item.endTime);
            return newItem;
        });
        // 读取玩家资产状态
        this.coinBalance = this.pref.getSync('coin_balance', 0) as number;
        this.airportLevel = this.pref.getSync('airport_level', 1) as number;
        let planesStr = this.pref.getSync('unlocked_planes', '["波音 B737 (初始)"]') as string;
        this.unlockedPlanes = JSON.parse(planesStr);
    }
    saveData() {
        this.pref.putSync('schedule_list', JSON.stringify(this.scheduleList));
        this.pref.putSync('coin_balance', this.coinBalance);
        this.pref.putSync('airport_level', this.airportLevel);
        this.pref.putSync('unlocked_planes', JSON.stringify(this.unlockedPlanes));
        this.pref.flushSync();
    }
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
    // 根据专注分钟数寻找最合适的航线
    matchFlightRoute(focusMinutes: number): string {
        let bestMatch = CAN_ROUTES[0];
        let minDiff = Math.abs(CAN_ROUTES[0].time - focusMinutes);
        for (let route of CAN_ROUTES) {
            let diff = Math.abs(route.time - focusMinutes);
            if (diff < minDiff) {
                minDiff = diff;
                bestMatch = route;
            }
        }
        return bestMatch.dest;
    }
    // ================= 视图路由 =================
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F5F5F7');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.currentPage === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.HomeView.bind(this)();
                });
            }
            else if (this.currentPage === 1) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.CalendarView.bind(this)();
                });
            }
            else if (this.currentPage === 2) {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.TaskSettingView.bind(this)();
                });
            }
            else if (this.currentPage === 3) {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.ScheduleListView.bind(this)();
                });
            }
            else if (this.currentPage === 4) {
                this.ifElseBranchUpdateFunction(4, () => {
                    this.CountdownView.bind(this)();
                });
            }
            else if (this.currentPage === 5) {
                this.ifElseBranchUpdateFunction(5, () => {
                    this.StoreView.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(6, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Stack.pop();
    }
    // 1. 首页
    HomeView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 玩家信息面板
            Column.create({ space: 10 });
            // 玩家信息面板
            Column.width('90%');
            // 玩家信息面板
            Column.padding(20);
            // 玩家信息面板
            Column.margin({ top: 50 });
            // 玩家信息面板
            Column.borderRadius(20);
            // 玩家信息面板
            Column.linearGradient({ direction: GradientDirection.Right, colors: [['#1E3C72', 0.0], ['#2A5298', 1.0]] });
            // 玩家信息面板
            Column.shadow({ radius: 10, color: '#20000000', offsetY: 5 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`✈️ 广州白云国际机场`);
            Text.fontSize(24);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFF');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`机场等级: Lv.${this.airportLevel}`);
            Text.fontSize(16);
            Text.fontColor('#E0E0E0');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`💰 航空币: ${this.coinBalance}`);
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#FFD700');
        }, Text);
        Text.pop();
        // 玩家信息面板
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
            Column.margin({ top: 30 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('规划新航班');
            Button.width('85%');
            Button.height(60);
            Button.borderRadius(15);
            Button.fontSize(18);
            Button.fontWeight(FontWeight.Medium);
            Button.linearGradient({ direction: GradientDirection.Right, colors: [['#007DFF', 0.0], ['#40A9FF', 1.0]] });
            Button.onClick(() => {
                this.selectedDate = new Date();
                this.updateCalendarDays();
                this.currentPage = 1;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('已列出航班');
            Button.width('85%');
            Button.height(60);
            Button.borderRadius(15);
            Button.fontSize(18);
            Button.fontWeight(FontWeight.Medium);
            Button.backgroundColor('#FFF');
            Button.fontColor('#007DFF');
            Button.border({ width: 1, color: '#007DFF' });
            Button.onClick(() => this.currentPage = 3);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('航空商城 & 机库');
            Button.width('85%');
            Button.height(60);
            Button.borderRadius(15);
            Button.fontSize(18);
            Button.fontWeight(FontWeight.Medium);
            Button.backgroundColor('#FFF');
            Button.fontColor('#FF9800');
            Button.border({ width: 1, color: '#FF9800' });
            Button.onClick(() => this.currentPage = 5);
        }, Button);
        Button.pop();
        Column.pop();
        Column.pop();
    }
    // 2. 日历选择页
    CalendarView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
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
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('<');
            Text.fontSize(20);
            Text.padding(10);
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
            Text.create('>');
            Text.fontSize(20);
            Text.padding(10);
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
            Row.margin({ bottom: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const w = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(w);
                    Text.layoutWeight(1);
                    Text.textAlign(TextAlign.Center);
                    Text.fontColor('#999');
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, ['日', '一', '二', '三', '四', '五', '六'], forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            GridRow.create({ columns: 7, gutter: 5 });
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
                                Column.create();
                                Column.width('100%');
                                Column.height(55);
                                Column.justifyContent(FlexAlign.Center);
                                Column.backgroundColor(this.isSelectedDay(day) ? '#007DFF' : 'transparent');
                                Column.borderRadius(12);
                                Column.onClick(() => this.selectedDate = new Date(this.displayYear, this.displayMonth, day));
                            }, Column);
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(day.toString());
                                Text.fontColor(this.isSelectedDay(day) ? '#FFF' : '#333');
                                Text.fontWeight(FontWeight.Medium);
                            }, Text);
                            Text.pop();
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                If.create();
                                if (this.hasSchedule(day)) {
                                    this.ifElseBranchUpdateFunction(0, () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Circle.create();
                                            Circle.width(6);
                                            Circle.height(6);
                                            Circle.fill('#FF4D4F');
                                            Circle.margin({ top: 4 });
                                        }, Circle);
                                    });
                                }
                                else {
                                    this.ifElseBranchUpdateFunction(1, () => {
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
                GridCol.pop();
            };
            this.forEachUpdateFunction(elmtId, this.daysInMonthList, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        GridRow.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 15 });
            Row.padding({ bottom: 40 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('返回');
            Button.width('40%');
            Button.height(55);
            Button.backgroundColor('#E8E8E8');
            Button.fontColor('#666');
            Button.borderRadius(15);
            Button.onClick(() => this.currentPage = 0);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('下一步');
            Button.width('40%');
            Button.height(55);
            Button.borderRadius(15);
            Button.backgroundColor('#007DFF');
            Button.onClick(() => {
                this.tempTaskType = '';
                this.tempStartTime = new Date(this.selectedDate);
                this.tempEndTime = new Date(this.selectedDate);
                this.tempEndTime.setHours(this.tempStartTime.getHours() + 1);
                this.currentPage = 2;
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    // 3. 设置页
    TaskSettingView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 25 });
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('设定飞行任务');
            Text.fontSize(26);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ top: 40 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ placeholder: '在此输入专注内容...', text: this.tempTaskType });
            TextInput.width('90%');
            TextInput.height(60);
            TextInput.borderRadius(12);
            TextInput.padding({ left: 20 });
            TextInput.onChange(v => this.tempTaskType = v);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('选择起飞与降落时间 (决定航线)');
            Text.width('90%');
            Text.fontColor('#666');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TimePicker.create({ selected: this.tempStartTime });
            TimePicker.useMilitaryTime(true);
            TimePicker.height(120);
            TimePicker.onChange(v => this.tempStartTime.setHours(v.hour, v.minute));
        }, TimePicker);
        TimePicker.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TimePicker.create({ selected: this.tempEndTime });
            TimePicker.useMilitaryTime(true);
            TimePicker.height(120);
            TimePicker.onChange(v => this.tempEndTime.setHours(v.hour, v.minute));
        }, TimePicker);
        TimePicker.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('保存飞行计划');
            Button.width('90%');
            Button.height(60);
            Button.borderRadius(15);
            Button.backgroundColor('#007DFF');
            Button.onClick(() => {
                let item = new ScheduleItem();
                item.id = Date.now();
                item.taskType = this.tempTaskType || '未命名任务';
                item.startTime = new Date(this.tempStartTime);
                item.endTime = new Date(this.tempEndTime);
                this.scheduleList.push(item);
                this.saveData();
                this.currentPage = 1;
            });
            Button.margin({ bottom: 40 });
        }, Button);
        Button.pop();
        Column.pop();
    }
    // 4. 航班列表页
    ScheduleListView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('航班管理中心');
            Text.fontSize(26);
            Text.fontWeight(FontWeight.Bold);
            Text.margin(30);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 15 });
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
                            Column.padding(20);
                            Column.backgroundColor('#FFF');
                            Column.width('92%');
                            Column.borderRadius(18);
                            Column.shadow({ radius: 15, color: '#10000000', offsetX: 0, offsetY: 8 });
                            Column.onClick(() => {
                                this.dialogController = new CustomDialogController({
                                    builder: () => {
                                        let jsDialog = new ActionDialog(this, {
                                            item: item,
                                            onStart: (it: ScheduleItem): void => this.startCountdown(it),
                                            onDelete: (id: number): void => this.deleteSchedule(id)
                                        }, undefined, -1, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 352, col: 26 });
                                        jsDialog.setController(this.dialogController);
                                        ViewPU.create(jsDialog);
                                        let paramsLambda = () => {
                                            return {
                                                item: item,
                                                onStart: (it: ScheduleItem): void => this.startCountdown(it),
                                                onDelete: (id: number): void => this.deleteSchedule(id)
                                            };
                                        };
                                        jsDialog.paramsGenerator_ = paramsLambda;
                                    },
                                    autoCancel: true,
                                    alignment: DialogAlignment.Center
                                }, this);
                                this.dialogController.open();
                            });
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.width('100%');
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(item.taskType);
                            Text.fontSize(18);
                            Text.fontWeight(FontWeight.Bold);
                            Text.fontColor('#007DFF');
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Blank.create();
                        }, Blank);
                        Blank.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`${item.startTime.getMonth() + 1}/${item.startTime.getDate()}`);
                            Text.fontSize(14);
                            Text.fontColor('#999');
                        }, Text);
                        Text.pop();
                        Row.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Row.create();
                            Row.margin({ top: 8 });
                        }, Row);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(`${padZero(item.startTime.getHours())}:${padZero(item.startTime.getMinutes())} 起飞 ~ ${padZero(item.endTime.getHours())}:${padZero(item.endTime.getMinutes())} 降落`);
                            Text.fontSize(15);
                            Text.fontColor('#666');
                        }, Text);
                        Text.pop();
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('返回总控中心');
            Button.width('85%');
            Button.height(55);
            Button.borderRadius(15);
            Button.backgroundColor('#F0F0F0');
            Button.fontColor('#333');
            Button.margin({ bottom: 40 });
            Button.onClick(() => this.currentPage = 0);
        }, Button);
        Button.pop();
        Column.pop();
    }
    // 5. 倒计时（飞行中）页面
    CountdownView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 40 });
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.activeItem.taskType);
            Text.fontSize(28);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ top: 80 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`🛫 广州白云 ➔ 🛬 ${this.currentRouteDest}`);
            Text.fontColor('#FF9800');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('巡航中，请保持专注...');
            Text.fontColor('#007DFF');
            Text.fontSize(16);
            Text.margin({ top: 10 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 倒计时圆环模拟
            Stack.create();
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Circle.create({ width: 250, height: 250 });
            Circle.fill('transparent');
            Circle.stroke('#E8E8E8');
            Circle.strokeWidth(15);
        }, Circle);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.formatRemainingTime());
            Text.fontSize(48);
            Text.fontWeight(FontWeight.Lighter);
            Text.fontColor('#1F1F1F');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('距降落还有');
            Text.fontSize(14);
            Text.fontColor('#999');
        }, Text);
        Text.pop();
        Column.pop();
        // 倒计时圆环模拟
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('紧急返航 (放弃收益)');
            Button.width('70%');
            Button.height(60);
            Button.borderRadius(30);
            Button.backgroundColor('#FF4D4F');
            Button.onClick(() => {
                clearInterval(this.timerId);
                this.currentPage = 3;
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    // 6. 航空商城页面 (新功能)
    StoreView(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('航空商城');
            Text.fontSize(26);
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ top: 40, bottom: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`我的资产: 💰 ${this.coinBalance}`);
            Text.fontSize(20);
            Text.fontColor('#FF9800');
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ bottom: 30 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 15 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 升级机场
            Row.create();
            // 升级机场
            Row.width('90%');
            // 升级机场
            Row.padding(20);
            // 升级机场
            Row.backgroundColor('#FFF');
            // 升级机场
            Row.borderRadius(15);
            // 升级机场
            Row.shadow({ radius: 5, color: '#10000000' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('升级白云机场');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`当前等级: Lv.${this.airportLevel} -> 消耗 500 航空币`);
            Text.fontSize(14);
            Text.fontColor('#666');
            Text.margin({ top: 5 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('升级');
            Button.height(40);
            Button.backgroundColor(this.coinBalance >= 500 ? '#007DFF' : '#CCC');
            Button.onClick(() => {
                if (this.coinBalance >= 500) {
                    this.coinBalance -= 500;
                    this.airportLevel += 1;
                    this.saveData();
                }
            });
        }, Button);
        Button.pop();
        // 升级机场
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 购买飞机 (示例)
            Row.create();
            // 购买飞机 (示例)
            Row.width('90%');
            // 购买飞机 (示例)
            Row.padding(20);
            // 购买飞机 (示例)
            Row.backgroundColor('#FFF');
            // 购买飞机 (示例)
            Row.borderRadius(15);
            // 购买飞机 (示例)
            Row.shadow({ radius: 5, color: '#10000000' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('解锁: 空客 A380');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Medium);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('长途洲际客机 -> 消耗 1000 航空币');
            Text.fontSize(14);
            Text.fontColor('#666');
            Text.margin({ top: 5 });
        }, Text);
        Text.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.unlockedPlanes.includes('空客 A380') ? '已拥有' : '购买');
            Button.height(40);
            Button.backgroundColor(this.unlockedPlanes.includes('空客 A380') ? '#4CAF50' : (this.coinBalance >= 1000 ? '#FF9800' : '#CCC'));
            Button.enabled(!this.unlockedPlanes.includes('空客 A380'));
            Button.onClick(() => {
                if (this.coinBalance >= 1000 && !this.unlockedPlanes.includes('空客 A380')) {
                    this.coinBalance -= 1000;
                    this.unlockedPlanes.push('空客 A380');
                    this.saveData();
                }
            });
        }, Button);
        Button.pop();
        // 购买飞机 (示例)
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('返回总控中心');
            Button.width('85%');
            Button.height(55);
            Button.borderRadius(15);
            Button.backgroundColor('#E8E8E8');
            Button.fontColor('#333');
            Button.margin({ bottom: 40 });
            Button.onClick(() => this.currentPage = 0);
        }, Button);
        Button.pop();
        Column.pop();
    }
    // ================= 核心业务方法 =================
    deleteSchedule(id: number) {
        this.scheduleList = this.scheduleList.filter(it => it.id !== id);
        this.saveData();
    }
    startCountdown(item: ScheduleItem) {
        this.activeItem = item;
        // 计算总秒数: (结束时间 - 开始时间)
        let durationMs = item.endTime.getTime() - item.startTime.getTime();
        this.remainingSeconds = Math.max(0, Math.floor(durationMs / 1000));
        // 自动匹配航线
        let focusMinutes = Math.floor(durationMs / 60000);
        this.currentRouteDest = this.matchFlightRoute(focusMinutes);
        this.currentPage = 4;
        // 启动定时器
        if (this.timerId !== -1)
            clearInterval(this.timerId);
        this.timerId = setInterval(() => {
            if (this.remainingSeconds > 0) {
                this.remainingSeconds--;
            }
            else {
                // 倒计时自然结束，发放奖励
                clearInterval(this.timerId);
                this.coinBalance += focusMinutes; // 一分钟专注 = 1 航空币
                this.saveData();
                this.currentPage = 0; // 回到首页看收益
            }
        }, 1000);
    }
    formatRemainingTime(): string {
        let h = Math.floor(this.remainingSeconds / 3600);
        let m = Math.floor((this.remainingSeconds % 3600) / 60);
        let s = this.remainingSeconds % 60;
        return `${padZero(h)}:${padZero(m)}:${padZero(s)}`;
    }
    private hasSchedule(day: number): boolean {
        return this.scheduleList.some(i => i.startTime.getDate() === day && i.startTime.getMonth() === this.displayMonth && i.startTime.getFullYear() === this.displayYear);
    }
    private isSelectedDay(day: number): boolean {
        return this.selectedDate.getDate() === day && this.selectedDate.getMonth() === this.displayMonth && this.selectedDate.getFullYear() === this.displayYear;
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "SchedulePlanner";
    }
}
registerNamedRoute(() => new SchedulePlanner(undefined, {}), "", { bundleName: "com.example.class1", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
