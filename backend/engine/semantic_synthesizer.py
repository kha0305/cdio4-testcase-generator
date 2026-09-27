"""
Semantic Test Data Synthesizer.

Trình tổng hợp dữ liệu kiểm thử ngữ cảnh thực tế theo chuẩn QA Engineer chuyên nghiệp.
Tuyệt đối KHÔNG sinh dữ liệu rác, vô nghĩa (như 'test_value', 'aaaaaa', 'abc').
"""

import re
import string


def detect_parameter_domain(name: str, dtype: str = "string") -> str:
    """
    Phát hiện miền ngữ cảnh nghiệp vụ của tham số dựa trên tên và kiểu dữ liệu.
    """
    n = name.lower().strip()
    
    if any(k in n for k in ("email", "mail", "thu_dien_tu")):
        return "email"
    if any(k in n for k in ("mat_khau", "password", "pass", "pwd", "matkhau")):
        return "password"
    if any(k in n for k in ("ho_ten", "ten", "name", "full_name", "fullname", "nguoi_dung", "username")):
        return "name"
    if any(k in n for k in ("sdt", "phone", "dien_thoai", "so_dien_thoai", "telephone")):
        return "phone"
    if any(k in n for k in ("tuoi", "age", "nam_sinh", "do_tuoi")):
        return "age"
    if any(k in n for k in ("tien", "gia", "price", "amount", "cost", "tong_tien", "so_tien", "luong")):
        return "money"
    if any(k in n for k in ("so_luong", "quantity", "count", "soluong")):
        return "quantity"
    if any(k in n for k in ("voucher", "coupon", "khuyen_mai", "giam_gia", "promo")):
        return "voucher"
    if any(k in n for k in ("otp", "ma_xac_thuc", "verify_code")):
        return "otp"
    if any(k in n for k in ("dia_chi", "address", "noi_o", "tinh_thanh", "quan_huyen")):
        return "address"
    if any(k in n for k in ("ngay", "date", "han", "deadline", "time", "thoi_gian")):
        return "date"
    if any(k in n for k in ("ghi_chu", "note", "mo_ta", "desc", "description", "noi_dung", "content")):
        return "description"
    if any(k in n for k in ("ma", "code", "id", "join_code")):
        return "code"
    
    return "general_" + dtype


def generate_realistic_string(domain: str, length: int) -> str:
    """
    Sinh chuỗi thực tế có độ dài mong muốn dựa trên ngữ cảnh miền nghiệp vụ.
    """
    if length <= 0:
        return ""
    
    if domain == "email":
        if length < 8:
            return "a@b.vn"[:length]
        user_part = "tester"
        domain_part = "@cdio4.vn"
        needed = length - len(domain_part)
        if needed > 0:
            chars = string.ascii_lowercase + string.digits
            ext = "".join(chars[i % len(chars)] for i in range(needed))
            return ext + domain_part
        return ("tester" + domain_part)[:length]

    if domain == "password":
        base = "KiemThu@2026"
        if length <= len(base):
            return base[:length]
        # Bổ sung ký tự có quy tắc bảo mật
        extra = "".join(string.ascii_letters[i % len(string.ascii_letters)] for i in range(length - len(base)))
        return base + extra

    if domain == "name":
        sample_names = ["Nguyễn Văn An", "Trần Thị Bích Mai", "Lê Hoàng Quân", "Phạm Minh Đức"]
        combined = " ".join(sample_names)
        if length <= len(combined):
            return combined[:length].strip()
        return (combined + " " + "Nguyễn" * 10)[:length]

    if domain == "phone":
        digits = "0912345678" + "9" * 30
        return digits[:length]

    if domain == "code":
        chars = "CDIO4PRJ" + string.ascii_uppercase + string.digits
        return "".join(chars[i % len(chars)] for i in range(length))

    # General readable text (không lặp ký tự a thô thiển)
    words = [
        "HeThong", "KiemThu", "TuDong", "PhanMem", "ChuyenNghiep",
        "NghiemThu", "DoAn", "CDIO4", "ChatLuong", "TieuChuan"
    ]
    sentence = "".join(words)
    while len(sentence) < length:
        sentence += "".join(words)
    return sentence[:length]


def get_realistic_nominal_value(param: dict):
    """
    Sinh giá trị danh định (Nominal Value) chuẩn xác, thực tế cho một tham số.
    """
    name = param.get("name", "")
    dtype = param.get("data_type", "string")
    min_val = param.get("min_value")
    max_val = param.get("max_value")
    min_len = param.get("min_length")
    max_len = param.get("max_length")
    enum_values = param.get("enum_values")

    domain = detect_parameter_domain(name, dtype)

    # 1. Enum
    if dtype == "enum" and enum_values:
        return enum_values[0]

    # 2. Boolean
    if dtype == "boolean":
        return True

    # 3. Kieu so (integer / float)
    if dtype in ("integer", "float"):
        # Tinh toan mien hop le
        if min_val is not None and max_val is not None:
            mid = (min_val + max_val) / 2
            val = int(mid) if dtype == "integer" else round(mid, 2)
        elif min_val is not None:
            val = int(min_val + 5) if dtype == "integer" else round(min_val + 5.0, 2)
        elif max_val is not None:
            val = int(max_val - 5) if dtype == "integer" else round(max_val - 5.0, 2)
        else:
            val = 25 if domain == "age" else (100000 if domain == "money" else 5)

        # Dieu chinh theo ngu canh
        if domain == "age":
            return max(18, min(val, 60))
        if domain == "money":
            return max(50000, val)
        if domain == "quantity":
            return max(1, min(val, 10))
        return val

    # 4. Kieu chuoi (string)
    target_len = 10
    if min_len is not None and max_len is not None:
        target_len = (min_len + max_len) // 2
    elif min_len is not None:
        target_len = min_len + 3
    elif max_len is not None:
        target_len = max(4, max_len - 3)

    if domain == "email":
        return "tester.cdio4@gmail.com"
    if domain == "password":
        return "MatKhauAnToan@2026"
    if domain == "name":
        return "Nguyễn Văn An"
    if domain == "phone":
        return "0912345678"
    if domain == "address":
        return "Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
    if domain == "voucher":
        return "GIAM2026"
    if domain == "otp":
        return "849201"
    if domain == "date":
        return "2026-10-15"
    if domain == "description":
        return "Đặc tả nghiệp vụ kiểm thử hệ thống tự động đạt chuẩn QA"

    return generate_realistic_string(domain, target_len)


def get_realistic_invalid_value(param: dict, reason: str = "general"):
    """
    Sinh giá trị không hợp lệ mang tính thực tế (Realistic Negative Value).
    """
    name = param.get("name", "")
    dtype = param.get("data_type", "string")
    domain = detect_parameter_domain(name, dtype)

    if domain == "email":
        return "nguyenvanan_invalid_email.com"  # Thieu @
    if domain == "password":
        return "matkhauyeu"  # Thieu chu hoa va ky tu dac biet
    if domain == "phone":
        return "091234abcd"  # Chua chu cai
    if domain == "age":
        return 17  # Duoi tuoi lao dong
    if domain == "money":
        return -50000  # So tien am
    if domain == "quantity":
        return 0  # So luong bang 0
    if domain == "otp":
        return "000000"  # OTP sai
    if domain == "voucher":
        return "VOUCHER_HET_HAN"

    if dtype in ("integer", "float"):
        return -1
    return ""


def get_realistic_type_mismatch_value(param: dict):
    """
    Sinh giá trị sai kiểu dữ liệu nhưng thực tế (thay vì dùng chuỗi rác 'abc').
    """
    dtype = param.get("data_type", "string")
    if dtype in ("integer", "float"):
        return "HaiMươiNăm"
    if dtype == "boolean":
        return "ĐúngLuôn"
    if dtype == "string":
        return 99999999
    return "SaiKieuDuLieu"


def get_realistic_enum_invalid_value(param: dict):
    """
    Sinh giá trị enum không nằm trong danh mục nhưng có nghĩa (thay vì 'INVALID_VALUE').
    """
    name = param.get("name", "").lower()
    if any(k in name for k in ("role", "vai_tro", "quyen")):
        return "SuperAdmin"
    if any(k in name for k in ("status", "trang_thai")):
        return "TamDinhChi"
    if any(k in name for k in ("gender", "gioi_tinh")):
        return "KhongXacDinh"
    if any(k in name for k in ("loai", "type", "category")):
        return "LoaiKhongTonTai"
    return "GiaTriNgoaiDanhSach"


def get_realistic_format_violations(param: dict) -> list[dict]:
    """
    Sinh danh sách các ca vi phạm định dạng chuẩn ISTQB cho từng loại trường.
    """
    name = param.get("name", "")
    dtype = param.get("data_type", "string")
    domain = detect_parameter_domain(name, dtype)
    violations = []

    if domain == "email":
        violations.append({
            "value": "nguyenvanan.gmail.com",
            "reason": "thiếu ký tự '@' trong địa chỉ email",
        })
        violations.append({
            "value": "nguyenvanan@domain..com",
            "reason": "chứa hai dấu chấm liên tiếp trong phần tên miền",
        })
        violations.append({
            "value": "nguyenvanan@",
            "reason": "thiếu tên miền sau ký tự '@'",
        })
    elif domain == "password":
        violations.append({
            "value": "matkhauchithuong",
            "reason": "mật khẩu thiếu chữ hoa, số và ký tự đặc biệt",
        })
        violations.append({
            "value": "MatKhauDaiNhungKhongSo@",
            "reason": "mật khẩu thiếu ký tự số bắt buộc",
        })
    elif domain == "phone":
        violations.append({
            "value": "09123456",
            "reason": "số điện thoại quá ngắn (chỉ có 8 chữ số)",
        })
        violations.append({
            "value": "0912345678901",
            "reason": "số điện thoại quá dài (13 chữ số)",
        })
        violations.append({
            "value": "091234abcd",
            "reason": "số điện thoại chứa ký tự chữ cái không hợp lệ",
        })
    elif domain == "date":
        violations.append({
            "value": "2026-02-31",
            "reason": "ngày không hợp lệ trong lịch (ngày 31 tháng 2)",
        })
        violations.append({
            "value": "31/12/2026",
            "reason": "sai định dạng chuẩn ISO YYYY-MM-DD",
        })

    return violations

