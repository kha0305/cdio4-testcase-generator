# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG LÊN HOSTING PANEL PTERODACTYL (PIKAMC.VN)

Tài liệu này hướng dẫn chi tiết cách triển khai, cấu hình và vận hành hệ thống phần mềm trên các nền tảng Hosting sử dụng giao diện **Pterodactyl Panel** (tương tự dịch vụ tại `hub.pikamc.vn` như trong bảng điều khiển thực tế của dự án).

---

## 1. TỔNG QUAN KIẾN TRÚC MÁY CHỦ PTERODACTYL

Pterodactyl là bảng điều khiển quản trị máy chủ dựa trên Docker Container:
- **Thư mục làm việc mặc định**: `/home/container/`
- **Môi trường thực thi**: Mỗi máy chủ (Server Node) được cô lập trong 1 Docker Container riêng biệt với hạn ngạch tài nguyên (RAM, CPU, Dung lượng đĩa).
- **Cơ chế cổng mạng (Port Binding)**: Máy chủ được cấp phát 1 hoặc nhiều cổng mạng nội bộ cụ thể (ví dụ: `25146`, `25147`).
- **Xuất bản ra Internet**: Kết hợp với **Cloudflare Tunnel** để ánh xạ cổng nội bộ sang tên miền công khai (ví dụ: `https://api.your-domain.id.vn` hoặc `https://app.your-domain.id.vn`) mà không cần mở cổng NAT hoặc IP tĩnh.

---

## 2. QUY TRÌNH TRIỂN KHAI 5 BƯỚC

### Bước 1: Chuẩn bị tệp tin mã nguồn
Trước khi tải lên máy chủ, cần nén mã nguồn thành tệp `.zip` hoặc `.tar.gz` (loại bỏ thư mục `node_modules/`, `venv/`, `dist/` để tệp tin nhẹ và truyền tải nhanh).

Cấu trúc thư mục tối thiểu đưa lên `/home/container/`:
```text
/home/container/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   ├── engine/
│   └── routers/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── dist/              (sau khi build)
├── ecosystem.config.js    (hoặc server.js khởi chạy)
├── .env                   (biến môi trường bảo mật)
└── start.sh               (kịch bản chạy tự động)
```

### Bước 2: Tải tệp lên qua Bảng điều khiển hoặc SFTP
Có 2 cách đưa tệp lên máy chủ:
1. **Cách 1 - Web File Manager**:
   - Truy cập thanh bên trái: **Quản lý** $\rightarrow$ **Tệp tin**.
   - Kéo thả tệp `.zip` vào giao diện.
   - Nhấp vào biểu tượng ba chấm $\rightarrow$ Chọn **Unarchive (Giải nén)**.
2. **Cách 2 - Kết nối SFTP**: Sử dụng FileZilla hoặc WinSCP (xem chi tiết tại tài liệu [HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md)).

### Bước 3: Cấu hình cổng mạng (Network Allocations)
1. Vào mục **Cấu hình** $\rightarrow$ **Mạng**.
2. Quan sát danh sách cổng được cấp phát:
   - Cổng chính (Primary Port): Được gán tự động vào biến môi trường `{{SERVER_PORT}}` (ví dụ: `25147`).
   - Cổng phụ (Additional Ports): Dùng nếu chạy thêm microservice hoặc tunnel (ví dụ: `3000`, `25146`).

### Bước 4: Thiết lập lệnh khởi động (Startup Configuration)
1. Vào mục **Cấu hình** $\rightarrow$ **Khởi Động (Startup)**.
2. Kiểm tra và thiết lập các biến môi trường:
   - `SERVER_PORT`: Cổng chính máy chủ cấp (ví dụ `25147`).
   - `NODE_ENV`: `production`
   - `PYTHON_VERSION`: `3.11` hoặc `3.12`
3. Cấu hình **Startup Command**:
   - Đối với ứng dụng Node.js:
     ```bash
     npm install --production && node server.js
     ```
   - Đối với ứng dụng Python FastAPI (CDIO-4):
     ```bash
     pip install -r backend/requirements.txt && python -m uvicorn backend.main:app --host 0.0.0.0 --port {{SERVER_PORT}}
     ```
   - Đối với chạy đa tiến trình (Chạy cả Backend FastAPI + Cloudflare Tunnel):
     ```bash
     bash start.sh
     ```

### Bước 5: Cấu hình tập tin khởi động `start.sh`
Tạo tập tin `start.sh` ngay tại `/home/container/`:
```bash
#!/bin/bash
# 1. Cài đặt các gói phụ thuộc nếu chưa có
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# 2. Khởi động Backend FastAPI chạy nền
./backend/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port ${SERVER_PORT} &

# 3. Khởi chạy Cloudflare Tunnel để kết nối tên miền
cloudflared tunnel run --token ${TUNNEL_TOKEN}
```
Phân quyền thực thi cho kịch bản: `chmod +x start.sh`.

---

## 3. GIÁM SÁT TÀI NGUYÊN & XỬ LÝ LỖI (TROUBLESHOOTING)

### 3.1. Giám sát tài nguyên trực tiếp (Live Metrics)
Trên bảng điều khiển chính:
- **Tải CPU**: Không nên để vượt quá 90% liên tục.
- **Tải Bộ Nhớ (RAM)**: Đảm bảo tiến trình Node.js / Python không bị rò rỉ bộ nhớ (Memory Leak) vượt hạn mức 1 GiB.
- **Dung lượng Đĩa**: Thường xuyên kiểm tra thư mục lưu trữ `storage/` hoặc tệp nhật ký `*.log`.

### 3.2. Khắc phục lỗi `request aborted` hoặc `EADDRINUSE`
- **Lỗi cổng đã bị chiếm dụng (`EADDRINUSE`)**:
  - Xảy ra khi cổng `${SERVER_PORT}` bị một tiến trình cũ giữ lại chưa giải phóng.
  - Khắc phục: Nhấp nút **Dừng (Stop)** $\rightarrow$ Đợi 10 giây $\rightarrow$ Bấm **Khởi động lại (Restart)**.
- **Lỗi `BadRequestError: request aborted` (như trong ảnh chụp)**:
  - Nguyên nhân: Client hoặc Cloudflare Tunnel đóng kết nối giữa chừng khi payload gửi lên chưa hoàn tất hoặc timeout.
  - Khắc phục: Tăng timeout trong cấu hình server hoặc thêm middleware xử lý ngoại lệ bắt lỗi ngắt kết nối client an toàn.
