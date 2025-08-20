@echo off
REM Delta Force 容器模拟器 - Windows 停止脚本

chcp 65001 >nul
setlocal EnableDelayedExpansion

REM 设置颜色（Windows 10+）
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "RED=%ESC%[31m"
set "GREEN=%ESC%[32m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "NC=%ESC%[0m"

REM 项目根目录
set "PROJECT_ROOT=%~dp0"
set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

echo %BLUE%🛑 Delta Force 容器模拟器停止脚本%NC%
echo.

call :stop_api_server
call :stop_frontend_server
call :stop_all_processes
call :cleanup_logs
call :show_final_status

echo %GREEN%[SUCCESS]%NC% 停止脚本执行完成！
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

:stop_api_server
call :print_status "停止 API 服务器..."

REM 停止占用3001端口的所有进程
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" 2^>nul') do (
    if "%%a" neq "" (
        taskkill /f /pid %%a >nul 2>&1
        if not errorlevel 1 (
            call :print_success "已停止进程 PID: %%a"
        )
    )
)

call :print_success "API 服务器已停止"
exit /b 0

:stop_frontend_server
call :print_status "停止前端服务器..."

REM 停止占用5173端口的所有进程
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" 2^>nul') do (
    if "%%a" neq "" (
        taskkill /f /pid %%a >nul 2>&1
        if not errorlevel 1 (
            call :print_success "已停止进程 PID: %%a"
        )
    )
)

call :print_success "前端服务器已停止"
exit /b 0

:stop_all_processes
call :print_status "停止所有相关进程..."

REM 停止所有包含关键字的Node.js进程
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq node.exe" /fo csv ^| findstr /v "PID"') do (
    set "pid=%%a"
    set "pid=!pid:"=!"
    if "!pid!" neq "" (
        REM 获取进程命令行
        for /f "tokens=*" %%b in ('wmic process where "processid=!pid!" get commandline /value 2^>nul ^| findstr "CommandLine"') do (
            set "cmdline=%%b"
            set "cmdline=!cmdline:CommandLine=!"
            set "cmdline=!cmdline:~1!"
            
            REM 检查是否包含api.js或vite相关关键字
            echo !cmdline! | findstr /i "api.js vite npm.*dev" >nul
            if not errorlevel 1 (
                taskkill /f /pid !pid! >nul 2>&1
                if not errorlevel 1 (
                    call :print_success "已停止相关进程 PID: !pid!"
                )
            )
        )
    )
)

call :print_success "所有相关进程已停止"
exit /b 0

:cleanup_logs
set /p cleanup="是否清理日志文件? (y/n): "
if /i "!cleanup!"=="y" (
    if exist "%PROJECT_ROOT%\logs" (
        del /q "%PROJECT_ROOT%\logs\*.log" >nul 2>&1
        del /q "%PROJECT_ROOT%\logs\*.pid" >nul 2>&1
        call :print_success "日志文件已清理"
    )
)
exit /b 0

:show_final_status
echo.
echo %GREEN%================================%NC%
echo %GREEN%✅ 所有服务已停止%NC%
echo %GREEN%================================%NC%
echo.

REM 验证端口是否已释放
netstat -aon | findstr ":3001" >nul 2>&1
if errorlevel 1 (
    set "port3001_free=1"
) else (
    set "port3001_free=0"
)

netstat -aon | findstr ":5173" >nul 2>&1
if errorlevel 1 (
    set "port5173_free=1"
) else (
    set "port5173_free=0"
)

if "!port3001_free!"=="1" if "!port5173_free!"=="1" (
    call :print_success "所有端口已释放"
) else (
    call :print_warning "某些端口可能仍被占用，请手动检查"
)
exit /b 0
