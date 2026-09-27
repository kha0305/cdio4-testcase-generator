"""
Database configuration - SQLAlchemy + SQLite.
File app.db được tạo tự động trong thư mục backend/.
Tối ưu: WAL mode, connection pool, foreign key constraints.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False,  # Bắt buộc cho SQLite + FastAPI
        "timeout": 30,               # Timeout kết nối 30 giây
    },
    pool_size=5,          # Số kết nối tối thiểu trong pool
    max_overflow=10,      # Số kết nối tối đa bổ sung
    pool_pre_ping=True,   # Kiểm tra kết nối còn sống trước khi dùng
    echo=False,
)


@event.listens_for(engine, "connect")
def _set_sqlite_pragmas(dbapi_connection, connection_record):
    """Cấu hình SQLite tối ưu mỗi khi tạo kết nối mới."""
    cursor = dbapi_connection.cursor()
    # WAL mode: cải thiện hiệu năng đọc/ghi đồng thời
    cursor.execute("PRAGMA journal_mode=WAL")
    # Bật foreign key constraints
    cursor.execute("PRAGMA foreign_keys=ON")
    # Tăng cache để giảm disk I/O
    cursor.execute("PRAGMA cache_size=-16000")  # 16MB cache
    # Cải thiện tốc độ ghi (chấp nhận mất dữ liệu tối đa 1 giây nếu crash)
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class cho tất cả ORM models."""
    pass


def get_db():
    """Dependency injection: yield một database session cho mỗi request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Tạo tất cả các bảng nếu chưa tồn tại."""
    Base.metadata.create_all(bind=engine)
