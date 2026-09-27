"""
Rule-based Requirement Parser.

Boc tach van ban dac ta yeu cau thanh cac thanh phan co cau truc:
- Actor (nguoi dung / he thong)
- Action (hanh dong chinh)
- Data Fields (truong du lieu) voi kieu, bien, rang buoc
- Preconditions (dieu kien tien quyet)

Ho tro 3 dinh dang:
1. Free text (tu do) - dung regex patterns
2. EARS (Easy Approach to Requirements Syntax)
3. Gherkin (Given-When-Then)
"""

import re
from typing import Optional


# ---------------------------------------------------------------------------
# Regex patterns cho boc tach thong so tu van ban tieng Viet va tieng Anh
# ---------------------------------------------------------------------------

# Nhan dien khoang gia tri so: "tu 18 den 60", "from 18 to 60", "18-60", "between 18 and 60"
RANGE_PATTERNS = [
    # Tieng Viet
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:phai|phải|la|là|co|có)?\s*(?:tu|từ)\s*(?P<min>[\d.]+)\s*(?:den|đến|toi|tới)\s*(?P<max>[\d.]+)',
        re.IGNORECASE | re.UNICODE
    ),
    # English: "from X to Y", "between X and Y"
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:must be|should be|is)?\s*(?:from|between)\s*(?P<min>[\d.]+)\s*(?:to|and)\s*(?P<max>[\d.]+)',
        re.IGNORECASE
    ),
    # Dang ngan: "age: 18-60", "length 8-20"
    re.compile(
        r'(?P<field>[\w\s]+?)\s*[:=]?\s*(?P<min>[\d.]+)\s*[-~]\s*(?P<max>[\d.]+)',
        re.IGNORECASE
    ),
]

# Nhan dien dieu kien don: ">= 18", "<= 100", "> 0", "toi thieu 8", "toi da 20"
SINGLE_BOUND_PATTERNS = [
    # Tieng Viet: "toi thieu X", "it nhat X", "nho nhat X"
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:toi thieu|tối thiểu|it nhat|ít nhất|nho nhat|nhỏ nhất|>=?)\s*(?P<min>[\d.]+)',
        re.IGNORECASE | re.UNICODE
    ),
    # Tieng Viet: "toi da X", "nhieu nhat X", "lon nhat X"
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:toi da|tối đa|nhieu nhat|nhiều nhất|lon nhat|lớn nhất|<=?)\s*(?P<max>[\d.]+)',
        re.IGNORECASE | re.UNICODE
    ),
    # English: "at least X", "minimum X"
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:at least|minimum|min|>=?)\s*(?P<min>[\d.]+)',
        re.IGNORECASE
    ),
    # English: "at most X", "maximum X"
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:at most|maximum|max|<=?)\s*(?P<max>[\d.]+)',
        re.IGNORECASE
    ),
]

# Nhan dien do dai chuoi: "tu 8 den 20 ky tu", "8 to 20 characters"
LENGTH_PATTERNS = [
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:phai|phải)?\s*(?:tu|từ|from|between)\s*(?P<min>\d+)\s*(?:den|đến|to|and)\s*(?P<max>\d+)\s*(?:ky tu|ký tự|characters?|chars?)',
        re.IGNORECASE | re.UNICODE
    ),
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:do dai|độ dài|length)\s*(?:tu|từ|from|between)?\s*(?P<min>\d+)\s*(?:den|đến|to|and|-)\s*(?P<max>\d+)',
        re.IGNORECASE | re.UNICODE
    ),
]

# Nhan dien kieu enum: "la mot trong: A, B, C", "one of: X, Y, Z", "gom: ..."
ENUM_PATTERNS = [
    re.compile(
        r'(?P<field>[\w\s]+?)\s*(?:la mot trong|là một trong|bao gom|bao gồm|one of|includes?|values?)\s*[:\-]?\s*(?P<values>.+)',
        re.IGNORECASE | re.UNICODE
    ),
]

# Nhan dien field co format dac biet
FORMAT_KEYWORDS = {
    'email': r'^[\w.-]+@[\w.-]+\.\w+$',
    'phone': r'^\+?\d{9,15}$',
    'url': r'^https?://[\w.-]+',
    'date': r'^\d{4}-\d{2}-\d{2}$',
    'ip': r'^\d{1,3}(\.\d{1,3}){3}$',
}

# Nhan dien actor
ACTOR_PATTERNS = [
    re.compile(r'(?:nguoi dung|người dùng|user|khach hang|khách hàng|customer|admin|quan tri vien|quản trị viên)', re.IGNORECASE | re.UNICODE),
    re.compile(r'(?:he thong|hệ thống|system|server|application|app)', re.IGNORECASE | re.UNICODE),
]

# Nhan dien dieu kien tien quyet
PRECONDITION_PATTERNS = [
    re.compile(r'(?:khi|KHI|When|WHEN)\s+(.+?)(?:\s*,|\s+thi|thì|then|THEN)', re.IGNORECASE | re.UNICODE),
    re.compile(r'(?:neu|nếu|NẾU|If|IF)\s+(.+?)(?:\s*,|\s+thi|thì|then|THEN)', re.IGNORECASE | re.UNICODE),
    re.compile(r'(?:Given|GIVEN)\s+(.+?)(?:\s+When|WHEN)', re.IGNORECASE),
    re.compile(r'(?:voi dieu kien|với điều kiện|precondition)\s*[:\-]?\s*(.+)', re.IGNORECASE | re.UNICODE),
]


def _clean_field_name(raw: str) -> str:
    """Chuan hoa ten truong: loai bo ky tu thua, title case."""
    cleaned = raw.strip().strip(':=-').strip()
    cleaned = re.sub(r'\s+', ' ', cleaned)
    # Loai bo cac tu khoa thua o dau
    noise_prefixes = [
        'truong', 'trường', 'field', 'the', 'muc', 'mục',
        'gia tri', 'giá trị', 'value of', 'value',
        'so', 'số', 'ma', 'mã', 'ten', 'tên',
    ]
    lower = cleaned.lower()
    for prefix in noise_prefixes:
        if lower.startswith(prefix + ' '):
            cleaned = cleaned[len(prefix):].strip()
            break
    return cleaned.strip()


def _infer_data_type(field_name: str, context: str) -> str:
    """Suy luan kieu du lieu tu ten truong va ngu canh."""
    lower_field = field_name.lower()
    lower_ctx = context.lower()

    # Boolean indicators
    bool_keywords = ['is_', 'has_', 'can_', 'la_', 'co_', 'enable', 'active', 'flag', 'toggle']
    if any(kw in lower_field.replace(' ', '_') for kw in bool_keywords):
        return 'boolean'

    # Date indicators
    date_keywords = ['date', 'ngay', 'ngày', 'time', 'thoi gian', 'birthday', 'sinh nhat']
    if any(kw in lower_field for kw in date_keywords):
        return 'date'

    # Format-based detection
    for fmt_key in FORMAT_KEYWORDS:
        if fmt_key in lower_field or fmt_key in lower_ctx:
            return 'string'

    # String-length context
    if any(kw in lower_ctx for kw in ['ky tu', 'ký tự', 'character', 'chars', 'length', 'do dai', 'độ dài']):
        return 'string'

    # Numeric context
    if any(kw in lower_ctx for kw in ['tuoi', 'tuổi', 'age', 'so luong', 'số lượng', 'quantity', 'amount', 'gia', 'giá', 'price', 'diem', 'điểm', 'score']):
        return 'integer'

    # Default: check if bounds are integers or floats
    nums = re.findall(r'[\d.]+', context)
    if nums:
        if any('.' in n for n in nums):
            return 'float'
        return 'integer'

    return 'string'


def _detect_format(field_name: str, context: str) -> Optional[str]:
    """Detect special format constraint (email, phone, url, date, ip)."""
    combined = (field_name + ' ' + context).lower()
    for fmt_key, pattern in FORMAT_KEYWORDS.items():
        if fmt_key in combined:
            return pattern
    return None


def parse_requirement(raw_text: str) -> dict:
    """
    Parse van ban dac ta yeu cau va tra ve cau truc:
    {
        "title": "...",
        "actor": "...",
        "action": "...",
        "preconditions": [...],
        "parameters": [
            {
                "name": "Age",
                "data_type": "integer",
                "min_value": 18,
                "max_value": 60,
                "min_length": None,
                "max_length": None,
                "enum_values": None,
                "regex_pattern": None,
                "is_required": True,
                "description": "..."
            },
            ...
        ]
    }
    """
    text = raw_text.strip()
    result = {
        "title": "",
        "actor": "",
        "action": "",
        "preconditions": [],
        "parameters": [],
    }

    # --- Extract title (dong dau tien hoac toan bo neu ngan) ---
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if lines:
        result["title"] = lines[0][:200]

    # --- Extract actor ---
    for pattern in ACTOR_PATTERNS:
        match = pattern.search(text)
        if match:
            result["actor"] = match.group(0).strip()
            break

    # --- Extract preconditions ---
    for pattern in PRECONDITION_PATTERNS:
        for match in pattern.finditer(text):
            cond = match.group(1).strip()
            if cond and cond not in result["preconditions"]:
                result["preconditions"].append(cond)

    # --- Extract parameters ---
    seen_fields = set()

    # 1) Tim cac khoang gia tri (range) - uu tien cao nhat
    # Tach cau theo dau cham, cham phay, xuong dong
    raw_sentences = re.split(r'[.;\n]', text)
    # Tiep tuc tach theo lien tu "va", "và", "and", dau phay de co cac clause nho
    sentences = []
    for s in raw_sentences:
        clauses = re.split(r'\s*(?:,\s*|\bva\b|\bvà\b|\band\b)\s*', s.strip(), flags=re.IGNORECASE | re.UNICODE)
        sentences.extend(c.strip() for c in clauses if c.strip())

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        # Do dai chuoi (length constraints)
        for pattern in LENGTH_PATTERNS:
            for match in pattern.finditer(sentence):
                field_name = _clean_field_name(match.group('field'))
                if not field_name or field_name.lower() in seen_fields:
                    continue
                seen_fields.add(field_name.lower())
                result["parameters"].append({
                    "name": field_name,
                    "data_type": "string",
                    "min_value": None,
                    "max_value": None,
                    "min_length": int(match.group('min')),
                    "max_length": int(match.group('max')),
                    "enum_values": None,
                    "regex_pattern": _detect_format(field_name, sentence),
                    "is_required": True,
                    "description": sentence,
                })

        # Khoang gia tri so (numeric range)
        for pattern in RANGE_PATTERNS:
            for match in pattern.finditer(sentence):
                field_name = _clean_field_name(match.group('field'))
                if not field_name or field_name.lower() in seen_fields:
                    continue
                seen_fields.add(field_name.lower())
                dtype = _infer_data_type(field_name, sentence)
                min_val = float(match.group('min'))
                max_val = float(match.group('max'))
                result["parameters"].append({
                    "name": field_name,
                    "data_type": dtype,
                    "min_value": min_val,
                    "max_value": max_val,
                    "min_length": None,
                    "max_length": None,
                    "enum_values": None,
                    "regex_pattern": None,
                    "is_required": True,
                    "description": sentence,
                })

    # 2) Tim enum values (dung raw_sentences vi enum chua dau phay trong danh sach gia tri)
    for sentence in raw_sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        for pattern in ENUM_PATTERNS:
            for match in pattern.finditer(sentence):
                field_name = _clean_field_name(match.group('field'))
                if not field_name or field_name.lower() in seen_fields:
                    continue
                values_str = match.group('values')
                # Tach bang dau phay, dau |, hoac "hoac"/"or"
                values = re.split(r'[,|]|\bhoac\b|\bhoặc\b|\bor\b', values_str)
                values = [v.strip().strip('"\'') for v in values if v.strip()]
                if values:
                    seen_fields.add(field_name.lower())
                    result["parameters"].append({
                        "name": field_name,
                        "data_type": "enum",
                        "min_value": None,
                        "max_value": None,
                        "min_length": None,
                        "max_length": None,
                        "enum_values": values,
                        "regex_pattern": None,
                        "is_required": True,
                        "description": sentence.strip(),
                    })

    # 3) Tim don bien (single bound)
    for sentence in sentences:
        for pattern in SINGLE_BOUND_PATTERNS:
            for match in pattern.finditer(sentence):
                field_name = _clean_field_name(match.group('field'))
                if not field_name or field_name.lower() in seen_fields:
                    continue
                seen_fields.add(field_name.lower())
                groups = match.groupdict()
                min_val = float(groups['min']) if 'min' in groups and groups.get('min') else None
                max_val = float(groups['max']) if 'max' in groups and groups.get('max') else None
                dtype = _infer_data_type(field_name, sentence)
                result["parameters"].append({
                    "name": field_name,
                    "data_type": dtype,
                    "min_value": min_val,
                    "max_value": max_val,
                    "min_length": None,
                    "max_length": None,
                    "enum_values": None,
                    "regex_pattern": None,
                    "is_required": True,
                    "description": sentence.strip(),
                })

    return result
