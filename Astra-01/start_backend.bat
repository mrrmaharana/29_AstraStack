@echo off
REM Quick Start Guide for Advanced Image & Video Analyzer (Windows)

echo ======================================
echo OSINT Toolkit - Advanced Analyzer
echo Quick Start Setup (Windows)
echo ======================================
echo.

REM Check Python installation
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo X Python not found. Please install Python 3.8+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo OK Python found: %PYTHON_VERSION%
echo.

REM Install dependencies
echo Installing Python dependencies...
echo This may take a few minutes...
pip install -r requirements.txt --quiet
echo OK Dependencies installed
echo.

REM Create upload directory
echo Creating upload directory...
if not exist "uploads" mkdir uploads
echo OK Upload directory created
echo.

REM Start Python backend
echo Starting Python API Backend on port 5000...
echo.
echo API Endpoints:
echo   - POST /api/analyze-image
echo   - POST /api/analyze-video
echo   - POST /api/strip-metadata
echo   - GET /health
echo.
echo Open browser: http://localhost:3000
echo.
echo Starting Python backend...
echo.

python api_backend.py

pause
