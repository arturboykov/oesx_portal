@echo off
rem Прод-сборка Vue-версии через портативный Node. Результат → dist/
setlocal
set "NODEDIR=C:\Users\boikovaa\Desktop\projects\oesx_agents_portal\.toolchain\node-v20.18.1-win-x64"
set "PATH=%NODEDIR%;%PATH%"
pushd "%~dp0"
call "%NODEDIR%\npm.cmd" run build %*
set RC=%ERRORLEVEL%
popd
endlocal & exit /b %RC%
