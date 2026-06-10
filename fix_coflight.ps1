$filePath = "C:\Users\32839\DevEcoStudioProjects\class1\entry\src\main\ets\pages\FlightConcentrator.ets"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$lines = $content -split "`r`n"

$newBlock = @"
  @Builder CoFlightView() {
    Column() {
      this.StepHeader('共享航班 (Codeshare)', 0)

      if (this.activeCoFlight) {
        Column({ space: 12 }) {
          Text('航班 ' + this.activeCoFlight!.flightNumber).fontSize(24).fontWeight(FontWeight.Bold).fontColor('#FFF')
          Text('目的地: ' + this.activeCoFlight!.destName + ' (' + this.activeCoFlight!.destIata + ')').fontColor('#00E5FF').fontSize(16)
          Text('时长: ' + this.activeCoFlight!.durationMinutes + ' 分钟').fontColor('rgba(255,255,255,0.7)').fontSize(14)
          Text('参与人数: ' + this.activeCoFlight!.participants.length).fontColor('#FFD700').fontSize(14)
          Divider().color('rgba(255,255,255,0.1)')

          if (this.activeCoFlight.status === 'waiting') {
            if (this.activeCoFlight.creatorUid === this.myUid) {
              Button('起飞执飞').width('80%').height(55).backgroundColor('#00E5FF').fontColor('#000')
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
              Button('加入共享航班').width('80%').height(55).backgroundColor('#E91E63').fontColor('#FFF')
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

      // ===== 创建新共享航班区域 =====
      Column({ space: 12 }) {
        Text('创建新共享航班').fontSize(16).fontWeight(FontWeight.Bold).fontColor('#FFD700').width('100%')

        Text('选择目的地机场:').fontSize(13).fontColor('rgba(255,255,255,0.6)').width('100%')

        Scroll() {
          Row({ space: 10 }) {
            ForEach(this.candidateAirports, (apt: Airport) => {
              Button(apt.iata + ' ' + apt.name)
                .height(36).padding({ left: 12, right: 12 })
                .backgroundColor(this.selectedAirport?.iata === apt.iata ? '#E91E63' : 'rgba(255,255,255,0.1)')
                .fontColor(this.selectedAirport?.iata === apt.iata ? '#FFF' : 'rgba(255,255,255,0.7)')
                .fontSize(13).borderRadius(18)
                .border({ width: 1, color: this.selectedAirport?.iata === apt.iata ? '#E91E63' : 'rgba(255,255,255,0.2)' })
                .onClick(() => this.selectedAirport = apt)
            })
          }.padding({ left: 4, right: 4 })
        }.scrollable(ScrollDirection.Horizontal).scrollBar(BarState.Off).width('100%').height(44)

        if (this.selectedAirport) {
          Text('已选: ' + this.selectedAirport!.name + ' | 航程: ' + this.selectedAirport!.time + ' 分钟')
            .fontColor('#00E5FF').fontSize(13).width('100%')
        }

        TextInput({ placeholder: '输入本次专注任务 (如: 阅读文献)', text: this.coFlightTaskInput })
          .width('100%').height(48).backgroundColor('rgba(255,255,255,0.08)').fontColor('#FFF')
          .placeholderColor('rgba(255,255,255,0.4)').borderRadius(14)
          .border({ width: 1, color: 'rgba(255,255,255,0.2)' })
          .onChange(v => {
            this.coFlightTaskInput = v;
            this.tempTaskType = v;
          })

        if (this.coFlightJoinMsg && !this.coFlightJoinMsg.includes('成功') && !this.coFlightJoinMsg.includes('已在')) {
          Text(this.coFlightJoinMsg).fontColor('#FF5252').fontSize(13).width('100%')
        }

        Button('创建共享航班')
          .width('100%').height(50)
          .backgroundColor(this.selectedAirport && this.coFlightTaskInput.trim() ? '#E91E63' : 'rgba(255,255,255,0.1)')
          .fontColor(this.selectedAirport && this.coFlightTaskInput.trim() ? '#FFF' : 'rgba(255,255,255,0.3)')
          .borderRadius(16).fontWeight(FontWeight.Bold)
          .enabled(this.selectedAirport !== null && this.coFlightTaskInput.trim().length > 0)
          .onClick(() => this.createCoFlightSession())
      }.width('90%').padding(20).margin({ top: 15 }).glassEffect()

      // ===== 可加入的航班列表 =====
      if (this.coFlightSessions.length > 0) {
        Divider().color('rgba(255,255,255,0.1)').margin({ top: 15, bottom: 8 }).width('90%')
        Text('可用共享航班').fontColor('rgba(255,255,255,0.5)').fontSize(13).width('90%')

        List({ space: 10 }) {
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
                Button('加入').height(40).backgroundColor('#E91E63').fontColor('#FFF')
                  .borderRadius(12).fontSize(14)
                  .onClick(() => {
                    this.activeCoFlight = session;
                    this.coFlightJoinMsg = '';
                    this.coFlightTaskInput = '';
                  })
              }.width('100%').padding(15).backgroundColor('rgba(255,255,255,0.06)').borderRadius(14)
                .border({ width: 1, color: 'rgba(255,255,255,0.1)' })
            }
          })
        }.layoutWeight(1).width('90%').margin({ top: 8, bottom: 20 })
      } else {
        Text('暂无共享航班，创建第一个吧').fontColor('rgba(255,255,255,0.4)').fontSize(13)
          .layoutWeight(1).width('90%').textAlign(TextAlign.Center)
      }
    }.height('100%')
  }
"@

# Lines to replace: 1384 to 1455 (0-indexed: 1383 to 1454)
$newLines = @()
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($i -ge 1383 -and $i -le 1454) {
        if ($i -eq 1383) {
            $newLines += $newBlock
        }
        # skip old lines
    } else {
        $newLines += $lines[$i]
    }
}

$result = $newLines -join "`r`n"
[System.IO.File]::WriteAllText($filePath, $result, [System.Text.Encoding]::UTF8)
Write-Output "Done! Replaced lines 1384-1455"
