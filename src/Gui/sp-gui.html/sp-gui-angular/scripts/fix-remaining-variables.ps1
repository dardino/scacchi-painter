# Fix remaining @ variables that were converted to $$1
# This happens when variables are defined and used in the same file

$scssFiles = Get-ChildItem -Path "@sp" -Filter "*.scss" -Recurse

$count = 0

foreach ($file in $scssFiles) {
    $lessFile = $file.FullName -replace '\.scss$', '.less'

    if (-not (Test-Path $lessFile)) {
        continue
    }

    $scssContent = Get-Content -Path $file.FullName -Raw -Encoding UTF8

    if ($scssContent -notmatch '\$\$1') {
        continue
    }

    $lessContent = Get-Content -Path $lessFile -Raw -Encoding UTF8

    # Find all variable definitions in LESS file: @varname: value;
    $variableMatches = [regex]::Matches($lessContent, '@([a-zA-Z][a-zA-Z0-9_-]*)\s*:')

    $replacements = @{}
    foreach ($match in $variableMatches) {
        $varName = $match.Groups[1].Value
        $lessVar = "@$varName"
        $scssVar = "`$$varName"

        # Check if this LESS variable got converted to $$1 in SCSS
        if ($lessContent -match [regex]::Escape($lessVar) -and $scssContent -match '\$\$1') {
            $replacements[$lessVar] = $scssVar
        }
    }

    if ($replacements.Count -gt 0) {
        # Now manually check where $$1 appears and which LESS variable was there
        $scssLines = $scssContent -split "`n"
        $lessLines = $lessContent -split "`n"

        $modified = $false
        for ($i = 0; $i -lt [Math]::Min($scssLines.Length, $lessLines.Length); $i++) {
            if ($scssLines[$i] -match '\$\$1') {
                # Find which @ variable was in the LESS file at this line
                foreach ($pair in $replacements.GetEnumerator()) {
                    if ($lessLines[$i] -match [regex]::Escape($pair.Key)) {
                        $scssLines[$i] = $scssLines[$i] -replace '\$\$1', $pair.Value
                        $modified = $true
                        break
                    }
                }
            }
        }

        if ($modified) {
            $newContent = $scssLines -join "`n"
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            Write-Host "Fixed: $($file.FullName)"
            $count++
        }
    }
}

Write-Host "`nFixed $count files with remaining $$1 variables"
