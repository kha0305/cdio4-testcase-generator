"""
ORM Models - SQLAlchemy declarative models for the test case generation system.

Tables:
- User: tai khoan nguoi dung (QA Lead, Tester, Developer)
- Project: nhom du an (personal / team, join_code)
- Sprint: cac dot chay kiem thu Scrum trong du an
- Requirement: van ban dac ta yeu cau / User Story (kem assignee, due_date, priority, status)
- Parameter: truong du lieu boc tach tu requirement
- TestSuite: bo test case sinh ra tu requirement
- TestCase: tung ca kiem thu cu the (kem status Pass/Fail, actual result)
"""

import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    """Tai khoan nguoi dung he thong."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="tester")  # lead, tester, developer
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Project(Base):
    """Du an kiem thu (Ca nhan hoac Nhom)."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), default="")
    description = Column(Text, default="")
    version = Column(String(50), default="1.0.0")
    lead = Column(String(100), default="QA Lead")
    project_type = Column(String(50), default="personal")  # personal | team
    join_code = Column(String(50), nullable=True, unique=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", foreign_keys=[owner_id])
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    sprints = relationship("Sprint", back_populates="project", cascade="all, delete-orphan")
    requirements = relationship("Requirement", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    """Thanh vien va phan quyen trong tung du an (Leader, Deputy, Member)."""
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="member")  # leader, deputy, member
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="members")
    user = relationship("User")


class Sprint(Base):
    """Chu ky kiem thu Scrum trong du an."""
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String(255), nullable=False)  # Sprint 1, Sprint 2...
    goal = Column(Text, default="")  # Muc tieu Sprint
    start_date = Column(String(50), default="")  # YYYY-MM-DD
    end_date = Column(String(50), default="")  # YYYY-MM-DD
    status = Column(String(50), default="active")  # planning, active, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="sprints")
    requirements = relationship("Requirement", back_populates="sprint")


class Requirement(Base):
    """Yeu cau dac ta chuc nang / User Story."""
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    sprint_id = Column(Integer, ForeignKey("sprints.id"), nullable=True)
    title = Column(String(500), default="")
    raw_text = Column(Text, nullable=False)
    format_type = Column(String(50), default="free_text")  # free_text, ears, gherkin
    assignee_name = Column(String(100), default="")  # Nguoi phu trach kiem thu
    due_date = Column(String(50), default="")  # Han chot kiem thu YYYY-MM-DD
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    status = Column(String(50), default="planning")  # planning, in_testing, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="requirements")
    sprint = relationship("Sprint", back_populates="requirements")
    parameters = relationship("Parameter", back_populates="requirement", cascade="all, delete-orphan")
    test_suites = relationship("TestSuite", back_populates="requirement", cascade="all, delete-orphan")


class Parameter(Base):
    """Truong du lieu boc tach tu van ban dac ta."""
    __tablename__ = "parameters"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    name = Column(String(255), nullable=False)
    data_type = Column(String(50), nullable=False)  # integer, float, string, boolean, date, enum
    min_value = Column(Float, nullable=True)
    max_value = Column(Float, nullable=True)
    min_length = Column(Integer, nullable=True)
    max_length = Column(Integer, nullable=True)
    enum_values = Column(JSON, nullable=True)  # ["VIP", "Regular", "Guest"]
    regex_pattern = Column(String(500), nullable=True)  # email, phone format
    is_required = Column(Boolean, default=True)
    description = Column(Text, default="")

    requirement = relationship("Requirement", back_populates="parameters")


class TestSuite(Base):
    """Bo test case sinh ra tu 1 requirement."""
    __tablename__ = "test_suites"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    technique = Column(String(100), default="combined")  # bva, ep, pairwise, decision_table, combined
    total_cases = Column(Integer, default=0)
    coverage_info = Column(JSON, nullable=True)  # {"bva_coverage": 100, "pairwise_coverage": 100}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    requirement = relationship("Requirement", back_populates="test_suites")
    test_cases = relationship("TestCase", back_populates="test_suite", cascade="all, delete-orphan")


class TestCase(Base):
    """Tung ca kiem thu cu the."""
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, index=True)
    test_suite_id = Column(Integer, ForeignKey("test_suites.id"), nullable=False)
    code = Column(String(50), nullable=False)  # TC_001, TC_002, ...
    scenario = Column(Text, nullable=False)
    preconditions = Column(Text, default="")
    test_steps = Column(Text, default="")
    test_type = Column(String(50), nullable=False)  # positive, negative, boundary
    input_data = Column(JSON, nullable=False)  # {"age": 18, "password": "abc12345"}
    expected_result = Column(Text, nullable=False)
    postconditions = Column(Text, default="")
    actual_result = Column(Text, default="")
    status = Column(String(50), default="Untested")  # Pass, Fail, Blocked, Untested
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    technique_source = Column(String(50), default="")  # bva, ep, pairwise, constraint

    test_suite = relationship("TestSuite", back_populates="test_cases")
