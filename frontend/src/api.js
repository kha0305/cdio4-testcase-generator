/**
 * API wrapper - goi backend FastAPI endpoints.
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

async function request(url, options = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res;
}

/**
 * POST /api/parse - Gui van ban dac ta, nhan lai danh sach tham so boc tach.
 */
export async function parseRequirement(rawText, formatType = "free_text", projectName = "Default Project", projectId = null) {
  const body = {
    raw_text: rawText,
    format_type: formatType,
    project_name: projectName,
  };
  if (projectId) {
    body.project_id = projectId;
  }
  const res = await request("/parse", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.json();
}

/**
 * Projects API
 */
export async function getProjects() {
  const res = await request("/projects");
  return res.json();
}

export async function createProject(data) {
  const res = await request("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getProjectDetails(id) {
  const res = await request(`/projects/${id}`);
  return res.json();
}

export async function updateProject(id, data) {
  const res = await request(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteProject(id) {
  const res = await request(`/projects/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function joinProject(joinCode) {
  const res = await request("/projects/join", {
    method: "POST",
    body: JSON.stringify({ join_code: joinCode }),
  });
  return res.json();
}

/**
 * Project Members & Roles (Leader, Deputy, Member)
 */
export async function getProjectMembers(projectId) {
  const res = await request(`/projects/${projectId}/members`);
  return res.json();
}

export async function addProjectMember(projectId, userIdentifier, role = "member") {
  const res = await request(`/projects/${projectId}/members`, {
    method: "POST",
    body: JSON.stringify({ user_identifier: userIdentifier, role }),
  });
  return res.json();
}

export async function updateProjectMemberRole(projectId, userId, role) {
  const res = await request(`/projects/${projectId}/members/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
  return res.json();
}

export async function removeProjectMember(projectId, userId) {
  const res = await request(`/projects/${projectId}/members/${userId}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function exportProjectReport(projectId, format = "xlsx") {
  const token = localStorage.getItem("auth_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}/projects/${projectId}/export?format=${format}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Xuất báo cáo thất bại");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ext = format === "markdown" ? "md" : format;
  a.download = `project_report_${projectId}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * POST /api/generate - Gui danh sach tham so, nhan lai bo test case.
 */
export async function generateTestCases(requirementId, parameters, techniques, constraints = []) {
  const res = await request("/generate", {
    method: "POST",
    body: JSON.stringify({
      requirement_id: requirementId,
      parameters,
      techniques,
      constraints,
    }),
  });
  return res.json();
}

/**
 * GET /api/export/:suiteId - Tai file Excel/CSV.
 */
export async function exportTestSuite(suiteId, format = "xlsx") {
  const token = localStorage.getItem("auth_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${API_BASE}/export/${suiteId}?format=${format}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Xuất file thất bại");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `test_suite_${suiteId}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * PATCH /api/testcases/:id - Cap nhat trang thai pass/fail hoac ket qua thuc te.
 */
export async function updateTestCase(testCaseId, payload) {
  const res = await request(`/testcases/${testCaseId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.json();
}

/**
 * GET /api/suites/:suiteId - Lay chi tiet test suite kem test cases.
 */
export async function getTestSuite(suiteId) {
  const res = await request(`/suites/${suiteId}`);
  return res.json();
}

/**
 * POST /api/projects/seed-sample - Nap du an mau E-Commerce Scrum hoan chinh.
 */
export async function seedSampleProject() {
  const res = await request("/projects/seed-sample", {
    method: "POST",
  });
  return res.json();
}

/**
 * Authentication APIs
 */
export async function loginUser(username, password) {
  const res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function registerUser(data) {
  const res = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getCurrentUser(token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await request("/auth/me", { headers });
  return res.json();
}

export async function getUsers() {
  const res = await request("/auth/users");
  return res.json();
}

/**
 * Scrum Sprints APIs
 */
export async function getProjectSprints(projectId) {
  const res = await request(`/sprints/project/${projectId}`);
  return res.json();
}

export async function createSprint(data) {
  const res = await request("/sprints", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateSprint(id, data) {
  const res = await request(`/sprints/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSprint(id) {
  const res = await request(`/sprints/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

/**
 * Requirements / Features APIs
 */
export async function getProjectRequirements(projectId) {
  const res = await request(`/requirements/project/${projectId}`);
  return res.json();
}

export async function createRequirement(data) {
  const res = await request("/requirements", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateRequirement(id, data) {
  const res = await request(`/requirements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteRequirement(id) {
  const res = await request(`/requirements/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

/**
 * User Profile & Account Security APIs
 */
export async function updateUserProfile(data) {
  const res = await request("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function changeUserPassword(data) {
  const res = await request("/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}


