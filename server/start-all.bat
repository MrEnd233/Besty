@echo off
title Monopoly - Server + Tunnel

echo ========================================
echo    🎲 MONOPOLY - FULL START
echo ========================================
echo.

echo [1/4] Закрываем старые туннели...
taskkill /f /im ssh.exe 2>nul
echo Готово.

echo [2/4] Закрываем старый сервер (порт 3000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    taskkill /f /pid %%a 2>nul
)
echo Готово.
echo.

echo [3/4] Запуск сервера...
start "Monopoly Server" cmd /k "cd /d C:\Users\10thc\Downloads\try1\try1\Gongress\RenatCollege1\RenatCollege\ForCollege\ForCollege\NextLevel\server && node server.js"

echo Ожидание сервера (3 секунды)...
timeout /t 3 /nobreak >nul

echo [4/4] Запуск туннеля...
:tunnel
echo [%time%] 🚀 Подключаю туннель...
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -o StrictHostKeyChecking=no -R monopoly-vildanov:80:localhost:3000 serveo.net
echo [%time%] ❌ Туннель упал. Перезапуск через 5 секунд...
timeout /t 5 /nobreak >nul
goto tunnel