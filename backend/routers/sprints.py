"""
Router: /api/sprints

Quan ly chu ky kiem thu Scrum (Sprints & Definition of Done - DoD):
- Danh sach Sprints cua 1 du an kem KPI tien do
- Tao Sprint moi
- Chinh sua Sprint
- Xoa Sprint
- Danh gia tieu chi hoan thanh Definition of Done (DoD)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Project, Sprint, Requirement, TestSuite, TestCase
from schemas import SprintCreate, SprintUpdate, SprintOut

router = APIRouter(prefix="/api/sprints", tags=["Quản lý Sprint & Scrum"])


def _calculate_sprint_stats(sprint: Sprint, db: Session) -> SprintOut:
    """Tinh toan tien do kiem thu va kiem tra tieu chi DoD cua Sprint."""
    reqs = db.query(Requirement).filter(Requirement.sprint_id == sprint.id).all()
    req_ids = [r.id for r in reqs]
    req_count = len(req_ids)

    total_cases = 0
    pass_cnt = 0
    fail_cnt = 0

    if req_ids:
        suite_ids = [s[0] for s in db.query(TestSuite.id).filter(TestSuite.requirement_id.in_(req_ids)).all()]
        if suite_ids:
            cases = db.query(TestCase.status).filter(TestCase.test_suite_id.in_(suite_ids)).all()
            total_cases = len(cases)
            pass_cnt = sum(1 for (st,) in cases if st and st.strip().lower() in ("pass", "passed", "đạt"))
            fail_cnt = sum(1 for (st,) in cases if st and st.strip().lower() in ("fail", "failed", "không đạt", "lỗi"))

    pass_rate = round((pass_cnt / total_cases * 100), 1) if total_cases > 0 else 0.0

    # Tieu chi Definition of Done: Da thuc thi 100% test case va ty le Pass >= 90%
    executed_cases = pass_cnt + fail_cnt
    dod_met = (total_cases > 0 and executed_cases == total_cases and pass_rate >= 90.0)

    created_str = sprint.created_at.strftime("%d/%m/%Y") if sprint.created_at else ""

    return SprintOut(
        id=sprint.id,
        project_id=sprint.project_id,
        name=sprint.name,
        goal=sprint.goal or "",
        start_date=sprint.start_date or "",
        end_date=sprint.end_date or "",
        status=sprint.status or "active",
        created_at=created_str,
        requirements_count=req_count,
        total_cases=total_cases,
        pass_count=pass_cnt,
        fail_count=fail_cnt,
        pass_rate=pass_rate,
        dod_met=dod_met,
    )


@router.get(
    "/project/{project_id}",
    response_model=list[SprintOut],
    summary="Danh sách Sprint của dự án",
    description="Lấy danh sách toàn bộ các chu kỳ Sprint trong dự án kèm chỉ số hoàn thành tiêu chuẩn Definition of Done (DoD).",
)
def get_project_sprints(project_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách các Sprint của 1 dự án."""
    sprints = db.query(Sprint).filter(Sprint.project_id == project_id).order_by(Sprint.id.desc()).all()
    return [_calculate_sprint_stats(s, db) for s in sprints]


@router.post(
    "",
    response_model=SprintOut,
    summary="Tạo Sprint mới trong dự án",
    description="Khởi tạo một chu kỳ Sprint mới với mục tiêu kiểm thử (Sprint Goal), ngày bắt đầu và kết thúc.",
)
def create_sprint(payload: SprintCreate, db: Session = Depends(get_db)):
    """Tạo Sprint mới trong dự án."""
    project = db.query(Project).filter(Project.id == payload.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Không tìm thấy dự án")

    sprint = Sprint(
        project_id=payload.project_id,
        name=payload.name,
        goal=payload.goal or "",
        start_date=payload.start_date or "",
        end_date=payload.end_date or "",
        status=payload.status or "active",
    )
    db.add(sprint)
    db.commit()
    db.refresh(sprint)
    return _calculate_sprint_stats(sprint, db)


@router.put(
    "/{sprint_id}",
    response_model=SprintOut,
    summary="Cập nhật thông tin Sprint",
    description="Chỉnh sửa tên Sprint, mục tiêu, ngày bắt đầu, ngày kết thúc hoặc trạng thái hoàn thành.",
)
def update_sprint(sprint_id: int, payload: SprintUpdate, db: Session = Depends(get_db)):
    """Chỉnh sửa thông tin Sprint."""
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Không tìm thấy Sprint")

    if payload.name is not None:
        sprint.name = payload.name
    if payload.goal is not None:
        sprint.goal = payload.goal
    if payload.start_date is not None:
        sprint.start_date = payload.start_date
    if payload.end_date is not None:
        sprint.end_date = payload.end_date
    if payload.status is not None:
        sprint.status = payload.status

    db.commit()
    db.refresh(sprint)
    return _calculate_sprint_stats(sprint, db)


@router.delete(
    "/{sprint_id}",
    summary="Xóa Sprint",
    description="Xóa chu kỳ Sprint và gỡ bỏ liên kết của các chức năng con thuộc Sprint này.",
)
def delete_sprint(sprint_id: int, db: Session = Depends(get_db)):
    """Xóa Sprint."""
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Không tìm thấy Sprint")

    # Go bo sprint_id cua cac requirement thuoc sprint nay
    db.query(Requirement).filter(Requirement.sprint_id == sprint_id).update({"sprint_id": None})
    db.delete(sprint)
    db.commit()
    return {"message": f"Sprint {sprint_id} đã được xóa thành công"}
