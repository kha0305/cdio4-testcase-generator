@echo off
chcp 65001 >nul
echo =================================================================
echo CAI DAT TOAN BO DU AN AUTOTEST STUDIO (CDIO-4)
echo =================================================================
echo Dang kiem tra moi truong va cai dat cac phu thuoc...
echo.

:: 1. Kiem tra Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [LOI] May tinh chua cai dat Python hoac chua them Python vao PATH!
    echo Vui long cai dat Python 3.10+ tu https://www.python.org/
    pause
    exit /b 1
)

:: 2. Kiem tra Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [LOI] May tinh chua cai dat Node.js hoac chua them Node.js vao PATH!
    echo Vui long cai dat Node.js 18+ tu https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Dang cai dat thu vien Python Backend (FastAPI, SQLAlchemy, Z3, AllPairsPy)...
python -m pip install --upgrade pip
pip install -r backend/requirements.txt

echo.
echo [2/3] Dang cai dat thu vien Node.js Frontend (React, Vite, Lucide)...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Dang dong bo va kiem tra co so du lieu...
python migrate_db.py

echo.
echo =================================================================
echo [THANH CONG] DA HOAN TAT CAI DAT DU AN!
echo Bay gio ban co the chay file 'khoi_dong.bat' de khoi dong he thong.
echo =================================================================
pause
