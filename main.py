"""
소셜 미디어 AI 에이전트
- 사용자와 대화로 타겟 페르소나를 구축합니다
- 페르소나 맞춤 홍보 자료(문구 + 이미지)를 생성합니다
- 사용자 승인 후 Instagram에 게시합니다
"""

import os
from dotenv import load_dotenv

load_dotenv()

from src.agent import PersonaAgent
from src.content_generator import ContentGenerator, MarketingContent
from src.image_generator import generate_image
from src.instagram import InstagramPoster
from src.persona import Persona


def _divider(title: str = "") -> None:
    print("\n" + "═" * 58)
    if title:
        print(f"  {title}")
        print("═" * 58)


def _show_content(content: MarketingContent, image_path: str) -> None:
    _divider("📢 생성된 홍보 자료")
    print(f"\n🇰🇷 한국어 홍보 문구:")
    print(f"   {content.tagline_korean}")
    print(f"\n🇺🇸 English Tagline:")
    print(f"   {content.tagline_english}")
    print(f"\n🖼️  생성된 이미지: {image_path}")
    print()


def build_persona() -> Persona:
    """대화를 통해 타겟 페르소나를 구축합니다."""
    _divider("🎭 페르소나 구축")
    print("\n타겟 페르소나를 만들기 위해 몇 가지 질문을 드리겠습니다.")
    print("자유롭게 대화하며 정보를 공유해주세요.\n")

    agent = PersonaAgent()

    greeting = agent.start()
    print(f"🤖 AI: {greeting}\n")

    while True:
        try:
            user_input = input("👤 나: ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            raise

        if not user_input:
            continue

        print()
        response, persona = agent.chat(user_input)

        if response:
            print(f"🤖 AI: {response}\n")

        if persona:
            _divider("✅ 페르소나 완성!")
            print("\n수집된 페르소나 정보:")
            print(persona.to_description())
            return persona


def generate_content(persona: Persona) -> tuple[MarketingContent, str]:
    """페르소나를 위한 홍보 자료를 생성합니다."""
    _divider("⚙️  홍보 자료 생성 중...")
    print("\n잠시만 기다려주세요...\n")

    generator = ContentGenerator()
    content = generator.generate(persona)
    print("📝 홍보 문구 생성 완료!")

    print("🎨 인스타그램 이미지 생성 중...")
    image_path = generate_image(content.image_prompt)
    print(f"✅ 이미지 생성 완료: {image_path}")

    return content, image_path


def approval_loop(persona: Persona) -> tuple[MarketingContent, str] | tuple[None, None]:
    """사용자가 승인할 때까지 홍보 자료를 재생성합니다."""
    content, image_path = generate_content(persona)

    while True:
        _show_content(content, image_path)

        print("이 홍보 자료가 마음에 드시나요?")
        print("  1. 👍 마음에 들어요 → Instagram에 올리기")
        print("  2. 🔄 다시 만들어주세요")
        print("  3. ❌ 취소")

        try:
            choice = input("\n선택 (1/2/3): ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return None, None

        if choice == "1":
            return content, image_path
        elif choice == "2":
            print("\n새로운 홍보 자료를 만들겠습니다...")
            content, image_path = generate_content(persona)
        elif choice == "3":
            print("\n작업을 취소했습니다.")
            return None, None
        else:
            print("1, 2, 3 중에서 선택해주세요.")


def post_to_instagram(content: MarketingContent, image_path: str) -> None:
    """승인된 홍보 자료를 Instagram에 게시합니다."""
    _divider("📱 Instagram 업로드")

    caption = f"{content.tagline_korean}\n\n{content.tagline_english}"
    poster = InstagramPoster()

    try:
        post_id = poster.post(image_path, caption)
        if poster.is_configured() and not post_id.startswith("simulated"):
            print(f"\n✅ Instagram 업로드 완료! 포스트 ID: {post_id}")
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Instagram 업로드 실패: {e}")
        print(f"아래 내용을 수동으로 업로드해주세요.\n캡션:\n{caption}")


def main() -> None:
    _divider("🎯 소셜 미디어 AI 에이전트")
    print("\n  페르소나 기반 Instagram 홍보 자료 자동 생성")

    try:
        persona = build_persona()
        content, image_path = approval_loop(persona)

        if content is None:
            print("\n프로그램을 종료합니다.\n")
            return

        post_to_instagram(content, image_path)

        _divider("✨ 작업이 완료되었습니다!")
        print()

    except KeyboardInterrupt:
        print("\n\n프로그램이 중단되었습니다.\n")


if __name__ == "__main__":
    import requests  # noqa: F401 – ensure requests is importable for post_to_instagram
    main()
