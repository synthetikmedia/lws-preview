@echo off
set "PATH=C:\Program Files\nodejs;C:\Users\canaa\AppData\Roaming\npm;%PATH%"
node "C:\Users\canaa\.openclaw\refresh-and-sync-token.js"
if %errorlevel% neq 0 (
    echo Token refresh failed!
    exit /b 1
)
openclaw gateway restart
