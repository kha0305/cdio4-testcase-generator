"""
Boundary Value Analysis (BVA) Engine.

Ap dung ky thuat 3-point BVA chuan ISTQB:
- Voi moi bien co gioi han [min, max]:
  - Sinh cac gia tri bien: min-1, min, min+1, nominal, max-1, max, max+1
  - Phan loai: valid (trong khoang) / invalid (ngoai khoang)

- Voi chuoi co do dai [min_len, max_len]:
  - Sinh chuoi co do dai: min_len-1, min_len, min_len+1, nominal, max_len-1, max_len, max_len+1
"""

import math
import string
import random


from engine.semantic_synthesizer import (
    detect_parameter_domain,
    generate_realistic_string,
    get_realistic_type_mismatch_value,
    get_realistic_enum_invalid_value,
)


def _generate_string(length: int, param_name: str = "") -> str:
    """Tạo chuỗi thực tế theo ngữ cảnh tham số với độ dài cho trước."""
    domain = detect_parameter_domain(param_name, "string")
    return generate_realistic_string(domain, length)


def generate_bva_values(parameter: dict) -> list[dict]:
    """
    Sinh danh sach cac gia tri BVA cho 1 tham so.

    Args:
        parameter: dict chua thong tin tham so
            {
                "name": "Age",
                "data_type": "integer",  # integer, float, string, enum, boolean, date
                "min_value": 18,
                "max_value": 60,
                "min_length": None,
                "max_length": None,
                "enum_values": None,
                ...
            }

    Returns:
        list[dict]: moi phan tu la
            {
                "value": <gia tri cu the>,
                "category": "valid" | "invalid",
                "boundary_type": "min-1" | "min" | "min+1" | "nominal" | "max-1" | "max" | "max+1" | "null" | "empty" | "wrong_type",
                "description": "..."
            }
    """
    name = parameter.get("name", "unknown")
    dtype = parameter.get("data_type", "string")
    min_val = parameter.get("min_value")
    max_val = parameter.get("max_value")
    min_len = parameter.get("min_length")
    max_len = parameter.get("max_length")
    enum_values = parameter.get("enum_values")
    is_required = parameter.get("is_required", True)

    values = []

    # --- Kieu so (integer / float) ---
    if dtype in ("integer", "float") and (min_val is not None or max_val is not None):
        step = 1 if dtype == "integer" else 0.1

        if min_val is not None:
            below_min = (int(min_val - step) if dtype == "integer"
                         else round(min_val - step, 2))
            just_above = (int(min_val + step) if dtype == "integer"
                          else round(min_val + step, 2))
            exact_min = int(min_val) if dtype == "integer" else min_val

            values.append({
                "value": below_min,
                "category": "invalid",
                "boundary_type": "min-1",
                "description": f"{name} = {below_min} (dưới biên dưới)",
            })
            values.append({
                "value": exact_min,
                "category": "valid",
                "boundary_type": "min",
                "description": f"{name} = {exact_min} (đúng biên dưới)",
            })
            values.append({
                "value": just_above,
                "category": "valid",
                "boundary_type": "min+1",
                "description": f"{name} = {just_above} (ngay trên biên dưới)",
            })

        if max_val is not None:
            just_below = (int(max_val - step) if dtype == "integer"
                          else round(max_val - step, 2))
            exact_max = int(max_val) if dtype == "integer" else max_val
            above_max = (int(max_val + step) if dtype == "integer"
                         else round(max_val + step, 2))

            values.append({
                "value": just_below,
                "category": "valid",
                "boundary_type": "max-1",
                "description": f"{name} = {just_below} (ngay dưới biên trên)",
            })
            values.append({
                "value": exact_max,
                "category": "valid",
                "boundary_type": "max",
                "description": f"{name} = {exact_max} (đúng biên trên)",
            })
            values.append({
                "value": above_max,
                "category": "invalid",
                "boundary_type": "max+1",
                "description": f"{name} = {above_max} (vượt quá biên trên)",
            })

        # Nominal value (trung binh)
        if min_val is not None and max_val is not None:
            nominal = (int((min_val + max_val) / 2) if dtype == "integer"
                       else round((min_val + max_val) / 2, 2))
            values.append({
                "value": nominal,
                "category": "valid",
                "boundary_type": "nominal",
                "description": f"{name} = {nominal} (giá trị trung bình / danh định)",
            })

        # Invalid: wrong type (chuỗi chữ tiếng Việt thực tế thay vì 'abc')
        mismatch_val = get_realistic_type_mismatch_value(parameter)
        values.append({
            "value": mismatch_val,
            "category": "invalid",
            "boundary_type": "wrong_type",
            "description": f"{name} = '{mismatch_val}' (sai kiểu dữ liệu, nhập chuỗi thay vì số)",
        })

        # Invalid: negative (if min >= 0)
        if min_val is not None and min_val >= 0:
            values.append({
                "value": -1,
                "category": "invalid",
                "boundary_type": "negative",
                "description": f"{name} = -1 (giá trị âm khi chỉ chấp nhận số dương)",
            })

    # --- Kieu chuoi (string) co gioi han do dai ---
    elif dtype == "string" and (min_len is not None or max_len is not None):
        if min_len is not None:
            values.append({
                "value": _generate_string(max(0, min_len - 1), name),
                "category": "invalid",
                "boundary_type": "min-1",
                "description": f"{name}: chuỗi {max(0, min_len - 1)} ký tự (dưới độ dài tối thiểu quy định)",
            })
            values.append({
                "value": _generate_string(min_len, name),
                "category": "valid",
                "boundary_type": "min",
                "description": f"{name}: chuỗi {min_len} ký tự (đúng mốc biên dưới tối thiểu)",
            })
            values.append({
                "value": _generate_string(min_len + 1, name),
                "category": "valid",
                "boundary_type": "min+1",
                "description": f"{name}: chuỗi {min_len + 1} ký tự (ngay trên mốc tối thiểu)",
            })

        if max_len is not None:
            values.append({
                "value": _generate_string(max_len - 1, name),
                "category": "valid",
                "boundary_type": "max-1",
                "description": f"{name}: chuỗi {max_len - 1} ký tự (ngay dưới mốc tối đa)",
            })
            values.append({
                "value": _generate_string(max_len, name),
                "category": "valid",
                "boundary_type": "max",
                "description": f"{name}: chuỗi {max_len} ký tự (đúng mốc biên trên tối đa)",
            })
            values.append({
                "value": _generate_string(max_len + 1, name),
                "category": "invalid",
                "boundary_type": "max+1",
                "description": f"{name}: chuỗi {max_len + 1} ký tự (vượt quá độ dài tối đa cho phép)",
            })

        # Nominal
        if min_len is not None and max_len is not None:
            nom_len = (min_len + max_len) // 2
            values.append({
                "value": _generate_string(nom_len, name),
                "category": "valid",
                "boundary_type": "nominal",
                "description": f"{name}: chuỗi {nom_len} ký tự (độ dài tiêu chuẩn danh định)",
            })

        # Empty string
        values.append({
            "value": "",
            "category": "invalid",
            "boundary_type": "empty",
            "description": f"{name}: chuỗi rỗng (empty string)",
        })

    # --- Kieu enum ---
    elif dtype == "enum" and enum_values:
        for val in enum_values:
            values.append({
                "value": val,
                "category": "valid",
                "boundary_type": "enum_member",
                "description": f"{name} = '{val}' (giá trị hợp lệ trong danh sách)",
            })
        invalid_enum = get_realistic_enum_invalid_value(parameter)
        values.append({
            "value": invalid_enum,
            "category": "invalid",
            "boundary_type": "enum_invalid",
            "description": f"{name} = '{invalid_enum}' (giá trị không nằm trong danh sách cho phép)",
        })

    # --- Kieu boolean ---
    elif dtype == "boolean":
        values.append({"value": True, "category": "valid", "boundary_type": "true", "description": f"{name} = true (Đúng)"})
        values.append({"value": False, "category": "valid", "boundary_type": "false", "description": f"{name} = false (Sai)"})

    # --- Null / None (cho moi kieu, neu la truong bat buoc) ---
    if is_required:
        values.append({
            "value": None,
            "category": "invalid",
            "boundary_type": "null",
            "description": f"{name} = null/empty (để trống trường bắt buộc)",
        })

    # Loai bo gia tri trung lap
    seen = set()
    unique_values = []
    for v in values:
        key = (str(v["value"]), v["boundary_type"])
        if key not in seen:
            seen.add(key)
            unique_values.append(v)

    return unique_values
