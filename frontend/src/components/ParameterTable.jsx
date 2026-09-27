import { useState, useEffect } from "react";
import { IconTable, IconPlay, IconPlus, IconTrash } from "../icons";

const DATA_TYPES = ["integer", "float", "string", "boolean", "date", "enum"];

export default function ParameterTable({ parameters, onUpdate, onGenerate, loading }) {
  const [params, setParams] = useState(parameters);

  // Đồng bộ khi nhận props mới từ parse response
  useEffect(() => {
    setParams(parameters);
  }, [parameters]);

  function updateParam(index, field, value) {
    const updated = [...params];
    updated[index] = { ...updated[index], [field]: value };
    setParams(updated);
    onUpdate(updated);
  }

  function removeParam(index) {
    const updated = params.filter((_, i) => i !== index);
    setParams(updated);
    onUpdate(updated);
  }

  function addParam() {
    const newParam = {
      name: "",
      data_type: "integer",
      min_value: null,
      max_value: null,
      min_length: null,
      max_length: null,
      enum_values: null,
      is_required: true,
      description: "",
    };
    const updated = [...params, newParam];
    setParams(updated);
    onUpdate(updated);
  }

  function handleGenerate() {
    onGenerate(params);
  }

  return (
    <section className="section" id="parameter-table">
      <div className="section__header">
        <h2 className="section__title">
          <IconTable />
          Danh sách tham số bóc tách / Extracted Parameters
        </h2>
        <span className="section__badge">{params.length} tham số</span>
      </div>

      {params.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__text">
            Chưa có tham số nào. Nhập văn bản đặc tả ở bước 1 để bắt đầu.
            <br />
            <span style={{ color: "var(--color-text-tertiary)" }}>
              No parameters yet. Enter requirement text in Step 1 to begin.
            </span>
          </p>
        </div>
      ) : (
        <>
          <div className="table-container" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "30px" }}>#</th>
                  <th>Tên tham số / Name</th>
                  <th>Kiểu dữ liệu / Type</th>
                  <th>Giá trị nhỏ nhất / Min</th>
                  <th>Giá trị lớn nhất / Max</th>
                  <th>Độ dài tối thiểu / Min Len</th>
                  <th>Độ dài tối đa / Max Len</th>
                  <th>Giá trị liệt kê / Enum</th>
                  <th>Bắt buộc</th>
                  <th style={{ width: "40px" }}></th>
                </tr>
              </thead>
              <tbody>
                {params.map((p, i) => (
                  <tr key={i}>
                    <td className="mono text-muted">{i + 1}</td>
                    <td>
                      <input
                        className="table-input"
                        value={p.name || ""}
                        onChange={(e) => updateParam(i, "name", e.target.value)}
                        style={{ minWidth: "120px" }}
                      />
                    </td>
                    <td>
                      <select
                        className="table-input"
                        value={p.data_type || "string"}
                        onChange={(e) => updateParam(i, "data_type", e.target.value)}
                      >
                        {DATA_TYPES.map((dt) => (
                          <option key={dt} value={dt}>{dt}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        value={p.min_value ?? ""}
                        onChange={(e) => updateParam(i, "min_value", e.target.value ? Number(e.target.value) : null)}
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        value={p.max_value ?? ""}
                        onChange={(e) => updateParam(i, "max_value", e.target.value ? Number(e.target.value) : null)}
                        style={{ width: "70px" }}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        value={p.min_length ?? ""}
                        onChange={(e) => updateParam(i, "min_length", e.target.value ? Number(e.target.value) : null)}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        type="number"
                        value={p.max_length ?? ""}
                        onChange={(e) => updateParam(i, "max_length", e.target.value ? Number(e.target.value) : null)}
                        style={{ width: "60px" }}
                      />
                    </td>
                    <td>
                      <input
                        className="table-input"
                        value={p.enum_values ? p.enum_values.join(", ") : ""}
                        onChange={(e) => {
                          const vals = e.target.value
                            .split(",")
                            .map((v) => v.trim())
                            .filter(Boolean);
                          updateParam(i, "enum_values", vals.length > 0 ? vals : null);
                        }}
                        placeholder="A, B, C"
                        style={{ minWidth: "100px" }}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={p.is_required !== false}
                        onChange={(e) => updateParam(i, "is_required", e.target.checked)}
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn--icon btn--secondary btn--sm"
                        onClick={() => removeParam(i)}
                        title="Xóa tham số / Remove parameter"
                      >
                        <IconTrash width={14} height={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4" style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
            <button className="btn btn--secondary btn--sm" onClick={addParam}>
              <IconPlus width={14} height={14} /> Thêm tham số / Add
            </button>

            <button
              id="btn-generate"
              className="btn btn--primary"
              onClick={handleGenerate}
              disabled={params.length === 0 || loading}
            >
              {loading ? <span className="spinner" /> : <IconPlay width={15} height={15} />}
              Sinh Test Cases / Generate
            </button>

            <span className="text-xs text-muted">
              Kiểm tra và chỉnh sửa tham số trước khi sinh ca kiểm thử
            </span>
          </div>
        </>
      )}
    </section>
  );
}
