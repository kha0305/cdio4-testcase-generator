"""
Script kiểm tra và migration cơ sở dữ liệu SQLite:
- Bảng projects: code, version, lead, project_type, join_code
- Bảng test_cases: actual_result, status
- Bảng users: id, username, email, full_name, password_hash, role, created_at
- Bảng sprints: id, project_id, name, goal, start_date, end_date, status, created_at
- Bảng requirements: sprint_id, assignee_name, due_date, priority, status
"""
import sqlite3
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "app.db")
print(f"[INFO] Đường dẫn database: {db_path}")

if not os.path.exists(db_path):
    print("[INFO] Database chưa tồn tại, sẽ được tạo mới khi backend khởi động.")
    sys.exit(0)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Bảng users
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'tester',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# 2. Bảng sprints
cur.execute("""
CREATE TABLE IF NOT EXISTS sprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT DEFAULT '',
    start_date TEXT DEFAULT '',
    end_date TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# 3. Bảng project_members
cur.execute("""
CREATE TABLE IF NOT EXISTS project_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
)
""")

# 4. Kiểm tra cột trong requirements
cur.execute("PRAGMA table_info(requirements)")
req_cols = {c[1] for c in cur.fetchall()}
migrations_needed = []

if "sprint_id" not in req_cols:
    migrations_needed.append(("requirements", "sprint_id", "INTEGER REFERENCES sprints(id)"))
if "assignee_name" not in req_cols:
    migrations_needed.append(("requirements", "assignee_name", "TEXT DEFAULT ''"))
if "due_date" not in req_cols:
    migrations_needed.append(("requirements", "due_date", "TEXT DEFAULT ''"))
if "priority" not in req_cols:
    migrations_needed.append(("requirements", "priority", "TEXT DEFAULT 'Medium'"))
if "status" not in req_cols:
    migrations_needed.append(("requirements", "status", "TEXT DEFAULT 'planning'"))

# 5. Kiểm tra cột trong projects
cur.execute("PRAGMA table_info(projects)")
proj_cols = {c[1] for c in cur.fetchall()}
if "project_type" not in proj_cols:
    migrations_needed.append(("projects", "project_type", "TEXT DEFAULT 'personal'"))
if "join_code" not in proj_cols:
    migrations_needed.append(("projects", "join_code", "TEXT"))
if "owner_id" not in proj_cols:
    migrations_needed.append(("projects", "owner_id", "INTEGER REFERENCES users(id)"))

# 5.1. Kiểm tra cột trong test_cases
cur.execute("PRAGMA table_info(test_cases)")
tc_cols = {c[1] for c in cur.fetchall()}
if "postconditions" not in tc_cols:
    migrations_needed.append(("test_cases", "postconditions", "TEXT DEFAULT ''"))

# 6. Thực hiện migration
for table, col, col_type in migrations_needed:
    sql = f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"
    print(f"[MIGRATE] {sql}")
    cur.execute(sql)

conn.commit()

# Đồng bộ dữ liệu cũ: gán owner_id cho dự án và tạo project_members
cur.execute("SELECT id FROM users LIMIT 1")
first_user = cur.fetchone()
if first_user:
    u_id = first_user[0]
    # Gán owner_id cho các project chưa có
    cur.execute("UPDATE projects SET owner_id = ? WHERE owner_id IS NULL", (u_id,))
    conn.commit()
    
    # Tạo project_members cho các project
    cur.execute("SELECT id, owner_id FROM projects")
    projs = cur.fetchall()
    for pid, oid in projs:
        owner = oid or u_id
        cur.execute("INSERT OR IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, 'leader')", (pid, owner))
    conn.commit()

# Nếu có user thứ 2 (tester01), thêm vào làm deputy hoặc member trong dự án mẫu
cur.execute("SELECT id FROM users WHERE id != ? LIMIT 1", (first_user[0] if first_user else 0,))
second_user = cur.fetchone()
if second_user and projs:
    for pid, _ in projs:
        cur.execute("INSERT OR IGNORE INTO project_members (project_id, user_id, role) VALUES (?, ?, 'deputy')", (pid, second_user[0]))
    conn.commit()

# Khởi tạo 2 tài khoản mẫu nếu chưa có
try:
    import bcrypt
    pwd_bytes = "123456".encode("utf-8")
    pwd_hash = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt(rounds=12)).decode("utf-8")
except Exception:
    import hashlib
    pwd_hash = hashlib.sha256("123456".encode("utf-8")).hexdigest()

cur.execute("SELECT id FROM users WHERE username = 'qalead'")
if not cur.fetchone():
    cur.execute(
        "INSERT INTO users (username, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        ("qalead", "qalead@cdio.edu.vn", "Trần Minh (QA Lead)", pwd_hash, "lead")
    )
cur.execute("SELECT id FROM users WHERE username = 'tester01'")
if not cur.fetchone():
    cur.execute(
        "INSERT INTO users (username, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        ("tester01", "tester01@cdio.edu.vn", "Nguyễn Văn A (Tester)", pwd_hash, "tester")
    )
conn.commit()
print("[INIT] Đã đảm bảo tồn tại 2 tài khoản mẫu (qalead, tester01 với mật khẩu 123456).")

conn.close()
print("[OK] Toàn bộ cơ sở dữ liệu đã nâng cấp hoàn chỉnh!")
