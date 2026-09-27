"""
Z3 SMT Constraint Solver Wrapper.

Giai bai toan tim gia tri thoa man (hoac vi pham) cac rang buoc cheo
giua nhieu tham so.

Vi du: "age + experience >= 20 AND role != 'admin' OR level > 3"
-> Z3 tim bo gia tri cu the cho tung test case positive/negative.
"""

try:
    from z3 import (
        Int, Real, String, Bool, StringVal,
        Solver, sat, unsat,
        And, Or, Not,
    )
    HAS_Z3 = True
except ImportError:
    HAS_Z3 = False

import re


def _parse_constraint_to_z3(constraint_str: str, z3_vars: dict):
    """
    Chuyen doi bieu thuc rang buoc dang chuoi thanh bieu thuc Z3.

    Ho tro cac phep toan don gian:
    - So sanh: >, <, >=, <=, ==, !=
    - Logic: AND, OR, NOT
    - Phep tinh: +, -, *, /

    Args:
        constraint_str: "age + experience >= 20"
        z3_vars: {"age": Int('age'), "experience": Int('experience')}

    Returns:
        Z3 expression hoac None neu khong parse duoc.
    """
    if not HAS_Z3:
        return None

    expr = constraint_str.strip()

    # Thay ten bien bang z3 var reference
    # Sort by length descending to avoid partial replacement
    sorted_names = sorted(z3_vars.keys(), key=len, reverse=True)
    token_map = {}
    for i, name in enumerate(sorted_names):
        placeholder = f"__VAR{i}__"
        token_map[placeholder] = z3_vars[name]
        # Replace whole word only
        expr = re.sub(rf'\b{re.escape(name)}\b', placeholder, expr)

    try:
        # Chuyen cac phep logic
        expr = re.sub(r'\bAND\b', ' and ', expr, flags=re.IGNORECASE)
        expr = re.sub(r'\bOR\b', ' or ', expr, flags=re.IGNORECASE)
        expr = re.sub(r'\bNOT\b', ' not ', expr, flags=re.IGNORECASE)
        expr = expr.replace('&&', ' and ').replace('||', ' or ')

        # Thay placeholder bang bien Z3 trong namespace
        namespace = dict(token_map)
        namespace['And'] = And
        namespace['Or'] = Or
        namespace['Not'] = Not

        result = eval(expr, {"__builtins__": {}}, namespace)
        return result
    except Exception:
        return None


def solve_constraints(
    parameters: list[dict],
    constraints: list[str],
) -> list[dict]:
    """
    Dung Z3 Solver de sinh cac bo gia tri thoa man / vi pham rang buoc.

    Args:
        parameters: danh sach tham so voi thong tin kieu, bien
        constraints: danh sach bieu thuc rang buoc dang chuoi

    Returns:
        list[dict]: cac bo gia tri, moi phan tu gom:
            {
                "input_data": {"age": 25, "experience": 5},
                "satisfies_all": True/False,
                "violated_constraint": None or "age + experience >= 20",
                "test_type": "positive" | "negative"
            }
    """
    if not HAS_Z3 or not constraints:
        return []

    # Tao Z3 variables
    z3_vars = {}
    for param in parameters:
        name = param["name"]
        dtype = param.get("data_type", "integer")
        if dtype in ("integer",):
            z3_vars[name] = Int(name)
        elif dtype in ("float",):
            z3_vars[name] = Real(name)
        else:
            # Skip non-numeric for Z3 constraint solving
            continue

    if not z3_vars:
        return []

    # Parse constraints thanh Z3 expressions
    z3_constraints = []
    valid_constraint_strs = []
    for c_str in constraints:
        z3_expr = _parse_constraint_to_z3(c_str, z3_vars)
        if z3_expr is not None:
            z3_constraints.append(z3_expr)
            valid_constraint_strs.append(c_str)

    if not z3_constraints:
        return []

    results = []

    # --- Positive test: tim gia tri thoa man TAT CA rang buoc ---
    solver = Solver()
    # Them domain constraints (min/max tu parameter)
    for param in parameters:
        name = param["name"]
        if name not in z3_vars:
            continue
        var = z3_vars[name]
        if param.get("min_value") is not None:
            solver.add(var >= param["min_value"])
        if param.get("max_value") is not None:
            solver.add(var <= param["max_value"])

    for z3_c in z3_constraints:
        solver.add(z3_c)

    if solver.check() == sat:
        model = solver.model()
        input_data = {}
        for name, var in z3_vars.items():
            val = model.evaluate(var, model_completion=True)
            try:
                input_data[name] = val.as_long()
            except Exception:
                try:
                    input_data[name] = float(val.as_decimal(6).rstrip('?'))
                except Exception:
                    input_data[name] = str(val)

        results.append({
            "input_data": input_data,
            "satisfies_all": True,
            "violated_constraint": None,
            "test_type": "positive",
        })

    # --- Negative tests: phu dinh tung rang buoc 1 (Single-Fault Assumption) ---
    for idx, z3_c in enumerate(z3_constraints):
        neg_solver = Solver()
        # Domain constraints
        for param in parameters:
            name = param["name"]
            if name not in z3_vars:
                continue
            var = z3_vars[name]
            if param.get("min_value") is not None:
                neg_solver.add(var >= param["min_value"])
            if param.get("max_value") is not None:
                neg_solver.add(var <= param["max_value"])

        # Giu nguyen cac constraint khac, phu dinh constraint thu idx
        for j, other_c in enumerate(z3_constraints):
            if j == idx:
                neg_solver.add(Not(other_c))
            else:
                neg_solver.add(other_c)

        if neg_solver.check() == sat:
            model = neg_solver.model()
            input_data = {}
            for name, var in z3_vars.items():
                val = model.evaluate(var, model_completion=True)
                try:
                    input_data[name] = val.as_long()
                except Exception:
                    try:
                        input_data[name] = float(val.as_decimal(6).rstrip('?'))
                    except Exception:
                        input_data[name] = str(val)

            results.append({
                "input_data": input_data,
                "satisfies_all": False,
                "violated_constraint": valid_constraint_strs[idx],
                "test_type": "negative",
            })

    return results
