import os
import requests
from pathlib import Path

OUTPUT_DIR = Path("output")


def generate_image(prompt: str, filename: str = "instagram_image.jpg") -> str:
    """이미지를 생성하고 로컬 경로를 반환합니다."""
    OUTPUT_DIR.mkdir(exist_ok=True)
    output_path = str(OUTPUT_DIR / filename)

    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            return _generate_dalle(prompt, output_path, openai_key)
        except Exception as e:
            print(f"\n⚠️  DALL-E 이미지 생성 실패: {e}")
            print("   플레이스홀더 이미지로 대체합니다.")

    return _generate_placeholder(prompt, output_path)


def _generate_dalle(prompt: str, output_path: str, api_key: str) -> str:
    from openai import OpenAI

    client = OpenAI(api_key=api_key)
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url
    img_response = requests.get(image_url, timeout=60)
    img_response.raise_for_status()

    with open(output_path, "wb") as f:
        f.write(img_response.content)

    return output_path


def _generate_placeholder(prompt: str, output_path: str) -> str:
    """PIL로 플레이스홀더 이미지를 생성합니다."""
    try:
        from PIL import Image, ImageDraw, ImageFont

        width, height = 1080, 1080
        img = Image.new("RGB", (width, height))

        # Gradient background: warm cream to light rose
        draw = ImageDraw.Draw(img)
        for y in range(height):
            r = int(250 - (y / height) * 30)
            g = int(240 - (y / height) * 40)
            b = int(225 - (y / height) * 20)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Decorative circles
        draw.ellipse([30, 30, 280, 280], outline=(210, 185, 160), width=4)
        draw.ellipse([800, 800, 1050, 1050], outline=(210, 185, 160), width=4)
        draw.ellipse([400, 200, 680, 480], outline=(220, 195, 170), width=2)

        # Load fonts
        try:
            font_title = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42
            )
            font_body = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22
            )
            font_small = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18
            )
        except OSError:
            font_title = ImageFont.load_default()
            font_body = font_title
            font_small = font_title

        # Title
        title = "Instagram Photo"
        draw.text((width // 2, 520), title, font=font_title, fill=(70, 50, 35), anchor="mm")

        # Subtitle
        subtitle = "[AI Generated Placeholder]"
        draw.text((width // 2, 580), subtitle, font=font_small, fill=(130, 105, 85), anchor="mm")

        # Wrap and display prompt excerpt
        words = prompt.split()
        lines, current = [], []
        for word in words:
            current.append(word)
            if len(" ".join(current)) > 48:
                lines.append(" ".join(current[:-1]))
                current = [word]
        if current:
            lines.append(" ".join(current))

        y_start = 640
        for i, line in enumerate(lines[:5]):
            alpha = max(90, 140 - i * 10)
            draw.text(
                (width // 2, y_start + i * 34),
                line,
                font=font_body,
                fill=(alpha, alpha - 20, alpha - 40),
                anchor="mm",
            )

        img.save(output_path, "JPEG", quality=95)

    except ImportError:
        # PIL not available: create a minimal binary placeholder
        import struct, zlib

        # 1×1 white pixel PNG
        png_header = b"\x89PNG\r\n\x1a\n"
        ihdr = struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)
        ihdr_chunk = _png_chunk(b"IHDR", ihdr)
        raw_data = b"\x00\xff\xff\xff"
        idat_chunk = _png_chunk(b"IDAT", zlib.compress(raw_data))
        iend_chunk = _png_chunk(b"IEND", b"")
        output_path = output_path.replace(".jpg", ".png")
        with open(output_path, "wb") as f:
            f.write(png_header + ihdr_chunk + idat_chunk + iend_chunk)

    return output_path


def _png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    import struct, zlib

    chunk = chunk_type + data
    return struct.pack(">I", len(data)) + chunk + struct.pack(">I", zlib.crc32(chunk) & 0xFFFFFFFF)
