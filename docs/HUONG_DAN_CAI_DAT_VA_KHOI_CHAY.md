# HƯỚNG DẪN CÀI ĐẶT MÔI TRƯỜNG & KHỞI CHẠY DỰ ÁN TỪ ĐẦU (SETUP GUIDE TỪ A - Z)

Tài liệu này hướng dẫn chi tiết từng bước thiết lập môi trường phát triển, cài đặt các gói phụ thuộc và khởi chạy hệ thống tự động sinh Test Case (CDIO-4) trên máy tính cá nhân (hỗ trợ Windows, macOS và Linux).

---

## 1. YÊU CẦU MÔI TRƯỜNG TIÊN QUYẾT (PREREQUISITES)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

1. **Node.js**: Phiên bản `18.x` hoặc `20.x LTS` trở lên (bao gồm trình quản lý gói `npm`).
   - Kiểm tra bằng lệnh: `node -v` và `npm -v`.
   - Nếu chưa có: Tải tại [nodejs.org](https://nodejs.org/).
2. **Python**: Phiên bản `3.10`, `3.11` hoặc `3.12` (bao gồm `pip`).
   - Kiểm tra bằng lệnh: `python --version` và `pip --version`.
   - Lưu ý trên Windows: Khi cài Python, phải tích chọn ô **"Add Python to PATH"**.
3. **Git**: Phiên bản 2.30+ để quản lý mã nguồn.
   - Kiểm tra bằng lệnh: `git --version`.

---

## 2. QUY TRÌNH CÀI ĐẶT 4 BƯỚC TỪ ĐẦU

### Bước 1: Mở Terminal tại thư mục dự án
Mở Terminal / PowerShell và điều hướng tới thư mục chứa mã nguồn:
```bash
cd D:\Do-an\CDIO-4\code
```

### Bước 2: Cài đặt các gói phụ thuộc Backend (Python FastAPI)
Cài đặt danh sách thư viện tính toán logic, giải ràng buộc Z3 Solver, SQLAlchemy ORM và thuật toán kiểm thử:
```bash
pip install -r backend/requirements.txt
```
*(Nếu dùng môi trường ảo venv, bạn có thể tạo qua: `python -m venv venv` và kích hoạt trước khi cài đặt).*

### Bước 3: Cài đặt các gói phụ thuộc Frontend (React + Vite)
Điều hướng vào thư mục frontend và cài đặt các thư viện giao diện:
```bash
cd frontend
npm install
cd ..
```

### Bước 4: Khởi tạo và nạp dữ liệu mẫu vào Cơ Sở Dữ Liệu
Chạy kịch bản migration để tạo bảng SQLite `app.db` và nạp sẵn dự án mẫu E-Commerce cùng các tài khoản QA Lead:
```bash
python migrate_db.py
```

---

## 3. CÁCH KHỞI CHẠY HỆ THỐNG

### Cách 1: Khởi chạy 1 lệnh duy nhất tại thư mục gốc (Khuyến nghị)
Hệ thống đã tích hợp sẵn bộ điều phối đa tiến trình Node.js thuần túy `dev.js`. Bạn chỉ cần đứng tại thư mục gốc `code/` và gõ:

```bash
npm run dev
```
*(hoặc `npm start`)*

Hệ thống sẽ đồng thời khởi chạy:
- **Backend API (FastAPI)**: `http://127.0.0.1:8000` (Tài liệu Swagger: `http://127.0.0.1:8000/docs`)
- **Frontend UI (Vite React)**: `http://localhost:5173`

> **Khi muốn dừng**: Nhấn tổ hợp phím **`Ctrl + C`** 1 lần trong terminal để dọn dẹp sạch cả 2 tiến trình.

---

### Cách 2: Khởi chạy nhanh 1-Click trên Windows
Nhấp đúp chuột trực tiếp vào tệp:
```text
chay_he_thong.bat
```
Cửa sổ dòng lệnh sẽ tự động khởi chạy và giữ trạng thái hoạt động của cả Backend và Frontend.

---

### Cách 3: Khởi chạy độc lập từng phân hệ (Terminal riêng)
Nếu bạn muốn theo dõi chi tiết log riêng của từng phân hệ:
- **Cửa sổ 1 (Backend)**:
  ```bash
  python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
  ```
- **Cửa sổ 2 (Frontend)**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 4. TÀI KHOẢN ĐĂNG NHẬP KIỂM THỬ MẶC ĐỊNH

Hệ thống đã nạp sẵn 2 tài khoản mẫu đã mã hóa mật khẩu bcrypt chuẩn bảo mật:

| Tài khoản | Tên người dùng | Mật khẩu mặc định | Vai trò trong dự án |
| :--- | :--- | :--- | :--- |
| **Trưởng nhóm QA (Leader)** | `qalead` | `123456` | Toàn quyền quản trị dự án, duyệt Sprint, phân công nhiệm vụ |
| **Kiểm thử viên (Tester)** | `tester01` | `123456` | Thực thi kiểm thử, ghi nhận kết quả Pass/Fail |

> **Đăng ký tài khoản mới**: Bạn cũng có thể nhấp vào nút **Đăng Nhập** $\rightarrow$ chọn **Đăng Ký Tài Khoản Mới** để tạo tài khoản riêng với quyền bình đẳng. Khi tạo dự án mới, bạn sẽ tự động là Leader của dự án đó.

---

## 5. KIỂM THỬ CHẤT LƯỢNG HỆ THỐNG

### 5.1. Chạy bộ kiểm thử tích hợp 18 bước tự động
Kiểm tra toàn bộ luồng Auth, RBAC, CRUD Sprint, Sinh Test Case và Xuất báo cáo Excel/CSV/JSON:
```bash
npm test
```
*(hoặc `python run_system_test.py`)*

### 5.2. Biên dịch Production Frontend
Kiểm tra tính toàn vẹn mã nguồn giao diện:
```bash
npm run build
```
Bản build xuất ra thư mục `frontend/dist/` sẵn sàng phục vụ trên Nginx hoặc máy chủ sản xuất.
