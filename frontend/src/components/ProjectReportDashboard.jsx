import { useState, useEffect } from "react";
import { getProjectDetails, exportProjectReport } from "../api";
import { IconPieChart, IconDownload, IconCheckCircle, IconAlertTriangle, IconLoader, IconRefresh, IconUser, IconCalendar, IconLayers } from "../icons";

export default function ProjectReportDashboard({ activeProject, onSelectFeatureForTesting }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeProject?.id) {
      loadReport(activeProject.id);
    }
  }, [activeProject]);

  async function loadReport(projectId) {
    setLoading(true);
    try {
      const res = await getProjectDetails(projectId);
      setData(res);
    } catch (err) {
      console.error("Lỗi tải báo cáo dự án:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-12)", color: "var(--color-text-tertiary)" }}>
        <IconLoader width={28} height={28} />
        <div style={{ marginTop: "var(--space-2)", fontSize: "var(--font-size-sm)" }}>Đang tổng hợp báo cáo kiểm thử dự án...</div>
      </div>
    );
  }

  const proj = data.project || data;
  const reqs = data.requirements || [];

  // Extract all failed test cases for Defect Log
  const failedCases = [];
  reqs.forEach((r) => {
    (r.test_suites || []).forEach((s) => {
      // In detailed view, if suites have cases or info
    });
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {/* Top Banner: Project Title + Export Buttons */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "var(--space-3)",
        borderBottom: "1px solid var(--color-border)",
        paddingBottom: "var(--space-4)",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <span className="badge badge--primary" style={{ fontFamily: "var(--font-mono)" }}>{proj.code}</span>
            <span className="badge badge--neutral">v{proj.version}</span>
            <h2 style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: 700 }}>
              {proj.name}
            </h2>
          </div>
          <p style={{ margin: "var(--space-1) 0 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>
            QA Lead: <strong>{proj.lead}</strong> | Ngày báo cáo: {proj.created_at || "Hôm nay"} | Loại: {proj.project_type === "team" ? "Dự Án Nhóm" : "Dự Án Cá Nhân"}
          </p>
        </div>

        {/* Export buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => loadReport(activeProject.id)}
            title="Làm mới số liệu"
          >
            <IconRefresh width={14} height={14} /> Làm Mới
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => exportProjectReport(proj.id, "xlsx")}
            title="Xuất file Excel chuyên nghiệp gồm 4 Sheets"
          >
            <IconDownload width={14} height={14} /> Xuất Báo Cáo Excel (4 Sheet)
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => exportProjectReport(proj.id, "csv")}
          >
            CSV
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => exportProjectReport(proj.id, "json")}
          >
            JSON
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => exportProjectReport(proj.id, "markdown")}
          >
            Markdown
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "var(--space-3)" }}>
        <div style={{ background: "var(--color-bg-primary)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", fontWeight: 600 }}>TỔNG CHỨC NĂNG</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-text-primary)", marginTop: "4px" }}>{proj.requirements_count}</div>
          <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>Phân hệ trong dự án</div>
        </div>

        <div style={{ background: "var(--color-bg-primary)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-tertiary)", fontWeight: 600 }}>TỔNG TEST CASES</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-text-primary)", marginTop: "4px" }}>{proj.total_cases}</div>
          <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>Được sinh tự động</div>
        </div>

        <div style={{ background: "var(--color-bg-primary)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-success)", fontWeight: 600 }}>SỐ CA ĐẠT (PASS)</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-success)", marginTop: "4px" }}>{proj.pass_count}</div>
          <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>Kiểm thử thành công</div>
        </div>

        <div style={{ background: "var(--color-bg-primary)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-error)", fontWeight: 600 }}>SỐ CA LỖI (FAIL)</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-error)", marginTop: "4px" }}>{proj.fail_count}</div>
          <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>Phát hiện sai lệch</div>
        </div>

        <div style={{ background: "var(--color-accent-light)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "var(--radius-md)", padding: "var(--space-4)" }}>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-accent)", fontWeight: 600 }}>TỶ LỆ ĐẠT (PASS RATE)</div>
          <div style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-accent)", marginTop: "4px" }}>{proj.pass_rate}%</div>
          <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginTop: "2px" }}>
            {proj.pass_rate >= 90 ? "ĐẠT CHUẨN NGHIỆM THU" : "CẦN KHẮC PHỤC LỖI"}
          </div>
        </div>
      </div>

      {/* Feature Breakdown Table */}
      <div style={{
        background: "var(--color-bg-primary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4)",
      }}>
        <h3 style={{ margin: "0 0 var(--space-3) 0", fontSize: "var(--font-size-md)", fontWeight: 700 }}>
          Ma Trận Tiến Độ Chi Tiết Theo Chức Năng
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-xs)" }}>
            <thead>
              <tr style={{ background: "var(--color-bg-tertiary)", textAlign: "left" }}>
                <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>STT</th>
                <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Chức Năng / Yêu Cầu</th>
                <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Số Tham Số</th>
                <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Tổng Ca Test</th>
                <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Đạt (Pass)</th>
                <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Lỗi (Fail)</th>
                <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)" }}>Tỷ Lệ Đạt</th>
                <th style={{ padding: "var(--space-3)", borderBottom: "1px solid var(--color-border)", textAlign: "right" }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {reqs.map((r, idx) => {
                const totalC = (r.test_suites || []).reduce((acc, s) => acc + (s.total_cases || 0), 0);
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <td style={{ padding: "var(--space-3)", fontFamily: "var(--font-mono)" }}>{idx + 1}</td>
                    <td style={{ padding: "var(--space-3)", fontWeight: 600 }}>{r.title || `REQ-${r.id}`}</td>
                    <td style={{ padding: "var(--space-3)" }}>{r.parameters?.length || 0} trường</td>
                    <td style={{ padding: "var(--space-3)" }}><strong>{totalC}</strong> ca</td>
                    <td style={{ padding: "var(--space-3)", color: "var(--color-success)", fontWeight: 600 }}>{r.pass_count || 0}</td>
                    <td style={{ padding: "var(--space-3)", color: "var(--color-error)", fontWeight: 600 }}>{r.fail_count || 0}</td>
                    <td style={{ padding: "var(--space-3)" }}>
                      <span className="badge badge--primary" style={{ fontSize: "10px" }}>
                        {totalC > 0 ? ((r.pass_count || 0) / totalC * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                    <td style={{ padding: "var(--space-3)", textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        style={{ fontSize: "11px", padding: "2px 8px" }}
                        onClick={() => onSelectFeatureForTesting(r)}
                      >
                        Kiểm Thử
                      </button>
                    </td>
                  </tr>
                );
              })}
              {reqs.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-text-tertiary)" }}>
                    Chưa có chức năng kiểm thử nào trong dự án.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
