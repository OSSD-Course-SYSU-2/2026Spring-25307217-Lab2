$f = "C:\Users\32839\DevEcoStudioProjects\class1\entry\src\main\ets\pages\FlightConcentrator.ets"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# Methods to insert
$methods = @"

  generateUid(): string {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let uid = '';
    for (let i = 0; i < 6; i++) {
      uid += chars[Math.floor(Math.random() * chars.length)];
    }
    return uid;
  }

  addFriendByUid(inputUid: string): boolean {
    if (!inputUid || inputUid.length !== 6) {
      this.friendAddMsg = '请输入6位UID';
      return false;
    }
    if (inputUid === this.myUid) {
      this.friendAddMsg = '不能添加自己';
      return false;
    }
    if (this.friendsList.find(f => f.uid === inputUid)) {
      this.friendAddMsg = '该好友已在列表中';
      return false;
    }
    this.friendsList.push({
      uid: inputUid,
      airlineName: '航空公司',
      airlineCode: inputUid.substring(0, 3),
      username: '飞友_' + inputUid
    });
    this.saveAllData();
    this.friendAddMsg = '好友添加成功！';
    return true;
  }

  removeFriend(uid: string): void {
    this.friendsList = this.friendsList.filter(f => f.uid !== uid);
    this.saveAllData();
  }

"@

$c = $c -replace '  @Builder RoutePickerView', ($methods + "  @Builder RoutePickerView")

[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Output "Methods inserted successfully"
