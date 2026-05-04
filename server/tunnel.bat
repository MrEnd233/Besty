@echo off
title Serveo Tunnel - Monopoly
echo ========================================
echo    🎲 MONOPOLY - SERVER TUNNEL
echo ========================================
echo.
echo 🔗 URL: https://monopoly-vildanov.serveousercontent.com
echo.
echo Нажмите Ctrl+C для остановки
echo ========================================
echo.

:tunnel
echo [%time%] 🚀 Запуск туннеля...
ssh -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -R monopoly-vildanov:80:localhost:3000 serveo.net
echo.
echo [%time%] ❌ Туннель отключился. Перезапуск через 5 секунд...
timeout /t 5 /nobreak >nul
goto tunnel