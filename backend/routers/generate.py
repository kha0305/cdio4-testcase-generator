"""
Router: /api/generate

Nhan danh sach tham so (da chinh sua boi user), goi cac engine
de sinh bo test case hoan chinh.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import GenerateRequest, GenerateResponse, TestCaseOut
from models import Requirement, TestSuite, TestCase
from engine.assembler import assemble_test_suite

router = APIRouter(prefix="/api", tags=["Sinh Ca Kiểm Thử"])


@router.post(
    "/generate",
    response_model=GenerateResponse,
    summary="Sinh bộ ca kiểm thử tự động theo kỹ thuật",
    description="Nhận danh sách tham số và lựa chọn kỹ thuật kiểm thử (BVA, Phân vùng tương đương, Pairwise, Z3 Solver) để sinh bộ test case hoàn chỉnh.",
)
def generate_test_cases(req: GenerateRequest, db: Session = Depends(get_db)):
    """
    Nhận danh sách tham số + cấu hình kỹ thuật,
    sinh bộ test case đầy đủ và lưu vào cơ sở dữ liệu.
    """
    # Kiem tra requirement ton tai
    requirement = db.query(Requirement).filter(Requirement.id == req.requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy chức năng {req.requirement_id}")

    # Chuyen Pydantic models sang dict cho engine
    params_dicts = [p.model_dump() for p in req.parameters]

    # Chay assembler
    result = assemble_test_suite(
        parameters=params_dicts,
        techniques=req.techniques,
        constraints=req.constraints if req.constraints else None,
        requirement_title=requirement.title,
    )

    # Luu TestSuite
    test_suite = TestSuite(
        requirement_id=req.requirement_id,
        technique=",".join(req.techniques),
        total_cases=len(result["test_cases"]),
        coverage_info=result["coverage_info"],
    )
    db.add(test_suite)
    db.flush()

    # Luu tung TestCase
    tc_outputs = []
    for tc_data in result["test_cases"]:
        tc = TestCase(
            test_suite_id=test_suite.id,
            code=tc_data["code"],
            scenario=tc_data["scenario"],
            preconditions=tc_data.get("preconditions", ""),
            test_steps=tc_data.get("test_steps", ""),
            test_type=tc_data["test_type"],
            input_data=tc_data["input_data"],
            expected_result=tc_data["expected_result"],
            postconditions=tc_data.get("postconditions", ""),
            actual_result=tc_data.get("actual_result", ""),
            status=tc_data.get("status", "Untested"),
            priority=tc_data.get("priority", "Medium"),
            technique_source=tc_data.get("technique_source", ""),
        )
        db.add(tc)
        db.flush()

        tc_outputs.append(TestCaseOut(
            id=tc.id,
            code=tc.code,
            scenario=tc.scenario,
            preconditions=tc.preconditions,
            test_steps=tc.test_steps,
            test_type=tc.test_type,
            input_data=tc.input_data,
            expected_result=tc.expected_result,
            postconditions=tc.postconditions or "",
            actual_result=tc.actual_result or "",
            status=tc.status or "Untested",
            priority=tc.priority,
            technique_source=tc.technique_source,
        ))

    db.commit()

    return GenerateResponse(
        test_suite_id=test_suite.id,
        requirement_id=req.requirement_id,
        total_cases=len(tc_outputs),
        coverage_info=result["coverage_info"],
        test_cases=tc_outputs,
    )


@router.patch(
    "/testcases/{tc_id}",
    response_model=TestCaseOut,
    summary="Cập nhật kết quả kiểm thử thực tế (Pass/Fail)",
    description="Cập nhật trạng thái thực thi (Pass, Fail, Blocked, Untested) và kết quả thực tế (Actual Result) của ca kiểm thử.",
)
def update_test_case(tc_id: int, payload: dict, db: Session = Depends(get_db)):
    """Cập nhật kết quả kiểm thử thực tế."""
    tc = db.query(TestCase).filter(TestCase.id == tc_id).first()
    if not tc:
        raise HTTPException(status_code=404, detail="Không tìm thấy ca kiểm thử")

    if "status" in payload:
        tc.status = payload["status"]
    if "actual_result" in payload:
        tc.actual_result = payload["actual_result"]

    db.commit()
    db.refresh(tc)

    return TestCaseOut(
        id=tc.id,
        code=tc.code,
        scenario=tc.scenario,
        preconditions=tc.preconditions,
        test_steps=tc.test_steps,
        test_type=tc.test_type,
        input_data=tc.input_data,
        expected_result=tc.expected_result,
        actual_result=tc.actual_result or "",
        status=tc.status or "Untested",
        priority=tc.priority,
        technique_source=tc.technique_source,
    )


@router.get(
    "/suites/{suite_id}",
    response_model=GenerateResponse,
    summary="Chi tiết bộ Test Suite và danh sách ca kiểm thử",
    description="Lấy chi tiết bộ kiểm thử (TestSuite) kèm độ bao phủ Pairwise và toàn bộ các ca kiểm thử bên trong.",
)
def get_suite_details(suite_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết Test Suite kèm danh sách Test Cases để xem lại hoặc thực thi tiếp."""
    suite = db.query(TestSuite).filter(TestSuite.id == suite_id).first()
    if not suite:
        raise HTTPException(status_code=404, detail="Không tìm thấy bộ kiểm thử")

    tc_outputs = [
        TestCaseOut(
            id=tc.id,
            code=tc.code,
            scenario=tc.scenario,
            preconditions=tc.preconditions or "",
            test_steps=tc.test_steps or "",
            test_type=tc.test_type,
            input_data=tc.input_data,
            expected_result=tc.expected_result,
            actual_result=tc.actual_result or "",
            status=tc.status or "Untested",
            priority=tc.priority or "Medium",
            technique_source=tc.technique_source or "",
        )
        for tc in suite.test_cases
    ]

    return GenerateResponse(
        test_suite_id=suite.id,
        requirement_id=suite.requirement_id,
        total_cases=len(tc_outputs),
        coverage_info=suite.coverage_info or {},
        test_cases=tc_outputs,
    )
