import { useState, useEffect } from "react";
import "./index.css";
import RequirementEditor from "./components/RequirementEditor";
import ParameterTable from "./components/ParameterTable";
import TestCaseTable from "./components/TestCaseTable";
import VisualGuideModal from "./components/VisualGuideModal";
import ProjectManagerModal from "./components/ProjectManagerModal";
import ProjectMembersModal from "./components/ProjectMembersModal";
import AuthModal from "./components/AuthModal";
import ScrumView from "./components/ScrumView";
import CalendarView from "./components/CalendarView";
import ProjectReportDashboard from "./components/ProjectReportDashboard";
import FeatureSidebar from "./components/FeatureSidebar";
import UserProfileModal from "./components/UserProfileModal";
import DocumentationPage from "./components/DocumentationPage";

import {
  parseRequirement,
  generateTestCases,
  getProjects,
  getTestSuite,
  getProjectRequirements,
  createRequirement,
} from "./api";
import {
  IconSettings,
  IconCheck,
  IconBookOpen,
  IconFolder,
  IconPlus,
  IconSun,
  IconMoon,
  IconUser,
  IconLayers,
  IconCalendar,
  IconPieChart,
  IconUsers,
  IconLogOut,
} from "./icons";

function Stepper({ step }) {
  const steps = [
    { num: 1, label: "Đặc tả yêu cầu" },
    { num: 2, label: "Tham số & Ràng buộc" },
    { num: 3, label: "Kết quả kiểm thử" },
  ];

  return (
    <div className="stepper" style={{ marginBottom: "var(--space-4)" }}>
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <div
            className={`stepper__step ${
              step === s.num ? "stepper__step--active" : step > s.num ? "stepper__step--done" : ""
            }`}
          >
            <span className="stepper__number">
              {step > s.num ? <IconCheck width={12} height={12} /> : s.num}
            </span>
            {s.label}
          </div>
          {i < steps.length - 1 && <div className="stepper__separator" />}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  // Navigation mode: "studio" | "scrum" | "calendar" | "report"
  const [currentMode, setCurrentMode] = useState("studio");

  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Project state
  const [activeProject, setActiveProject] = useState(null);
  const [projectName, setProjectName] = useState("Dự Án Kiểm Thử CDIO-4");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Features list of active project
  const [projectFeatures, setProjectFeatures] = useState([]);
  const [activeFeatureId, setActiveFeatureId] = useState(null);

  // Studio Flow State (Step 1 -> Step 2 -> Step 3)
  const [step, setStep] = useState(1);
  const [parseLoading, setParseLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requirementId, setRequirementId] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [result, setResult] = useState(null);
  const [externalText, setExternalText] = useState("");

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // Load initial projects
  useEffect(() => {
    async function initProjects() {
      try {
        const projs = await getProjects();
        if (projs && projs.length > 0) {
          setActiveProject(projs[0]);
          setProjectName(projs[0].name);
        }
      } catch (err) {
        console.warn("Chưa thể tải danh sách dự án ban đầu:", err);
      }
    }
    initProjects();
  }, []);

  // Load features when active project changes
  useEffect(() => {
    if (activeProject?.id) {
      loadFeatures(activeProject.id);
    }
  }, [activeProject]);

  async function loadFeatures(projectId) {
    try {
      const feats = await getProjectRequirements(projectId);
      setProjectFeatures(feats);
      if (feats.length > 0 && !activeFeatureId) {
        handleSelectFeature(feats[0]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách chức năng con:", err);
    }
  }

  function handleSelectFeature(feat) {
    setActiveFeatureId(feat.id);
    setExternalText(feat.raw_text);
    setRequirementId(feat.id);
    setStep(1);

    // If feature already has test suite, load it directly
    if (feat.test_suites_count > 0) {
      // Feature has tests, load first suite
    }
  }

  async function handleCreateFeature(featData) {
    if (!activeProject?.id) return;
    const newFeat = await createRequirement({
      ...featData,
      project_id: activeProject.id,
    });
    await loadFeatures(activeProject.id);
    handleSelectFeature(newFeat);
  }

  function handleSelectExampleFromGuide(sampleText) {
    setExternalText(sampleText);
    setCurrentMode("studio");
    setStep(1);
  }

  async function handleParse(rawText, projName, projId) {
    setError(null);
    setParseLoading(true);
    if (projName) {
      setProjectName(projName);
    }
    try {
      const pid = projId || activeProject?.id || null;
      const data = await parseRequirement(rawText, "free_text", projName || projectName, pid);
      setRequirementId(data.requirement_id);
      setParameters(data.parameters);
      setStep(2);
      if (activeProject?.id) {
        loadFeatures(activeProject.id);
      }
    } catch (err) {
      setError("Lỗi khi bóc tách / Parse error: " + err.message);
    } finally {
      setParseLoading(false);
    }
  }

  async function handleGenerate(params) {
    setError(null);
    setGenerateLoading(true);
    try {
      const data = await generateTestCases(
        requirementId,
        params,
        ["bva", "ep", "pairwise"],
        []
      );
      setResult(data);
      setStep(3);
      if (activeProject?.id) {
        loadFeatures(activeProject.id);
      }
    } catch (err) {
      setError("Lỗi khi sinh test case / Generation error: " + err.message);
    } finally {
      setGenerateLoading(false);
    }
  }

  function handleReset() {
    setStep(1);
    setRequirementId(null);
    setParameters([]);
    setResult(null);
    setError(null);
  }

  function handleBackToStep(targetStep) {
    setStep(targetStep);
  }

  function handleOpenPastSuite(suiteData, proj) {
    if (proj) {
      setActiveProject(proj);
      setProjectName(proj.name);
    }
    setRequirementId(suiteData.requirement_id);
    setResult(suiteData);
    setCurrentMode("studio");
    setStep(3);
  }

  function handleSelectFeatureForTesting(feat) {
    handleSelectFeature(feat);
    setCurrentMode("studio");
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setCurrentUser(null);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* --- Top Navigation Bar (Chuẩn SaaS Hiện Đại) --- */}
      <header className="top-navbar">
        {/* Phía Trái: Thương hiệu & Bộ chọn Dự Án */}
        <div className="top-navbar__left">
          <div
            className="top-navbar__brand"
            onClick={() => setCurrentMode("studio")}
            title="AutoTest Studio - Hệ Thống Sinh Test Case Tự Động"
          >
            <div className="top-navbar__brand-logo">
              <IconSettings width={18} height={18} />
            </div>
            <div>
              <span className="top-navbar__brand-title">AutoTest</span>
              <span className="badge badge--neutral" style={{ fontSize: "10px", marginLeft: "6px", padding: "1px 5px" }}>
                CDIO-4
              </span>
            </div>
          </div>

          <div className="top-navbar__divider" />

          {/* Bộ chọn Dự án Hiện Tại */}
          <button
            type="button"
            className="top-project-pill"
            onClick={() => setShowProjectModal(true)}
            title="Nhấn để đổi hoặc quản lý dự án"
          >
            <IconFolder width={14} height={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
            <span className="top-project-name">
              {activeProject ? activeProject.name : "Chọn Dự Án"}
            </span>
            {activeProject?.code && (
              <span className="badge badge--primary" style={{ padding: "1px 5px", fontSize: "10px", flexShrink: 0 }}>
                {activeProject.code}
              </span>
            )}
          </button>

          {/* Nút Quản Lý Thành Viên Kèm Vai Trò RBAC */}
          {activeProject && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setShowMembersModal(true)}
              title="Quản lý thành viên & phân quyền dự án"
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 8px" }}
            >
              <IconUsers width={13} height={13} />
              <span style={{ fontSize: "11px" }}>Thành Viên</span>
              <span
                className={`badge ${
                  activeProject.current_user_role === "leader"
                    ? "badge--primary"
                    : activeProject.current_user_role === "deputy"
                    ? "badge--info"
                    : "badge--secondary"
                }`}
                style={{ fontSize: "9px", padding: "1px 5px" }}
              >
                {activeProject.current_user_role === "leader"
                  ? "Trưởng nhóm"
                  : activeProject.current_user_role === "deputy"
                  ? "Phó nhóm"
                  : "Thành viên"}
              </span>
            </button>
          )}
        </div>

        {/* Ở Giữa: Segmented Navigation Switcher */}
        <div className="top-navbar__center">
          <nav className="top-nav-tabs">
            <button
              type="button"
              className={`top-nav-tab ${currentMode === "studio" ? "top-nav-tab--active" : ""}`}
              onClick={() => setCurrentMode("studio")}
            >
              <IconSettings width={14} height={14} />
              <span>Studio Kiểm Thử</span>
            </button>

            <button
              type="button"
              className={`top-nav-tab ${currentMode === "scrum" ? "top-nav-tab--active" : ""}`}
              onClick={() => setCurrentMode("scrum")}
            >
              <IconLayers width={14} height={14} />
              <span>Bảng Scrum</span>
            </button>

            <button
              type="button"
              className={`top-nav-tab ${currentMode === "calendar" ? "top-nav-tab--active" : ""}`}
              onClick={() => setCurrentMode("calendar")}
            >
              <IconCalendar width={14} height={14} />
              <span>Lịch Phân Công</span>
            </button>

            <button
              type="button"
              className={`top-nav-tab ${currentMode === "report" ? "top-nav-tab--active" : ""}`}
              onClick={() => setCurrentMode("report")}
            >
              <IconPieChart width={14} height={14} />
              <span>Báo Cáo Dự Án</span>
            </button>

            <button
              type="button"
              className={`top-nav-tab ${currentMode === "docs" ? "top-nav-tab--active" : ""}`}
              onClick={() => setCurrentMode("docs")}
            >
              <IconBookOpen width={14} height={14} />
              <span>Tài Liệu & Cài Đặt</span>
            </button>
          </nav>
        </div>

        {/* Phía Phải: Hướng Dẫn, Đổi Theme, Người Dùng */}
        <div className="top-navbar__right">
          <button
            type="button"
            className="top-nav-icon-btn"
            onClick={() => setCurrentMode("docs")}
            title="Mở toàn màn hình: Hướng dẫn cài đặt & Tài liệu kỹ thuật"
          >
            <IconBookOpen width={15} height={15} />
          </button>

          <button
            type="button"
            className="top-nav-icon-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
          >
            {theme === "dark" ? (
              <IconSun width={15} height={15} />
            ) : (
              <IconMoon width={15} height={15} />
            )}
          </button>

          <div className="top-navbar__divider" />

          {/* User Account / Login */}
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
              {/* Profile Pill Button */}
              <button
                type="button"
                className="top-user-pill"
                onClick={() => setShowProfileModal(true)}
                title="Nhấn để xem hồ sơ cá nhân & bảo mật tài khoản"
                style={{ cursor: "pointer" }}
              >
                <div className="top-user-avatar">
                  {currentUser.full_name?.charAt(0) || currentUser.username?.charAt(0) || "U"}
                </div>
                <span style={{ fontWeight: 600, fontSize: "12px", maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentUser.full_name || currentUser.username}
                </span>
              </button>

              {/* Explicit Logout Button */}
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleLogout}
                title="Đăng xuất khỏi hệ thống"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  color: "var(--color-error)",
                  background: "var(--color-error-bg)",
                  borderColor: "rgba(239, 68, 68, 0.4)",
                  cursor: "pointer",
                }}
              >
                <IconLogOut width={13} height={13} />
                <span>Đăng Xuất</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setShowAuthModal(true)}
              style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              <IconUser width={13} height={13} />
              Đăng Nhập
            </button>
          )}
        </div>
      </header>

      {/* --- Main Workspace Container --- */}
      <main className="app-container" style={{ flex: 1 }}>

      {/* --- MODE 1: TEST STUDIO --- */}
      {currentMode === "studio" && (
        <div style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
          {/* Left Sidebar: Sub-Features in Project */}
          <FeatureSidebar
            features={projectFeatures}
            activeFeatureId={activeFeatureId}
            onSelectFeature={handleSelectFeature}
            onCreateFeature={handleCreateFeature}
          />

          {/* Right Main Working Area: 3 Steps */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Stepper step={step} />

            {error && (
              <div className="alert alert--error" style={{ marginBottom: "var(--space-4)" }}>
                <span>{error}</span>
              </div>
            )}

            {/* Bước 1: Nhập yêu cầu */}
            {step === 1 && (
              <RequirementEditor
                onParse={handleParse}
                loading={parseLoading}
                externalText={externalText}
                projectName={projectName}
                activeProject={activeProject}
                onOpenProjectModal={() => setShowProjectModal(true)}
              />
            )}

            {/* Bước 2: Xem & chỉnh sửa tham số */}
            {step === 2 && (
              <ParameterTable
                parameters={parameters}
                onGenerate={handleGenerate}
                loading={generateLoading}
                onBack={() => handleBackToStep(1)}
              />
            )}

            {/* Bước 3: Xem kết quả Test Cases */}
            {step === 3 && result && (
              <TestCaseTable
                result={result}
                onReset={handleReset}
                onBack={() => handleBackToStep(2)}
              />
            )}
          </div>
        </div>
      )}

      {/* --- MODE 2: SCRUM & SPRINTS --- */}
      {currentMode === "scrum" && (
        <ScrumView
          activeProject={activeProject}
          onSelectFeatureForTesting={handleSelectFeatureForTesting}
        />
      )}

      {/* --- MODE 3: CALENDAR & TIMELINE --- */}
      {currentMode === "calendar" && (
        <CalendarView
          activeProject={activeProject}
          onSelectFeatureForTesting={handleSelectFeatureForTesting}
        />
      )}

      {/* --- MODE 4: PROJECT SUMMARY REPORT DASHBOARD --- */}
      {currentMode === "report" && (
        <ProjectReportDashboard
          activeProject={activeProject}
          onSelectFeatureForTesting={handleSelectFeatureForTesting}
        />
      )}

      {/* --- MODE 5: FULL-PAGE DOCUMENTATION & SETUP GUIDE --- */}
      {currentMode === "docs" && <DocumentationPage />}
      </main>

      {/* Modal Huong dan truc quan */}
      <VisualGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onSelectExample={handleSelectExampleFromGuide}
      />

      {/* Modal Quan ly du an */}
      <ProjectManagerModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        activeProject={activeProject}
        currentUser={currentUser}
        onSelectProject={(proj) => {
          setActiveProject(proj);
          setProjectName(proj.name);
          handleReset();
        }}
        onOpenSuite={handleOpenPastSuite}
      />

      {/* Modal Quan ly Thanh Vien & Phan Quyen */}
      <ProjectMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        project={activeProject}
        currentUser={currentUser}
        onProjectUpdated={async () => {
          try {
            const projs = await getProjects();
            if (projs && activeProject) {
              const updated = projs.find((p) => p.id === activeProject.id) || projs[0];
              setActiveProject(updated);
            }
          } catch (err) {
            console.error("Lỗi cập nhật dự án:", err);
          }
        }}
      />

      {/* Modal Dang Nhap / Dang Ky */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Modal Ho So Ca Nhan & Bao Mat */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onUserUpdated={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem("auth_user", JSON.stringify(updated));
        }}
        onLogout={handleLogout}
      />
    </div>
  );
}
