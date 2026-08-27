import re

class PHIRedactor:
    def __init__(self):
        # 电话号码匹配规则 (支持常见的国际格式、7-11位数字组合)
        self.phone_pattern = re.compile(r"(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}")
        # 身份证/IC/ID 匹配规则 (支持常见字母开头及数字组合)
        self.id_pattern = re.compile(r"\b[A-Z]{1,2}\d{6,9}[A-Z0-9]?\b", re.IGNORECASE)
        # 常见的英文/中文姓名标识词辅助正则 (如 Patient: Name, Mr./Ms. X)
        self.name_label_pattern = re.compile(r"(?:Patient Name|Name|Patient):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)", re.IGNORECASE)

    def redact(self, text: str) -> str:
        if not text:
            return ""

        redacted = text

        # 1. 脱敏明确标记的姓名
        redacted = self.name_label_pattern.sub(r"\1: [REDACTED_NAME]", redacted)

        # 2. 脱敏身份证 / IC / ID
        redacted = self.id_pattern.sub("[REDACTED_ID]", redacted)

        # 3. 脱敏电话号码
        redacted = self.phone_pattern.sub("[REDACTED_PHONE]", redacted)

        return redacted

# 单例导出
redactor = PHIRedactor()

