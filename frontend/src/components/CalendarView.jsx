import { useState, useEffect } from "react";
import { getProjectRequirements, updateRequirement, getUsers } from "../api";
import { IconCalendar, IconUser, IconCheck, IconAlertTriangle, IconEdit, IconX } from "../icons";

export default function CalendarView({ activeProject, onSelectFeatureForTesting }) {
  const [requirements, setRequirements] = useState([]);
  const [users, setUsers] = useState([]);
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [editingReq, setEditingReq] = useState(null);
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  useEffect(() => {
    if (activeProject?.id) {
      loadData(activeProject.id);
    }
  }, [activeProject]);

  async function loadData(projectId) {
    try {
      const [reqs, us] = await Promise.all([
        getProjectRequirements(projectId),
        getUsers(),
      ]);
      setRequirements(reqs);
      setUsers(us);
    } catch (err) {
      console.error("Lỗi tải dữ liệu lịch:", err);
    }
  }

  function handleOpenEdit(r) {
    setEditingReq(r);
    setEditAssignee(r.assignee_name || "");
    setEditDueDate(r.due_date || "");
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingReq) return;
    try {
      await updateRequirement(editingReq.id, {
        assignee_name: editAssignee,
        due_date: editDueDate,
      });
      setEditingReq(null);
      await loadData(activeProject.id);
    } catch (err) {
      alert("Lỗi khi cập nhật phân công: " + err.message);
    }
  }

  const filteredReqs = requirements.filter((r) => {
    if (assigneeFilter === "all") return true;
    if (assigneeFilter === "unassigned") return !r.assignee_name;
    return r.assignee_name && r.assignee_name.toLowerCase().includes(assigneeFilter.toLowerCase());
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Header bar: Filter by Assignee */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        borderBottom: "1px solid var(--color-border)",
        paddingBottom: "var(--space-3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <IconCalendar width={18} height={18} style={{ color: "var(--color-accent)" }} />
          <h3 style={{ margin: 0, fontSize: "var(--font-size-md)", fontWeight: 700 }}>
            Lịch Trình Kiểm Thử & Phân Công Nhiệm Vụ
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            Lọc theo Thành Viên:
          </span>
          <select
            className="input-field"
            style={{ width: "auto", fontSize: "12px", padding: "4px 8px" }}
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="all">Tất Cả Thành Viên ({requirements.length})</option>
            <option value="unassigned">Chưa Phân Công</option>
            {users.map((u) => (
              <option key={u.id} value={u.full_name}>
                {u.full_name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Edit Assignment Modal */}
      {editingReq && (
        <div className="modal-backdrop" onClick={() => setEditingReq(null)}>
          <div className="modal-container" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Phân Công Kiểm Thử</h4>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Tên Chức Năng</label>
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>{editingReq.title}</div>
              </div>
              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Người Phụ Trách (Assignee)</label>
                <select
                  className="input-field"
                  value={editAssignee}
                  onChange={(e) => setEditAssignee(e.target.value)}
                >
                  <option value="">-- Chưa phân công --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.full_name}>{u.full_name} ({u.role})</option>
                  ))}
                  <option value="Trần Minh (QA Lead)">Trần Minh (QA Lead)</option>
                  <option value="Nguyễn Văn A (Tester)">Nguyễn Văn A (Tester)</option>
                  <option value="Lê Hoàng (Tester)">Lê Hoàng (Tester)</option>
                </select>
              </div>
              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Hạn Chót Kiểm Thử (Due Date)</label>
                <input
                  type="date"
                  className="input-field"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditingReq(null)}>Hủy</button>
                <button type="submit" className="btn btn--primary btn--sm">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Schedule Table */}
      <div style={{
        background: "var(--color-bg-primary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        overflowX: "auto",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-xs)" }}>
          <thead>
            <tr style={{ background: "var(--color-bg-tertiary)", textAlign: "left" }}>
              <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Mã</th>
              <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Chức Năng Kiểm Thử</th>
              <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Người Phụ Trách</th>
              <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Hạn Chót (Due Date)</th>
              <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Mức Ưu Tiên</th>
              <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Tiến Độ Test</th>
              <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReqs.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "var(--space-3)", fontFamily: "var(--font-mono)" }}>REQ-{r.id}</td>
                <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>{r.title}</td>
                <td style={{ padding: "var(--space-3)" }}>
                  {r.assignee_name ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <IconUser width={12} height={12} style={{ color: "var(--color-accent)" }} />
                      {r.assignee_name}
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-text-tertiary)", fontStyle: "italic" }}>Chưa giao việc</span>
                  )}
                </td>
                <td style={{ padding: "var(--space-3)" }}>
                  {r.due_date ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <IconCalendar width={12} height={12} />
                      {r.due_date}
                    </span>
                  ) : (
                    <span style={{ color: "var(--color-text-tertiary)" }}>--</span>
                  )}
                </td>
                <td style={{ padding: "var(--space-3)" }}>
                  <span className={`badge ${r.priority === "High" ? "badge--fail" : "badge--neutral"}`} style={{ fontSize: "10px" }}>
                    {r.priority}
                  </span>
                </td>
                <td style={{ padding: "var(--space-3)" }}>
                  <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>
                    {r.total_cases} ca ({r.pass_count}P / {r.fail_count}F)
                  </span>
                </td>
                <td style={{ padding: "var(--space-3)", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "var(--space-1)" }}>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      style={{ fontSize: "11px", padding: "2px 6px" }}
                      onClick={() => handleOpenEdit(r)}
                      title="Phân công người phụ trách và hạn chót"
                    >
                      <IconEdit width={12} height={12} /> Phân Công
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      style={{ fontSize: "11px", padding: "2px 6px" }}
                      onClick={() => onSelectFeatureForTesting(r)}
                      title="Mở studio kiểm thử chức năng này"
                    >
                      Kiểm Thử
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredReqs.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-tertiary)" }}>
                  Không tìm thấy nhiệm vụ nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Phân Công Nhiệm Vụ (Assignment Modal) */}
      {editingReq && (
        <div className="modal-backdrop" onClick={() => setEditingReq(null)}>
          <div className="modal-container" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <IconEdit width={18} height={18} style={{ color: "var(--color-accent)" }} />
                <h3 className="modal-header__title" style={{ fontSize: "var(--font-size-md)", margin: 0 }}>
                  Phân Công Nhiệm Vụ Kiểm Thử
                </h3>
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => setEditingReq(null)}
                style={{ padding: "4px 8px" }}
              >
                <IconX width={16} height={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div style={{
                  padding: "var(--space-3)",
                  background: "var(--color-bg-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)"
                }}>
                  <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>
                    Chức năng cần kiểm thử
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "2px", color: "var(--color-text-primary)" }}>
                    {editingReq.title || "Chức năng #" + editingReq.id}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                    Người Phụ Trách Kiểm Thử:
                  </label>
                  <select
                    className="form-input"
                    value={editAssignee}
                    onChange={(e) => setEditAssignee(e.target.value)}
                  >
                    <option value="">-- Chưa giao việc --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.full_name}>
                        {u.full_name} ({u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, marginBottom: "var(--space-1)" }}>
                    Hạn Chót Hoàn Thành (Due Date):
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "var(--space-2)",
                padding: "var(--space-3) var(--space-4)",
                borderTop: "1px solid var(--color-border)"
              }}>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setEditingReq(null)}
                >
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn--primary">
                  Lưu Phân Công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
