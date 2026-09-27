"""
Router: /api/auth

Xác thực và quản lý tài khoản người dùng:
- Đăng ký tài khoản (Họ tên, Email, Username, Password)
- Đăng nhập (Username/Password -> JWT Token + Thông tin)
- Lấy thông tin tài khoản hiện tại
- Danh sách thành viên để phân công kiểm thử
- Cập nhật hồ sơ, đổi mật khẩu

Bảo mật:
- Mật khẩu hash bằng bcrypt (salted, adaptive cost)
- Token chuẩn JWT HS256, có thời hạn
- Validation dữ liệu đầu vào chặt chẽ qua Pydantic
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
import bcrypt
from jose import JWTError, jwt

from database import get_db
from models import User
from schemas import (
    UserRegister,
    UserLogin,
    UserOut,
    AuthResponse,
    UserProfileUpdate,
    UserPasswordChange,
)

# ---------------------------------------------------------------------------
# Cấu hình bảo mật
# ---------------------------------------------------------------------------
_JWT_SECRET = os.getenv("JWT_SECRET_KEY", "fallback_secret_key_phai_doi_truoc_khi_deploy")
_JWT_ALGORITHM = "HS256"
_JWT_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# bcrypt cost factor - 12 là mức độ an toàn khuyến nghị (cân bằng giữa bảo mật và tốc độ)
_BCRYPT_ROUNDS = 12

router = APIRouter(prefix="/api/auth", tags=["Xác thực & Người dùng"])


# ---------------------------------------------------------------------------
# Hàm tiện ích nội bộ
# ---------------------------------------------------------------------------

def _hash_password(password: str) -> str:
    """Hash mật khẩu bằng bcrypt với salt tự động."""
    # Truncate ở 72 bytes (giới hạn của bcrypt)
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=_BCRYPT_ROUNDS)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def _verify_password(plain: str, hashed: str) -> bool:
    """Xác minh mật khẩu so với hash bcrypt."""
    try:
        plain_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(plain_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


def _create_jwt_token(user_id: int, username: str) -> str:
    """Tạo JWT token chuẩn HS256 với thời hạn."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=_JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),      # subject: user_id
        "usr": username,           # username để debug
        "exp": expire,             # expiry timestamp
        "iat": datetime.now(timezone.utc),  # issued at
    }
    return jwt.encode(payload, _JWT_SECRET, algorithm=_JWT_ALGORITHM)


def _decode_jwt_token(token: str) -> Optional[int]:
    """Giải mã JWT token, trả về user_id hoặc None nếu không hợp lệ."""
    try:
        payload = jwt.decode(token, _JWT_SECRET, algorithms=[_JWT_ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str and user_id_str.isdigit():
            return int(user_id_str)
    except JWTError:
        pass
    return None


def _make_user_out(u: User) -> UserOut:
    """Chuyển đổi User ORM model sang UserOut schema."""
    return UserOut(
        id=u.id,
        username=u.username,
        email=u.email,
        full_name=u.full_name,
        role=u.role or "user",
        created_at=u.created_at.strftime("%d/%m/%Y") if u.created_at else "",
    )


def get_auth_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency xác thực JWT.
    Trả về User đang đăng nhập hoặc raise 401 nếu token không hợp lệ.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.removeprefix("Bearer ").strip()
    user_id = _decode_jwt_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token xác thực không hợp lệ hoặc đã hết hạn.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản không tồn tại hoặc đã bị xóa.",
        )

    return user


def get_optional_auth_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Dependency xác thực JWT tùy chọn.
    Trả về User nếu có token hợp lệ, None nếu không có.
    Dùng cho các endpoint có thể truy cập ẩn danh.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.removeprefix("Bearer ").strip()
        user_id = _decode_jwt_token(token)
        if user_id:
            return db.query(User).filter(User.id == user_id).first()
    except Exception:
        pass
    return None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản mới",
    description="Đăng ký tài khoản người dùng. Mật khẩu được hash bằng bcrypt. Token JWT được trả về ngay sau khi đăng ký thành công.",
)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Đăng ký tài khoản người dùng mới."""
    username = payload.username.strip().lower()
    email = payload.email.strip().lower()

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên đăng nhập đã được sử dụng",
        )

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Địa chỉ email đã được đăng ký",
        )

    pwd_hash = _hash_password(payload.password)
    user = User(
        username=username,
        email=email,
        full_name=payload.full_name.strip(),
        password_hash=pwd_hash,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = _create_jwt_token(user.id, user.username)
    return AuthResponse(token=token, user=_make_user_out(user))


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Đăng nhập hệ thống",
    description="Xác thực bằng tên đăng nhập hoặc email và mật khẩu. Trả về JWT token có thời hạn.",
)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Đăng nhập và nhận JWT token."""
    identifier = payload.username.strip().lower()

    user = db.query(User).filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    # Dùng cùng thông báo lỗi cho cả 2 trường hợp để tránh user enumeration
    if not user or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác",
        )

    token = _create_jwt_token(user.id, user.username)
    return AuthResponse(token=token, user=_make_user_out(user))


@router.get(
    "/me",
    response_model=UserOut,
    summary="Lấy thông tin tài khoản hiện tại",
    description="Trả về thông tin hồ sơ của tài khoản đang đăng nhập (yêu cầu JWT token hợp lệ).",
)
def get_current_user(current_user: User = Depends(get_auth_user)):
    """Lấy thông tin tài khoản cá nhân hiện hành."""
    return _make_user_out(current_user)


@router.get(
    "/users",
    response_model=list[UserOut],
    summary="Danh sách thành viên để phân công",
    description="Lấy danh sách toàn bộ thành viên trong đội ngũ QA/QC để phân công nhiệm vụ kiểm thử.",
)
def get_all_users(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả người dùng trong hệ thống."""
    users = db.query(User).order_by(User.id).all()
    return [_make_user_out(u) for u in users]


@router.put(
    "/profile",
    response_model=UserOut,
    summary="Cập nhật hồ sơ cá nhân",
    description="Cập nhật họ và tên và địa chỉ email của tài khoản đang đăng nhập.",
)
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_auth_user),
    db: Session = Depends(get_db),
):
    """Cập nhật thông tin họ tên, email tài khoản."""
    full_name = payload.full_name.strip()
    email = payload.email.strip().lower()

    if not full_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Họ và tên không được để trống",
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Địa chỉ email không được để trống",
        )

    # Kiểm tra trùng email với tài khoản khác
    existing = (
        db.query(User)
        .filter(User.email == email, User.id != current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Địa chỉ email đã được sử dụng bởi tài khoản khác",
        )

    current_user.full_name = full_name
    current_user.email = email
    db.commit()
    db.refresh(current_user)
    return _make_user_out(current_user)


@router.put(
    "/change-password",
    summary="Đổi mật khẩu bảo mật tài khoản",
    description="Xác thực mật khẩu cũ bằng bcrypt và cập nhật mật khẩu mới.",
)
def change_password(
    payload: UserPasswordChange,
    current_user: User = Depends(get_auth_user),
    db: Session = Depends(get_db),
):
    """Đổi mật khẩu tài khoản người dùng."""
    if not _verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không chính xác",
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới phải có tối thiểu 6 ký tự",
        )

    current_user.password_hash = _hash_password(payload.new_password)
    db.commit()
    return {"message": "Đổi mật khẩu bảo mật thành công"}
