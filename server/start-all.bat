@echo off
title Monopoly - Server + Tunnel

echo ========================================
echo    🎲 MONOPOLY - FULL START
echo ========================================
echo.
echo Запуск сервера...
start "Monopoly Server" cmd /k "cd /d C:\Users\10thc\Downloads\try1\try1\Gongress\RenatCollege1\RenatCollege\ForCollege\ForCollege\NextLevel\server && node server.js"

echo Ожидание сервера (3 секунды)...
timeout /t 3 /nobreak >nul

echo Запуск туннеля...
:tunnel
echo [%time%] 🚀 Туннель...
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -R monopoly-vildanov:80:localhost:3000 serveo.net
echo [%time%] ❌ Туннель упал. Перезапуск через 5 секунд...
timeout /t 5 /nobreak >nul
goto tunnel