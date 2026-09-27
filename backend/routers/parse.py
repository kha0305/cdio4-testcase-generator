"""
Router: /api/parse

Nhan van ban dac ta yeu cau, boc tach tham so va luu vao database.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import ParseRequest, ParseResponse, ParameterOut
from models import Project, Requirement, Parameter
from engine.parser import parse_requirement

router = APIRouter(prefix="/api", tags=["Bóc tách Ngữ nghĩa"])


@router.post(
    "/parse",
    response_model=ParseResponse,
    summary="Bóc tách đặc tả yêu cầu và trích xuất tham số",
    description="Nhận văn bản đặc tả yêu cầu kiểm thử tiếng Việt, tự động bóc tách tham số, nhận diện kiểu dữ liệu và lưu vào hệ thống.",
)
def parse_requirement_text(req: ParseRequest, db: Session = Depends(get_db)):
    """
    Nhận văn bản đặc tả, chạy parser bóc tách tham số,
    lưu Requirement + Parameters vào cơ sở dữ liệu,
    trả về kết quả để kiểm thử viên xem và tinh chỉnh.
    """
    # 1. Tim hoac tao Project
    project = None
    if req.project_id:
        project = db.query(Project).filter(Project.id == req.project_id).first()
    
    if not project:
        project = db.query(Project).filter(Project.name == req.project_name).first()
    
    if not project:
        project = Project(name=req.project_name, code=f"PRJ-{req.project_name[:4].upper()}")
        db.add(project)
        db.flush()

    # 2. Chay parser
    parsed = parse_requirement(req.raw_text)

    # 3. Luu Requirement
    requirement = Requirement(
        project_id=project.id,
        title=parsed.get("title", ""),
        raw_text=req.raw_text,
        format_type=req.format_type,
    )
    db.add(requirement)
    db.flush()

    # 4. Luu Parameters
    param_outputs = []
    for p in parsed.get("parameters", []):
        db_param = Parameter(
            requirement_id=requirement.id,
            name=p["name"],
            data_type=p["data_type"],
            min_value=p.get("min_value"),
            max_value=p.get("max_value"),
            min_length=p.get("min_length"),
            max_length=p.get("max_length"),
            enum_values=p.get("enum_values"),
            regex_pattern=p.get("regex_pattern"),
            is_required=p.get("is_required", True),
            description=p.get("description", ""),
        )
        db.add(db_param)
        db.flush()

        param_outputs.append(ParameterOut(
            id=db_param.id,
            name=db_param.name,
            data_type=db_param.data_type,
            min_value=db_param.min_value,
            max_value=db_param.max_value,
            min_length=db_param.min_length,
            max_length=db_param.max_length,
            enum_values=db_param.enum_values,
            regex_pattern=db_param.regex_pattern,
            is_required=db_param.is_required,
            description=db_param.description,
        ))

    db.commit()

    return ParseResponse(
        requirement_id=requirement.id,
        title=parsed.get("title", ""),
        parameters=param_outputs,
        actor=parsed.get("actor", ""),
        action=parsed.get("action", ""),
        preconditions=parsed.get("preconditions", []),
    )
