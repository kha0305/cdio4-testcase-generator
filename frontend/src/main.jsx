import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary intercepted:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", maxWidth: "600px", margin: "40px auto", fontFamily: "Times New Roman, serif" }}>
          <h2 style={{ color: "#DC2626", marginBottom: "12px" }}>Đã xảy ra sự cố hiển thị giao diện</h2>
          <p style={{ color: "#64748B", marginBottom: "20px", fontSize: "14px" }}>
            {this.state.error?.message || "Lỗi không xác định"}
          </p>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ padding: "8px 18px", backgroundColor: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
          >
            Xóa dữ liệu đệm & Tải lại ứng dụng
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
