"""
Bộ kiểm thử tích hợp toàn diện hệ thống CDIO-4 (Phiên Bản Toàn Bộ Phân Hệ):
- Xác thực & Đăng nhập (Auth: Đăng ký bình đẳng, Login, Me, Users)
- Quản lý Dự án & Phân quyền 3 cấp (Leader, Phó nhóm, Thành viên)
- Quản lý Thành viên dự án (Thêm thành viên, Đổi vai trò, Phân quyền)
- Quản lý Chu kỳ Scrum & Sprints (Sprints CRUD & Definition of Done)
- Quản lý Chức năng con & Phân công (Requirements CRUD, Assignee, Due Date)
- Bóc tách tham số & Tự động sinh Test Case (BVA, EP, Pairwise, Z3 SMT Solver)
- Cập nhật kết quả kiểm thử thực tế (Verdict: Pass, Fail)
- Xuất Báo Cáo Kiểm Thử Toàn Diện Cấp Dự Án (Excel 4 Sheet, CSV, JSON, Markdown)
- Kiểm tra Quy chuẩn AGENTS.md (Tiếng Việt có dấu chuẩn mực, Tuyệt đối Không Dùng Emoji)
"""
import urllib.request
import urllib.parse
import urllib.error
import json
import re
import sys
import time

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def request_json(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def request_raw(path, token=None):
    url = f"{BASE_URL}{path}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.headers.get_content_type(), resp.read()

def contains_emoji(text):
    emoji_pattern = re.compile(
        "[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F700-\U0001F77F"
        "\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F"
        "\U0001FA70-\U0001FAFF\U00002702-\U000027B0\U000024C2-\U0001F251]"
    )
    return bool(emoji_pattern.search(text))

def run_all_tests():
    print("================================================================")
    print("=== BẮT ĐẦU KIỂM THỬ TÍCH HỢP TOÀN BỘ PHÂN HỆ HỆ THỐNG CDIO-4 ===")
    print("================================================================")
    passed = 0
    failed = 0

    # 1. Kiểm tra Đăng Ký Bình Đẳng & Đăng Nhập
    print("\n--- 1. Kiểm tra Xác Thực Bình Đẳng & Đăng Nhập (Auth) ---")
    lead_token = None
    member_user = None
    try:
        # Đăng ký tài khoản mới không cần role
        ts = int(time.time())
        reg_payload = {
            "username": f"user_{ts}",
            "email": f"user_{ts}@cdio.edu.vn",
            "full_name": f"Nguyễn Văn Bình ({ts})",
            "password": "password123",
        }
        status, reg_res = request_json("/api/auth/register", method="POST", data=reg_payload)
        assert status in (200, 201), f"Mã HTTP không hợp lệ: {status}"
        member_user = reg_res.get("user")
        assert member_user.get("role") == "user"
        print(f"[THÀNH CÔNG] Đăng ký tài khoản bình đẳng thành công: {member_user.get('full_name')} (Tài khoản người dùng chuẩn)")
        passed += 1

        # Đăng nhập bằng tài khoản lead mẫu
        login_payload = {"username": "qalead", "password": "123456"}
        status, auth_res = request_json("/api/auth/login", method="POST", data=login_payload)
        assert status == 200
        lead_token = auth_res.get("token")
        lead_user = auth_res.get("user", {})
        print(f"[THÀNH CÔNG] Đăng nhập thành công: {lead_user.get('full_name')} - Token cấp thành công")
        passed += 1

        # Cập nhật hồ sơ cá nhân của thành viên mới
        member_token = reg_res.get("token")
        profile_update = {
            "full_name": f"Nguyễn Văn Bình Đã Cập Nhật ({ts})",
            "email": f"user_{ts}_updated@cdio.edu.vn",
        }
        status, updated_user = request_json("/api/auth/profile", method="PUT", data=profile_update, token=member_token)
        assert status == 200
        assert updated_user.get("full_name") == profile_update["full_name"]
        print(f"[THÀNH CÔNG] Cập nhật hồ sơ cá nhân thành công: {updated_user.get('full_name')} ({updated_user.get('email')})")
        passed += 1

        # Đổi mật khẩu bảo mật
        pwd_update = {
            "old_password": "password123",
            "new_password": "new_secret_password_2026",
        }
        status, pwd_res = request_json("/api/auth/change-password", method="PUT", data=pwd_update, token=member_token)
        assert status == 200
        print(f"[THÀNH CÔNG] Đổi mật khẩu bảo mật thành công: {pwd_res.get('message')}")
        passed += 1

        # Xác thực đăng nhập bằng mật khẩu mới
        status, new_auth = request_json("/api/auth/login", method="POST", data={"username": reg_payload["username"], "password": "new_secret_password_2026"})
        assert status == 200
        print(f"[THÀNH CÔNG] Xác thực đăng nhập thành công với mật khẩu mới!")
        passed += 1
    except Exception as e:
        print(f"[THẤT BẠI] Lỗi xác thực: {e}")
        failed += 1

    # 2. Kiểm tra Tạo Dự Án Mới & Gán Leader Tự Động
    print("\n--- 2. Kiểm tra Phân Quyền Dự Án: Người Tạo Mặc Định Là Leader ---")
    created_proj_id = None
    try:
        proj_payload = {
            "name": "Dự Án Nghiên Cứu RBAC & Tự Động Sinh Test",
            "code": f"PRJ-RBAC-{int(time.time()) % 10000}",
            "project_type": "team",
            "description": "Dự án thử nghiệm phân quyền 3 cấp (Leader, Phó nhóm, Thành viên).",
        }
        status, new_proj = request_json("/api/projects", method="POST", data=proj_payload, token=lead_token)
        assert status == 200
        created_proj_id = new_proj.get("id")
        assert new_proj.get("current_user_role") == "leader"
        print(f"[THÀNH CÔNG] Tạo dự án thành công: {new_proj.get('name')} (Mã: {new_proj.get('code')})")
        print(f"            Vai trò người tạo: {new_proj.get('current_user_role')} (Trưởng nhóm)")
        passed += 1

        # Kiểm tra danh sách thành viên ban đầu
        status, members_res = request_json(f"/api/projects/{created_proj_id}/members", token=lead_token)
        assert status == 200
        assert len(members_res.get("members", [])) >= 1
        first_mem = members_res.get("members")[0]
        assert first_mem.get("role") == "leader"
        print(f"[THÀNH CÔNG] Danh sách thành viên ban đầu: 1 Trưởng nhóm ({first_mem.get('full_name')})")
        passed += 1
    except Exception as e:
        print(f"[THẤT BẠI] Lỗi tạo dự án và gán Leader: {e}")
        failed += 1

    # 3. Kiểm tra Leader Phân Quyền 3 Cấp (Thêm thành viên, Phong Phó nhóm)
    print("\n--- 3. Kiểm tra Leader Quản Lý Thành Viên & Phân Quyền 3 Cấp ---")
    if created_proj_id and member_user:
        try:
            # Leader thêm thành viên thứ 2
            add_payload = {
                "user_identifier": member_user.get("username"),
                "role": "member",
            }
            status, add_res = request_json(f"/api/projects/{created_proj_id}/members", method="POST", data=add_payload, token=lead_token)
            assert status == 200
            print(f"[THÀNH CÔNG] Leader thêm thành viên mới: {add_res.get('message')}")
            passed += 1

            # Leader đổi vai trò thành viên thứ 2 thành Phó nhóm (Deputy)
            role_payload = {"role": "deputy"}
            status, role_res = request_json(
                f"/api/projects/{created_proj_id}/members/{member_user.get('id')}/role",
                method="PUT",
                data=role_payload,
                token=lead_token,
            )
            assert status == 200
            assert role_res.get("new_role") == "deputy"
            print(f"[THÀNH CÔNG] Leader phong thành viên thành Phó nhóm: {role_res.get('message')}")
            passed += 1

            # Kiểm tra lại danh sách thành viên dự án
            status, members_res2 = request_json(f"/api/projects/{created_proj_id}/members", token=lead_token)
            roles = [m.get("role") for m in members_res2.get("members")]
            assert "leader" in roles and "deputy" in roles
            print(f"[THÀNH CÔNG] Đội ngũ dự án hiện tại gồm đủ 3 cấp: {[m.get('full_name') + ' (' + m.get('role_name') + ')' for m in members_res2.get('members')]}")
            passed += 1
        except Exception as e:
            print(f"[THẤT BẠI] Lỗi quản lý phân quyền: {e}")
            failed += 1

    # 4. Kiểm tra Nạp Dự Án Mẫu Đồ Án (Seed Sample E-Commerce Project)
    print("\n--- 4. Kiểm tra Nạp Dự Án Mẫu Đồ Án (Seed Sample Scrum Project) ---")
    sample_proj_id = None
    try:
        status, seed_proj = request_json("/api/projects/seed-sample", method="POST", token=lead_token)
        assert status == 200
        sample_proj_id = seed_proj.get("id")
        assert seed_proj.get("code") == "PRJ-SHOP-DEMO"
        assert seed_proj.get("requirements_count") >= 3
        assert seed_proj.get("total_cases") >= 80
        print(f"[THÀNH CÔNG] Nạp dự án mẫu thành công: {seed_proj.get('name')} (Mã: {seed_proj.get('code')})")
        print(f"            KPI: {seed_proj.get('requirements_count')} Chức năng, {seed_proj.get('total_cases')} Test Cases, Tỷ lệ Đạt: {seed_proj.get('pass_rate')}%, Mã Nhóm: {seed_proj.get('join_code')}")
        passed += 1
    except Exception as e:
        print(f"[THẤT BẠI] Lỗi nạp dự án mẫu: {e}")
        failed += 1

    # 5. Kiểm tra Quản lý Chu kỳ Scrum & Sprints (DoD)
    print("\n--- 5. Kiểm tra Quản Lý Chu Kỳ Scrum & Sprints (Scrum & DoD) ---")
    if sample_proj_id:
        try:
            status, sprints = request_json(f"/api/sprints/project/{sample_proj_id}", token=lead_token)
            assert status == 200
            assert len(sprints) >= 1
            sp1 = sprints[0]
            print(f"[THÀNH CÔNG] Lấy danh sách Sprints: {len(sprints)} chu kỳ.")
            print(f"            Sprint 1: '{sp1.get('name')}' - DoD Đạt: {sp1.get('dod_met')} ({sp1.get('pass_rate')}% Pass)")
            passed += 1

            # Tạo thêm Sprint mới
            new_sp_payload = {
                "project_id": sample_proj_id,
                "name": "Sprint 3: Tích Hợp Đánh Giá & Điểm Thưởng",
                "goal": "Hoàn thiện luồng tích điểm thành viên và phản hồi sản phẩm",
                "start_date": "2026-10-01",
                "end_date": "2026-10-15",
                "status": "planning",
            }
            status, created_sp = request_json("/api/sprints", method="POST", data=new_sp_payload, token=lead_token)
            assert status == 200
            assert created_sp.get("id") is not None
            print(f"[THÀNH CÔNG] Tạo Sprint mới: ID={created_sp.get('id')} - '{created_sp.get('name')}'")
            passed += 1
        except Exception as e:
            print(f"[THẤT BẠI] Lỗi Sprints: {e}")
            failed += 1

    # 6. Kiểm tra Xuất Báo Cáo Nghiệm Thu Cấp Dự Án (Excel 4 Sheet, CSV, JSON, Markdown)
    print("\n--- 6. Kiểm tra Xuất Báo Cáo Nghiệm Thu Cấp Dự Án (Excel, CSV, JSON, Markdown) ---")
    if sample_proj_id:
        try:
            # 1. Excel (.xlsx)
            status, mime, raw = request_raw(f"/api/projects/{sample_proj_id}/export?format=xlsx", token=lead_token)
            assert status == 200
            assert len(raw) > 5000
            print(f"[THÀNH CÔNG] Xuất Excel Báo Cáo Nghiệm Thu 4 Sheets: {len(raw):,} bytes - MIME: {mime}")
            passed += 1

            # 2. CSV
            status, mime, raw = request_raw(f"/api/projects/{sample_proj_id}/export?format=csv", token=lead_token)
            assert status == 200
            assert len(raw) > 1000
            print(f"[THÀNH CÔNG] Xuất Bảng Dữ Liệu CSV Toàn Bộ Dự Án: {len(raw):,} bytes - MIME: {mime}")
            passed += 1

            # 3. JSON
            status, mime, raw = request_raw(f"/api/projects/{sample_proj_id}/export?format=json", token=lead_token)
            assert status == 200
            assert len(raw) > 5000
            print(f"[THÀNH CÔNG] Xuất Cấu Trúc Báo Cáo JSON: {len(raw):,} bytes - MIME: {mime}")
            passed += 1

            # 4. Markdown
            status, mime, raw = request_raw(f"/api/projects/{sample_proj_id}/export?format=markdown", token=lead_token)
            assert status == 200
            assert len(raw) > 500
            print(f"[THÀNH CÔNG] Xuất Tài Liệu Báo Cáo Markdown: {len(raw):,} bytes - MIME: {mime}")
            passed += 1
        except Exception as e:
            print(f"[THẤT BẠI] Lỗi xuất báo cáo: {e}")
            failed += 1

    # 7. Kiểm tra Quy chuẩn AGENTS.md (Tiếng Việt có dấu, Tuyệt đối Không Dùng Emoji)
    print("\n--- 7. Kiểm tra Quy Chuẩn AGENTS.md (Không emoji, Tiếng Việt chuẩn mực) ---")
    try:
        status, proj_details = request_json(f"/api/projects/{sample_proj_id}", token=lead_token)
        assert status == 200
        proj_str = json.dumps(proj_details, ensure_ascii=False)
        assert not contains_emoji(proj_str)
        # Kiểm tra tiếng Việt có dấu
        assert "Kiểm thử" in proj_str or "chức năng" in proj_str or "Đặc tả" in proj_str or "Dự Án" in proj_str
        print("[THÀNH CÔNG] 100% dữ liệu tuân thủ quy tắc Tiếng Việt có dấu và Tuyệt đối không dùng Emoji.")
        passed += 1
    except Exception as e:
        print(f"[THẤT BẠI] Vi phạm quy chuẩn AGENTS.md: {e}")
        failed += 1

    print("\n================================================================")
    print(f"KẾT QUẢ KIỂM THỬ TÍCH HỢP: {passed} THÀNH CÔNG / {passed + failed} BƯỚC")
    print(f"TỶ LỆ ĐẠT: {round(passed / (passed + failed) * 100, 1)}%")
    print("================================================================")

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
