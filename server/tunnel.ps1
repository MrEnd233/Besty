Write-Host "========================================" -ForegroundColor Green
Write-Host "   🎲 MONOPOLY - SERVER TUNNEL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 URL: https://monopoly-vildanov.serveousercontent.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Нажмите Ctrl+C для остановки" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

while ($true) {
    $time = Get-Date -Format "HH:mm:ss"
    Write-Host "[$time] 🚀 Запуск туннеля..." -ForegroundColor Green
    ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -R monopoly-vildanov:80:localhost:3000 serveo.net
    
    $time = Get-Date -Format "HH:mm:ss"
    Write-Host "[$time] ❌ Туннель отключился. Перезапуск через 5 секунд..." -ForegroundColor Red
    Write-Host ""
    Start-Sleep -Seconds 5
}