# Update all $variable references to mq.$variable in SCSS files that use @use

$files = @(
    "@sp/gui/src/app/database-list-item/database-list-item.component.scss",
    "@sp/gui/src/app/landing/landing.component.scss",
    "@sp/gui/src/app/save-file/save-file.component.scss",
    "@sp/gui/src/app/edit-problem/edit-problem.component.scss",
    "@sp/ui-elements/src/lib/toolbar-db/toolbar-db.component.scss",
    "@sp/ui-elements/src/lib/toolbar-edit/toolbar-edit.component.scss"
)

$replacements = @{
    '(\s+)(\$smallScreen)' = '$1mq.$2'
    '(\s+)(\$maintoolbarH)' = '$1mq.$2'
    '(\s+)(\$boardwidthSM)' = '$1mq.$2'
    '\((\$smallScreen)' = '(mq.$1'
}

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content -Path $file -Raw -Encoding UTF8
        $originalContent = $content

        foreach ($pair in $replacements.GetEnumerator()) {
            $content = $content -replace $pair.Key, $pair.Value
        }

        if ($content -ne $originalContent) {
            Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "Updated: $file"
        }
    }
}

Write-Host "`nNamespace update complete!"
