"""
Router: /api/export

Xuat bo test case thanh file Excel (.xlsx) hoac CSV.
"""

import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models import TestSuite, TestCase

try:
    import openpyxl
    from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
    HAS_OPENPYXL = True
except ImportError:
    HAS_OPENPYXL = False

router = APIRouter(prefix="/api", tags=["Xuất Báo Cáo"])


# Tieu de cot chuan cho file Excel kiem thu chuyen nghiep theo chuan ISO/IEC/IEEE 29119-3 & QA/QC
EXCEL_HEADERS = [
    "Test Case ID",
    "Scenario / Description",
    "Preconditions",
    "Test Steps",
    "Test Type",
    "Input Data",
    "Expected Result",
    "Postconditions",
    "Actual Result",
    "Status (Pass/Fail)",
    "Priority",
    "Technique",
]


@router.get(
    "/export/{suite_id}",
    summary="Xuất bộ ca kiểm thử (Excel 2 sheet, CSV, JSON, Markdown)",
    description="Xuất khẩu dữ liệu ca kiểm thử của bộ Test Suite ra các định dạng chuẩn: Excel chuyên nghiệp (Báo cáo tổng kết + Chi tiết ca test), CSV, JSON, hoặc bảng Markdown.",
)
def export_test_suite(suite_id: int, format: str = "xlsx", db: Session = Depends(get_db)):
    """Xuất bộ test case ra file Excel, CSV, JSON hoặc Markdown."""
    suite = db.query(TestSuite).filter(TestSuite.id == suite_id).first()
    if not suite:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy bộ kiểm thử {suite_id}")

    test_cases = (
        db.query(TestCase)
        .filter(TestCase.test_suite_id == suite_id)
        .order_by(TestCase.id)
        .all()
    )

    if not test_cases:
        raise HTTPException(status_code=404, detail="No test cases found in this suite")

    if format == "csv":
        return _export_csv(test_cases, suite_id)
    elif format == "json":
        return _export_json(test_cases, suite_id)
    elif format in ("markdown", "md"):
        return _export_markdown(test_cases, suite_id)
    else:
        return _export_xlsx(test_cases, suite)


def _format_input_data(data: dict) -> str:
    """Chuyen dict input_data thanh chuoi doc duoc."""
    if not data:
        return ""
    parts = []
    for k, v in data.items():
        parts.append(f"{k} = {repr(v)}")
    return "\n".join(parts)


def _export_csv(test_cases: list[TestCase], suite_id: int) -> StreamingResponse:
    """Xuat file CSV theo chuan kiem thu."""
    import csv

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(EXCEL_HEADERS)

    for tc in test_cases:
        writer.writerow([
            tc.code,
            tc.scenario,
            tc.preconditions or "",
            tc.test_steps or "",
            tc.test_type.upper(),
            _format_input_data(tc.input_data),
            tc.expected_result,
            tc.postconditions or "",
            tc.actual_result or "",
            tc.status or "Untested",
            tc.priority,
            tc.technique_source,
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=test_suite_{suite_id}.csv"},
    )


def _export_json(test_cases: list[TestCase], suite_id: int) -> StreamingResponse:
    """Xuat du lieu Test Cases duoi dang JSON chuan."""
    import json
    data = [
        {
            "id": tc.id,
            "code": tc.code,
            "scenario": tc.scenario,
            "preconditions": tc.preconditions or "",
            "test_steps": tc.test_steps or "",
            "test_type": tc.test_type,
            "input_data": tc.input_data,
            "expected_result": tc.expected_result,
            "postconditions": tc.postconditions or "",
            "actual_result": tc.actual_result or "",
            "status": tc.status or "Untested",
            "priority": tc.priority or "Medium",
            "technique_source": tc.technique_source or "",
        }
        for tc in test_cases
    ]
    json_bytes = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
    return StreamingResponse(
        io.BytesIO(json_bytes),
        media_type="application/json; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="test_suite_{suite_id}.json"'},
    )


def _export_markdown(test_cases: list[TestCase], suite_id: int) -> StreamingResponse:
    """Xuat bao cao Test Cases duoi dang bang Markdown dep, chuyen nghiep."""
    lines = [
        f"# Báo Cáo Bộ Kiểm Thử #{suite_id}",
        "",
        f"**Tổng số ca kiểm thử:** {len(test_cases)}",
        "",
        "| Mã TC | Kịch bản / Mục tiêu kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Trạng thái | Mức ưu tiên |",
        "|---|---|---|---|---|---|",
    ]
    for tc in test_cases:
        inputs_str = ", ".join(f"`{k}={v}`" for k, v in (tc.input_data or {}).items())
        scenario = (tc.scenario or "").replace("|", "\\|").replace("\n", " ")
        expected = (tc.expected_result or "").replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {tc.code} | {scenario} | {inputs_str} | {expected} | {tc.status or 'Chưa kiểm'} | {tc.priority or 'Medium'} |")

    md_content = "\n".join(lines).encode("utf-8")
    return StreamingResponse(
        io.BytesIO(md_content),
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="test_suite_{suite_id}.md"'},
    )


def _export_xlsx(test_cases: list[TestCase], suite: TestSuite) -> StreamingResponse:
    """Xuat file Excel chuyen nghiep 2 sheet: Sheet 1 Báo Cáo Tổng Kết (Test Report), Sheet 2 Chi Tiết Test Cases."""
    if not HAS_OPENPYXL:
        raise HTTPException(status_code=500, detail="openpyxl not installed")

    import datetime
    now_str = datetime.datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    wb = openpyxl.Workbook()

    # =========================================================================
    # SHEET 1: BÁO CÁO TỔNG KẾT DỰ ÁN (PROJECT TEST SUMMARY REPORT)
    # =========================================================================
    ws_rep = wb.active
    ws_rep.title = "Báo Cáo Tổng Kết"

    total = len(test_cases)
    pass_cnt = sum(1 for tc in test_cases if tc.status == "Pass")
    fail_cnt = sum(1 for tc in test_cases if tc.status == "Fail")
    blocked_cnt = sum(1 for tc in test_cases if tc.status == "Blocked")
    untested_cnt = sum(1 for tc in test_cases if not tc.status or tc.status == "Untested")

    exec_rate = round(((total - untested_cnt) / total * 100), 1) if total else 0
    pass_rate = round((pass_cnt / total * 100), 1) if total else 0
    fail_rate = round((fail_cnt / total * 100), 1) if total else 0

    cov_info = suite.coverage_info or {}
    pw_stats = cov_info.get("pairwise_stats", {})
    pw_cov = pw_stats.get("pairwise_coverage", 100) if pw_stats else 100
    pw_red = round(pw_stats.get("reduction_ratio", 0) * 100, 1) if pw_stats else 0

    project_name = "Dự Án Phần Mềm (Software Project)"
    req_title = "Đặc tả yêu cầu kiểm thử"
    if suite.requirement:
        req_title = suite.requirement.title or req_title
        if suite.requirement.project:
            project_name = suite.requirement.project.name or project_name

    # Styles
    title_font = Font(name="Segoe UI", bold=True, size=15, color="FFFFFF")
    title_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    sec_font = Font(name="Segoe UI", bold=True, size=11, color="1E3A8A")
    sec_fill = PatternFill(start_color="E0E7FF", end_color="E0E7FF", fill_type="solid")
    bold_font = Font(name="Segoe UI", bold=True, size=10)
    normal_font = Font(name="Segoe UI", size=10)
    center_align = Alignment(horizontal="center", vertical="center")
    left_align = Alignment(horizontal="left", vertical="center")

    thin_border = Border(
        left=Side(style="thin", color="D1D5DB"),
        right=Side(style="thin", color="D1D5DB"),
        top=Side(style="thin", color="D1D5DB"),
        bottom=Side(style="thin", color="D1D5DB"),
    )

    # 1. Banner
    ws_rep.merge_cells("A1:G1")
    cell_t = ws_rep.cell(row=1, column=1, value="BÁO CÁO TỔNG KẾT KIỂM THỬ DỰ ÁN (PROJECT TEST REPORT)")
    cell_t.font = title_font
    cell_t.fill = title_fill
    cell_t.alignment = center_align
    ws_rep.row_dimensions[1].height = 36

    # 2. Project Information
    info_rows = [
        ("Tên dự án / Module:", project_name, "Ngày xuất báo cáo:", now_str),
        ("Đặc tả kiểm thử:", req_title, "Mã bộ kiểm thử:", f"TS_{suite.id:04d}"),
        ("Tiêu chuẩn áp dụng:", "ISTQB / CDIO-4 Automated Testing", "Động cơ sinh test:", "BVA + EP + Pairwise (All-Pairs)"),
    ]

    ws_rep.merge_cells("A3:G3")
    sec1 = ws_rep.cell(row=3, column=1, value="1. THÔNG TIN DỰ ÁN & MÔI TRƯỜNG KIỂM THỬ")
    sec1.font = sec_font
    sec1.fill = sec_fill
    sec1.alignment = left_align

    for r_idx, (k1, v1, k2, v2) in enumerate(info_rows, 4):
        ws_rep.cell(row=r_idx, column=1, value=k1).font = bold_font
        ws_rep.cell(row=r_idx, column=2, value=v1).font = normal_font
        ws_rep.cell(row=r_idx, column=4, value=k2).font = bold_font
        ws_rep.cell(row=r_idx, column=5, value=v2).font = normal_font

    # 3. KPI Metrics Table
    ws_rep.merge_cells("A8:G8")
    sec2 = ws_rep.cell(row=8, column=1, value="2. CHỈ SỐ ĐO LƯỜNG THỰC THI KIỂM THỬ (KEY TEST METRICS)")
    sec2.font = sec_font
    sec2.fill = sec_fill
    sec2.alignment = left_align

    kpi_headers = ["Hạng mục kiểm thử", "Số lượng", "Tỷ lệ (%)", "Đánh giá chất lượng"]
    for c_i, h in enumerate(kpi_headers, 1):
        c = ws_rep.cell(row=9, column=c_i, value=h)
        c.font = bold_font
        c.fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
        c.border = thin_border
        c.alignment = center_align

    kpi_data = [
        ("Tổng số ca kiểm thử (Total Cases)", total, "100%", "Toàn bộ ca kiểm thử thiết kế"),
        ("Số ca ĐẠT (Pass)", pass_cnt, f"{pass_rate}%", "Chức năng hoạt động chính xác"),
        ("Số ca LỖI (Fail)", fail_cnt, f"{fail_rate}%", "Phát hiện lỗi cần sửa chữa (Defects)" if fail_cnt else "Không phát hiện lỗi"),
        ("Số ca BỊ CHẶN (Blocked)", blocked_cnt, f"{round(blocked_cnt/total*100,1) if total else 0}%", "Không thể chạy do phụ thuộc"),
        ("Số ca CHƯA CHẠY (Untested)", untested_cnt, f"{round(untested_cnt/total*100,1) if total else 0}%", "Chưa thực thi kiểm thử"),
        ("Tỷ lệ thực thi kiểm thử", total - untested_cnt, f"{exec_rate}%", "Độ hoàn thiện quy trình test"),
        ("Độ bao phủ Pairwise (Coverage)", f"{pw_cov}%", "100%", "Bao phủ 100% mọi cặp tương tác 2 chiều"),
        ("Tỷ lệ giảm tải tổ hợp (Reduction)", f"-{pw_red}%", "-", "Tối ưu hóa so với tích Descartes"),
    ]

    for r_i, (metric, count, pct, note) in enumerate(kpi_data, 10):
        c1 = ws_rep.cell(row=r_i, column=1, value=metric)
        c2 = ws_rep.cell(row=r_i, column=2, value=count)
        c3 = ws_rep.cell(row=r_i, column=3, value=pct)
        c4 = ws_rep.cell(row=r_i, column=4, value=note)

        c1.font = normal_font
        c2.font = bold_font
        c3.font = bold_font
        c4.font = normal_font

        c1.border = thin_border
        c2.border = thin_border
        c3.border = thin_border
        c4.border = thin_border

        c2.alignment = center_align
        c3.alignment = center_align

        # Highlight Pass / Fail
        if "ĐẠT (Pass)" in metric:
            c2.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
            c3.fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
        elif "LỖI (Fail)" in metric and fail_cnt > 0:
            c2.fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
            c3.fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")

    # 4. Verdict / Kết luận nghiệm thu
    row_verdict = 19
    ws_rep.merge_cells(f"A{row_verdict}:G{row_verdict}")
    sec3 = ws_rep.cell(row=row_verdict, column=1, value="3. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG NGHIỆM THU")
    sec3.font = sec_font
    sec3.fill = sec_fill
    sec3.alignment = left_align

    verdict_text = "ĐANG TRONG TIẾN TRÌNH KIỂM THỬ (TESTING IN PROGRESS)"
    verdict_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
    verdict_color = "92400E"

    if fail_cnt > 0:
        verdict_text = f"CHƯA ĐẠT CHUẨN (CÓ {fail_cnt} CA TEST THẤT BẠI CẦN KHẮC PHỤC TRƯỚC KHI RELEASE)"
        verdict_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
        verdict_color = "991B1B"
    elif untested_cnt == 0 and pass_cnt == total:
        verdict_text = "ĐẠT CHUẨN NGHIỆM THU CHẤT LƯỢNG (100% CA TEST PASS - SẴN SÀNG TRIỂN KHAI)"
        verdict_fill = PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid")
        verdict_color = "166534"

    ws_rep.merge_cells(f"A{row_verdict+1}:G{row_verdict+1}")
    v_cell = ws_rep.cell(row=row_verdict+1, column=1, value=verdict_text)
    v_cell.font = Font(name="Segoe UI", bold=True, size=11, color=verdict_color)
    v_cell.fill = verdict_fill
    v_cell.alignment = center_align
    v_cell.border = thin_border
    ws_rep.row_dimensions[row_verdict+1].height = 30

    ws_rep.column_dimensions["A"].width = 38
    ws_rep.column_dimensions["B"].width = 24
    ws_rep.column_dimensions["C"].width = 18
    ws_rep.column_dimensions["D"].width = 45
    ws_rep.column_dimensions["E"].width = 30

    # =========================================================================
    # SHEET 2: CHI TIẾT TEST CASES (DETAILED TEST CASES)
    # =========================================================================
    ws = wb.create_sheet(title="Chi Tiết Test Cases")

    header_font = Font(name="Segoe UI", bold=True, size=11, color="FFFFFF")
    header_fill = PatternFill(start_color="2563EB", end_color="2563EB", fill_type="solid")
    header_alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

    cell_font = Font(name="Segoe UI", size=10)
    cell_alignment = Alignment(vertical="top", wrap_text=True)

    type_fills = {
        "positive": PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid"),
        "negative": PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid"),
        "boundary": PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid"),
    }

    status_styles = {
        "Pass": {
            "fill": PatternFill(start_color="DCFCE7", end_color="DCFCE7", fill_type="solid"),
            "font": Font(name="Segoe UI", size=10, bold=True, color="166534"),
        },
        "Fail": {
            "fill": PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid"),
            "font": Font(name="Segoe UI", size=10, bold=True, color="991B1B"),
        },
        "Blocked": {
            "fill": PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid"),
            "font": Font(name="Segoe UI", size=10, bold=True, color="92400E"),
        },
        "Untested": {
            "fill": PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid"),
            "font": Font(name="Segoe UI", size=10, color="4B5563"),
        },
    }

    # Write headers
    for col_idx, header in enumerate(EXCEL_HEADERS, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = thin_border

    # Write data
    for row_idx, tc in enumerate(test_cases, 2):
        status_val = tc.status or "Untested"
        values = [
            tc.code,
            tc.scenario,
            tc.preconditions or "",
            tc.test_steps or "",
            tc.test_type.upper(),
            _format_input_data(tc.input_data),
            tc.expected_result,
            tc.postconditions or "",
            tc.actual_result or "",
            status_val,
            tc.priority,
            tc.technique_source,
        ]
        for col_idx, val in enumerate(values, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = cell_font
            cell.alignment = cell_alignment
            cell.border = thin_border

        type_fill = type_fills.get(tc.test_type.lower())
        if type_fill:
            ws.cell(row=row_idx, column=5).fill = type_fill

        status_cell = ws.cell(row=row_idx, column=10)
        status_cell.alignment = Alignment(horizontal="center", vertical="center")
        if status_val in status_styles:
            status_cell.fill = status_styles[status_val]["fill"]
            status_cell.font = status_styles[status_val]["font"]

    col_widths = [14, 45, 30, 40, 14, 35, 40, 35, 30, 18, 12, 14]
    for col_idx, width in enumerate(col_widths, 1):
        ws.column_dimensions[openpyxl.utils.get_column_letter(col_idx)].width = width

    ws.freeze_panes = "A2"

    # Save to bytes
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=project_test_report_{suite.id}.xlsx"},
    )
