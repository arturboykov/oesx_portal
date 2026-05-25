@echo off
rem Собирает прод-бандл через портативный Node (без системной установки npm).
rem Запуск из PowerShell или cmd, находясь в любой папке:
rem   .\build.cmd      (если уже в meta-pp)
rem   C:\Users\boikovaa\Desktop\projects\oesx_agents_portal\meta-pp\build.cmd
setlocal
set "NODEDIR=C:\Users\boikovaa\Desktop\projects\oesx_agents_portal\.toolchain\node-v20.18.1-win-x64"
set "PATH=%NODEDIR%;%PATH%"
pushd "%~dp0"
call "%NODEDIR%\npm.cmd" run build %*
set RC=%ERRORLEVEL%
popd
endlocal & exit /b %RC%
