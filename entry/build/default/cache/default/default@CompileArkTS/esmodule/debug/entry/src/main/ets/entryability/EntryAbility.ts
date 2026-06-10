import AbilityConstant from "@ohos:app.ability.AbilityConstant";
import ConfigurationConstant from "@ohos:app.ability.ConfigurationConstant";
import UIAbility from "@ohos:app.ability.UIAbility";
import type Want from "@ohos:app.ability.Want";
import hilog from "@ohos:hilog";
import type window from "@ohos:window";
import display from "@ohos:display";
import deviceInfo from "@ohos:deviceInfo";
import abilityAccessCtrl from "@ohos:abilityAccessCtrl";
import type { Permissions } from "@ohos:abilityAccessCtrl";
import type { BusinessError } from "@ohos:base";
const DOMAIN = 0x0000;
export default class EntryAbility extends UIAbility {
    private uiContext?: UIContext;
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        try {
            this.context.getApplicationContext().setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET);
        }
        catch (err) {
            hilog.error(DOMAIN, 'testTag', 'Failed to set colorMode. Cause: %{public}s', JSON.stringify(err));
        }
        // 申请分布式数据同步权限
        this.requestDistributedPermission();
        // ==========================================
        // 👇 新增：接收流转数据解析逻辑 👇
        // ==========================================
        if (launchParam.launchReason === AbilityConstant.LaunchReason.CONTINUATION) {
            if (want.parameters && want.parameters.currentPage !== undefined) {
                let continuedPage = want.parameters.currentPage as number;
                hilog.info(DOMAIN, 'testTag', `接收到流转页面索引: ${continuedPage}`);
                // 将接收到的页面索引存入全局存储，等待 FlightConcentrator 页面启动时读取
                AppStorage.setOrCreate('targetPageFromContinuation', continuedPage);
            }
        }
    }
    // ==========================================
    // 👇 新增：发起流转数据打包逻辑 👇
    // ==========================================
    onContinue(wantParam: Record<string, Object>): AbilityConstant.OnContinueResult {
        hilog.info(DOMAIN, 'testTag', 'Ability onContinue triggered');
        // 从全局存储中读取当前页面，打包发送给目标设备
        let currentPage = AppStorage.get<number>('currentActivePage') || 0;
        wantParam.currentPage = currentPage;
        hilog.info(DOMAIN, 'testTag', `准备流转页面索引: ${currentPage}`);
        return AbilityConstant.OnContinueResult.AGREE;
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        windowStage.loadContent('pages/FlightConcentrator', (err) => {
            if (err.code) {
                hilog.error(DOMAIN, 'testTag', 'Failed to load the content. Cause: %{public}s', JSON.stringify(err));
                return;
            }
            try {
                let dt = deviceInfo.deviceType;
                AppStorage.setOrCreate('deviceType', dt);
                hilog.info(DOMAIN, 'testTag', 'deviceType: %{public}s', dt);
            }
            catch (e) {
                AppStorage.setOrCreate('deviceType', 'phone');
            }
            windowStage.getMainWindow().then((mainWindow: window.Window) => {
                this.uiContext = mainWindow.getUIContext();
                this.updateBreakpoint(mainWindow);
                mainWindow.on('windowSizeChange', (size: window.Size) => {
                    this.updateBreakpoint(mainWindow);
                });
            }).catch((err: Error) => {
                hilog.error(DOMAIN, 'testTag', 'Failed to get main window: %{public}s', JSON.stringify(err));
            });
        });
    }
    // 申请分布式数据同步权限
    private requestDistributedPermission(): void {
        let atManager = abilityAccessCtrl.createAtManager();
        let permissions: Array<Permissions> = ['ohos.permission.DISTRIBUTED_DATASYNC'];
        atManager.requestPermissionsFromUser(this.context, permissions).then((data) => {
            let grantStatus: Array<number> = data.authResults;
            if (grantStatus.length > 0 && grantStatus[0] === 0) {
                hilog.info(DOMAIN, 'testTag', 'DISTRIBUTED_DATASYNC permission granted');
                AppStorage.setOrCreate('distributedPermissionGranted', true);
            }
            else {
                hilog.warn(DOMAIN, 'testTag', 'DISTRIBUTED_DATASYNC permission denied');
                AppStorage.setOrCreate('distributedPermissionGranted', false);
            }
        }).catch((err: BusinessError) => {
            hilog.error(DOMAIN, 'testTag', 'Failed to request permission: %{public}s', JSON.stringify(err));
        });
    }
    private updateBreakpoint(win: window.Window): void {
        try {
            let windowWidth = win.getWindowProperties().windowRect.width;
            let density = display.getDefaultDisplaySync().densityPixels;
            let windowWidthVp = windowWidth / density;
            let breakpoint: string;
            if (windowWidthVp < 320) {
                breakpoint = 'xs';
            }
            else if (windowWidthVp < 600) {
                breakpoint = 'sm';
            }
            else if (windowWidthVp < 840) {
                breakpoint = 'md';
            }
            else if (windowWidthVp < 1440) {
                breakpoint = 'lg';
            }
            else {
                breakpoint = 'xl';
            }
            AppStorage.setOrCreate('currentBreakpoint', breakpoint);
        }
        catch (err) {
            hilog.error(DOMAIN, 'testTag', 'Failed to update breakpoint: %{public}s', JSON.stringify(err));
        }
    }
}
