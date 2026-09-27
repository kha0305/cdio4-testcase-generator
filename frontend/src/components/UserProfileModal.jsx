import { useState, useEffect } from "react";
import {
  IconUser,
  IconMail,
  IconLock,
  IconKey,
  IconCheck,
  IconLogOut,
  IconInfo,
} from "../icons";
import { updateUserProfile, changeUserPassword } from "../api";

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security"

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);

  // Security Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState(null);
  const [securityErr, setSecurityErr] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || "");
      setEmail(currentUser.email || "");
      setProfileMsg(null);
      setProfileErr(null);
      setSecurityMsg(null);
      setSecurityErr(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  async function handleSaveProfile(e) {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);

    if (!fullName.trim()) {
      setProfileErr("Vui lòng nhập họ và tên của bạn");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setProfileErr("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }

    setProfileLoading(true);
    try {
      const updated = await updateUserProfile({
        full_name: fullName.trim(),
        email: email.trim(),
      });
      setProfileMsg("Cập nhật thông tin hồ sơ thành công!");
      if (onUserUpdated) {
        onUserUpdated(updated);
      }
    } catch (err) {
      setProfileErr(err.message || "Không thể cập nhật hồ sơ cá nhân");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setSecurityErr(null);
    setSecurityMsg(null);

    if (!oldPassword) {
      setSecurityErr("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword.length < 6) {
      setSecurityErr("Mật khẩu mới phải có tối thiểu 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityErr("Mật khẩu xác nhận không khớp với mật khẩu mới");
      return;
    }

    setSecurityLoading(true);
    try {
      await changeUserPassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setSecurityMsg("Đổi mật khẩu bảo mật thành công! Vui lòng ghi nhớ mật khẩu mới.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setSecurityErr(err.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setSecurityLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: "560px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "var(--color-accent)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "15px",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              {currentUser.full_name?.charAt(0) || currentUser.username?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="modal-header__title" style={{ fontSize: "var(--font-size-md)", margin: 0 }}>
                Hồ Sơ & Bảo Mật Tài Khoản
              </h2>
              <p className="text-xs text-muted" style={{ margin: 0 }}>
                Quản lý thông tin cá nhân và bảo mật tài khoản người dùng
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn--icon"
            onClick={onClose}
            title="Đóng modal"
            style={{ fontSize: "20px", lineHeight: "1", padding: "4px 8px", cursor: "pointer", border: "none", background: "transparent", color: "var(--color-text-secondary)" }}
          >
            ×
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
            padding: "0 var(--space-4)",
            gap: "var(--space-2)",
            background: "var(--color-bg-secondary)",
          }}
        >
          <button
            type="button"
            className={`btn btn--sm ${activeTab === "profile" ? "btn--primary" : "btn--secondary"}`}
            style={{
              borderRadius: "0",
              borderBottom: activeTab === "profile" ? "2px solid var(--color-accent)" : "2px solid transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              background: "transparent",
              color: activeTab === "profile" ? "var(--color-accent)" : "var(--color-text-secondary)",
              fontWeight: activeTab === "profile" ? 600 : 500,
              padding: "var(--space-3) var(--space-4)",
            }}
            onClick={() => setActiveTab("profile")}
          >
            <IconUser width={14} height={14} />
            Hồ Sơ Cá Nhân
          </button>

          <button
            type="button"
            className={`btn btn--sm ${activeTab === "security" ? "btn--primary" : "btn--secondary"}`}
            style={{
              borderRadius: "0",
              borderBottom: activeTab === "security" ? "2px solid var(--color-accent)" : "2px solid transparent",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              background: "transparent",
              color: activeTab === "security" ? "var(--color-accent)" : "var(--color-text-secondary)",
              fontWeight: activeTab === "security" ? 600 : 500,
              padding: "var(--space-3) var(--space-4)",
            }}
            onClick={() => setActiveTab("security")}
          >
            <IconLock width={14} height={14} />
            Bảo Mật & Mật Khẩu
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: "var(--space-5)" }}>
          {/* TAB 1: THÔNG TIN HỒ SƠ */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile}>
              {profileMsg && (
                <div className="alert alert--success" style={{ marginBottom: "var(--space-3)" }}>
                  <IconCheck width={14} height={14} />
                  <span>{profileMsg}</span>
                </div>
              )}
              {profileErr && (
                <div className="alert alert--error" style={{ marginBottom: "var(--space-3)" }}>
                  <span>{profileErr}</span>
                </div>
              )}

              {/* Tên đăng nhập (Readonly) */}
              <div className="form-group">
                <label className="form-label">
                  Tên đăng nhập (Username):
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={currentUser.username}
                    disabled
                    style={{
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <span className="badge badge--neutral" style={{ fontSize: "10px", whiteSpace: "nowrap", padding: "6px 8px" }}>
                    Cố định
                  </span>
                </div>
                <span className="text-xs text-muted" style={{ fontSize: "11px", marginTop: "3px", display: "block" }}>
                  Tên đăng nhập dùng để định danh tài khoản duy nhất trên toàn hệ thống.
                </span>
              </div>

              {/* Họ và tên */}
              <div className="form-group">
                <label className="form-label">
                  Họ và tên hiển thị:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  required
                />
              </div>

              {/* Địa chỉ Email */}
              <div className="form-group">
                <label className="form-label">
                  Địa chỉ Email:
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@vidu.com"
                  required
                />
              </div>

              {/* Thông tin phụ */}
              <div
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  marginBottom: "var(--space-4)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="text-xs text-muted">Ngày tạo tài khoản:</span>
                <span className="text-xs" style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  {currentUser.created_at || "Gần đây"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={profileLoading}
                  style={{ minWidth: "140px" }}
                >
                  {profileLoading ? <span className="spinner" /> : <IconCheck width={14} height={14} />}
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: BẢO MẬT & MẬT KHẨU */}
          {activeTab === "security" && (
            <form onSubmit={handleChangePassword}>
              {securityMsg && (
                <div className="alert alert--success" style={{ marginBottom: "var(--space-3)" }}>
                  <IconCheck width={14} height={14} />
                  <span>{securityMsg}</span>
                </div>
              )}
              {securityErr && (
                <div className="alert alert--error" style={{ marginBottom: "var(--space-3)" }}>
                  <span>{securityErr}</span>
                </div>
              )}

              <div
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  marginBottom: "var(--space-3)",
                  display: "flex",
                  gap: "var(--space-2)",
                  alignItems: "flex-start",
                }}
              >
                <IconInfo width={15} height={15} style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: "2px" }} />
                <span className="text-xs text-muted">
                  Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh có tối thiểu 6 ký tự kết hợp chữ cái và số.
                </span>
              </div>

              {/* Mật khẩu hiện tại */}
              <div className="form-group">
                <label className="form-label">
                  Mật khẩu hiện tại:
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang sử dụng"
                  required
                />
              </div>

              {/* Mật khẩu mới */}
              <div className="form-group">
                <label className="form-label">
                  Mật khẩu mới (Tối thiểu 6 ký tự):
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  required
                  minLength={6}
                />
              </div>

              {/* Xác nhận mật khẩu mới */}
              <div className="form-group">
                <label className="form-label">
                  Xác nhận lại mật khẩu mới:
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới một lần nữa"
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={securityLoading}
                  style={{ minWidth: "160px" }}
                >
                  {securityLoading ? <span className="spinner" /> : <IconKey width={14} height={14} />}
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer với nút Đăng Xuất To Rõ */}
        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?")) {
                onLogout();
                onClose();
              }
            }}
            title="Đăng xuất khỏi phiên làm việc hiện tại"
            style={{
              color: "var(--color-error)",
              borderColor: "rgba(220, 38, 38, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
            }}
          >
            <IconLogOut width={14} height={14} />
            Đăng Xuất Tài Khoản
          </button>

          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
