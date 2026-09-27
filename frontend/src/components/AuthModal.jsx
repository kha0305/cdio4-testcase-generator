import { useState } from "react";
import { loginUser, registerUser, getApiBase, setApiBase } from "../api";
import { IconUser, IconX, IconCheck, IconAlertTriangle, IconLoader, IconSettings } from "../icons";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("tester");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => getApiBase());
  const [apiSuccessMsg, setApiSuccessMsg] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        const res = await loginUser(username.trim(), password);
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      } else {
        const payload = {
          username: username.trim(),
          email: email.trim(),
          full_name: fullName.trim(),
          password,
        };
        const res = await registerUser(payload);
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("auth_user", JSON.stringify(res.user));
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Thao tác không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickLogin(userType) {
    if (userType === "lead") {
      setUsername("qalead");
      setPassword("123456");
    } else {
      setUsername("tester01");
      setPassword("123456");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <IconUser width={18} height={18} style={{ color: "var(--color-accent)" }} />
            <h3 className="modal-header__title" style={{ fontSize: "var(--font-size-md)" }}>
              {tab === "login" ? "Đăng Nhập Hệ Thống" : "Đăng Ký Tài Khoản"}
            </h3>
          </div>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose} style={{ padding: "4px 8px" }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <button
              type="button"
              className={`btn btn--sm ${tab === "login" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => { setTab("login"); setError(""); }}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              className={`btn btn--sm ${tab === "register" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => { setTab("register"); setError(""); }}
            >
              Đăng Ký Mới
            </button>
          </div>

          {tab === "register" && (
            <div style={{
              background: "var(--color-bg-secondary)",
              padding: "var(--space-2) var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "12px",
              color: "var(--color-text-secondary)",
              marginBottom: "var(--space-3)",
              lineHeight: 1.4,
            }}>
              Mọi tài khoản đăng ký đều có quyền hạn cơ bản. Vai trò và quyền hạn quản lý (Trưởng nhóm, Phó nhóm, Thành viên) sẽ được phân bổ theo từng dự án cụ thể.
            </div>
          )}

          {error && (
            <div className="alert alert--error" style={{ marginBottom: "var(--space-3)", padding: "var(--space-2) var(--space-3)" }}>
              <IconAlertTriangle width={14} height={14} />
              <span style={{ fontSize: "var(--font-size-xs)" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {tab === "register" && (
              <>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Họ và Tên *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Địa Chỉ Email *</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="nguyenvana@cdio.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="input-label" style={{ fontWeight: 600 }}>Tên Đăng Nhập hoặc Email *</label>
              <input
                type="text"
                className="input-field"
                placeholder={tab === "login" ? "Nhập username hoặc email" : "Chọn username (viết liền, không dấu)"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="input-label" style={{ fontWeight: 600 }}>Mật Khẩu *</label>
              <input
                type="password"
                className="input-field"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Quick Login Buttons for Demo */}
            {tab === "login" && (
              <div style={{
                background: "var(--color-bg-secondary)",
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}>
                <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginBottom: "4px" }}>
                  Tài khoản demo nạp sẵn (mật khẩu: 123456):
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    style={{ fontSize: "11px", padding: "2px 6px" }}
                    onClick={() => handleQuickLogin("lead")}
                  >
                    QA Lead (qalead)
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    style={{ fontSize: "11px", padding: "2px 6px" }}
                    onClick={() => handleQuickLogin("tester")}
                  >
                    Tester (tester01)
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              style={{ width: "100%", justifyContent: "center", marginTop: "var(--space-2)" }}
              disabled={loading}
            >
              {loading ? <IconLoader width={16} height={16} /> : <IconCheck width={16} height={16} />}
              {tab === "login" ? "Đăng Nhập" : "Tạo Tài Khoản"}
            </button>
          </form>

          {/* Cấu hình máy chủ API tùy chọn */}
          <div style={{ marginTop: "var(--space-3)", borderTop: "1px dashed var(--color-border)", paddingTop: "var(--space-2)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                fontSize: "11px",
                color: "var(--color-text-secondary)",
              }}
              onClick={() => setShowServerConfig(!showServerConfig)}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <IconSettings width={12} height={12} />
                Cấu hình Máy Chủ API Backend (Tùy chọn)
              </span>
              <span style={{ color: "var(--color-accent)", textDecoration: "underline" }}>
                {showServerConfig ? "Thu gọn" : "Tùy chỉnh"}
              </span>
            </div>

            {showServerConfig && (
              <div style={{
                marginTop: "var(--space-2)",
                background: "var(--color-bg-secondary)",
                padding: "var(--space-2)",
                borderRadius: "var(--radius-sm)",
                fontSize: "11px",
              }}>
                <label style={{ display: "block", marginBottom: "4px", color: "var(--color-text-secondary)" }}>
                  URL Máy Chủ Backend (Mặc định: http://localhost:8000/api hoặc URL Cloudflare Tunnel HTTPS)
                </label>
                <div style={{ display: "flex", gap: "4px" }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    value={apiUrl}
                    onChange={(e) => {
                      setApiUrl(e.target.value);
                      setApiSuccessMsg("");
                    }}
                    placeholder="https://your-tunnel.trycloudflare.com/api"
                  />
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                    onClick={() => {
                      setApiBase(apiUrl);
                      setApiSuccessMsg("Đã lưu địa chỉ API!");
                      setTimeout(() => setApiSuccessMsg(""), 3000);
                    }}
                  >
                    Lưu
                  </button>
                </div>
                {apiSuccessMsg && (
                  <div style={{ color: "var(--color-success)", marginTop: "4px", fontSize: "10px" }}>
                    {apiSuccessMsg}
                  </div>
                )}
                <div style={{ color: "var(--color-text-tertiary)", marginTop: "4px", fontSize: "10px", lineHeight: 1.3 }}>
                  Ghi chú: Nếu duyệt trên GitHub Pages mà không có Backend HTTPS, hệ thống sẽ tự động kích hoạt Chế Độ Ngoại Tuyến (vẫn đăng nhập và thao tác bình thường).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
