from http.server import BaseHTTPRequestHandler
import json
import os
import io
import base64


def _generate_image(base_prompt: str, extra_prompt: str) -> str:
    combined = f"{base_prompt}. {extra_prompt}".strip(". ") if extra_prompt else base_prompt

    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=openai_key)
            response = client.images.generate(
                model="dall-e-3",
                prompt=combined,
                size="1024x1024",
                quality="standard",
                n=1,
            )
            return response.data[0].url, combined
        except Exception as e:
            pass

    return _placeholder(combined), combined


def _placeholder(prompt: str) -> str:
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

        try:
            font_t = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
            font_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
        except OSError:
            font_t = ImageFont.load_default()
            font_b = font_t

        draw.text((width // 2, 520), "Instagram Photo", font=font_t, fill=(70, 50, 35), anchor="mm")

        words = prompt.split()
        lines, cur = [], []
        for w in words:
            cur.append(w)
            if len(" ".join(cur)) > 48:
                lines.append(" ".join(cur[:-1]))
                cur = [w]
        if cur:
            lines.append(" ".join(cur))
        for i, line in enumerate(lines[:5]):
            alpha = max(90, 140 - i * 10)
            draw.text((width // 2, 580 + i * 34), line, font=font_b, fill=(alpha, alpha - 20, alpha - 40), anchor="mm")

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    except ImportError:
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="1080" height="1080" fill="#faf0e6"/><text x="540" y="540" font-size="40" text-anchor="middle" fill="#4a3728">Placeholder</text></svg>'
        return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


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
            base_prompt = body.get("image_prompt", "")
            extra_prompt = body.get("extra_prompt", "").strip()

            image_url, used_prompt = _generate_image(base_prompt, extra_prompt)
            result = {"image_url": image_url, "used_prompt": used_prompt}
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
