param (
    [Parameter(Mandatory=$true, HelpMessage="Nhập chuỗi kết nối Database URL mới")]
    [string]$DbUrl
)

# 1. Cập nhật file .env với URL mới
$envFile = ".env"
$envPath = Join-Path $PWD $envFile

if (Test-Path $envPath) {
    $content = Get-Content $envPath
    # Tìm và thay thế dòng DATABASE_URL
    $newContent = $content -replace '^DATABASE_URL=.*', "DATABASE_URL=`"$DbUrl`""
    
    # Nếu chưa có DATABASE_URL thì thêm vào cuối
    if (-not ($content -match '^DATABASE_URL=')) {
        $newContent += "DATABASE_URL=`"$DbUrl`""
    }
    
    Set-Content -Path $envPath -Value $newContent
    Write-Host "[1/3] Đã cấu hình đổi sang nhà cung cấp Database mới thành công!" -ForegroundColor Green
} else {
    Write-Host "Không tìm thấy file .env" -ForegroundColor Red
    exit 1
}

# 2. Xóa cache của Prisma để tránh lỗi kẹt schema cũ
Write-Host "[2/3] Đang làm sạch bộ nhớ đệm Prisma..." -ForegroundColor Cyan
Remove-Item -Path ".\node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\node_modules\@prisma" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Kích hoạt lệnh Deploy "1 Chạm" của mạng lưới Prisma
Write-Host "[3/3] Đang đẩy 100% Cấu trúc Database ERP lên Server mới..." -ForegroundColor Cyan

# Set biến môi trường tạm thời cho process hiện tại
$env:DATABASE_URL = $DbUrl
npx prisma generate
npx prisma migrate deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 THÀNH CÔNG! SGROUP ERP ĐÃ ĐƯỢC CHUYỂN NHÀ CUNG CẤP DATABASE!" -ForegroundColor Green
    Write-Host "Tất cả bảng, khóa ngoại, hệ thống Log của ERP đã nằm trên server mới." -ForegroundColor Yellow
} else {
    Write-Host "❌ Có lỗi xảy ra trong quá trình Deploy. Khôi phục nhà cung cấp cũ..." -ForegroundColor Red
}
