$file = "C:\Users\32839\DevEcoStudioProjects\class1\entry\src\main\ets\pages\FlightConcentrator.ets"
$content = Get-Content $file -Encoding UTF8 -Raw
$oldStart = $content.IndexOf('// ================= '+[char]0x5171+[char]0x4EAB+[char]0x822A+[char]0x73ED+' (Codeshare) '+[char]0x7CFB+[char]0x7EDF+' =================')
$methodEnd = $content.IndexOf('joinCoFlight(session:', $oldStart)
Write-Host "oldStart=$oldStart, methodEnd=$methodEnd"
