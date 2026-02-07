# 将项目中所有代码文件的编码从 GBK 转换为 UTF-8 (无BOM)
# 支持的文件类型: .ts, .tsx, .js, .jsx, .css, .json, .md, .html

$extensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.css", "*.json", "*.md", "*.html")
$excludeDirs = @("node_modules", "dist", ".git")
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$gbk = [System.Text.Encoding]::GetEncoding("GBK")

$count = 0

foreach ($ext in $extensions) {
    $files = Get-ChildItem -Path $projectRoot -Filter $ext -Recurse -File | Where-Object {
        $skip = $false
        foreach ($dir in $excludeDirs) {
            if ($_.FullName -like "*\$dir\*") { $skip = $true; break }
        }
        -not $skip
    }

    foreach ($file in $files) {
        try {
            # 读取原始字节
            $bytes = [System.IO.File]::ReadAllBytes($file.FullName)

            # 检测是否已经是有效的 UTF-8
            $isUtf8 = $true
            try {
                $utf8Strict = New-Object System.Text.UTF8Encoding $false, $true
                $null = $utf8Strict.GetString($bytes)
            } catch {
                $isUtf8 = $false
            }

            if ($isUtf8) {
                # 已经是 UTF-8，移除可能存在的 BOM
                if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
                    $content = $utf8NoBom.GetString($bytes, 3, $bytes.Length - 3)
                    [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
                    Write-Host "[BOM removed] $($file.FullName)" -ForegroundColor Yellow
                    $count++
                } else {
                    # 已是 UTF-8 无 BOM，无需处理
                }
            } else {
                # 非 UTF-8，按 GBK 读取并转为 UTF-8
                $content = $gbk.GetString($bytes)
                [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
                Write-Host "[GBK -> UTF-8] $($file.FullName)" -ForegroundColor Green
                $count++
            }
        } catch {
            Write-Host "[ERROR] $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

if ($count -eq 0) {
    Write-Host "`nAll files are already UTF-8 encoded. No conversion needed." -ForegroundColor Cyan
} else {
    Write-Host "`nConverted $count file(s) to UTF-8." -ForegroundColor Cyan
}
