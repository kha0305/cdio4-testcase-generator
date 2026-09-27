import { useState } from "react";
import {
  IconX,
  IconBookOpen,
  IconSparkles,
  IconCheck,
  IconCopy,
  IconServer,
  IconTerminal,
  IconCloud,
  IconGitBranch,
  IconInfo,
} from "../icons";
import { SAMPLE_REQUIREMENTS } from "../data/examples";

export default function VisualGuideModal({ isOpen, onClose, onSelectExample }) {
  const [activeTab, setActiveTab] = useState("presets");
  const [devopsTab, setDevopsTab] = useState("sftp");
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  async function handleCopy(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn("Copy failed", err);
    }
  }

  function handleSelectAndClose(text, projName) {
    onSelectExample(text, projName);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-header__title">
            <IconBookOpen width={20} height={20} />
            Hướng dẫn & Ví dụ Trực Quan / Visual Guide
          </h3>
          <button
            type="button"
            className="btn btn--secondary btn--icon"
            onClick={onClose}
            title="Đóng (Close)"
          >
            <IconX width={16} height={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Navigation Tabs */}
          <div className="guide-tabs">
            <button
              type="button"
              className={`guide-tab ${activeTab === "presets" ? "guide-tab--active" : ""}`}
              onClick={() => setActiveTab("presets")}
            >
              Ví dụ mẫu thử nghiệm ({SAMPLE_REQUIREMENTS.length})
            </button>
            <button
              type="button"
              className={`guide-tab ${activeTab === "syntax" ? "guide-tab--active" : ""}`}
              onClick={() => setActiveTab("syntax")}
            >
              Cú pháp văn bản hỗ trợ
            </button>
            <button
              type="button"
              className={`guide-tab ${activeTab === "techniques" ? "guide-tab--active" : ""}`}
              onClick={() => setActiveTab("techniques")}
            >
              Nguyên lý 3 Kỹ thuật kiểm thử
            </button>
            <button
              type="button"
              className={`guide-tab ${activeTab === "devops" ? "guide-tab--active" : ""}`}
              onClick={() => setActiveTab("devops")}
            >
              Tài liệu Git & Triển khai Hosting (DevOps)
            </button>
          </div>

          {/* TAB 1: PRESET EXAMPLES */}
          {activeTab === "presets" && (
            <div>
              <p className="text-sm text-muted mb-4">
                Chọn một trong các bộ đặc tả yêu cầu thực tế dưới đây để nạp vào hệ thống và sinh test case tự động:
              </p>

              {SAMPLE_REQUIREMENTS.map((ex) => (
                <div key={ex.id} className="guide-example-card">
                  <div className="guide-example-card__header">
                    <div>
                      <span className="guide-example-card__title">{ex.title}</span>
                      <span
                        className="section__badge"
                        style={{ marginLeft: "var(--space-2)", fontSize: "11px" }}
                      >
                        {ex.tag}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => handleCopy(ex.text, ex.id)}
                        title="Sao chép nội dung"
                      >
                        {copiedId === ex.id ? (
                          <>
                            <IconCheck width={13} height={13} /> Đã chép
                          </>
                        ) : (
                          <>
                            <IconCopy width={13} height={13} /> Sao chép
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        onClick={() => handleSelectAndClose(ex.text, ex.projectName)}
                      >
                        <IconSparkles width={13} height={13} />
                        Nạp vào ô nhập
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted mb-4">{ex.summary}</p>

                  <div className="guide-example-card__code">{ex.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SYNTAX REFERENCE */}
          {activeTab === "syntax" && (
            <div>
              <p className="text-sm text-muted mb-4">
                Hệ thống hỗ trợ ngôn ngữ tự nhiên (Tiếng Việt và Tiếng Anh). Dưới đây là các cấu trúc câu chuẩn:
              </p>

              <div className="table-container mb-4">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "130px" }}>Kiểu dữ liệu</th>
                      <th>Cú pháp mẫu (Tiếng Việt / Anh)</th>
                      <th>Ví dụ văn bản</th>
                      <th>Tham số bóc tách</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="badge badge--integer">integer</span>
                      </td>
                      <td>
                        <code>... từ [min] đến [max] ...</code>
                        <br />
                        <code>... between [min] and [max] ...</code>
                      </td>
                      <td>Tuổi phải từ 18 đến 60</td>
                      <td>
                        <code>field: "tuoi", min: 18, max: 60</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="badge badge--string">string</span>
                      </td>
                      <td>
                        <code>... từ [min] đến [max] ký tự</code>
                        <br />
                        <code>... đúng [N] ký tự</code>
                      </td>
                      <td>Mật khẩu từ 8 đến 20 ký tự</td>
                      <td>
                        <code>field: "mat khau", min: 8, max: 20</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="badge badge--float">float</span>
                      </td>
                      <td>
                        <code>... từ [X.X] đến [Y.Y] ...</code>
                      </td>
                      <td>Khối lượng từ 0.1 đến 30.0 kg</td>
                      <td>
                        <code>field: "khoi luong", min: 0.1, max: 30.0</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="badge badge--enum">enum</span>
                      </td>
                      <td>
                        <code>... là một trong: A, B, C</code>
                        <br />
                        <code>... is one of: A, B, C</code>
                        <br />
                        <code>... gồm các loại: X, Y, Z</code>
                      </td>
                      <td>Vai trò là một trong: Admin, User, Guest</td>
                      <td>
                        <code>values: ["Admin", "User", "Guest"]</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="badge badge--string">format</span>
                      </td>
                      <td>
                        <code>... email hợp lệ / phone valid</code>
                      </td>
                      <td>Email phải đúng định dạng email hợp lệ</td>
                      <td>
                        <code>format: "email"</code>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="alert alert--success">
                <span>
                  <strong>Lưu ý:</strong> Bạn có thể phân tách nhiều quy tắc trong cùng một đoạn văn bằng dấu chấm, dấu phẩy, xuống dòng hoặc liên từ <em>"và"</em> / <em>"and"</em>.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: TESTING TECHNIQUES */}
          {activeTab === "techniques" && (
            <div>
              <p className="text-sm text-muted mb-4">
                Hệ thống kết hợp 3 kỹ thuật Black-box Testing kinh điển theo chuẩn quốc tế ISTQB:
              </p>

              {/* Pipeline Flow */}
              <div className="guide-pipeline">
                <div className="pipeline-card">
                  <span className="pipeline-card__num">BƯỚC 1</span>
                  <div className="pipeline-card__title">Đặc tả tự nhiên</div>
                  <div className="pipeline-card__desc">
                    Văn bản mô tả quy tắc nghiệp vụ tiếng Việt hoặc tiếng Anh.
                  </div>
                </div>
                <div className="pipeline-card">
                  <span className="pipeline-card__num">BƯỚC 2</span>
                  <div className="pipeline-card__title">NLP Parser Engine</div>
                  <div className="pipeline-card__desc">
                    Bóc tách tự động các trường, kiểu dữ liệu, miền giá trị Min, Max, Enum.
                  </div>
                </div>
                <div className="pipeline-card">
                  <span className="pipeline-card__num">BƯỚC 3</span>
                  <div className="pipeline-card__title">Test Generator</div>
                  <div className="pipeline-card__desc">
                    Áp dụng BVA (3 điểm biên), Phân vùng tương đương và Pairwise Testing.
                  </div>
                </div>
                <div className="pipeline-card">
                  <span className="pipeline-card__num">BƯỚC 4</span>
                  <div className="pipeline-card__title">Xuất báo cáo</div>
                  <div className="pipeline-card__desc">
                    Bảng test case hoàn chỉnh có thể xuất file Excel (.xlsx) và CSV.
                  </div>
                </div>
              </div>

              {/* 3 Techniques Detail */}
              <div className="table-container mb-4">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "170px" }}>Kỹ thuật kiểm thử</th>
                      <th>Nguyên lý áp dụng</th>
                      <th style={{ width: "220px" }}>Giá trị sinh mẫu (VD: 18 - 60)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>BVA (Boundary Value)</strong>
                        <br />
                        <span className="text-xs text-muted">Phân tích giá trị biên</span>
                      </td>
                      <td>
                        Kiểm tra tại các điểm ranh giới nhạy cảm lỗi: Min - 1, Min, Min + 1, Max - 1, Max, Max + 1.
                      </td>
                      <td>
                        <code>17, 18, 19, 59, 60, 61</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Equivalence Partitioning</strong>
                        <br />
                        <span className="text-xs text-muted">Phân vùng tương đương</span>
                      </td>
                      <td>
                        Chia miền đầu vào thành:
                        <br />
                        - 1 Phân vùng Hợp lệ (Valid)
                        <br />
                        - 2 Phân vùng Không hợp lệ (Dưới Min & Trên Max)
                      </td>
                      <td>
                        <code>10 (Invalid), 39 (Valid), 75 (Invalid)</code>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Pairwise Testing</strong>
                        <br />
                        <span className="text-xs text-muted">Kiểm thử cặp (All-Pairs)</span>
                      </td>
                      <td>
                        Thay vì thử toàn bộ tích Descartes hàng trăm ca kiểm thử, thuật toán bảo đảm 100% mọi cặp tương tác 2 chiều (2-way) giữa các tham số đều được xuất hiện ít nhất một lần.
                      </td>
                      <td>
                        Giảm tải từ 500+ ca xuống còn 15 - 30 ca mà vẫn đạt độ phủ lỗi tương tác trên 85%.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DEVOPS, HOSTING & SFTP GUIDE */}
          {activeTab === "devops" && (
            <div>
              {/* Security Privacy Notice */}
              <div
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border-strong)",
                  borderLeft: "4px solid var(--color-accent)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "var(--space-4)",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-3)",
                }}
              >
                <IconInfo width={18} height={18} style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: "2px" }} />
                <div style={{ fontSize: "var(--font-size-xs)", lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
                  <strong style={{ color: "var(--color-text-primary)" }}>Nguyên tắc an toàn thông tin:</strong> Toàn bộ địa chỉ máy chủ, cổng mạng, tên người dùng và tên miền trong tài liệu này đều dùng <strong>giá trị mẫu ví dụ minh họa (placeholder: node01.pikamc.vn, user_demo.srv1234, app.your-domain.id.vn)</strong>. Vui lòng thay thế bằng thông tin thực tế từ tài khoản máy chủ của bạn khi cấu hình.
                </div>
              </div>

              {/* Sub-tab Pill Navigation */}
              <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`btn btn--sm ${devopsTab === "sftp" ? "btn--primary" : "btn--secondary"}`}
                  onClick={() => setDevopsTab("sftp")}
                >
                  <IconServer width={14} height={14} />
                  <span>1. Kết Nối SFTP (Đồng Bộ Code)</span>
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${devopsTab === "hosting" ? "btn--primary" : "btn--secondary"}`}
                  onClick={() => setDevopsTab("hosting")}
                >
                  <IconTerminal width={14} height={14} />
                  <span>2. Hosting Pterodactyl Panel</span>
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${devopsTab === "git" ? "btn--primary" : "btn--secondary"}`}
                  onClick={() => setDevopsTab("git")}
                >
                  <IconGitBranch width={14} height={14} />
                  <span>3. Quy Trình Chuẩn Git & GitHub</span>
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${devopsTab === "docker" ? "btn--primary" : "btn--secondary"}`}
                  onClick={() => setDevopsTab("docker")}
                >
                  <IconCloud width={14} height={14} />
                  <span>4. Docker & Cloudflare Tunnel</span>
                </button>
                <button
                  type="button"
                  className={`btn btn--sm ${devopsTab === "network" ? "btn--primary" : "btn--secondary"}`}
                  onClick={() => setDevopsTab("network")}
                >
                  <IconInfo width={14} height={14} />
                  <span>5. Mạng Căn Bản, IP, Port, DNS & Server/VPS</span>
                </button>
              </div>

              {/* SUB-SECTION 1: SFTP */}
              {devopsTab === "sftp" && (
                <div>
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--color-text-primary)" }}>
                    Hướng dẫn kết nối SFTP & Tự động đồng bộ code khi bấm Ctrl + S
                  </h4>
                  <p className="text-sm text-muted mb-3">
                    Giao thức SFTP giúp bạn viết code trực tiếp trên máy tính và tự động đẩy file lên thư mục <code>/home/container</code> của hosting Pterodactyl chỉ trong 1 giây.
                  </p>

                  <div className="table-container mb-4">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Thuộc tính</th>
                          <th>Giá trị mẫu minh họa</th>
                          <th>Cách lấy thông tin của bạn</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Máy chủ (Host)</strong></td>
                          <td><code>node01.pikamc.vn</code></td>
                          <td>Vào mục <strong>Tệp tin</strong> trên web panel $\rightarrow$ bấm nút <strong>Cơ sở SFTP</strong> góc trên bên phải.</td>
                        </tr>
                        <tr>
                          <td><strong>Cổng (Port)</strong></td>
                          <td><code>2023</code> (hoặc <code>2022</code>)</td>
                          <td>Cổng SFTP riêng của node máy chủ cấp phát.</td>
                        </tr>
                        <tr>
                          <td><strong>Tên người dùng</strong></td>
                          <td><code>user_demo.srv1234</code></td>
                          <td>Tên tài khoản kết hợp mã định danh container của bạn.</td>
                        </tr>
                        <tr>
                          <td><strong>Mật khẩu</strong></td>
                          <td>Mật khẩu bảng điều khiển</td>
                          <td>Mật khẩu bạn đăng nhập vào trang web quản lý hosting.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="guide-example-card">
                    <div className="guide-example-card__header">
                      <div>
                        <span className="guide-example-card__title">Cấu hình tệp .vscode/sftp.json (Dùng với Extension SFTP Neo)</span>
                        <span className="section__badge" style={{ marginLeft: "var(--space-2)", fontSize: "11px" }}>VS Code / Antigravity IDE</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => handleCopy(
                          JSON.stringify({
                            name: "Pikamc Pterodactyl Node (Vi Du Mau)",
                            host: "node01.pikamc.vn",
                            protocol: "sftp",
                            port: 2023,
                            username: "user_demo.srv1234",
                            remotePath: "/home/container",
                            uploadOnSave: true,
                            useTempFile: false,
                            openSsh: false,
                            ignore: [
                              "\\.vscode",
                              "\\.git",
                              "node_modules",
                              "backend/venv",
                              "venv",
                              ".venv",
                              "__pycache__",
                              "*.db",
                              "*.log",
                              "dist"
                            ]
                          }, null, 2),
                          "sftp_config"
                        )}
                      >
                        {copiedId === "sftp_config" ? (
                          <>
                            <IconCheck width={12} height={12} style={{ color: "var(--color-success)" }} />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <IconCopy width={12} height={12} />
                            <span>Sao chép cấu hình</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="guide-example-card__code">
{`{
  "name": "Pikamc Pterodactyl Node (Vi Du Mau)",
  "host": "node01.pikamc.vn",
  "protocol": "sftp",
  "port": 2023,
  "username": "user_demo.srv1234",
  "remotePath": "/home/container",
  "uploadOnSave": true,
  "useTempFile": false,
  "openSsh": false,
  "ignore": [
    "\\\\.vscode",
    "\\\\.git",
    "node_modules",
    "backend/venv",
    "venv",
    ".venv",
    "__pycache__",
    "*.db",
    "*.log",
    "dist"
  ]
}`}
                    </div>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>Lưu ý kỹ thuật:</strong> Cổng SFTP 2023 là dịch vụ truyền tệp của Pterodactyl Wings, <em>không cấp shell tương tác</em>. Tuyệt đối không dùng lệnh <code>ssh -t</code> trong PowerShell/CMD. Mọi câu lệnh Linux phải nhập trực tiếp tại mục <strong>Bảng Điều Khiển</strong> trên web.
                    </p>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 2: HOSTING PTERODACTYL */}
              {devopsTab === "hosting" && (
                <div>
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--color-text-primary)" }}>
                    Quản trị và vận hành trên nền tảng Pterodactyl Panel
                  </h4>
                  <p className="text-sm text-muted mb-3">
                    Mỗi máy chủ là 1 Docker Container riêng biệt. Thư mục làm việc mặc định là <code>/home/container/</code>.
                  </p>

                  <div className="guide-example-card">
                    <div className="guide-example-card__header">
                      <div>
                        <span className="guide-example-card__title">Kịch bản khởi động đa tiến trình: start.sh</span>
                        <span className="section__badge" style={{ marginLeft: "var(--space-2)", fontSize: "11px" }}>Linux Bash Script</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => handleCopy(
`#!/bin/bash
# 1. Kiem tra va cai dat thu vien backend Python
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# 2. Khoi chay FastAPI Backend tren cong do may chu cap
./backend/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port \${SERVER_PORT} &

# 3. Khoi chay Cloudflare Tunnel de anh xa ten mien cong khai
cloudflared tunnel run --token \${TUNNEL_TOKEN}`,
                          "start_sh"
                        )}
                      >
                        {copiedId === "start_sh" ? (
                          <>
                            <IconCheck width={12} height={12} style={{ color: "var(--color-success)" }} />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <IconCopy width={12} height={12} />
                            <span>Sao chép start.sh</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="guide-example-card__code">
{`#!/bin/bash
# 1. Kiem tra va cai dat thu vien backend Python
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# 2. Khoi chay FastAPI Backend tren cong do may chu cap
./backend/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port \${SERVER_PORT} &

# 3. Khoi chay Cloudflare Tunnel de anh xa ten mien cong khai
cloudflared tunnel run --token \${TUNNEL_TOKEN}`}
                    </div>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>Xử lý lỗi cổng bị chiếm (EADDRINUSE):</strong> Nhấn nút <strong>Dừng (Stop)</strong> trên bảng điều khiển $\rightarrow$ Chờ 10 giây để tiến trình cũ giải phóng cổng $\rightarrow$ Nhấn <strong>Khởi động lại (Restart)</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 3: GIT & GITHUB */}
              {devopsTab === "git" && (
                <div>
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--color-text-primary)" }}>
                    Quy chuẩn quản lý mã nguồn Git Flow & Conventional Commits
                  </h4>
                  <p className="text-sm text-muted mb-3">
                    Tuân thủ quy chuẩn quốc tế giúp lịch sử phát triển dự án rõ ràng, tránh xung đột mã nguồn khi làm việc nhóm.
                  </p>

                  <div className="guide-example-card">
                    <div className="guide-example-card__header">
                      <div>
                        <span className="guide-example-card__title">Cấu hình Git tiếng Việt UTF-8 & Quy trình phân nhánh</span>
                        <span className="section__badge" style={{ marginLeft: "var(--space-2)", fontSize: "11px" }}>Git CLI</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => handleCopy(
`# Cau hinh hien thi tieng Viet co dau khong bi ma hoa octal
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8

# Quy trinh lam viec theo nhanh chuc nang:
git checkout develop
git pull origin develop
git checkout -b feature/ten-chuc-nang-moi

# Commit theo chuan Conventional Commits:
git add .
git commit -m "feat(module): them chuc nang xuat bao cao"
git push origin feature/ten-chuc-nang-moi`,
                          "git_workflow"
                        )}
                      >
                        {copiedId === "git_workflow" ? (
                          <>
                            <IconCheck width={12} height={12} style={{ color: "var(--color-success)" }} />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <IconCopy width={12} height={12} />
                            <span>Sao chép lệnh Git</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="guide-example-card__code">
{`# 1. Cau hinh tieng Viet co dau UTF-8 tren Windows:
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8

# 2. Tao nhanh chuc nang moi tu develop:
git checkout develop
git pull origin develop
git checkout -b feature/ten-chuc-nang-moi

# 3. Commit theo chuan Conventional Commits:
# - feat: Tinh nang moi
# - fix: Sua loi
# - docs: Cap nhat tai lieu
# - test: Bo sung kiem thu
git add .
git commit -m "feat(auth): hoan tat phan quyen 3 cap"
git push origin feature/ten-chuc-nang-moi`}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 4: DOCKER & CLOUDFLARE TUNNEL */}
              {devopsTab === "docker" && (
                <div>
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--color-text-primary)" }}>
                    Đóng gói Docker Container & Xuất bản qua Cloudflare Tunnel
                  </h4>
                  <p className="text-sm text-muted mb-3">
                    Cloudflare Tunnel giúp kết nối tên miền riêng vào máy chủ an toàn với chứng chỉ SSL/TLS tự động mà không cần mở cổng modem.
                  </p>

                  <div className="guide-example-card">
                    <div className="guide-example-card__header">
                      <div>
                        <span className="guide-example-card__title">Tệp điều phối docker-compose.yml mẫu</span>
                        <span className="section__badge" style={{ marginLeft: "var(--space-2)", fontSize: "11px" }}>Docker Compose</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn--secondary btn--sm"
                        onClick={() => handleCopy(
`version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: app_backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./backend/app.db:/app/app.db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: app_frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: app_tunnel
    restart: unless-stopped
    command: tunnel run --token \${TUNNEL_TOKEN}
    depends_on:
      - frontend
      - backend`,
                          "docker_compose"
                        )}
                      >
                        {copiedId === "docker_compose" ? (
                          <>
                            <IconCheck width={12} height={12} style={{ color: "var(--color-success)" }} />
                            <span>Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <IconCopy width={12} height={12} />
                            <span>Sao chép docker-compose.yml</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="guide-example-card__code">
{`version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: app_backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./backend/app.db:/app/app.db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: app_frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: app_tunnel
    restart: unless-stopped
    command: tunnel run --token \${TUNNEL_TOKEN}
    depends_on:
      - frontend
      - backend`}
                    </div>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
                      <strong>Định tuyến Cloudflare Public Hostname mẫu:</strong> Cấu hình Subdomain <code>app</code> $\rightarrow$ Domain <code>your-domain.id.vn</code> $\rightarrow$ Service Type: <code>HTTP</code> $\rightarrow$ URL: <code>localhost:8000</code>.
                    </p>
                  </div>
                </div>
              )}

              {/* SUB-SECTION 5: NETWORK, DNS & SERVER FUNDAMENTALS */}
              {devopsTab === "network" && (
                <div>
                  <h4 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, marginBottom: "var(--space-2)", color: "var(--color-text-primary)" }}>
                    Cẩm nang kiến thức mạng, địa chỉ IP, cổng mạng, hệ thống DNS và các loại máy chủ
                  </h4>
                  <p className="text-sm text-muted mb-4">
                    Nền tảng kỹ thuật bắt buộc để hiểu cách ứng dụng giao tiếp qua mạng và xuất bản an toàn từ máy cục bộ ra Internet.
                  </p>

                  {/* 1. Mạng & IP & Port */}
                  <div style={{ marginBottom: "var(--space-5)" }}>
                    <h5 style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "var(--space-2)" }}>
                      1. Địa chỉ IP & Cổng mạng (Port)
                    </h5>
                    <div className="table-container mb-3">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: "160px" }}>Khái niệm</th>
                            <th>Đặc điểm kỹ thuật</th>
                            <th style={{ width: "220px" }}>Ví dụ thực tế</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Public IP vs Private IP</strong></td>
                            <td>Public IP là địa chỉ định danh duy nhất trên toàn mạng Internet. Private IP chỉ có hiệu lực trong mạng nội bộ gia đình / LAN / Docker.</td>
                            <td>Public: <code>103.145.63.12</code><br />Private: <code>192.168.1.10</code>, <code>10.0.0.5</code></td>
                          </tr>
                          <tr>
                            <td><strong>Localhost (127.0.0.1)</strong></td>
                            <td>Địa chỉ loopback nội bộ trỏ vào chính máy tính đang chạy. Bên ngoài không thể truy cập.</td>
                            <td><code>http://127.0.0.1:8000</code><br /><code>http://localhost:5173</code></td>
                          </tr>
                          <tr>
                            <td><strong>Hiện tượng CGNAT</strong></td>
                            <td>Nhà mạng (Viettel, FPT, VNPT) gom hàng trăm gia đình vào 1 Public IP chung, khiến bạn không thể tự mở port modem.</td>
                            <td>Giải pháp: Dùng <strong>Cloudflare Tunnel</strong> để vượt CGNAT không cần IP tĩnh.</td>
                          </tr>
                          <tr>
                            <td><strong>127.0.0.1 vs 0.0.0.0</strong></td>
                            <td><code>127.0.0.1</code> chỉ cho phép máy nội bộ truy cập; <code>0.0.0.0</code> lắng nghe trên mọi card mạng (bắt buộc cho Docker / Server).</td>
                            <td><code>uvicorn --host 0.0.0.0 --port 8000</code></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="table-container mb-3">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: "90px" }}>Cổng (Port)</th>
                            <th style={{ width: "160px" }}>Dịch vụ tiêu chuẩn</th>
                            <th>Mục đích sử dụng trong thực tế</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><code>80 / 443</code></td>
                            <td>HTTP / HTTPS</td>
                            <td>Truy cập trang web tiêu chuẩn (443 có mã hóa bảo mật SSL/TLS).</td>
                          </tr>
                          <tr>
                            <td><code>22</code></td>
                            <td>SSH / SFTP chuẩn</td>
                            <td>Quản trị dòng lệnh máy chủ Linux từ xa qua giao thức mã hóa.</td>
                          </tr>
                          <tr>
                            <td><code>2022 / 2023</code></td>
                            <td>SFTP Pterodactyl Wings</td>
                            <td>Cổng truyền tệp riêng biệt của panel quản lý container hosting (như Pikamc).</td>
                          </tr>
                          <tr>
                            <td><code>8000</code></td>
                            <td>FastAPI / Django</td>
                            <td>Cổng máy chủ Backend Python API của hệ thống CDIO-4.</td>
                          </tr>
                          <tr>
                            <td><code>5173</code></td>
                            <td>Vite Dev Server</td>
                            <td>Cổng giao diện Frontend React của hệ thống CDIO-4 khi chạy phát triển.</td>
                          </tr>
                          <tr>
                            <td><code>3306 / 5432</code></td>
                            <td>MySQL / PostgreSQL</td>
                            <td>Cổng kết nối các hệ quản trị cơ sở dữ liệu quan hệ tiêu chuẩn.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2. DNS & Records */}
                  <div style={{ marginBottom: "var(--space-5)" }}>
                    <h5 style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "var(--space-2)" }}>
                      2. Hệ thống phân giải tên miền (DNS & Các Bản Ghi)
                    </h5>
                    <p className="text-sm text-muted mb-2">
                      DNS hoạt động như cuốn danh bạ điện thoại của Internet, chuyển đổi tên miền dễ nhớ thành địa chỉ IP máy tính hiểu được.
                    </p>
                    <div className="table-container mb-3">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: "110px" }}>Bản ghi DNS</th>
                            <th>Chức năng kỹ thuật</th>
                            <th style={{ width: "240px" }}>Cú pháp mẫu</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Record A</strong></td>
                            <td>Ánh xạ tên miền trực tiếp sang địa chỉ <strong>IPv4</strong> của máy chủ.</td>
                            <td><code>your-domain.id.vn</code> $\rightarrow$ <code>103.xxx.xxx.xxx</code></td>
                          </tr>
                          <tr>
                            <td><strong>Record AAAA</strong></td>
                            <td>Ánh xạ tên miền sang địa chỉ <strong>IPv6</strong> (128-bit).</td>
                            <td><code>your-domain.id.vn</code> $\rightarrow$ <code>2405:4803::1</code></td>
                          </tr>
                          <tr>
                            <td><strong>Record CNAME</strong></td>
                            <td>Tạo tên miền bí danh (Alias) trỏ về một tên miền khác thay vì trỏ IP số.</td>
                            <td><code>www</code> $\rightarrow$ <code>your-domain.id.vn</code></td>
                          </tr>
                          <tr>
                            <td><strong>Record TXT</strong></td>
                            <td>Lưu trữ chuỗi văn bản tự do: xác thực sở hữu tên miền, bảo mật email (SPF/DKIM).</td>
                            <td><code>v=spf1 include:_spf.google.com ~all</code></td>
                          </tr>
                          <tr>
                            <td><strong>Record MX</strong></td>
                            <td>Định tuyến hòm thư điện tử gửi tới đuôi tên miền về máy chủ mail tương ứng.</td>
                            <td><code>aspmx.l.google.com</code> (Độ ưu tiên: 10)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ padding: "var(--space-3)", background: "var(--color-bg-primary)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", fontSize: "var(--font-size-xs)", lineHeight: 1.5, color: "var(--color-text-secondary)" }}>
                      <strong>Chế độ Cloudflare Proxy:</strong>
                      <br />
                      - <em>Đám mây cam (Proxied):</em> Lưu lượng đi qua Cloudflare Edge $\rightarrow$ Che giấu IP máy chủ thật, chống tấn công DDoS, tự động cấp chứng chỉ HTTPS miễn phí.
                      <br />
                      - <em>Đám mây xám (DNS Only):</em> Trỏ IP trực tiếp, không qua tường lửa Cloudflare (bắt buộc dùng cho SSH cổng 22, SFTP cổng 2022/2023, mail).
                    </div>
                  </div>

                  {/* 3. So sánh các mô hình máy chủ */}
                  <div>
                    <h5 style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-accent)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "var(--space-2)" }}>
                      3. Phân biệt các mô hình Máy Chủ: Shared Hosting, Container Hosting, VPS & Dedicated Server
                    </h5>
                    <div className="table-container mb-3">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Tiêu chí</th>
                            <th>Shared Hosting</th>
                            <th>Container Hosting (Pterodactyl)</th>
                            <th>VPS (Virtual Private Server)</th>
                            <th>Dedicated Server</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Công nghệ</strong></td>
                            <td>Dùng chung 1 hệ điều hành (cPanel)</td>
                            <td>Cô lập trong 1 Docker Container riêng</td>
                            <td>Ảo hóa phần cứng (KVM / VMware) độc lập</td>
                            <td>1 máy chủ vật lý riêng 100% tại Data Center</td>
                          </tr>
                          <tr>
                            <td><strong>Quyền quản trị</strong></td>
                            <td>Không có SSH terminal</td>
                            <td>Quyền hạn chế thư mục <code>/home/container</code></td>
                            <td>Toàn quyền Root cao nhất (<code>sudo su</code>)</td>
                            <td>Toàn quyền từ BIOS, phần cứng đến OS</td>
                          </tr>
                          <tr>
                            <td><strong>Địa chỉ IP</strong></td>
                            <td>Chung IP với hàng trăm site</td>
                            <td>Dùng chung IP Node, cấp cổng riêng</td>
                            <td>Sở hữu 1 IPv4 tĩnh công cộng riêng 100%</td>
                            <td>Sở hữu dải IPv4 tĩnh riêng biệt</td>
                          </tr>
                          <tr>
                            <td><strong>Cơ chế cổng</strong></td>
                            <td>Chỉ mở 80, 443 tiêu chuẩn</td>
                            <td>Cấp cổng ngẫu nhiên (25146, 25147)</td>
                            <td>Tự do mở bất kỳ cổng nào (0 - 65535)</td>
                            <td>Toàn quyền cấu hình 65,536 cổng</td>
                          </tr>
                          <tr>
                            <td><strong>Mức giá tham khảo</strong></td>
                            <td>30k - 100k / tháng</td>
                            <td>50k - 200k / tháng</td>
                            <td>120k - 500k / tháng</td>
                            <td>2tr - 10tr+ / tháng</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
