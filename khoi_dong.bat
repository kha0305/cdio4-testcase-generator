@echo off
chcp 65001 >nul
echo =================================================================
echo KHOI DONG HE THONG AUTOTEST STUDIO (CDIO-4)
echo =================================================================
echo.
echo [1/2] Dang khoi dong Backend FastAPI (Port 8000)...
start "AutoTest Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Dang khoi dong Frontend Web Studio (Port 5173)...
start "AutoTest Frontend (Vite React)" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 2 /nobreak >nul

echo.
echo Dang mo trinh duyet truy cap he thong...
start http://localhost:5173

echo.
echo =================================================================
echo HE THONG DA SAN SANG!
echo - Giao dien Web:   http://localhost:5173
echo - API Backend:     http://localhost:8000
echo - Tai lieu API:    http://localhost:8000/docs
echo.
echo Tai khoan kiem thu co san:
echo + Truong nhom (Leader):  qalead   / 123456
echo + Thanh vien (Member):   tester01 / 123456
echo.
echo Vui long giu 2 cua so Backend va Frontend trong khi kiem thu!
echo =================================================================
