# NGUYÊN TẮC VÀ QUY CHUẨN PHÁT TRIỂN DỰ ÁN (PROJECT RULES)

Tài liệu này định nghĩa các quy tắc bắt buộc áp dụng trong toàn bộ quá trình phát triển hệ thống tự động sinh Test Case (CDIO-4). Mọi agent, lập trình viên và thành viên dự án phải tuân thủ nghiêm ngặt.

---

## 1. QUY TẮC BIỂU TƯỢNG: TUYỆT ĐỐI KHÔNG DÙNG EMOJI (STRICTLY NO EMOJIS)

- **Cấm hoàn toàn**: Không dùng bất kỳ emoji Unicode nào (ví dụ: 🚀, 💡, ⚠️, ❌, ✅, 📌, 🎯, v.v.) trong:
  - Giao diện người dùng (UI components, text, buttons, alerts, badges, tooltips).
  - Thông báo hệ thống (Toast, Modal, Console log, Error messages).
  - Dữ liệu Test Case xuất ra (Excel, CSV, JSON, Markdown preview).
- **Quy chuẩn thay thế**: Chỉ sử dụng **SVG Icons**:
  - Dùng icon SVG tối giản, chuẩn mực (khuyến nghị: **Lucide Icons** hoặc **Heroicons** SVG).
  - Định dạng: Inline SVG hoặc Component icon tái sử dụng.
  - Thuộc tính chuẩn: `stroke-width="1.5"` hoặc `"2"`, kích thước đồng bộ (16px, 20px, 24px), màu sắc kế thừa `currentColor`.

---

## 2. QUY TẮC THIẾT KẾ GIAO DIỆN (UI DESIGN SYSTEM)

- **Phong cách chủ đạo**: Tối giản, chuyên nghiệp, chuẩn công cụ kỹ thuật phần mềm (Linear / GitHub / Vercel style).
- **Bố cục rõ ràng, tinh gọn**:
  - Không trang trí rườm rà, không hiệu ứng lóa mắt, không đổ màu gradient sặc sỡ.
  - Tập trung tối đa vào luồng thao tác: **Nhập yêu cầu $\rightarrow$ Xem bảng bóc tách tham số $\rightarrow$ Xem bảng Test Case $\rightarrow$ Xuất file**.
- **Bảng màu trung tính (Neutral Palette)**:
  - Nền: Trắng / Xám nhạt (`#F8FAFC`, `#FFFFFF`) hoặc Dark mode chuyên nghiệp (`#0F172A`, `#1E293B`).
  - Màu nhấn (Accent): Xanh dương kỹ thuật (`#2563EB` / `#3B82F6`) hoặc Xanh đậm trung tính.
  - Trạng thái: Thành công (`#16A34A`), Cảnh báo (`#D97706`), Lỗi (`#DC2626`).
- **Typography**:
  - Font chữ giao diện chính toàn dự án: **Times New Roman** (kết hợp các font dự phòng `Times`, `Tinos`, `Cambria`, `Georgia`, `serif`). Chuẩn mực học thuật, êm dịu cho mắt, không gây chói/mỏi mắt khi đọc đặc tả và tài liệu dài.
  - Font chữ mã nguồn / lệnh terminal / dữ liệu kỹ thuật: **JetBrains Mono**, **Fira Code** hoặc **Consolas** (monospace).

---

## 3. QUY TẮC CSS & TRÁNH LỖI GIAO DIỆN (ROBUST, BUG-FREE CSS)

- **Reset & Box Model**:
  - Luôn sử dụng `box-sizing: border-box` trên toàn bộ phần tử.
  - Không để xảy ra vỡ khung (layout breaking), chữ tràn viền (text overflow), hoặc lỗi thanh cuộn kép (double scrollbar).
- **Layout linh hoạt**:
  - Sử dụng CSS Flexbox và CSS Grid làm tiêu chuẩn cho cấu trúc layout.
  - Bảng dữ liệu (Data Table) phải hỗ trợ scroll ngang mượt mà khi có nhiều cột, cố định tiêu đề cột (sticky header) khi xem danh sách test case dài.
- **Biến CSS chuẩn hóa (Design Tokens)**:
  - Toàn bộ khoảng cách (`spacing`), bán kính bo góc (`border-radius`), mã màu (`color`), và đổ bóng (`box-shadow`) phải được quản lý qua biến CSS hoặc bộ class tiện ích đồng nhất.
- **Tính ổn định & Kiểm thử hiển thị**:
  - Đảm bảo hiển thị chính xác trên các độ phân giải màn hình phổ biến từ laptop (1366x768, 1920x1080).
  - Không dùng các thuộc tính CSS thử nghiệm chưa ổn định.

---

## 4. QUY CHUẨN XUẤT BẢN & MÃ NGUỒN

- **Mã nguồn rõ ràng**: Tách bạch mạch lạc giữa:
  - Tầng giao diện (Frontend UI)
  - Tầng bóc tách ngữ nghĩa (NLP & Parsing Engine)
  - Tầng giải ràng buộc & sinh kiểm thử (Z3 / BVA / Pairwise Engine)
  - Tầng lưu trữ & dữ liệu (Database / Repositories)
- **Tập tin xuất ra**:
  - Template Excel xuất ra phải đúng tiêu chuẩn kiểm thử chuyên nghiệp (cột tiêu đề rõ ràng, căn lề chuẩn, font chữ Arial/Segoe UI 10-11pt, không có icon rác).

---

## 5. QUY TẮC NGÔN NGỮ: BẮT BUỘC TIẾNG VIỆT CÓ DẤU CHUẨN MỰC (STRICTLY ACCENTED VIETNAMESE)

- **Bắt buộc 100% tiếng Việt có dấu đầy đủ và chuẩn xác**:
  - **Giao diện người dùng (UI)**: Mọi tiêu đề, nhãn (labels), nút bấm (buttons), gợi ý (placeholders), hướng dẫn (instructions), thông báo hệ thống (alerts, toasts, modals), trạng thái đều phải viết bằng tiếng Việt có dấu chuẩn mực, rõ ràng, đúng chính tả và ngữ pháp.
  - **Dữ liệu Test Case sinh ra**:
    - Tên kịch bản kiểm thử (Scenario).
    - Tiền điều kiện (Preconditions).
    - Các bước thực hiện (Test Steps).
    - Dữ liệu đầu vào (Input Data / Test Data).
    - Kết quả mong đợi (Expected Result).
    - Kết quả thực tế (Actual Result).
    - Đánh giá chất lượng và ghi chú lỗi (Verdict, Defect Log).
  - **Tập tin xuất ra (Excel, CSV, JSON, Markdown)**: Toàn bộ nội dung báo cáo tổng kết, bảng dữ liệu test case, tiêu đề các cột, sheet name đều phải có dấu tiếng Việt đầy đủ và chuyên nghiệp.
  - **Tuyệt đối cấm viết tiếng Việt không dấu**: Cấm viết tắt cẩu thả hoặc không dấu (ví dụ: cấm viết "Kiem tra do tuoi", "Ket qua mong doi", "Hop le", "Khong hop le", mà phải luôn viết chuẩn: "Kiểm tra độ tuổi", "Kết quả mong đợi", "Hợp lệ", "Không hợp lệ").
  - **Thuật ngữ chuyên ngành**: Có thể giữ nguyên hoặc chú thích song ngữ cho các thuật ngữ quốc tế chuẩn của kiểm thử phần mềm (ví dụ: *BVA, Equivalence Partitioning, Pairwise, Boundary, Positive, Negative, Pass, Fail*), nhưng toàn bộ câu mô tả, giải thích và ngữ cảnh đi kèm bắt buộc phải là tiếng Việt có dấu.

---

## 6. QUY TẮC BẮT BUỘC VỀ BỐ CỤC VÀ GIAO DIỆN (STRICT UI/UX LAYOUT RULES)

Để đảm bảo hệ thống luôn chuẩn mực, gọn gàng, chuyên nghiệp như các công cụ kỹ thuật hiện đại (Linear / GitHub / Vercel), mọi lập trình viên và agent phải tuân thủ nghiêm ngặt các quy tắc giao diện sau:

### 6.1. Quy chuẩn Modal & Hộp thoại nổi (Dialog / Modal System)
- **Cấu trúc 3 tầng bắt buộc**:
  - `modal-header` (hoặc `modal__header`): Tiêu đề, icon và nút đóng.
  - `modal-body` (hoặc `modal__body`): Toàn bộ nội dung thao tác chính, có thanh cuộn độc lập khi nội dung dài (`overflow-y: auto`).
  - `modal-footer` (hoặc `modal__footer`): Các nút hành động hoàn tất, lưu, hủy hoặc đăng xuất.
- **Vị trí nút đóng (`×` / Close Button)**:
  - **BẮT BUỘC** nằm ở góc trên cùng bên phải của `modal-header`.
  - Căn chỉnh flexbox `display: flex; justify-content: space-between; align-items: center;`.
  - **Tuyệt đối cấm**: Không để nút đóng bị rớt dòng xuống dưới avatar, chui vào thanh tab hoặc nằm lệch sang các thành phần khác.
- **Lớp nền mờ (Backdrop & Shadow)**:
  - Backdrop chuẩn: `background: rgba(15, 23, 42, 0.65)` kết hợp `backdrop-filter: blur(4px)`.
  - Modal luôn căn giữa tuyệt đối (`inset: 0; display: flex; align-items: center; justify-content: center`).
  - Đổ bóng sâu đa tầng (`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.25)`), bo góc mềm mại `border-radius: var(--radius-lg)`.

### 6.2. Quy chuẩn Form & Trường nhập liệu (Form Controls vs Table Inputs)
- **Phân định rạch ròi 2 loại input**:
  - `.form-input`: Dành riêng cho biểu mẫu, modal, trang cài đặt hồ sơ. Chiều cao tiêu chuẩn 38px - 40px, padding ngang 12px, bo góc `var(--radius-md)`, viền rõ nét `1px solid var(--color-border-strong)`. Focus state phải có viền xanh accent và vòng sáng `box-shadow: 0 0 0 3px var(--color-accent-light)`.
  - `.table-input`: Chỉ dùng cho việc chỉnh sửa nhanh dữ liệu dạng dòng/cột bên trong bảng tính dữ liệu (inline table editing). Cấm dùng `.table-input` làm ô nhập form trong modal.
- **Cấu trúc nhóm trường nhập**:
  - Mỗi trường nhập phải bọc trong `.form-group` có khoảng cách dưới `margin-bottom: var(--space-4)`.
  - Nhãn `.form-label` viết bằng tiếng Việt rõ ràng, in đậm nhẹ, nằm phía trên ô input.

### 6.3. Quy chuẩn Thanh điều hướng đỉnh cao (Top Navigation Bar)
- Chiều cao cố định ~58px, dính cố định đỉnh màn hình (`position: sticky; top: 0; z-index: 100`).
- Phân chia bố cục 3 khu vực cân xứng:
  - **Trái**: Logo thương hiệu + Bộ chọn dự án nhanh (tên dự án & mã code) + Nút Thành viên kèm Badge phân quyền 3 cấp.
  - **Giữa**: Segmented Nav Tabs chuyển đổi 4 phân hệ chính (`Studio`, `Scrum`, `Lịch Phân Công`, `Báo Cáo`). Tab đang chọn phải nổi bật rõ rệt.
  - **Phải**: Hướng dẫn, Đổi giao diện Sáng/Tối, và Khu vực người dùng.
- **Nút Đăng Xuất (Logout)**:
  - Bắt buộc phải có chữ "Đăng Xuất" và màu nhận diện nguy hiểm (`var(--color-error)`), hiển thị rõ ràng, dễ bấm, không được thu nhỏ hoặc giấu vào các icon mờ nhạt.

### 6.4. Quy chuẩn Màu sắc & Tính tương thích Theme (Theme Consistency)
- 100% màu nền, màu chữ, viền và đổ bóng phải dùng biến CSS Design Tokens (`--color-bg-primary`, `--color-bg-secondary`, `--color-text-primary`, `--color-border`).
- **Tuyệt đối cấm hardcode mã màu tĩnh** (như `#FFFFFF` hay `#000000`) trên các vùng chứa lớn, để đảm bảo giao diện hiển thị hoàn hảo ở cả Chế độ Sáng và Chế độ Tối.

---

## 7. QUY CHUẨN KỸ THUẬT KIỂM THỬ CHUYÊN NGHIỆP — CHUẨN QA ENGINEER (ANTI-VIBE CODER RULES)

Để đảm bảo hệ thống sinh ca kiểm thử đạt chất lượng như một **Senior QA Lead / Test Architect** 10 năm kinh nghiệm thiết kế, tuyệt đối không được sinh dữ liệu theo kiểu "vibe coder" (cẩu thả, máy móc, dữ liệu rác vô nghĩa). Toàn bộ động cơ kiểm thử (Engine) và dữ liệu xuất ra phải tuân thủ nghiêm ngặt 6 điều luật sau:

### 7.1. Cấm Tuyệt Đối Dữ Liệu Rác & Dữ Liệu Giả Cẩu Thả (No Dummy / Lazy Test Data)
- **Tuyệt đối cấm**:
  - Không dùng các chuỗi vô nghĩa: `"test_value"`, `"a" * length`, `"aaaaaaa"`, `"string"`, `"abc"`, `"(chuỗi 14 ký tự)"`, `"foo"`, `"bar"`.
  - Không dùng các giá trị số phi thực tế khi không có ngữ cảnh (ví dụ: tuổi âm 500, giá tiền vô nghĩa).
- **Quy chuẩn bắt buộc (Context-Aware Test Data Synthesizer)**:
  - Dữ liệu thử nghiệm phải nhận diện ngữ cảnh của tên tham số để sinh giá trị thực tế:
    - **Họ và tên**: Dùng tên người Việt chuẩn (`"Nguyễn Văn An"`, `"Trần Thị Mai"`).
    - **Email**: Dùng email thực tế (`"nguyenvanan.tester@gmail.com"`); ca negative dùng lỗi định dạng thực tế (`"an.nguyen@"`, `"an.nguyen@domain..com"`, thiếu ký tự `@`).
    - **Mật khẩu**: Dùng mật khẩu thực tế (`"MatKhauAnToan@2026"`); ca negative thử thiếu chữ hoa (`"matkhau123"`), thiếu số (`"MatKhauDai"`), quá ngắn (`"123"`).
    - **Số điện thoại**: Dùng đầu số viễn thông Việt Nam hợp lệ (`"0912345678"`, `"0987654321"`); ca negative thử 9 chữ số, 11 chữ số, chứa chữ cái.
    - **Địa chỉ**: Tên đường, quận, thành phố Việt Nam (`"Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"`).
    - **Số tiền / Giá cả**: Tiền tệ VNĐ thực tế (`150000`, `2500000`, `50000000`); ca negative thử `0`, số âm, hoặc vượt hạn mức.
    - **Mã khuyến mãi / Voucher**: Chuỗi mã thực tế (`"GIAM2026"`, `"FREESHIP50K"`).
    - **Mã OTP**: Chuỗi 6 chữ số ngẫu nhiên (`"849201"`).
    - **Ngày tháng**: Định dạng ISO chuẩn `YYYY-MM-DD` hoặc `DD/MM/YYYY`.

### 7.2. Cấu Trúc Mã Ca Kiểm Thử Phân Cấp Chuẩn ISO/IEC/IEEE 29119 (Hierarchical Test Case ID)
- **Cấm**: Đặt mã ca kiểm thử chung chung vô danh như `TC_001`, `TC_002` không rõ phân hệ.
- **Quy chuẩn bắt buộc**: Mã Test Case phải phân cấp theo cấu trúc:
  ```text
  TC_[MÃ_MODULE]_[KỸ_THUẬT]_[SỐ_THỨ_TỰ]
  ```
  *Ví dụ:* `TC_AUTH_BVA_001`, `TC_AUTH_EP_008`, `TC_CART_BVA_015`, `TC_PAY_PW_004`, `TC_ORDER_Z3_002`.

### 7.3. Kịch Bản Kiểm Thử Có Ngữ Cảnh Nghiệp Vụ Sâu Sắc (Business-Driven Scenarios)
- **Cấm**: Mô tả ngắn ngủn, máy móc như `[BVA] Age = 17`, `[EP] VEC_1: valid`.
- **Quy chuẩn bắt buộc**: Phải nêu rõ:
  - Phân loại ca kiểm thử: `[Biên Dưới - Negative]`, `[Biên Trên - Positive]`, `[Phân Vùng Hợp Lệ]`, `[Tổ Hợp Pairwise]`.
  - Hành vi người dùng và mục tiêu kiểm thử nghiệp vụ:
    *Ví dụ chuẩn:* `[Biên Dưới - Negative] Kiểm tra hệ thống từ chối đăng ký và báo lỗi khi người dùng nhập Tuổi = 17 (dưới độ tuổi lao động tối thiểu quy định là 18 tuổi).`

### 7.4. Các Bước Thực Hiện Chi Tiết Từng Hành Động (Actionable Step-by-Step Test Steps)
- **Cấm**: Viết cụt lủn `1. Nhập a = ... 2. Bấm xác nhận`.
- **Quy chuẩn bắt buộc**: Phải mô tả quy trình thao tác như một kiểm thử viên thủ công thực hiện trên màn hình:
  - Bước 1: Điều hướng đến màn hình chức năng tương ứng (ví dụ: màn hình Đăng ký, Giỏ hàng, Thanh toán).
  - Bước 2: Điền dữ liệu thử nghiệm cụ thể vào từng trường (nêu rõ giá trị của từng trường).
  - Bước 3: Giữ các trường còn lại ở giá trị danh định hợp lệ (Nominal Values).
  - Bước 4: Nhấp vào nút hành động chính (ví dụ: "Đăng Ký Tài Khoản", "Áp Dụng Mã", "Thanh Toán Đơn Hàng").
  - Bước 5: Quan sát và ghi nhận phản hồi của hệ thống (thông báo, mã trạng thái, hành vi giao diện).

### 7.5. Kết Quả Mong Đợi Đa Chiều & Đo Lường Được (Measurable Multi-Faceted Expected Results)
- **Cấm**: Viết chung chung `Hệ thống xử lý thành công` hoặc `Hệ thống từ chối`.
- **Quy chuẩn bắt buộc**: Phải mô tả đầy đủ 4 khía cạnh kỹ thuật:
  - **Mã phản hồi HTTP**: Trả về `200 OK` / `201 Created` (cho ca hợp lệ) hoặc `400 Bad Request` / `422 Unprocessable Entity` (cho ca lỗi).
  - **Thông báo giao diện người dùng**: Câu thông báo lỗi hoặc thành công cụ thể, màu sắc hiển thị (xanh lá / đỏ cảnh báo), vị trí hiển thị (Toast / Banner / Inline dưới trường nhập).
  - **Hành vi tương tác UI**: Con trỏ chuột tự động focus vào trường nhập lỗi, viền ô nhập đổi màu đỏ (highlight).
  - **Trạng thái lưu trữ dữ liệu**: Dữ liệu được ghi nhận chính xác vào cơ sở dữ liệu (với ca thành công) hoặc giao dịch bị rollback, tuyệt đối không tạo bản ghi rác trong cơ sở dữ liệu (với ca thất bại).

### 7.6. Tuân Thủ Tuyệt Đối Nguyên Lý Single Fault Assumption (ISTQB Standard)
- Trong mọi ca kiểm thử Negative (BVA hoặc EP): **Chỉ được phép có duy nhất 1 trường mang giá trị không hợp lệ**, tất cả các trường còn lại bắt buộc phải mang giá trị hợp lệ danh định (Nominal). Tuyệt đối không kết hợp nhiều lỗi trong cùng một ca test làm xảy ra hiện tượng che giấu lỗi (Defect Masking).

---

## 8. QUY CHUẨN ĐỒNG BỘ TRẠNG THÁI & GHI NHẬP BỘ NHỚ PHÒNG NGỪA SỰ CỐ (CRASH-RESILIENT MEMORY LOG & EXECUTION CHECKPOINT)

Để bảo đảm toàn vẹn tiến độ dự án, triệt tiêu nguy cơ mất ngữ cảnh hoặc đứt gãy nhiệm vụ khi hệ thống gặp sự cố bất ngờ (crash, treo ứng dụng, mất kết nối, lỗi timeout, hoặc người dùng mở phiên làm việc mới), toàn bộ Agent và lập trình viên phải thực hiện nghiêm ngặt quy trình **Ghi Trước - Đọc Trước - Hành Động Sau**:

### 8.1. Tập Tin Bộ Nhớ Dự Án Cố Định (`TASK_MEMORY.md`)
- Mọi dữ liệu trạng thái tiến độ, nhật ký thay đổi và kế hoạch hành động phải được lưu trữ tập trung tại tập tin:
  ```text
  d:/Do-an/CDIO-4/code/TASK_MEMORY.md
  ```
- Tập tin này đóng vai trò là "Black Box / Bộ Nhớ Trạng Thái" duy nhất của dự án. Mọi thay đổi kiến trúc, trạng thái lỗi, hay kết quả kiểm thử đều phải được phản ánh tại đây.

### 8.2. Quy Trình 3 Bước Bắt Buộc (Read-Before-Action & Checkpoint-Before-Execution Protocol)
Mỗi khi bắt đầu hoặc chuyển tiếp một nhiệm vụ, Agent/Lập trình viên bắt buộc phải thực thi tuần tự 3 bước sau:

1. **Bước 1 — Đọc Bộ Nhớ Ngay Khi Nhận Yêu Cầu (Read Memory First)**:
   - Trước khi đưa ra bất kỳ phản hồi hay chỉnh sửa code nào, **bắt buộc phải đọc `TASK_MEMORY.md`** để phục hồi ngữ cảnh:
     - Nắm rõ công việc gần nhất đã hoàn tất đến bước nào.
     - Biết chính xác các tập tin đang can thiệp dở dang và những lỗi/rủi ro chưa xử lý.
     - Tránh làm lại những việc đã xong hoặc đi chệch khỏi hướng đi đã thống nhất.

2. **Bước 2 — Ghi Checkpoint Trước Khi Thực Thi (Pre-Execution Checkpoint)**:
   - Trước khi sửa đổi tập tin nguồn, chạy migration cơ sở dữ liệu, hoặc chạy các lệnh nặng:
     - Phải cập nhật ngay vào `TASK_MEMORY.md`:
       - **Mục tiêu thao tác (Task Goal)**: Cần làm gì, giải quyết vấn đề gì.
       - **Danh sách tập tin can thiệp (Target Files)**: Đường dẫn tuyệt đối của các file sắp sửa đổi.
       - **Kế hoạch thực thi (Step-by-Step Plan)**: Các bước dự kiến triển khai.
       - **Trạng thái ghi nhận**: Đặt nhãn `[DANG THUC HIEN] / [IN PROGRESS]`.
   - Cơ chế này đảm bảo: Nếu ứng dụng hoặc môi trường bị crash ngay giữa chừng, phiên làm việc sau chỉ cần mở `TASK_MEMORY.md` là biết ngay đang dừng ở bước nào để làm tiếp mà không sợ đứt gãy.

3. **Bước 3 — Xác Nhận & Cập Nhật Sau Khi Hoàn Thành (Post-Execution Checkpoint)**:
   - Ngay sau khi thao tác xong và xác minh (chạy test, build thành công):
     - Cập nhật lại `TASK_MEMORY.md` sang trạng thái `[HOAN TAT] / [COMPLETED]`.
     - Ghi nhận kết quả kiểm thử (Test Results), bằng chứng đạt chuẩn (100% Pass, không lỗi syntax/lint).
     - Xác định bước hành động tiếp theo (Next Action Items) để sẵn sàng cho yêu cầu kế tiếp.

### 8.3. Tiêu Chuẩn Trình Bày Trong `TASK_MEMORY.md`
- Tuân thủ 100% tiếng Việt có dấu chuẩn mực, rõ ràng, không dùng Unicode Emoji.
- Định dạng Markdown khoa học: Có bảng trạng thái phân hệ, mốc thời gian cập nhật (Timestamp), liên kết tập tin đầy đủ dạng `file:///...`.
- Lưu giữ lịch sử các mốc quan trọng (Milestones), không được xóa trắng nhật ký trước đó.

---

## 9. QUY CHUẨN TỔ CHỨC CẤU TRÚC THƯ MỤC CHUẨN QUỐC TẾ (STANDARD PROJECT ARCHITECTURE & DIRECTORY LAYOUT)

Để đảm bảo dự án đáp ứng tiêu chuẩn kỹ thuật phần mềm quốc tế, dễ mở rộng, bảo trì và tích hợp CI/CD tự động, cấu trúc Monorepo phải tuân thủ nghiêm ngặt mô hình phân tầng sau:

```text
code/
├── backend/                   # Tầng máy chủ & Động cơ thuật toán (Python FastAPI)
│   ├── engine/                # Động cơ giải ràng buộc (Z3), BVA, Equivalence, Pairwise, Synthesizer
│   ├── routers/               # Bộ định tuyến API RESTful (auth, projects, sprints, generate, export)
│   ├── database.py            # Cấu hình ORM SQLAlchemy & SQLite WAL
│   ├── models.py              # Schema cơ sở dữ liệu
│   ├── schemas.py             # Pydantic Schemas xác thực I/O
│   ├── main.py                # Điểm khởi chạy FastAPI & Middleware
│   ├── requirements.txt       # Danh sách gói phụ thuộc Python
│   └── Dockerfile             # Container hóa Backend siêu nhẹ
├── frontend/                  # Tầng giao diện người dùng (React + Vite)
│   ├── src/                   # Mã nguồn giao diện (components, data, icons, css)
│   ├── package.json           # Quản lý phụ thuộc Frontend
│   ├── vite.config.js         # Cấu hình biên dịch Vite
│   └── Dockerfile             # Multi-stage build Nginx Alpine
├── docs/                      # Tài liệu kỹ thuật, kiến trúc & khảo sát
│   ├── HUONG_DAN_GIT_QUY_TRINH_PHAT_TRIEN.md
│   ├── HUONG_DAN_HOSTING_PTERODACTYL_PIKAMC.md
│   ├── HUONG_DAN_SFTP_QUAN_TRI_TEP_TIN.md
│   ├── HUONG_DAN_DOCKER_VA_CLOUDFLARE_TUNNEL.md
│   ├── HUONG_DAN_KIEM_THU_CHO_TEAM.md
│   └── KHAO_SAT_HE_THONG_SINH_TEST_CASE.md
├── api-collections/           # Bộ sưu tập API thử nghiệm (Postman & Bruno)
│   ├── postman/               # Collection & Environment JSON cho Postman
│   ├── bruno/                 # Bộ request cho Bruno API Client
│   └── openapi.json           # Đặc tả OpenAPI chuẩn RESTful
├── reports/                   # Báo cáo nghiệm thu & kết quả đo lường chất lượng
│   └── Ket_Qua_Kiem_Thu_CDIO4.xlsx
├── package.json               # Điều phối toàn bộ dự án tại thư mục gốc (Monorepo Root)
├── dev.js                     # Bộ chạy song song Backend & Frontend (Zero-dependency)
├── chay_he_thong.bat          # Kịch bản chạy nhanh 1 click trên Windows
├── kiem_tra_he_thong.bat      # Kịch bản kiểm tra chất lượng 18 bước
├── run_system_test.py         # Kiểm thử tích hợp toàn diện hệ thống
├── TASK_MEMORY.md             # Bộ nhớ trạng thái & Checkpoint dự án (Điều 8)
└── AGENTS.md                  # Quy tắc & Quy chuẩn dự án
```

### Các nguyên tắc tổ chức bắt buộc:
1. **Thư mục gốc tinh gọn (Clean Root Principle)**: Tuyệt đối không để tệp tin khảo sát, báo cáo nghiệm thu, hay bộ sưu tập API nằm rải rác ngoài thư mục gốc. Toàn bộ phải gom về đúng thư mục chức năng (`docs/`, `api-collections/`, `reports/`).
2. **Tên thư mục chuẩn quốc tế**: Đặt tên thư mục theo tiếng Anh chuẩn mực, chữ thường nối gạch ngang (kebab-case), không chứa dấu cách, không chứa ký tự tiếng Việt có dấu (ví dụ: cấm dùng `CDIO-4 — Hệ Thống Sinh Test Case API/`, mà phải dùng `api-collections/bruno/`).
3. **Độc lập và tự chủ (Self-Contained Modules)**: `backend` và `frontend` có thể chạy độc lập, build độc lập qua Dockerfile của từng phân hệ, hoặc chạy phối hợp thông qua bộ điều phối gốc `package.json` và `dev.js`.
4. **Không can thiệp đường dẫn động của Database**: Tệp cơ sở dữ liệu `app.db` luôn được đặt cố định tại `backend/app.db` hoặc mount qua volume Docker, không phân tán rác ra các thư mục khác.

---

## 10. QUY CHUẨN HIỂN THỊ KHỐI MÃ NGUỒN (CODE BLOCKS) VÀ QUẢN TRỊ HẠ TẦNG PTERODACTYL (CODE BLOCKS & PTERODACTYL INFRASTRUCTURE RULES)

Để bảo đảm trải nghiệm người dùng và tính toàn vẹn của hệ thống khi triển khai thực tế trên môi trường máy chủ container Pterodactyl, mọi thành viên và Agent phải tuân thủ nghiêm ngặt 2 điều luật sau:

### 10.1. Quy chuẩn hiển thị khối mã nguồn & lệnh Terminal trong UI
- **Độ tương phản màu sắc tuyệt đối (WCAG AAA Compliance)**:
  - Tuyệt đối cấm để xảy ra hiện tượng chữ đen trên nền tối (chữ tàng hình) hoặc chữ trắng trên nền sáng.
  - Vùng hiển thị mã nguồn phải dùng nền tối chuyên nghiệp (`#0B0F19` hoặc `#0F172A`), màu chữ bắt buộc dùng các tông sáng nổi bật: Sky Blue (`#38BDF8`), Emerald Light (`#34D399`) hoặc Trắng tuyết (`#F8FAFC`).
  - Thẻ `code` và `pre` phải được chỉ định tường minh thuộc tính `color`, `background`, `font-family` (`JetBrains Mono`, `Consolas`, `monospace`), không được để kế thừa tự do từ phần tử cha.
- **Cấu trúc 2 tầng chuẩn mực (Header + Body)**:
  - **Tầng Header**: Luôn hiển thị nhãn định danh ngôn ngữ / môi trường (`Bash / Terminal`, `Python Script`, `JSON Config`, `Docker Compose`) và nút Sao Chép ở góc phải.
  - **Tầng Body**: Chứa nội dung câu lệnh hoặc cấu hình, padding tối thiểu 14px, cuộn ngang độc lập (`overflow-x: auto`), không làm vỡ bố cục trang.
- **Phản hồi trạng thái nút sao chép**: Khi người dùng nhấn sao chép, nút phải phản hồi trực quan bằng icon check màu xanh lá kèm chữ "Đã sao chép" trong 2 giây trước khi trở về trạng thái ban đầu.

### 10.2. Quy chuẩn kết nối và quản trị máy chủ Pterodactyl (Wings Subsystem)
- **Cấm tuyệt đối dùng SSH shell thô sơ vào cổng 2023**:
  - Cổng 2023 là **SFTP Subsystem** chuyên biệt của Wings daemon phục vụ truyền nhận tệp tin, **KHÔNG PHẢI** là một interactive shell Linux hoàn chỉnh.
  - Việc cố tình chạy `ssh -t user@host -p 2023` sẽ bị ngắt kết nối đột ngột (`client_loop: send disconnect: Connection reset`), gây lỗi gián đoạn luồng dữ liệu HTTP (`BadRequestError: request aborted`) và có thể làm crash các dịch vụ microservice đang chạy bên trong container.
- **Phân định rạch ròi 2 kênh thao tác bắt buộc**:
  - **Kênh truyền tải tệp tin**: Bắt buộc dùng giao thức **SFTP** (qua Extension SFTP Neo trên Antigravity IDE hoặc ứng dụng FileZilla/WinSCP) với cấu hình `remotePath: "/"`.
  - **Kênh thực thi lệnh & giám sát**: Mọi thao tác gõ lệnh (cài thư viện, chạy migration, restart service) và theo dõi nhật ký (logs) **BẮT BUỘC** thực hiện trực tiếp trên giao diện **Web Console** của Pterodactyl Panel.
