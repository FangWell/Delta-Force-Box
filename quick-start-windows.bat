@echo off
REM 快速启动脚本 - 适用于环境已配置的Windows系统

chcp 65001 >nul
setlocal EnableDelayedExpansion

set "PROJECT_ROOT=%~dp0"
set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

echo 🚀 快速启动 Delta Force 容器模拟器...

cd /d "%PROJECT_ROOT%"

REM 停止现有服务
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo csv 2^>nul ^| findstr /v "PID"') do (
    set "pid=%%a"
    set "pid=!pid:"=!"
    taskkill /f /pid !pid! >nul 2>&1
)

timeout /t 2 >nul

REM 创建日志目录
if not exist logs mkdir logs

REM 启动API服务器
echo 启动API服务器...
cd /d "%PROJECT_ROOT%\server"
start /B node api.js > "%PROJECT_ROOT%\logs\api.log" 2>&1

REM 启动前端服务器
echo 启动前端服务器...
cd /d "%PROJECT_ROOT%"
start /B npm run dev > "%PROJECT_ROOT%\logs\frontend.log" 2>&1

REM 等待服务启动
timeout /t 3 >nul

echo ✅ 服务启动完成！
echo 🌐 前端地址: http://localhost:5173
echo 🔧 API地址: http://localhost:3001  
echo 📝 布局编辑器: http://localhost:5173/layout-editor.html
echo.
echo 📋 使用 'stop-windows.bat' 停止所有服务

REM 询问是否打开浏览器
set /p open_browser="是否打开浏览器？(y/n): "
if /i "!open_browser!"=="y" (
    start http://localhost:5173/layout-editor.html
)

pause
