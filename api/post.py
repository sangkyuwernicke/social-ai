from http.server import BaseHTTPRequestHandler
import json
import os


def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }


def _try_instagram_post(image_url: str, caption: str) -> tuple[str, str]:
    """Returns (post_id, reason). reason is empty string on success."""
    access_token = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "").strip()
    account_id = os.environ.get("INSTAGRAM_ACCOUNT_ID", "").strip()

    if not access_token:
        return "simulated_post_id", "INSTAGRAM_ACCESS_TOKEN not set"
    if not account_id:
        return "simulated_post_id", "INSTAGRAM_ACCOUNT_ID not set"
    if not image_url.startswith("http"):
        return "simulated_post_id", f"image_url is not a public URL (starts with: {image_url[:30]})"

    import urllib.request, urllib.parse, urllib.error

    base = "https://graph.facebook.com/v21.0"

    # Create container
    data = urllib.parse.urlencode({
        "image_url": image_url,
        "caption": caption,
        "access_token": access_token,
    }).encode()
    req = urllib.request.Request(f"{base}/{account_id}/media", data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            container_id = json.loads(resp.read())["id"]
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return "simulated_post_id", f"media create failed ({e.code}): {body}"

    # Publish
    data = urllib.parse.urlencode({
        "creation_id": container_id,
        "access_token": access_token,
    }).encode()
    req = urllib.request.Request(f"{base}/{account_id}/media_publish", data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())["id"], ""
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return "simulated_post_id", f"publish failed ({e.code}): {body}"


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
            content = body["content"]

            caption = f"{content['tagline_korean']}\n\n{content['tagline_english']}"
            image_url = content.get("image_url", "")

            post_id, reason = _try_instagram_post(image_url, caption)
            simulated = post_id.startswith("simulated")
            result = {
                "post_id": post_id,
                "simulated": simulated,
                "reason": reason,
                "image_url_preview": image_url[:80],
            }
        except Exception as e:
            import traceback
            result = {
                "post_id": "simulated_post_id",
                "simulated": True,
                "reason": str(e),
                "detail": traceback.format_exc(),
            }

        resp_body = json.dumps(result, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        self.wfile.write(resp_body)
