import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';
// ==========================================
// 数据模型
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

function padZero(num: number): string {
  return num < 10 ? '0' + num : num.toString();
}

// ==========================================
// 悬浮选择弹窗组件
// ==========================================
@CustomDialog
struct ActionDialog {
  controller: CustomDialogController;
  item: ScheduleItem = new ScheduleItem();
  onStart: (item: ScheduleItem) => void = () => {};
  onDelete: (id: number) => void = () => {};

  build() {
    Column({ space: 15 }) {
      Text(`日程操作: ${this.item.taskType}`).fontSize(18).fontWeight(FontWeight.Bold).margin({ bottom: 10 })

      Button('开始日程 (进入倒计时)')
        .width('100%')
        .height(50)
        .backgroundColor('#007DFF')
        .onClick(() => {
          this.onStart(this.item);
          this.controller.close();
        })

      Button('取消日程 (彻底删除)')
        .width('100%')
        .height(50)
        .backgroundColor('#FF4D4F')
        .onClick(() => {
          this.onDelete(this.item.id);
          this.controller.close();
        })

      Text('返回').fontSize(14).fontColor('#666').onClick(() => this.controller.close())
    }
    .padding(25)
    .backgroundColor('#FFF')
    .borderRadius(20)
  }
}

@Entry
@Component
struct SchedulePlanner {
  // 页面状态：0-首页, 1-日历, 2-设置, 3-列表, 4-倒计时
  @State currentPage: number = 0;
  @State scheduleList: Array<ScheduleItem> = [];

  // 日历逻辑
  @State displayYear: number = new Date().getFullYear();
  @State displayMonth: number = new Date().getMonth();
  @State daysInMonthList: (number | null)[] = [];
  @State selectedDate: Date = new Date();

  // 临时任务数据
  @State tempTaskType: string = '';
  @State tempStartTime: Date = new Date();
  @State tempEndTime: Date = new Date();

  // 倒计时逻辑
  @State activeItem: ScheduleItem = new ScheduleItem();
  @State remainingSeconds: number = 0;
  private timerId: number = -1;

  // 弹窗控制器
  private dialogController: CustomDialogController | null = null;

  private context = getContext(this) as common.UIAbilityContext;
  private pref = preferences.getPreferencesSync(this.context, { name: 'my_schedule_prefs' });

  aboutToAppear() {
    this.loadData();
    this.updateCalendarDays();
  }

  // ================= 数据持久化 =================
  loadData() {
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
  }

  saveData() {
    this.pref.putSync('schedule_list', JSON.stringify(this.scheduleList));
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

  // ================= 视图路由 =================
  build() {
    Stack() {
      Column() {
        if (this.currentPage === 0) this.HomeView();
        else if (this.currentPage === 1) this.CalendarView();
        else if (this.currentPage === 2) this.TaskSettingView();
        else if (this.currentPage === 3) this.ScheduleListView();
        else if (this.currentPage === 4) this.CountdownView();
      }
      .width('100%').height('100%').backgroundColor('#F5F5F7')
    }
  }

  // 1. 首页
  @Builder HomeView() {
    Column({ space: 30 }) {
      Image($r('app.media.foreground')).width(100).height(100).margin({ top: 100 }).borderRadius(20)
      Text('日程规划助手').fontSize(32).fontWeight(FontWeight.Bold).fontColor('#1F1F1F')

      Column({ space: 15 }) {
        Button('规划新日程')
          .width('85%').height(60).borderRadius(15).fontSize(18).fontWeight(FontWeight.Medium)
          .linearGradient({ direction: GradientDirection.Right, colors: [['#007DFF', 0.0], ['#40A9FF', 1.0]] })
          .onClick(() => {
            this.selectedDate = new Date();
            this.updateCalendarDays();
            this.currentPage = 1;
          })

        Button('已规划日程')
          .width('85%').height(60).borderRadius(15).fontSize(18).fontWeight(FontWeight.Medium)
          .backgroundColor('#FFF').fontColor('#007DFF').border({ width: 1, color: '#007DFF' })
          .onClick(() => this.currentPage = 3)
      }
    }.width('100%')
  }

  // 2. 日历选择页
  @Builder CalendarView() {
    Column() {
      Row() {
        Text(`${this.displayYear}年${this.displayMonth + 1}月`).fontSize(24).fontWeight(FontWeight.Bold)
        Blank()
        Row() {
          Text('<').fontSize(20).padding(10).onClick(() => {
            if (this.displayMonth === 0) { this.displayMonth = 11; this.displayYear--; }
            else { this.displayMonth--; }
            this.updateCalendarDays();
          })
          Text('>').fontSize(20).padding(10).onClick(() => {
            if (this.displayMonth === 11) { this.displayMonth = 0; this.displayYear++; }
            else { this.displayMonth++; }
            this.updateCalendarDays();
          })
        }
      }.padding(20).width('100%')

      Row() {
        ForEach(['日', '一', '二', '三', '四', '五', '六'], (w: string) => {
          Text(w).layoutWeight(1).textAlign(TextAlign.Center).fontColor('#999')
        })
      }.width('100%').margin({ bottom: 10 })

      GridRow({ columns: 7, gutter: 5 }) {
        ForEach(this.daysInMonthList, (day: number | null) => {
          GridCol() {
            if (day !== null) {
              Column() {
                Text(day.toString()).fontColor(this.isSelectedDay(day) ? '#FFF' : '#333').fontWeight(FontWeight.Medium)
                if (this.hasSchedule(day)) Circle().width(6).height(6).fill('#FF4D4F').margin({ top: 4 })
              }
              .width('100%').height(55).justifyContent(FlexAlign.Center)
              .backgroundColor(this.isSelectedDay(day) ? '#007DFF' : 'transparent')
              .borderRadius(12)
              .onClick(() => this.selectedDate = new Date(this.displayYear, this.displayMonth, day))
            }
          }
        })
      }.padding(15)

      Blank()
      Row({ space: 15 }) {
        Button('返回').width('40%').height(55).backgroundColor('#E8E8E8').fontColor('#666').borderRadius(15).onClick(() => this.currentPage = 0)
        Button('下一步').width('40%').height(55).borderRadius(15).backgroundColor('#007DFF').onClick(() => {
          this.tempTaskType = '';
          this.tempStartTime = new Date(this.selectedDate);
          this.tempEndTime = new Date(this.selectedDate);
          this.tempEndTime.setHours(this.tempStartTime.getHours() + 1);
          this.currentPage = 2;
        })
      }.padding({ bottom: 40 })
    }.height('100%')
  }

  // 3. 设置页
  @Builder TaskSettingView() {
    Column({ space: 25 }) {
      Text('任务规划').fontSize(26).fontWeight(FontWeight.Bold).margin({ top: 40 })

      TextInput({ placeholder: '在此输入任务类型...', text: this.tempTaskType })
        .width('90%').height(60).borderRadius(12).padding({ left: 20 })
        .onChange(v => this.tempTaskType = v)

      Column({ space: 10 }) {
        Text('选择起止时间').width('90%').fontColor('#666')
        TimePicker({ selected: this.tempStartTime }).useMilitaryTime(true).height(120).onChange(v => this.tempStartTime.setHours(v.hour, v.minute))
        TimePicker({ selected: this.tempEndTime }).useMilitaryTime(true).height(120).onChange(v => this.tempEndTime.setHours(v.hour, v.minute))
      }

      Blank()
      Button('保存并完成').width('90%').height(60).borderRadius(15).backgroundColor('#007DFF')
        .onClick(() => {
          let item = new ScheduleItem();
          item.id = Date.now();
          item.taskType = this.tempTaskType || '未命名任务';
          item.startTime = new Date(this.tempStartTime);
          item.endTime = new Date(this.tempEndTime);
          this.scheduleList.push(item);
          this.saveData();
          this.currentPage = 1;
        })
        .margin({ bottom: 40 })
    }.height('100%')
  }

  // 4. 日程列表页 (包含弹窗逻辑)
  @Builder ScheduleListView() {
    Column() {
      Text('已规划日程').fontSize(26).fontWeight(FontWeight.Bold).margin(30)

      List({ space: 15 }) {
        ForEach(this.scheduleList, (item: ScheduleItem) => {
          ListItem() {
            Column() {
              Row() {
                Text(item.taskType).fontSize(18).fontWeight(FontWeight.Bold).fontColor('#007DFF')
                Blank()
                Text(`${item.startTime.getMonth()+1}/${item.startTime.getDate()}`).fontSize(14).fontColor('#999')
              }.width('100%')

              Row() {
                Text(`${padZero(item.startTime.getHours())}:${padZero(item.startTime.getMinutes())} ~ ${padZero(item.endTime.getHours())}:${padZero(item.endTime.getMinutes())}`)
                  .fontSize(15).fontColor('#666')
              }.margin({ top: 8 })
            }
            .padding(20).backgroundColor('#FFF').width('92%').borderRadius(18)
            .shadow({ radius: 15, color: '#10000000', offsetX: 0, offsetY: 8 })
            .onClick(() => {
              // 弹出选择框
              this.dialogController = new CustomDialogController({
                builder: ActionDialog({
                  item: item,
                  onStart: (it: ScheduleItem): void => this.startCountdown(it),
                  onDelete: (id: number): void => this.deleteSchedule(id)
                }),
                autoCancel: true,
                alignment: DialogAlignment.Center
              });
              this.dialogController.open();
            })
          }
        })
      }.layoutWeight(1).alignListItem(ListItemAlign.Center)

      Button('返回主页').width('85%').height(55).borderRadius(15).backgroundColor('#F0F0F0').fontColor('#333').margin({ bottom: 40 }).onClick(() => this.currentPage = 0)
    }.height('100%')
  }

  // 5. 倒计时页面
  @Builder CountdownView() {
    Column({ space: 40 }) {
      Column({ space: 10 }) {
        Text(this.activeItem.taskType).fontSize(28).fontWeight(FontWeight.Bold).margin({ top: 100 })
        Text('正在进行中...').fontColor('#007DFF').fontSize(16)
      }

      // 倒计时圆环模拟
      Stack() {
        Circle({ width: 250, height: 250 }).fill('transparent').stroke('#E8E8E8').strokeWidth(15)
        Column() {
          Text(this.formatRemainingTime()).fontSize(48).fontWeight(FontWeight.Lighter).fontColor('#1F1F1F')
          Text('剩余时间').fontSize(14).fontColor('#999')
        }
      }

      Button('结束日程')
        .width('70%').height(60).borderRadius(30).backgroundColor('#FF4D4F')
        .onClick(() => {
          clearInterval(this.timerId);
          this.currentPage = 3;
        })
    }.width('100%').height('100%')
  }

  // ================= 辅助方法 =================
  deleteSchedule(id: number) {
    this.scheduleList = this.scheduleList.filter(it => it.id !== id);
    this.saveData();
  }

  startCountdown(item: ScheduleItem) {
    this.activeItem = item;
    // 计算总秒数: (结束时间 - 开始时间)
    let duration = item.endTime.getTime() - item.startTime.getTime();
    this.remainingSeconds = Math.max(0, Math.floor(duration / 1000));
    this.currentPage = 4;

    // 启动定时器
    if (this.timerId !== -1) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.remainingSeconds > 0) {
        this.remainingSeconds--;
      } else {
        clearInterval(this.timerId);
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
}