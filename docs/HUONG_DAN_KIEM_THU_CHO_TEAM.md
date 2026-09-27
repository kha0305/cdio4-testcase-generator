# TÀI LIỆU HƯỚNG DẪN KIỂM THỬ HỆ THỐNG (TEAM TESTING GUIDE)
## Nền Tảng Tự Động Sinh Test Case & Quản Trị Kiểm Thử Agile Scrum (CDIO-4)

Tài liệu này được biên soạn dành riêng cho các thành viên trong nhóm kiểm thử (QA/QC Team, Giảng viên và Hội đồng đánh giá) để nhanh chóng cài đặt, khởi chạy và thực hiện kiểm thử nghiệm thu toàn diện hệ thống.

---

## 1. YÊU CẦU MÔI TRƯỜNG & KHỞI CHẠY 1-CLICK

### 1.1. Yêu cầu phần mềm máy tính
- **Hệ điều hành**: Windows 10/11 (hoặc macOS/Linux).
- **Python**: Phiên bản 3.10 trở lên (Tải tại [python.org](https://www.python.org/)).
- **Node.js**: Phiên bản 18 trở lên (Tải tại [nodejs.org](https://nodejs.org/)).

### 1.2. Khởi chạy 1-Click (Dành cho Windows)
Thư mục dự án đã được đóng gói sẵn các script tự động hóa:

1. **Bước 1 (Chỉ chạy lần đầu)**: Nhấn đúp chuột vào file:
   ```cmd
   cai_dat.bat
   ```
   *Hệ thống sẽ tự động cài đặt toàn bộ thư viện Backend (FastAPI, Z3-Solver, AllPairsPy) và Frontend (React, Vite).*

2. **Bước 2 (Khởi chạy hệ thống)**: Nhấn đúp chuột vào file:
   ```cmd
   khoi_dong.bat
   ```
   *Hệ thống sẽ tự động khởi chạy Backend, Frontend và tự động mở trình duyệt web tại `http://localhost:5173`.*

3. **Bước 3 (Kiểm tra tự động - Tùy chọn)**: Nhấn đúp chuột vào file:
   ```cmd
   kiem_tra_he_thong.bat
   ```
   *Chạy bộ kiểm thử tích hợp 18 bước tự động để xác nhận toàn bộ hệ thống hoạt động 100%.*

---

## 2. DANH SÁCH TÀI KHOẢN KIỂM THỬ CÓ SẴN

Hệ thống đã nạp sẵn các tài khoản với đầy đủ dữ liệu thực tế để nhóm kiểm thử sử dụng ngay:

| Vai Trò | Tên Người Dùng | Tên Đăng Nhập | Mật Khẩu | Quyền Hạn Trong Dự Án |
| :--- | :--- | :--- | :--- | :--- |
| **Trưởng Nhóm** | Trần Minh (QA Lead) | `qalead` | `123456` | Toàn quyền quản trị dự án, thêm/xóa thành viên, phân quyền, tạo/xóa Sprint |
| **Thành Viên** | Lê Hoàng Nam (Tester) | `tester01` | `123456` | Bóc tách tham số, sinh test case, chấm điểm Pass/Fail, cập nhật tiến độ |

> **Lưu ý**: Bất kỳ thành viên nào cũng có thể tự bấm nút **"Đăng Ký"** trên giao diện để tạo một tài khoản riêng. Mọi tài khoản khi đăng ký đều bình đẳng; quyền hạn quản trị sẽ được quyết định theo vai trò cụ thể trong từng dự án mà bạn tạo ra hoặc tham gia.

---

## 3. CHECKLIST CÁC KỊCH BẢN KIỂM THỬ CHO TEAM

### Kịch Bản 1: Xác Thực, Hồ Sơ Cá Nhân & Bảo Mật Tài Khoản
- [ ] **Đăng ký tài khoản**: Nhấn nút `Đăng Nhập` $\rightarrow$ Chọn tab `Đăng Ký Tài Khoản` $\rightarrow$ Nhập Họ tên, Tên đăng nhập, Email, Mật khẩu $\rightarrow$ Đăng ký thành công và tự động đăng nhập.
- [ ] **Xem & Chỉnh sửa hồ sơ**:
  - Nhấn vào **Avatar / Tên tài khoản** ở góc trên bên phải màn hình.
  - Modal **Hồ Sơ & Bảo Mật Tài Khoản** hiển thị ngay ngắn.
  - Sửa đổi Họ tên và Email $\rightarrow$ Nhấn `Lưu Thay Đổi` $\rightarrow$ Kiểm tra tên trên thanh điều hướng đỉnh cao (Topbar) cập nhật ngay lập tức.
- [ ] **Đổi mật khẩu bảo mật**:
  - Chuyển sang tab `Bảo Mật & Mật Khẩu`.
  - Nhập Mật khẩu hiện tại, Mật khẩu mới (tối thiểu 6 ký tự), Xác nhận mật khẩu $\rightarrow$ Bấm `Cập Nhật Mật Khẩu`.
  - Đăng xuất tài khoản và đăng nhập lại bằng mật khẩu mới để kiểm chứng.
- [ ] **Đăng xuất an toàn**:
  - Bấm nút `Đăng Xuất` màu đỏ nổi bật trên Topbar (hoặc nút `Đăng Xuất Tài Khoản` trong Modal hồ sơ) $\rightarrow$ Hệ thống xóa phiên làm việc an toàn.

---

### Kịch Bản 2: Quản Lý Dự Án & Phân Quyền 3 Cấp (RBAC)
- [ ] **Tạo dự án mới**:
  - Nhấn vào nút chọn dự án trên Topbar $\rightarrow$ Chọn `+ Tạo Dự Án Mới`.
  - Nhập Tên dự án, Mã code (ví dụ `PRJ-APP-01`), Loại dự án (Cá nhân hoặc Nhóm) $\rightarrow$ Nhấn `Tạo Dự Án`.
  - **Kiểm chứng**: Tài khoản tạo dự án sẽ tự động nhận vai trò **Trưởng nhóm (Leader)** kèm Badge màu xanh nổi bật.
- [ ] **Quản lý thành viên & Phân quyền 3 cấp**:
  - Nhấn nút `Thành Viên` trên Topbar.
  - Thêm thành viên mới vào dự án bằng cách nhập Tên đăng nhập (hoặc Email) $\rightarrow$ Chọn vai trò ban đầu (`Thành viên` hoặc `Phó nhóm`).
  - Đổi vai trò thành viên: Trưởng nhóm có thể phong một thành viên lên làm `Phó nhóm` hoặc hạ xuống `Thành viên`.
  - Nhấn `Sao Chép Mã Mời` hoặc `Sao Chép Link Mời` để gửi cho đồng đội tham gia dự án.
- [ ] **Kiểm tra hàng rào phân quyền (Security Enforcement)**:
  - Đăng nhập tài khoản `tester01` (Thành viên thường): Kiểm tra nút Sửa/Xóa dự án và nút Tạo/Xóa Sprint sẽ tự động bị ẩn hoặc khóa quyền để bảo vệ dự án.

---

### Kịch Bản 3: Bóc Tách Ngữ Nghĩa & Tự Động Sinh Test Case (Studio)
- [ ] **Thử nhanh ví dụ mẫu**:
  - Tại phân hệ `Studio Kiểm Thử`, nhấn vào các nút ví dụ mẫu: *Đăng ký tài khoản*, *Chuyển tiền ngân hàng*, *Đặt phòng khách sạn*, *Vận chuyển TMĐT*, *English Requirement*.
  - Quan sát văn bản mẫu tự động điền vào khung soạn thảo.
- [ ] **Bóc tách tham số tự động (NLP Engine)**:
  - Nhấn nút chính `Bóc tách tham số & Sinh test`.
  - Hệ thống tự động chuyển sang **Bước 2: Tham số & Ràng buộc**.
  - Kiểm tra bảng tham số bóc tách: Tên tham số, Kiểu dữ liệu (integer, float, string, boolean, enum), Giá trị min/max, độ dài min/max, bắt buộc hay không.
  - Bạn có thể chỉnh sửa trực tiếp giá trị trên bảng hoặc bấm `+ Thêm tham số`.
- [ ] **Sinh Test Case bằng Z3 SMT Solver & Pairwise**:
  - Nhấn nút `Sinh Test Cases`.
  - Hệ thống tự động chuyển sang **Bước 3: Kết quả kiểm thử**.
  - Kiểm tra danh sách các test case sinh ra:
    - Kịch bản kiểm thử (Test Scenario tiếng Việt có dấu).
    - Phân loại kiểm thử: `POSITIVE`, `NEGATIVE`, `BOUNDARY`.
    - Kỹ thuật áp dụng: `BVA` (Giá trị biên), `EP` (Phân vùng tương đương), `PAIRWISE` (Tổ hợp cặp), `Z3` (Bộ giải ràng buộc SMT).
    - Dữ liệu kiểm thử cụ thể (Test Data).
    - Kết quả mong đợi (Expected Result).
- [ ] **Chấm điểm kết quả thực tế (Verdict Execution)**:
  - Chọn trạng thái cho từng ca kiểm thử: `PASS`, `FAIL`, `BLOCKED`.
  - Nhập kết quả thực tế vào ô `Kết quả thực tế` $\rightarrow$ Tự động lưu vào cơ sở dữ liệu.

---

### Kịch Bản 4: Quản Lý Chu Kỳ Agile Scrum & Sprints
- [ ] Chuyển sang tab **Bảng Scrum** trên thanh điều hướng.
- [ ] **Tạo Sprint mới**: Nhấn `+ Tạo Sprint Mới`, đặt tên Sprint, mục tiêu chu kỳ, thời gian bắt đầu và kết thúc.
- [ ] **Kiểm tra Definition of Done (DoD)**:
  - Xem Banner trạng thái Sprint: Hiển thị tổng số ca kiểm thử, số ca Pass/Fail và tỷ lệ Đạt (%).
  - Tự động đánh giá chuẩn DoD: Nếu tỷ lệ Pass đạt chuẩn $\rightarrow$ Badge xanh `Đạt Chuẩn Nghiệm Thu DoD`. Nếu chưa đạt $\rightarrow$ Badge vàng cảnh báo.
- [ ] **Bảng Kanban 3 Cột**:
  - Kéo hoặc chuyển đổi trạng thái User Stories giữa 3 cột:
    1. *Lên Kế Hoạch (Planning)*
    2. *Đang Kiểm Thử (In Testing)*
    3. *Đã Hoàn Thành (Done)*

---

### Kịch Bản 5: Lịch Trình & Phân Công Nhiệm Vụ (Calendar)
- [ ] Chuyển sang tab **Lịch Phân Công** trên thanh điều hướng.
- [ ] Xem toàn bộ danh sách chức năng được sắp xếp theo hạn chót (Due Date).
- [ ] **Bộ lọc nhiệm vụ**: Lọc nhiệm vụ theo tên thành viên phụ trách (Assignee) hoặc xem các chức năng chưa được phân công.
- [ ] **Cập nhật phân công**: Bấm nút sửa để đổi người phụ trách và ngày hoàn tất nhiệm vụ.

---

### Kịch Bản 6: Báo Cáo Nghiệm Thu & Xuất File 4 Định Dạng
- [ ] Chuyển sang tab **Báo Cáo Dự Án**.
- [ ] Quan sát biểu đồ tổng quan: Tỷ lệ đạt (%) toàn dự án, Tổng số test case, Danh sách các ca bị lỗi (Defect Log).
- [ ] **Xuất dữ liệu 4 định dạng**:
  - **Xuất Excel (.xlsx)**: File Excel chuẩn kiểm thử phần mềm gồm 4 Sheet (`Tổng Quan`, `Danh Sách Test Case`, `Bảng Tham Số`, `Nhật Ký Lỗi Defect`).
  - **Xuất CSV (.csv)**: File dữ liệu dạng bảng tương thích Excel / Google Sheets.
  - **Xuất JSON (.json)**: Định dạng dữ liệu RESTful phục vụ tích hợp CI/CD.
  - **Xuất Markdown (.md)**: Báo cáo văn bản tổng kết nghiệm thu dự án.

---

### Kịch Bản 7: Chế Độ Tối / Sáng & Tiêu Chuẩn Giao Diện (Theme & UX)
- [ ] **Chuyển đổi giao diện**: Bấm vào nút icon Mặt Trời / Mặt Trăng ở góc phải Topbar.
- [ ] **Kiểm tra Dark Mode**:
  - Nền tối phân tầng 4 lớp có chiều sâu (`#0A0E17` $\rightarrow$ `#111827` $\rightarrow$ `#1E293B`).
  - Chữ trắng sáng ngọc (`#F9FAFB`) sắc nét, đạt chuẩn WCAG AAA.
  - Không có bất kỳ nút bấm, ô nhập hay thẻ trạng thái nào bị chìm màu.
- [ ] **Quy chuẩn AGENTS.md**:
  - Toàn bộ giao diện 100% tiếng Việt có dấu chuẩn xác.
  - Tuyệt đối không có biểu tượng cảm xúc (Emoji) rác, 100% sử dụng icon SVG kỹ thuật.

---

## 4. CẤU TRÚC MÃ NGUỒN ĐÓNG GÓI

```text
code/
├── cai_dat.bat                   # File cài đặt dependencies tự động 1-click
├── khoi_dong.bat                 # File khởi chạy toàn bộ hệ thống 1-click
├── kiem_tra_he_thong.bat         # File chạy 18 bước kiểm thử tự động
├── HUONG_DAN_KIEM_THU_CHO_TEAM.md# Tài liệu hướng dẫn chi tiết này
├── AGENTS.md                     # Bộ luật và quy chuẩn phát triển dự án
├── run_system_test.py            # Kịch bản kiểm thử tích hợp tự động
├── migrate_db.py                 # Kịch bản đồng bộ cơ sở dữ liệu SQLite
├── backend/                      # Mã nguồn Backend FastAPI
│   ├── main.py                   # Điểm khởi chạy API chính
│   ├── database.py               # Kết nối SQLite / ORM
│   ├── models.py                 # Cấu trúc CSDL (User, Project, Sprint,...)
│   ├── schemas.py                # Pydantic Schemas dữ liệu
│   ├── requirements.txt          # Danh sách thư viện Python
│   ├── routers/                  # Các phân hệ API (Auth, Projects, Test,...)
│   └── engine/                   # Lõi thuật toán (Z3 SMT, Pairwise, NLP,...)
└── frontend/                     # Mã nguồn Frontend React + Vite
    ├── package.json              # Danh sách thư viện Node.js
    ├── src/
    │   ├── App.jsx               # Bố cục chính Topbar & Điều hướng
    │   ├── index.css             # Hệ thống CSS Design Tokens & Dark/Light
    │   ├── api.js                # Tầng kết nối RESTful API
    │   ├── components/           # Các Modal, Studio, Scrum, Calendar, Report
    │   └── icons/                # Hệ thống Lucide SVG Icons đồng bộ
```

---
*Chúc nhóm kiểm thử có trải nghiệm đánh giá hệ thống thành công và đạt kết quả cao nhất!*
