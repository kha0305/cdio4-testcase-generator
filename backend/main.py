"""
FastAPI Application Entry Point.

Hệ thống tự động sinh Test Case từ đặc tả yêu cầu.
- CORS được cấu hình qua biến môi trường (.env)
- Mount các routers: auth, projects, sprints, requirements, parse, generate, export
- Tự động tạo database khi khởi động (lifespan)
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load biến môi trường từ .env trước khi import bất kỳ module nào khác
load_dotenv()

from database import init_db
from routers import parse, generate, export, projects, auth, sprints, requirements

# ---------------------------------------------------------------------------
# Cấu hình CORS từ biến môi trường
# ---------------------------------------------------------------------------
_cors_origins_raw = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
)
_cors_origins = [origin.strip() for origin in _cors_origins_raw.split(",") if origin.strip()]


# ---------------------------------------------------------------------------
# Lifespan (thay thế @app.on_event("startup") đã deprecated)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Khởi tạo tài nguyên khi ứng dụng bắt đầu, dọn dẹp khi kết thúc."""
    # Startup
    init_db()
    yield
    # Shutdown (nếu cần dọn dẹp connection pool, v.v.)


# ---------------------------------------------------------------------------
# OpenAPI Tags Metadata
# ---------------------------------------------------------------------------
tags_metadata = [
    {
        "name": "Xác thực & Người dùng",
        "description": "Quản lý tài khoản người dùng, đăng ký, đăng nhập bằng JWT và danh sách thành viên phục vụ phân công kiểm thử.",
    },
    {
        "name": "Quản lý Dự án",
        "description": "Khởi tạo và quản lý dự án cá nhân hoặc nhóm, tạo mã tham gia (Join Code), đo lường KPI và xuất báo cáo nghiệm thu.",
    },
    {
        "name": "Quản lý Sprint & Scrum",
        "description": "Quản lý chu kỳ kiểm thử theo mô hình Scrum/Agile, mục tiêu Sprint và đo lường tiêu chuẩn hoàn thành Definition of Done (DoD).",
    },
    {
        "name": "Chức năng & Yêu cầu",
        "description": "Quản lý các chức năng con (User Stories), phân công người kiểm thử (Assignee), thời hạn và độ ưu tiên.",
    },
    {
        "name": "Bóc tách Ngữ nghĩa",
        "description": "Phân tích tự động văn bản đặc tả yêu cầu tiếng Việt, trích xuất không gian biến, miền giá trị và kiểu dữ liệu.",
    },
    {
        "name": "Sinh Ca Kiểm Thử",
        "description": "Động cơ sinh ca kiểm thử tự động áp dụng phân tích giá trị biên (BVA), phân vùng tương đương (EP), kiểm thử từng cặp Pairwise và giải ràng buộc Z3.",
    },
    {
        "name": "Xuất Báo Cáo",
        "description": "Xuất dữ liệu kiểm thử và báo cáo nghiệm thu chuyên nghiệp ra các định dạng Excel (.xlsx), CSV, JSON và Markdown.",
    },
]

# ---------------------------------------------------------------------------
# Khởi tạo ứng dụng FastAPI
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Hệ Thống Tự Động Sinh Test Case API (CDIO-4)",
    description=(
        "Nền tảng tự động bóc tách đặc tả yêu cầu, giải ràng buộc và sinh bộ kiểm thử phần mềm "
        "đa phương pháp (BVA, Phân vùng tương đương, Pairwise, Z3 Solver). "
        "Quản lý chu kỳ Scrum, phân công nhiệm vụ thành viên và xuất báo cáo kiểm thử nghiệm thu chuyên nghiệp."
    ),
    version="2.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Middleware: CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# ---------------------------------------------------------------------------
# Mount Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(sprints.router)
app.include_router(requirements.router)
app.include_router(parse.router)
app.include_router(generate.router)
app.include_router(export.router)


# ---------------------------------------------------------------------------
# Root Endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["Root"])
def root():
    """Thông tin cơ bản về API."""
    return {
        "name": "Test Case Generator API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health", tags=["Root"])
def health_check():
    """Kiểm tra trạng thái hoạt động của API."""
    return {"status": "ok", "version": "2.0.0"}
