import { useState, useEffect } from "react";
import { getProjectSprints, createSprint, updateSprint, deleteSprint, getProjectRequirements, updateRequirement } from "../api";
import { IconLayers, IconPlus, IconCheck, IconAlertTriangle, IconUser, IconCalendar, IconLoader, IconCheckCircle, IconXCircle, IconTrash } from "../icons";

export default function ScrumView({ activeProject, onSelectFeatureForTesting }) {
  const [sprints, setSprints] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState(null);

  // Form states
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (activeProject?.id) {
      loadData(activeProject.id);
    }
  }, [activeProject]);

  async function loadData(projectId) {
    setLoading(true);
    try {
      const [sprintsData, reqsData] = await Promise.all([
        getProjectSprints(projectId),
        getProjectRequirements(projectId),
      ]);
      setSprints(sprintsData);
      setRequirements(reqsData);
      if (sprintsData.length > 0 && !selectedSprintId) {
        setSelectedSprintId(sprintsData[0].id);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Scrum:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSprint(e) {
    e.preventDefault();
    if (!sprintName.trim()) return;
    setCreating(true);
    try {
      await createSprint({
        project_id: activeProject.id,
        name: sprintName.trim(),
        goal: sprintGoal.trim(),
        start_date: startDate,
        end_date: endDate,
        status: "active",
      });
      setSprintName("");
      setSprintGoal("");
      setStartDate("");
      setEndDate("");
      setShowCreateSprint(false);
      await loadData(activeProject.id);
    } catch (err) {
      alert("Lỗi khi tạo Sprint: " + err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteSprint(sprintId) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa Sprint này?")) return;
    try {
      await deleteSprint(sprintId);
      await loadData(activeProject.id);
    } catch (err) {
      alert("Lỗi khi xóa Sprint: " + err.message);
    }
  }

  async function handleMoveStatus(reqId, newStatus) {
    try {
      await updateRequirement(reqId, { status: newStatus });
      await loadData(activeProject.id);
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + err.message);
    }
  }

  const activeSprint = sprints.find((s) => s.id === selectedSprintId) || sprints[0];
  const sprintReqs = activeSprint
    ? requirements.filter((r) => r.sprint_id === activeSprint.id)
    : requirements;

  const cols = [
    { key: "planning", label: "Lên Kế Hoạch (Planning)", bg: "var(--color-bg-secondary)" },
    { key: "in_testing", label: "Đang Kiểm Thử (In Testing)", bg: "var(--color-accent-light)" },
    { key: "completed", label: "Đã Hoàn Thành (Done)", bg: "var(--color-success-bg)" },
  ];

  const isLeader = activeProject?.current_user_role === "leader";
  const isDeputy = activeProject?.current_user_role === "deputy";
  const canManageSprint = isLeader || isDeputy;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Top bar: Sprints tab & Create button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        borderBottom: "1px solid var(--color-border)",
        paddingBottom: "var(--space-3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
            <IconLayers width={16} height={16} /> Các Sprints:
          </span>
          {sprints.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`btn btn--sm ${selectedSprintId === s.id ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setSelectedSprintId(s.id)}
              style={{ fontSize: "12px" }}
            >
              {s.name} ({s.requirements_count} stories)
            </button>
          ))}
          {sprints.length === 0 && (
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)" }}>
              Chưa có Sprint nào trong dự án này.
            </span>
          )}
        </div>

        {canManageSprint ? (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setShowCreateSprint(!showCreateSprint)}
          >
            <IconPlus width={14} height={14} /> Tạo Sprint Mới
          </button>
        ) : (
          <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)" }}>
            (Chỉ Leader/Phó nhóm mới có quyền tạo Sprint)
          </span>
        )}
      </div>

      {/* Form Tạo Sprint Mới */}
      {showCreateSprint && (
        <form onSubmit={handleCreateSprint} style={{
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}>
          <h4 style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Khởi Tạo Chu Kỳ Sprint Mới</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label className="input-label" style={{ fontWeight: 600 }}>Tên Sprint *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Ví dụ: Sprint 2: Thanh Toán & Vận Chuyển"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="input-label" style={{ fontWeight: 600 }}>Ngày Bắt Đầu</label>
              <input
                type="date"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="input-label" style={{ fontWeight: 600 }}>Ngày Kết Thúc</label>
              <input
                type="date"
                className="input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="input-label" style={{ fontWeight: 600 }}>Mục Tiêu Sprint (Sprint Goal)</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Nêu rõ mục tiêu nghiệm thu kiểm thử trong chu kỳ này..."
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowCreateSprint(false)}>Hủy</button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={creating || !sprintName.trim()}>
              {creating ? <IconLoader width={14} height={14} /> : <IconCheck width={14} height={14} />} Tạo Sprint
            </button>
          </div>
        </form>
      )}

      {/* Active Sprint Dashboard & Definition of Done banner */}
      {activeSprint && (
        <div style={{
          background: "var(--color-bg-primary)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: 700 }}>{activeSprint.name}</h3>
                <span className="badge badge--primary" style={{ fontSize: "11px" }}>{activeSprint.status.toUpperCase()}</span>
                {/* Definition of Done (DoD) Badge */}
                {activeSprint.dod_met ? (
                  <span className="badge badge--pass" style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <IconCheckCircle width={12} height={12} /> Đạt Chuẩn Nghiệm Thu DoD (Pass {activeSprint.pass_rate}%)
                  </span>
                ) : (
                  <span className="badge badge--fail" style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <IconAlertTriangle width={12} height={12} /> Chưa Đạt DoD (Hiện tại: {activeSprint.pass_rate}% Pass)
                  </span>
                )}
              </div>
              <p style={{ margin: "var(--space-1) 0 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
                <strong>Mục tiêu:</strong> {activeSprint.goal || "Chưa có mục tiêu cụ thể."}
                {activeSprint.start_date && (
                  <span style={{ marginLeft: "var(--space-3)" }}>
                    Thời gian: {activeSprint.start_date} đến {activeSprint.end_date}
                  </span>
                )}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              <div style={{ fontSize: "12px", textAlign: "right" }}>
                <div><strong>{activeSprint.total_cases}</strong> Test Cases</div>
                <div style={{ color: "var(--color-success)", fontWeight: 600 }}>{activeSprint.pass_count} Pass / {activeSprint.fail_count} Fail</div>
              </div>
              {canManageSprint && (
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => handleDeleteSprint(activeSprint.id)}
                  title="Xóa Sprint này"
                  style={{ padding: "4px 6px", color: "var(--color-error)" }}
                >
                  <IconTrash width={14} height={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board 3 Columns for User Stories */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
        {cols.map((col) => {
          const items = sprintReqs.filter((r) => (r.status || "planning") === col.key);

          return (
            <div
              key={col.key}
              style={{
                background: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3)",
                display: "flex",
                flexDirection: "column",
                minHeight: "360px",
              }}
            >
              {/* Column Header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-3)",
                paddingBottom: "var(--space-2)",
                borderBottom: "1px solid var(--color-border)",
              }}>
                <span style={{ fontWeight: 600, fontSize: "var(--font-size-xs)", color: "var(--color-text-primary)" }}>
                  {col.label}
                </span>
                <span className="badge badge--neutral" style={{ fontSize: "11px" }}>{items.length}</span>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
                {items.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: "var(--color-bg-primary)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "var(--space-3)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-1)" }}>
                      <span className={`badge ${req.priority === "High" ? "badge--fail" : "badge--neutral"}`} style={{ fontSize: "10px" }}>
                        {req.priority}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--color-text-tertiary)" }}>REQ-{req.id}</span>
                    </div>

                    <h5 style={{ margin: "0 0 var(--space-2) 0", fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-primary)" }}>
                      {req.title}
                    </h5>

                    <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginBottom: "var(--space-2)" }}>
                      {req.assignee_name && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <IconUser width={11} height={11} /> {req.assignee_name}
                        </div>
                      )}
                      {req.due_date && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-tertiary)" }}>
                          <IconCalendar width={11} height={11} /> Hạn: {req.due_date}
                        </div>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "var(--space-2)",
                      borderTop: "1px solid var(--color-border)",
                    }}>
                      <span style={{ fontSize: "10px", color: "var(--color-accent)", fontWeight: 600 }}>
                        {req.total_cases} TCs ({req.pass_count}P / {req.fail_count}F)
                      </span>
                      <div style={{ display: "flex", gap: "var(--space-1)" }}>
                        <button
                          type="button"
                          className="btn btn--secondary btn--sm"
                          style={{ fontSize: "10px", padding: "2px 6px" }}
                          onClick={() => onSelectFeatureForTesting(req)}
                        >
                          Kiểm Thử
                        </button>
                        {col.key !== "completed" && (
                          <button
                            type="button"
                            className="btn btn--primary btn--sm"
                            style={{ fontSize: "10px", padding: "2px 6px" }}
                            onClick={() => handleMoveStatus(req.id, col.key === "planning" ? "in_testing" : "completed")}
                            title="Chuyển sang bước tiếp theo"
                          >
                            &gt;
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div style={{
                    textAlign: "center",
                    padding: "var(--space-4)",
                    color: "var(--color-text-tertiary)",
                    fontSize: "11px",
                    fontStyle: "italic",
                  }}>
                    Không có yêu cầu nào
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
