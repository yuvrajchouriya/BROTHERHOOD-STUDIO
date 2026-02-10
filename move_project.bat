@echo off
set "SOURCE=%~dp0"
set "DEST=C:\Users\DELL\Downloads\brotherhood"

echo Moving project files from "%SOURCE%" to "%DEST%"...

if not exist "%DEST%" (
    mkdir "%DEST%"
)

xcopy "%SOURCE%*" "%DEST%\" /E /I /H /Y /C

echo.
echo ========================================================
echo Files copied successfully to:
echo %DEST%
echo ========================================================
echo.
echo Please close this VS Code window and open the new folder:
echo %DEST%
echo.
pause
