@echo off
echo =====================================
echo 阿里云函数计算 FC 自动部署脚本
echo =====================================
echo.

REM 检查是否安装了 aliyun CLI
where aliyun >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到阿里云 CLI
    echo.
    echo 请先安装阿里云 CLI:
    echo 1. 访问：https://help.aliyun.com/zh/cli/installation
    echo 2. 下载 Windows 版本并安装
    echo 3. 运行此脚本
    echo.
    pause
    exit /b 1
)

echo [1/4] 配置阿里云账号...
echo 请输入你的 AccessKey ID:
set /p ACCESS_KEY_ID=
echo 请输入你的 AccessKey Secret:
set /p ACCESS_KEY_SECRET=

aliyun configure --profile default --mode AK --access-key-id %ACCESS_KEY_ID% --access-key-secret %ACCESS_KEY_SECRET% --region cn-hangzhou --language zh

if %ERRORLEVEL% NEQ 0 (
    echo [错误] 配置失败，请检查 AccessKey
    pause
    exit /b 1
)

echo.
echo [2/4] 开通函数计算服务...
aliyun fc --endpoint fc.cn-hangzhou.aliyuncs.com CreateService --serviceName outfit-api --description "Outfit app API proxy"

echo.
echo [3/4] 创建函数...
aliyun fc --endpoint fc.cn-hangzhou.aliyuncs.com CreateFunction ^
    --service-name outfit-api ^
    --function-name outfit-analyze ^
    --handler index.handler ^
    --runtime nodejs18 ^
    --code-dir fc-function ^
    --memory-size 256 ^
    --timeout 60 ^
    --env-vars "{\"DASHSCOPE_API_KEY\":\"sk-36f3fe3e7d60407482f9e538978916a0\"}"

echo.
echo [4/4] 创建 HTTP 触发器...
aliyun fc --endpoint fc.cn-hangzhou.aliyuncs.com CreateTrigger ^
    --service-name outfit-api ^
    --function-name outfit-analyze ^
    --trigger-name http-trigger ^
    --trigger-type http ^
    --trigger-config "{\"authType\":\"anonymous\",\"methods\":[\"POST\"]}"

echo.
echo =====================================
echo 部署完成！
echo =====================================
echo.
echo 获取函数 URL:
echo aliyun fc --endpoint fc.cn-hangzhou.aliyuncs.com GetTrigger --service-name outfit-api --function-name outfit-analyze --trigger-name http-trigger
echo.
echo 或使用浏览器访问：
echo https://fc-next.console.aliyun.com/cn-hangzhou/services/outfit-api/functions/outfit-analyze/triggers/http-trigger
echo.
pause
