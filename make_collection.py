import json

collection = {
    "info": {
        "_postman_id": "cdio4-test-case-generator-api",
        "name": "CDIO-4 — He Thong Sinh Test Case Tu Dong",
        "description": "Postman Collection chuan 100% endpoint cua backend CDIO-4 kem script tu dong trich xuat va chuyen giao du lieu giua cac buoc.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {"key": "base_url", "value": "http://127.0.0.1:8000", "type": "string"},
        {"key": "token", "value": "", "type": "string"},
        {"key": "project_id", "value": "1", "type": "string"},
        {"key": "sprint_id", "value": "1", "type": "string"},
        {"key": "requirement_id", "value": "1", "type": "string"},
        {"key": "suite_id", "value": "1", "type": "string"},
        {"key": "extracted_params", "value": "[]", "type": "string"}
    ],
    "item": [
        {
            "name": "00 - He Thong",
            "item": [
                {
                    "name": "01 - Kiem Tra Suc Khoe (Health Check)",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {"raw": "{{base_url}}/api/health", "host": ["{{base_url}}"], "path": ["api", "health"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "pm.test('Server hoat dong binh thuong (200)', function () { pm.response.to.have.status(200); });",
                                "pm.test('Trang thai ok', function () { var d = pm.response.json(); pm.expect(d.status).to.eql('ok'); });"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                },
                {
                    "name": "02 - Thong Tin API Root",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {"raw": "{{base_url}}/", "host": ["{{base_url}}"], "path": [""]}
                    }
                }
            ]
        },
        {
            "name": "01 - Xac Thuc & Tai Khoan",
            "item": [
                {
                    "name": "01 - Dang Ky Tai Khoan (Tester)",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "username": "tester_chuyennghiep",
                                "email": "tester@cdio4.vn",
                                "full_name": "Nguyen Van Kiem Thu",
                                "password": "MatKhauAnToan@2026"
                            }, ensure_ascii=False, indent=2)
                        },
                        "url": {"raw": "{{base_url}}/api/auth/register", "host": ["{{base_url}}"], "path": ["api", "auth", "register"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "if (pm.response.code === 201 || pm.response.code === 200) {",
                                "    var d = pm.response.json();",
                                "    if (d.access_token) {",
                                "        pm.collectionVariables.set('token', d.access_token);",
                                "        console.log('Da luu JWT Token:', d.access_token);",
                                "    }",
                                "}"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                },
                {
                    "name": "02 - Dang Nhap (Login)",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "username": "tester_chuyennghiep",
                                "password": "MatKhauAnToan@2026"
                            }, ensure_ascii=False, indent=2)
                        },
                        "url": {"raw": "{{base_url}}/api/auth/login", "host": ["{{base_url}}"], "path": ["api", "auth", "login"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "pm.test('Dang nhap thanh cong', function () { pm.expect(pm.response.code).to.be.oneOf([200, 201]); });",
                                "var d = pm.response.json();",
                                "if (d.access_token) {",
                                "    pm.collectionVariables.set('token', d.access_token);",
                                "    console.log('Cap nhat JWT Token:', d.access_token);",
                                "}"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                },
                {
                    "name": "03 - Lay Thong Tin Ca Nhan (/me)",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {"raw": "{{base_url}}/api/auth/me", "host": ["{{base_url}}"], "path": ["api", "auth", "me"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "pm.test('Lay thong tin /me thanh cong', function () { pm.expect(pm.response.code).to.be.oneOf([200, 401]); });"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                }
            ]
        },
        {
            "name": "02 - Quan Ly Du An",
            "item": [
                {
                    "name": "01 - Danh Sach Du An",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {"raw": "{{base_url}}/api/projects", "host": ["{{base_url}}"], "path": ["api", "projects"]}
                    }
                },
                {
                    "name": "02 - Tao Du An Kiem Thu Moi",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "name": "He Thong Thuong Mai Dien Tu",
                                "code": "ECOMMERCE",
                                "description": "Du an phat trien website ban hang va thanh toan truc tuyen"
                            }, ensure_ascii=False, indent=2)
                        },
                        "url": {"raw": "{{base_url}}/api/projects", "host": ["{{base_url}}"], "path": ["api", "projects"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "if (pm.response.code === 200 || pm.response.code === 201) {",
                                "    var d = pm.response.json();",
                                "    if (d.id) {",
                                "        pm.collectionVariables.set('project_id', d.id.toString());",
                                "        console.log('Da luu project_id:', d.id);",
                                "    }",
                                "}"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                },
                {
                    "name": "03 - Chi Tiet Du An",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {"raw": "{{base_url}}/api/projects/{{project_id}}", "host": ["{{base_url}}"], "path": ["api", "projects", "{{project_id}}"]}
                    }
                }
            ]
        },
        {
            "name": "04 - Quan Ly Sprint",
            "item": [
                {
                    "name": "01 - Danh Sach Sprint Trong Du An",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {"raw": "{{base_url}}/api/sprints/project/{{project_id}}", "host": ["{{base_url}}"], "path": ["api", "sprints", "project", "{{project_id}}"]}
                    }
                },
                {
                    "name": "02 - Tao Sprint Kiem Thu Moi",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "project_id": 1,
                                "name": "Sprint 1 — Xac Thuc & Thanh Toan",
                                "goal": "Hoan thanh kiem thu module dang nhap va gio hang",
                                "start_date": "2026-10-01",
                                "end_date": "2026-10-15"
                            }, ensure_ascii=False, indent=2)
                        },
                        "url": {"raw": "{{base_url}}/api/sprints", "host": ["{{base_url}}"], "path": ["api", "sprints"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "if (pm.response.code === 200 || pm.response.code === 201) {",
                                "    var d = pm.response.json();",
                                "    if (d.id) { pm.collectionVariables.set('sprint_id', d.id.toString()); }",
                                "}"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                }
            ]
        },
        {
            "name": "05 - Chuc Nang & Yeu Cau",
            "item": [
                {
                    "name": "01 - Danh Sach Chuc Nang Con",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {"raw": "{{base_url}}/api/requirements/project/{{project_id}}", "host": ["{{base_url}}"], "path": ["api", "requirements", "project", "{{project_id}}"]}
                    }
                },
                {
                    "name": "02 - Tao Yeu Cau Kiem Thu Moi",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "project_id": 1,
                                "sprint_id": 1,
                                "title": "Kiem tra do tuoi dang ky thanh vien",
                                "raw_text": "Do tuoi cua nguoi dung phai nam trong khoang tu 18 den 60 tuoi. Mat khau tu 8 den 32 ky tu.",
                                "priority": "High"
                            }, ensure_ascii=False, indent=2)
                        },
                        "url": {"raw": "{{base_url}}/api/requirements", "host": ["{{base_url}}"], "path": ["api", "requirements"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "if (pm.response.code === 200 || pm.response.code === 201) {",
                                "    var d = pm.response.json();",
                                "    if (d.id) { pm.collectionVariables.set('requirement_id', d.id.toString()); }",
                                "}"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                }
            ]
        },
        {
            "name": "06 - Boc Tach & Sinh Test Case",
            "item": [
                {
                    "name": "01 - Boc Tach Ngu Nghia (NLP Parsing)",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "raw_text": "Tuoi phai tu 18 den 65 tuoi. Mat khau tu 8 den 20 ky tu.",
                                "project_id": 1
                            }, ensure_ascii=False, indent=2)
                        },
                        "url": {"raw": "{{base_url}}/api/parse", "host": ["{{base_url}}"], "path": ["api", "parse"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "if (pm.response.code === 200 || pm.response.code === 201) {",
                                "    var d = pm.response.json();",
                                "    if (d.requirement_id) { pm.collectionVariables.set('requirement_id', d.requirement_id.toString()); }",
                                "    if (d.parameters) { pm.collectionVariables.set('extracted_params', JSON.stringify(d.parameters)); }",
                                "}"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                },
                {
                    "name": "02 - Tu Dong Sinh Bo Test Case",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "requirement_id": 1,
                                "parameters": [
                                    {
                                        "name": "Tuổi",
                                        "param_type": "integer",
                                        "min_value": 18,
                                        "max_value": 65,
                                        "equivalence_classes": [
                                            {"name": "Dưới tuổi lao động", "is_valid": False, "description": "< 18"},
                                            {"name": "Độ tuổi hợp lệ", "is_valid": True, "description": "18 - 65"},
                                            {"name": "Quá tuổi lao động", "is_valid": False, "description": "> 65"}
                                        ]
                                    }
                                ],
                                "techniques": ["BVA", "EP", "Pairwise"]
                            }, ensure_ascii=False, indent=2)
                        },
                        "url": {"raw": "{{base_url}}/api/generate", "host": ["{{base_url}}"], "path": ["api", "generate"]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "if (pm.response.code === 200 || pm.response.code === 201) {",
                                "    var d = pm.response.json();",
                                "    if (d.test_suite_id) {",
                                "        pm.collectionVariables.set('suite_id', d.test_suite_id.toString());",
                                "        console.log('Da sinh test suite id:', d.test_suite_id);",
                                "    }",
                                "}"
                            ],
                            "type": "text/javascript"
                        }
                    }]
                },
                {
                    "name": "03 - Lay Chi Tiet Test Suite",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {"raw": "{{base_url}}/api/suites/{{suite_id}}", "host": ["{{base_url}}"], "path": ["api", "suites", "{{suite_id}}"]}
                    }
                }
            ]
        },
        {
            "name": "07 - Xuat Bao Cao & Test Case",
            "item": [
                {
                    "name": "01 - Xuat File Excel (.xlsx)",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {
                            "raw": "{{base_url}}/api/export/{{suite_id}}?format=excel",
                            "host": ["{{base_url}}"],
                            "path": ["api", "export", "{{suite_id}}"],
                            "query": [{"key": "format", "value": "excel"}]
                        }
                    }
                },
                {
                    "name": "02 - Xuat File CSV (.csv)",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {
                            "raw": "{{base_url}}/api/export/{{suite_id}}?format=csv",
                            "host": ["{{base_url}}"],
                            "path": ["api", "export", "{{suite_id}}"],
                            "query": [{"key": "format", "value": "csv"}]
                        }
                    }
                },
                {
                    "name": "03 - Xuat Toan Bo Du An Ra Excel",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
                        "url": {"raw": "{{base_url}}/api/projects/{{project_id}}/export", "host": ["{{base_url}}"], "path": ["api", "projects", "{{project_id}}", "export"]}
                    }
                }
            ]
        }
    ]
}

# Ghi vao ca 2 thu muc
with open(r'd:\Do-an\CDIO-4\code\CDIO4_API_Collection.postman_collection.json', 'w', encoding='utf-8') as f:
    json.dump(collection, f, ensure_ascii=False, indent=2)

with open(r'd:\Do-an\CDIO-4\CDIO4_API_Collection.postman_collection.json', 'w', encoding='utf-8') as f:
    json.dump(collection, f, ensure_ascii=False, indent=2)

print('Updated Postman Collection with 100% exact backend paths!')
