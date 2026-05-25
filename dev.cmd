@echo off
rem Запускает Vite dev-сервер через портативный Node (без системной установки npm).
rem Сервер слушает http://localhost:5173/. Остановить — Ctrl+C.
setlocal
set "NODEDIR=C:\Users\boikovaa\Desktop\projects\oesx_agents_portal\.toolchain\node-v20.18.1-win-x64"
set "PATH=%NODEDIR%;%PATH%"
pushd "%~dp0"
call "%NODEDIR%\npm.cmd" run dev %*
set RC=%ERRORLEVEL%
popd
endlocal & exit /b %RC%
