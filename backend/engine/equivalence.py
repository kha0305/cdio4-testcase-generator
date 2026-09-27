"""
Equivalence Partitioning (EP) Engine.

Chia mien gia tri cua moi tham so thanh cac lop tuong duong:
- Valid Equivalence Class (VEC): cac gia tri hop le dai dien
- Invalid Equivalence Class (IEC): cac gia tri khong hop le dai dien
"""


from engine.semantic_synthesizer import (
    detect_parameter_domain,
    generate_realistic_string,
    get_realistic_type_mismatch_value,
    get_realistic_enum_invalid_value,
    get_realistic_format_violations,
)


def generate_ep_classes(parameter: dict) -> dict:
    """
    Sinh cac lop tuong duong cho 1 tham so.

    Returns:
        {
            "parameter_name": "Age",
            "valid_classes": [
                {"class_id": "VEC_1", "description": "...", "representative_value": 25}
            ],
            "invalid_classes": [
                {"class_id": "IEC_1", "description": "...", "representative_value": -5}
            ]
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

    valid_classes = []
    invalid_classes = []
    v_idx = 1
    i_idx = 1

    # --- Kieu so ---
    if dtype in ("integer", "float") and (min_val is not None or max_val is not None):
        # VEC: gia tri nam trong khoang [min, max]
        if min_val is not None and max_val is not None:
            mid = int((min_val + max_val) / 2) if dtype == "integer" else round((min_val + max_val) / 2, 2)
            valid_classes.append({
                "class_id": f"VEC_{v_idx}",
                "description": f"{name} nằm trong khoảng [{min_val}, {max_val}]",
                "representative_value": mid,
            })
            v_idx += 1
        elif min_val is not None:
            valid_classes.append({
                "class_id": f"VEC_{v_idx}",
                "description": f"{name} >= {min_val}",
                "representative_value": int(min_val + 10) if dtype == "integer" else round(min_val + 10, 2),
            })
            v_idx += 1
        elif max_val is not None:
            valid_classes.append({
                "class_id": f"VEC_{v_idx}",
                "description": f"{name} <= {max_val}",
                "representative_value": int(max_val - 10) if dtype == "integer" else round(max_val - 10, 2),
            })
            v_idx += 1

        # IEC: duoi min
        if min_val is not None:
            below = int(min_val - 10) if dtype == "integer" else round(min_val - 10, 2)
            invalid_classes.append({
                "class_id": f"IEC_{i_idx}",
                "description": f"{name} < {min_val} (dưới giới hạn tối thiểu)",
                "representative_value": below,
            })
            i_idx += 1

        # IEC: tren max
        if max_val is not None:
            above = int(max_val + 10) if dtype == "integer" else round(max_val + 10, 2)
            invalid_classes.append({
                "class_id": f"IEC_{i_idx}",
                "description": f"{name} > {max_val} (vượt quá giới hạn tối đa)",
                "representative_value": above,
            })
            i_idx += 1

        # IEC: sai kieu (chuỗi tiếng Việt thực tế thay vì 'abc')
        mismatch_val = get_realistic_type_mismatch_value(parameter)
        invalid_classes.append({
            "class_id": f"IEC_{i_idx}",
            "description": f"{name} sai kiểu dữ liệu (nhập chuỗi '{mismatch_val}' thay vì số)",
            "representative_value": mismatch_val,
        })
        i_idx += 1

    # --- Kieu chuoi co gioi han do dai ---
    elif dtype == "string" and (min_len is not None or max_len is not None):
        domain = detect_parameter_domain(name, "string")
        # VEC
        if min_len is not None and max_len is not None:
            mid_len = (min_len + max_len) // 2
            val_vec = generate_realistic_string(domain, mid_len)
            valid_classes.append({
                "class_id": f"VEC_{v_idx}",
                "description": f"{name} độ dài hợp lệ trong khoảng [{min_len}, {max_len}] ký tự",
                "representative_value": val_vec,
            })
            v_idx += 1

        # IEC: qua ngan
        if min_len is not None and min_len > 0:
            short_len = max(0, min_len - 2)
            val_short = generate_realistic_string(domain, short_len)
            invalid_classes.append({
                "class_id": f"IEC_{i_idx}",
                "description": f"{name} quá ngắn (độ dài {short_len} < {min_len} ký tự tối thiểu)",
                "representative_value": val_short,
            })
            i_idx += 1

        # IEC: qua dai
        if max_len is not None:
            long_len = max_len + 5
            val_long = generate_realistic_string(domain, long_len)
            invalid_classes.append({
                "class_id": f"IEC_{i_idx}",
                "description": f"{name} quá dài (độ dài {long_len} > {max_len} ký tự tối đa)",
                "representative_value": val_long,
            })
            i_idx += 1

        # IEC: rong
        invalid_classes.append({
            "class_id": f"IEC_{i_idx}",
            "description": f"{name} để trống hoặc chuỗi rỗng không nhập",
            "representative_value": "",
        })
        i_idx += 1

        # IEC: chuoi chi chua khoang trang (Whitespace-only robustness ISTQB)
        invalid_classes.append({
            "class_id": f"IEC_{i_idx}",
            "description": f"{name} chỉ chứa ký tự khoảng trắng không hợp lệ",
            "representative_value": "   ",
        })
        i_idx += 1

        # IEC: Vi pham dinh dang ngu canh nghiep vu thuc te (Email, Password, Phone, Date)
        for violation in get_realistic_format_violations(parameter):
            invalid_classes.append({
                "class_id": f"IEC_{i_idx}",
                "description": f"{name} vi phạm định dạng: {violation['reason']}",
                "representative_value": violation["value"],
            })
            i_idx += 1

    # --- Kieu enum ---
    elif dtype == "enum" and enum_values:
        for val in enum_values:
            valid_classes.append({
                "class_id": f"VEC_{v_idx}",
                "description": f"{name} = '{val}' (giá trị hợp lệ)",
                "representative_value": val,
            })
            v_idx += 1

        invalid_enum = get_realistic_enum_invalid_value(parameter)
        invalid_classes.append({
            "class_id": f"IEC_{i_idx}",
            "description": f"{name} = '{invalid_enum}' (giá trị không nằm trong danh mục cho phép)",
            "representative_value": invalid_enum,
        })
        i_idx += 1

    # --- Kieu boolean ---
    elif dtype == "boolean":
        valid_classes.append({"class_id": f"VEC_{v_idx}", "description": f"{name} = true (Đúng)", "representative_value": True})
        v_idx += 1
        valid_classes.append({"class_id": f"VEC_{v_idx}", "description": f"{name} = false (Sai)", "representative_value": False})
        v_idx += 1

    # Null class (cho truong bat buoc)
    if is_required:
        invalid_classes.append({
            "class_id": f"IEC_{i_idx}",
            "description": f"{name} = null / để trống (trường bắt buộc)",
            "representative_value": None,
        })

    return {
        "parameter_name": name,
        "valid_classes": valid_classes,
        "invalid_classes": invalid_classes,
    }
