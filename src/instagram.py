import os
import requests


class InstagramPoster:
    """Instagram Graph API를 통해 이미지를 업로드합니다."""

    BASE_URL = "https://graph.facebook.com/v21.0"

    def __init__(self):
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
        self.account_id = os.getenv("INSTAGRAM_ACCOUNT_ID")

    def is_configured(self) -> bool:
        return bool(self.access_token and self.account_id)

    def post(self, image_path: str, caption: str) -> str:
        """이미지를 Instagram에 업로드합니다. 포스트 ID를 반환합니다."""
        if not self.is_configured():
            return self._simulate_post(image_path, caption)

        # Instagram Graph API는 공개 URL이 필요합니다
        if not image_path.startswith("http"):
            print("\n⚠️  Instagram API는 공개 접근 가능한 이미지 URL이 필요합니다.")
            print("   로컬 이미지를 공개 서버에 업로드한 후 URL을 사용하세요.")
            return self._simulate_post(image_path, caption)

        return self._create_and_publish(image_path, caption)

    def _create_and_publish(self, image_url: str, caption: str) -> str:
        # 1단계: 미디어 컨테이너 생성
        container_url = f"{self.BASE_URL}/{self.account_id}/media"
        container_resp = requests.post(
            container_url,
            data={
                "image_url": image_url,
                "caption": caption,
                "access_token": self.access_token,
            },
            timeout=30,
        )
        container_resp.raise_for_status()
        container_id = container_resp.json()["id"]

        # 2단계: 게시
        publish_url = f"{self.BASE_URL}/{self.account_id}/media_publish"
        publish_resp = requests.post(
            publish_url,
            data={
                "creation_id": container_id,
                "access_token": self.access_token,
            },
            timeout=30,
        )
        publish_resp.raise_for_status()
        return publish_resp.json()["id"]

    def _simulate_post(self, image_path: str, caption: str) -> str:
        print("\n" + "─" * 56)
        print("📱 Instagram 포스팅 시뮬레이션")
        print("─" * 56)
        print(f"🖼️  이미지: {image_path}")
        print(f"\n📝 캡션:\n{caption}")
        print("─" * 56)
        print("✅ 시뮬레이션 완료!")
        if not self.is_configured():
            print("\n💡 실제 업로드를 위해 .env에 Instagram 자격증명을 설정하세요:")
            print("   INSTAGRAM_ACCESS_TOKEN=...")
            print("   INSTAGRAM_ACCOUNT_ID=...")
        return "simulated_post_id"
