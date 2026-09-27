"""
Pairwise / Combinatorial Testing Engine.

Wrapper cho thu vien allpairspy de sinh to hop Pairwise (2-way).
Dam bao moi cap tham so (A, B) deu xuat hien it nhat 1 lan
trong bo test suite, giam so luong test case dang ke so voi
tich Descartes day du.
"""

from itertools import product

try:
    from allpairspy import AllPairs
    HAS_ALLPAIRS = True
except ImportError:
    HAS_ALLPAIRS = False


def generate_pairwise_combinations(
    parameters: list[dict],
    values_per_param: dict[str, list],
) -> list[dict]:
    """
    Sinh cac to hop Pairwise tu danh sach tham so va gia tri cua chung.

    Args:
        parameters: danh sach tham so [{"name": "Age", ...}, {"name": "Password", ...}]
        values_per_param: dict anh xa ten tham so -> danh sach gia tri dai dien
            {
                "Age": [18, 39, 60],
                "Password": ["abcd1234", "abcdefghij1234567890"],
                "Role": ["Admin", "User", "Guest"]
            }

    Returns:
        list[dict]: moi phan tu la 1 to hop, vd:
            {"Age": 18, "Password": "abcd1234", "Role": "Admin"}
    """
    param_names = [p["name"] for p in parameters]
    param_values = [values_per_param.get(name, []) for name in param_names]

    # Loai bo param khong co gia tri
    active_names = []
    active_values = []
    for name, vals in zip(param_names, param_values):
        if vals:
            active_names.append(name)
            active_values.append(vals)

    if not active_names:
        return []

    # Neu chi co 1 param, sinh tung gia tri 1
    if len(active_names) == 1:
        return [{active_names[0]: v} for v in active_values[0]]

    # Neu allpairspy co san, dung Pairwise
    if HAS_ALLPAIRS:
        try:
            pairs = list(AllPairs(active_values))
            combinations = []
            for row in pairs:
                combo = {}
                for i, name in enumerate(active_names):
                    if i < len(row):
                        combo[name] = row[i]
                combinations.append(combo)
            return combinations
        except Exception:
            pass

    # Fallback: neu allpairspy khong co, dung brute-force giam nhe
    return _fallback_pairwise(active_names, active_values)


def _fallback_pairwise(names: list[str], values: list[list]) -> list[dict]:
    """
    Thuat toan Pairwise don gian khi khong co allpairspy.
    Duyet qua tung cap tham so va dam bao moi cap gia tri deu xuat hien.
    """
    if len(names) <= 2:
        # Voi 2 param tro xuong, tich Descartes = pairwise
        combos = list(product(*values))
        return [dict(zip(names, combo)) for combo in combos]

    # Greedy pairwise: bat dau tu tich cua 2 param dau, them tung param
    result_rows = []
    # Khoi tao voi tich Descartes cua 2 param dau tien
    for v0 in values[0]:
        for v1 in values[1]:
            result_rows.append([v0, v1])

    # Them tung param con lai
    for param_idx in range(2, len(names)):
        new_values = values[param_idx]
        new_rows = []
        val_cycle = 0
        for row in result_rows:
            extended = row + [new_values[val_cycle % len(new_values)]]
            new_rows.append(extended)
            val_cycle += 1

        # Kiem tra cac cap chua duoc phu giua param moi va cac param cu
        covered_pairs = set()
        for row in new_rows:
            for prev_idx in range(param_idx):
                covered_pairs.add((prev_idx, row[prev_idx], row[param_idx]))

        for prev_idx in range(param_idx):
            for old_val in values[prev_idx]:
                for new_val in new_values:
                    pair_key = (prev_idx, old_val, new_val)
                    if pair_key not in covered_pairs:
                        # Tao row moi de phu cap nay
                        extra_row = [None] * (param_idx + 1)
                        extra_row[prev_idx] = old_val
                        extra_row[param_idx] = new_val
                        # Dien cac cot con lai bang gia tri dau tien
                        for fill_idx in range(param_idx + 1):
                            if extra_row[fill_idx] is None:
                                extra_row[fill_idx] = values[fill_idx][0]
                        new_rows.append(extra_row)
                        covered_pairs.add(pair_key)

        result_rows = new_rows

    return [dict(zip(names, row)) for row in result_rows]


def get_pairwise_stats(
    parameters: list[dict],
    values_per_param: dict[str, list],
    combinations: list[dict],
) -> dict:
    """
    Tinh toan thong ke ve do phu Pairwise.

    Returns:
        {
            "total_combinations": <so to hop Pairwise sinh ra>,
            "full_cartesian_size": <so to hop tich Descartes day du>,
            "reduction_ratio": <ty le giam>,
            "pairwise_coverage": <ty le phu 2-way (%)>
        }
    """
    param_names = [p["name"] for p in parameters if p["name"] in values_per_param]
    active_values = [values_per_param[n] for n in param_names]

    # Tich Descartes
    cartesian_size = 1
    for vals in active_values:
        cartesian_size *= max(len(vals), 1)

    # Dem so cap da phu
    total_pairs = 0
    covered_pairs = set()

    for i in range(len(param_names)):
        for j in range(i + 1, len(param_names)):
            for vi in active_values[i]:
                for vj in active_values[j]:
                    total_pairs += 1

    for combo in combinations:
        for i in range(len(param_names)):
            for j in range(i + 1, len(param_names)):
                vi = combo.get(param_names[i])
                vj = combo.get(param_names[j])
                if vi is not None and vj is not None:
                    covered_pairs.add((param_names[i], str(vi), param_names[j], str(vj)))

    coverage = (len(covered_pairs) / total_pairs * 100) if total_pairs > 0 else 100.0

    return {
        "total_combinations": len(combinations),
        "full_cartesian_size": cartesian_size,
        "reduction_ratio": round(1 - len(combinations) / max(cartesian_size, 1), 4),
        "pairwise_coverage": round(coverage, 2),
    }
