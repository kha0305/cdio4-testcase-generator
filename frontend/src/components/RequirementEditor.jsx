import { useState, useRef, useEffect, useCallback } from "react";
import { IconFileText, IconPaste, IconTrash, IconSparkles, IconBookOpen, IconFolder, IconPlus } from "../icons";
import { SAMPLE_REQUIREMENTS } from "../data/examples";
import VisualGuideModal from "./VisualGuideModal";

const PLACEHOLDER = `Ví dụ (Example):
Khi người dùng đăng ký tài khoản, tuổi phải từ 18 đến 60 và mật khẩu phải từ 8 đến 20 ký tự.
Vai trò là một trong: Admin, User, Guest.
Email phải đúng định dạng email hợp lệ.

When a user registers an account, age must be from 18 to 60 and password must be from 8 to 20 characters.
Role is one of: Admin, User, Guest.`;

const MIN_HEIGHT = 300;

export default function RequirementEditor({
  onParse,
  loading,
  externalText,
  activeProject,
  onOpenProjectManager,
}) {
  const [text, setText] = useState("");
  const [projectName, setProjectName] = useState(
    activeProject?.name || "Dự Án Đăng Ký Tài Khoản & Phân Quyền"
  );
  const [showGuide, setShowGuide] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (activeProject?.name) {
      setProjectName(activeProject.name);
    }
  }, [activeProject]);

  useEffect(() => {
    if (externalText) {
      setText(externalText);
    }
  }, [externalText]);

  // Tự động điều chỉnh chiều cao khi nội dung đầy hoặc thay đổi ("tự đẩy xuống")
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.max(MIN_HEIGHT, el.scrollHeight);
    el.style.height = `${nextHeight}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [text, adjustHeight]);

  // Xử lý nút dán từ clipboard
  async function handlePaste() {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText) return;
      const el = textareaRef.current;
      if (el) {
        const start = el.selectionStart ?? text.length;
        const end = el.selectionEnd ?? text.length;
        const newText = text.substring(0, start) + clipText + text.substring(end);
        setText(newText);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start + clipText.length, start + clipText.length);
        }, 0);
      } else {
        setText((prev) => (prev ? prev + "\n" + clipText : clipText));
      }
    } catch {
      textareaRef.current?.focus();
      alert("Vui lòng cấp quyền truy cập Clipboard cho trình duyệt hoặc dùng phím tắt Ctrl + V");
    }
  }

  function handleClear() {
    setText("");
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }

  function handleSelectExample(sampleText, sampleProjName) {
    setText(sampleText);
    if (sampleProjName) {
      setProjectName(sampleProjName);
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onParse(text.trim(), projectName.trim() || (activeProject?.name || "Dự Án Kiểm Thử Phần Mềm"), activeProject?.id);
  }

  return (
    <section className="section" id="requirement-editor">
      {/* Header của Khung Nhập */}
      <div className="section__header" style={{ marginBottom: "var(--space-3)" }}>
        <h2 className="section__title" style={{ fontSize: "var(--font-size-base)" }}>
          <IconFileText width={16} height={16} style={{ color: "var(--color-accent)" }} />
          Soạn Thảo Đặc Tả Yêu Cầu Kiểm Thử
        </h2>

        <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handlePaste}
            title="Dán nhanh nội dung từ bộ nhớ tạm"
          >
            <IconPaste width={13} height={13} />
            Dán / Paste
          </button>

          {text && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={handleClear}
              title="Xóa toàn bộ nội dung"
              style={{ color: "var(--color-error)" }}
            >
              <IconTrash width={13} height={13} />
              Xóa
            </button>
          )}

          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setShowGuide(true)}
            title="Xem hướng dẫn cú pháp & ví dụ chi tiết"
          >
            <IconBookOpen width={13} height={13} />
            Hướng dẫn cú pháp
          </button>
        </div>
      </div>

      {/* Dải ví dụ mẫu thử nhanh */}
      <div className="example-bar" style={{ marginBottom: "var(--space-3)" }}>
        <span className="example-bar__label">
          <IconSparkles width={13} height={13} style={{ color: "var(--color-accent)" }} />
          Thử nhanh ví dụ mẫu:
        </span>
        {SAMPLE_REQUIREMENTS.map((ex) => (
          <button
            key={ex.id}
            type="button"
            className={`example-pill ${text === ex.text ? "example-pill--active" : ""}`}
            onClick={() => handleSelectExample(ex.text, ex.projectName)}
            title={ex.summary}
          >
            {ex.title}
          </button>
        ))}
      </div>

      {/* Khung Soạn Thảo */}
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          id="requirement-input"
          className="textarea"
          placeholder={PLACEHOLDER}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          style={{ minHeight: `${MIN_HEIGHT}px`, marginBottom: "var(--space-3)" }}
        />

        {/* Footer của Khung Soạn Thảo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <span style={{ fontSize: "12px", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            Hỗ trợ phân tích BVA, Phân vùng tương đương (EP), Pairwise và Bộ giải ràng buộc Z3 SMT Solver.
          </span>

          <button
            id="btn-parse"
            type="submit"
            className="btn btn--primary"
            disabled={!text.trim() || loading}
            style={{ minWidth: "180px", fontWeight: 600 }}
          >
            {loading ? <span className="spinner" /> : <IconFileText width={15} height={15} />}
            Bóc tách tham số & Sinh test
          </button>
        </div>
      </form>

      {/* Modal Hướng dẫn & Ví dụ Trực Quan */}
      <VisualGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onSelectExample={handleSelectExample}
      />
    </section>
  );
}
