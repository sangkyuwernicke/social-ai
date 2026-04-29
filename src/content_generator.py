import json
import anthropic
from dataclasses import dataclass
from .persona import Persona


@dataclass
class MarketingContent:
    tagline_korean: str
    tagline_english: str
    image_prompt: str


class ContentGenerator:
    def __init__(self):
        self.client = anthropic.Anthropic()

    def generate(self, persona: Persona) -> MarketingContent:
        prompt = f"""다음 페르소나를 위한 마케팅 홍보 자료를 만들어주세요:

{persona.to_description()}

아래 형식의 JSON으로만 응답해주세요 (다른 텍스트 없이):
{{
    "tagline_korean": "이 페르소나를 강하게 설득할 수 있는 한 줄의 한국어 홍보 문구",
    "tagline_english": "같은 내용의 영어 홍보 문구",
    "image_prompt": "인스타그램 사진 생성을 위한 상세한 영문 프롬프트. 페르소나의 라이프스타일, 감성, 분위기를 담아주세요."
}}

홍보 문구 작성 기준:
- 페르소나의 핵심 고민이나 욕구를 건드릴 것
- 감정적으로 공감되는 언어 사용
- 간결하고 기억에 남을 것
- 너무 직접적인 광고 문구는 피할 것"""

        response = self.client.messages.create(
            model="claude-opus-4-7",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )

        for block in response.content:
            if block.type == "text":
                text = block.text.strip()
                # Extract JSON if wrapped in code blocks
                if "```" in text:
                    start = text.find("{")
                    end = text.rfind("}") + 1
                    text = text[start:end]
                data = json.loads(text)
                return MarketingContent(
                    tagline_korean=data["tagline_korean"],
                    tagline_english=data["tagline_english"],
                    image_prompt=data["image_prompt"],
                )

        raise ValueError("콘텐츠 생성에 실패했습니다.")
