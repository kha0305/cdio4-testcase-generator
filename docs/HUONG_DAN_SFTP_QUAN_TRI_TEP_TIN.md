# HƯỚNG DẪN KẾT NỐI VÀ QUẢN TRỊ TỆP TIN QUA GIAO THỨC BẢO MẬT SFTP

Tài liệu này hướng dẫn cách lấy thông tin chuẩn xác và kết nối truyền tải tệp tin an toàn qua giao thức **SFTP (SSH File Transfer Protocol)** giữa máy tính cá nhân và máy chủ Pterodactyl Hosting (áp dụng cho các nền tảng hosting container như Pikamc Panel).

---

## 1. THÔNG SỐ KẾT NỐI SFTP MẪU TRÊN MÁY CHỦ PTERODACTYL

Khi bạn nhấp vào nút **Cơ sở SFTP** tại mục **Tệp tin** trên bảng điều khiển máy chủ, bạn sẽ nhận được các thông số kết nối có cấu trúc như sau:

| Thông số | Giá trị mẫu (Ví dụ minh họa) | Ý nghĩa thực tế |
| :--- | :--- | :--- |
| **Giao thức** | `SFTP` | SSH File Transfer Protocol (chuyên truyền nhận tệp an toàn) |
| **Máy chủ (Host)** | `node01.pikamc.vn` | Địa chỉ máy chủ node vật lý nơi container của bạn đang chạy |
| **Cổng (Port)** | `2023` (hoặc `2022`) | Cổng SFTP riêng của node do Pterodactyl quản lý |
| **Tên người dùng** | `user_demo.srv1234` | Tên tài khoản web kết hợp mã định danh máy chủ |
| **Mật khẩu** | Mật khẩu tài khoản hosting | Mật khẩu bạn dùng để đăng nhập vào bảng điều khiển web |
| **Đường dẫn từ xa** | `/home/container` | Thư mục làm việc gốc chứa mã nguồn của bạn |

> **Cách lấy thông số chính xác trên bảng điều khiển của bạn**:
> 1. Truy cập vào bảng điều khiển máy chủ $\rightarrow$ Chọn mục **Tệp tin** (Files).
> 2. Nhìn lên góc trên bên phải, bấm vào nút **Cơ sở SFTP** (hoặc biểu tượng ổ khóa/chìa khóa).
> 3. Hộp thoại nổi sẽ hiển thị chính xác tên máy chủ node, cổng SFTP và tên người dùng tài khoản của riêng bạn.

---

## 2. PHÂN BIỆT RÕ RÀNG: SFTP KHÁC GÌ VỚI SSH TERMINAL?

### Tại sao lệnh dòng lệnh `ssh -t user@host...` thường thất bại?
1. **Bản chất kiến trúc Pterodactyl Wings**:
   - Máy chủ Pterodactyl chỉ mở cổng SFTP (như `2023` hoặc `2022`) riêng cho phân hệ truyền tải tệp tin **SFTP Subsystem**.
   - Cổng này **KHÔNG cấp Shell tương tác Linux** (chặn phiên đăng nhập tương tác Bash hay SSH Terminal để bảo đảm an toàn đa người dùng).
   - Vì vậy, bạn **không thể** mở cửa sổ terminal Linux thông qua cổng SFTP này từ máy tính cá nhân.
2. **Nơi thực thi câu lệnh dòng lệnh chuẩn xác**:
   - Mọi câu lệnh chạy ứng dụng, cài đặt thư viện (`npm install`, `pip install`), khởi động daemon hoặc kiểm tra log phải được nhập trực tiếp tại mục **Bảng Điều Khiển (Console)** trên giao diện web của hosting.
   - Kết nối SFTP từ máy tính cá nhân (Antigravity IDE / VS Code / WinSCP / FileZilla) chỉ dùng để **đọc, ghi và đồng bộ tệp tin code**.

---

## 3. TỰ ĐỘNG ĐỒNG BỘ TRỰC TIẾP TỪ ANTIGRAVITY IDE / VS CODE

Bạn có thể chỉnh sửa code trên máy tính và tự động đẩy lên server ngay khi bấm `Ctrl + S`:

### 3.1. Cài đặt tiện ích mở rộng
1. Mở tab **Extensions** trên thanh công cụ bên trái (hoặc nhấn `Ctrl + Shift + X`).
2. Gõ tìm kiếm: `SFTP`.
3. Bấm **Install** tại dòng: **`SFTP Neo`** (tác giả *Philip Daoud*).
   *(Lưu ý: Antigravity IDE sử dụng kho Open VSX Marketplace, `SFTP Neo` là bản kế thừa ổn định nhất tương thích 100% với định dạng cấu hình chuẩn).*

### 3.2. Cấu hình tệp `.vscode/sftp.json` mẫu
Tạo hoặc mở tệp `.vscode/sftp.json` trong thư mục dự án của bạn:
```json
{
  "name": "Pikamc Pterodactyl Node (Vi Du)",
  "host": "node01.pikamc.vn",
  "protocol": "sftp",
  "port": 2023,
  "username": "user_demo.srv1234",
  "remotePath": "/home/container",
  "uploadOnSave": true,
  "useTempFile": false,
  "openSsh": false,
  "ignore": [
    "\\.vscode",
    "\\.git",
    "node_modules",
    "backend/venv",
    "venv",
    ".venv",
    "__pycache__",
    "*.db",
    "*.log",
    "dist"
  ]
}
```
*(Hãy thay `node01.pikamc.vn`, `port` và `username` bằng thông tin hiển thị trong hộp thoại SFTP thực tế của bạn).*

### 3.3. Thao tác đồng bộ tệp
1. **Lần đầu kết nối**:
   - Nhấn `Ctrl + Shift + P` $\rightarrow$ Gõ: `SFTP: Sync Local -> Remote` (Đồng bộ code từ máy tính lên server).
   - Hoặc gõ: `SFTP: Download Remote -> Local` (Tải code hiện có trên server về máy tính).
   - Tiện ích sẽ hiện một ô nhập ở đỉnh màn hình: **Enter password** $\rightarrow$ Nhập mật khẩu tài khoản bảng điều khiển hosting của bạn.
2. **Khi làm việc hàng ngày**:
   - Mỗi khi bạn mở file sửa và bấm `Ctrl + S`, tiện ích sẽ tự động đẩy ngay file đó lên `/home/container/` trên máy chủ trong chưa đầy 1 giây.

---

## 4. KẾT NỐI QUA PHẦN MỀM FILEZILLA / WINSCP (NẾU CẦN TRỰC QUAN)

Nếu bạn muốn có một cửa sổ kéo thả tệp tin trực quan:

### 4.1. Cấu hình trên FileZilla Client
1. Mở FileZilla $\rightarrow$ **File** $\rightarrow$ **Site Manager** $\rightarrow$ **New site**.
2. **Protocol**: Chọn `SFTP - SSH File Transfer Protocol`.
3. **Host**: Nhập máy chủ của bạn (ví dụ: `node01.pikamc.vn`).
4. **Port**: Nhập `2023` (hoặc cổng được cấp).
5. **Logon Type**: Chọn `Normal` (hoặc `Ask for password`).
6. **User**: Nhập tên tài khoản SFTP (ví dụ: `user_demo.srv1234`).
7. **Password**: Nhập mật khẩu bảng điều khiển của bạn.
8. Bấm **Connect**.

### 4.2. Cấu hình trên WinSCP
1. **File protocol**: `SFTP`.
2. **Host name**: Nhập máy chủ node (ví dụ: `node01.pikamc.vn`).
3. **Port number**: `2023`.
4. **User name**: Nhập tên tài khoản SFTP (ví dụ: `user_demo.srv1234`).
5. **Password**: Mật khẩu tài khoản hosting của bạn.
6. Bấm **Login**.

---

## 5. CÁC QUY TẮC AN TOÀN TRÁNH TREO HOSTING (BEST PRACTICES)

1. **Tuyệt đối không upload thư mục thư viện rác**:
   - Danh sách loại trừ đã được cấu hình trong `ignore`:
     - `node_modules/`: Thường có hơn 30.000 file nhỏ, upload qua SFTP sẽ làm nghẽn đường truyền và treo node. Hãy chỉ upload `package.json`, sau đó vào web console gõ `npm install`.
     - `backend/venv/` hoặc `venv/`: Môi trường ảo Python trên Windows không thể chạy trên container Linux. Hãy chỉ upload `backend/requirements.txt`, sau đó cài đặt trên server.
     - `.git/`: Kho lịch sử Git không cần thiết đưa lên server vận hành.
     - `*.db`: Tránh ghi đè cơ sở dữ liệu đang có dữ liệu thực tế trên máy chủ.
2. **Quyền tệp tin trên máy chủ Linux**:
   - Thư mục thông thường: quyền `755`.
   - Tệp mã nguồn: quyền `644`.
   - Tệp kịch bản thực thi (`start.sh`): quyền `755` (`chmod +x start.sh`).
3. **Sao lưu trước khi ghi đè (Backup First)**:
   - Trước khi upload phiên bản code mới, vào mục **Quản lý** $\rightarrow$ **Sao Lưu (Backups)** trên bảng điều khiển để tạo 1 bản snapshot dự phòng đề phòng sự cố.
