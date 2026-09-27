import { useState, useEffect } from "react";
import { IconClipboard, IconDownload, IconCheck, IconX, IconPieChart } from "../icons";
import { exportTestSuite, updateTestCase } from "../api";
import ProjectTestReport from "./ProjectTestReport";

function TypeBadge({ type }) {
  const cls = `badge badge--${type}`;
  const labels = {
    positive: "POSITIVE",
    negative: "NEGATIVE",
    boundary: "BOUNDARY",
  };
  return <span className={cls}>{labels[type] || type.toUpperCase()}</span>;
}

function TechniqueBadge({ source }) {
  return <span className={`badge badge--${source}`}>{source.toUpperCase()}</span>;
}

export default function TestCaseTable({ result, projectName }) {
  if (!result) return null;

  const { test_suite_id, test_cases, total_cases, coverage_info } = result;

  const [cases, setCases] = useState(test_cases || []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeView, setActiveView] = useState("cases"); // "cases" | "report"

  useEffect(() => {
    setCases(result.test_cases || []);
  }, [result]);

  async function handleExport(format) {
    try {
      await exportTestSuite(test_suite_id, format);
    } catch (err) {
      alert("Xuất file thất bại / Export failed: " + err.message);
    }
  }

  async function handleStatusChange(tcId, newStatus) {
    setCases((prev) =>
      prev.map((c) => (c.id === tcId ? { ...c, status: newStatus } : c))
    );
    try {
      await updateTestCase(tcId, { status: newStatus });
    } catch (err) {
      console.warn("Failed to persist status to backend", err);
    }
  }

  async function handleActualResultChange(tcId, newText) {
    setCases((prev) =>
      prev.map((c) => (c.id === tcId ? { ...c, actual_result: newText } : c))
    );
  }

  async function handleActualResultBlur(tcId, newText) {
    try {
      await updateTestCase(tcId, { actual_result: newText });
    } catch (err) {
      console.warn("Failed to persist actual_result to backend", err);
    }
  }

  const passCount = cases.filter((tc) => tc.status === "Pass").length;
  const failCount = cases.filter((tc) => tc.status === "Fail").length;
  const untestedCount = cases.filter((tc) => !tc.status || tc.status === "Untested").length;

  const positiveCount = cases.filter((tc) => tc.test_type === "positive").length;
  const negativeCount = cases.filter((tc) => tc.test_type === "negative").length;
  const boundaryCount = cases.filter((tc) => tc.test_type === "boundary").length;

  const filteredCases = cases.filter((tc) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "Untested") return !tc.status || tc.status === "Untested";
    return tc.status === statusFilter;
  });

  return (
    <section className="section" id="test-case-results">
      {/* Thanh chuyển đổi giữa Bảng Ca Kiểm Thử và Báo Cáo Dự Án */}
      <div className="view-tabs">
        <button
          type="button"
          className={`view-tab ${activeView === "cases" ? "view-tab--active" : ""}`}
          onClick={() => setActiveView("cases")}
        >
          <IconClipboard width={16} height={16} />
          Bảng Ca Kiểm Thử ({total_cases} TCs)
        </button>
        <button
          type="button"
          className={`view-tab ${activeView === "report" ? "view-tab--active" : ""}`}
          onClick={() => setActiveView("report")}
        >
          <IconPieChart width={16} height={16} />
          Báo Cáo Tổng Kết Dự Án (Test Report)
        </button>
      </div>

      {/* VIEW 1: BÁO CÁO TỔNG KẾT DỰ ÁN */}
      {activeView === "report" && (
        <ProjectTestReport
          result={result}
          cases={cases}
          projectName={projectName}
          onExport={handleExport}
        />
      )}

      {/* VIEW 2: BẢNG CHI TIẾT TEST CASES */}
      {activeView === "cases" && (
        <>
          <div className="section__header">
            <h2 className="section__title">
              <IconClipboard />
              Kết quả Test Cases / Results ({filteredCases.length}/{total_cases})
            </h2>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => setActiveView("report")}
              >
                <IconPieChart width={14} height={14} /> Xem Báo Cáo Dự Án
              </button>
              <button className="btn btn--primary btn--sm" onClick={() => handleExport("xlsx")}>
                <IconDownload width={14} height={14} /> Xuất Excel (.xlsx)
              </button>
              <button className="btn btn--secondary btn--sm" onClick={() => handleExport("csv")}>
                <IconDownload width={14} height={14} /> Xuất CSV
              </button>
            </div>
          </div>

          {/* Thống kê tiến độ thực thi & kiểm thử / Execution & Coverage Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-card__value">{total_cases}</span>
              <span className="stat-card__label">Tổng số ca test</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value" style={{ color: "var(--color-success)" }}>
                {passCount}
              </span>
              <span className="stat-card__label">Đạt / Pass</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value" style={{ color: "var(--color-error)" }}>
                {failCount}
              </span>
              <span className="stat-card__label">Lỗi / Fail</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value" style={{ color: "var(--color-text-secondary)" }}>
                {untestedCount}
              </span>
              <span className="stat-card__label">Chưa chạy / Untested</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value" style={{ color: "var(--color-warning)" }}>
                {boundaryCount}
              </span>
              <span className="stat-card__label">Giá trị biên / Boundary</span>
            </div>
            {coverage_info?.pairwise_stats && (
              <div className="stat-card">
                <span className="stat-card__value">
                  {coverage_info.pairwise_stats.pairwise_coverage}%
                </span>
                <span className="stat-card__label">Độ phủ Pairwise</span>
              </div>
            )}
            {coverage_info?.pairwise_stats && (
              <div className="stat-card">
                <span className="stat-card__value">
                  {Math.round(coverage_info.pairwise_stats.reduction_ratio * 100)}%
                </span>
                <span className="stat-card__label">Tỷ lệ giảm tổ hợp</span>
              </div>
            )}
          </div>

          {/* Bộ lọc trạng thái Pass / Fail / Untested */}
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
            <span className="text-xs text-muted" style={{ fontWeight: 600 }}>
              Lọc theo kết quả:
            </span>
            <button
              type="button"
              className={`example-pill ${statusFilter === "ALL" ? "example-pill--active" : ""}`}
              onClick={() => setStatusFilter("ALL")}
            >
              Tất cả ({total_cases})
            </button>
            <button
              type="button"
              className={`example-pill ${statusFilter === "Untested" ? "example-pill--active" : ""}`}
              onClick={() => setStatusFilter("Untested")}
            >
              Chưa chạy ({untestedCount})
            </button>
            <button
              type="button"
              className={`example-pill ${statusFilter === "Pass" ? "example-pill--active" : ""}`}
              onClick={() => setStatusFilter("Pass")}
            >
              <span style={{ color: statusFilter === "Pass" ? "#FFFFFF" : "#16A34A", display: "inline-flex" }}>
                <IconCheck width={12} height={12} />
              </span>
              Đạt / Pass ({passCount})
            </button>
            <button
              type="button"
              className={`example-pill ${statusFilter === "Fail" ? "example-pill--active" : ""}`}
              onClick={() => setStatusFilter("Fail")}
            >
              <span style={{ color: statusFilter === "Fail" ? "#FFFFFF" : "#DC2626", display: "inline-flex" }}>
                <IconX width={12} height={12} />
              </span>
              Lỗi / Fail ({failCount})
            </button>
          </div>

          {/* Bảng Test Cases chuẩn QA/QC với cột Actual Result và Pass/Fail */}
          <div className="table-container" style={{ maxHeight: "550px", overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "70px" }}>Mã / ID</th>
                  <th style={{ minWidth: "220px" }}>Kịch bản / Scenario</th>
                  <th style={{ width: "90px" }}>Loại / Type</th>
                  <th style={{ minWidth: "180px" }}>Dữ liệu đầu vào / Input Data</th>
                  <th style={{ minWidth: "220px" }}>Kết quả mong đợi / Expected Result</th>
                  <th style={{ minWidth: "180px" }}>Kết quả thực tế / Actual Result</th>
                  <th style={{ width: "110px", textAlign: "center" }}>Kết quả / Status</th>
                  <th style={{ width: "75px" }}>Độ ưu tiên</th>
                  <th style={{ width: "85px" }}>Kỹ thuật</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((tc) => {
                  const currentStatus = tc.status || "Untested";
                  const statusClass = `status-select status-select--${currentStatus.toLowerCase()}`;

                  return (
                    <tr key={tc.code}>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {tc.code}
                      </td>
                      <td>
                        <div style={{ fontSize: "var(--font-size-xs)", fontWeight: 500 }}>
                          {tc.scenario}
                        </div>
                        {tc.preconditions && (
                          <div className="text-muted" style={{ fontSize: "11px", marginTop: "3px" }}>
                            <strong>Tiền điều kiện:</strong> {tc.preconditions}
                          </div>
                        )}
                        {tc.test_steps && (
                          <details style={{ marginTop: "4px", fontSize: "11px" }}>
                            <summary style={{ cursor: "pointer", color: "var(--color-accent, #2563EB)", fontWeight: 500 }}>
                              Xem các bước thực hiện
                            </summary>
                            <pre
                              style={{
                                whiteSpace: "pre-wrap",
                                fontFamily: "inherit",
                                fontSize: "11px",
                                backgroundColor: "var(--color-bg-secondary, #F1F5F9)",
                                border: "1px solid var(--color-border, #E2E8F0)",
                                padding: "6px 8px",
                                borderRadius: "4px",
                                marginTop: "4px",
                                color: "var(--color-text-primary, inherit)",
                                lineHeight: "1.4"
                              }}
                            >
                              {tc.test_steps}
                            </pre>
                          </details>
                        )}
                      </td>
                      <td>
                        <TypeBadge type={tc.test_type} />
                      </td>
                      <td>
                        <code
                          className="mono"
                          style={{ whiteSpace: "pre-wrap", fontSize: "11px", display: "block" }}
                        >
                          {Object.entries(tc.input_data)
                            .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
                            .join("\n")}
                        </code>
                      </td>
                      <td style={{ fontSize: "var(--font-size-xs)" }}>
                        <div>{tc.expected_result}</div>
                        {tc.postconditions && (
                          <div className="text-muted" style={{ fontSize: "11px", marginTop: "4px", borderTop: "1px dashed var(--color-border)", paddingTop: "3px" }}>
                            <strong>Hậu điều kiện:</strong> {tc.postconditions}
                          </div>
                        )}
                      </td>
                      {/* Cột Kết quả thực tế (Actual Result) có thể nhập trực tiếp */}
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Ghi nhận khi chạy..."
                          value={tc.actual_result || ""}
                          onChange={(e) => handleActualResultChange(tc.id, e.target.value)}
                          onBlur={(e) => handleActualResultBlur(tc.id, e.target.value)}
                          style={{ fontSize: "11px" }}
                        />
                      </td>
                      {/* Cột Kết quả kiểm thử Pass / Fail / Blocked / Untested */}
                      <td style={{ textAlign: "center" }}>
                        <select
                          className={statusClass}
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(tc.id, e.target.value)}
                        >
                          <option value="Untested">Untested</option>
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${tc.priority === "High" ? "badge--negative" : ""}`}>
                          {tc.priority}
                        </span>
                      </td>
                      <td>
                        <TechniqueBadge source={tc.technique_source} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
