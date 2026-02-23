@echo off
echo ========================================
echo EasyXpense Backend - Starting Server
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
echo.

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please create .env file with:
    echo   MONGO_URI=your_mongodb_uri
    echo   JWT_SECRET_KEY=your_jwt_secret
    echo   SECRET_KEY=your_secret
    echo.
    pause
    exit /b 1
)

REM Start server
echo Starting Flask development server...
echo Server will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python run.py
