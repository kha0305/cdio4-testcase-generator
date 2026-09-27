# HỆ THỐNG TỰ ĐỘNG SINH TEST CASE (CDIO-4)
## Automated Test Case Generation Platform — BVA, Equivalence Partitioning, Pairwise & SMT Z3 Solver

Hệ thống hỗ trợ tự động bóc tách ngữ nghĩa từ tài liệu đặc tả yêu cầu phần mềm (Software Requirements Specification / User Stories) và tự động sinh bộ ca kiểm thử (Test Cases) chất lượng cao đạt chuẩn quốc tế **ISTQB CTFL v4.0** và **ISO/IEC/IEEE 29119-3**. Dự án được xây dựng theo mô hình Monorepo kết hợp động cơ toán học hình thức, quản trị quy trình Agile/Scrum và giao diện Studio chuyên nghiệp.

---

## 1. TỔNG QUAN DỰ ÁN & VẤN ĐỀ GIẢI QUYẾT

Trong quy trình phát triển phần mềm truyền thống, việc thiết kế Test Case thủ công gặp phải các rào cản lớn:
- **Tốn kém thời gian & nguồn lực**: Kỹ sư kiểm thử phải phân tích từng câu chữ, tự tính toán điểm biên (Boundary) và các phân vùng tương đương.
- **Dễ sót lỗi tổ hợp**: Khi có nhiều trường tham số đầu vào, số lượng tổ hợp khả dĩ bùng nổ theo cấp số nhân khiến kiểm thử viên dễ bỏ sót các tương tác ẩn giữa các trường.
- **Dữ liệu giả lập cẩu thả (Vibe Coding / Dummy Data)**: Các công cụ tự động thông thường thường sinh chuỗi vô nghĩa (`"test_value"`, `"abc"`, chuỗi ngẫu nhiên vô nghĩa) không phản ánh đúng ngữ cảnh nghiệp vụ (họ tên người Việt, email hợp lệ, định dạng số điện thoại, mã OTP, tiền tệ VNĐ).

**Giải pháp của CDIO-4 AutoTest**:
Hệ thống kết hợp mô hình xử lý ngôn ngữ tự nhiên (NLP Parameter Extraction) với các động cơ toán học và thuật toán kiểm thử phần mềm chuyên nghiệp:
1. **Phân tích Giá trị Biên (Boundary Value Analysis - BVA)**: Tự động xác định 6 điểm biên nhạy cảm lỗi: `Min - 1`, `Min`, `Min + 1`, `Max - 1`, `Max`, `Max + 1`.
2. **Phân Vùng Tương Đương (Equivalence Partitioning - EP)**: Phân rã miền dữ liệu thành 1 phân vùng hợp lệ (Valid) và các phân vùng không hợp lệ (Invalid).
3. **Kiểm Thử Tổ Hợp Cặp (Pairwise / All-Pairs Testing)**: Sinh ma trận tổ hợp trực giao nhằm bao phủ 100% các cặp tương tác 2 chiều với số lượng ca kiểm thử tối thiểu (giảm 70% - 85% số ca so với kiểm thử vét cạn).
4. **Bộ Giải Ràng Buộc Hình Thức (Z3 SMT Solver - Microsoft Research)**: Tự động tìm nghiệm thỏa mãn hệ thống phương trình và bất đẳng thức ràng buộc logic phức tạp giữa các tham số nghiệp vụ.
5. **Bộ Tổng Hợp Ngữ Cảnh Thực Tế (Context-Aware Synthesizer)**: Tự động nhận diện trường dữ liệu để sinh thông tin chuẩn văn hóa và định dạng thực tế tại Việt Nam.

---

## 2. CÁC TÍNH NĂNG KỸ THUẬT NỔI BẬT

### 2.1. Động Cơ Sinh Test Case Đạt Chuẩn Senior QA (Anti-Vibe Coder)
- **Mã định danh phân cấp chuẩn ISO/IEC/IEEE 29119**: Cấu trúc mã hóa rõ ràng theo cú pháp `TC_[MODULE]_[TECH]_[SEQ]` (Ví dụ: `TC_AUTH_BVA_001`, `TC_ORDER_EP_004`, `TC_PAY_PW_008`, `TC_CART_Z3_002`).
- **Mô tả kịch bản có ngữ cảnh nghiệp vụ sâu sắc**: Nêu rõ hành vi người dùng, kỹ thuật kiểm thử áp dụng và mục tiêu đánh giá hệ thống.
- **Quy trình thực hiện chi tiết từng bước (5 Steps)**: Mô tả tỉ mỉ từ khâu điều hướng màn hình, nhập dữ liệu từng trường, giữ giá trị danh định, nhấn nút hành động đến ghi nhận phản hồi.
- **Kết quả mong đợi 4 chiều đo lường được**:
  - Mã trạng thái phản hồi HTTP (`200 OK`, `201 Created`, `400 Bad Request`, `422 Unprocessable Entity`).
  - Nội dung thông báo trên giao diện (Toast, Banner cảnh báo).
  - Hành vi tương tác giao diện người dùng (Highlight đỏ ô nhập, tự động focus con trỏ).
  - Trạng thái toàn vẹn cơ sở dữ liệu (Ghi nhận thành công hoặc tự động Rollback giao dịch, không tạo bản ghi rác).
- **Tuân thủ nguyên lý Single Fault Assumption (ISTQB)**: Trong mọi ca kiểm thử Negative, chỉ có duy nhất 1 trường mang giá trị không hợp lệ, tất cả các trường còn lại giữ ở giá trị danh định hợp lệ (Nominal Value) để triệt tiêu hiện tượng che giấu lỗi (Defect Masking).

### 2.2. Bóc Tách Ngữ Nghĩa Tham Số & Ràng Buộc Tự Động (NLP Engine)
- Người dùng chỉ cần dán nội dung User Story hoặc tài liệu đặc tả chức năng bằng tiếng Việt.
- Hệ thống tự động trích xuất danh sách tham số, xác định kiểu dữ liệu (`integer`, `float`, `string`, `email`, `phone`, `enum`), khoảng giá trị `[min, max]`, độ dài chuỗi và danh sách giá trị tùy chọn.

### 2.3. Quản Trị Chu Kỳ Agile / Scrum & Tiêu Chuẩn Hoàn Thành (Definition of Done - DoD)
- Quản trị chu kỳ Sprint theo chuẩn khung Agile/Scrum quốc tế.
- Tự động đo lường tỷ lệ hoàn thành Definition of Done (DoD) dựa trên tiến độ kiểm thử và tỷ lệ Pass/Fail của từng chức năng.

### 2.4. Phân Quyền Dự Án 3 Cấp (Role-Based Access Control - RBAC)
- **Cơ chế đăng ký bình đẳng**: Bất kỳ người dùng nào cũng có thể đăng ký tài khoản và tự tạo dự án.
- **Trưởng nhóm (Leader)**: Người tạo dự án mặc định nắm quyền Trưởng nhóm; có toàn quyền phê duyệt thành viên, thăng cấp/hạ cấp và xóa thành viên khỏi dự án.
- **Phó nhóm (Sub-Leader)**: Hỗ trợ Trưởng nhóm quản lý chu kỳ Sprint, điều phối ca kiểm thử.
- **Thành viên (Member)**: Tham gia thực hiện các ca kiểm thử và cập nhật kết quả kiểm định.
- Gia nhập dự án nhanh chóng bằng **Mã Tham Gia Nhóm (Join Code)**.

### 2.5. Lịch Phân Công Nhiệm Vụ (Calendar & Task Allocation)
- Giao diện trực quan theo dõi lịch trình kiểm thử theo ngày.
- Bảng phân công ca kiểm thử cụ thể cho từng thành viên trong nhóm, cập nhật trạng thái tiến độ thời gian thực.

### 2.6. Xuất Bản Báo Cáo Nghiệm Thu 4 Định Dạng
- **Excel (.xlsx)**: Báo cáo chuyên nghiệp 4 Sheet được tự động định dạng và kẻ bảng:
  - Sheet 1: Tổng quan dự án, KPI, tỷ lệ hoàn thành DoD.
  - Sheet 2: Danh sách toàn bộ Test Cases chi tiết (Tiền điều kiện, Các bước thực hiện, Kết quả mong đợi 4 chiều).
  - Sheet 3: Ma trận truy xuất nguồn gốc yêu cầu (Requirements Traceability Matrix - RTM).
  - Sheet 4: Đánh giá chất lượng và nhật ký lỗi phát hiện.
- **CSV**: Tệp bảng tính phẳng phục vụ tích hợp công cụ dữ liệu.
- **JSON**: Cấu trúc dữ liệu RESTful phục vụ tích hợp CI/CD Pipeline.
- **Markdown**: Báo cáo tài liệu kỹ thuật có thể nhúng trực tiếp vào Git Repository.

### 2.7. Trung Tâm Tài Liệu & Kiến Thức Kỹ Thuật Tích Hợp (32 Chuyên Mục)
- Menu cây xổ xuống 2 cấp (Accordion Navigation) chia nhỏ thành 32 bài viết chuyên sâu:
  - Cài đặt & khởi chạy môi trường Node.js / Python.
  - Mạng căn bản: IPv4 vs IPv6, Public vs Private IP, cơ chế 127.0.0.1 vs 0.0.0.0, rào cản CGNAT tại Việt Nam, bảng tra cứu cổng mạng (0 - 65535).
  - Hệ thống tên miền (DNS): Cấu trúc phân cấp, 5 bản ghi cốt lõi (A, CNAME, TXT, MX), cơ chế Cloudflare Đám Mây Cam vs Đám Mây Xám, quy trình trỏ tên miền 3 bước, xóa cache DNS (`flushdns`).
  - Lệnh chẩn đoán mạng thực hành: `ipconfig`, `curl ifconfig.me`, `Test-NetConnection -Port`, `netstat -ano | findstr`, `taskkill /PID /F`, `curl -I`.
  - Khắc phục 6 lỗi mạng kinh điển: `Connection reset / request aborted` (Pterodactyl SFTP Subsystem), `ECONNREFUSED`, `EADDRINUSE`, `502 Bad Gateway`, `CORS Policy`, `ETIMEDOUT`.
  - Hosting Pterodactyl, SFTP quản trị tệp, máy chủ VPS & Cloudflare Tunnel.
  - Quy chuẩn Git Flow và nguyên lý động cơ kiểm thử (BVA, EP, Z3).
- Tích hợp bộ nút chuyển bài Trước / Tiếp theo (Compact Docs Pager) và nút sao chép lệnh 1-Click.

---

## 3. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

### Tầng Máy Chủ & Động Cơ Thuật Toán (Backend)
- **Ngôn ngữ**: Python 3.10+
- **Web Framework**: FastAPI (Bất đồng bộ ASGI, tự động sinh tài liệu Swagger UI & ReDoc)
- **Động cơ Toán học**: Z3 Theorem Prover (Microsoft Research SMT Solver)
- **Cơ sở Dữ liệu**: SQLite cấu hình chế độ WAL (Write-Ahead Logging) cho tốc độ đọc/ghi đồng thời cực cao
- **ORM**: SQLAlchemy 2.0
- **Bảo mật & Mã hóa**: Passlib Bcrypt (Hash 12 rounds), JSON Web Token (JWT)
- **Xuất bản Dữ liệu**: OpenPyXL (Tạo bảng tính Excel đa tầng)

### Tầng Giao Diện Người Dùng (Frontend)
- **Framework**: React 18
- **Công cụ Biên dịch**: Vite 5 (Thời gian build siêu tốc < 300ms)
- **Hệ thống Tạo kiểu (CSS)**: Vanilla CSS với Design Tokens đồng bộ, hỗ trợ Chế độ Sáng / Tối (Light/Dark Mode)
- **Typography**: Phông chữ chính **Times New Roman** (chuẩn mực học thuật, êm dịu cho mắt khi đọc tài liệu dài), kết hợp **JetBrains Mono** cho khối lệnh terminal và mã nguồn
- **Hệ thống Icon**: 100% SVG Icons chuẩn mực (không dùng Unicode Emoji theo quy định AGENTS.md)
- **Thanh cuộn**: Custom Slim Scrollbar siêu mỏng 5px bo góc hiện đại

---

## 4. CẤU TRÚC THƯ MỤC MONOREPO

Dự án được tổ chức theo chuẩn kiến trúc Monorepo quốc tế sạch sẽ và độc lập:

```text
cdio4-testcase-generator/
├── backend/                   # Tầng máy chủ & Động cơ thuật toán (Python FastAPI)
│   ├── engine/                # Các bộ sinh kiểm thử: Z3 Solver, BVA, Equivalence, Pairwise, Synthesizer
│   │   ├── assembler.py       # Lắp ráp kịch bản kiểm thử hoàn chỉnh
│   │   ├── bva.py             # Động cơ phân tích giá trị biên
│   │   ├── constraint_solver.py # Bộ giải ràng buộc Z3 SMT
│   │   ├── equivalence.py     # Động cơ phân vùng tương đương
│   │   ├── pairwise.py        # Động cơ tổ hợp trực giao All-Pairs
│   │   ├── parser.py          # Bóc tách tham số từ văn bản yêu cầu
│   │   └── semantic_synthesizer.py # Tổng hợp dữ liệu thực tế chuẩn Việt Nam
│   ├── routers/               # Bộ định tuyến API RESTful
│   │   ├── auth.py            # Xác thực người dùng & Hồ sơ cá nhân
│   │   ├── projects.py        # Quản trị dự án & RBAC 3 cấp
│   │   ├── sprints.py         # Quản trị chu kỳ Scrum & Tiêu chuẩn DoD
│   │   ├── requirements.py    # Quản lý yêu cầu chức năng
│   │   ├── generate.py        # Kích hoạt sinh test case
│   │   └── export.py          # Xuất báo cáo Excel, CSV, JSON, Markdown
│   ├── database.py            # Cấu hình ORM SQLAlchemy & SQLite WAL
│   ├── models.py              # Schema cơ sở dữ liệu
│   ├── schemas.py             # Pydantic Schemas xác thực dữ liệu vào/ra
│   ├── main.py                # Điểm khởi chạy ứng dụng FastAPI & Middleware
│   ├── requirements.txt       # Danh sách thư viện phụ thuộc Python
│   └── .env.example           # Cấu hình mẫu môi trường
├── frontend/                  # Tầng giao diện người dùng (React + Vite)
│   ├── src/
│   │   ├── components/        # Các thành phần giao diện (Studio, Scrum, Lịch, Tài liệu, Modal)
│   │   ├── data/              # Dữ liệu dự án mẫu E-Commerce
│   │   ├── icons/             # Thư viện SVG Icons tái sử dụng (không emoji)
│   │   ├── App.jsx            # Thành phần điều phối ứng dụng chính
│   │   ├── api.js             # Client Axios giao tiếp Backend
│   │   ├── index.css          # Design System, Design Tokens & Custom Scrollbars
│   │   └── main.jsx           # Điểm gắn kết React DOM
│   ├── package.json           # Quản lý thư viện phụ thuộc Frontend
│   └── vite.config.js         # Cấu hình Vite Dev Server & Build
├── docs/                      # Tài liệu kỹ thuật, hướng dẫn & khảo sát
│   ├── HUONG_DAN_CAI_DAT_VA_KHOI_CHAY.md
│   ├── HUONG_DAN_GIT_QUY_TRINH_PHAT_TRIEN.md
│   ├── HUONG_DAN_DOCKER_VA_CLOUDFLARE_TUNNEL.md
│   ├── HUONG_DAN_HOSTING_PTERODACTYL_PIKAMC.md
│   ├── HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md
│   ├── HUONG_DAN_KIEM_THU_CHO_TEAM.md
│   ├── KIEN_THUC_MANG_DNS_SERVER_HOSTING.md
│   └── KHAO_SAT_HE_THONG_SINH_TEST_CASE.md
├── api-collections/           # Bộ sưu tập API thử nghiệm sẵn có
│   ├── postman/               # Collection & Environment JSON cho Postman
│   ├── bruno/                 # Bộ request hoàn chỉnh cho Bruno API Client
│   └── openapi.json           # Đặc tả OpenAPI chuẩn RESTful
├── reports/                   # Mẫu báo cáo nghiệm thu Excel đã xuất bản
│   └── Ket_Qua_Kiem_Thu_CDIO4.xlsx
├── package.json               # Điều phối toàn bộ Monorepo tại thư mục gốc
├── dev.js                     # Kịch bản chạy song song Backend & Frontend (Zero-dependency)
├── cai_dat.bat                # Kịch bản cài đặt tự động 1-Click trên Windows
├── chay_he_thong.bat          # Kịch bản khởi chạy hệ thống 1-Click
├── kiem_tra_he_thong.bat      # Kịch bản chạy kiểm thử tự động 18 bước
├── run_system_test.py         # Bộ kiểm thử tích hợp tự động toàn diện
├── migrate_db.py              # Script nạp dữ liệu mẫu Scrum dự án E-Commerce
├── .gitignore                 # Loại trừ file rác, database và bảo mật
├── TASK_MEMORY.md             # Bộ nhớ trạng thái & Checkpoint dự án chống crash (Điều 8)
├── AGENTS.md                  # Quy chuẩn và nguyên tắc phát triển dự án
└── README.md                  # Tài liệu hướng dẫn này
```

---

## 5. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY (QUICK START)

### Yêu Cầu Tiên Quyết
- **Node.js**: Phiên bản 18.x hoặc 20.x LTS trở lên.
- **Python**: Phiên bản 3.10, 3.11 hoặc 3.12 (Khi cài đặt trên Windows, bắt buộc phải tích chọn ô **"Add Python to PATH"**).
- **Git**: Đã cài đặt trên máy.

### Cách 1: Khởi Chạy Nhanh Bằng Kịch Bản 1-Click (Dành cho Windows)
1. **Cài đặt thư viện phụ thuộc**:
   Nhấp đúp chuột vào tệp `cai_dat.bat` hoặc mở Terminal chạy:
   ```cmd
   cai_dat.bat
   ```
2. **Khởi chạy hệ thống**:
   Nhấp đúp chuột vào tệp `chay_he_thong.bat` hoặc chạy:
   ```cmd
   chay_he_thong.bat
   ```
   Hệ thống sẽ đồng thời kích hoạt Backend tại cổng `8000` và Frontend tại cổng `5173`.

### Cách 2: Khởi Chạy Bằng Lệnh Monorepo (Windows / macOS / Linux)
1. **Cài đặt toàn bộ thư viện (Cả Backend & Frontend)**:
   ```bash
   npm run install:all
   ```
2. **Khởi chạy đồng thời Backend FastAPI và Frontend Vite**:
   ```bash
   npm run dev
   ```
3. Mở trình duyệt truy cập: **`http://localhost:5173`**
   - Tài liệu Swagger API Backend có sẵn tại: **`http://localhost:8000/docs`**

---

## 6. TÀI KHOẢN MẪU & DỮ LIỆU ĐỒ ÁN TRẢI NGHIỆM

Hệ thống đã tích hợp sẵn dữ liệu mẫu dự án E-Commerce phục vụ kiểm tra và chấm điểm đồ án:

| Tài khoản | Mật khẩu | Họ và tên | Vai trò trong hệ thống |
| :--- | :--- | :--- | :--- |
| **`qalead`** | `123456` | Trần Minh (QA Lead) | Trưởng nhóm dự án |
| **`tester01`** | `123456` | Lê Hoa (Tester) | Thành viên dự án |

*Ghi chú: Người dùng có thể nhấn nút "Đăng Ký" trên thanh điều hướng để tạo thêm tài khoản mới bất kỳ lúc nào.*

### Nạp Lại Dữ Liệu Dự Án Mẫu (Reset / Re-seed Data)
Nếu muốn nạp lại dữ liệu mẫu chuẩn gồm 3 Chức năng, 2 Sprint và 142 Test Cases đạt 92.3% Pass:
```bash
python migrate_db.py
```

---

## 7. KIỂM THỬ TÍCH HỢP TỰ ĐỘNG (SYSTEM TEST SUITE)

Dự án sở hữu bộ kiểm thử tích hợp đầu-cuối (End-to-End Integration Test) độc lập gồm **18 bước tự động hóa**, kiểm tra toàn diện tất cả các phân hệ:
```bash
npm test
# hoặc chạy trực tiếp bằng python:
python run_system_test.py
```

**Các phân hệ được kiểm định tự động**:
1. Đăng ký tài khoản người dùng bình đẳng (Auth Register).
2. Đăng nhập và xác thực cấp Token JWT.
3. Cập nhật hồ sơ người dùng cá nhân (Profile Update).
4. Thay đổi mật khẩu an toàn và kiểm tra tái đăng nhập với mật khẩu mới.
5. Tạo dự án mới và tự động gán quyền Trưởng nhóm (Leader).
6. Trưởng nhóm thêm thành viên mới vào dự án qua mã định danh.
7. Trưởng nhóm thăng cấp thành viên thành Phó nhóm (Sub-Leader).
8. Nạp dự án mẫu E-Commerce (User Stories, Sprints, Test Suites).
9. Kiểm tra danh sách và tạo chu kỳ Sprint mới.
10. Bóc tách tham số ngữ nghĩa từ yêu cầu chức năng (Parse Engine).
11. Sinh ca kiểm thử bằng thuật toán BVA, Equivalence Partitioning và Pairwise.
12. Sinh ca kiểm thử với ràng buộc hình thức phức tạp bằng Microsoft Z3 Solver.
13. Sinh ca kiểm thử kiểu danh mục liệt kê (Enum Values).
14. Cập nhật kết quả kiểm thử thực tế (Đánh dấu Pass / Fail ca test).
15. Xuất bản báo cáo dự án định dạng Excel (.xlsx 4 Sheets).
16. Xuất bản báo cáo bảng tính phẳng CSV.
17. Xuất bản báo cáo cấu trúc dữ liệu JSON.
18. Xuất bản báo cáo kỹ thuật định dạng Markdown.

---

## 8. QUY CHUẨN PHÁT TRIỂN & CHỐNG SỰ CỐ (AGENTS.MD & TASK_MEMORY.MD)

Dự án áp dụng các nguyên tắc kỹ thuật nghiêm ngặt được quy định tại [AGENTS.md](AGENTS.md):
- **Tuyệt đối không dùng Unicode Emoji**: Toàn bộ giao diện, thông báo lỗi, log hệ thống và dữ liệu xuất bản chỉ sử dụng SVG Icons chuẩn mực.
- **Tiếng Việt có dấu chuẩn xác 100%**: Áp dụng từ nhãn giao diện, kịch bản kiểm thử, đến cấu trúc báo cáo xuất ra.
- **Quy chuẩn Checkpoint chống sự cố (TASK_MEMORY.md)**: Mọi thao tác phát triển đều tuân thủ quy trình 3 bước (Đọc trước - Ghi Checkpoint trước khi sửa - Cập nhật hoàn tất sau khi kiểm thử) để triệt tiêu nguy cơ đứt gãy tiến độ khi gặp sự cố crash hoặc gián đoạn phiên làm việc.

---

## 9. GIẤY PHÉP & TÁC GIẢ

- **Đồ án môn học**: CDIO-4 — Chuyên ngành Kỹ thuật Phần mềm / Công nghệ Thông tin.
- **Kho lưu trữ GitHub**: [https://github.com/kha0305/cdio4-testcase-generator](https://github.com/kha0305/cdio4-testcase-generator)
- **Giấy phép**: MIT License.
