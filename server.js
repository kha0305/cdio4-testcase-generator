/**
 * Bootstrap Script — CDIO-4 AutoTest Platform Backend
 * Khoi dong FastAPI backend tren may chu Pikamc (Python uvicorn)
 *
 * Port mac dinh: 25148 (co the thay doi qua bien moi truong CDIO4_PORT)
 * De chay: node server.js
 */

const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const BACKEND_PORT = parseInt(process.env.CDIO4_PORT || "25148", 10);
const pyCmd = process.platform === "win32" ? "python" : "python3";
const backendDir = path.resolve(__dirname, "backend");

console.log("================================================================");
console.log("=== CDIO-4 AutoTest Platform — Backend Startup (Pikamc Host) ===");
console.log("================================================================");
console.log(`[info] Thu muc backend: ${backendDir}`);
console.log(`[info] Cong dich vu: ${BACKEND_PORT}`);

// Buoc 1: Kiem tra Python co san
try {
  const pyVer = execSync(`${pyCmd} --version`, { encoding: "utf-8" }).trim();
  console.log(`[info] Phat hien: ${pyVer}`);
} catch (e) {
  console.error("[ERROR] Khong tim thay Python! Vui long cai dat Python 3.10+");
  process.exit(1);
}

// Buoc 2: Tu dong cai dat goi thu vien Python (neu chua co)
console.log("[setup] Kiem tra va cai dat thu vien Python backend...");
const requirementsPath = path.join(backendDir, "requirements.txt");

if (fs.existsSync(requirementsPath)) {
  try {
    execSync(
      `${pyCmd} -m pip install -r "${requirementsPath}" --quiet --break-system-packages`,
      { cwd: backendDir, stdio: "pipe", timeout: 180000 }
    );
    console.log("[setup] Thu vien Python da san sang.");
  } catch (e) {
    // Thu lai khong co --break-system-packages (moi truong thuong)
    try {
      execSync(
        `${pyCmd} -m pip install -r "${requirementsPath}" --quiet`,
        { cwd: backendDir, stdio: "pipe", timeout: 180000 }
      );
      console.log("[setup] Thu vien Python da san sang (che do thuong).");
    } catch (e2) {
      console.warn("[setup] Canh bao: Khong the tu dong cai goi Python. Gia su da cai truoc.");
    }
  }
} else {
  console.warn(`[setup] Khong tim thay requirements.txt tai ${requirementsPath}`);
}

// Buoc 3: Khoi chay FastAPI bang uvicorn
console.log(`[start] Dang khoi dong FastAPI (uvicorn) tren cong ${BACKEND_PORT}...`);

const uvicornArgs = [
  "-m", "uvicorn",
  "main:app",
  "--host", "0.0.0.0",
  "--port", String(BACKEND_PORT),
  "--workers", "2",
];

const backend = spawn(pyCmd, uvicornArgs, {
  cwd: backendDir,
  stdio: "inherit",
  env: { ...process.env }
});

backend.on("error", (err) => {
  console.error(`[ERROR] Khong the khoi dong uvicorn: ${err.message}`);
  process.exit(1);
});

backend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[ERROR] Backend thoat voi ma loi ${code}. Khoi dong lai sau 5s...`);
    setTimeout(() => {
      require("child_process").fork(__filename);
    }, 5000);
  }
});

console.log(`[ok] Backend CDIO-4 dang chay tai http://0.0.0.0:${BACKEND_PORT}`);
console.log(`[ok] Swagger UI: http://0.0.0.0:${BACKEND_PORT}/docs`);
console.log(
  `[ok] CORS frontend GitHub Pages: https://kha0305.github.io`
);
