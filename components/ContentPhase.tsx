"use client";

import { useEffect, useState } from "react";
import type { Persona, MarketingContent } from "@/lib/types";

interface Props {
  persona: Persona;
  content: MarketingContent | null;
  setContent: (c: MarketingContent) => void;
  onApprove: (c: MarketingContent) => void;
}

export default function ContentPhase({ persona, content, setContent, onApprove }: Props) {
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!content) {
      generateContent();
    }
  }, []);

  async function generateContent() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona }),
      });
      if (!res.ok) throw new Error("생성 실패");
      const data = await res.json();
      setContent(data);
    } catch {
      setError("홍보 자료 생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!content) return;
    setPosting(true);
    try {
      await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
    } catch {
      // Continue even if post fails — simulation always succeeds
    } finally {
      setPosting(false);
      onApprove(content!);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
      {/* Persona summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-100">
        <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-2">완성된 페르소나</p>
        <p className="font-semibold text-gray-800">{persona.name}</p>
        <p className="text-sm text-gray-500">{persona.age_range} · {persona.occupation}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {persona.interests.slice(0, 4).map((i) => (
            <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
              {i}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
          <p className="text-sm text-gray-500">홍보 자료를 생성하는 중...</p>
          <p className="text-xs text-gray-400">문구와 이미지를 만들고 있습니다</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 rounded-2xl p-6 text-center">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={generateContent}
            className="text-sm text-purple-600 font-medium underline"
          >
            다시 시도
          </button>
        </div>
      ) : content ? (
        <>
          {/* Generated image */}
          <div className="rounded-2xl overflow-hidden shadow-md aspect-square bg-gray-100">
            <img
              src={content.image_url}
              alt="Generated Instagram image"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Taglines */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 space-y-4">
            <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide">생성된 홍보 문구</p>
            <div>
              <p className="text-xs text-gray-400 mb-1">한국어</p>
              <p className="text-gray-800 font-medium leading-relaxed">
                &ldquo;{content.tagline_korean}&rdquo;
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">English</p>
              <p className="text-gray-600 leading-relaxed italic">
                &ldquo;{content.tagline_english}&rdquo;
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pb-6">
            <button
              onClick={handleApprove}
              disabled={posting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-60"
            >
              {posting ? "Instagram에 올리는 중..." : "마음에 들어요 — Instagram에 올리기"}
            </button>
            <button
              onClick={generateContent}
              disabled={loading || posting}
              className="w-full py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-40"
            >
              다시 만들어주세요
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
