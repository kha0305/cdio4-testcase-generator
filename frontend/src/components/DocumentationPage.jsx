import { useState } from "react";
import {
  IconBookOpen,
  IconCheck,
  IconCopy,
  IconServer,
  IconTerminal,
  IconCloud,
  IconGitBranch,
  IconInfo,
  IconSearch,
  IconTable,
  IconSparkles,
  IconShield,
  IconUsers,
  IconChevronDown,
  IconChevronRight,
  IconChevronLeft,
} from "../icons";

function CodeSnippet({ code, lang = "Terminal / Bash", copyId, copiedId, onCopy }) {
  return (
    <div className="docs-code-card">
      <div className="docs-code-header">
        <span className="docs-code-badge">{lang}</span>
        <button
          type="button"
          className="docs-copy-btn"
          onClick={() => onCopy(code, copyId)}
          title="Sao chép câu lệnh"
        >
          {copiedId === copyId ? (
            <>
              <IconCheck width={12} height={12} style={{ color: "#34D399" }} />
              <span style={{ color: "#34D399" }}>Đã sao chép</span>
            </>
          ) : (
            <>
              <IconCopy width={12} height={12} />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>
      <div className="docs-code-body">
        <pre className="docs-code-pre">
          <code className="docs-code-text">{code}</code>
        </pre>
      </div>
    </div>
  );
}

const MENU_GROUPS = [
  {
    id: "grp_setup",
    title: "1. Cài Đặt & Khởi Chạy",
    icon: IconTerminal,
    items: [
      { id: "setup_prereq", label: "1.1. Yêu Cầu Tiên Quyết (Node & Python)" },
      { id: "setup_install", label: "1.2. Cài Đặt Thư Viện Phụ Thuộc" },
      { id: "setup_db", label: "1.3. Khởi Tạo Cơ Sở Dữ Liệu SQLite" },
      { id: "setup_run", label: "1.4. Khởi Chạy 1 Lệnh (npm run dev)" },
      { id: "setup_rbac", label: "1.5. Tài Khoản & Phân Quyền 3 Cấp" },
    ],
  },
  {
    id: "grp_network",
    title: "2. Mạng Căn Bản & Địa Chỉ IP",
    icon: IconInfo,
    items: [
      { id: "net_ipv4_ipv6", label: "2.1. Phân Biệt IPv4 vs IPv6 & Public/Private" },
      { id: "net_localhost_binding", label: "2.2. Cơ Chế 127.0.0.1 vs 0.0.0.0" },
      { id: "net_cgnat_explained", label: "2.3. Rào Cản CGNAT Nhà Mạng Việt Nam" },
      { id: "net_ports_lookup", label: "2.4. Bảng Tra Cứu Cổng Mạng (0 - 65535)" },
    ],
  },
  {
    id: "grp_dns",
    title: "3. Hệ Thống Tên Miền (DNS)",
    icon: IconCloud,
    items: [
      { id: "dns_concepts_tld", label: "3.1. Cấu Trúc Tên Miền & Cơ Chế DNS" },
      { id: "dns_5_records", label: "3.2. Chi Tiết 5 Bản Ghi (A, CNAME, TXT, MX)" },
      { id: "dns_cloudflare_setup", label: "3.3. Hướng Dẫn Trỏ Tên Miền Thực Tế" },
      { id: "dns_proxy_rules", label: "3.4. Đám Mây Cam (Proxy) vs Đám Mây Xám" },
      { id: "dns_flush_lookup", label: "3.5. Lệnh Tra Cứu & Xóa Cache DNS" },
    ],
  },
  {
    id: "grp_cmd",
    title: "4. Lệnh Chẩn Đoán Mạng Thực Hành",
    icon: IconTerminal,
    items: [
      { id: "cmd_my_ip", label: "4.1. Lệnh Xem IP Cá Nhân (ipconfig / cURL)" },
      { id: "cmd_port_check", label: "4.2. Kiểm Tra Cổng Kết Nối Máy Chủ (TNC)" },
      { id: "cmd_find_pid", label: "4.3. Truy Tìm Tiến Trình Chiếm Cổng (Netstat)" },
      { id: "cmd_kill_process", label: "4.4. Cưỡng Chế Tắt Tiến Trình (Taskkill)" },
      { id: "cmd_curl_check", label: "4.5. Kiểm Tra Phản Hồi HTTP (cURL -I)" },
    ],
  },
  {
    id: "grp_troubleshoot",
    title: "5. Khắc Phục 6 Lỗi Mạng Kinh Điển",
    icon: IconShield,
    items: [
      { id: "err_conn_reset_ssh", label: "5.1. Lỗi Connection Reset (SSH vs SFTP)" },
      { id: "err_econnrefused_fix", label: "5.2. Lỗi ECONNREFUSED (Mất Kết Nối)" },
      { id: "err_eaddrinuse_fix", label: "5.3. Lỗi EADDRINUSE (Cổng Bị Chiếm)" },
      { id: "err_502_gateway", label: "5.4. Lỗi 502 Bad Gateway / 504 Timeout" },
      { id: "err_cors_fix", label: "5.5. Lỗi CORS Policy (Khác Nguồn Gốc)" },
      { id: "err_etimedout_fix", label: "5.6. Lỗi ETIMEDOUT (Tường Lửa Chặn)" },
    ],
  },
  {
    id: "grp_hosting",
    title: "6. Hosting Pterodactyl & SFTP",
    icon: IconServer,
    items: [
      { id: "ptero_architecture", label: "6.1. Kiến Trúc Container Pterodactyl Panel" },
      { id: "ptero_start_sh", label: "6.2. Kịch Bản Khởi Động start.sh" },
      { id: "sftp_config_json", label: "6.3. Cấu Hình Chuẩn .vscode/sftp.json" },
      { id: "sftp_workflow_tips", label: "6.4. Đồng Bộ Mã Nguồn Tự Động (Ctrl + S)" },
    ],
  },
  {
    id: "grp_server_docker",
    title: "7. Máy Chủ, VPS & Docker Tunnel",
    icon: IconTable,
    items: [
      { id: "servers_compare", label: "7.1. So Sánh Shared, Container, VPS & Server" },
      { id: "docker_compose_multi", label: "7.2. Đóng Gói docker-compose.yml" },
      { id: "cf_tunnel_deploy", label: "7.3. Thiết Lập Cloudflare Zero Trust Tunnel" },
    ],
  },
  {
    id: "grp_engine",
    title: "8. Git Flow & Động Cơ Kiểm Thử",
    icon: IconSparkles,
    items: [
      { id: "git_flow_guide", label: "8.1. Quy Chuẩn Git Flow & Commits Tiếng Việt" },
      { id: "engine_qa_bva_ep", label: "8.2. Động Cơ Sinh Test Case (BVA, EP, Z3)" },
      { id: "scrum_dod_export", label: "8.3. Quản Trị Sprint, Tiêu Chuẩn DoD & Xuất File" },
    ],
  },
];

// Danh sách tuần tự tất cả 32 bài viết phục vụ chuyển bài Trước / Tiếp theo
const ALL_DOC_ITEMS = MENU_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupId: group.id,
    groupTitle: group.title,
  }))
);

export default function DocumentationPage() {
  const [activeItem, setActiveItem] = useState("setup_prereq");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Tìm vị trí bài viết hiện tại và tính toán bài trước / tiếp theo
  const currentIndex = ALL_DOC_ITEMS.findIndex((item) => item.id === activeItem);
  const prevItem = currentIndex > 0 ? ALL_DOC_ITEMS[currentIndex - 1] : null;
  const nextItem = currentIndex < ALL_DOC_ITEMS.length - 1 ? ALL_DOC_ITEMS[currentIndex + 1] : null;

  function navigateToItem(item) {
    if (!item) return;
    setActiveItem(item.id);
    setExpandedGroups((prev) => ({
      ...prev,
      [item.groupId]: true,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Lưu trạng thái mở/đóng từng nhóm Accordion (mặc định mở nhóm 1 và nhóm chứa activeItem)
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const init = { grp_setup: true, grp_network: true, grp_dns: true, grp_cmd: true, grp_troubleshoot: true };
    return init;
  });

  function toggleGroup(groupId) {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }

  function handleExpandAll() {
    const all = {};
    MENU_GROUPS.forEach((g) => {
      all[g.id] = true;
    });
    setExpandedGroups(all);
  }

  function handleCollapseAll() {
    setExpandedGroups({});
  }

  async function handleCopy(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn("Lỗi sao chép:", err);
    }
  }

  // Tự động mở nhóm khi tìm kiếm
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="docs-page">
      {/* SIDEBAR NAVIGATION (ACCORDION MENU) */}
      <aside className="docs-sidebar">
        <div className="docs-sidebar__header">
          <div className="docs-sidebar__title">
            <IconBookOpen width={18} height={18} style={{ color: "var(--color-accent)" }} />
            <span>Tài Liệu & Hướng Dẫn</span>
          </div>

          <div className="docs-search-box">
            <IconSearch width={14} height={14} className="docs-search-icon" />
            <input
              type="text"
              className="docs-search-input"
              placeholder="Tìm kiếm chủ đề, lệnh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="docs-toggle-all-bar">
            <button type="button" className="docs-toggle-all-btn" onClick={handleExpandAll}>
              Mở tất cả
            </button>
            <span style={{ color: "var(--color-border)", margin: "0 4px" }}>|</span>
            <button type="button" className="docs-toggle-all-btn" onClick={handleCollapseAll}>
              Thu gọn
            </button>
          </div>
        </div>

        <nav className="docs-sidebar__nav">
          {MENU_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const filteredItems = group.items.filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Nếu đang tìm kiếm và nhóm không có mục khớp thì ẩn
            if (isSearching && filteredItems.length === 0) return null;

            const isExpanded = isSearching || !!expandedGroups[group.id];
            const hasActiveChild = group.items.some((i) => i.id === activeItem);

            return (
              <div key={group.id} className="docs-nav-group">
                {/* NÚT XỔ MENU NHÓM CHA */}
                <button
                  type="button"
                  className="docs-nav-group__btn"
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    color: hasActiveChild ? "var(--color-accent)" : "var(--color-text-primary)",
                  }}
                >
                  <div className="docs-nav-group__left">
                    <GroupIcon width={15} height={15} />
                    <span>{group.title}</span>
                  </div>
                  <div className="docs-nav-group__right">
                    <span className="docs-nav-group__count">{group.items.length}</span>
                    {isExpanded ? (
                      <IconChevronDown width={14} height={14} />
                    ) : (
                      <IconChevronRight width={14} height={14} />
                    )}
                  </div>
                </button>

                {/* DANH SÁCH MỤC CON XỔ RA */}
                {isExpanded && (
                  <div className="docs-sub-nav">
                    {(isSearching ? filteredItems : group.items).map((item) => {
                      const isActive = activeItem === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`docs-sub-item ${isActive ? "docs-sub-item--active" : ""}`}
                          onClick={() => setActiveItem(item.id)}
                        >
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="docs-content">
        {/* BANNER AN TOÀN THÔNG TIN */}
        <div className="docs-alert docs-alert--info">
          <IconInfo width={18} height={18} className="docs-alert__icon" />
          <div className="docs-alert__text">
            <strong>Bảo vệ an toàn thông tin:</strong> Toàn bộ địa chỉ máy chủ, cổng mạng, tên người dùng trong tài liệu đều sử dụng <strong>giá trị mẫu ví dụ minh họa (placeholder: node01.pikamc.vn, user_demo.srv1234, app.your-domain.id.vn)</strong>. Vui lòng thay thế bằng thông số thực tế của bạn khi thực hiện cấu hình.
          </div>
        </div>

        {/* ==============================================================
            NHÓM 1: CÀI ĐẶT & KHỞI CHẠY
           ============================================================== */}

        {activeItem === "setup_prereq" && (
          <article className="docs-article">
            <div className="docs-article__badge">1. Cài Đặt & Môi Trường</div>
            <h1 className="docs-article__title">1.1. Yêu Cầu Tiên Quyết (Node.js & Python)</h1>
            <p className="docs-article__lead">
              Hệ thống yêu cầu cài đặt sẵn hai môi trường thực thi chính là Node.js (cho Frontend React) và Python (cho Backend FastAPI & Động cơ Z3 Solver).
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">1. Kiểm Tra Phiên Bản Môi Trường Trên Máy</h2>
              <p className="text-sm text-muted mb-2">Mở cửa sổ Terminal (PowerShell hoặc Command Prompt) và chạy lần lượt 2 lệnh:</p>
              <CodeSnippet
                code="node -v && npm -v"
                lang="Node.js Check"
                copyId="cp_chk_node"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <p className="text-sm text-muted mb-2">Yêu cầu: Phiên bản Node.js từ <strong>18.x hoặc 20.x LTS</strong> trở lên.</p>

              <CodeSnippet
                code="python --version && pip --version"
                lang="Python Check"
                copyId="cp_chk_py"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <p className="text-sm text-muted mb-2">Yêu cầu: Phiên bản Python từ <strong>3.10, 3.11 hoặc 3.12</strong>.</p>
            </section>

            <div className="docs-alert docs-alert--warning">
              <IconInfo width={18} height={18} className="docs-alert__icon" />
              <div className="docs-alert__text">
                <strong>Lưu ý bắt buộc khi cài đặt Python trên Windows:</strong> Tại màn hình cài đặt đầu tiên của tệp cài Python, bắt buộc phải đánh dấu tích vào ô <em>"Add Python to PATH"</em> để hệ điều hành nhận diện được lệnh <code>python</code> và <code>pip</code>.
              </div>
            </div>
          </article>
        )}

        {activeItem === "setup_install" && (
          <article className="docs-article">
            <div className="docs-article__badge">1. Cài Đặt & Môi Trường</div>
            <h1 className="docs-article__title">1.2. Cài Đặt Thư Viện Phụ Thuộc (Backend & Frontend)</h1>
            <p className="docs-article__lead">
              Hướng dẫn cài đặt toàn bộ gói thư viện thuật toán kiểm thử và giao diện người dùng tại thư mục gốc của dự án.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Bước 1: Cài Đặt Phụ Thuộc Backend Python</h2>
              <p className="text-sm text-muted mb-2">Cài đặt FastAPI, Uvicorn, Z3 Solver, SQLAlchemy, Pydantic, Passlib, OpenPyXL:</p>
              <CodeSnippet
                code="pip install -r backend/requirements.txt"
                lang="Terminal / Bash"
                copyId="cp_pip_req"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">Bước 2: Cài Đặt Phụ Thuộc Frontend React</h2>
              <p className="text-sm text-muted mb-2">Cài đặt React, Vite và các tiện ích giao diện trong thư mục <code>frontend/</code>:</p>
              <CodeSnippet
                code="cd frontend && npm install && cd .."
                lang="Terminal / Bash"
                copyId="cp_npm_req"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {activeItem === "setup_db" && (
          <article className="docs-article">
            <div className="docs-article__badge">1. Cài Đặt & Môi Trường</div>
            <h1 className="docs-article__title">1.3. Khởi Tạo Cơ Sở Dữ Liệu SQLite & Dữ Liệu Mẫu</h1>
            <p className="docs-article__lead">
              Khởi tạo tệp cơ sở dữ liệu `backend/app.db` ở chế độ WAL hiệu năng cao và nạp sẵn dự án E-Commerce mẫu cùng các tài khoản thử nghiệm.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Lệnh Khởi Tạo & Nạp Dữ Liệu Mẫu (Seed Database)</h2>
              <p className="text-sm text-muted mb-2">Chạy kịch bản migration tại thư mục gốc của dự án:</p>
              <CodeSnippet
                code="python migrate_db.py"
                lang="Python Script"
                copyId="cp_seed_db"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <ul className="docs-list">
                <li>Khởi tạo các bảng: `users`, `projects`, `project_members`, `sprints`, `requirements`, `parameters`, `test_cases`.</li>
                <li>Tạo sẵn dự án mẫu <strong>Hệ Thống Đặt Hàng & Thanh Toán E-Commerce (PRJ-SHOP-DEMO)</strong> với 142 Test Cases đạt 92.3% Pass.</li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "setup_run" && (
          <article className="docs-article">
            <div className="docs-article__badge">1. Cài Đặt & Môi Trường</div>
            <h1 className="docs-article__title">1.4. Khởi Chạy 1 Lệnh Duy Nhất (Không Cần cd)</h1>
            <p className="docs-article__lead">
              Hệ thống trang bị bộ điều phối tiến trình `dev.js` (Zero-dependency), khởi động đồng thời cả Backend FastAPI (:8000) và Frontend Vite (:5173).
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Lệnh Khởi Động Tại Thư Mục Gốc</h2>
              <CodeSnippet
                code="npm run dev"
                lang="1-Click Command"
                copyId="cp_run_dev"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <ul className="docs-list">
                <li><strong>Backend API</strong>: <code>http://127.0.0.1:8000</code> (Tài liệu OpenAPI Swagger: <code>http://127.0.0.1:8000/docs</code>).</li>
                <li><strong>Frontend UI</strong>: <code>http://localhost:5173</code>.</li>
                <li><strong>Dừng hệ thống</strong>: Bấm <strong>Ctrl + C</strong> 1 lần trong cửa sổ terminal để tắt sạch cả 2 tiến trình.</li>
                <li><strong>Người dùng Windows</strong>: Bạn có thể nhấp đúp chuột vào tệp <code>chay_he_thong.bat</code> để chạy ngay.</li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "setup_rbac" && (
          <article className="docs-article">
            <div className="docs-article__badge">1. Cài Đặt & Môi Trường</div>
            <h1 className="docs-article__title">1.5. Tài Khoản Mặc Định & Cơ Chế Phân Quyền 3 Cấp (RBAC)</h1>
            <p className="docs-article__lead">
              Mô hình bảo mật phân quyền Role-Based Access Control chặt chẽ: Trưởng nhóm (Leader), Phó nhóm (Sub-lead) và Thành viên (Member).
            </p>

            <div className="table-container mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tài khoản</th>
                    <th>Tên đăng nhập</th>
                    <th>Mật khẩu mặc định</th>
                    <th>Quyền hạn chính</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Trưởng nhóm QA (Leader)</strong></td>
                    <td><code>qalead</code></td>
                    <td><code>123456</code></td>
                    <td>Toàn quyền quản trị dự án, mời thành viên, duyệt Sprint, phong chức Phó nhóm.</td>
                  </tr>
                  <tr>
                    <td><strong>Kiểm thử viên (Tester)</strong></td>
                    <td><code>tester01</code></td>
                    <td><code>123456</code></td>
                    <td>Nhập yêu cầu, sinh test case, chạy test và cập nhật trạng thái Pass/Fail/Blocked.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="docs-alert docs-alert--info">
              <IconInfo width={18} height={18} className="docs-alert__icon" />
              <div className="docs-alert__text">
                <strong>Đăng ký bình đẳng:</strong> Bạn có thể tự do bấm <em>Đăng Nhập</em> $\rightarrow$ <em>Đăng Ký Tài Khoản</em> để tạo tài khoản mới. Khi bạn tạo một dự án mới, bạn sẽ tự động là <strong>Trưởng nhóm (Leader)</strong> của dự án đó.
              </div>
            </div>
          </article>
        )}

        {/* ==============================================================
            NHÓM 2: MẠNG CĂN BẢN & ĐỊA CHỈ IP
           ============================================================== */}

        {activeItem === "net_ipv4_ipv6" && (
          <article className="docs-article">
            <div className="docs-article__badge">2. Mạng Căn Bản</div>
            <h1 className="docs-article__title">2.1. Phân Biệt IPv4 vs IPv6 & Public IP vs Private IP</h1>
            <p className="docs-article__lead">
              Địa chỉ IP (Internet Protocol) là chuỗi số định danh duy nhất cho mỗi thiết bị khi tham gia vào mạng máy tính toàn cầu.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">1. IPv4 vs IPv6</h2>
              <ul className="docs-list">
                <li><strong>IPv4 (32-bit)</strong>: Gồm 4 nhóm số thập phân từ 0 đến 255 (ví dụ: <code>180.93.100.154</code>). Giới hạn tối đa khoảng 4.3 tỷ địa chỉ và hiện nay tài nguyên IPv4 công cộng trên toàn cầu đã cạn kiệt.</li>
                <li><strong>IPv6 (128-bit)</strong>: Gồm 8 nhóm số thập lục phân (ví dụ: <code>2001:0db8:85a3::8a2e:0370:7334</code>). Cung cấp không gian địa chỉ gần như vô hạn cho kỷ nguyên IoT và Cloud.</li>
              </ul>
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">2. Public IP vs Private IP</h2>
              <ul className="docs-list">
                <li><strong>IP Riêng (Private IP)</strong>: Dải IP chỉ có giá trị trong mạng nội bộ gia đình, trường học, hoặc mạng Docker (`192.168.x.x`, `10.x.x.x`, `172.16.x.x`). Các máy tính bên ngoài Internet không thể kết nối trực tiếp vào Private IP.</li>
                <li><strong>IP Công cộng (Public IP)</strong>: Địa chỉ định danh duy nhất trên toàn mạng Internet. Bất kỳ ai trên thế giới đều có thể kết nối đến nếu cổng dịch vụ được mở.</li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "net_localhost_binding" && (
          <article className="docs-article">
            <div className="docs-article__badge">2. Mạng Căn Bản</div>
            <h1 className="docs-article__title">2.2. Cơ Chế Localhost (127.0.0.1) vs All Interfaces (0.0.0.0)</h1>
            <p className="docs-article__lead">
              Hiểu rõ sự khác biệt giữa hai địa chỉ lắng nghe này là yếu tố sống còn khi chạy ứng dụng trong Docker và Máy chủ Hosting.
            </p>

            <div className="table-container mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "160px" }}>Địa chỉ lắng nghe</th>
                    <th>Phạm vi chấp nhận kết nối</th>
                    <th>Môi trường áp dụng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>127.0.0.1</code> (Localhost)</td>
                    <td><strong>Chỉ chấp nhận</strong> kết nối phát sinh từ chính máy tính nội bộ. Mọi thiết bị khác trong mạng LAN hoặc ngoài Internet đều bị từ chối tuyệt đối.</td>
                    <td>Chạy lập trình thử nghiệm bảo mật trên máy cá nhân.</td>
                  </tr>
                  <tr>
                    <td><code>0.0.0.0</code> (All Interfaces)</td>
                    <td><strong>Chấp nhận</strong> kết nối từ bất kỳ địa chỉ IP nào trên tất cả các card mạng (LAN, Wi-Fi, Internet, Docker Bridge).</td>
                    <td><strong>Bắt buộc</strong> cho Backend khi đóng gói Docker, máy chủ VPS hoặc Pterodactyl Hosting.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <section className="docs-section">
              <h2 className="docs-section__title">Ví Dụ Cấu Hình Trong FastAPI:</h2>
              <CodeSnippet
                code="python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
                lang="Production Binding Command"
                copyId="cp_bind_all"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {activeItem === "net_cgnat_explained" && (
          <article className="docs-article">
            <div className="docs-article__badge">2. Mạng Căn Bản</div>
            <h1 className="docs-article__title">2.3. Rào Cản CGNAT Nhà Mạng Tại Việt Nam & Cách Khắc Phục</h1>
            <p className="docs-article__lead">
              Tại sao bạn mở cổng trên modem Wi-Fi gia đình nhưng bạn bè bên ngoài vẫn không thể truy cập vào website của bạn?
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">1. Bản Chất Của Carrier-Grade NAT (CGNAT)</h2>
              <p className="text-sm text-muted">
                Do cạn kiệt IPv4, các nhà mạng (Viettel, FPT, VNPT) không cấp Public IP riêng cho từng thuê bao gia đình, mà gom hàng trăm hộ gia đình dùng chung một Public IP qua thiết bị NAT của nhà mạng (thường gán dải IP WAN <code>100.64.0.0/10</code>).
              </p>
              <ul className="docs-list">
                <li>Modem Wi-Fi nhà bạn không nắm giữ Public IP thật.</li>
                <li>Tính năng <em>Port Forwarding</em> trên modem hoàn toàn vô tác dụng.</li>
              </ul>
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">2. Giải Pháp Chuẩn Hiện Đại: Cloudflare Tunnel</h2>
              <p className="text-sm text-muted">
                Thay vì cố gắng mở port từ ngoài vào trong, tiến trình <code>cloudflared</code> trên máy tính của bạn sẽ chủ động tạo một đường hầm mã hóa TLS kết nối ra ngoài máy chủ biên Cloudflare. Nhờ đó, người dùng toàn cầu truy cập tên miền <code>app.your-domain.id.vn</code> sẽ đi qua Cloudflare vào thẳng máy của bạn mà không cần mở cổng modem mạng.
              </p>
            </section>
          </article>
        )}

        {activeItem === "net_ports_lookup" && (
          <article className="docs-article">
            <div className="docs-article__badge">2. Mạng Căn Bản</div>
            <h1 className="docs-article__title">2.4. Bảng Tra Cứu Toàn Bộ Cổng Mạng (Port Range: 0 Đến 65535)</h1>
            <p className="docs-article__lead">
              Port (Cổng) là số hiệu định danh dịch vụ bên trong máy chủ. Toàn bộ không gian cổng có 65,536 cổng.
            </p>

            <div className="table-container mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "100px" }}>Cổng</th>
                    <th style={{ width: "160px" }}>Dịch vụ</th>
                    <th>Ý nghĩa & Mục đích sử dụng</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>80</code></td><td>HTTP Web</td><td>Truy cập web tiêu chuẩn không mã hóa.</td></tr>
                  <tr><td><code>443</code></td><td>HTTPS Web</td><td>Truy cập web bảo mật mã hóa SSL/TLS (Bắt buộc hiện nay).</td></tr>
                  <tr><td><code>22</code></td><td>SSH / SFTP chuẩn</td><td>Quản trị dòng lệnh máy chủ Linux từ xa an toàn.</td></tr>
                  <tr><td><code>2022 / 2023</code></td><td>Wings SFTP</td><td>Cổng truyền tệp của daemon Pterodactyl Panel.</td></tr>
                  <tr><td><code>8000</code></td><td>FastAPI / Python</td><td>Cổng máy chủ Backend API dự án CDIO-4.</td></tr>
                  <tr><td><code>5173</code></td><td>Vite Dev Server</td><td>Cổng giao diện React Frontend khi phát triển.</td></tr>
                  <tr><td><code>3306</code></td><td>MySQL / MariaDB</td><td>Cơ sở dữ liệu quan hệ SQL.</td></tr>
                  <tr><td><code>5432</code></td><td>PostgreSQL</td><td>Cơ sở dữ liệu quan hệ nâng cao.</td></tr>
                  <tr><td><code>6379</code></td><td>Redis</td><td>Hệ thống lưu trữ bộ nhớ đệm (Cache) tốc độ cao.</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        )}

        {/* ==============================================================
            NHÓM 3: HỆ THỐNG TÊN MIỀN (DNS)
           ============================================================== */}

        {activeItem === "dns_concepts_tld" && (
          <article className="docs-article">
            <div className="docs-article__badge">3. Hệ Thống DNS</div>
            <h1 className="docs-article__title">3.1. Cấu Trúc Tên Miền & Cơ Chế Phân Giải DNS Toàn Cầu</h1>
            <p className="docs-article__lead">
              DNS (Domain Name System) là cuốn danh bạ điện thoại toàn cầu của Internet, chuyển đổi tên miền dễ nhớ thành địa chỉ IP số.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Cấu Trúc Đọc Từ Phải Sang Trái:</h2>
              <CodeSnippet
                code={`api.your-service.id.vn
 │        │       │   └── TLD Cấp 1 (ccTLD quốc gia Việt Nam: .vn)
 │        │       └────── TLD Cấp 2 (Cá nhân số: .id.vn, Doanh nghiệp: .com.vn)
 │        └────────────── Tên miền chính (Domain Name: your-service)
 └─────────────────────── Tên miền con (Subdomain: api)`}
                lang="Domain Structure Map"
                copyId="cp_dom_struct"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {activeItem === "dns_5_records" && (
          <article className="docs-article">
            <div className="docs-article__badge">3. Hệ Thống DNS</div>
            <h1 className="docs-article__title">3.2. Chi Tiết 5 Loại Bản Ghi DNS Cốt Lõi (A, CNAME, TXT, MX, AAAA)</h1>
            <p className="docs-article__lead">
              Khi cấu hình tên miền trên trang quản trị DNS, bạn sẽ làm việc với 5 loại bản ghi cơ bản sau:
            </p>

            <div className="table-container mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "120px" }}>Bản ghi</th>
                    <th>Chức năng kỹ thuật</th>
                    <th style={{ width: "230px" }}>Ví dụ cú pháp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Record A</strong></td>
                    <td>Ánh xạ tên miền sang một địa chỉ <strong>IPv4</strong> cụ thể của máy chủ VPS.</td>
                    <td><code>app.id.vn</code> $\rightarrow$ <code>103.145.63.12</code></td>
                  </tr>
                  <tr>
                    <td><strong>Record AAAA</strong></td>
                    <td>Ánh xạ tên miền sang một địa chỉ <strong>IPv6</strong> (128-bit).</td>
                    <td><code>app.id.vn</code> $\rightarrow$ <code>2405:4803::1</code></td>
                  </tr>
                  <tr>
                    <td><strong>Record CNAME</strong></td>
                    <td>Tạo bí danh (Alias) trỏ về một tên miền khác thay vì trỏ địa chỉ IP trực tiếp.</td>
                    <td><code>www</code> $\rightarrow$ <code>your-domain.id.vn</code></td>
                  </tr>
                  <tr>
                    <td><strong>Record TXT</strong></td>
                    <td>Lưu chuỗi văn bản tự do: xác thực quyền sở hữu tên miền, bảo mật email (SPF, DKIM).</td>
                    <td><code>v=spf1 include:_spf.google.com ~all</code></td>
                  </tr>
                  <tr>
                    <td><strong>Record MX</strong></td>
                    <td>Định tuyến hòm thư email về máy chủ xử lý thư điện tử (Google Workspace, Zoho).</td>
                    <td><code>aspmx.l.google.com</code> (Priority: 10)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        )}

        {activeItem === "dns_cloudflare_setup" && (
          <article className="docs-article">
            <div className="docs-article__badge">3. Hệ Thống DNS</div>
            <h1 className="docs-article__title">3.3. Hướng Dẫn Quy Trình Trỏ Tên Miền Thực Tế Lên Cloudflare</h1>
            <p className="docs-article__lead">
              Các bước cấu hình chuẩn mực từ khi mua tên miền tại nhà cung cấp (Tenten, PA, Hostinger) đến khi xuất bản website.
            </p>

            <div className="docs-step">
              <span className="docs-step__num">1</span>
              <div>
                <strong>Đăng Ký Tài Khoản Cloudflare & Thêm Tên Miền</strong>
                <p className="text-sm text-muted">Truy cập Cloudflare.com $\rightarrow$ Bấm <em>Add a Site</em> $\rightarrow$ Nhập tên miền (ví dụ: <code>your-domain.id.vn</code>) $\rightarrow$ Chọn gói Free.</p>
              </div>
            </div>

            <div className="docs-step">
              <span className="docs-step__num">2</span>
              <div>
                <strong>Đổi Cặp Nameservers Tại Nhà Đăng Ký Tên Miền</strong>
                <p className="text-sm text-muted">Vào trang quản lý tên miền (nơi bạn mua tên miền) $\rightarrow$ Tìm mục <em>Thay đổi Nameserver</em> $\rightarrow$ Điền cặp Nameserver do Cloudflare chỉ định (ví dụ: <code>ns1.cloudflare.com</code> và <code>ns2.cloudflare.com</code>).</p>
              </div>
            </div>

            <div className="docs-step">
              <span className="docs-step__num">3</span>
              <div>
                <strong>Thêm Bản Ghi DNS Cần Thiết</strong>
                <p className="text-sm text-muted">Tại mục DNS của Cloudflare, nhấn <em>Add Record</em>: Thêm Record A trỏ IP của máy chủ VPS, hoặc kết nối qua Cloudflare Tunnel.</p>
              </div>
            </div>
          </article>
        )}

        {activeItem === "dns_proxy_rules" && (
          <article className="docs-article">
            <div className="docs-article__badge">3. Hệ Thống DNS</div>
            <h1 className="docs-article__title">3.4. Quy Tắc Vàng: Đám Mây Cam (Proxy) vs Đám Mây Xám (DNS Only)</h1>
            <p className="docs-article__lead">
              Lỗi phổ biến nhất của lập trình viên là bật đám mây cam cho các cổng SFTP/SSH khiến kết nối bị chặn hoàn toàn.
            </p>

            <div className="table-container mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Chế độ Cloudflare</th>
                    <th>Cơ chế hoạt động</th>
                    <th>Ứng dụng tương thích</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Đám mây cam (Proxied)</strong></td>
                    <td>Lưu lượng đi qua mạng lưới máy chủ biên của Cloudflare. Che giấu hoàn toàn IP máy chủ gốc, tự động cấp HTTPS, chống tấn công DDoS.</td>
                    <td><strong>CHỈ DÙNG CHO WEB HTTP (80) & HTTPS (443)</strong>.</td>
                  </tr>
                  <tr>
                    <td><strong>Đám mây xám (DNS Only)</strong></td>
                    <td>Cloudflare chỉ phân giải IP trực tiếp, không can thiệp vào gói tin. Gói dữ liệu đi thẳng vào máy chủ của bạn.</td>
                    <td><strong>BẮT BUỘC DÙNG CHO: SFTP (2023, 2022), SSH (22), Game Server, MySQL (3306)</strong>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="docs-alert docs-alert--warning">
              <IconInfo width={18} height={18} className="docs-alert__icon" />
              <div className="docs-alert__text">
                <strong>Nguyên tắc:</strong> Nếu bạn trỏ tên miền phụ cho SFTP (ví dụ: <code>sftp.your-domain.id.vn</code>), <strong>BẮT BUỘC PHẢI TẮT ĐÁM MÂY CAM</strong> (chuyển sang màu xám DNS Only), nếu không VS Code / FileZilla sẽ báo lỗi Timeout ngay lập tức!
              </div>
            </div>
          </article>
        )}

        {activeItem === "dns_flush_lookup" && (
          <article className="docs-article">
            <div className="docs-article__badge">3. Hệ Thống DNS</div>
            <h1 className="docs-article__title">3.5. Lệnh Tra Cứu DNS (nslookup) & Xóa Bộ Nhớ Đệm Máy Tính</h1>
            <p className="docs-article__lead">
              Các câu lệnh giúp bạn kiểm tra xem tên miền đã trỏ đúng IP chưa và giải quyết vấn đề máy tính lưu cache IP cũ.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">1. Xóa Bộ Nhớ Đệm DNS (Flush DNS Cache) Trên Windows</h2>
              <p className="text-sm text-muted mb-2">Khi bạn vừa đổi IP tên miền mà máy tính vẫn mở ra web cũ, hãy chạy lệnh:</p>
              <CodeSnippet
                code="ipconfig /flushdns"
                lang="Windows CMD / PowerShell"
                copyId="cp_flush"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">2. Lệnh Tra Cứu Phân Giải Tên Miền (nslookup)</h2>
              <p className="text-sm text-muted mb-2">Hỏi trực tiếp máy chủ DNS Cloudflare (1.1.1.1) để biết IP thực tế mà tên miền đang trỏ tới:</p>
              <CodeSnippet
                code="nslookup dtu-portal.server.id.vn 1.1.1.1"
                lang="DNS Query CLI"
                copyId="cp_ns_cf"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {/* ==============================================================
            NHÓM 4: LỆNH CHẨN ĐOÁN MẠNG THỰC HÀNH
           ============================================================== */}

        {activeItem === "cmd_my_ip" && (
          <article className="docs-article">
            <div className="docs-article__badge">4. Lệnh Mạng Thực Hành</div>
            <h1 className="docs-article__title">4.1. Lệnh Xem IP Cục Bộ (LAN) & IP Công Cộng (Public WAN)</h1>
            <p className="docs-article__lead">
              Làm thế nào để biết máy tính của bạn đang dùng IP nội bộ nào và địa chỉ Public IP mà thế giới nhìn thấy là gì?
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">1. Xem IP Nội Bộ Trên Máy Windows (ipconfig)</h2>
              <CodeSnippet
                code="ipconfig"
                lang="Windows Command"
                copyId="cp_cmd_ip"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <p className="text-sm text-muted">Dòng <code>IPv4 Address</code> (ví dụ <code>192.168.1.15</code>) chính là địa chỉ IP nội bộ của bạn.</p>
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">2. Xem Public IP Toàn Cầu (curl ifconfig.me)</h2>
              <CodeSnippet
                code="curl ifconfig.me"
                lang="cURL CLI"
                copyId="cp_cmd_pub"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <p className="text-sm text-muted">Trả về địa chỉ IP công cộng duy nhất mà nhà mạng cấp phát cho đường truyền của bạn.</p>
            </section>
          </article>
        )}

        {activeItem === "cmd_port_check" && (
          <article className="docs-article">
            <div className="docs-article__badge">4. Lệnh Mạng Thực Hành</div>
            <h1 className="docs-article__title">4.2. Kiểm Tra Cổng Kết Nối Máy Chủ Từ Xa (Test-NetConnection)</h1>
            <p className="docs-article__lead">
              Lệnh chẩn đoán quyền lực nhất trên Windows PowerShell để kiểm tra máy chủ từ xa có mở cổng hay không mà không cần cài thêm phần mềm.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Cú Pháp Lệnh PowerShell:</h2>
              <CodeSnippet
                code="Test-NetConnection -ComputerName snow.pikamc.vn -Port 2023"
                lang="PowerShell Command"
                copyId="cp_tnc_demo"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <ul className="docs-list">
                <li>Nếu kết quả có dòng: <code>TcpTestSucceeded : True</code> $\rightarrow$ <strong>Cổng kết nối hoàn toàn thông suốt</strong>.</li>
                <li>Nếu kết quả là <code>False</code> $\rightarrow$ Cổng bị tường lửa chặn hoặc máy chủ chưa bật service tương ứng.</li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "cmd_find_pid" && (
          <article className="docs-article">
            <div className="docs-article__badge">4. Lệnh Mạng Thực Hành</div>
            <h1 className="docs-article__title">4.3. Truy Tìm Tiến Trình Đang Chiếm Cổng Cục Bộ (Netstat)</h1>
            <p className="docs-article__lead">
              Khi bạn khởi chạy Backend FastAPI hoặc Frontend Vite mà bị báo lỗi "Cổng 8000 / 5173 đã được sử dụng", hãy dùng lệnh này để tìm thủ phạm.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Lệnh Truy Tìm PID Đang Chiếm Cổng 8000:</h2>
              <CodeSnippet
                code="netstat -ano | findstr :8000"
                lang="Windows CMD / PowerShell"
                copyId="cp_find_pid"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <p className="text-sm text-muted">
                Cột số cuối cùng bên phải chính là <strong>Mã Định Danh Tiến Trình (PID)</strong> đang chiếm cổng (ví dụ: <code>14280</code>).
              </p>
            </section>
          </article>
        )}

        {activeItem === "cmd_kill_process" && (
          <article className="docs-article">
            <div className="docs-article__badge">4. Lệnh Mạng Thực Hành</div>
            <h1 className="docs-article__title">4.4. Cưỡng Chế Tắt Tiến Trình Chiếm Cổng (Taskkill / Kill)</h1>
            <p className="docs-article__lead">
              Giải phóng cổng mạng ngay lập tức mà không cần phải khởi động lại máy tính.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">1. Trên Hệ Điều Hành Windows (Taskkill)</h2>
              <p className="text-sm text-muted mb-2">Thay thế <code>14280</code> bằng mã PID thực tế bạn vừa tìm được ở bước trước:</p>
              <CodeSnippet
                code="taskkill /PID 14280 /F"
                lang="Windows Taskkill"
                copyId="cp_kill_win"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">2. Trên Hệ Điều Hành Linux / macOS</h2>
              <CodeSnippet
                code="kill -9 $(lsof -t -i:8000)"
                lang="Linux Bash Command"
                copyId="cp_kill_linux"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {activeItem === "cmd_curl_check" && (
          <article className="docs-article">
            <div className="docs-article__badge">4. Lệnh Mạng Thực Hành</div>
            <h1 className="docs-article__title">4.5. Kiểm Tra Phản Hồi HTTP Header Của Máy Chủ (cURL -I)</h1>
            <p className="docs-article__lead">
              Kiểm tra nhanh máy chủ web có đang sống và trả về mã trạng thái 200 OK hay không mà không cần mở trình duyệt web.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Lệnh Kiểm Tra Header HTTP:</h2>
              <CodeSnippet
                code="curl -I http://localhost:8000/docs"
                lang="cURL Command"
                copyId="cp_curl_i"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <p className="text-sm text-muted">
                Nếu dòng đầu tiên trả về <code>HTTP/1.1 200 OK</code> nghĩa là Backend FastAPI đang hoạt động hoàn hảo.
              </p>
            </section>
          </article>
        )}

        {/* ==============================================================
            NHÓM 5: KHẮC PHỤC 6 LỖI MẠNG KINH ĐIỂN
           ============================================================== */}

        {activeItem === "err_conn_reset_ssh" && (
          <article className="docs-article">
            <div className="docs-article__badge">5. Khắc Phục Lỗi Mạng</div>
            <h1 className="docs-article__title">5.1. Lỗi client_loop: send disconnect: Connection reset & BadRequestError</h1>
            <p className="docs-article__lead">
              Lỗi xảy ra khi bạn dùng lệnh SSH thô sơ kết nối vào cổng 2023 của daemon Pterodactyl Wings.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">1. Hiện Tượng Thực Tế:</h2>
              <CodeSnippet
                code={`baokha.c933b89d@snow.pikamc.vn's password:
[Calagopus Daemon]: Server marked as running...
BadRequestError: request aborted
    at IncomingMessage.onAborted (/home/container/node_modules/raw-body/index.js:245:10)
client_loop: send disconnect: Connection reset`}
                lang="Terminal Error Log"
                copyId="cp_err_conn_reset"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">2. Bản Chất Kỹ Thuật:</h2>
              <p className="text-sm text-muted">
                Cổng 2023 là **SFTP Subsystem** chuyên biệt của Wings daemon phục vụ truyền nhận tệp tin, **KHÔNG PHẢI** là một interactive shell Linux. Khi bạn cố tình dùng `ssh -t`, daemon sẽ ngắt socket đột ngột (`Connection reset`), khiến luồng dữ liệu HTTP đang stream vào container bị đứt (`BadRequestError: request aborted`).
              </p>
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">3. Cách Khắc Phục Đúng Chuẩn:</h2>
              <ul className="docs-list">
                <li><strong>Truyền tệp</strong>: Dùng extension **SFTP Neo** trên Antigravity IDE với cấu hình `remotePath: "/"`.</li>
                <li><strong>Chạy lệnh & Xem log</strong>: Thao tác trực tiếp trên mục <strong>Bảng Điều Khiển (Web Console)</strong> của trang web Pikamc Panel, không dùng SSH thô sơ vào cổng 2023.</li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "err_econnrefused_fix" && (
          <article className="docs-article">
            <div className="docs-article__badge">5. Khắc Phục Lỗi Mạng</div>
            <h1 className="docs-article__title">5.2. Lỗi ECONNREFUSED (Connection Refused)</h1>
            <p className="docs-article__lead">
              Máy khách gửi yêu cầu kết nối nhưng máy chủ từ chối vì cổng đó chưa có ứng dụng nào đang lắng nghe.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Nguyên Nhân & Cách Khắc Phục:</h2>
              <ul className="docs-list">
                <li><strong>Nguyên nhân</strong>: Backend tại cổng 8000 chưa được khởi động, hoặc vừa bị crash do lỗi cú pháp code.</li>
                <li><strong>Cách xử lý</strong>: Mở terminal chạy lệnh <code>npm run dev</code> tại thư mục gốc, hoặc kiểm tra xem tiến trình Python uvicorn có báo lỗi gì hay không.</li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "err_eaddrinuse_fix" && (
          <article className="docs-article">
            <div className="docs-article__badge">5. Khắc Phục Lỗi Mạng</div>
            <h1 className="docs-article__title">5.3. Lỗi EADDRINUSE (Address Already In Use)</h1>
            <p className="docs-article__lead">
              Lỗi xảy ra khi ứng dụng cố gắng lắng nghe trên một cổng mà đã có tiến trình khác đang chiếm giữ.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Cách Xử Lý 2 Bước:</h2>
              <p className="text-sm text-muted mb-2">Bước 1: Tìm PID tiến trình đang chiếm cổng:</p>
              <CodeSnippet
                code="netstat -ano | findstr :8000"
                lang="Find PID"
                copyId="cp_fix_eaddr_find"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <p className="text-sm text-muted mb-2">Bước 2: Cưỡng chế tắt tiến trình đó:</p>
              <CodeSnippet
                code="taskkill /PID <MÃ_PID> /F"
                lang="Kill Process"
                copyId="cp_fix_eaddr_kill"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {activeItem === "err_502_gateway" && (
          <article className="docs-article">
            <div className="docs-article__badge">5. Khắc Phục Lỗi Mạng</div>
            <h1 className="docs-article__title">5.4. Lỗi 502 Bad Gateway & 504 Gateway Timeout</h1>
            <p className="docs-article__lead">
              Máy chủ Proxy biên (Cloudflare / Nginx) không thể kết nối tới ứng dụng nội bộ của bạn.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Bản Chất:</h2>
              <p className="text-sm text-muted">
                Đường hầm Cloudflare Tunnel kết nối tốt ra ngoài Internet, nhưng dịch vụ Backend nội bộ (ví dụ: cổng 25146 hoặc 8000) đã bị tắt hoặc gặp sự cố quá tải không phản hồi kịp thời.
              </p>
              <ul className="docs-list">
                <li><strong>Cách khắc phục</strong>: Mở Web Console trên hosting, kiểm tra xem ứng dụng Node.js/Python có đang chạy không. Khởi động lại service bằng nút Restart trên panel.</li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "err_cors_fix" && (
          <article className="docs-article">
            <div className="docs-article__badge">5. Khắc Phục Lỗi Mạng</div>
            <h1 className="docs-article__title">5.5. Lỗi CORS Policy: No 'Access-Control-Allow-Origin' header</h1>
            <p className="docs-article__lead">
              Cơ chế bảo mật Same-Origin của trình duyệt chặn Frontend gửi yêu cầu tới Backend do khác số hiệu cổng.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Cách Xử Lý Chuẩn Trong FastAPI (backend/main.py):</h2>
              <CodeSnippet
                code={`from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`}
                lang="Python FastAPI Middleware"
                copyId="cp_cors_code"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {activeItem === "err_etimedout_fix" && (
          <article className="docs-article">
            <div className="docs-article__badge">5. Khắc Phục Lỗi Mạng</div>
            <h1 className="docs-article__title">5.6. Lỗi ETIMEDOUT (Connection Timed Out)</h1>
            <p className="docs-article__lead">
              Gói tin SYN gửi đi nhưng hoàn toàn không nhận được phản hồi SYN-ACK từ máy chủ.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Nguyên Nhân Thường Gặp:</h2>
              <ul className="docs-list">
                <li>Địa chỉ IP máy chủ không tồn tại hoặc máy chủ đã bị tắt nguồn.</li>
                <li>Tường lửa máy chủ (UFW trên Ubuntu) hoặc Security Group trên AWS/GCP đang chặn cổng kết nối.</li>
                <li>Bạn đang bật <strong>Đám mây cam (Proxy)</strong> của Cloudflare trên một cổng không phải web (như SFTP 2023). Khắc phục: Chuyển sang <strong>Đám mây xám (DNS Only)</strong>.</li>
              </ul>
            </section>
          </article>
        )}

        {/* ==============================================================
            NHÓM 6: HOSTING PTERODACTYL & SFTP
           ============================================================== */}

        {activeItem === "ptero_architecture" && (
          <article className="docs-article">
            <div className="docs-article__badge">6. Hosting Pterodactyl</div>
            <h1 className="docs-article__title">6.1. Kiến Trúc Container Nền Tảng Pterodactyl Panel (Pikamc.vn)</h1>
            <p className="docs-article__lead">
              Mỗi máy chủ trên Pterodactyl Panel được cô lập hoàn toàn trong 1 Docker Container riêng biệt.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Đặc Điểm Môi Trường Container:</h2>
              <ul className="docs-list">
                <li>Thư mục làm việc cố định tại: <code>/home/container/</code>.</li>
                <li>Không có quyền Root Linux hệ thống (không dùng được <code>sudo</code> hay <code>apt-get install</code>).</li>
                <li>Các gói phụ thuộc phải được cài đặt cục bộ qua <code>pip</code> hoặc <code>npm</code>.</li>
                <li>Cổng kết nối được cấp phát động ngẫu nhiên qua biến môi trường <code>\${SERVER_PORT}</code>.</li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "ptero_start_sh" && (
          <article className="docs-article">
            <div className="docs-article__badge">6. Hosting Pterodactyl</div>
            <h1 className="docs-article__title">6.2. Kịch Bản Khởi Động Đa Tiến Trình (start.sh)</h1>
            <p className="docs-article__lead">
              Khởi động đồng thời cả Backend Python và Cloudflare Tunnel trong cùng một container.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Nội Dung Tệp start.sh:</h2>
              <CodeSnippet
                code={`#!/bin/bash
# 1. Kiem tra va cai dat thu vien backend Python
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# 2. Khoi chay FastAPI tren cong duoc cap phat
./backend/venv/bin/python -m uvicorn backend.main:app --host 0.0.0.0 --port \${SERVER_PORT} &

# 3. Khoi chay Cloudflare Tunnel ket noi ten mien cong khai
cloudflared tunnel run --token \${TUNNEL_TOKEN}`}
                lang="Bash Shell Script"
                copyId="cp_sh_script"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {activeItem === "sftp_config_json" && (
          <article className="docs-article">
            <div className="docs-article__badge">6. Hosting Pterodactyl</div>
            <h1 className="docs-article__title">6.3. Cấu Hình Chuẩn Tệp Tin .vscode/sftp.json</h1>
            <p className="docs-article__lead">
              Cấu hình chính xác để Antigravity IDE kết nối tới daemon Wings của Pterodactyl mà không bị lỗi đường dẫn.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Nội Dung Tệp .vscode/sftp.json:</h2>
              <CodeSnippet
                code={`{
  "name": "Pikamc Pterodactyl Node",
  "host": "node01.pikamc.vn",
  "protocol": "sftp",
  "port": 2023,
  "username": "user_demo.srv1234",
  "remotePath": "/",
  "uploadOnSave": true,
  "useTempFile": false,
  "openSsh": false,
  "connectTimeout": 30000,
  "interactiveAuth": true,
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
                lang="JSON Config"
                copyId="cp_sftp_config"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
              <div className="docs-alert docs-alert--warning mt-3">
                <IconInfo width={18} height={18} className="docs-alert__icon" />
                <div className="docs-alert__text">
                  <strong>Điểm mấu chốt:</strong> Thuộc tính <code>"remotePath": "/"</code> bắt buộc phải là <code>"/"</code> vì Wings daemon đã tự động chroot vào <code>/home/container/</code>. Nếu bạn để là <code>"/home/container"</code>, máy chủ sẽ báo lỗi "No such file or directory"!
                </div>
              </div>
            </section>
          </article>
        )}

        {activeItem === "sftp_workflow_tips" && (
          <article className="docs-article">
            <div className="docs-article__badge">6. Hosting Pterodactyl</div>
            <h1 className="docs-article__title">6.4. Quy Trình Đồng Bộ Mã Nguồn Tự Động Khi Lưu (Ctrl + S)</h1>
            <p className="docs-article__lead">
              Lập trình trực tiếp trên máy tính cá nhân và tệp tin tự động đẩy lên máy chủ đám mây trong vòng 0.5 giây.
            </p>

            <ul className="docs-list">
              <li>Nhờ thuộc tính <code>"uploadOnSave": true</code>, mỗi khi bạn nhấn <code>Ctrl + S</code> trong IDE, tiện ích SFTP sẽ tự động truyền tệp tin đó lên máy chủ.</li>
              <li>Để tải toàn bộ mã nguồn về máy: Nhấp chuột phải vào thư mục trong IDE $\rightarrow$ Chọn <strong>SFTP: Download Project</strong>.</li>
              <li>Để đẩy toàn bộ mã nguồn lên: Nhấp chuột phải $\rightarrow$ Chọn <strong>SFTP: Upload Project</strong>.</li>
            </ul>
          </article>
        )}

        {/* ==============================================================
            NHÓM 7: MÁY CHỦ, VPS & DOCKER TUNNEL
           ============================================================== */}

        {activeItem === "servers_compare" && (
          <article className="docs-article">
            <div className="docs-article__badge">7. Máy Chủ & Hạ Tầng</div>
            <h1 className="docs-article__title">7.1. Bảng So Sánh 4 Loại Máy Chủ: Shared, Container, VPS & Dedicated</h1>
            <p className="docs-article__lead">
              Lựa chọn mô hình máy chủ tối ưu chi phí và yêu cầu kỹ thuật cho hệ thống.
            </p>

            <div className="table-container mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tiêu chí</th>
                    <th>Shared Hosting</th>
                    <th>Container (Pterodactyl)</th>
                    <th>VPS Cloud</th>
                    <th>Dedicated Server</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Quyền Root</strong></td>
                    <td>Không có</td>
                    <td>Không có (Hạn chế container)</td>
                    <td>Toàn quyền Root cao nhất</td>
                    <td>Toàn quyền BIOS & OS</td>
                  </tr>
                  <tr>
                    <td><strong>Địa chỉ IP</strong></td>
                    <td>Chung với hàng trăm web</td>
                    <td>Chung IP Node, cấp cổng riêng</td>
                    <td>1 IPv4 Public tĩnh riêng</td>
                    <td>Dải IPv4 tĩnh riêng</td>
                  </tr>
                  <tr>
                    <td><strong>Mở cổng mạng</strong></td>
                    <td>Chỉ 80, 443, 21</td>
                    <td>Cấp ngẫu nhiên (25146)</td>
                    <td>Tự do mở 0 - 65535</td>
                    <td>Tự do toàn bộ 65,536 cổng</td>
                  </tr>
                  <tr>
                    <td><strong>Chi phí/tháng</strong></td>
                    <td>30k - 100k</td>
                    <td>50k - 200k</td>
                    <td>120k - 500k</td>
                    <td>2tr - 10tr+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        )}

        {activeItem === "docker_compose_multi" && (
          <article className="docs-article">
            <div className="docs-article__badge">7. Máy Chủ & Hạ Tầng</div>
            <h1 className="docs-article__title">7.2. Đóng Gói Ứng Dụng Đa Tầng Bằng docker-compose.yml</h1>
            <p className="docs-article__lead">
              Khởi chạy toàn bộ hệ thống gồm Backend FastAPI, Frontend Nginx và Cloudflare Tunnel chỉ bằng một câu lệnh Docker Compose.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">Nội Dung Tệp docker-compose.yml:</h2>
              <CodeSnippet
                code={`version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cdio4_backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./backend/app.db:/app/app.db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: cdio4_frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: cdio4_tunnel
    restart: unless-stopped
    command: tunnel run --token \${TUNNEL_TOKEN}
    depends_on:
      - frontend
      - backend`}
                lang="Docker Compose YAML"
                copyId="cp_compose_full"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>
          </article>
        )}

        {activeItem === "cf_tunnel_deploy" && (
          <article className="docs-article">
            <div className="docs-article__badge">7. Máy Chủ & Hạ Tầng</div>
            <h1 className="docs-article__title">7.3. Thiết Lập Cloudflare Zero Trust Tunnel</h1>
            <p className="docs-article__lead">
              Công nghệ xuất bản website ra thế giới mà không cần mở cổng modem mạng và không cần mua IP tĩnh.
            </p>

            <div className="docs-step">
              <span className="docs-step__num">1</span>
              <div>
                <strong>Tạo Tunnel Trên Cloudflare Zero Trust</strong>
                <p className="text-sm text-muted">Vào Cloudflare Dashboard $\rightarrow$ Zero Trust $\rightarrow$ Networks $\rightarrow$ Tunnels $\rightarrow$ Nhấn <em>Create a Tunnel</em> $\rightarrow$ Chọn Cloudflared.</p>
              </div>
            </div>

            <div className="docs-step">
              <span className="docs-step__num">2</span>
              <div>
                <strong>Lấy Token Đường Hầm (TUNNEL_TOKEN)</strong>
                <p className="text-sm text-muted">Sao chép mã chuỗi Token dài và điền vào biến môi trường <code>TUNNEL_TOKEN</code> trong máy chủ của bạn.</p>
              </div>
            </div>

            <div className="docs-step">
              <span className="docs-step__num">3</span>
              <div>
                <strong>Định Tuyến Tên Miền Con (Public Hostname)</strong>
                <p className="text-sm text-muted">Tại tab Public Hostname: Điền Subdomain <code>app</code> $\rightarrow$ Chọn tên miền <code>your-domain.id.vn</code> $\rightarrow$ Service trỏ về <code>http://localhost:5173</code>.</p>
              </div>
            </div>
          </article>
        )}

        {/* ==============================================================
            NHÓM 8: GIT FLOW & ĐỘNG CƠ KIỂM THỬ
           ============================================================== */}

        {activeItem === "git_flow_guide" && (
          <article className="docs-article">
            <div className="docs-article__badge">8. Quy Chuẩn & Kiểm Thử</div>
            <h1 className="docs-article__title">8.1. Quy Chuẩn Git Flow & Thông Điệp Commit Tiếng Việt</h1>
            <p className="docs-article__lead">
              Quy ước phân nhánh và cấu hình hiển thị tiếng Việt có dấu chuẩn xác trong Git.
            </p>

            <section className="docs-section">
              <h2 className="docs-section__title">1. Cấu Hình Tiếng Việt Có Dấu UTF-8:</h2>
              <CodeSnippet
                code={`git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8`}
                lang="Git Config CLI"
                copyId="cp_git_cfg"
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            </section>

            <section className="docs-section">
              <h2 className="docs-section__title">2. Quy Ước Conventional Commits:</h2>
              <ul className="docs-list">
                <li><code>feat(auth): Thêm tính năng đăng ký tài khoản mới</code></li>
                <li><code>fix(ui): Sửa lỗi hiển thị khối mã nguồn bị tối màu</code></li>
                <li><code>docs(network): Bổ sung hướng dẫn kiểm tra cổng mạng</code></li>
                <li><code>test(engine): Bổ sung ca kiểm thử phân tích giá trị biên</code></li>
              </ul>
            </section>
          </article>
        )}

        {activeItem === "engine_qa_bva_ep" && (
          <article className="docs-article">
            <div className="docs-article__badge">8. Quy Chuẩn & Kiểm Thử</div>
            <h1 className="docs-article__title">8.2. Động Cơ Sinh Test Case: BVA, Phân Vùng Tương Đương & Z3 Solver</h1>
            <p className="docs-article__lead">
              Nguyên lý thiết kế kiểm thử phần mềm chuyên nghiệp chuẩn ISTQB CTFL v4.0 và ISO/IEC/IEEE 29119-3.
            </p>

            <div className="table-container mb-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kỹ thuật</th>
                    <th>Nguyên lý áp dụng</th>
                    <th>Bộ giá trị mẫu (Độ tuổi: 18 - 60)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>BVA (Boundary Value)</strong></td>
                    <td>Kiểm tra tại các điểm ranh giới nhạy cảm lỗi: Min - 1, Min, Min + 1, Max - 1, Max, Max + 1.</td>
                    <td><code>17, 18, 19, 59, 60, 61</code></td>
                  </tr>
                  <tr>
                    <td><strong>Equivalence Partitioning</strong></td>
                    <td>Chia miền đầu vào thành 1 phân vùng hợp lệ và 2 phân vùng không hợp lệ.</td>
                    <td><code>10 (Invalid), 35 (Valid), 80 (Invalid)</code></td>
                  </tr>
                  <tr>
                    <td><strong>Pairwise Testing</strong></td>
                    <td>Bảo đảm mọi cặp tương tác 2 chiều xuất hiện ít nhất 1 lần, giảm 80% số ca test mà vẫn đạt độ phủ lỗi cao.</td>
                    <td>Tổ hợp trực giao ma trận.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        )}

        {activeItem === "scrum_dod_export" && (
          <article className="docs-article">
            <div className="docs-article__badge">8. Quy Chuẩn & Kiểm Thử</div>
            <h1 className="docs-article__title">8.3. Quản Trị Chu Kỳ Scrum, Tiêu Chuẩn DoD & Xuất Báo Cáo</h1>
            <p className="docs-article__lead">
              Đo lường tiêu chuẩn hoàn thành Definition of Done (DoD) và xuất bản báo cáo nghiệm thu 4 định dạng.
            </p>

            <ul className="docs-list">
              <li><strong>Tiêu chuẩn DoD</strong>: 100% User Story phải được bóc tách tham số và tỷ lệ kiểm thử thành công phải đạt trên 80% (hoặc 100% cho các luồng thanh toán quan trọng).</li>
              <li><strong>Xuất Báo Cáo 4 Định Dạng</strong>: Hỗ trợ xuất Excel chuyên nghiệp 4 Sheet (Tổng quan, Danh sách ca test, Ma trận truy xuất RTM, Đánh giá chất lượng), file CSV bảng tính, file JSON cấu trúc dữ liệu và file Markdown tài liệu.</li>
            </ul>
          </article>
        )}

        {/* --- NÚT ĐIỀU HƯỚNG BÀI TRƯỚC / TIẾP THEO (PREV / NEXT NAVIGATION) --- */}
        <div className="docs-pager-wrapper">
          <hr className="docs-pager-divider" />
          <nav className="docs-pager" aria-label="Điều hướng chuyển bài">
            {prevItem && (
              <button
                type="button"
                className="docs-pager__btn docs-pager__btn--prev"
                onClick={() => navigateToItem(prevItem)}
                title={`Bài trước: ${prevItem.label}`}
              >
                <div className="docs-pager__meta">
                  <IconChevronLeft width={13} height={13} />
                  <span>Bài trước</span>
                </div>
                <div className="docs-pager__title">{prevItem.label}</div>
              </button>
            )}

            {nextItem && (
              <button
                type="button"
                className="docs-pager__btn docs-pager__btn--next"
                onClick={() => navigateToItem(nextItem)}
                title={`Bài tiếp theo: ${nextItem.label}`}
              >
                <div className="docs-pager__meta">
                  <span>Bài tiếp theo</span>
                  <IconChevronRight width={13} height={13} />
                </div>
                <div className="docs-pager__title">{nextItem.label}</div>
              </button>
            )}
          </nav>
        </div>
      </main>
    </div>
  );
}
