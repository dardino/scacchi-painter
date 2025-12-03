# Fix remaining LESS variable syntax (@variable) to SCSS ($variable) in all SCSS files
# This fixes variables that were missed in media queries and expressions

$scssFiles = Get-ChildItem -Path "@sp" -Filter "*.scss" -Recurse

$replacements = @{
    '@smallScreen' = '$smallScreen'
    '@maintoolbarH' = '$maintoolbarH'
}

foreach ($file in $scssFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content

    foreach ($pair in $replacements.GetEnumerator()) {
        $content = $content -replace [regex]::Escape($pair.Key), $pair.Value
    }

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nVariable fix complete!"
