# HƯỚNG DẪN ĐÓNG GÓI DOCKER & KẾT NỐI CLOUDFLARE TUNNEL

Tài liệu này hướng dẫn cách đóng gói ứng dụng thành **Docker Container** chuẩn công nghiệp và thiết lập **Cloudflare Tunnel** để xuất bản hệ thống ra Internet với tên miền riêng (ví dụ `.id.vn` hoặc `.com`) bảo mật tuyệt đối mà không cần mở cổng modem mạng (Port Forwarding).

---

## 1. ĐÓNG GÓI ỨNG DỤNG BẰNG DOCKER

### 1.1. Dockerfile cho Backend FastAPI (`backend/Dockerfile`)
Tạo tệp `backend/Dockerfile` sử dụng base image Linux siêu nhẹ (`python:3.11-slim`):

```dockerfile
# Sử dụng base image Python chính thức bản nhẹ
FROM python:3.11-slim

# Thiết lập biến môi trường Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Cài đặt các gói phụ trợ hệ thống cần thiết (ví dụ build tool, curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Sao chép và cài đặt các thư viện Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ mã nguồn backend vào container
COPY . .

# Mở cổng mặc định 8000
EXPOSE 8000

# Khởi chạy máy chủ FastAPI qua Uvicorn
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 1.2. Dockerfile đa tầng (Multi-stage) cho Frontend React (`frontend/Dockerfile`)
Đóng gói Frontend kết hợp giữa Node.js (biên dịch code) và Nginx (phục vụ tệp tĩnh siêu nhẹ, chỉ ~25MB):

```dockerfile
# Giai đoạn 1: Biên dịch mã nguồn React Vite
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Giai đoạn 2: Phục vụ tệp tĩnh với Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Cấu hình chuyển hướng cho React SPA Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 2. QUẢN LÝ ĐA DỊCH VỤ VỚI DOCKER COMPOSE

Tạo tệp `docker-compose.yml` tại thư mục gốc để khởi chạy đồng thời Backend, Frontend và Cloudflare Tunnel:

```yaml
version: '3.8'

services:
  # 1. Dịch vụ Backend FastAPI
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cdio4_backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./backend/app.db:/app/app.db
    environment:
      - JWT_SECRET_KEY=your_production_secret_key_here
      - CORS_ORIGINS=*

  # 2. Dịch vụ Frontend Web Studio
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: cdio4_frontend
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - backend

  # 3. Dịch vụ Cloudflare Tunnel kết nối Internet
  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: cdio4_tunnel
    restart: unless-stopped
    command: tunnel run --token ${TUNNEL_TOKEN}
    depends_on:
      - frontend
      - backend
```

Lệnh điều khiển Docker Compose:
```bash
# Khởi động toàn bộ hệ thống ở chế độ chạy nền
docker compose up -d

# Xem nhật ký hoạt động thời gian thực
docker compose logs -f

# Dừng hệ thống an toàn
docker compose down
```

---

## 3. THIẾT LẬP CLOUDFLARE TUNNEL CHO TÊN MIỀN RIÊNG

Ví dụ mẫu thông báo khi kết nối thành công:
`[tunnel] Đã kết nối Cloudflare Tunnel thành công (Vị trí: sin19) -> https://app.your-domain.id.vn`

Cloudflare Tunnel thiết lập kết nối an toàn 2 chiều mã hóa TLS trực tiếp từ container đến trung tâm dữ liệu gần nhất của Cloudflare (ví dụ trạm Singapore `sin19`), mang lại nhiều lợi thế vượt trội:
- **Miễn phí 100% chứng chỉ SSL/TLS** (tự động gia hạn https).
- **Ẩn hoàn toàn địa chỉ IP gốc** của máy chủ, chống tấn công DDoS.
- **Không cần mở cổng modem** (bỏ qua mọi rào cản mạng NAT/CGNAT của nhà mạng viễn thông).

### Các bước tạo Cloudflare Tunnel:

1. **Đăng nhập Cloudflare Zero Trust**:
   - Truy cập: `https://one.dash.cloudflare.com/`.
   - Vào mục **Networks** $\rightarrow$ **Tunnels** $\rightarrow$ Bấm **Add a tunnel**.
2. **Chọn loại Cloudflared**:
   - Đặt tên tunnel (ví dụ: `my-app-tunnel`).
   - Sao chép đoạn mã Token cài đặt (chính là chuỗi mã sau tham số `--token eyJh...`).
3. **Cấu hình Public Hostname (Định tuyến tên miền mẫu)**:
   - Thêm Public Hostname 1 (Dành cho Cổng Web / API chính):
     - **Subdomain**: `app` (hoặc tiền tố mong muốn)
     - **Domain**: `your-domain.id.vn` (tên miền bạn sở hữu trên Cloudflare)
     - **Service Type**: `HTTP`
     - **URL**: `localhost:8000` (hoặc cổng gán tương ứng trên máy chủ, ví dụ: `localhost:25147`).
   - Thêm Public Hostname 2 (Dành cho Microservice / API phụ nếu có):
     - **Subdomain**: `api`
     - **Domain**: `your-domain.id.vn`
     - **Service Type**: `HTTP`
     - **URL**: `localhost:3000` (hoặc cổng nội bộ phụ: `localhost:25146`).
4. **Khởi chạy Tunnel**:
   - Nếu chạy trong container Pterodactyl: Thêm lệnh khởi chạy vào `start.sh`:
     ```bash
     cloudflared tunnel run --token <CHUOI_TOKEN_CUA_BAN> &
     ```
   - Quan sát bảng điều khiển Console: Khi xuất hiện dòng thông báo `Connected to Cloudflare Edge -> https://app.your-domain.id.vn`, hệ thống đã chính thức online toàn cầu.
