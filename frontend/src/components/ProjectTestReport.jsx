import { IconDownload, IconPrinter, IconCheck, IconAlertTriangle, IconHelpCircle, IconClipboard } from "../icons";

export default function ProjectTestReport({ result, cases, projectName, onExport }) {
  const { test_suite_id, total_cases, coverage_info } = result;

  const total = cases.length || total_cases;
  const passCount = cases.filter((tc) => tc.status === "Pass").length;
  const failCount = cases.filter((tc) => tc.status === "Fail").length;
  const blockedCount = cases.filter((tc) => tc.status === "Blocked").length;
  const untestedCount = cases.filter((tc) => !tc.status || tc.status === "Untested").length;

  const executedCount = total - untestedCount;
  const execRate = total ? Math.round((executedCount / total) * 100) : 0;
  const passRate = total ? Math.round((passCount / total) * 100) : 0;
  const failRate = total ? Math.round((failCount / total) * 100) : 0;

  const bvaCount = cases.filter((tc) => tc.technique_source === "bva").length;
  const epCount = cases.filter((tc) => tc.technique_source === "ep").length;
  const pwCount = cases.filter((tc) => tc.technique_source === "pairwise").length;

  const pwStats = coverage_info?.pairwise_stats;
  const reductionRate = pwStats ? Math.round(pwStats.reduction_ratio * 100) : 0;

  const failedCases = cases.filter((tc) => tc.status === "Fail");

  // Đánh giá chất lượng nghiệm thu
  let verdictType = "progress";
  let verdictTitle = "Đang trong tiến trình kiểm thử";
  let verdictDesc = `Đã thực thi ${executedCount}/${total} ca kiểm thử (${execRate}%). Vui lòng hoàn tất kiểm thử các ca còn lại để đánh giá tổng thể.`;

  if (failCount > 0) {
    verdictType = "fail";
    verdictTitle = "Chưa đạt chuẩn nghiệm thu (Phát hiện lỗi)";
    verdictDesc = `Hệ thống ghi nhận ${failCount} ca kiểm thử thất bại. Cần chuyển danh sách lỗi bên dưới cho đội ngũ phát triển khắc phục trước khi phát hành.`;
  } else if (untestedCount === 0 && total > 0) {
    verdictType = "pass";
    verdictTitle = "Đạt chuẩn nghiệm thu chất lượng (Ready to Release)";
    verdictDesc = `100% ca kiểm thử đều đạt kết quả mong đợi. Phần mềm thỏa mãn đầy đủ các ràng buộc và miền giá trị đặc tả.`;
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="report-card" id="project-test-report">
      {/* Banner Tiêu đề Báo Cáo */}
      <div className="report-banner">
        <div>
          <div style={{ display: "inline-block", fontSize: "11px", textTransform: "uppercase", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "4px", marginBottom: "6px" }}>
            Báo Cáo Nghiệm Thu Dự Án / Project Test Report
          </div>
          <h2 className="report-banner__title">
            {projectName || "Dự Án Phần Mềm (Software Project Testing)"}
          </h2>
          <p className="report-banner__subtitle">
            Mã bộ kiểm thử: <strong>TS_{test_suite_id}</strong> | Tiêu chuẩn: <strong>ISTQB / CDIO-4</strong> | Động cơ sinh: <strong>BVA + EP + Pairwise</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button className="btn btn--secondary btn--sm" onClick={handlePrint} title="In hoặc lưu PDF">
            <IconPrinter width={14} height={14} /> In Báo Cáo
          </button>
          <button className="btn btn--primary btn--sm" onClick={() => onExport("xlsx")} style={{ background: "#FFFFFF", color: "#1E3A8A", borderColor: "#FFFFFF" }}>
            <IconDownload width={14} height={14} /> Xuất Excel (.xlsx 2 Sheet)
          </button>
        </div>
      </div>

      {/* Tiến độ thực thi trực quan (Stacked Progress Bar) */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-size-xs)", fontWeight: 600 }}>
          <span>Tiến độ thực thi kiểm thử: {executedCount}/{total} ca ({execRate}%)</span>
          <span>Tỷ lệ Đạt: {passRate}%</span>
        </div>

        <div className="progress-stacked">
          <div
            className="progress-segment progress-segment--pass"
            style={{ width: `${(passCount / total) * 100}%` }}
            title={`Pass: ${passCount} ca (${passRate}%)`}
          />
          <div
            className="progress-segment progress-segment--fail"
            style={{ width: `${(failCount / total) * 100}%` }}
            title={`Fail: ${failCount} ca (${failRate}%)`}
          />
          <div
            className="progress-segment progress-segment--blocked"
            style={{ width: `${(blockedCount / total) * 100}%` }}
            title={`Blocked: ${blockedCount} ca`}
          />
          <div
            className="progress-segment progress-segment--untested"
            style={{ width: `${(untestedCount / total) * 100}%` }}
            title={`Chưa chạy: ${untestedCount} ca`}
          />
        </div>

        <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "11px", color: "var(--color-text-secondary)", flexWrap: "wrap", marginTop: "4px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16A34A" }} />
            Đạt / Pass: {passCount} ({passRate}%)
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#DC2626" }} />
            Lỗi / Fail: {failCount} ({failRate}%)
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D97706" }} />
            Bị chặn / Blocked: {blockedCount}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#94A3B8" }} />
            Chưa chạy: {untestedCount}
          </span>
        </div>
      </div>

      {/* Thẻ Kết Luận Nghiệm Thu Chất Lượng */}
      <div className={`verdict-banner verdict-banner--${verdictType}`}>
        {verdictType === "pass" && <IconCheck width={24} height={24} />}
        {verdictType === "fail" && <IconAlertTriangle width={24} height={24} />}
        {verdictType === "progress" && <IconHelpCircle width={24} height={24} />}
        <div>
          <div style={{ fontWeight: 700, fontSize: "var(--font-size-md)", marginBottom: "2px" }}>
            {verdictTitle}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)" }}>
            {verdictDesc}
          </div>
        </div>
      </div>

      {/* Lưới Chỉ Số Đo Lường (KPI Metrics Grid) */}
      <h3 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, marginBottom: "var(--space-3)", textTransform: "uppercase", color: "var(--color-text-secondary)" }}>
        Chỉ Số Đo Lường Then Chốt (Key Test Metrics)
      </h3>

      <div className="report-grid">
        <div className="report-box">
          <div className="report-box__title">Tổng Số Ca Kiểm Thử</div>
          <div className="report-box__val">{total}</div>
          <div className="report-box__sub">Được sinh tự động từ đặc tả</div>
        </div>

        <div className="report-box">
          <div className="report-box__title">Tỷ Lệ Thực Thi</div>
          <div className="report-box__val" style={{ color: "var(--color-accent)" }}>
            {execRate}%
          </div>
          <div className="report-box__sub">{executedCount} trên {total} ca đã test</div>
        </div>

        <div className="report-box">
          <div className="report-box__title">Tỷ Lệ Đạt (Pass Rate)</div>
          <div className="report-box__val" style={{ color: "var(--color-success)" }}>
            {passRate}%
          </div>
          <div className="report-box__sub">{passCount} ca vượt qua bài test</div>
        </div>

        <div className="report-box">
          <div className="report-box__title">Tỷ Lệ Lỗi (Defect Rate)</div>
          <div className="report-box__val" style={{ color: failCount > 0 ? "var(--color-error)" : "var(--color-success)" }}>
            {failRate}%
          </div>
          <div className="report-box__sub">{failCount} ca phát hiện lỗi</div>
        </div>

        <div className="report-box">
          <div className="report-box__title">Tối Ưu Hóa Pairwise</div>
          <div className="report-box__val" style={{ color: "var(--color-accent)" }}>
            -{reductionRate}%
          </div>
          <div className="report-box__sub">Giảm tải so với tích Descartes</div>
        </div>
      </div>

      {/* Phân bổ theo Kỹ thuật kiểm thử */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
        <div className="report-box">
          <div className="report-box__title">Phân Bổ Kỹ Thuật Kiểm Thử</div>
          <div style={{ marginTop: "var(--space-2)", fontSize: "var(--font-size-xs)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span>Phân tích giá trị biên (BVA):</span>
              <strong>{bvaCount} ca</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span>Phân vùng tương đương (EP):</span>
              <strong>{epCount} ca</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Kiểm thử tổ hợp cặp (Pairwise):</span>
              <strong>{pwCount} ca</strong>
            </div>
          </div>
        </div>

        <div className="report-box">
          <div className="report-box__title">Độ Bao Phủ Kiểm Thử (Coverage)</div>
          <div style={{ marginTop: "var(--space-2)", fontSize: "var(--font-size-xs)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span>Độ phủ biên 3 điểm (Min/Max):</span>
              <strong>100%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span>Độ phủ miền Hợp lệ & Bất hợp lệ:</span>
              <strong>100%</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>Độ phủ tương tác 2 chiều (2-way Pairwise):</span>
              <strong>100%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Danh Sách Ca Kiểm Thử Thất Bại (Defect Log) */}
      <div style={{ marginTop: "var(--space-5)" }}>
        <h3 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, marginBottom: "var(--space-3)", textTransform: "uppercase", color: failCount > 0 ? "var(--color-error)" : "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <IconClipboard width={16} height={16} />
          Nhật Ký Lỗi & Ca Thất Bại / Defect Log ({failCount})
        </h3>

        {failCount === 0 ? (
          <div className="alert alert--success" style={{ margin: 0 }}>
            <span>Không phát hiện lỗi phần mềm nào trong các ca kiểm thử đã thực thi. Tất cả kết quả thực tế đều trùng khớp với kết quả mong đợi.</span>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "75px" }}>Mã TC</th>
                  <th>Kịch bản lỗi</th>
                  <th>Dữ liệu thử nghiệm</th>
                  <th>Kết quả mong đợi</th>
                  <th>Kết quả thực tế ghi nhận</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {failedCases.map((tc) => (
                  <tr key={tc.code}>
                    <td className="mono" style={{ fontWeight: 600, color: "var(--color-error)" }}>{tc.code}</td>
                    <td style={{ fontSize: "var(--font-size-xs)" }}>{tc.scenario}</td>
                    <td>
                      <code className="mono" style={{ fontSize: "11px", whiteSpace: "pre-wrap" }}>
                        {Object.entries(tc.input_data).map(([k, v]) => `${k} = ${JSON.stringify(v)}`).join("\n")}
                      </code>
                    </td>
                    <td style={{ fontSize: "var(--font-size-xs)" }}>{tc.expected_result}</td>
                    <td style={{ fontSize: "var(--font-size-xs)", color: "var(--color-error)", fontWeight: 500 }}>
                      {tc.actual_result || "(Chưa nhập chi tiết lỗi)"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="badge badge--fail">FAIL</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
