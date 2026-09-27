/**
 * Bootstrap Script — CDIO-4 AutoTest Platform Backend
 * Khoi dong FastAPI backend tren may chu Pikamc (Nodejs 22 Docker container)
 *
 * Port mac dinh: 25148 (thay doi qua bien moi truong CDIO4_PORT)
 * Cach chay: node server.js
 */

const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const BACKEND_PORT = parseInt(process.env.CDIO4_PORT || "25148", 10);
const backendDir = path.resolve(__dirname, "backend");

console.log("=================================================================");
console.log("=== CDIO-4 AutoTest Platform -- Backend Startup (Pikamc Host) ===");
console.log("=================================================================");
console.log("[info] Thu muc backend : " + backendDir);
console.log("[info] Cong dich vu    : " + BACKEND_PORT);

// Buoc 1: Xac dinh lenh Python co san
let pyCmd = null;
for (const cmd of ["python3", "python"]) {
  try {
    execSync(`${cmd} --version`, { stdio: "ignore" });
    pyCmd = cmd;
    const ver = execSync(`${cmd} --version`, { encoding: "utf-8" }).trim();
    console.log("[info] Python phat hien : " + ver + " (" + cmd + ")");
    break;
  } catch (_) {}
}

// Buoc 2: Tu dong cai Python neu may chu chua co (chi tren Linux/Debian)
if (!pyCmd && process.platform === "linux") {
  console.log("[setup] Khong tim thay Python, dang tu dong cai dat python3 qua apt-get...");
  try {
    execSync("apt-get update -qq && apt-get install -y -qq python3 python3-pip", {
      stdio: "inherit",
      timeout: 180000,
    });
    pyCmd = "python3";
    console.log("[setup] Cai dat python3 thanh cong.");
  } catch (e) {
    console.error("[ERROR] Khong the cai dat Python: " + e.message);
    console.error("[ERROR] Vui long kiem tra quyen root hoac cai Python thu cong tren may chu.");
    process.exit(1);
  }
}

if (!pyCmd) {
  console.error("[ERROR] Khong tim thay Python tren may chu. Vui long cai dat Python 3.10+");
  process.exit(1);
}

// Buoc 3: Cai goi thu vien Python tu requirements.txt
const requirementsPath = path.join(backendDir, "requirements.txt");
if (fs.existsSync(requirementsPath)) {
  console.log("[setup] Dang cai dat goi thu vien Python (requirements.txt)...");
  const pipInstall = (extraFlag) => {
    try {
      execSync(
        `${pyCmd} -m pip install -r "${requirementsPath}" --quiet ${extraFlag}`,
        { cwd: backendDir, stdio: "pipe", timeout: 300000 }
      );
      return true;
    } catch (_) {
      return false;
    }
  };

  const ok = pipInstall("--break-system-packages") || pipInstall("");
  if (ok) {
    console.log("[setup] Thu vien Python da san sang.");
  } else {
    console.warn("[setup] Canh bao: Khong the tu dong cai goi Python. Gia su da co truoc.");
  }
} else {
  console.warn("[setup] Khong tim thay requirements.txt tai: " + requirementsPath);
}

// Buoc 4: Khoi dong FastAPI bang uvicorn
console.log("[start] Dang khoi dong FastAPI (uvicorn) tren cong " + BACKEND_PORT + "...");

function startBackend() {
  const proc = spawn(
    pyCmd,
    ["-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", String(BACKEND_PORT), "--workers", "1"],
    { cwd: backendDir, stdio: "inherit", env: { ...process.env } }
  );

  proc.on("error", (err) => {
    console.error("[ERROR] Khong the khoi dong uvicorn: " + err.message);
    setTimeout(startBackend, 5000);
  });

  proc.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.warn("[restart] Backend thoat (code=" + code + "), tu khoi dong lai sau 5s...");
      setTimeout(startBackend, 5000);
    }
  });
}

startBackend();
console.log("[ok] Backend CDIO-4 dang chay tai http://0.0.0.0:" + BACKEND_PORT);
console.log("[ok] API docs    : http://<host>:" + BACKEND_PORT + "/docs");
