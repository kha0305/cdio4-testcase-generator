"""
Router: /api/requirements

Quan ly toan dien cac Chuc Nang Con / Yeu Cau Kiem Thu (User Stories) trong Du An:
- Danh sach cac chuc nang thuoc 1 du an kem tien do kiem thu
- Tao moi chuc nang
- Chinh sua thong tin, phan cong (Assignee), han chot (Due Date), muc do uu tien, trang thai
- Xoa chuc nang
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Project, Requirement, Parameter, TestSuite, TestCase
from schemas import RequirementCreate, RequirementUpdate, RequirementOut

router = APIRouter(prefix="/api/requirements", tags=["Chức năng & Yêu cầu"])


def _calculate_requirement_stats(r: Requirement, db: Session) -> RequirementOut:
    """Tinh toan thong ke cho 1 chuc nang con."""
    params_cnt = len(r.parameters)
    suites = r.test_suites
    suites_cnt = len(suites)

    all_cases = []
    for s in suites:
        all_cases.extend(s.test_cases)

    total_cases = len(all_cases)
    pass_cnt = sum(1 for tc in all_cases if tc.status and tc.status.strip().lower() in ("pass", "passed", "đạt"))
    fail_cnt = sum(1 for tc in all_cases if tc.status and tc.status.strip().lower() in ("fail", "failed", "không đạt", "lỗi"))

    created_str = r.created_at.strftime("%d/%m/%Y %H:%M") if r.created_at else ""

    return RequirementOut(
        id=r.id,
        project_id=r.project_id,
        sprint_id=r.sprint_id,
        title=r.title or f"Chức năng #{r.id}",
        raw_text=r.raw_text,
        format_type=r.format_type or "free_text",
        assignee_name=r.assignee_name or "",
        due_date=r.due_date or "",
        priority=r.priority or "Medium",
        status=r.status or "planning",
        created_at=created_str,
        parameters_count=params_cnt,
        test_suites_count=suites_cnt,
        total_cases=total_cases,
        pass_count=pass_cnt,
        fail_count=fail_cnt,
    )


@router.get(
    "/project/{project_id}",
    response_model=list[RequirementOut],
    summary="Danh sách chức năng con trong dự án",
    description="Lấy danh sách tất cả các chức năng con (User Stories / Requirements) trong dự án kèm chỉ số kiểm thử.",
)
def get_project_requirements(project_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách tất cả các chức năng con trong 1 dự án."""
    reqs = db.query(Requirement).filter(Requirement.project_id == project_id).order_by(Requirement.id.desc()).all()
    return [_calculate_requirement_stats(r, db) for r in reqs]


@router.post(
    "",
    response_model=RequirementOut,
    summary="Tạo chức năng con / User Story mới",
    description="Tạo một chức năng mới trong dự án kèm đặc tả yêu cầu, người thực hiện, thời hạn và độ ưu tiên.",
)
def create_requirement(payload: RequirementCreate, db: Session = Depends(get_db)):
    """Tạo một chức năng con / User Story mới trong dự án."""
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án")

    req = Requirement(
        project_id=payload.project_id,
        sprint_id=payload.sprint_id,
        title=payload.title.strip(),
        raw_text=payload.raw_text.strip(),
        format_type=payload.format_type or "free_text",
        assignee_name=payload.assignee_name or "",
        due_date=payload.due_date or "",
        priority=payload.priority or "Medium",
        status=payload.status or "planning",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return _calculate_requirement_stats(req, db)


@router.put(
    "/{requirement_id}",
    response_model=RequirementOut,
    summary="Cập nhật chức năng, phân công và trạng thái",
    description="Chỉnh sửa tiêu đề, đặc tả yêu cầu, phân công người kiểm thử (Assignee), thời hạn (Due Date) hoặc cập nhật tiến độ (planning / in_testing / completed).",
)
def update_requirement(requirement_id: int, payload: RequirementUpdate, db: Session = Depends(get_db)):
    """Chỉnh sửa thông tin chức năng con, phân công và trạng thái."""
    req = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Không tìm thấy chức năng")

    if payload.title is not None:
        req.title = payload.title
    if payload.raw_text is not None:
        req.raw_text = payload.raw_text
    if payload.format_type is not None:
        req.format_type = payload.format_type
    if payload.sprint_id is not None:
        req.sprint_id = payload.sprint_id
    if payload.assignee_name is not None:
        req.assignee_name = payload.assignee_name
    if payload.due_date is not None:
        req.due_date = payload.due_date
    if payload.priority is not None:
        req.priority = payload.priority
    if payload.status is not None:
        req.status = payload.status

    db.commit()
    db.refresh(req)
    return _calculate_requirement_stats(req, db)


@router.delete(
    "/{requirement_id}",
    summary="Xóa chức năng con",
    description="Xóa vĩnh viễn chức năng con cùng toàn bộ tham số và các bộ ca kiểm thử liên quan.",
)
def delete_requirement(requirement_id: int, db: Session = Depends(get_db)):
    """Xóa chức năng con kèm parameters và test suites liên quan."""
    req = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Không tìm thấy chức năng")

    db.delete(req)
    db.commit()
    return {"message": f"Chức năng {requirement_id} đã được xóa thành công"}
