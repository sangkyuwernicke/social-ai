from http.server import BaseHTTPRequestHandler
import json
import os
import anthropic

SYSTEM_PROMPT = """당신은 마케팅 페르소나 리서처입니다. 사용자와 자연스러운 대화를 통해 가상의 타겟 페르소나를 구축합니다.

페르소나 구축에 필요한 정보:
1. 이름/타입 (예: "30대 직장인 지현", "새내기 워킹맘")
2. 나이대
3. 직업
4. 주요 관심사 3~5가지
5. 목표 및 열망 2~3가지
6. 고민 및 문제점 2~3가지
7. 가치관 2~3가지
8. 라이프스타일 특성

규칙:
- 자연스러운 대화체로 질문하세요
- 한 번에 1~2개 질문만 하세요
- 사용자의 답변에 공감하며 더 깊은 정보를 이끌어내세요
- 충분한 정보가 수집되면 (최소 5~6가지 항목) submit_persona 툴을 호출하세요
- 모든 대화는 한국어로 진행하세요"""

SUBMIT_PERSONA_TOOL = {
    "name": "submit_persona",
    "description": "충분한 정보가 수집되었을 때 페르소나를 완성하여 제출합니다.",
    "input_schema": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "페르소나 이름 또는 타입"},
            "age_range": {"type": "string", "description": "나이대"},
            "occupation": {"type": "string", "description": "직업"},
            "interests": {"type": "array", "items": {"type": "string"}, "description": "주요 관심사 목록"},
            "goals": {"type": "array", "items": {"type": "string"}, "description": "목표 및 열망 목록"},
            "pain_points": {"type": "array", "items": {"type": "string"}, "description": "고민 및 문제점 목록"},
            "values": {"type": "array", "items": {"type": "string"}, "description": "가치관 목록"},
            "lifestyle": {"type": "string", "description": "라이프스타일 특성 설명"},
        },
        "required": ["name", "age_range", "occupation", "interests", "goals", "pain_points", "values", "lifestyle"],
    },
}


def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }


class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass  # suppress default logging

    def do_OPTIONS(self):
        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def do_POST(self):
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        initial_messages = [{"role": "user", "content": "안녕하세요, 시작합니다."}]

        response = client.messages.create(
            model="claude-opus-4-7",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=[SUBMIT_PERSONA_TOOL],
            messages=initial_messages,
        )

        greeting = ""
        content_dicts = []
        for block in response.content:
            d = block.model_dump()
            content_dicts.append(d)
            if block.type == "text":
                greeting = block.text

        initial_messages.append({"role": "assistant", "content": content_dicts})

        result = {"messages": initial_messages, "greeting": greeting}
        body = json.dumps(result, ensure_ascii=False).encode("utf-8")

        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
