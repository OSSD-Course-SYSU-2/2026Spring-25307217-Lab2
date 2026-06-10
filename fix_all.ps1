# Comprehensive fix script for FlightConcentrator.ets
$file = "C:\Users\32839\DevEcoStudioProjects\class1\entry\src\main\ets\pages\FlightConcentrator.ets"
$content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

Write-Host "Original length: $($content.Length)"

# === Fix 1: Remove orphaned createCoFlightSessionUnified dummy function ===
$marker1 = 'createCoFlightSessionUnified'
$idx1 = $content.IndexOf($marker1)
if ($idx1 -ge 0) {
    $startLine = $content.LastIndexOf("`n", $idx1)
    # Find end of this function (the closing brace after it)
    $closingBrace = $content.IndexOf("}", $idx1)
    # Find next newline after closing brace
    $nextNl = $content.IndexOf("`n", $closingBrace)
    # Find the blank line separator
    $endPos = $nextNl
    # Also include the extra blank line
    if ($content[$endPos+1] -eq "`n") { $endPos++ }
    if ($content[$endPos+1] -eq "`r") { $endPos++ }
    if ($content[$endPos+1] -eq "`n") { $endPos++ }
    
    $removeBlock = $content.Substring($startLine + 1, $endPos - $startLine)
    Write-Host "Removing createCoFlightSessionUnified block: $($removeBlock.Length) chars"
    $content = $content.Substring(0, $startLine + 1) + $content.Substring($endPos + 1)
}

# === Fix 2: Remove orphaned code between createCoFlightSession and joinCoFlight ===
$coFlightMarker = 'createCoFlightSession()'
$joinMarker = 'joinCoFlight(session:'
$coFlightIdx = $content.LastIndexOf($coFlightMarker)
$joinIdx = $content.IndexOf($joinMarker)
if ($coFlightIdx -ge 0 -and $joinIdx -gt $coFlightIdx) {
    # Find the closing brace of createCoFlightSession
    $bracePos = $content.IndexOf('}', $coFlightIdx)
    $nlPos = $content.IndexOf("`n", $bracePos)
    # Check if there's orphaned code between bracePos+1 and joinIdx
    $betweenContent = $content.Substring($nlPos + 1, $joinIdx - $nlPos - 1).Trim()
    if ($betweenContent.Length -gt 5) {
        Write-Host "Found orphaned code between createCoFlightSession and joinCoFlight: $($betweenContent.Length) chars"
        # Remove everything between the closing brace of createCoFlightSession and joinCoFlight
        $content = $content.Substring(0, $nlPos + 1) + $content.Substring($joinIdx)
        $joinIdx = $content.IndexOf($joinMarker)
    }
}

# === Fix 3: Remove orphaned code between joinCoFlight and startCoFlight ===
$joinIdx = $content.IndexOf('joinCoFlight(session:')
$startIdx = $content.IndexOf('startCoFlight(session:')
if ($joinIdx -ge 0 -and $startIdx -gt $joinIdx) {
    $bracePos = $content.IndexOf('}', $joinIdx)
    # Find next newline
    $nlPos = $content.IndexOf("`n", $bracePos)
    $betweenContent = $content.Substring($nlPos + 1, $startIdx - $nlPos - 1).Trim()
    if ($betweenContent.Length -gt 5) {
        Write-Host "Found orphaned code between joinCoFlight and startCoFlight: $($betweenContent.Length) chars"
        $content = $content.Substring(0, $nlPos + 1) + $content.Substring($startIdx)
    }
}

# === Fix 4: Remove orphaned code after startCoFlight ===
$startIdx = $content.IndexOf('startCoFlight(session:')
if ($startIdx -ge 0) {
    $bracePos = $content.IndexOf('}', $startIdx)
    $nlPos = $content.IndexOf("`n", $bracePos)
    # Find the next empty line
    $nextContent = $content.Substring($nlPos + 1).TrimStart()
    if ($nextContent.Length -gt 5 -and -not $nextContent.StartsWith('}')) {
        # Find the end of the class (last `}` in file)
        $lastBrace = $content.LastIndexOf('}')
        # Check if there's orphaned code
        $betweenContent = $content.Substring($nlPos + 1, $lastBrace - $nlPos - 1).Trim()
        if ($betweenContent.Length -gt 3 -and $betweenContent -notmatch '^[\s]*$') {
            Write-Host "Found orphaned code after startCoFlight: $($betweenContent.Length) chars"
            $content = $content.Substring(0, $nlPos + 1) + "`r`n}"
        }
    }
}

$content = $content -replace '\r?\n\s*\r?\n\s*\r?\n', "`r`n`r`n"
$content = $content.TrimEnd() + "`r`n"

Write-Host "Final length: $($content.Length)"
[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Host "Fix complete!"
