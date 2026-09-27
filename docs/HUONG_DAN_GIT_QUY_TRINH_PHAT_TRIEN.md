# HƯỚNG DẪN QUY TRÌNH QUẢN LÝ PHIÊN BẢN MÃ NGUỒN VỚI GIT & GITHUB

Tài liệu này hướng dẫn chi tiết quy trình chuẩn quản lý mã nguồn bằng Git cho các thành viên trong nhóm đồ án, từ khởi tạo repository, quản lý nhánh, quy ước đặt tên commit đến giải quyết xung đột mã nguồn.

---

## 1. CẤU HÌNH BAN ĐẦU (INITIAL SETUP)

### 1.1. Cấu hình danh tính lập trình viên
Mỗi lập trình viên cần thiết lập tên và email đồng nhất với tài khoản GitHub:
```bash
# Thiết lập tên hiển thị trên commit
git config --global user.name "Nguyen Van An"

# Thiết lập email tài khoản GitHub
git config --global user.email "nguyenvanan.tester@gmail.com"

# Thiết lập mã hóa UTF-8 để không bị lỗi tiếng Việt
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
```

### 1.2. Khởi tạo Repository và liên kết Remote GitHub
```bash
# Điều hướng vào thư mục dự án
cd d:/Do-an/CDIO-4/code

# Khởi tạo Git repository cục bộ
git init

# Đặt tên nhánh chính là main
git branch -M main

# Liên kết với kho chứa từ xa trên GitHub (thay URL tương ứng)
git remote add origin https://github.com/your-username/CDIO4-AutoTestCase-Studio.git

# Kiểm tra liên kết remote
git remote -v
```

---

## 2. QUY CHUẨN TẬP TIN LOẠI TRỪ (.GITIGNORE)

Để tránh đẩy các tệp tạm, thư viện phụ thuộc nặng hoặc khóa bảo mật lên kho chứa công khai, tập tin `.gitignore` phải cấu hình các thư mục sau:

```gitignore
# Thư viện phụ thuộc Python
venv/
.venv/
env/
__pycache__/
*.py[cod]

# Thư viện phụ thuộc Node.js & React
node_modules/
dist/
.vite/

# Cơ sở dữ liệu SQLite cục bộ & tệp nhật ký
backend/app.db
backend/app.db-wal
backend/app.db-shm
*.log

# Khóa bảo mật & biến môi trường
.env
.env.local
.env.production
*.pem
*.key

# Tệp cấu hình IDE & hệ điều hành
.vscode/
.idea/
.DS_Store
Thumbs.db
```

---

## 3. QUY TRÌNH LÀM VIỆC THEO NHÁNH (GIT BRANCHING STRATEGY)

Hệ thống áp dụng mô hình phân nhánh rút gọn phù hợp với nhóm Scrum/Agile:

| Nhánh (Branch) | Mục đích sử dụng | Ai phụ trách |
| :--- | :--- | :--- |
| `main` | Nhánh ổn định, chứa mã nguồn sẵn sàng nghiệm thu hoặc đưa lên máy chủ hosting. | Trưởng nhóm (Leader) merge |
| `develop` | Nhánh tích hợp chính của các tính năng mới trong Sprint. | Cả nhóm phối hợp |
| `feature/<ten-tinh-nang>` | Nhánh làm việc riêng của từng thành viên cho 1 User Story. | Lập trình viên phụ trách |
| `hotfix/<ten-loi>` | Nhánh sửa lỗi khẩn cấp trực tiếp từ `main`. | Leader / Deputy |

### Các bước triển khai một tính năng mới:
```bash
# 1. Cập nhật nhánh main mới nhất từ GitHub
git checkout main
git pull origin main

# 2. Tạo nhánh làm việc mới từ main
git checkout -b feature/constraint-solver-z3

# 3. Tiến hành viết mã nguồn và kiểm thử cục bộ...

# 4. Kiểm tra danh sách tệp đã thay đổi
git status

# 5. Thêm các tệp đã sửa đổi vào vùng chuẩn bị (staging area)
git add backend/engine/constraint_solver.py

# 6. Commit với thông điệp chuẩn mực
git commit -m "feat(engine): tich hop Z3 solver kiem tra rang buoc cheo da bien"

# 7. Đẩy nhánh lên GitHub
git push -u origin feature/constraint-solver-z3
```

---

## 4. QUY ƯỚC ĐẶT TÊN COMMIT (CONVENTIONAL COMMITS)

Mọi commit phải tuân thủ định dạng chuẩn sau:
```text
<loai>(<pham-vi>): <mo-ta-ngan-gon>
```

### Các tiền tố quy ước chuẩn:
- `feat`: Thêm tính năng mới (ví dụ: `feat(ui): them modal phan cong lich kiem thu`).
- `fix`: Sửa lỗi phát sinh (ví dụ: `fix(auth): dong bo ma hoa bcrypt cho tai khoan lead`).
- `docs`: Cập nhật tài liệu kỹ thuật (ví dụ: `docs(deploy): them huong dan hosting pterodactyl`).
- `refactor`: Tái cấu trúc mã nguồn mà không làm đổi hành vi tính năng.
- `test`: Viết thêm bộ kiểm thử hoặc kịch bản tự động hóa.
- `chore`: Cập nhật cấu hình phụ thuộc, npm, pip, `.gitignore`.

---

## 5. XỬ LÝ XUNG ĐỘT MÃ NGUỒN (RESOLVING MERGE CONFLICTS)

Khi hai thành viên cùng chỉnh sửa trên cùng một tệp, Git sẽ báo xung đột (Conflict):

1. **Nhận diện tệp xung đột**:
   ```bash
   git status
   # Git sẽ liệt kê các tệp ở trạng thái 'both modified'
   ```
2. **Mở tệp và tìm các khối dấu hiệu xung đột**:
   ```text
   <<<<<<< HEAD
   Mã nguồn hiện tại trên máy của bạn
   =======
   Mã nguồn mới được cập nhật trên nhánh remote
   >>>>>>> origin/main
   ```
3. **Thảo luận và giữ lại đoạn mã chính xác**, xóa bỏ hoàn toàn các ký hiệu `<<<<<<<`, `=======`, `>>>>>>>`.
4. **Đánh dấu đã giải quyết và hoàn tất commit**:
   ```bash
   git add <ten-tap-tin-da-sua>
   git commit -m "merge: giai quyet xung dot tren tap tin TestCaseTable.jsx"
   git push origin main
   ```
