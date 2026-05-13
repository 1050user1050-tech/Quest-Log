@echo off
TITLE QuestLog Launcher
echo --- QuestLog Windows Launcher ---

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed!
    echo Attempting to install Node.js via winget...
    
    winget --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Winget not found. Please download Node.js manually from https://nodejs.org/
        pause
        exit /b
    )

    echo Downloading and installing Node.js (LTS)...
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    
    echo.
    echo Node.js installation finished. 
    echo PLEASE RESTART THIS SCRIPT to recognize the new environment variables.
    pause
    exit /b
)

:: Navigate to folder
cd /d "%~dp0"

:: Install dependencies
if not exist "node_modules\" (
    echo First time setup: Installing dependencies...
    call npm install
)

:: Build project
if not exist "dist\" (
    echo Building project for production...
    call npm run build
)

:: Start server and open browser
echo Launching QuestLog...
start /b npm start
timeout /t 5 >nul
start http://localhost:3000

echo ------------------------------------------------
echo QuestLog is running at http://localhost:3000
echo KEEP THIS WINDOW OPEN while using the app.
echo Press Ctrl+C here to stop the server.
echo ------------------------------------------------
pause
