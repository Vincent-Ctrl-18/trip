@echo off
chcp 65001 >nul
title Easy Stay - Hotel Booking Platform

echo ============================================
echo    易宿酒店预订平台 - 启动脚本
echo ============================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo [INFO] Installing client dependencies...
    cd client
    call npm install
    cd ..
)

:: Initialize database if needed
if not exist "server\database.sqlite" (
    echo [INFO] Initializing database with seed data...
    cd server
    call npm run seed
    cd ..
)

echo.
echo [INFO] Starting backend server (port 3001)...
start "EasyStay - Backend" cmd /k "cd /d %~dp0server && npm run dev"

:: Wait a moment for the backend to be ready
timeout /t 3 /nobreak >nul

echo [INFO] Starting frontend dev server (port 5173)...
start "EasyStay - Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ============================================
echo    All services started!
echo.
echo    Mobile H5:     http://localhost:5173/m
echo    Admin Panel:   http://localhost:5173/admin/login
echo.
echo    Test Accounts:
echo      Admin:    admin / admin123
echo      Merchant: merchant / merchant123
echo ============================================
echo.
echo Press any key to close this window (services will keep running)...
pause >nul
