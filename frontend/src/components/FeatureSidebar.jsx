import { useState } from "react";
import { IconLayers, IconPlus, IconCheck, IconX, IconUser, IconCalendar, IconLoader } from "../icons";

export default function FeatureSidebar({
  features,
  activeFeatureId,
  onSelectFeature,
  onCreateFeature,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [assignee, setAssignee] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim() || !rawText.trim()) return;
    setSubmitting(true);
    try {
      await onCreateFeature({
        title: title.trim(),
        raw_text: rawText.trim(),
        assignee_name: assignee,
        due_date: dueDate,
        priority,
      });
      setTitle("");
      setRawText("");
      setAssignee("");
      setDueDate("");
      setShowAddModal(false);
    } catch (err) {
      alert("Lỗi khi thêm chức năng: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      width: "260px",
      flexShrink: 0,
      background: "var(--color-bg-primary)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-3)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      height: "fit-content",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
          <IconLayers width={14} height={14} /> Chức Năng ({features.length})
        </span>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          style={{ fontSize: "11px", padding: "2px 6px" }}
          onClick={() => setShowAddModal(true)}
          title="Thêm chức năng con mới vào dự án"
        >
          <IconPlus width={12} height={12} /> Thêm
        </button>
      </div>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {features.map((f) => {
          const isActive = f.id === activeFeatureId;
          return (
            <div
              key={f.id}
              onClick={() => onSelectFeature(f)}
              style={{
                padding: "var(--space-2) var(--space-3)",
                borderRadius: "var(--radius-sm)",
                background: isActive ? "var(--color-accent-light)" : "var(--color-bg-secondary)",
                border: isActive ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                <span style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--color-accent)" : "var(--color-text-primary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "180px",
                }}>
                  {f.title}
                </span>
                <span className="badge badge--neutral" style={{ fontSize: "9px", padding: "1px 4px" }}>
                  {f.total_cases || 0}
                </span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--color-text-tertiary)", display: "flex", justifyContent: "space-between" }}>
                <span>{f.assignee_name ? f.assignee_name.split(" ")[0] : "Chưa giao"}</span>
                {f.due_date && <span>{f.due_date.slice(5)}</span>}
              </div>
            </div>
          );
        })}

        {features.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "var(--space-4) var(--space-2)",
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            background: "var(--color-bg-secondary)",
            borderRadius: "var(--radius-sm)",
            border: "1px dashed var(--color-border)",
          }}>
            Chưa có chức năng con nào.
          </div>
        )}
      </div>

      {/* Add Feature Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Thêm Chức Năng Con Mới</h4>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowAddModal(false)}>
                <IconX width={14} height={14} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Tên Chức Năng / Yêu Cầu *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ví dụ: Đổi mật khẩu & Xác thực OTP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="input-label" style={{ fontWeight: 600 }}>Văn Bản Đặc Tả Nghiệp Vụ *</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Nhập nội dung đặc tả yêu cầu..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Người Phụ Trách</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Tên thành viên"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontWeight: 600 }}>Hạn Chót</label>
                  <input
                    type="date"
                    className="input-field"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={submitting || !title.trim() || !rawText.trim()}>
                  {submitting ? <IconLoader width={14} height={14} /> : <IconCheck width={14} height={14} />} Thêm Chức Năng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
