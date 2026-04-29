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


def _try_instagram_post(image_url: str, caption: str) -> str:
    access_token = os.environ.get("INSTAGRAM_ACCESS_TOKEN")
    account_id = os.environ.get("INSTAGRAM_ACCOUNT_ID")

    if not (access_token and account_id):
        return "simulated_post_id"

    if not image_url.startswith("http"):
        return "simulated_post_id"

    import urllib.request, urllib.parse

    base = "https://graph.facebook.com/v21.0"

    # Create container
    data = urllib.parse.urlencode({
        "image_url": image_url,
        "caption": caption,
        "access_token": access_token,
    }).encode()
    req = urllib.request.Request(f"{base}/{account_id}/media", data=data, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        container_id = json.loads(resp.read())["id"]

    # Publish
    data = urllib.parse.urlencode({
        "creation_id": container_id,
        "access_token": access_token,
    }).encode()
    req = urllib.request.Request(f"{base}/{account_id}/media_publish", data=data, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())["id"]


class handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_length))
        content = body["content"]

        caption = f"{content['tagline_korean']}\n\n{content['tagline_english']}"
        image_url = content.get("image_url", "")

        try:
            post_id = _try_instagram_post(image_url, caption)
            simulated = post_id.startswith("simulated")
        except Exception:
            post_id = "simulated_post_id"
            simulated = True

        result = {"post_id": post_id, "simulated": simulated}
        resp_body = json.dumps(result).encode("utf-8")

        self.send_response(200)
        for k, v in _cors_headers().items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        self.wfile.write(resp_body)
