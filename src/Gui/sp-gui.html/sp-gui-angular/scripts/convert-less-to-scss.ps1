# Script to convert LESS files to SCSS
$lessFiles = Get-ChildItem -Recurse -Path '@sp' -Filter '*.less' -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch 'node_modules' }

Write-Output "Converting $($lessFiles.Count) LESS files to SCSS..."

foreach ($file in $lessFiles) {
    $content = Get-Content $file.FullName -Raw

    # Convert imports (remove .less extension)
    $content = $content -replace '@import\s+"([^"]+)\.less"', '@import "$1"'
    $content = $content -replace "@import\s+'([^']+)\.less'", "@import '`$1'"

    # Convert mixins: .mixinName() { } => @mixin mixinName() { }
    $content = $content -replace '\.(\w+)\s*\(([^)]*)\)\s*\{', '@mixin $1($2) {'

    # Convert mixin calls: .mixinName(); => @include mixinName();
    $content = $content -replace '\.(\w+)\(\);', '@include $1();'
    $content = $content -replace '\.(\w+)\(([^)]+)\);', '@include $1($2);'

    # Convert variables: @varName => $varName (but not @-rules)
    # This regex matches @ followed by word characters, but not common at-rules
    $lines = $content -split "`n"
    $newLines = @()

    foreach ($line in $lines) {
        # Skip lines that start with @import, @media, etc.
        if ($line -match '^\s*@(import|media|mixin|include|keyframes|charset|font-face|supports|extend|at-root|content|each|for|if|else|while|function|return|warn|error|debug|use|forward)\b') {
            $newLines += $line
        }
        # Convert variable definitions: @var: value; => $var: value;
        elseif ($line -match '@(\w+)\s*:') {
            $line = $line -replace '@(\w+):', '$$$1:'
            $newLines += $line
        }
        # Convert variable usage in other contexts
        else {
            $line = $line -replace '@(\w+)(?![\w-])', '$$$$1'
            $newLines += $line
        }
    }

    $content = $newLines -join "`n"

    $scssFile = $file.FullName -replace '\.less$', '.scss'
    Set-Content -Path $scssFile -Value $content -NoNewline

    Write-Output "  Converted: $($file.Name) -> $([System.IO.Path]::GetFileName($scssFile))"
}

Write-Output "`nConversion complete: $($lessFiles.Count) files converted to SCSS"
