@echo off
REM Excel配置转换脚本 - Windows版本

REM 设置代码页为UTF-8
chcp 65001 > nul

REM 设置颜色代码
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

REM 打印带颜色的消息
:print_message
echo %~2
goto :eof

REM 打印标题
:print_title
echo.
echo %BLUE%================================%NC%
echo %BLUE% Delta Force 配置转换工具%NC%
echo %BLUE%================================%NC%
echo.
goto :eof

REM 检查Node.js环境
:check_node
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%❌ Node.js 未安装，请先安装 Node.js%NC%
    exit /b 1
)
echo %GREEN%✅ Node.js 环境检查通过%NC%
goto :eof

REM 安装依赖
:install_dependencies
echo %YELLOW%📦 检查依赖包...%NC%

REM 切换到项目根目录
cd /d "%~dp0\.."

REM 检查xlsx包是否安装
if not exist "node_modules\xlsx" (
    echo %YELLOW%📦 安装xlsx依赖包...%NC%
    npm install xlsx
)

echo %GREEN%✅ 依赖包检查完成%NC%
goto :eof

REM 创建Excel模板
:create_templates
echo %YELLOW%📝 创建Excel模板文件...%NC%
node tools\excel-converter.cjs --template
goto :eof

REM 转换所有配置
:convert_all
echo %YELLOW%🔄 转换所有配置文件...%NC%
node tools\excel-converter.cjs
goto :eof

REM 转换指定配置
:convert_specific
if "%~1"=="items" (
    echo %YELLOW%📦 转换物品配置...%NC%
    node tools\excel-converter.cjs --items
) else if "%~1"=="containers" (
    echo %YELLOW%📦 转换容器配置...%NC%
    node tools\excel-converter.cjs --containers
) else if "%~1"=="layouts" (
    echo %YELLOW%📦 转换布局配置...%NC%
    node tools\excel-converter.cjs --layouts
) else (
    echo %RED%❌ 未知的配置类型: %~1%NC%
    call :show_usage
    exit /b 1
)
goto :eof

REM 显示使用帮助
:show_usage
call :print_title
echo 用法:
echo   %~n0 [选项]
echo.
echo 选项:
echo   -h, --help          显示此帮助信息
echo   -t, --template      创建Excel模板文件
echo   -a, --all           转换所有配置文件（默认）
echo   -i, --items         仅转换物品配置
echo   -c, --containers    仅转换容器配置
echo   -l, --layouts       仅转换布局配置
echo.
echo 示例:
echo   %~n0                # 转换所有配置
echo   %~n0 -t             # 创建模板
echo   %~n0 -i             # 仅转换物品
echo.
goto :eof

REM 主函数
:main
if "%~1"=="-h" goto help
if "%~1"=="--help" goto help
if "%~1"=="-t" goto template
if "%~1"=="--template" goto template
if "%~1"=="-a" goto all
if "%~1"=="--all" goto all
if "%~1"=="-i" goto items
if "%~1"=="--items" goto items
if "%~1"=="-c" goto containers
if "%~1"=="--containers" goto containers
if "%~1"=="-l" goto layouts
if "%~1"=="--layouts" goto layouts
if "%~1"=="" goto all

echo %RED%❌ 未知选项: %~1%NC%
call :show_usage
exit /b 1

:help
call :show_usage
goto end

:template
call :print_title
call :check_node
if %errorlevel% neq 0 goto end
call :install_dependencies
call :create_templates
goto success

:all
call :print_title
call :check_node
if %errorlevel% neq 0 goto end
call :install_dependencies
call :convert_all
goto success

:items
call :print_title
call :check_node
if %errorlevel% neq 0 goto end
call :install_dependencies
call :convert_specific "items"
goto success

:containers
call :print_title
call :check_node
if %errorlevel% neq 0 goto end
call :install_dependencies
call :convert_specific "containers"
goto success

:layouts
call :print_title
call :check_node
if %errorlevel% neq 0 goto end
call :install_dependencies
call :convert_specific "layouts"
goto success

:success
echo %GREEN%✅ 操作完成！%NC%
goto end

:end
pause
