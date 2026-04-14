$services = @(
    @{ Name = "API Gateway"; Path = "core\api-gateway"; Command = "go run main.go" },
    @{ Name = "CRM API"; Path = "modules\crm\api"; Command = "go run main.go" },
    @{ Name = "HR API"; Path = "modules\hr\api"; Command = "go run main.go" },
    @{ Name = "Sales API"; Path = "modules\sales\api"; Command = "go run main.go" },
    @{ Name = "Project API"; Path = "modules\project\api"; Command = "go run main.go" },
    @{ Name = "Accounting API"; Path = "modules\accounting\api"; Command = "go run main.go" },
    @{ Name = "Web Host"; Path = "core\web-host"; Command = "npm run dev" }
)

Write-Host "Bắt đầu khởi động các dịch vụ..." -ForegroundColor Green

foreach ($svc in $services) {
    Write-Host "Khởi động $($svc.Name)..." -ForegroundColor Cyan
    $fullPath = Join-Path -Path $PSScriptRoot -ChildPath $svc.Path
    Start-Process powershell -ArgumentList "-Title `"$($svc.Name)`"", "-NoExit", "-Command", "cd `"$fullPath`"; $($svc.Command)"
}

Write-Host "Hoàn tất! Các dịch vụ đã được mở trong các cửa sổ mới." -ForegroundColor Green
