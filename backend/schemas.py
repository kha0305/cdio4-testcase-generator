"""
Pydantic Schemas - Request/Response models for FastAPI endpoints.
Bao gồm validation chặt chẽ cho các trường nhập liệu nhạy cảm.
"""

from __future__ import annotations
import re
from typing import Optional
from pydantic import BaseModel, field_validator, model_validator


# ---------------------------------------------------------------------------
# Parameter (truong du lieu boc tach)
# ---------------------------------------------------------------------------
class ParameterBase(BaseModel):
    name: str
    data_type: str  # integer, float, string, boolean, date, enum
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    enum_values: Optional[list[str]] = None
    regex_pattern: Optional[str] = None
    is_required: bool = True
    description: str = ""


class ParameterOut(ParameterBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Parse Request / Response
# ---------------------------------------------------------------------------
class ParseRequest(BaseModel):
    """Client gui van ban dac ta de backend boc tach tham so."""
    raw_text: str
    format_type: str = "free_text"  # free_text | ears | gherkin
    project_name: str = "Default Project"
    project_id: Optional[int] = None


class ParseResponse(BaseModel):
    """Ket qua boc tach: danh sach tham so + metadata."""
    requirement_id: int
    title: str
    parameters: list[ParameterOut]
    actor: str = ""
    action: str = ""
    preconditions: list[str] = []


# ---------------------------------------------------------------------------
# Generate Request / Response
# ---------------------------------------------------------------------------
class GenerateRequest(BaseModel):
    """Client gui danh sach tham so (da chinh sua) de sinh test cases."""
    requirement_id: int
    parameters: list[ParameterBase]
    techniques: list[str] = ["bva", "ep", "pairwise"]  # bva, ep, pairwise, constraint
    constraints: list[str] = []  # ["age + experience >= 20", "role != 'admin' or level > 3"]


class TestCaseOut(BaseModel):
    id: Optional[int] = None
    code: str
    scenario: str
    preconditions: str = ""
    test_steps: str = ""
    test_type: str  # positive, negative, boundary
    input_data: dict
    expected_result: str
    postconditions: str = ""
    actual_result: str = ""
    status: str = "Untested"  # Pass, Fail, Blocked, Untested
    priority: str = "Medium"
    technique_source: str = ""

    class Config:
        from_attributes = True


class TestCaseUpdate(BaseModel):
    actual_result: Optional[str] = None
    status: Optional[str] = None  # Pass, Fail, Blocked, Untested



class GenerateResponse(BaseModel):
    """Ket qua sinh test cases."""
    test_suite_id: int
    requirement_id: int
    total_cases: int
    coverage_info: dict = {}
    test_cases: list[TestCaseOut]


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------
class ExportRequest(BaseModel):
    test_suite_id: int
    format: str = "xlsx"  # xlsx | csv


# ---------------------------------------------------------------------------
# Project (Quan ly du an)
# ---------------------------------------------------------------------------
class ProjectBase(BaseModel):
    name: str
    code: str = ""
    description: str = ""
    version: str = "1.0.0"
    lead: str = "QA Lead"
    project_type: str = "personal"  # personal | team
    join_code: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    version: Optional[str] = None
    lead: Optional[str] = None
    project_type: Optional[str] = None


class ProjectJoinRequest(BaseModel):
    join_code: str


class ProjectOut(ProjectBase):
    id: int
    created_at: Optional[str] = None
    requirements_count: int = 0
    test_suites_count: int = 0
    total_cases: int = 0
    pass_count: int = 0
    fail_count: int = 0
    untested_count: int = 0
    pass_rate: float = 0.0
    owner_id: Optional[int] = None
    owner_name: Optional[str] = None
    current_user_role: Optional[str] = "member"  # leader | deputy | member
    members_count: int = 1

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Project Member & RBAC (Leader, Deputy, Member)
# ---------------------------------------------------------------------------
class ProjectMemberOut(BaseModel):
    id: int
    project_id: int
    user_id: int
    username: str
    email: str
    full_name: str
    role: str  # leader | deputy | member
    role_name: str  # Trưởng nhóm | Phó nhóm | Thành viên
    joined_at: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectMemberAdd(BaseModel):
    user_identifier: str  # username hoặc email
    role: str = "member"  # deputy | member


class ProjectMemberRoleUpdate(BaseModel):
    role: str  # leader | deputy | member


# ---------------------------------------------------------------------------
# User & Authentication
# ---------------------------------------------------------------------------
class UserRegister(BaseModel):
    username: str
    email: str
    full_name: str
    password: str
    role: Optional[str] = "user"  # Mặc định người dùng thông thường, phân quyền theo từng dự án

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip().lower()
        if len(v) < 3:
            raise ValueError("Tên đăng nhập phải có ít nhất 3 ký tự")
        if len(v) > 50:
            raise ValueError("Tên đăng nhập không được vượt quá 50 ký tự")
        if not re.match(r'^[a-z0-9_]+$', v):
            raise ValueError("Tên đăng nhập chỉ được chứa chữ thường, số và dấu gạch dưới (_)")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', v):
            raise ValueError("Địa chỉ email không hợp lệ")
        if len(v) > 255:
            raise ValueError("Địa chỉ email không được vượt quá 255 ký tự")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Họ và tên phải có ít nhất 2 ký tự")
        if len(v) > 100:
            raise ValueError("Họ và tên không được vượt quá 100 ký tự")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Mật khẩu phải có tối thiểu 6 ký tự")
        if len(v) > 128:
            raise ValueError("Mật khẩu không được vượt quá 128 ký tự")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    full_name: str
    email: str


class UserPasswordChange(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Mật khẩu mới phải có tối thiểu 6 ký tự")
        if len(v) > 128:
            raise ValueError("Mật khẩu mới không được vượt quá 128 ký tự")
        return v

    @model_validator(mode="after")
    def passwords_must_differ(self) -> "UserPasswordChange":
        if self.old_password == self.new_password:
            raise ValueError("Mật khẩu mới phải khác mật khẩu hiện tại")
        return self


class AuthResponse(BaseModel):
    token: str
    user: UserOut


# ---------------------------------------------------------------------------
# Sprint (Scrum Agile)
# ---------------------------------------------------------------------------
class SprintBase(BaseModel):
    name: str
    goal: str = ""
    start_date: str = ""
    end_date: str = ""
    status: str = "active"  # planning | active | completed


class SprintCreate(SprintBase):
    project_id: int


class SprintUpdate(BaseModel):
    name: Optional[str] = None
    goal: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None


class SprintOut(SprintBase):
    id: int
    project_id: int
    created_at: Optional[str] = None
    requirements_count: int = 0
    total_cases: int = 0
    pass_count: int = 0
    fail_count: int = 0
    pass_rate: float = 0.0
    dod_met: bool = False  # Definition of Done met: all cases executed and pass >= 90%

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Requirement / User Story Management
# ---------------------------------------------------------------------------
class RequirementCreate(BaseModel):
    project_id: int
    title: str
    raw_text: str
    format_type: str = "free_text"
    sprint_id: Optional[int] = None
    assignee_name: str = ""
    due_date: str = ""
    priority: str = "Medium"
    status: str = "planning"


class RequirementUpdate(BaseModel):
    title: Optional[str] = None
    raw_text: Optional[str] = None
    format_type: Optional[str] = None
    sprint_id: Optional[int] = None
    assignee_name: Optional[str] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None


class RequirementOut(BaseModel):
    id: int
    project_id: int
    sprint_id: Optional[int] = None
    title: str
    raw_text: str
    format_type: str
    assignee_name: str = ""
    due_date: str = ""
    priority: str = "Medium"
    status: str = "planning"
    created_at: Optional[str] = None
    parameters_count: int = 0
    test_suites_count: int = 0
    total_cases: int = 0
    pass_count: int = 0
    fail_count: int = 0

    class Config:
        from_attributes = True


