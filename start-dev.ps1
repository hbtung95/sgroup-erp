$root = $PSScriptRoot
$cacheRoot = Join-Path $root ".run-cache"
$runRoot = Join-Path $root ".dev-run"
$logRoot = Join-Path $root ".dev-logs"
$dbDsn = "host=localhost user=erp_admin password=erp_password dbname=sgroup_erp port=5433 sslmode=disable TimeZone=Asia/Ho_Chi_Minh"
$redisUrl = "redis://localhost:6379/0"

New-Item -ItemType Directory -Force -Path $cacheRoot | Out-Null
New-Item -ItemType Directory -Force -Path $runRoot | Out-Null
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null

function Test-PortInUse {
    param([int]$Port)

    return [bool](netstat -ano | Select-String -Pattern (":{0}\s" -f $Port))
}

function Start-ServiceWindow {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [int]$Port
    )

    $fullPath = Join-Path $root $Path
    if (-not (Test-Path $fullPath)) {
        Write-Host "Bỏ qua $Name vì không tìm thấy thư mục: $fullPath" -ForegroundColor Yellow
        return
    }

    if ($Port -gt 0 -and (Test-PortInUse -Port $Port)) {
        Write-Host "Bỏ qua $Name vì cổng $Port đang được sử dụng." -ForegroundColor Yellow
        return
    }

    $safeName = ($Name -replace "[^a-zA-Z0-9\-]", "_").ToLower()
    $scriptPath = Join-Path $runRoot ($safeName + ".ps1")
    $logPath = Join-Path $logRoot ($safeName + ".log")
    $arguments = "-NoExit -ExecutionPolicy Bypass -File `"$scriptPath`""
    $scriptContent = @"
Set-Location '$fullPath'
$Command 2>&1 | Tee-Object -FilePath '$logPath'
"@
    Set-Content -LiteralPath $scriptPath -Value $scriptContent -Encoding ASCII

    Write-Host "Khởi động $Name..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList $arguments | Out-Null
}

$gatewayCommand = "`$env:GOCACHE = '$cacheRoot\go-gateway'; go run main.go"
$hrCommand = "`$env:GOCACHE = '$cacheRoot\go-hr'; `$env:DATABASE_URL = '$dbDsn'; `$env:PORT = '8081'; go run ./cmd/api"
$projectCommand = "`$env:GOCACHE = '$cacheRoot\go-project'; `$env:DB_DSN = '$dbDsn'; `$env:SERVER_PORT = '8082'; `$env:REDIS_URL = '$redisUrl'; go run ./cmd/main.go"
$salesCommand = "`$env:GOCACHE = '$cacheRoot\go-sales'; `$env:DB_DSN = '$dbDsn'; `$env:SERVER_PORT = '8083'; go run ./cmd/main.go"
$crmCommand = "`$env:GOCACHE = '$cacheRoot\go-crm'; go run main.go"

Write-Host "Bắt đầu khởi động SGROUP ERP..." -ForegroundColor Green

Start-ServiceWindow -Name "HR API" -Path "modules\hr\api" -Command $hrCommand -Port 8081
Start-ServiceWindow -Name "Project API" -Path "modules\project\api" -Command $projectCommand -Port 8082
Start-ServiceWindow -Name "Sales API" -Path "modules\sales\api" -Command $salesCommand -Port 8083
Start-ServiceWindow -Name "CRM API" -Path "modules\crm\api" -Command $crmCommand -Port 8084
Start-ServiceWindow -Name "Web Host" -Path "core\web-host" -Command "npm.cmd run dev" -Port 5173

if (Test-PortInUse -Port 8080) {
    Write-Host "Bỏ qua API Gateway vì cổng 8080 đang được sử dụng." -ForegroundColor Yellow
} else {
    Start-ServiceWindow -Name "API Gateway" -Path "core\api-gateway" -Command $gatewayCommand -Port 8080
}

Write-Host ""
Write-Host "URL local:" -ForegroundColor Green
Write-Host "- Web Host: http://localhost:5173"
Write-Host "- HR API: http://localhost:8081"
Write-Host "- Project API: http://localhost:8082"
Write-Host "- Sales API: http://localhost:8083"
Write-Host "- CRM API: http://localhost:8084"
Write-Host "- API Gateway: http://localhost:8080 (neu cong 8080 trong)"
Write-Host ""
Write-Host "Luu y: Postgres/Redis can san sang truoc khi dung cac API." -ForegroundColor DarkYellow
