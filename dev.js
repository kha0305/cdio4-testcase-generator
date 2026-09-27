/**
 * Bộ điều phối khởi chạy đồng thời Backend (FastAPI) và Frontend (Vite React)
 * Zero-dependency: Dùng thư viện chuẩn của Node.js, không cần npm install thêm gói ngoài.
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('=== KHOI DONG DONG THOI BACKEND (FASTAPI) VA FRONTEND (VITE) ===');
console.log('================================================================');
console.log('-> Backend API : http://127.0.0.1:8000 (Tai lieu Swagger: /docs)');
console.log('-> Frontend UI : http://localhost:5173');
console.log('-> Nhan Ctrl + C bat ky luc nao de dung toan bo he thong an toan.\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Khởi chạy Backend FastAPI
const backend = spawn('python', [
  '-m', 'uvicorn',
  'main:app',
  '--app-dir', 'backend',
  '--host', '127.0.0.1',
  '--port', '8000',
  '--reload'
], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: isWin
});

backend.on('error', (err) => {
  console.error('[Loi Backend]: Khong the khoi dong Python/Uvicorn:', err.message);
});

// 2. Khởi chạy Frontend React Vite
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: isWin
});

frontend.on('error', (err) => {
  console.error('[Loi Frontend]: Khong the khoi dong Vite:', err.message);
});

// 3. Dọn dẹp sạch tiến trình khi dừng (Ctrl + C)
let isShuttingDown = false;
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n[Thong bao] Dang tat sach cac tien trinh Backend va Frontend...');

  try {
    if (backend && backend.pid) {
      if (isWin) {
        spawn('taskkill', ['/pid', String(backend.pid), '/f', '/t']);
      } else {
        backend.kill('SIGTERM');
      }
    }
  } catch (e) {}

  try {
    if (frontend && frontend.pid) {
      if (isWin) {
        spawn('taskkill', ['/pid', String(frontend.pid), '/f', '/t']);
      } else {
        frontend.kill('SIGTERM');
      }
    }
  } catch (e) {}

  setTimeout(() => process.exit(0), 600);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);
