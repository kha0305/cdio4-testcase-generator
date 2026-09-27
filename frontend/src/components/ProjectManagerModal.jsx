import { useState, useEffect } from "react";
import {
  getProjects,
  createProject,
  getProjectDetails,
  updateProject,
  deleteProject,
  joinProject,
  exportTestSuite,
  exportProjectReport,
  getTestSuite,
  seedSampleProject,
} from "../api";
import {
  IconFolder,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconSearch,
  IconLayers,
  IconPieChart,
  IconUser,
  IconUsers,
  IconCalendar,
  IconRefresh,
  IconDownload,
  IconExternalLink,
  IconLoader,
  IconAlertTriangle,
  IconCopy,
  IconSparkles,
} from "../icons";

export default function ProjectManagerModal({
  isOpen,
  onClose,
  activeProject,
  onSelectProject,
  onOpenSuite,
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all" | "personal" | "team"

  const [view, setView] = useState("list"); // "list" | "create" | "edit" | "detail" | "join"
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form states
  const [formId, setFormId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formProjectType, setFormProjectType] = useState("personal"); // "personal" | "team"
  const [formVersion, setFormVersion] = useState("1.0.0");
  const [formLead, setFormLead] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Join by code states
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState("");

  // Export dropdown state
  const [exportDropdownId, setExportDropdownId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setView("list");
      setDeleteConfirmId(null);
      setJoinError("");
      loadProjects();
    }
  }, [isOpen]);

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data);
      if (!activeProject && data.length > 0) {
        onSelectProject(data[0]);
      }
    } catch (err) {
      setError("Không thể tải danh sách dự án: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setFormId(null);
    setFormName("");
    setFormCode("");
    setFormProjectType("personal");
    setFormVersion("1.0.0");
    setFormLead("QA Lead");
    setFormDescription("");
    setView("create");
  }

  function handleOpenEdit(p) {
    setFormId(p.id);
    setFormName(p.name);
    setFormCode(p.code);
    setFormProjectType(p.project_type || "personal");
    setFormVersion(p.version || "1.0.0");
    setFormLead(p.lead || "");
    setFormDescription(p.description || "");
    setView("edit");
  }

  async function handleOpenDetail(projectId) {
    setView("detail");
    setDetailLoading(true);
    try {
      const data = await getProjectDetails(projectId);
      setSelectedDetail(data);
    } catch (err) {
      setError("Lỗi khi tải chi tiết dự án: " + err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleSubmitForm(e) {
    e.preventDefault();
    if (!formName.trim()) return;
    setFormSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        code: formCode.trim() || undefined,
        project_type: formProjectType,
        version: formVersion.trim() || "1.0.0",
        lead: formLead.trim() || "QA Lead",
        description: formDescription.trim(),
      };
      if (view === "create") {
        const newProj = await createProject(payload);
        await loadProjects();
        onSelectProject(newProj);
        setView("list");
      } else {
        const updated = await updateProject(formId, payload);
        await loadProjects();
        if (activeProject && activeProject.id === updated.id) {
          onSelectProject(updated);
        }
        setView("list");
      }
    } catch (err) {
      alert("Lỗi khi lưu dự án: " + err.message);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleJoinProject(e) {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      const joinedProj = await joinProject(joinCodeInput.trim());
      await loadProjects();
      onSelectProject(joinedProj);
      setJoinCodeInput("");
      setView("list");
    } catch (err) {
      setJoinError(err.message || "Mã tham gia không hợp lệ hoặc dự án không tồn tại.");
    } finally {
      setJoinLoading(false);
    }
  }

  async function handleSeedSample() {
    setLoading(true);
    try {
      const sample = await seedSampleProject();
      await loadProjects();
      onSelectProject(sample);
      onClose();
    } catch (err) {
      alert("Lỗi khi nạp dự án mẫu: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(projectId) {
    try {
      await deleteProject(projectId);
      setDeleteConfirmId(null);
      await loadProjects();
      if (activeProject && activeProject.id === projectId) {
        const remaining = projects.filter((p) => p.id !== projectId);
        if (remaining.length > 0) onSelectProject(remaining[0]);
      }
      if (view === "detail") setView("list");
    } catch (err) {
      alert("Lỗi khi xóa dự án: " + err.message);
    }
  }

  async function handleLoadPastSuite(suiteId, proj) {
    try {
      setLoading(true);
      const suiteData = await getTestSuite(suiteId);
      if (onSelectProject) onSelectProject(proj);
      if (onOpenSuite) onOpenSuite(suiteData, proj);
      onClose();
    } catch (err) {
      alert("Lỗi khi tải test suite: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyJoinCode(code) {
    navigator.clipboard.writeText(code);
    setCopyFeedback(code);
    setTimeout(() => setCopyFeedback(""), 2000);
  }

  function handleCopyInviteLink(code) {
    const inviteLink = `${window.location.origin}?join=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(inviteLink);
    setCopyFeedback(`link-${code}`);
    setTimeout(() => setCopyFeedback(""), 2000);
  }

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.lead && p.lead.toLowerCase().includes(q)) ||
      (p.join_code && p.join_code.toLowerCase().includes(q));

    if (typeFilter === "personal") return matchesSearch && (p.project_type === "personal" || !p.project_type);
    if (typeFilter === "team") return matchesSearch && p.project_type === "team";
    return matchesSearch;
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: "980px" }}
        onClick={(e) => {
          e.stopPropagation();
          setExportDropdownId(null);
        }}
      >
        {/* --- Header --- */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <IconFolder width={20} height={20} style={{ color: "var(--color-accent)" }} />
            <h2 className="modal-header__title">
              {view === "create" && "Tạo Dự Án Mới"}
              {view === "edit" && "Chỉnh Sửa Thông Tin Dự Án"}
              {view === "detail" && `Chi Tiết Dự Án: ${selectedDetail?.name || ""}`}
              {view === "join" && "Tham Gia Dự Án Nhóm Bằng Mã"}
              {view === "list" && "Quản Lý Dự Án Kiểm Thử"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            {view !== "list" ? (
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  setView("list");
                  setJoinError("");
                }}
              >
                Quay lại danh sách
              </button>
            ) : (
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={handleSeedSample}
                  title="Nạp sẵn dự án mẫu Scrum E-Commerce hoàn chỉnh để báo cáo nghiệm thu"
                >
                  <IconSparkles width={14} height={14} /> Nạp Mẫu Đồ Án
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setView("join")}
                  title="Nhập mã mời để tham gia dự án nhóm"
                >
                  <IconUsers width={14} height={14} /> Tham Gia Bằng Mã
                </button>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={handleOpenCreate}
                >
                  <IconPlus width={14} height={14} /> Tạo Dự Án Mới
                </button>
              </div>
            )}
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={onClose}
              style={{ padding: "4px 8px" }}
              title="Đóng"
            >
              <IconX width={16} height={16} />
            </button>
          </div>
        </div>

        {/* --- Body --- */}
        <div className="modal-body" style={{ minHeight: "450px" }}>
          {error && (
            <div className="alert alert--error" style={{ marginBottom: "var(--space-4)" }}>
              <IconAlertTriangle width={16} height={16} />
              <span>{error}</span>
            </div>
          )}

          {/* ---- VIEW: JOIN PROJECT BY CODE ---- */}
          {view === "join" && (
            <div style={{ maxWidth: "520px", margin: "0 auto", padding: "var(--space-4) 0" }}>
              <div style={{
                textAlign: "center",
                marginBottom: "var(--space-6)",
              }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--color-accent-light)",
                  color: "var(--color-accent)",
                  marginBottom: "var(--space-3)",
                }}>
                  <IconUsers width={28} height={28} />
                </div>
                <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 700, margin: "0 0 var(--space-1) 0" }}>
                  Tham Gia Dự Án Của Nhóm Bạn
                </h3>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
                  Nhập mã tham gia (Join Code) do Trưởng nhóm (QA Lead / Chủ dự án) cung cấp để xem toàn bộ kịch bản và cùng thực thi kiểm thử.
                </p>
              </div>

              {joinError && (
                <div className="alert alert--error" style={{ marginBottom: "var(--space-4)" }}>
                  <IconAlertTriangle width={16} height={16} />
                  <span>{joinError}</span>
                </div>
              )}

              <form onSubmit={handleJoinProject} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>
                    Mã Tham Gia Dự Án (Join Code hoặc Mã Dự Án) *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ví dụ: TEAM-7A9B1C hoặc PRJ-SHOP"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--font-size-md)",
                      textAlign: "center",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      padding: "var(--space-3)",
                    }}
                    autoFocus
                    required
                  />
                  <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                    Gợi ý: Mã nhóm thường có định dạng tiền tố TEAM- kèm 6 ký tự số/chữ.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => {
                      setView("list");
                      setJoinError("");
                    }}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={joinLoading || !joinCodeInput.trim()}
                  >
                    {joinLoading ? <IconLoader width={16} height={16} /> : <IconCheck width={16} height={16} />}
                    Tham Gia Dự Án
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---- VIEW: CREATE / EDIT FORM ---- */}
          {(view === "create" || view === "edit") && (
            <form onSubmit={handleSubmitForm} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {/* Loại dự án: Cá nhân vs Nhóm */}
              <div>
                <label className="input-label" style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>
                  Mô Hình Dự Án *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                  {/* Cá nhân */}
                  <div
                    onClick={() => setFormProjectType("personal")}
                    style={{
                      border: formProjectType === "personal" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                      background: formProjectType === "personal" ? "var(--color-accent-light)" : "var(--color-bg-primary)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-3)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      marginTop: "2px",
                      color: formProjectType === "personal" ? "var(--color-accent)" : "var(--color-text-secondary)",
                    }}>
                      <IconUser width={20} height={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text-primary)" }}>
                        Dự Án Cá Nhân
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                        Phục vụ kiểm thử độc lập, bài tập cá nhân, nghiên cứu thuật toán sinh test case.
                      </div>
                    </div>
                  </div>

                  {/* Nhóm */}
                  <div
                    onClick={() => setFormProjectType("team")}
                    style={{
                      border: formProjectType === "team" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                      background: formProjectType === "team" ? "var(--color-accent-light)" : "var(--color-bg-primary)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-3)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{
                      marginTop: "2px",
                      color: formProjectType === "team" ? "var(--color-accent)" : "var(--color-text-secondary)",
                    }}>
                      <IconUsers width={20} height={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text-primary)" }}>
                        Dự Án Nhóm (Scrum / Team)
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                        Tự động cấp mã mời (Join Code) để các thành viên trong nhóm cùng tham gia làm việc.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Tên Dự Án *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ví dụ: Hệ Thống Đặt Hàng & Thanh Toán E-Commerce"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Mã Dự Án (Code)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ví dụ: PRJ-SHOP"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    style={{ fontFamily: "var(--font-mono)" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Phiên Bản Kiểm Thử (Version)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="1.0.0"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Người Phụ Trách (QA Lead / Owner)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={formLead}
                    onChange={(e) => setFormLead(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Mục Tiêu & Mô Tả Dự Án</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Mô tả phạm vi kiểm thử, mục tiêu Sprint hoặc các phân hệ chính..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setView("list")}
                  disabled={formSubmitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={formSubmitting || !formName.trim()}
                >
                  {formSubmitting ? <IconLoader width={16} height={16} /> : <IconCheck width={16} height={16} />}
                  {view === "create" ? "Tạo Dự Án" : "Lưu Thay Đổi"}
                </button>
              </div>
            </form>
          )}

          {/* ---- VIEW: PROJECT DETAILS & REPORT ---- */}
          {view === "detail" && (
            <div>
              {detailLoading ? (
                <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-text-tertiary)" }}>
                  <IconLoader width={24} height={24} />
                  <div style={{ marginTop: "var(--space-2)" }}>Đang tải dữ liệu dự án...</div>
                </div>
              ) : selectedDetail ? (
                <div>
                  {/* Top Stats Banner */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-4)",
                  }}>
                    <div style={{ padding: "var(--space-3)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Chức Năng (Requirements)</div>
                      <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>{selectedDetail.requirements_count || 0}</div>
                    </div>
                    <div style={{ padding: "var(--space-3)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Bộ Test (Suites)</div>
                      <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>{selectedDetail.test_suites_count || 0}</div>
                    </div>
                    <div style={{ padding: "var(--space-3)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>Tổng Test Cases</div>
                      <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text-primary)" }}>{selectedDetail.total_cases || 0}</div>
                    </div>
                    <div style={{ padding: "var(--space-3)", background: "var(--color-success-bg)", borderRadius: "var(--radius-md)", border: "1px solid rgba(34,197,94,0.3)", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-success)" }}>Đạt (Pass)</div>
                      <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-success)" }}>{selectedDetail.pass_count || 0}</div>
                    </div>
                    <div style={{ padding: "var(--space-3)", background: "var(--color-error-bg)", borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,0.3)", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-error)" }}>Lỗi (Fail)</div>
                      <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-error)" }}>{selectedDetail.fail_count || 0}</div>
                    </div>
                    <div style={{ padding: "var(--space-3)", background: "var(--color-accent-light)", borderRadius: "var(--radius-md)", border: "1px solid rgba(59,130,246,0.3)", textAlign: "center" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-accent)" }}>Tỷ Lệ Đạt</div>
                      <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-accent)" }}>{selectedDetail.pass_rate || 0}%</div>
                    </div>
                  </div>

                  {/* Actions & Export Bar */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--space-3) var(--space-4)",
                    background: "var(--color-bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "var(--space-4)",
                    border: "1px solid var(--color-border)",
                    flexWrap: "wrap",
                    gap: "var(--space-2)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <span className={`badge ${selectedDetail.project_type === "team" ? "badge--primary" : "badge--neutral"}`}>
                        {selectedDetail.project_type === "team" ? (
                          <><IconUsers width={12} height={12} /> Dự Án Nhóm</>
                        ) : (
                          <><IconUser width={12} height={12} /> Dự Án Cá Nhân</>
                        )}
                      </span>
                      {selectedDetail.join_code && (
                        <span
                          className="badge badge--neutral"
                          style={{ fontFamily: "var(--font-mono)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          onClick={() => handleCopyJoinCode(selectedDetail.join_code)}
                          title="Bấm để sao chép mã tham gia"
                        >
                          Mã mời: <strong>{selectedDetail.join_code}</strong>
                          <IconCopy width={11} height={11} />
                        </span>
                      )}
                      {copyFeedback === selectedDetail.join_code && (
                        <span style={{ fontSize: "11px", color: "var(--color-success)", fontWeight: 600 }}>Đã sao chép!</span>
                      )}
                    </div>

                    {/* Export full project buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", marginRight: "var(--space-1)" }}>
                        Xuất Toàn Dự Án:
                      </span>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => exportProjectReport(selectedDetail.id, "xlsx")}
                        title="Xuất file Excel chuyên nghiệp 4 Sheet"
                      >
                        <IconDownload width={13} height={13} /> Excel
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => exportProjectReport(selectedDetail.id, "csv")}
                        title="Xuất file CSV chuẩn hóa"
                      >
                        CSV
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => exportProjectReport(selectedDetail.id, "json")}
                        title="Xuất định dạng JSON có cấu trúc"
                      >
                        JSON
                      </button>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => exportProjectReport(selectedDetail.id, "markdown")}
                        title="Xuất bảng Markdown"
                      >
                        Markdown
                      </button>
                    </div>
                  </div>

                  {/* Requirements & Test Suites List */}
                  <h4 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
                    Danh Sách Chức Năng Con / Yêu Cầu Kiểm Thử ({selectedDetail.requirements?.length || 0})
                  </h4>

                  {!selectedDetail.requirements || selectedDetail.requirements.length === 0 ? (
                    <div style={{
                      textAlign: "center",
                      padding: "var(--space-6)",
                      border: "1px dashed var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--color-text-tertiary)",
                      fontSize: "var(--font-size-sm)",
                    }}>
                      Chưa có yêu cầu kiểm thử nào. Bạn hãy chọn dự án này và nhập yêu cầu tại Bước 1!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                      {selectedDetail.requirements.map((req) => (
                        <div key={req.id} style={{
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--space-3) var(--space-4)",
                          background: "var(--color-bg-primary)",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                            <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{req.title || "Chức năng không tiêu đề"}</div>
                            <span className="badge badge--neutral" style={{ fontSize: "11px" }}>REQ-{req.id}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", marginBottom: "var(--space-2)" }}>
                            Thời gian: {req.created_at} | Số tham số bóc tách: {req.parameters?.length || 0}
                          </div>

                          <div style={{
                            background: "var(--color-bg-secondary)",
                            padding: "var(--space-2) var(--space-3)",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "var(--font-size-xs)",
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-text-secondary)",
                            whiteSpace: "pre-line",
                            maxHeight: "65px",
                            overflowY: "auto",
                          }}>
                            {req.raw_text}
                          </div>

                          {req.test_suites && req.test_suites.length > 0 && (
                            <div style={{ marginTop: "var(--space-2)" }}>
                              {req.test_suites.map((s) => (
                                <div key={s.id} style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "var(--space-1) var(--space-2)",
                                  background: "var(--color-bg-tertiary)",
                                  borderRadius: "var(--radius-sm)",
                                  marginTop: "var(--space-1)",
                                  fontSize: "var(--font-size-xs)",
                                  gap: "var(--space-2)",
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minWidth: 0, flexWrap: "wrap" }}>
                                    <span className="badge badge--primary" style={{ fontSize: "11px" }}>Suite #{s.id}</span>
                                    <span style={{ fontWeight: 600 }}>{s.total_cases} ca kiểm thử</span>
                                    <span style={{ color: "var(--color-text-tertiary)" }}>{s.technique} | {s.created_at}</span>
                                  </div>
                                  <div style={{ display: "flex", gap: "var(--space-1)", flexShrink: 0 }}>
                                    <button
                                      type="button"
                                      className="btn btn--secondary btn--sm"
                                      style={{ fontSize: "11px", padding: "2px 6px" }}
                                      onClick={() => handleLoadPastSuite(s.id, selectedDetail)}
                                    >
                                      <IconExternalLink width={12} height={12} /> Xem
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn--secondary btn--sm"
                                      style={{ fontSize: "11px", padding: "2px 6px" }}
                                      onClick={() => exportTestSuite(s.id, "xlsx")}
                                    >
                                      <IconDownload width={12} height={12} /> Excel
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* ---- VIEW: PROJECT LIST ---- */}
          {view === "list" && (
            <div>
              {/* Filter Tabs & Search Bar */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "var(--space-3)",
                marginBottom: "var(--space-4)",
                flexWrap: "wrap",
              }}>
                {/* Search */}
                <div style={{ position: "relative", flex: "1 1 280px" }}>
                  <span style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}>
                    <IconSearch width={15} height={15} />
                  </span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tìm theo tên, mã, người phụ trách hoặc mã mời..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: "32px" }}
                  />
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
                  <button
                    type="button"
                    className={`btn btn--sm ${typeFilter === "all" ? "btn--primary" : "btn--secondary"}`}
                    onClick={() => setTypeFilter("all")}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    Tất Cả ({projects.length})
                  </button>
                  <button
                    type="button"
                    className={`btn btn--sm ${typeFilter === "personal" ? "btn--primary" : "btn--secondary"}`}
                    onClick={() => setTypeFilter("personal")}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    <IconUser width={12} height={12} /> Cá Nhân
                  </button>
                  <button
                    type="button"
                    className={`btn btn--sm ${typeFilter === "team" ? "btn--primary" : "btn--secondary"}`}
                    onClick={() => setTypeFilter("team")}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    <IconUsers width={12} height={12} /> Nhóm
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={loadProjects}
                    title="Làm mới danh sách"
                    style={{ padding: "4px 8px" }}
                  >
                    <IconRefresh width={14} height={14} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--color-text-tertiary)" }}>
                  <IconLoader width={24} height={24} />
                  <div style={{ marginTop: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>Đang tải danh sách dự án...</div>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "var(--space-8)",
                  border: "1px dashed var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-tertiary)",
                }}>
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    Không tìm thấy dự án nào phù hợp với bộ lọc.
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "var(--space-2)" }}>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => setView("join")}>
                      <IconUsers width={14} height={14} /> Tham Gia Bằng Mã
                    </button>
                    <button type="button" className="btn btn--primary btn--sm" onClick={handleOpenCreate}>
                      <IconPlus width={14} height={14} /> Tạo Dự Án Mới
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {filteredProjects.map((p) => {
                    const isActive = activeProject && activeProject.id === p.id;
                    const passPercent = p.total_cases > 0 ? (p.pass_count / p.total_cases) * 100 : 0;
                    const failPercent = p.total_cases > 0 ? (p.fail_count / p.total_cases) * 100 : 0;
                    const isTeam = p.project_type === "team";

                    return (
                      <div
                        key={p.id}
                        style={{
                          border: isActive ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--space-3) var(--space-4)",
                          background: isActive ? "var(--color-accent-light)" : "var(--color-bg-primary)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* Row 1: Badges + Title + Actions */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)" }}>
                          {/* Left info */}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            {/* Badges row */}
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)", flexWrap: "wrap" }}>
                              <span className="badge badge--primary" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                                {p.code}
                              </span>
                              <span className="badge badge--neutral" style={{ fontSize: "11px" }}>
                                v{p.version}
                              </span>
                              <span className={`badge ${isTeam ? "badge--primary" : "badge--neutral"}`} style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                {isTeam ? <IconUsers width={11} height={11} /> : <IconUser width={11} height={11} />}
                                {isTeam ? `Dự Án Nhóm (${p.members_count || 1} tv)` : "Cá Nhân"}
                              </span>
                              {p.current_user_role && (
                                <span
                                  className={`badge ${
                                    p.current_user_role === "leader"
                                      ? "badge--primary"
                                      : p.current_user_role === "deputy"
                                      ? "badge--info"
                                      : "badge--secondary"
                                  }`}
                                  style={{ fontSize: "11px", fontWeight: 600 }}
                                  title="Vai trò của bạn trong dự án này"
                                >
                                  {p.current_user_role === "leader" ? "Trưởng nhóm" : p.current_user_role === "deputy" ? "Phó nhóm" : "Thành viên"}
                                </span>
                              )}
                              {isActive && (
                                <span className="badge badge--pass" style={{ fontSize: "11px", fontWeight: 600 }}>
                                  Đang Làm Việc
                                </span>
                              )}
                              {/* Team Join Code pill */}
                              {isTeam && p.join_code && (
                                <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyJoinCode(p.join_code)}
                                    className="btn btn--secondary btn--sm"
                                    style={{ fontSize: "10px", padding: "1px 5px", fontFamily: "var(--font-mono)" }}
                                    title="Bấm để sao chép mã mời tham gia nhóm"
                                  >
                                    Mã: {p.join_code} <IconCopy width={10} height={10} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyInviteLink(p.join_code)}
                                    className="btn btn--secondary btn--sm"
                                    style={{ fontSize: "10px", padding: "1px 5px" }}
                                    title="Sao chép đường link tham gia dự án"
                                  >
                                    Link mời
                                  </button>
                                  {copyFeedback === p.join_code && (
                                    <span style={{ fontSize: "10px", color: "var(--color-success)", fontWeight: 600 }}>Đã chép mã!</span>
                                  )}
                                  {copyFeedback === `link-${p.join_code}` && (
                                    <span style={{ fontSize: "10px", color: "var(--color-success)", fontWeight: 600 }}>Đã chép link!</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Title */}
                            <h3
                              style={{
                                margin: "0 0 var(--space-1) 0",
                                fontSize: "var(--font-size-sm)",
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "var(--color-text-primary)",
                              }}
                              onClick={() => handleOpenDetail(p.id)}
                              title="Xem chi tiết dự án"
                            >
                              {p.name}
                            </h3>

                            {/* Description */}
                            <p style={{
                              margin: "0 0 var(--space-2) 0",
                              fontSize: "var(--font-size-xs)",
                              color: "var(--color-text-tertiary)",
                              lineHeight: 1.4,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "500px",
                            }}>
                              {p.description || "Chưa có phần mô tả."}
                            </p>

                            {/* Metadata */}
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", flexWrap: "wrap" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <IconUser width={13} height={13} /> {p.lead}
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <IconCalendar width={13} height={13} /> {p.created_at}
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <IconLayers width={13} height={13} /> {p.requirements_count} Chức năng
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <IconPieChart width={13} height={13} /> {p.total_cases} Test Cases ({p.pass_rate}% Pass)
                              </span>
                            </div>
                          </div>

                          {/* Right Action buttons */}
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", flexShrink: 0, position: "relative" }}>
                            {!isActive ? (
                              <button
                                type="button"
                                className="btn btn--primary btn--sm"
                                onClick={() => onSelectProject(p)}
                                title="Chọn dự án này để làm việc"
                              >
                                <IconCheck width={13} height={13} /> Chọn
                              </button>
                            ) : (
                              <span style={{ fontSize: "11px", color: "var(--color-accent)", fontWeight: 600, padding: "4px 6px", whiteSpace: "nowrap" }}>
                                Đang chọn
                              </span>
                            )}

                            <button
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={() => handleOpenDetail(p.id)}
                              title="Xem chi tiết các chức năng"
                            >
                              Chi tiết
                            </button>

                            {/* Export dropdown toggle */}
                            <div style={{ position: "relative" }}>
                              <button
                                type="button"
                                className="btn btn--secondary btn--sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExportDropdownId(exportDropdownId === p.id ? null : p.id);
                                }}
                                title="Xuất báo cáo toàn bộ dự án"
                              >
                                <IconDownload width={13} height={13} /> Xuất
                              </button>
                              {exportDropdownId === p.id && (
                                <div style={{
                                  position: "absolute",
                                  right: 0,
                                  top: "100%",
                                  marginTop: "4px",
                                  background: "var(--color-bg-primary)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "var(--radius-md)",
                                  boxShadow: "var(--shadow-md)",
                                  padding: "var(--space-1)",
                                  zIndex: 10,
                                  display: "flex",
                                  flexDirection: "column",
                                  minWidth: "120px",
                                }}>
                                  <button
                                    type="button"
                                    className="btn btn--secondary btn--sm"
                                    style={{ justifyContent: "flex-start", border: "none", width: "100%", fontSize: "11px" }}
                                    onClick={() => {
                                      exportProjectReport(p.id, "xlsx");
                                      setExportDropdownId(null);
                                    }}
                                  >
                                    Excel (.xlsx)
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn--secondary btn--sm"
                                    style={{ justifyContent: "flex-start", border: "none", width: "100%", fontSize: "11px" }}
                                    onClick={() => {
                                      exportProjectReport(p.id, "csv");
                                      setExportDropdownId(null);
                                    }}
                                  >
                                    CSV (.csv)
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn--secondary btn--sm"
                                    style={{ justifyContent: "flex-start", border: "none", width: "100%", fontSize: "11px" }}
                                    onClick={() => {
                                      exportProjectReport(p.id, "json");
                                      setExportDropdownId(null);
                                    }}
                                  >
                                    JSON (.json)
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn--secondary btn--sm"
                                    style={{ justifyContent: "flex-start", border: "none", width: "100%", fontSize: "11px" }}
                                    onClick={() => {
                                      exportProjectReport(p.id, "markdown");
                                      setExportDropdownId(null);
                                    }}
                                  >
                                    Markdown (.md)
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={() => handleOpenEdit(p)}
                              title={p.current_user_role === "member" ? "Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền sửa thông tin dự án" : "Sửa thông tin dự án"}
                              style={{ padding: "4px 6px" }}
                              disabled={p.current_user_role === "member"}
                            >
                              <IconEdit width={13} height={13} />
                            </button>

                            <button
                              type="button"
                              className="btn btn--secondary btn--sm"
                              onClick={() => {
                                if (p.current_user_role !== "leader") {
                                  alert("Chỉ duy nhất Trưởng nhóm (Leader) người tạo dự án mới có quyền xóa vĩnh viễn dự án này.");
                                  return;
                                }
                                setDeleteConfirmId(p.id);
                              }}
                              title={p.current_user_role !== "leader" ? "Chỉ Trưởng nhóm (Leader) mới có quyền xóa dự án này" : "Xóa vĩnh viễn dự án"}
                              style={{
                                padding: "4px 6px",
                                color: p.current_user_role === "leader" ? "var(--color-error)" : "var(--color-text-tertiary)",
                                opacity: p.current_user_role === "leader" ? 1 : 0.5,
                              }}
                            >
                              <IconTrash width={13} height={13} />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar (Pass / Fail / Untested) */}
                        {p.total_cases > 0 && (
                          <div style={{ marginTop: "var(--space-2)" }}>
                            <div style={{
                              height: "6px",
                              borderRadius: "3px",
                              background: "var(--color-border)",
                              display: "flex",
                              overflow: "hidden",
                            }}>
                              <div style={{ width: `${passPercent}%`, background: "var(--color-success)" }} title={`Đạt: ${p.pass_count} ca (${passPercent.toFixed(1)}%)`} />
                              <div style={{ width: `${failPercent}%`, background: "var(--color-error)" }} title={`Lỗi: ${p.fail_count} ca (${failPercent.toFixed(1)}%)`} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                              <span>Đạt: {p.pass_count} ca ({passPercent.toFixed(0)}%)</span>
                              <span>Lỗi: {p.fail_count} ca ({failPercent.toFixed(0)}%)</span>
                              <span>Chưa kiểm: {p.untested_count} ca</span>
                            </div>
                          </div>
                        )}

                        {/* Delete confirmation inline alert */}
                        {deleteConfirmId === p.id && (
                          <div style={{
                            marginTop: "var(--space-2)",
                            padding: "var(--space-2) var(--space-3)",
                            background: "var(--color-error-bg)",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            borderRadius: "var(--radius-sm)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "var(--font-size-xs)",
                            gap: "var(--space-2)",
                          }}>
                            <span style={{ color: "var(--color-error)", fontWeight: 500 }}>
                              Xác nhận xóa dự án &quot;{p.name}&quot; cùng toàn bộ kịch bản kiểm thử liên quan?
                            </span>
                            <div style={{ display: "flex", gap: "var(--space-1)", flexShrink: 0 }}>
                              <button
                                type="button"
                                className="btn btn--secondary btn--sm"
                                style={{ fontSize: "11px", padding: "2px 6px" }}
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                className="btn btn--sm"
                                style={{
                                  fontSize: "11px",
                                  padding: "2px 8px",
                                  background: "var(--color-error)",
                                  color: "#FFFFFF",
                                  border: "none",
                                }}
                                onClick={() => handleDelete(p.id)}
                              >
                                Xóa Vĩnh Viễn
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
