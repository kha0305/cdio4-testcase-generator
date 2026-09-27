# CẨM NANG TOÀN DIỆN VỀ MẠNG CĂN BẢN, ĐỊA CHỈ IP, CỔNG MẠNG, HỆ THỐNG DNS VÀ MÁY CHỦ HOSTING

Tài liệu này hệ thống hóa toàn bộ kiến thức nền tảng bắt buộc về hạ tầng mạng, hệ thống phân giải tên miền (DNS), cơ chế cổng mạng (Port), và cách phân biệt giữa các mô hình máy chủ (Shared Hosting, Container Hosting, VPS, Dedicated Server) phục vụ quá trình triển khai và vận hành hệ thống phần mềm chuyên nghiệp.

---

## 1. MẠNG CĂN BẢN: ĐỊA CHỈ IP VÀ CƠ CHẾ CỔNG MẠNG (PORT)

### 1.1. Địa chỉ IP (Internet Protocol Address)

Địa chỉ IP là một chuỗi số định danh duy nhất cho mỗi thiết bị khi tham gia vào mạng máy tính, tương tự như số nhà hoặc số điện thoại trong đời sống thực.

#### Phân biệt IPv4 và IPv6
- **IPv4 (Internet Protocol version 4)**:
  - Cấu trúc: 32 bit, chia thành 4 nhóm số thập phân cách nhau bởi dấu chấm (ví dụ: `180.93.100.154` hoặc `192.168.1.1`).
  - Giới hạn: Chỉ có khoảng 4.3 tỷ địa chỉ. Hiện nay tài nguyên IPv4 công cộng trên toàn cầu đã cạn kiệt.
- **IPv6 (Internet Protocol version 6)**:
  - Cấu trúc: 128 bit, viết dưới dạng 8 nhóm số thập lục phân cách nhau bởi dấu hai chấm (ví dụ: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`).
  - Cung cấp không gian địa chỉ gần như vô hạn ($3.4 \times 10^{38}$ địa chỉ).

#### Phân loại Địa chỉ IP theo phạm vi hoạt động
1. **IP Riêng (Private IP / Mạng nội bộ LAN)**:
   - Chỉ có giá trị trong mạng cục bộ của gia đình, trường học, công ty hoặc mạng Docker nội bộ.
   - Các dải IP riêng chuẩn quốc tế (RFC 1918):
     - `192.168.0.0` - `192.168.255.255` (phổ biến trong router gia đình)
     - `10.0.0.0` - `10.255.255.255` (phổ biến trong doanh nghiệp, data center)
     - `172.16.0.0` - `172.31.255.255` (thường dùng trong Docker network)
   - Các thiết bị ngoài Internet **không thể** truy cập trực tiếp vào IP riêng.
2. **IP Công cộng (Public IP / Mạng toàn cầu WAN)**:
   - Địa chỉ duy nhất trên toàn mạng Internet do nhà mạng (ISP) hoặc trung tâm dữ liệu cấp phát.
   - Bất kỳ ai trên thế giới đều có thể kết nối đến địa chỉ này nếu cổng dịch vụ được mở.
3. **Localhost & Địa chỉ Loopback (`127.0.0.1` / `::1`)**:
   - Địa chỉ đặc biệt trỏ thẳng vào chính máy tính mà chương trình đang chạy.
   - Dùng để kiểm thử ứng dụng cục bộ khi phát triển (ví dụ: `http://127.0.0.1:8000` hoặc `http://localhost:5173`).
4. **Hiện tượng CGNAT (Carrier-Grade NAT) tại Việt Nam**:
   - Do cạn kiệt IPv4, các nhà mạng (Viettel, FPT, VNPT) thường không cấp cho từng hộ gia đình một Public IP riêng, mà gom hàng trăm hộ gia đình dùng chung một Public IP qua thiết bị NAT của nhà mạng.
   - Hệ quả: Bạn không thể tự mở cổng (Port Forwarding) trên modem gia đình để chạy server ra ngoài Internet. Đây là lý do công nghệ **Cloudflare Tunnel** ra đời để giải quyết triệt để vấn đề này mà không cần xin cấp IP tĩnh.

---

### 1.2. Cổng Mạng (Port) và Cơ Chế Lắng Nghe (Port Binding)

Nếu xem địa chỉ IP là **địa chỉ tòa nhà**, thì Port (Cổng) chính là **số phòng cụ thể** bên trong tòa nhà đó. Một máy chủ có một IP duy nhất nhưng có thể chạy hàng trăm dịch vụ khác nhau nhờ phân chia qua các Port riêng biệt.

#### Không gian cổng mạng (Port Range: 0 đến 65535)
Toàn bộ hệ thống có $2^{16} = 65,536$ cổng, được chia làm 3 phân vùng:
- **0 - 1023 (Well-Known Ports)**: Cổng tiêu chuẩn hệ thống, yêu cầu quyền quản trị viên (Root/Administrator) để khởi chạy.
- **1024 - 49151 (Registered Ports)**: Cổng dịch vụ thông dụng cho các ứng dụng cơ sở dữ liệu, backend, game server.
- **49152 - 65535 (Dynamic / Private Ports)**: Cổng động tự động cấp cho các phiên kết nối tạm thời từ client.

#### Bảng tra cứu các cổng tiêu chuẩn trong phát triển phần mềm

| Cổng | Giao thức / Ứng dụng | Mục đích sử dụng |
| :--- | :--- | :--- |
| **80** | HTTP | Truy cập web tiêu chuẩn (không mã hóa) |
| **443** | HTTPS | Truy cập web bảo mật mã hóa TLS/SSL |
| **22** | SSH / SFTP chuẩn | Điều khiển dòng lệnh máy chủ Linux từ xa |
| **2022 / 2023** | SFTP Daemon (Wings) | Cổng truyền tải tệp tin bảo mật riêng trên nền tảng Pterodactyl Panel |
| **3306** | MySQL / MariaDB | Hệ quản trị cơ sở dữ liệu quan hệ |
| **5432** | PostgreSQL | Hệ quản trị cơ sở dữ liệu quan hệ nâng cao |
| **6379** | Redis | Hệ thống lưu trữ bộ nhớ đệm (In-memory Cache) |
| **8000** | FastAPI / Django / Uvicorn | Cổng mặc định máy chủ Backend Python API trong dự án CDIO-4 |
| **5173** | Vite Dev Server | Cổng giao diện người dùng React Frontend trong dự án CDIO-4 |
| **3000** | Node.js / React / Next.js | Cổng phát triển web phổ biến |

#### Cơ chế Lắng nghe: `127.0.0.1` khác gì `0.0.0.0`?
- **Lắng nghe trên `127.0.0.1:8000` (Localhost)**:
  - Chỉ chấp nhận các kết nối xuất phát từ chính máy tính nội bộ.
  - Các thiết bị khác trong mạng LAN hoặc bên ngoài Internet hoàn toàn không thể truy cập.
- **Lắng nghe trên `0.0.0.0:8000` (All Interfaces)**:
  - Máy chủ chấp nhận kết nối đến từ bất kỳ địa chỉ IP nào trên mọi card mạng (cả mạng nội bộ LAN lẫn mạng Internet).
  - Đây là cấu hình bắt buộc khi chạy Backend trong Docker Container hoặc máy chủ Hosting để có thể tiếp nhận yêu cầu từ bên ngoài.

---

## 2. HỆ THỐNG TÊN MIỀN (DOMAIN NAME) VÀ CƠ CHẾ PHÂN GIẢI DNS

### 2.1. Cấu trúc phân cấp của Tên Miền
Tên miền là tên gọi dễ nhớ thay thế cho các địa chỉ IP số phức tạp. Cấu trúc tên miền được đọc từ phải sang trái:

```text
api.example-service.id.vn
│   │               │   └── TLD Cấp 1 (ccTLD quốc gia Việt Nam: .vn)
│   │               └────── TLD Cấp 2 (Dành cho cá nhân số: .id.vn, hoặc doanh nghiệp: .com.vn)
│   └────────────────────── Tên miền chính (Second-Level Domain: example-service)
└────────────────────────── Tên miền con (Subdomain: api)
```

- **Root**: Gốc của toàn bộ mạng Internet (ký hiệu bằng dấu chấm cuối cùng `.`).
- **TLD (Top-Level Domain)**:
  - TLD quốc tế phổ thông (gTLD): `.com`, `.net`, `.org`, `.io`, `.dev`.
  - TLD mã quốc gia (ccTLD): `.vn` (Việt Nam), `.jp` (Nhật Bản), `.us` (Mỹ).
  - TLD chuyên dụng: `.edu.vn` (giáo dục), `.gov.vn` (chính phủ), `.id.vn` (định danh cá nhân Việt Nam).
- **Subdomain**: Tiền tố đứng trước tên miền chính dùng để phân tách các dịch vụ độc lập trong cùng một dự án:
  - `app.your-domain.id.vn` $\rightarrow$ Giao diện ứng dụng chính.
  - `api.your-domain.id.vn` $\rightarrow$ Cổng giao tiếp máy chủ dữ liệu.
  - `auth.your-domain.id.vn` $\rightarrow$ Cổng xác thực người dùng.

---

### 2.2. Cơ chế phân giải DNS (Domain Name System)
DNS hoạt động như **cuốn danh bạ điện thoại toàn cầu của Internet**:
1. Người dùng nhập tên miền `app.your-domain.id.vn` vào trình duyệt.
2. Trình duyệt kiểm tra bộ nhớ đệm (Cache) trên máy tính. Nếu không có, gửi yêu cầu tới **DNS Resolver** của nhà mạng hoặc DNS công cộng (như `1.1.1.1` của Cloudflare hoặc `8.8.8.8` của Google).
3. DNS Resolver hỏi tuần tự: Root Server $\rightarrow$ TLD Server (`.vn`) $\rightarrow$ Authoritative Nameserver (nơi quản lý bản ghi tên miền của bạn, ví dụ Cloudflare Nameservers).
4. Authoritative Nameserver trả về địa chỉ IP đích tương ứng. Trình duyệt kết nối trực tiếp đến IP đó để tải trang web.

---

### 2.3. Bảng tra cứu các bản ghi DNS (DNS Records) quan trọng nhất

| Loại Bản Ghi | Tên gọi đầy đủ | Chức năng chính | Ví dụ thực tế |
| :--- | :--- | :--- | :--- |
| **Record A** | Address Record | Ánh xạ trực tiếp tên miền sang một địa chỉ **IPv4**. | `your-domain.id.vn` $\rightarrow$ `103.145.63.12` |
| **Record AAAA** | IPv6 Address Record | Ánh xạ tên miền sang một địa chỉ **IPv6**. | `your-domain.id.vn` $\rightarrow$ `2405:4803::1` |
| **Record CNAME** | Canonical Name | Tạo tên miền bí danh (Alias) trỏ về một tên miền khác thay vì trỏ IP. | `www.your-domain.id.vn` $\rightarrow$ `your-domain.id.vn` |
| **Record TXT** | Text Record | Lưu trữ văn bản tự do, dùng để xác thực sở hữu tên miền, cấu hình bảo mật email (SPF, DKIM, DMARC). | `v=spf1 include:_spf.google.com ~all` |
| **Record MX** | Mail Exchange | Định tuyến các email gửi tới đuôi tên miền về máy chủ hòm thư tương ứng. | `alt1.aspmx.l.google.com` (Độ ưu tiên 10) |

---

### 2.4. Khái niệm TTL (Time-To-Live) và Độ Trễ Cập Nhật (Propagation)
- **TTL (Time-To-Live)**: Thời gian (tính bằng giây) mà các máy chủ DNS trung gian trên thế giới được phép lưu bản ghi DNS trong bộ nhớ đệm (cache) mà không cần hỏi lại Authoritative Nameserver.
  - TTL chuẩn thường là `3600` (1 giờ) hoặc `300` (5 phút đối với các hệ thống cập nhật nhanh).
  - Khi cần chuyển đổi máy chủ, lập trình viên thường hạ TTL xuống 300 giây trước đó 1 ngày để đảm bảo việc chuyển đổi diễn ra tức thì.
- **DNS Propagation (Độ trễ phân giải toàn cầu)**: Quá trình phân tán các thay đổi DNS mới cập nhật tới toàn bộ các máy chủ DNS trên thế giới. Quá trình này có thể kéo dài từ vài phút đến tối đa 24 - 48 giờ tùy thuộc vào TTL.

---

### 2.5. Cơ Chế Hoạt Động Của Cloudflare: Proxy vs DNS Only

Khi bạn quản lý bản ghi tên miền trên Cloudflare, có 2 trạng thái hoạt động:

```text
[Trình duyệt Người Dùng] ──(HTTPS)──> [Hệ thống Edge Cloudflare] ──(Bảo mật)──> [Máy Chủ Của Bạn]
                                      (Đám mây cam: Proxied)
```

1. **Chế độ Bật Proxy (Đám mây cam - Proxied)**:
   - Toàn bộ lưu lượng truy cập từ người dùng sẽ đi qua hệ thống máy chủ biên (Edge) của Cloudflare trước khi đến máy chủ gốc của bạn.
   - **Lợi ích**:
     - Che giấu hoàn toàn địa chỉ IP gốc của máy chủ, triệt tiêu nguy cơ tấn công từ chối dịch vụ (DDoS).
     - Miễn phí chứng chỉ bảo mật SSL/TLS tự động gia hạn (ổ khóa xanh HTTPS).
     - Tăng tốc độ truy cập nhờ bộ nhớ đệm tệp tĩnh (Static Assets Caching: CSS, JS, ảnh).
   - **Hạn chế**: Chỉ hỗ trợ các giao thức Web (HTTP cổng 80, HTTPS cổng 443).
2. **Chế độ Tắt Proxy (Đám mây xám - DNS Only)**:
   - Cloudflare chỉ hoạt động như một máy chủ phân giải tên miền đơn thuần, trả về địa chỉ IP thực của máy chủ bạn.
   - **Bắt buộc dùng khi**: Dùng cho kết nối SSH terminal (cổng 22), SFTP (cổng 2022/2023), cơ sở dữ liệu (cổng 3306), hoặc game server.

---

## 3. PHÂN BIỆT TOÀN DIỆN CÁC MÔ HÌNH MÁY CHỦ VÀ HOSTING

| Tiêu chí so sánh | Shared Web Hosting | Container Hosting (Pterodactyl Panel) | VPS (Virtual Private Server) | Dedicated Server (Máy chủ vật lý) |
| :--- | :--- | :--- | :--- | :--- |
| **Công nghệ nền tảng** | Cài đặt chung trên 1 OS, quản lý qua cPanel, DirectAdmin | Cô lập trong từng Docker Container độc lập | Ảo hóa phần cứng (KVM / VMware) độc lập OS | 1 máy chủ vật lý riêng biệt 100% trong Data Center |
| **Quyền quản trị** | Không có quyền dòng lệnh (No Root / No SSH) | Quyền hạn chế trong thư mục `/home/container/`, không có quyền Root Linux | Toàn quyền quản trị Root cao nhất (`sudo su`) | Toàn quyền kiểm soát từ phần cứng, BIOS đến OS |
| **Địa chỉ IP** | Dùng chung 1 địa chỉ IP với hàng trăm website khác | Dùng chung IP của Node vật lý, cấp cổng mạng riêng biệt | Sở hữu 1 địa chỉ IPv4 tĩnh công cộng riêng biệt 100% | Sở hữu dải địa chỉ IP tĩnh công cộng riêng |
| **Cơ chế cổng mạng** | Chỉ mở cổng tiêu chuẩn 80, 443, FTP 21 | Cấp phát cổng ngẫu nhiên (`25146`, `25147`, `2023`) | Tự do mở bất kỳ cổng nào từ `0` đến `65535` | Tự do cấu hình toàn bộ 65,536 cổng |
| **Khả năng cài đặt** | Chỉ chạy được PHP / MySQL cơ bản | Chạy được Node.js, Python, Java trong môi trường định sẵn | Tự do cài đặt bất kỳ phần mềm nào (Docker, K8s, Nginx, Python, Z3) | Tự do cài đặt bất kỳ hệ điều hành hoặc hypervisor nào |
| **Nguy cơ lây nhiễm** | Cao (Một website trong server bị hack có thể ảnh hưởng cả server) | Thấp (Các container được cô lập tài nguyên độc lập) | Rất thấp (Ảo hóa nhân OS hoàn toàn độc lập) | Tuyệt đối an toàn (Cô lập vật lý hoàn toàn) |
| **Chi phí vận hành** | Rất thấp (30.000 - 100.000đ/tháng) | Thấp đến trung bình (50.000 - 200.000đ/tháng) | Trung bình (120.000 - 500.000đ/tháng) | Rất cao (2.000.000 - 10.000.000đ/tháng) |

---

## 4. CHIẾN LƯỢC TRIỂN KHAI VÀ XUẤT BẢN DỰ ÁN RA INTERNET

Tùy thuộc vào hạ tầng bạn sở hữu, có 2 kịch bản xuất bản chính:

### Kịch bản 1: Triển khai trên máy chủ VPS (Có IPv4 Public tĩnh)
1. Thuê máy chủ VPS (ví dụ Ubuntu 22.04 LTS).
2. Trỏ bản ghi **Record A** từ tên miền chính `your-domain.id.vn` $\rightarrow$ IP của VPS.
3. Cài đặt **Nginx Reverse Proxy** và công cụ cấp chứng chỉ SSL miễn phí tự động **Certbot**:
   - Nginx nhận yêu cầu ở cổng 443 HTTPS.
   - Nginx chuyển tiếp (proxy_pass) vào cổng Backend `http://127.0.0.1:8000` hoặc cổng Frontend `http://127.0.0.1:5173`.

### Kịch bản 2: Triển khai trên Container Hosting (Pterodactyl) hoặc Mạng Gia Đình (Bị CGNAT)
1. Không sở hữu IP Public tĩnh riêng, các cổng được cấp phát động (`25146`, `25147`).
2. Sử dụng công nghệ **Cloudflare Zero Trust Tunnel (`cloudflared`)**:
   - Tiến trình `cloudflared` chạy ngầm bên trong container hoặc máy tính cá nhân.
   - Thiết lập một đường hầm mã hóa TLS kết nối ra máy chủ biên gần nhất của Cloudflare (trạm Singapore `sin19`).
   - Trên bảng điều khiển Cloudflare, ánh xạ tên miền `app.your-domain.id.vn` trực tiếp về cổng nội bộ `localhost:{{SERVER_PORT}}`.
   - **Ưu điểm vượt trội**: Bỏ qua hoàn toàn rào cản CGNAT, không cần mở cổng modem, không cần IP tĩnh, tự động có chứng chỉ HTTPS bảo mật toàn cầu.
