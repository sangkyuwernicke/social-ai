"use client";

import type { MarketingContent } from "@/lib/types";

interface Props {
  content: MarketingContent;
  onRestart: () => void;
}

export default function PostPhase({ content, onRestart }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
      {/* Success banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 text-white text-center mb-6 shadow-lg">
        <div className="text-3xl mb-2">✨</div>
        <p className="font-semibold text-lg">작업이 완료되었습니다!</p>
        <p className="text-sm text-purple-100 mt-1">Instagram 포스팅이 시뮬레이션되었습니다</p>
      </div>

      {/* Instagram mockup */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 mb-6">
        {/* IG header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <div>
            <p className="text-sm font-semibold text-gray-800">your_brand</p>
            <p className="text-xs text-gray-400">지금 방금</p>
          </div>
          <div className="ml-auto">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
        </div>

        {/* Image */}
        <div className="aspect-square bg-gray-50">
          <img
            src={content.image_url}
            alt="Instagram post"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Actions */}
        <div className="px-4 py-3">
          <div className="flex gap-4 mb-3">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-semibold">your_brand</span>{" "}
            {content.tagline_korean}
          </p>
          <p className="text-sm text-gray-500 mt-1 italic">{content.tagline_english}</p>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">시뮬레이션 모드:</span>{" "}
          실제 Instagram 업로드를 위해서는 .env에{" "}
          <code className="bg-amber-100 px-1 rounded">INSTAGRAM_ACCESS_TOKEN</code>과{" "}
          <code className="bg-amber-100 px-1 rounded">INSTAGRAM_ACCOUNT_ID</code>를 설정하고,
          공개 접근 가능한 이미지 URL이 필요합니다.
        </p>
      </div>

      <button
        onClick={onRestart}
        className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all"
      >
        새 페르소나로 다시 시작하기
      </button>
    </div>
  );
}
