from http.server import BaseHTTPRequestHandler
import json
import os
import io
import base64
import anthropic


def _format_persona(p: dict) -> str:
    return "\n".join([
        f"페르소나: {p['name']}",
        f"나이대: {p['age_range']}",
        f"직업: {p['occupation']}",
        f"관심사: {', '.join(p['interests'])}",
        f"목표: {', '.join(p['goals'])}",
        f"고민/문제: {', '.join(p['pain_points'])}",
        f"가치관: {', '.join(p['values'])}",
        f"라이프스타일: {p['lifestyle']}",
    ])


def _generate_content(persona: dict) -> dict:
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    prompt = f"""다음 페르소나를 위한 마케팅 홍보 자료를 만들어주세요:

{_format_persona(persona)}

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

    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )

    for block in response.content:
        if block.type == "text":
            text = block.text.strip()
            if "```" in text:
                start = text.find("{")
                end = text.rfind("}") + 1
                text = text[start:end]
            return json.loads(text)

    raise ValueError("콘텐츠 생성 실패")


def _generate_image(prompt: str) -> str:
    """Returns a DALL-E URL (if configured) or a base64 data URL placeholder."""
    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            return response.data[0].url
        except Exception:
            pass

    return _placeholder_image(prompt)


def _placeholder_image(prompt: str) -> str:
    try:
        from PIL import Image, ImageDraw, ImageFont

        width, height = 1080, 1080
        img = Image.new("RGB", (width, height))
        draw = ImageDraw.Draw(img)

        for y in range(height):
            r = int(250 - (y / height) * 30)
            g = int(240 - (y / height) * 40)
            b = int(225 - (y / height) * 20)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        draw.ellipse([30, 30, 280, 280], outline=(210, 185, 160), width=4)
        draw.ellipse([800, 800, 1050, 1050], outline=(210, 185, 160), width=4)
        draw.ellipse([400, 200, 680, 480], outline=(220, 195, 170), width=2)

        try:
            font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
            font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
        except OSError:
            font_title = ImageFont.load_default()
            font_body = font_title
            font_small = font_title

        draw.text((width // 2, 520), "Instagram Photo", font=font_title, fill=(70, 50, 35), anchor="mm")
        draw.text((width // 2, 580), "[AI Generated Placeholder]", font=font_small, fill=(130, 105, 85), anchor="mm")

        words = prompt.split()
        lines, current = [], []
        for word in words:
            current.append(word)
            if len(" ".join(current)) > 48:
                lines.append(" ".join(current[:-1]))
                current = [word]
        if current:
            lines.append(" ".join(current))

        for i, line in enumerate(lines[:5]):
            alpha = max(90, 140 - i * 10)
            draw.text(
                (width // 2, 640 + i * 34),
                line,
                font=font_body,
                fill=(alpha, alpha - 20, alpha - 40),
                anchor="mm",
            )

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        b64 = base64.b64encode(buf.getvalue()).decode()
        return f"data:image/jpeg;base64,{b64}"

    except ImportError:
        # Minimal SVG placeholder
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">'
            '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0%" stop-color="#faf0e6"/>'
            '<stop offset="100%" stop-color="#f0d8d8"/>'
            '</linearGradient></defs>'
            '<rect width="1080" height="1080" fill="url(#g)"/>'
            '<text x="540" y="520" font-size="48" text-anchor="middle" fill="#4a3728">Instagram Photo</text>'
            '<text x="540" y="590" font-size="24" text-anchor="middle" fill="#8a6555">[AI Generated Placeholder]</text>'
            '</svg>'
        )
        b64 = base64.b64encode(svg.encode()).decode()
        return f"data:image/svg+xml;base64,{b64}"


def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }


class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(content_length))
            persona = body["persona"]

            content = _generate_content(persona)
            image_url = _generate_image(content["image_prompt"])

            result = {
                "tagline_korean": content["tagline_korean"],
                "tagline_english": content["tagline_english"],
                "image_prompt": content["image_prompt"],
                "image_url": image_url,
            }
            status = 200
        except Exception as e:
            import traceback
            result = {"error": str(e), "detail": traceback.format_exc()}
            status = 500

        resp_body = json.dumps(result, ensure_ascii=False).encode("utf-8")

        self.send_response(status)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        self.wfile.write(resp_body)
