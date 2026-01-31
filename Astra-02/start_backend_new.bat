@echo off
REM ============================================================
REM  OSINT Image & Video Analyzer - Windows Backend Startup
REM ============================================================

echo.
echo ============================================================
echo   🔍 OSINT Toolkit - Image & Video Analyzer Backend
echo ============================================================
echo.

REM Check Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo.
    echo Please install Python 3.8+ from: https://www.python.org/downloads/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✓ Python found: %PYTHON_VERSION%
echo.

REM Check requirements file exists
if not exist "requirements.txt" (
    echo ❌ requirements.txt not found
    echo Please run this from the project root folder
    pause
    exit /b 1
)

echo ✓ requirements.txt found
echo.

REM Install dependencies
echo 📦 Installing Python dependencies...
echo    (First time may take 2-5 minutes)
echo.
pip install -r requirements.txt -q
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    echo Please try: pip install -r requirements.txt
    pause
    exit /b 1
)

echo ✓ All dependencies installed
echo.

REM Create uploads directory
if not exist "uploads" (
    mkdir uploads
    echo ✓ Created uploads folder
)

echo ============================================================
echo   🚀 Starting Backend Server
echo ============================================================
echo.
echo ✓ Server will listen on: http://localhost:5000
echo ✓ CORS enabled for: http://localhost:3000
echo.
echo ✓ In a NEW terminal window, run: npm run dev
echo.
echo Keep this window open while using the analyzer!
echo.
echo ============================================================
echo.

REM Start the backend
python api_backend_lite.py

if errorlevel 1 (
    echo.
    echo ❌ Backend failed to start
    echo.
    echo Troubleshooting:
    echo  • Check error message above
    echo  • Verify port 5000 is available
    echo  • Try: netstat -ano ^| findstr :5000
    echo.
)

pause
