# Fix script for FlightConcentrator.ets
$file = "C:\Users\32839\DevEcoStudioProjects\class1\entry\src\main\ets\pages\FlightConcentrator.ets"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

# Find createCoFlightSession method boundaries  
$oldStart = $content.IndexOf('// ================= ' + [char]0x5171 + [char]0x4EAB + [char]0x822A + [char]0x73ED + ' (Codeshare) ' + [char]0x7CFB + [char]0x7EDF + ' =================')
$methodEnd = $content.IndexOf('joinCoFlight(session:', $oldStart)

if ($oldStart -lt 0 -or $methodEnd -lt 0) {
    Write-Host "ERROR: Could not find createCoFlightSession boundaries"
    exit 1
}

$newMethod = @"
// ================= 共享航班(Codeshare)系统 =================
  createCoFlightSession() {
    if (this.friendsList.length === 0) {
      this.coFlightCreateMsg = '请先在好友系统中添加好友';
      return;
    }
    if (this.ownedPlanes.length === 0) {
      this.coFlightCreateMsg = '请先在航空商店中购买飞机';
      return;
    }
    this.coFlightCreateMsg = '';
    // 统一创建流程：复用普通任务的 CalendarView → TaskSettingView → RoutePickerView → PlanePickerForFlightView
    // 在确认机型后，通过 isCreatingCoFlight 标志弹出好友选择对话框
    this.isCreatingCoFlight = true;
    this.currentPage = 1; // 跳转到 CalendarView（第1步：确定航行日期）
  }

"@

$newContent = $content.Substring(0, $oldStart) + $newMethod + $content.Substring($methodEnd)
[System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)
Write-Host "Step 1: Fixed createCoFlightSession. Length: $($newContent.Length)"
exit 0
