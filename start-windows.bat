@echo off
REM Delta Force 容器模拟器 - Windows 启动脚本
REM 自动检测和修复启动问题

chcp 65001 >nul
setlocal EnableDelayedExpansion

REM 设置颜色（Windows 10+）
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "RED=%ESC%[31m"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "PURPLE=%ESC%[35m"
set "CYAN=%ESC%[36m"
set "NC=%ESC%[0m"

REM 项目根目录
set "PROJECT_ROOT=%~dp0"
set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "SERVER_DIR=%PROJECT_ROOT%\server"
set "PUBLIC_DIR=%PROJECT_ROOT%\public"

echo %CYAN%🚀 Delta Force 容器模拟器启动脚本%NC%
echo %CYAN%项目路径: %PROJECT_ROOT%%NC%
echo.

REM 检查 Node.js
call :check_nodejs
if errorlevel 1 exit /b 1

REM 安装依赖
call :install_dependencies
if errorlevel 1 exit /b 1

REM 创建目录
call :create_directories

REM 检查配置文件
call :check_config_files

REM 停止已有服务
call :stop_existing_services

REM 启动服务
call :start_api_server
if errorlevel 1 exit /b 1

call :start_frontend_server
if errorlevel 1 exit /b 1

REM 显示状态
call :show_status

REM 询问是否打开浏览器
call :open_browser

echo %GREEN%[SUCCESS]%NC% 启动脚本执行完成！
pause
exit /b 0

REM ====================== 函数定义 ======================

:print_status
echo %BLUE%[INFO]%NC% %~1
exit /b 0

:print_success
echo %GREEN%[SUCCESS]%NC% %~1
exit /b 0

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
exit /b 0

:print_error
echo %RED%[ERROR]%NC% %~1
exit /b 0

:check_nodejs
call :print_status "检查 Node.js 环境..."

where node >nul 2>&1
if errorlevel 1 (
    call :print_warning "未检测到 Node.js"
    echo 请选择安装方式:
    echo 1. 自动下载安装包
    echo 2. 手动安装
    set /p choice="请输入选择 (1/2): "
    
    if "!choice!"=="1" (
        call :install_nodejs_auto
    ) else (
        call :print_error "请前往 https://nodejs.org 下载并安装 Node.js"
        pause
        exit /b 1
    )
) else (
    for /f "delims=" %%i in ('node --version') do set NODE_VERSION=%%i
    call :print_success "Node.js 已安装，版本: !NODE_VERSION!"
)

where npm >nul 2>&1
if errorlevel 1 (
    call :print_error "npm 未安装，请重新安装 Node.js"
    exit /b 1
) else (
    for /f "delims=" %%i in ('npm --version') do set NPM_VERSION=%%i
    call :print_success "npm 已安装，版本: !NPM_VERSION!"
)
exit /b 0

:install_nodejs_auto
call :print_status "开始自动安装 Node.js..."

REM 检测系统架构
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set "ARCH=x64"
) else (
    set "ARCH=x86"
)

REM 下载 Node.js（使用LTS版本）
set "NODE_URL=https://nodejs.org/dist/v18.17.0/node-v18.17.0-win-%ARCH%.msi"
set "NODE_INSTALLER=%TEMP%\nodejs-installer.msi"

call :print_status "下载 Node.js 安装包..."
curl -L "%NODE_URL%" -o "%NODE_INSTALLER%"
if errorlevel 1 (
    call :print_error "下载失败，请检查网络连接或手动安装"
    exit /b 1
)

call :print_status "运行 Node.js 安装程序..."
msiexec /i "%NODE_INSTALLER%" /quiet /norestart

REM 等待安装完成并刷新环境变量
timeout /t 30 >nul
call :refresh_env

REM 验证安装
where node >nul 2>&1
if errorlevel 1 (
    call :print_error "Node.js 安装失败，请手动安装"
    exit /b 1
) else (
    call :print_success "Node.js 安装成功！"
)

del "%NODE_INSTALLER%" >nul 2>&1
exit /b 0

:refresh_env
REM 刷新环境变量
for /f "skip=2 tokens=3*" %%a in ('reg query HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment /v PATH') do set "SYS_PATH=%%b"
for /f "skip=2 tokens=3*" %%a in ('reg query HKCU\Environment /v PATH') do set "USER_PATH=%%b"
set "PATH=%SYS_PATH%;%USER_PATH%"
exit /b 0

:install_dependencies
call :print_status "检查项目依赖..."

REM 检查主项目依赖
if not exist "%PROJECT_ROOT%\node_modules" (
    call :print_warning "主项目依赖未安装"
    cd /d "%PROJECT_ROOT%"
    call :print_status "安装主项目依赖..."
    call npm install
    if errorlevel 1 (
        call :print_error "主项目依赖安装失败"
        exit /b 1
    )
    call :print_success "主项目依赖安装完成"
) else (
    call :print_success "主项目依赖已安装"
)

REM 检查服务器依赖
if not exist "%SERVER_DIR%\node_modules" (
    call :print_warning "API服务器依赖未安装"
    cd /d "%SERVER_DIR%"
    call :print_status "安装服务器依赖..."
    call npm install
    if errorlevel 1 (
        call :print_error "服务器依赖安装失败"
        exit /b 1
    )
    call :print_success "服务器依赖安装完成"
) else (
    call :print_success "服务器依赖已安装"
)
exit /b 0

:create_directories
call :print_status "检查目录结构..."

if not exist "%PROJECT_ROOT%\backups" (
    mkdir "%PROJECT_ROOT%\backups"
    call :print_success "创建备份目录"
)

if not exist "%PROJECT_ROOT%\public" (
    mkdir "%PROJECT_ROOT%\public"
    call :print_success "创建公共资源目录"
)

if not exist "%PROJECT_ROOT%\logs" (
    mkdir "%PROJECT_ROOT%\logs"
    call :print_success "创建日志目录"
)
exit /b 0

:check_config_files
call :print_status "检查配置文件..."

if not exist "%PUBLIC_DIR%\data.json" (
    call :print_warning "未找到 data.json 配置文件"
    call :print_status "创建默认配置文件..."
    
    > "%PUBLIC_DIR%\data.json" (
        echo {
        echo   "items": [],
        echo   "containers": {
        echo     "基础战利品箱": {
        echo       "cost": 100,
        echo       "rarity": "常见",
        echo       "layoutIds": ["default_layout"],
        echo       "color": "#4CAF50"
        echo     }
        echo   },
        echo   "layouts": {
        echo     "default_layout": {
        echo       "name": "默认布局",
        echo       "description": "系统默认布局",
        echo       "positions": []
        echo     }
        echo   }
        echo }
    )
    call :print_success "默认配置文件创建完成"
) else (
    call :print_success "配置文件已存在"
)
exit /b 0

:stop_existing_services
call :print_status "检查并停止已运行的服务..."

REM 停止占用3001端口的进程
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001"') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM 停止占用5173端口的进程  
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173"') do (
    taskkill /f /pid %%a >nul 2>&1
)

call :print_success "端口清理完成"
exit /b 0

:start_api_server
call :print_status "启动 API 服务器..."

cd /d "%SERVER_DIR%"
if not exist "api.js" (
    call :print_error "API服务器文件不存在: %SERVER_DIR%\api.js"
    exit /b 1
)

REM 后台启动 API 服务器
start /B node api.js > "%PROJECT_ROOT%\logs\api.log" 2>&1

REM 等待服务器启动
timeout /t 3 >nul

REM 检查服务器是否启动成功
curl -s http://localhost:3001/api/config >nul 2>&1
if errorlevel 1 (
    call :print_error "API 服务器启动失败，请检查日志: logs\api.log"
    exit /b 1
) else (
    call :print_success "API 服务器启动成功"
    call :print_success "API 地址: http://localhost:3001"
)
exit /b 0

:start_frontend_server
call :print_status "启动前端开发服务器..."

cd /d "%PROJECT_ROOT%"

REM 后台启动前端服务器
start /B npm run dev > "%PROJECT_ROOT%\logs\frontend.log" 2>&1

REM 等待服务器启动
timeout /t 5 >nul

REM 检查服务器是否启动成功
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
    call :print_error "前端服务器启动失败，请检查日志: logs\frontend.log"
    exit /b 1
) else (
    call :print_success "前端服务器启动成功"
    call :print_success "前端地址: http://localhost:5173"
    call :print_success "布局编辑器: http://localhost:5173/layout-editor.html"
)
exit /b 0

:show_status
echo.
echo %PURPLE%================================%NC%
echo %PURPLE%🎯 服务启动完成!%NC%
echo %PURPLE%================================%NC%
echo %GREEN%✅ API服务器: http://localhost:3001%NC%
echo %GREEN%✅ 前端服务器: http://localhost:5173%NC%
echo %GREEN%✅ 布局编辑器: http://localhost:5173/layout-editor.html%NC%
echo.
echo %YELLOW%📝 日志文件:%NC%
echo    API: logs\api.log
echo    前端: logs\frontend.log
echo.
echo %YELLOW%🛑 停止服务:%NC%
echo    运行: stop-windows.bat
echo.
exit /b 0

:open_browser
set /p open_browser="是否打开浏览器? (y/n): "
if /i "!open_browser!"=="y" (
    call :print_status "打开浏览器..."
    start http://localhost:5173/layout-editor.html
)
exit /b 0
