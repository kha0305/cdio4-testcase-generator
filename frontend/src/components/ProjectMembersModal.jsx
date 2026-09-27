import { useState, useEffect } from "react";
import { getProjectMembers, addProjectMember, updateProjectMemberRole, removeProjectMember } from "../api";
import {
  IconUsers, IconUserPlus, IconShield, IconX, IconCheck, IconTrash,
  IconCopy, IconAlertTriangle, IconLoader, IconLogOut, IconInfo
} from "../icons";

const ROLE_INFO = {
  leader: {
    name: "Trưởng nhóm (Leader)",
    badgeClass: "badge--primary",
    description: "Toàn quyền quản trị dự án: phân quyền thành viên, quản lý Sprint, sửa/xóa dự án, xuất báo cáo.",
    color: "#2563EB",
  },
  deputy: {
    name: "Phó nhóm (Deputy)",
    badgeClass: "badge--info",
    description: "Quản trị vận hành: quản lý Sprint, User Story, mời thành viên, chạy test case và nghiệm thu.",
    color: "#4F46E5",
  },
  member: {
    name: "Thành viên (Member)",
    badgeClass: "badge--secondary",
    description: "Thực thi kiểm thử: bóc tách đặc tả, sinh ca kiểm thử, chạy test và cập nhật kết quả Pass/Fail.",
    color: "#64748B",
  },
};

export default function ProjectMembersModal({ isOpen, onClose, project, currentUser, onProjectUpdated }) {
  const [membersData, setMembersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form add member
  const [userIdentifier, setUserIdentifier] = useState("");
  const [addRole, setAddRole] = useState("member");

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen && project?.id) {
      loadMembers();
    }
  }, [isOpen, project?.id]);

  async function loadMembers() {
    if (!project?.id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getProjectMembers(project.id);
      setMembersData(data);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách thành viên.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    if (!userIdentifier.trim()) return;
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await addProjectMember(project.id, userIdentifier.trim(), addRole);
      setSuccessMsg(res.message || "Thêm thành viên thành công.");
      setUserIdentifier("");
      await loadMembers();
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      setError(err.message || "Thêm thành viên thất bại.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await updateProjectMemberRole(project.id, userId, newRole);
      setSuccessMsg(res.message || "Cập nhật vai trò thành công.");
      await loadMembers();
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      setError(err.message || "Cập nhật vai trò thất bại.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveMember(userId, isSelf = false) {
    const confirmMsg = isSelf
      ? "Bạn có chắc chắn muốn rời khỏi dự án này không?"
      : "Bạn có chắc chắn muốn xóa thành viên này khỏi dự án?";
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await removeProjectMember(project.id, userId);
      setSuccessMsg(res.message || "Thao tác thành công.");
      if (isSelf) {
        if (onProjectUpdated) onProjectUpdated();
        onClose();
      } else {
        await loadMembers();
        if (onProjectUpdated) onProjectUpdated();
      }
    } catch (err) {
      setError(err.message || "Không thể thực hiện thao tác.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleCopy(text, type) {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  if (!isOpen || !project) return null;

  const currentRole = membersData?.current_user_role || "member";
  const isLeader = currentRole === "leader";
  const isDeputy = currentRole === "deputy";
  const canManageMembers = isLeader || isDeputy;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <IconUsers width={20} height={20} style={{ color: "var(--color-accent)" }} />
            <div>
              <h3 className="modal-header__title" style={{ fontSize: "var(--font-size-md)", margin: 0 }}>
                Thành Viên & Phân Quyền Dự Án
              </h3>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                {project.name} ({project.code || `PRJ-${project.id}`})
              </div>
            </div>
          </div>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose} style={{ padding: "4px 8px" }}>
            <IconX width={16} height={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Your Current Role Card */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-bg-secondary)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--color-accent-subtle)",
                color: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
              }}>
                <IconShield width={20} height={20} />
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                  Vai trò của bạn trong dự án
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text-primary)" }}>
                  {ROLE_INFO[currentRole]?.name || "Thành viên"}
                </div>
              </div>
            </div>

            <span className={`badge ${ROLE_INFO[currentRole]?.badgeClass || "badge--secondary"}`}>
              {currentRole === "leader" ? "Toàn quyền" : currentRole === "deputy" ? "Quản trị" : "Thực thi"}
            </span>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="alert alert--error" style={{ padding: "var(--space-2) var(--space-3)" }}>
              <IconAlertTriangle width={14} height={14} />
              <span style={{ fontSize: "var(--font-size-xs)" }}>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="alert alert--success" style={{ padding: "var(--space-2) var(--space-3)" }}>
              <IconCheck width={14} height={14} />
              <span style={{ fontSize: "var(--font-size-xs)" }}>{successMsg}</span>
            </div>
          )}

          {/* Add Member Form (Only for Leader & Deputy) */}
          {canManageMembers && (
            <form onSubmit={handleAddMember} style={{
              display: "flex",
              gap: "var(--space-2)",
              background: "var(--color-bg-primary)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--color-border)",
            }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nhập tên đăng nhập hoặc email thành viên..."
                  value={userIdentifier}
                  onChange={(e) => setUserIdentifier(e.target.value)}
                  required
                />
              </div>

              {isLeader && (
                <div style={{ width: "140px" }}>
                  <select
                    className="input-field"
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value)}
                  >
                    <option value="member">Thành viên</option>
                    <option value="deputy">Phó nhóm</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn btn--primary"
                disabled={actionLoading || !userIdentifier.trim()}
                style={{ whiteSpace: "nowrap" }}
              >
                <IconUserPlus width={16} height={16} />
                Thêm Thành Viên
              </button>
            </form>
          )}

          {/* Members Table */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
              <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, margin: 0 }}>
                Danh Sách Thành Viên ({membersData?.members?.length || 0})
              </h4>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={loadMembers}
                disabled={loading}
                style={{ fontSize: "11px", padding: "2px 8px" }}
              >
                {loading ? "Đang tải..." : "Làm mới"}
              </button>
            </div>

            <div style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}>
              <table className="data-table" style={{ margin: 0, width: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Thành viên</th>
                    <th style={{ width: "20%" }}>Ngày tham gia</th>
                    <th style={{ width: "25%" }}>Vai trò</th>
                    <th style={{ width: "15%", textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !membersData ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "var(--space-4)" }}>
                        <IconLoader width={20} height={20} />
                      </td>
                    </tr>
                  ) : membersData?.members?.length > 0 ? (
                    membersData.members.map((m) => {
                      const isTargetSelf = currentUser && m.user_id === currentUser.id;
                      const initials = (m.full_name || m.username || "U").substring(0, 2).toUpperCase();

                      return (
                        <tr key={m.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                              <div style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: "var(--color-bg-secondary)",
                                border: "1px solid var(--color-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "var(--color-text-secondary)",
                              }}>
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: "13px" }}>
                                  {m.full_name} {isTargetSelf && <span style={{ color: "var(--color-accent)", fontSize: "11px" }}>(Bạn)</span>}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                                  @{m.username} &middot; {m.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                            {m.joined_at || "Khởi tạo"}
                          </td>
                          <td>
                            {isLeader && !isTargetSelf ? (
                              <select
                                className="input-field"
                                style={{ padding: "3px 6px", fontSize: "12px", height: "auto" }}
                                value={m.role}
                                onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                                disabled={actionLoading}
                              >
                                <option value="leader">Trưởng nhóm (Leader)</option>
                                <option value="deputy">Phó nhóm (Deputy)</option>
                                <option value="member">Thành viên (Member)</option>
                              </select>
                            ) : (
                              <span className={`badge ${ROLE_INFO[m.role]?.badgeClass || "badge--secondary"}`}>
                                {ROLE_INFO[m.role]?.name || m.role}
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {isLeader && !isTargetSelf ? (
                              <button
                                type="button"
                                className="btn btn--secondary btn--sm"
                                style={{ color: "var(--color-error)", padding: "2px 6px" }}
                                title="Xóa khỏi dự án"
                                onClick={() => handleRemoveMember(m.user_id, false)}
                                disabled={actionLoading}
                              >
                                <IconTrash width={14} height={14} />
                              </button>
                            ) : isDeputy && m.role === "member" && !isTargetSelf ? (
                              <button
                                type="button"
                                className="btn btn--secondary btn--sm"
                                style={{ color: "var(--color-error)", padding: "2px 6px" }}
                                title="Xóa thành viên"
                                onClick={() => handleRemoveMember(m.user_id, false)}
                                disabled={actionLoading}
                              >
                                <IconTrash width={14} height={14} />
                              </button>
                            ) : isTargetSelf && currentRole !== "leader" ? (
                              <button
                                type="button"
                                className="btn btn--secondary btn--sm"
                                style={{ color: "var(--color-error)", padding: "2px 6px", fontSize: "11px" }}
                                title="Rời khỏi dự án"
                                onClick={() => handleRemoveMember(m.user_id, true)}
                                disabled={actionLoading}
                              >
                                <IconLogOut width={13} height={13} /> Rời
                              </button>
                            ) : (
                              <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: "var(--space-3)", color: "var(--color-text-secondary)" }}>
                        Chưa có danh sách thành viên.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Join Code & Share Link Card */}
          {project.project_type === "team" && (
            <div style={{
              background: "var(--color-bg-secondary)",
              padding: "var(--space-3) var(--space-4)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}>
              <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "var(--space-2)" }}>
                Mã Tham Gia & Liên Kết Mời Nhóm
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <code style={{
                  padding: "6px 12px",
                  background: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  letterSpacing: "1px",
                }}>
                  {project.join_code || "CHƯA CÓ MÃ"}
                </code>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => handleCopy(project.join_code, "code")}
                  disabled={!project.join_code}
                >
                  {copiedCode ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
                  {copiedCode ? "Đã chép mã" : "Sao chép mã"}
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => handleCopy(`${window.location.origin}/#join=${project.join_code}`, "link")}
                  disabled={!project.join_code}
                >
                  {copiedLink ? <IconCheck width={14} height={14} /> : <IconCopy width={14} height={14} />}
                  {copiedLink ? "Đã chép link" : "Sao chép liên kết"}
                </button>
              </div>
            </div>
          )}

          {/* RBAC Comparison Table */}
          <div style={{
            background: "var(--color-bg-secondary)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontWeight: 600, fontSize: "12px", marginBottom: "6px" }}>
              <IconInfo width={14} height={14} />
              Phân Quyền Các Cấp Trong Dự Án (RBAC)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)", fontSize: "11px" }}>
              <div style={{ background: "var(--color-bg-primary)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "#2563EB" }}>1. Trưởng nhóm (Leader)</strong>
                <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", lineHeight: 1.3 }}>
                  Người tạo dự án hoặc được chuyển giao. Toàn quyền sửa/xóa dự án, phân quyền cấp dưới, duyệt nghiệm thu.
                </p>
              </div>
              <div style={{ background: "var(--color-bg-primary)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "#4F46E5" }}>2. Phó nhóm (Deputy)</strong>
                <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", lineHeight: 1.3 }}>
                  Quản trị vận hành: Quản lý Sprint, phân công User Stories, thêm thành viên, chạy test case. Không thể xóa dự án.
                </p>
              </div>
              <div style={{ background: "var(--color-bg-primary)", padding: "var(--space-2)", borderRadius: "var(--radius-sm)" }}>
                <strong style={{ color: "#64748B" }}>3. Thành viên (Member)</strong>
                <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", lineHeight: 1.3 }}>
                  Thực thi kiểm thử: Xem yêu cầu, sinh test case, chạy test và cập nhật kết quả Pass/Fail, xuất báo cáo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
