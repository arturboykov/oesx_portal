@echo off
rem Vite dev-сервер для Vue-версии через портативный Node. http://localhost:5174/
setlocal
set "NODEDIR=C:\Users\boikovaa\Desktop\projects\oesx_agents_portal\.toolchain\node-v20.18.1-win-x64"
set "PATH=%NODEDIR%;%PATH%"
pushd "%~dp0"
call "%NODEDIR%\npm.cmd" run dev %*
set RC=%ERRORLEVEL%
popd
endlocal & exit /b %RC%
