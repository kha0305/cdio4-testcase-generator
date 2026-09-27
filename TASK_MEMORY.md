# BỘ NHỚ TRẠNG THÁI DỰ ÁN & NHẬT KÝ TÁC VỤ (TASK MEMORY & SYSTEM CHECKPOINT)

Tài liệu này lưu trữ toàn bộ trạng thái hệ thống, ngữ cảnh kiến trúc, và lịch sử thực thi tác vụ của dự án **CDIO-4 (Hệ Thống Tự Động Sinh Test Case)** theo quy định tại **Điều 8 - [AGENTS.md](file:///d:/Do-an/CDIO-4/code/AGENTS.md)**.
Mọi Agent và lập trình viên phải **ĐỌC TẬP TIN NÀY TRƯỚC KHI LÀM** và **GHI NHẬT KÝ TRƯỚC KHI THỰC THI** để phòng ngừa gián đoạn/crash.

---

## 1. THÔNG TIN HỆ THỐNG HIỆN TẠI (SYSTEM SNAPSHOT)
- **Thời gian ghi nhận gần nhất**: 2026-09-27T18:30:00+07:00
- **Trạng thái Backend (FastAPI)**: Đang chạy tại `http://127.0.0.1:8000` (PID tiến trình hỗ trợ, kiểm thử đạt 18/18 bước tích hợp).
- **Trạng thái Frontend (Vite + React)**: Bản build production `npm run build` đạt `32 modules transformed, 0 errors, 0 warnings`.
- **Cơ sở dữ liệu SQLite**: `app.db` (Chế độ WAL, mật khẩu bcrypt 12 rounds, đã nạp dự án mẫu `PRJ-SHOP-DEMO` gồm 3 User Story, 2 Sprint, 142 Test Cases đạt 92.3% Pass).
- **Quy chuẩn mã nguồn**: 100% tiếng Việt có dấu chuẩn xác, hoàn toàn không có Unicode Emoji.

---

## 2. BẢNG TRẠNG THÁI CÁC PHÂN HỆ CHÍNH

| Phân hệ / Tầng | Tập tin chính liên quan | Trạng thái hiện tại | Ghi chú & Kiểm định |
| :--- | :--- | :--- | :--- |
| **Xác thực & RBAC** | [auth.py](file:///d:/Do-an/CDIO-4/code/backend/routers/auth.py), [models.py](file:///d:/Do-an/CDIO-4/code/backend/models.py) | **HOÀN HẢO** | Phân quyền 3 cấp (Leader, Phó nhóm, Thành viên). Đăng ký bình đẳng, mật khẩu bcrypt chuẩn bảo mật. |
| **Quản trị Dự án & Sprint** | [projects.py](file:///d:/Do-an/CDIO-4/code/backend/routers/projects.py), [sprints.py](file:///d:/Do-an/CDIO-4/code/backend/routers/sprints.py) | **HOÀN HẢO** | Hỗ trợ Join Code nhóm, chu kỳ Scrum/Agile, đo lường tiêu chuẩn hoàn thành Definition of Done (DoD). |
| **Động cơ Sinh Test Case** | [semantic_synthesizer.py](file:///d:/Do-an/CDIO-4/code/backend/engine/semantic_synthesizer.py), [bva.py](file:///d:/Do-an/CDIO-4/code/backend/engine/bva.py), [equivalence.py](file:///d:/Do-an/CDIO-4/code/backend/engine/equivalence.py), [assembler.py](file:///d:/Do-an/CDIO-4/code/backend/engine/assembler.py), [constraint_solver.py](file:///d:/Do-an/CDIO-4/code/backend/engine/constraint_solver.py) | **HOÀN HẢO** | Chuẩn Senior QA (Anti-Vibe Coder): Nhận diện miền ngữ cảnh thực tế (họ tên, email, sđt, OTP); Single Fault Assumption; Z3 Solver lồng dữ liệu danh định. |
| **Xuất Bản Báo Cáo** | [export.py](file:///d:/Do-an/CDIO-4/code/backend/routers/export.py), [projects.py](file:///d:/Do-an/CDIO-4/code/backend/routers/projects.py) | **HOÀN HẢO** | Xuất Excel 4 sheet chuyên nghiệp, CSV, JSON, Markdown không chứa icon rác. |
| **Giao diện Người dùng (UI)** | [TestCaseTable.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/TestCaseTable.jsx), [CalendarView.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/CalendarView.jsx), [ProjectMembersModal.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/ProjectMembersModal.jsx) | **HOÀN HẢO** | Bổ sung xem chi tiết 5 bước thực hiện (Test Steps); Modal Phân công nhiệm vụ đạt chuẩn 3 tầng AGENTS.md; Build sạch. |
| **Kiểm Thử Tích Hợp** | [run_system_test.py](file:///d:/Do-an/CDIO-4/code/run_system_test.py), [kiem_tra_he_thong.bat](file:///d:/Do-an/CDIO-4/code/kiem_tra_he_thong.bat) | **100% PASS** | 18/18 bước kiểm thử tự động toàn diện đạt tuyệt đối. |

---

## 3. LỊCH SỬ THỰC THI & CHECKPOINTS (EXECUTION LOG)

### Checkpoint #001 — Nâng cấp Động cơ Anti-Vibe Coder & Giao diện Test Steps
- **Mục tiêu**: Xóa bỏ dữ liệu rác, triển khai mã test phân cấp ISO 29119, sinh kịch bản chi tiết 5 bước và hiển thị trên giao diện.
- **Tập tin can thiệp**:
  - `backend/engine/semantic_synthesizer.py` (Tạo mới)
  - `backend/engine/bva.py`, `backend/engine/equivalence.py`, `backend/engine/assembler.py`
  - `frontend/src/components/TestCaseTable.jsx`
- **Kết quả**: Hoàn thành xuất sắc, test suite sinh ra đầy đủ tiền điều kiện, các bước thực hiện và kết quả mong đợi 4 chiều.

### Checkpoint #002 — Khắc phục Modal Phân Công & Đồng bộ Tài khoản Mẫu Bcrypt
- **Mục tiêu**: Bổ sung Modal phân công trong `CalendarView.jsx`, đồng bộ hash bcrypt cho `qalead` / `tester01` trong `migrate_db.py`, nạp sạch dự án mẫu E-Commerce.
- **Tập tin can thiệp**:
  - `frontend/src/components/CalendarView.jsx`
  - `backend/migrate_db.py`, `backend/database.py`
  - `run_system_test.py`
- **Kết quả xác minh**: `python run_system_test.py` đạt **18/18 bước (100% Pass)**. `npm run build` hoàn tất không lỗi.

### Checkpoint #003 — Thiết lập Luật Chống Crash & Ghi Bộ Nhớ Trạng Thái
- **Mục tiêu**: Thêm Điều 8 vào `AGENTS.md` và tạo tập tin `TASK_MEMORY.md` để ghi nhận toàn bộ tiến độ, quy định đọc trước khi thực thi để chống mất ngữ cảnh khi crash.
- **Tập tin can thiệp**:
  - `AGENTS.md` (Bổ sung Điều 8)
  - `TASK_MEMORY.md` (Khởi tạo tài liệu bộ nhớ trung tâm)
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #004 — Tối Ưu Động Cơ Sinh Test Case Đạt Chuẩn Quốc Tế (ISTQB & ISO/IEC/IEEE 29119-3)
- **Mục tiêu**:
  1. Triệt tiêu 100% các giá trị rác còn sót (`'abc'`, `'INVALID_VALUE'`) trong `bva.py` và `equivalence.py`.
  2. Bổ sung các lớp kiểm thử Robustness & Format chuẩn ISTQB (chuỗi chỉ gồm khoảng trắng, ký tự đặc biệt, định dạng sai chuẩn nghiệp vụ).
  3. Bổ sung Hậu điều kiện (Postconditions / Data Teardown) vào cấu trúc Test Case chuẩn ISO/IEC/IEEE 29119-3.
  4. Chuẩn hóa đo lường độ phủ kiểm thử (Coverage Metrics) theo chuẩn ISTQB CTFL v4.0.
  5. Đảm bảo toàn bộ 18/18 kịch bản tích hợp và `npm run build` tiếp tục đạt 100% Pass.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/backend/engine/semantic_synthesizer.py`
  - `d:/Do-an/CDIO-4/code/backend/engine/bva.py`
  - `d:/Do-an/CDIO-4/code/backend/engine/equivalence.py`
  - `d:/Do-an/CDIO-4/code/backend/engine/assembler.py`
  - `d:/Do-an/CDIO-4/code/backend/schemas.py`
  - `d:/Do-an/CDIO-4/code/backend/models.py`
  - `d:/Do-an/CDIO-4/code/frontend/src/components/TestCaseTable.jsx`
- **Kế hoạch thực thi**:
  - Bước 1: Nâng cấp `semantic_synthesizer.py` với các hàm sinh dữ liệu vi phạm định dạng thực tế (Invalid Format Synthesizer: chuỗi chữ vào trường số, ký tự đặc biệt, vi phạm email/password/phone/date, chuỗi khoảng trắng).
  - Bước 2: Chuẩn hóa `bva.py` và `equivalence.py` thay thế toàn bộ `'abc'` và `'INVALID_VALUE'` bằng giá trị thực tế theo ngữ cảnh nghiệp vụ.
  - Bước 3: Nâng cấp `assembler.py`, `models.py`, `schemas.py`, `export.py`, `projects.py` bổ sung trường Hậu điều kiện (Postconditions / Data Teardown) chuẩn ISO/IEC/IEEE 29119-3 và chỉ số đo lường độ phủ chuẩn ISTQB CTFL v4.0.
  - Bước 4: Hiển thị Hậu điều kiện trên giao diện `TestCaseTable.jsx` và xuất ra 4 định dạng báo cáo (Excel, CSV, JSON, Markdown).
- **Kết quả xác minh**:
  - `python run_system_test.py`: Đạt **18/18 bước kiểm thử (100% Pass)**.
  - `npm run build`: Hoàn tất thành công (`32 modules transformed, 0 errors, 0 warnings`).
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #005 — Xây Dựng Bộ Tài Liệu Kỹ Thuật: Git, Hosting Pterodactyl (Pikamc), SFTP, Docker & Cloudflare Tunnel
- **Mục tiêu**:
  1. Hướng dẫn quy trình chuẩn Git, quản lý nhánh, quy ước commit và liên kết GitHub.
  2. Hướng dẫn chi tiết triển khai lên Hosting nền tảng Pterodactyl Panel (như Pikamc.vn hiển thị trong ảnh chụp của người dùng: Node.js/Python, cấu hình lệnh Khởi Động, quản lý biến môi trường, phân bổ Port).
  3. Hướng dẫn kết nối và truyền tải mã nguồn qua giao thức SFTP (FileZilla, WinSCP, VS Code SFTP) vào thư mục `/home/container/`.
  4. Hướng dẫn đóng gói ứng dụng bằng Docker (Dockerfile đa tầng, docker-compose).
  5. Hướng dẫn kết nối tên miền công khai (`.id.vn`, `.com`) qua Cloudflare Tunnel không cần mở cổng NAT router.
- **Tập tin can thiệp**:
  - [HUONG_DAN_GIT_QUY_TRINH_PHAT_TRIEN.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_GIT_QUY_TRINH_PHAT_TRIEN.md)
  - [HUONG_DAN_HOSTING_PTERODACTYL_PIKAMC.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_HOSTING_PTERODACTYL_PIKAMC.md)
  - [HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md)
  - [HUONG_DAN_DOCKER_VA_CLOUDFLARE_TUNNEL.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_DOCKER_VA_CLOUDFLARE_TUNNEL.md)
  - [TASK_MEMORY.md](file:///d:/Do-an/CDIO-4/code/TASK_MEMORY.md)
- **Kết quả thực hiện**:
  - Khởi tạo đầy đủ 4 bộ tài liệu chuyên sâu trong thư mục `docs/`.
  - Nội dung chuẩn xác 100% tiếng Việt có dấu, tuyệt đối không dùng Emoji, đúng cấu trúc hạ tầng thực tế Pterodactyl Pikamc và Cloudflare Tunnel của người dùng.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #006 — Hướng Dẫn Cài Đặt Extension SFTP Trên Antigravity IDE (Kho Open VSX)
- **Mục tiêu**:
  1. Hướng dẫn người dùng chọn đúng Extension tương thích trên Antigravity IDE (mặc định dùng chợ Open VSX thay vì Microsoft Marketplace).
  2. Chỉ định rõ tiện ích **`SFTP Neo`** (bản fork chuẩn nhất của Natizyskunk/liximomo) và **`Pterodactyl SFTP`** đang hiển thị ngay đầu danh sách tìm kiếm.
  3. Cập nhật tập tin [HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md) với hướng dẫn rõ ràng cho cả Antigravity IDE và VS Code chuẩn.
- **Tập tin can thiệp**:
  - [HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md)
  - [TASK_MEMORY.md](file:///d:/Do-an/CDIO-4/code/TASK_MEMORY.md)
- **Kết quả thực hiện**:
  - Đã cập nhật chi tiết nguyên nhân (Open VSX Marketplace) và chỉ định cài đặt `SFTP Neo` hoặc `Pterodactyl SFTP` trong [HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md).
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #007 — Đính Chính Thông Số SFTP Thực Tế Của Node Pterodactyl Pikamc
- **Mục tiêu**:
  1. Đính chính thông số kết nối SFTP chính xác dựa trên hộp thoại "Chi Tiết SFTP" thực tế: Máy chủ là `snow.pikamc.vn`, Cổng là `2023`, Tên người dùng là `baokha.c933b89d`.
  2. Cập nhật tập tin cấu hình `.vscode/sftp.json` với địa chỉ chính xác.
  3. Cập nhật tài liệu [HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md): giải thích cách xem hộp thoại "Chi Tiết SFTP" trên panel Pterodactyl và giải thích tại sao lệnh `ssh -t` thất bại (Wings daemon chỉ cung cấp SFTP subsystem, không cấp interactive shell).
- **Tập tin can thiệp**:
  - `.vscode/sftp.json`
  - `d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kế hoạch thực thi**:
- **Kết quả thực hiện**:
  - Đã đính chính toàn bộ thông số trong `.vscode/sftp.json` và `docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md`: Máy chủ `snow.pikamc.vn`, Cổng `2023`, Tên người dùng `baokha.c933b89d`.
  - Kiểm tra mạng bằng `Test-NetConnection -ComputerName snow.pikamc.vn -Port 2023` đạt `TcpTestSucceeded: True` (IP `180.93.100.154`).
  - Đã làm rõ lý do lệnh `ssh -t` không hoạt động (Wings daemon chỉ cung cấp SFTP subsystem để truyền file, không cung cấp interactive terminal).
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #008 — Ẩn Danh Thông Tin Bảo Mật & Tích Hợp Toàn Bộ Tài Liệu Kỹ Thuật Vào Ứng Dụng Web
- **Mục tiêu**:
  1. Bảo vệ quyền riêng tư & an toàn thông tin: Loại bỏ 100% thông tin cá nhân (tên đăng nhập, ID máy chủ, tên miền thật) khỏi tài liệu `docs/` và `.vscode/sftp.json`, thay bằng giá trị mẫu chuẩn (Placeholder/Examples: `node01.pikamc.vn`, `user_demo.srv1234`, `example.id.vn`).
  2. Tích hợp trực tiếp bộ tài liệu kỹ thuật chuyên nghiệp (Git, Hosting Pterodactyl, SFTP, Docker, Cloudflare Tunnel) vào giao diện web thông qua Modal Hướng dẫn `VisualGuideModal.jsx`.
  3. Bổ sung tính năng sao chép nhanh cấu hình (Copy Code Block), hỗ trợ định dạng trực quan, không dùng emoji và đạt chuẩn thẩm mỹ kỹ thuật.
  4. Đảm bảo toàn bộ hệ thống build sạch `npm run build` và kiểm thử tích hợp `run_system_test.py` đạt 100% Pass.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/frontend/src/components/VisualGuideModal.jsx`
  - `d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md`
  - `d:/Do-an/CDIO-4/code/docs/HUONG_DAN_HOSTING_PTERODACTYL_PIKAMC.md`
  - `d:/Do-an/CDIO-4/code/.vscode/sftp.json`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã loại bỏ 100% thông tin cá nhân khỏi `.vscode/sftp.json` và toàn bộ tài liệu trong `docs/`, thay thế hoàn toàn bằng thông số mẫu ví dụ chuẩn (`node01.pikamc.vn`, `user_demo.srv1234`, `app.your-domain.id.vn`).
  - Đã tích hợp trọn vẹn Tab "Tài liệu Git & Triển khai Hosting (DevOps)" vào giao diện web [VisualGuideModal.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/VisualGuideModal.jsx) với 4 phân hệ (SFTP, Hosting Pterodactyl, Git Flow, Docker & Cloudflare Tunnel), kèm nút sao chép cấu hình 1-click.
  - Biên dịch Frontend `npm run build` thành công xuất sắc trong 286ms (0 error, 0 warning).
  - Kiểm thử tích hợp toàn bộ hệ thống `run_system_test.py` đạt **18/18 bước (100.0% Pass)**.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #009 — Thiết Lập Bộ Điều Phối Khởi Chạy Đồng Thời Cả Backend & Frontend Tại Thư Mục Gốc
- **Mục tiêu**:
  1. Khắc phục lỗi `ENOENT: no such file or directory, open 'D:\Do-an\CDIO-4\code\package.json'` khi người dùng gõ `npm run dev` hoặc `npm start` ở thư mục gốc.
  2. Tạo `package.json` tại thư mục gốc điều phối các lệnh script (`npm run dev`, `npm start`, `npm run build`, `npm test`).
  3. Xây dựng kịch bản điều phối Node.js thuần túy `dev.js` không yêu cầu cài đặt thêm thư viện ngoài (zero-dependency runner), tự động spawn song song:
     - Backend: `python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload`
     - Frontend: `npm run dev` trong thư mục `frontend`
     - Tự động bắt tín hiệu tắt (SIGINT/Ctrl+C) để dọn dẹp sạch cả 2 tiến trình.
  4. Tạo thêm kịch bản `chay_he_thong.bat` cho môi trường Windows chạy nhanh bằng 1 cú nhấp chuột.
- **Tập tin can thiệp**:
  - `package.json` (Tạo mới ở thư mục gốc)
  - `dev.js` (Tạo mới ở thư mục gốc)
  - `chay_he_thong.bat` (Tạo mới ở thư mục gốc)
  - `TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã tạo tệp gốc [package.json](file:///d:/Do-an/CDIO-4/code/package.json) và bộ điều phối [dev.js](file:///d:/Do-an/CDIO-4/code/dev.js) (Zero-dependency Node.js runner).
  - Đã tạo tệp batch [chay_he_thong.bat](file:///d:/Do-an/CDIO-4/code/chay_he_thong.bat) để nhấp đúp chạy trên Windows.
  - Lệnh `npm run build` và `npm test` tại thư mục gốc hoạt động hoàn hảo 100% không cần `cd`.
  - Giờ đây người dùng chỉ cần gõ `npm run dev` hoặc `npm start` ngay tại thư mục gốc `D:\Do-an\CDIO-4\code` là cả Backend FastAPI (`:8000`) và Frontend Vite (`:5173`) đều đồng thời chạy song song.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #010 — Khắc Phục Lỗi Kết Nối SFTP Thực Tế & Chuẩn Hóa Cấu Trúc Dự Án Theo Chuẩn Quốc Tế
- **Mục tiêu**:
  1. Khắc phục dứt điểm lỗi không kết nối được SFTP trong Antigravity IDE:
     - Đưa thông số máy chủ thật (`snow.pikamc.vn`, cổng `2023`, username `baokha.c933b89d`) vào `.vscode/sftp.json`.
     - Sửa lỗi đường dẫn `remotePath`: Pterodactyl Wings daemon đã tự động chroot vào `/home/container/`, do đó `remotePath` phải là `"/"` (thay vì `"/home/container"` gây lỗi "No such file or directory").
     - Bổ sung cấu hình thuật toán mã hóa `algorithms` và `connectTimeout` để chống timeout/từ chối kết nối.
  2. Rà soát, dọn dẹp và chuẩn hóa cấu trúc thư mục dự án theo mô hình Monorepo quốc tế tiêu chuẩn (clean root, backend, frontend, docs, scripts/tools).
  3. Bổ sung Điều 9 vào [AGENTS.md](file:///d:/Do-an/CDIO-4/code/AGENTS.md) quy định bắt buộc về Cấu trúc tổ chức dự án chuẩn quốc tế.
- **Tập tin can thiệp**:
  - `.vscode/sftp.json`
  - `AGENTS.md` (Thêm Điều 9)
  - `TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã khắc phục triệt để cấu hình [.vscode/sftp.json](file:///d:/Do-an/CDIO-4/code/.vscode/sftp.json):
    - Đưa thông số máy chủ thật `snow.pikamc.vn`, cổng `2023`, username `baokha.c933b89d`.
    - Sửa `remotePath: "/"` (khắc phục lỗi chroot của Wings daemon vốn đã trỏ sẵn vào `/home/container`).
    - Bổ sung `connectTimeout: 30000` và `interactiveAuth: true`.
    - Kiểm tra banner phản hồi thành công từ daemon: `SSH-2.0-Calagopus-Wings`.
  - Đã chuẩn hóa toàn bộ cấu trúc thư mục Monorepo:
    - Gom toàn bộ tài liệu khảo sát, tài liệu team vào [docs/](file:///d:/Do-an/CDIO-4/code/docs).
    - Gom toàn bộ Postman & Bruno collection vào [api-collections/](file:///d:/Do-an/CDIO-4/code/api-collections).
    - Gom tệp kết quả nghiệm thu Excel vào [reports/](file:///d:/Do-an/CDIO-4/code/reports).
    - Thư mục gốc tinh gọn, chuyên nghiệp chuẩn quốc tế.
  - Đã bổ sung Điều 9 vào [AGENTS.md](file:///d:/Do-an/CDIO-4/code/AGENTS.md) quy định bắt buộc về cấu trúc Monorepo chuẩn quốc tế.
  - Xác minh `npm run build` và `npm test` đều đạt tuyệt đối 100% Pass.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #011 — Biên Soạn Bộ Tài Liệu Chuyên Sâu: Mạng Cơ Bản, IP, Port, DNS, Server, VPS & Hosting
- **Mục tiêu**:
  1. Biên soạn cẩm nang kỹ thuật toàn diện về:
     - Mạng căn bản: Địa chỉ IP (IPv4 vs IPv6, Public vs Private, Localhost 127.0.0.1, CGNAT).
     - Cổng mạng (Port): Cơ chế Port (0 - 65535), các cổng tiêu chuẩn (80, 443, 22, 2022/2023, 8000, 5173), cơ chế Port Binding & NAT Port Forwarding.
     - Tên miền & DNS: Cơ chế hoạt động của Domain Name System, phân biệt các bản ghi (Record A, AAAA, CNAME, TXT, MX), TTL, DNS Propagation, cơ chế Proxy của Cloudflare (Đám mây cam vs Đám mây xám).
     - Phân biệt các loại máy chủ: Shared Web Hosting vs Container Hosting (Pterodactyl) vs VPS (Virtual Private Server) vs Dedicated Server.
     - Kỹ thuật xuất bản ra Internet: Khi nào dùng IP Public tĩnh, khi nào dùng Cloudflare Tunnel để vượt qua rào cản CGNAT.
  2. Tạo tệp tài liệu Markdown chuẩn mực trong thư mục `docs/`: [KIEN_THUC_MANG_DNS_SERVER_HOSTING.md](file:///d:/Do-an/CDIO-4/code/docs/KIEN_THUC_MANG_DNS_SERVER_HOSTING.md).
  3. Tích hợp trực tiếp vào giao diện web [VisualGuideModal.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/VisualGuideModal.jsx) dưới dạng một phân hệ tra cứu trực quan và tiện lợi.
  4. Đảm bảo tuân thủ tuyệt đối quy tắc: 100% tiếng Việt có dấu, không dùng emoji, kiểm thử `npm run build` và `npm test` đạt 100% Pass.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/docs/KIEN_THUC_MANG_DNS_SERVER_HOSTING.md` (Tạo mới)
  - `d:/Do-an/CDIO-4/code/frontend/src/components/VisualGuideModal.jsx`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã khởi tạo cẩm nang kỹ thuật toàn diện [KIEN_THUC_MANG_DNS_SERVER_HOSTING.md](file:///d:/Do-an/CDIO-4/code/docs/KIEN_THUC_MANG_DNS_SERVER_HOSTING.md) trong thư mục `docs/`.
  - Đã tích hợp phân hệ tra cứu số 5 "Mạng Căn Bản, IP, Port, DNS & Server/VPS" vào Modal Hướng dẫn [VisualGuideModal.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/VisualGuideModal.jsx).
  - Biên dịch Frontend Vite `npm run build` hoàn tất xuất sắc trong 246ms (32 modules transformed, 0 error).
  - Toàn bộ 18/18 bước kiểm thử tích hợp hệ thống `npm test` đạt 100.0% Pass.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #012 — Xây Dựng Trang Hướng Dẫn & Cài Đặt Toàn Diện Độc Lập (Full-Page Documentation & Setup Guide)
- **Mục tiêu**:
  1. Xây dựng hướng dẫn Setup chi tiết từ A-Z (cài đặt môi trường Node.js 18+, Python 3.11+, clone dự án, cài đặt phụ thuộc, biến môi trường `.env`, tài khoản mẫu kiểm thử `qalead` / `123456`, cách chạy 1-Click `npm run dev` hoặc `chay_he_thong.bat`).
  2. Nâng cấp trải nghiệm người dùng từ dạng Modal cửa sổ nhỏ thành một **Trang Hướng Dẫn Toàn Màn Hình (Full-Page)** độc lập với thanh điều hướng danh mục bên trái (Sidebar Navigation) và khu vực đọc kỹ thuật chuyên sâu bên phải, gồm đầy đủ 7 phân hệ:
     - 1. Hướng Dẫn Cài Đặt & Khởi Chạy Từ Đầu (Setup Guide A - Z)
     - 2. Hướng Dẫn Triển Khai Hosting Pterodactyl (Pikamc Panel)
     - 3. Hướng Dẫn Kết Nối & Đồng Bộ Tệp Tin SFTP
     - 4. Cẩm Nang Mạng Căn Bản, IP, Port, DNS & So Sánh Máy Chủ / VPS
     - 5. Đóng Gói Docker Container & Cloudflare Tunnel
     - 6. Quy Trình Chuẩn Git Flow & Conventional Commits
     - 7. Hướng Dẫn Sử Dụng Studio Sinh Test Case & Chu Kỳ Scrum
  3. Bổ sung tab điều hướng "Tài Liệu & Hướng Dẫn" trực tiếp trên thanh điều hướng Top Navbar của [App.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/App.jsx).
  4. Đảm bảo tuân thủ 100% tiếng Việt có dấu, tuyệt đối không dùng emoji, kiểm thử `npm run build` và `npm test` đạt 100% Pass.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx` (Tạo mới)
  - `d:/Do-an/CDIO-4/code/frontend/src/App.jsx`
  - `d:/Do-an/CDIO-4/code/docs/HUONG_DAN_CAI_DAT_VA_KHOI_CHAY.md` (Tạo mới)
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã biên soạn cẩm nang thiết lập môi trường hoàn chỉnh từ A - Z [HUONG_DAN_CAI_DAT_VA_KHOI_CHAY.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_CAI_DAT_VA_KHOI_CHAY.md) trong thư mục `docs/`.
  - Đã xây dựng trang hướng dẫn toàn màn hình chuyên nghiệp [DocumentationPage.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx) gồm thanh danh mục cố định bên trái (Sidebar Navigation), ô tìm kiếm nội dung theo thời gian thực, nút sao chép mã lệnh 1-click (Copy Button), và 10 chuyên mục kỹ thuật chuyên sâu (Setup A-Z, Tài Khoản Mẫu, Pterodactyl Panel, SFTP, Mạng Căn Bản IP & Port, DNS, So Sánh Server/VPS, Docker & Cloudflare Tunnel, Git Flow, Động Cơ Test Case & Scrum).
  - Đã tích hợp Tab điều hướng "Tài Liệu & Cài Đặt" trên Top Navbar và liên kết nút Sách góc phải để chuyển ngay vào trang tài liệu toàn màn hình trong [App.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/App.jsx).
  - Đã bổ sung toàn bộ CSS hoàn chỉnh và tương thích Dark Mode trong [index.css](file:///d:/Do-an/CDIO-4/code/frontend/src/index.css).
  - Biên dịch Frontend Vite `npm run build` hoàn tất xuất sắc trong 258ms (`33 modules transformed, 0 error`).
  - Toàn bộ 18/18 bước kiểm thử tích hợp hệ thống qua `npm test` đạt 100.0% Pass.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #013 — Khắc Phục Lỗi Hiển Thị Khối Mã Nguồn (Code Blocks) & Bổ Sung Luật Quản Trị Hệ Thống (Điều 10 AGENTS.md)
- **Mục tiêu**:
  1. Khắc phục triệt để lỗi khối mã nguồn (Code Blocks) trên trang `DocumentationPage.jsx`:
     - Hiện trạng: Trong ảnh chụp thực tế của người dùng, khối lệnh bị đen sì, chữ bên trong bị tàng hình/mất màu (`#000000` trên nền tối `#0F172A`), chỉ trơ trọi nút sao chép.
     - Giải pháp: Xây dựng component `CodeSnippet` chuyên dụng tái sử dụng, có cấu trúc chuẩn GitHub/Vercel (Header gồm tên ngôn ngữ/terminal + nút Sao Chép tiện lợi ở góc phải, thân code có padding chuẩn, font Monospace rõ nét, màu chữ sáng `#38BDF8` và `#F8FAFC` đạt chuẩn tương phản WCAG AAA).
  2. Bổ sung Điều 10 vào [AGENTS.md](file:///d:/Do-an/CDIO-4/code/AGENTS.md):
     - **Điều 10.1**: Quy chuẩn hiển thị khối mã nguồn & lệnh Terminal trong UI (tương phản màu sắc, cấu trúc 2 tầng Header + Content, chống tràn chữ và chống tàng hình chữ).
     - **Điều 10.2**: Quy chuẩn an toàn khi kết nối Hosting Pterodactyl (làm rõ cổng 2023 là SFTP Subsystem của Wings Daemon, cấm dùng interactive SSH shell để tránh lỗi `BadRequestError: request aborted` và `Connection reset`).
  3. Cập nhật giải thích và cảnh báo lỗi trong [HUONG_DAN_HOSTING_PTERODACTYL_PIKAMC.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_HOSTING_PTERODACTYL_PIKAMC.md) và [HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md](file:///d:/Do-an/CDIO-4/code/docs/HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md).
  4. Đảm bảo tuân thủ 100% tiếng Việt có dấu, không emoji, kiểm thử `npm run build` và `npm test` đạt 100% Pass.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx`
  - `d:/Do-an/CDIO-4/code/frontend/src/index.css`
  - `d:/Do-an/CDIO-4/code/AGENTS.md` (Thêm Điều 10)
  - `d:/Do-an/CDIO-4/code/docs/HUONG_DAN_HOSTING_PTERODACTYL_PIKAMC.md`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã khắc phục triệt để lỗi chữ tàng hình trên nền đen trong ảnh chụp màn hình thực tế của người dùng:
    - Xây dựng component chuẩn hóa `CodeSnippet` trong [DocumentationPage.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx) gồm Header phân biệt rõ ngôn ngữ (`Bash / Terminal`, `Python Script`, `JSON Config`, `Docker Compose`) và nút Sao Chép phản hồi trực quan (đổi sang icon check xanh lá khi sao chép).
    - Cập nhật CSS trong [index.css](file:///d:/Do-an/CDIO-4/code/frontend/src/index.css) với màu chữ Sky Blue `#38BDF8` nổi bật trên nền tối `#0B0F19`, font JetBrains Mono / Consolas chuẩn mực, padding đầy đủ và thanh cuộn ngang mượt mà.
  - Đã bổ sung Điều 10 vào [AGENTS.md](file:///d:/Do-an/CDIO-4/code/AGENTS.md):
    - **Điều 10.1**: Quy chuẩn hiển thị khối mã nguồn & lệnh Terminal trong UI (Độ tương phản WCAG AAA, cấu trúc 2 tầng Header + Body, chống tàng hình chữ).
    - **Điều 10.2**: Quy chuẩn kết nối và quản trị máy chủ Pterodactyl (Cấm dùng SSH thô sơ vào cổng 2023 của Wings daemon để tránh lỗi `Connection reset` và `BadRequestError: request aborted`; phân định rõ SFTP cho tệp và Web Console cho lệnh/log).
  - Đã cập nhật cảnh báo trực tiếp trong phân hệ Hosting & SFTP của giao diện tài liệu và giải thích rõ nguyên nhân cho người dùng.
  - Biên dịch Frontend Vite `npm run build` đạt `33 modules transformed, 0 error` trong 282ms.
  - Kiểm thử tích hợp hệ thống `npm test` đạt **18/18 bước (100.0% Pass)**.
### Checkpoint #014 — Nâng Cấp Toàn Diện Hướng Dẫn Mạng, DNS & Khắc Phục Sự Cố Kết Nối Thực Hành
- **Mục tiêu**:
  1. Bổ sung trọn bộ hướng dẫn thực hành chuyên sâu về Mạng và DNS trong [DocumentationPage.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx):
     - **Phần 1: Bộ lệnh chẩn đoán mạng thực chiến (CLI Diagnostics)**: Xem IP cá nhân (`ipconfig`), kiểm tra cổng kết nối (`Test-NetConnection`), truy tìm tiến trình chiếm cổng (`netstat -ano | findstr`) và kill tiến trình giải phóng cổng (`taskkill /PID /F`).
     - **Phần 2: Hướng dẫn trỏ DNS & cấu hình Cloudflare thực tế**: Quy trình đổi Nameserver, cấu hình Record A/CNAME, phân biệt khi nào bật Đám mây cam (Web HTTPS) và khi nào tắt Đám mây cam (SFTP 2023, SSH), lệnh kiểm tra `nslookup` và xóa cache DNS máy tính (`ipconfig /flushdns`).
     - **Phần 3: Vượt rào cản CGNAT**: Giải thích lý do mạng gia đình không thể mở cổng và hướng dẫn cách thiết lập Cloudflare Tunnel (`cloudflared tunnel run`).
     - **Phần 4: Cẩm nang khắc phục 6 lỗi mạng kinh điển**: `ECONNREFUSED`, `ETIMEDOUT`, `EADDRINUSE`, `Connection reset` (lỗi SFTP/SSH vừa gặp), `502 Bad Gateway`, `CORS Policy`.
     - **Phần 5: Sơ đồ luồng gói tin từ Trình duyệt đến Server (Client - DNS - Edge - Origin)**.
  2. Bổ sung các phân mục tra cứu rõ ràng vào danh mục bên trái (Sidebar Navigation) để người dùng dễ tìm kiếm.
  3. Sử dụng 100% component `CodeSnippet` có nút sao chép câu lệnh 1-Click, màu chữ Sky Blue tương phản cao, không emoji, tiếng Việt có dấu chuẩn mực.
  4. Đảm bảo `npm run build` và `npm test` tiếp tục đạt 100% Pass.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx`
  - `d:/Do-an/CDIO-4/code/docs/KIEN_THUC_MANG_DNS_SERVER_HOSTING.md`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã bổ sung 2 chuyên mục thực hành mới vào Sidebar Navigation của [DocumentationPage.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx):
    1. **Lệnh Chẩn Đoán Mạng Thực Hành**: Hướng dẫn chi tiết lệnh `ipconfig`, `curl ifconfig.me`, `Test-NetConnection -Port 2023`, `netstat -ano | findstr :8000`, `taskkill /PID /F`, `curl -I`.
    2. **Khắc Phục 6 Lỗi Mạng Kinh Điển**: Phân tích cặn kẽ nguyên nhân và cách xử lý `Connection reset / request aborted` (Pterodactyl SSH vs SFTP), `ECONNREFUSED`, `EADDRINUSE`, `502 Bad Gateway`, `CORS Policy`, `ETIMEDOUT`.
  - Đã mở rộng phân hệ `network` (Cơ chế 127.0.0.1 vs 0.0.0.0, rào cản CGNAT tại Việt Nam) và `dns` (Quy trình trỏ tên miền 3 bước, quy tắc Đám Mây Cam vs Đám Mây Xám, `nslookup` và `ipconfig /flushdns`).
  - 100% các câu lệnh đều sử dụng component `CodeSnippet` có nút sao chép 1-Click, hiển thị nổi bật trên nền tối chuyên nghiệp.
  - Biên dịch Frontend Vite `npm run build` đạt `33 modules transformed, 0 error` trong 338ms.
  - Kiểm thử tích hợp hệ thống `npm test` đạt **18/18 bước (100.0% Pass)**.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #015 — Thiết Kế Lại Sidebar Dạng Menu Cây Xổ Xuống (Collapsible Accordion Menu) & Tách Chi Tiết Từng Bài Hướng Dẫn
- **Mục tiêu**:
  1. Đáp ứng yêu cầu người dùng: *"ấn vào mục xổ menu từng cái á nếu gộp chung thì ko hướng dẫn chi tiết đc"*.
  2. Nâng cấp cấu trúc Sidebar của `DocumentationPage.jsx`:
     - Chuyển từ danh mục phẳng thành **Hệ Thống Menu Cây Xổ Xuống (Accordion / Collapsible Tree Menu)**:
       - Mỗi nhóm chính có nút bấm xổ ra / thu gọn (Toggle Expand/Collapse) kèm mũi tên chỉ hướng (Chevron Down / Chevron Right).
       - Hỗ trợ nút mở rộng tất cả / thu gọn tất cả (Expand/Collapse All).
     - Phân rã toàn bộ các chủ đề lớn thành hơn **25 bài hướng dẫn con độc lập, chuyên sâu**, không gộp chung nội dung:
       - Nhóm 1: Cài Đặt & Môi Trường (5 mục con)
       - Nhóm 2: Mạng Căn Bản & Địa Chỉ IP (4 mục con)
       - Nhóm 3: Hệ Thống Tên Miền DNS (5 mục con)
       - Nhóm 4: Lệnh Chẩn Đoán Mạng Thực Hành (5 mục con)
       - Nhóm 5: Khắc Phục 6 Lỗi Mạng Kinh Điển (6 mục con)
       - Nhóm 6: Hosting Pterodactyl & SFTP (4 mục con)
       - Nhóm 7: Máy Chủ, VPS & Docker Tunnel (3 mục con)
       - Nhóm 8: Git Flow & Động Cơ Kiểm Thử (3 mục con)
  3. Khi nhấp vào bất kỳ mục con nào, khu vực nội dung bên phải sẽ hiển thị **bài viết chuyên sâu độc lập** cho mục đó với hướng dẫn từng bước cụ thể, có component `CodeSnippet` nút copy và bảng dữ liệu rõ ràng.
  4. Đảm bảo tuân thủ tuyệt đối quy tắc: 100% tiếng Việt có dấu, không emoji, kiểm thử `npm run build` và `npm test` đạt 100% Pass.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx`
  - `d:/Do-an/CDIO-4/code/frontend/src/index.css`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã tái cấu trúc toàn diện Sidebar của [DocumentationPage.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx) thành **Hệ Thống Menu Cây Xổ Xuống (Collapsible Accordion Tree Navigation)**:
    - 8 Nhóm cha lớn có thể click để **mở rộng / thu gọn (toggle expand/collapse)** kèm icon mũi tên chỉ hướng (Chevron Down / Chevron Right).
    - Có thanh công cụ trên cùng với nút **"Mở tất cả"** và **"Thu gọn"** cùng ô tìm kiếm trực tiếp tự động mở các nhóm phù hợp.
    - Phân rã thành **32 bài hướng dẫn con độc lập, chuyên sâu**: Khi người dùng click vào bất kỳ mục con nào, khu vực nội dung bên phải hiển thị bài hướng dẫn riêng biệt cho đúng mục đó (không bị gộp chung dài dòng, người đọc tiếp thu cực kỳ trực quan).
  - Đã bổ sung đầy đủ CSS hoàn chỉnh cho Accordion và Sub-items trong [index.css](file:///d:/Do-an/CDIO-4/code/frontend/src/index.css).
  - Biên dịch Frontend Vite `npm run build` hoàn tất xuất sắc trong 268ms (`33 modules transformed, 0 error`).
  - Kiểm thử tích hợp hệ thống qua `npm test` đạt **18/18 bước (100.0% Pass)**.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #016 — Chuyển Đổi Toàn Bộ Phông Chữ Dự Án Sang Times New Roman & Tinh Chỉnh Typography Chống Mỏi Mắt
- **Mục tiêu**:
  1. Đáp ứng yêu cầu trực tiếp của người dùng: *"chỉnh sửa thêm và đổi font chữ cho toàn dự án là time new roman đi chứ nhìn font đau mắt"*.
  2. Thiết lập phông chữ tiêu chuẩn học thuật & tài liệu kỹ thuật chuẩn mực: **"Times New Roman", Times, "Cambria", Georgia, serif** áp dụng đồng bộ toàn hệ thống:
     - Giao diện người dùng, tiêu đề, thanh điều hướng, các nút bấm, ô nhập liệu form, bảng dữ liệu test case, modal, tài liệu hướng dẫn.
     - Vùng soạn thảo đặc tả yêu cầu (`.textarea`) chuyển sang Times New Roman để hiển thị như văn bản Word kỹ thuật chuẩn đại học.
     - Giữ nguyên `--font-mono` cho các khối lệnh terminal, block code, JSON snippet và ID mã ngắn để không làm vỡ căn lề ký tự.
  3. Cập nhật biến Design Tokens trong `frontend/src/index.css`:
     - `--font-sans: "Times New Roman", Times, "Cambria", Georgia, serif;`
     - `--font-serif: "Times New Roman", Times, "Cambria", Georgia, serif;`
     - Áp dụng triệt để cho `html, body, button, input, optgroup, select, textarea, table, th, td`.
     - Tinh chỉnh `line-height` và tỷ lệ `font-size` để chữ tiếng Việt có dấu rõ nét, thanh thoát, hoàn toàn triệt tiêu cảm giác nhức mỏi mắt khi đọc lâu.
  4. Cập nhật Điều 2 trong `AGENTS.md` để ghi nhận quy chuẩn Times New Roman của dự án.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/frontend/src/index.css`
  - `d:/Do-an/CDIO-4/code/AGENTS.md`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã cập nhật biến Design Tokens trong [index.css](file:///d:/Do-an/CDIO-4/code/frontend/src/index.css):
    - Thiết lập bộ phông chuẩn: `--font-sans: "Times New Roman", Times, "Tinos", "Cambria", Georgia, serif;` và `--font-serif: "Times New Roman", Times, "Tinos", "Cambria", Georgia, serif;`.
    - Tự động áp dụng kế thừa phông chữ Times New Roman cho toàn bộ các phần tử: `html, body, button, input, optgroup, select, textarea, table, th, td`.
    - Vùng soạn thảo đặc tả yêu cầu (`.textarea`) hiển thị đúng định dạng tài liệu văn bản Word kỹ thuật Times New Roman trang trọng, không gây chói/mỏi mắt.
    - Giữ nguyên `--font-mono` cho các khối lệnh terminal, block code, JSON snippet và ID mã ngắn để không làm vỡ căn lề ký tự.
    - Tối ưu tỷ lệ `font-size` và `line-height: 1.65` cùng cỡ chữ menu cây tài liệu và nội dung bài viết, giúp hiển thị tiếng Việt có dấu cực kỳ rõ nét, êm dịu cho mắt.
  - Đã cập nhật Điều 2 trong [AGENTS.md](file:///d:/Do-an/CDIO-4/code/AGENTS.md) ghi nhận Times New Roman là tiêu chuẩn phông chữ chính thức của dự án.
  - Biên dịch Frontend Vite `npm run build` hoàn tất xuất sắc trong 265ms (`33 modules transformed, 0 error`).
  - Kiểm thử tích hợp hệ thống `npm test` đạt **18/18 bước (100.0% Pass)**.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #017 — Tối Ưu Thanh Cuộn Siêu Gọn & Bổ Sung Nút Điều Hướng Bài Trước / Tiếp Theo (Prev/Next)
- **Mục tiêu**:
  1. Đáp ứng yêu cầu trực tiếp của người dùng: *"css luôn thanh cuộn này cho gọn đi thêm nút next pre ở trang để chuyển cho nhanh"*.
  2. Tinh chỉnh CSS thanh cuộn (Custom Slim Scrollbar):
     - Biến thanh cuộn Windows mặc định to dày, thô kệch thành thanh cuộn hiện đại siêu mỏng (4px - 5px), bo góc tròn mềm mại, nền trong suốt.
     - Đồng bộ màu thanh cuộn theo chủ đề Sáng / Tối (`[data-theme="dark"]`), hover đổi màu mượt mà.
     - Tối ưu đặc biệt cho Sidebar danh mục tài liệu (`.docs-sidebar`) để không chiếm diện tích hiển thị của menu.
  3. Bổ sung Bộ Điều Hướng Chuyển Bài Trước / Tiếp Theo (Prev / Next Pager) vào cuối mỗi bài viết trong [DocumentationPage.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx):
     - Tự động xác định bài trước (`prevItem`) và bài tiếp theo (`nextItem`) trong danh sách 32 bài viết.
     - Thiết kế 2 thẻ điều hướng chuyên nghiệp (Next.js / VitePress style) hiển thị rõ nhãn ("Bài trước" / "Bài tiếp theo") cùng tiêu đề bài viết.
     - Khi nhấp: Chuyển ngay đến bài viết mới, tự động mở nhóm cha (Accordion Parent Group) trên Sidebar và cuộn trang mượt mà lên đầu bài viết.
  4. Bổ sung `IconChevronLeft` vào [icons/index.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/icons/index.jsx).
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/frontend/src/icons/index.jsx`
  - `d:/Do-an/CDIO-4/code/frontend/src/index.css`
  - `d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã bổ sung thành công [IconChevronLeft](file:///d:/Do-an/CDIO-4/code/frontend/src/icons/index.jsx) chuẩn SVG không dùng emoji.
  - Đã tối ưu CSS thanh cuộn siêu mỏng trong [index.css](file:///d:/Do-an/CDIO-4/code/frontend/src/index.css):
    - Toàn bộ thanh cuộn hệ thống được thu gọn chỉ còn 5px - 6px, bo góc tròn 9999px, nền trong suốt, màu xám nhạt tinh tế, tự động chuyển màu nổi bật khi hover.
    - Sidebar điều hướng tài liệu (`.docs-sidebar`) được cài đặt thanh cuộn 4px siêu gọn gàng, ẩn tràn ngang (`overflow-x: hidden`), không che khuất chữ của danh mục bài viết.
  - Đã xây dựng hoàn chỉnh Bộ Điều Hướng Bài Trước / Tiếp Theo (Prev / Next Pager) trong [DocumentationPage.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx):
    - Tự động map danh sách phẳng 32 bài viết (`ALL_DOC_ITEMS`).
    - Hiển thị 2 thẻ điều hướng dạng Card chuyên nghiệp ở cuối mỗi bài viết với tiêu đề và icon mũi tên.
    - Hỗ trợ 1-Click chuyển bài: Tự động đổi nội dung, tự động mở nhóm cha trên cây thư mục bên trái và cuộn mượt mà lên đầu trang.
  - Biên dịch Frontend Vite `npm run build` đạt **33 modules transformed, 0 error** trong 274ms.
  - Kiểm thử tích hợp hệ thống qua `python run_system_test.py` đạt **18/18 bước (100.0% Pass)**.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #018 — Thu Gọn Kích Thước Nút Điều Hướng Bài Trước / Tiếp Theo (Compact Docs Pager)
- **Mục tiêu**:
  1. Đáp ứng yêu cầu trực tiếp của người dùng: *"nút hơi to cần chỉnh thêm"*.
  2. Tinh chỉnh lại CSS và cấu trúc thẻ nút điều hướng `.docs-pager`:
     - Giảm độ dày padding từ `16px 20px` xuống `8px 14px` (siêu gọn gàng).
     - Giới hạn chiều rộng tối đa `max-width: 280px` để nút không bị bè chiếm nửa màn hình.
     - Cỡ chữ nhãn (meta) giảm từ `12px` xuống `11px`, tiêu đề bài viết từ `15px` xuống `13px`, thêm `text-overflow: ellipsis` tránh bị vỡ dòng quá dài.
     - Dùng `display: flex` với `margin-left: auto` cho nút Bài Tiếp Theo khi ở bài đầu tiên, tạo bố cục thanh thoát, tinh tế chuẩn Linear / GitHub.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/frontend/src/index.css`
  - `d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Kết quả thực hiện**:
  - Đã tối ưu triệt để kích thước nút điều hướng trong [index.css](file:///d:/Do-an/CDIO-4/code/frontend/src/index.css):
    - Chuyển bố cục sang `display: flex; justify-content: space-between; gap: 12px;`.
    - Giảm padding từ `16px 20px` xuống `8px 14px`, giảm chiều cao tổng thể hơn 50%.
    - Cài đặt `max-width: 280px` cùng `text-overflow: ellipsis; white-space: nowrap;` để nút nhỏ gọn, cân đối, không bị kéo bè chiếm nửa màn hình.
    - Cỡ chữ meta thu gọn `11px`, tiêu đề bài viết `13px`, tự động áp dụng `margin-left: auto` cho nút bài tiếp theo khi ở bài đầu.
  - Cập nhật [DocumentationPage.jsx](file:///d:/Do-an/CDIO-4/code/frontend/src/components/DocumentationPage.jsx) dùng điều kiện `{prevItem && ...}` và `{nextItem && ...}` không để lại khung placeholder chiếm diện tích rỗng.
  - Biên dịch Frontend Vite `npm run build` hoàn tất xuất sắc trong 278ms (`33 modules transformed, 0 error`).
  - Kiểm thử tích hợp hệ thống `python run_system_test.py` đạt **18/18 bước (100.0% Pass)**.
- **Trạng thái**: **[HOAN TAT]**

### Checkpoint #019 — Khởi Tạo Git Repository, Thiết Lập .gitignore Toàn Diện & Đẩy Dự Án Lên GitHub
- **Mục tiêu**:
  1. Đáp ứng yêu cầu trực tiếp của người dùng: *"https://github.com/kha0305/cdio4-testcase-generator.git đẩy dự án lên"*.
  2. Tạo tập tin `.gitignore` tại thư mục gốc Monorepo (`d:/Do-an/CDIO-4/code/.gitignore`):
     - Loại trừ triệt để: `node_modules/`, `dist/`, `.env`, `*.db`, `*.db-shm`, `*.db-wal`, `__pycache__/`, `*.pyc`, `.venv/`, `*.log`.
     - Tuyệt đối không commit tệp cơ sở dữ liệu nội bộ SQLite hay mật khẩu bí mật.
  3. Khởi tạo Git (`git init`), cấu hình nhánh chính `main`, thêm remote `origin` trỏ về `https://github.com/kha0305/cdio4-testcase-generator.git`.
  4. Tạo initial commit chuẩn Convention Tiếng Việt và thực hiện `git push -u origin main`.
- **Tập tin can thiệp**:
  - `d:/Do-an/CDIO-4/code/.gitignore`
  - `d:/Do-an/CDIO-4/code/TASK_MEMORY.md`
- **Trạng thái**: **[DANG THUC HIEN]**

---

## 4. KẾ HOẠCH HÀNH ĐỘNG TIẾP THEO (NEXT ACTION ITEMS)
- **Kế hoạch 1**: Tạo `.gitignore` chuẩn Monorepo tại gốc dự án.
- **Kế hoạch 2**: Khởi tạo Git repository, add remote `https://github.com/kha0305/cdio4-testcase-generator.git`.
- **Kế hoạch 3**: Commit toàn bộ mã nguồn sạch sẽ và đẩy lên nhánh `main`.
- **Kế hoạch 4**: Cập nhật Checkpoint #019 sang `[HOAN TAT]`.









