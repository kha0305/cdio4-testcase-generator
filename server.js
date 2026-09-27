const { existsSync } = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

const frontendIndexPath = path.resolve(
  __dirname,
  "frontend",
  "dist",
  "index.html"
);

if (!existsSync(frontendIndexPath)) {
  console.log("[bootstrap] Chưa có frontend/dist, bắt đầu build frontend...");
  execSync("npm run build", {
    cwd: __dirname,
    stdio: "inherit",
  });
}

// Tu dong don dep cache va tep tam neu chay tren Linux container de tranh day o dia
if (process.platform !== "win32") {
  try {
    execSync("rm -rf ~/.cache/pip /tmp/pip-* /tmp/pip-build-* /tmp/blis* /tmp/thinc* 2>/dev/null || true", { stdio: "ignore" });
  } catch (_e) {}
}

// Tu dong kiem tra va cai dat FFmpeg tren Linux container (de tao thumbnail video)
if (process.platform !== "win32") {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    console.log("[bootstrap] FFmpeg da san sang.");
  } catch (_noFfmpeg) {
    console.log("[bootstrap] Kiem tra va tu dong cai dat FFmpeg de tao thumbnail...");
    try {
      execSync("apt-get update -qq && apt-get install -y -qq ffmpeg", { stdio: "ignore", timeout: 180000 });
      console.log("[bootstrap] Cai dat FFmpeg thanh cong!");
    } catch (_aptErr) {
      try {
        execSync("apk add --no-cache ffmpeg", { stdio: "ignore", timeout: 180000 });
        console.log("[bootstrap] Cai dat FFmpeg (apk) thanh cong!");
      } catch (_apkErr) {
        console.log("[bootstrap] Bo qua cai FFmpeg (he thong su dung Pure-JS MP4 Inspector).");
      }
    }
  }
}

// Tự động kiểm tra và cài đặt thư viện Python Scraper (requests, beautifulsoup4, ddddocr)
const pyCmd = process.platform === "win32" ? "python" : "python3";
try {
  execSync(`${pyCmd} -c "import requests, bs4, ddddocr"`, { stdio: "ignore" });
  console.log("[bootstrap] Thư viện Python (requests, bs4, ddddocr) đã sẵn sàng.");
} catch (_e) {
  console.log("[bootstrap] Kiểm tra và tự động cấu hình môi trường Python...");
  try {
    let hasPip = false;
    try {
      execSync(`${pyCmd} -m pip --version`, { stdio: "ignore" });
      hasPip = true;
    } catch (_noPip) {}

    if (!hasPip) {
      console.log("[bootstrap] Máy chủ chưa có pip, đang tự động cài đặt pip...");
      const getPipPath = path.resolve(__dirname, "get-pip.py");
      try {
        execSync(
          `${pyCmd} -c "import urllib.request; urllib.request.urlretrieve('https://bootstrap.pypa.io/get-pip.py', r'${getPipPath}')"`,
          { timeout: 30000 }
        );
        execSync(`${pyCmd} "${getPipPath}" --user --no-warn-script-location --break-system-packages`, {
          stdio: "inherit",
          timeout: 90000,
        });
        console.log("[bootstrap] Cài đặt pip thành công!");
      } catch (errGetPip) {
        console.log("[bootstrap] Không thể tải get-pip.py:", errGetPip.message);
      }
    }

    console.log("[bootstrap] Đang tự động cài đặt (requests, beautifulsoup4, ddddocr)...");
    try {
      execSync(`${pyCmd} -m pip install requests beautifulsoup4 ddddocr --user --break-system-packages`, {
        stdio: "inherit",
        timeout: 120000,
      });
      console.log("[bootstrap] Tự động cài đặt thư viện Python thành công!");
    } catch (errInstall) {
      console.log("[bootstrap] Chạy scraper ở chế độ fallback tiêu chuẩn.");
    }
  } catch (errGeneral) {
    console.log("[bootstrap] Bỏ qua bước cài đặt thư viện:", errGeneral.message);
  }
}

// Khởi chạy Cloudflare Tunnel tự động nếu có token
const defaultTunnelToken =
  "eyJhIjoiZDQzYTU4OTA2NGVkY2RkMWQ4YjQzMjZiNWI5NDVmMzgiLCJ0IjoiYmE4NGM2OTEtN2VjNS00NzczLTllNDItNWJjYzFiODFiMTE1IiwicyI6IllUZ3dOV1V3TXpndFpETmtNaTAwT0dReExXRTFNREV0WkRJelpqUmpZalk1TWpKaiJ9";
const tunnelToken = process.env.CLOUDFLARE_TUNNEL_TOKEN || defaultTunnelToken;
let startTunnel = null;

if (tunnelToken) {
  const { spawn, execSync } = require("child_process");
  const fs = require("fs");
  const binName = process.platform === "win32" ? "cloudflared.exe" : "cloudflared";
  const binPath = path.resolve(__dirname, binName);

  // Tự động kiểm tra và tải binary cloudflared nếu chưa có trên máy chủ
  if (!fs.existsSync(binPath) || fs.statSync(binPath).size === 0) {
    let downloadUrl = "";
    if (process.platform === "win32") {
      downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe";
    } else if (process.platform === "linux") {
      if (process.arch === "arm64") {
        downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64";
      } else if (process.arch === "arm") {
        downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm";
      } else {
        downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64";
      }
    } else if (process.platform === "darwin") {
      downloadUrl = process.arch === "arm64"
        ? "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64"
        : "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64";
    }

    if (downloadUrl) {
      console.log(`\x1b[1;34m[tunnel]\x1b[0m \x1b[96mĐang tự động tải binary ${binName} cho ${process.platform}-${process.arch}...\x1b[0m`);
      let downloaded = false;

      // 1. Thử dùng curl
      try {
        execSync(`curl -sSL "${downloadUrl}" -o "${binPath}"`, { timeout: 90000, stdio: "ignore" });
        if (fs.existsSync(binPath) && fs.statSync(binPath).size > 1000000) downloaded = true;
      } catch (_e) {}

      // 2. Thử dùng wget
      if (!downloaded) {
        try {
          execSync(`wget -q "${downloadUrl}" -O "${binPath}"`, { timeout: 90000, stdio: "ignore" });
          if (fs.existsSync(binPath) && fs.statSync(binPath).size > 1000000) downloaded = true;
        } catch (_e) {}
      }

      // 3. Thử dùng python urllib
      if (!downloaded) {
        try {
          execSync(`${pyCmd} -c "import urllib.request; req = urllib.request.Request('${downloadUrl}', headers={'User-Agent': 'Mozilla/5.0'}); data = urllib.request.urlopen(req).read(); open(r'${binPath}', 'wb').write(data)"`, {
            timeout: 120000,
            stdio: "ignore",
          });
          if (fs.existsSync(binPath) && fs.statSync(binPath).size > 1000000) downloaded = true;
        } catch (_e) {}
      }

      if (downloaded) {
        if (process.platform !== "win32") {
          try { fs.chmodSync(binPath, 0o777); } catch (_e) {}
        }
        console.log(`\x1b[1;34m[tunnel]\x1b[0m \x1b[92mTải binary ${binName} thành công (${(fs.statSync(binPath).size / 1024 / 1024).toFixed(1)} MB)!\x1b[0m`);
      } else {
        console.log(`\x1b[1;31m[tunnel]\x1b[0m Chưa thể tự động tải ${binName}, vui lòng kiểm tra kết nối mạng host.\x1b[0m`);
      }
    }
  }

  startTunnel = () => {
    if (fs.existsSync(binPath)) {
      if (process.platform !== "win32") {
        try { fs.chmodSync(binPath, 0o777); } catch (_e) {}
      }
      let loggedConnected = false;
      console.log("\x1b[1;34m[tunnel]\x1b[0m \x1b[96mĐang kết nối Cloudflare Tunnel (HTTP/2)...\x1b[0m");
      const tunnelArgs = [
        "tunnel",
        "run",
        "--protocol", "http2",
        "--token", tunnelToken
      ];
      const tunnel = spawn(binPath, tunnelArgs, {
        stdio: ["ignore", "pipe", "pipe"],
      });

      const handleTunnelOutput = (data) => {
        const text = data.toString().trim();
        if (text.includes("Registered tunnel connection")) {
          const connMatch = text.match(/connIndex=(\d+)[^]*location=(\w+)/i);
          const location = connMatch ? ` (Vị trí: ${connMatch[2]})` : "";
          if (!loggedConnected) {
            console.log(`\x1b[1;34m[tunnel]\x1b[0m \x1b[1;92mĐã kết nối Cloudflare Tunnel thành công${location} -> https://dtu-portal.server.id.vn\x1b[0m`);
            loggedConnected = true;
          }
        } else if (
          (text.includes("ERR") || text.includes("fatal")) &&
          !text.includes("QUIC") &&
          !text.includes("timeout: no recent network activity") &&
          !text.includes("accept stream listener") &&
          !text.includes("client disconnected") &&
          !text.includes("stream closed") &&
          !text.includes("context canceled") &&
          !text.includes("incoming request ended abruptly") &&
          !text.includes("Failed to proxy HTTP: http2: stream closed") &&
          !text.includes("Failed to proxy HTTP: context canceled") &&
          !text.includes("Failed to refresh DNS local resolver")
        ) {
          console.log(`\x1b[1;31m[tunnel]\x1b[0m \x1b[1;91m${text}\x1b[0m`);
        }
      };

      tunnel.stdout.on("data", handleTunnelOutput);
      tunnel.stderr.on("data", handleTunnelOutput);

      tunnel.on("error", (err) => {
        console.log(`\x1b[1;31m[tunnel]\x1b[0m Lỗi khởi chạy tiến trình tunnel: ${err.message}`);
      });

      tunnel.on("exit", (code) => {
        loggedConnected = false;
        console.log(`\x1b[1;34m[tunnel]\x1b[0m \x1b[93mCloudflare Tunnel dừng (exit code ${code}), tự động khởi động lại sau 5s...\x1b[0m`);
        setTimeout(startTunnel, 5000);
      });
    } else {
      console.log(`\x1b[1;34m[tunnel]\x1b[0m \x1b[90mChưa tìm thấy file binary ${binName}, bỏ qua khởi chạy tunnel.\x1b[0m`);
    }
  };

  // Tunnel se duoc khoi chay sau khi tat ca cac service (backend 25146 & video 25147) da san sang
}

// Kiem tra va tu dong cai dat dependencies neu thieu mysql2
try {
  require.resolve("mysql2/promise");
} catch (_noMysql) {
  console.log("[bootstrap] Thieu thu vien mysql2, dang tu dong cai dat...");
  try {
    execSync("npm install mysql2 axios cheerio compression xlsx node-zalo-bot --no-audit --no-fund", {
      cwd: __dirname,
      stdio: "inherit"
    });
    console.log("[bootstrap] Cai dat dependencies thanh cong.");
  } catch (errInstall) {
    console.log("[bootstrap] Khong the tu dong chay npm install:", errInstall.message);
  }
}

// Khoi chay Exam Lookup System Backend (Port 25146)
require("./backend/src/server.js");

// Tu dong kiem tra va khoi phuc metadata video neu bi loi/rong do day o dia
const possibleStorageDirs = [
  path.resolve(__dirname, "storage"),
  path.resolve(__dirname, "video-streaming-service", "storage"),
];

for (const videoStorageDir of possibleStorageDirs) {
  const videoFilesDir = path.join(videoStorageDir, "videos");
  const videoMetaPath = path.join(videoStorageDir, "metadata.json");

  if (existsSync(videoFilesDir)) {
    try {
      const fs = require("fs");
      let currentMeta = [];
      try {
        if (existsSync(videoMetaPath)) {
          currentMeta = JSON.parse(fs.readFileSync(videoMetaPath, "utf-8") || "[]");
        }
      } catch (_err) {
        currentMeta = [];
      }

      const files = fs.readdirSync(videoFilesDir);
      const videoFiles = files.filter((f) => /\.(mp4|mkv|webm|avi|mov|ts)$/i.test(f));

      let hasNew = false;
      for (const file of videoFiles) {
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        const safeId = base.replace(/[^a-zA-Z0-9_-]/g, "_") || ("vid_" + Date.now());

        const alreadyIndexed = currentMeta.some(
          (v) => v.filename === file || v.id === safeId || v.id === base
        );
        if (!alreadyIndexed) {
          const stat = fs.statSync(path.join(videoFilesDir, file));
          currentMeta.push({
            id: safeId,
            title: base.replace(/[_-]+/g, " "),
            filename: file,
            size: stat.size,
            duration: 0,
            views: 1,
            resolution: "1080p",
            thumbnail: null,
            createdAt: stat.birthtime ? stat.birthtime.toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          hasNew = true;
        }
      }

      if (hasNew || (currentMeta.length === 0 && videoFiles.length > 0)) {
        fs.writeFileSync(videoMetaPath, JSON.stringify(currentMeta, null, 2), "utf-8");
        console.log(`[video-rescue] Da dong bo ${currentMeta.length} video vao ${videoMetaPath} thanh cong!`);
      }
    } catch (errRescue) {
      console.log("[video-rescue] Loi khi tu dong khoi phuc video:", errRescue.message);
    }
  }
}

// Khoi chay Video Streaming Microservice (Port 25147)
const videoServerPath = path.resolve(__dirname, "video-streaming-service", "src", "server.js");
if (existsSync(videoServerPath)) {
  console.log("[bootstrap] Dang khoi chay Video Streaming Microservice tren port 25147...");
  try {
    process.env.VIDEO_PORT = "25147";
    require(videoServerPath);
  } catch (errVid) {
    console.log("[bootstrap] Loi khoi chay video service:", errVid.message);
  }
}

// ============================================================
// Khoi chay CDIO-4 AutoTest Platform Backend (Port 25145)
// Thu muc: ./cdio4-backend/ (upload qua SFTP)
// ============================================================
const cdio4Dir = path.resolve(__dirname, "cdio4-backend");
if (existsSync(cdio4Dir)) {
  console.log("[bootstrap] Phat hien thu muc cdio4-backend/, dang khoi dong CDIO-4 FastAPI tren port 25145...");

  const py = process.platform === "win32" ? "python" : "python3";
  let cdio4Retries = 0;
  const MAX_CDIO4_RETRIES = 3;

  // Kiem tra day du tat ca cac thu vien (sqlalchemy, pydantic, jose, v.v.)
  try {
    execSync(`${py} -c "import uvicorn, fastapi, sqlalchemy, pydantic, jose"`, { stdio: "ignore" });
    console.log("[cdio4] Thu vien FastAPI, Uvicorn, SQLAlchemy, Jose da san sang.");
  } catch (_missingPkg) {
    console.log("[cdio4] Dang tu dong cai cac thu vien con thieu (python-jose, v.v.) khong ton o dia...");
    try {
      execSync(
        `${py} -m pip install fastapi "uvicorn[standard]" sqlalchemy pydantic python-multipart "passlib[bcrypt]" bcrypt python-jose python-dotenv openpyxl allpairspy --user --break-system-packages --no-cache-dir -q`,
        {
          stdio: "inherit",
          timeout: 180000,
        }
      );
      console.log("[cdio4] Cai dat thu vien thanh cong!");
    } catch (errPkg) {
      console.log("[cdio4] Canh bao khi cai thu vien:", errPkg.message);
    }
  }

  // Khoi dong uvicorn FastAPI
  function startCdio4() {
    if (cdio4Retries >= MAX_CDIO4_RETRIES) {
      console.log(`[cdio4] Canh bao: Backend CDIO-4 da thu ${MAX_CDIO4_RETRIES} lan nhung khong the khoi dong. Tam dung tu dong khoi dong de tranh ngap log.`);
      return;
    }

    const cdio4Proc = spawn(py, [
      "-m", "uvicorn", "main:app",
      "--host", "0.0.0.0",
      "--port", "25145",
      "--workers", "1",
    ], {
      cwd: cdio4Dir,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });

    cdio4Proc.stdout.on("data", (d) => {
      const line = d.toString().trim();
      if (line) {
        console.log("[cdio4] " + line);
        if (line.includes("Application startup complete")) {
          cdio4Retries = 0;
        }
      }
    });
    cdio4Proc.stderr.on("data", (d) => {
      const line = d.toString().trim();
      if (line && !line.includes("INFO:")) console.log("[cdio4] " + line);
    });
    cdio4Proc.on("exit", (code) => {
      cdio4Retries++;
      if (cdio4Retries < MAX_CDIO4_RETRIES) {
        console.log(`[cdio4] Backend thoat (code=${code}), thu lai lan ${cdio4Retries}/${MAX_CDIO4_RETRIES} sau 5s...`);
        setTimeout(startCdio4, 5000);
      } else {
        console.log(`[cdio4] Backend thoat (code=${code}). Da dat gioi han ${MAX_CDIO4_RETRIES} lan, tam dung tu dong khoi dong de tranh ngap log.`);
      }
    });
    cdio4Proc.on("error", (err) => {
      console.log("[cdio4] Loi: " + err.message);
    });
  }

  startCdio4();
  console.log("[bootstrap] CDIO-4 backend dang khoi dong tren cong 25145...");
} else {
  console.log("[bootstrap] Khong tim thay thu muc cdio4-backend/, bo qua CDIO-4 service.");
}

// Khoi chay Cloudflare Tunnel sau khi cac port da san sang
if (typeof startTunnel === 'function') {
  startTunnel();
}

