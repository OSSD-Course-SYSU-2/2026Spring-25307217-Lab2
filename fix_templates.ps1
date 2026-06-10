param($Path)

$bytes = [System.IO.File]::ReadAllBytes($Path)
$text = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fix template literals that lost their backticks during PS injection
# Pattern: Text(${...}) should be Text(`${...}`)
# Search for "${this." without preceding backtick

$count = 0

# Fix 1: friendsList.length
$old1 = 'Text(${this.friendsList.length}'
$new1 = 'Text(`${this.friendsList.length}'
if ($text.Contains($old1)) {
    $text = $text.Replace($old1, $new1)
    $count++
    Write-Output "Fixed 1: friendsList.length"
}

# Fix 2: myUid in ProfileView
$old2 = 'Text(${this.myUid})'
$new2 = 'Text(`${this.myUid}`)'
if ($text.Contains($old2)) {
    $text = $text.Replace($old2, $new2)
    $count++
    Write-Output "Fixed 2: myUid"
}

# Fix 3: activeCoFlight null safety - add ! assertions
# These are in onClick handlers where we know activeCoFlight is not null
# The issue is calling methods with activeCoFlight which is CoFlightSession | null

# Fix 4: Check for #CAF50 etc (color codes corrupted)
$old4 = '#CAF50'
$new4 = '#4CAF50'  
if ($text.Contains($old4)) {
    $text = $text.Replace($old4, $new4)
    $count++
    Write-Output "Fixed 4: #4CAF50"
}

$old5 = '#FF5252'
# This should be fine normally, but let's check
# The error says 'Cannot find name CAF50' which means #4CAF50 became #CAF50 (missing the 4)

[System.IO.File]::WriteAllBytes($Path, [System.Text.Encoding]::UTF8.GetBytes($text))
Write-Output "Total fixes applied: $count"
