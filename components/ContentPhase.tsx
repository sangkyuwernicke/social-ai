"use client";

import { useEffect, useState } from "react";
import type { Persona, MarketingContent } from "@/lib/types";

interface Props {
  persona: Persona | null;
  content: MarketingContent | null;
  phase: "review" | "done";
  setContent: (c: MarketingContent) => void;
  onApprove: (c: MarketingContent) => void;
  onRestart: () => void;
}

export default function CanvasPanel({ persona, content, phase, setContent, onApprove, onRestart }: Props) {
  const [tab, setTab] = useState<"persona" | "creative">("persona");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (phase === "review" && !content) {
      generateContent();
    }
  }, [phase]);

  useEffect(() => {
    if (content) setTab("creative");
  }, [content]);

  async function generateContent() {
    if (!persona) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContent(data);
    } catch {
      setError("생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!content) return;
    setPosting(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      onApprove({ ...content, simulated: data.simulated ?? true, post_id: data.post_id, post_reason: data.reason });
    } catch {
      onApprove({ ...content, simulated: true });
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="canvas-panel">
      {/* Head */}
      <div className="canvas-head">
        <div className="title">
          <h2>Canvas<em>·</em></h2>
          <span className="sub">
            {phase === "done" ? "Posted" : loading ? "Generating…" : "Ready"}
          </span>
        </div>
        <div className="actions">
          <button
            className={`canvas-tab ${tab === "persona" ? "is-active" : ""}`}
            onClick={() => setTab("persona")}
          >
            Persona
          </button>
          <button
            className={`canvas-tab ${tab === "creative" ? "is-active" : ""}`}
            onClick={() => setTab("creative")}
          >
            Creative
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="canvas-body">
        {tab === "persona" && persona && (
          <PersonaCard persona={persona} />
        )}

        {tab === "creative" && (
          <>
            {loading && !content && (
              <div className="canvas-empty">
                <div className="glyph">✦</div>
                <div className="t">홍보 자료 생성 중</div>
                <div className="s">문구와 이미지를 만들고 있습니다…</div>
              </div>
            )}
            {error && (
              <div className="canvas-empty">
                <div className="t" style={{ color: "var(--rouge)" }}>생성 실패</div>
                <div className="s">{error}</div>
                <button className="tlbtn primary" style={{ marginTop: 16 }} onClick={generateContent}>
                  다시 시도
                </button>
              </div>
            )}
            {content && (
              <>
                {/* Copy block */}
                <div className="canvas-section">
                  <div className="section-head">
                    <div className="t"><span className="num">01</span> Copy<em> ·</em></div>
                    <span className="meta">Bilingual</span>
                  </div>
                  <div className="copy-block">
                    <div className="copy-lang">한국어</div>
                    <p className="copy-ko">{content.tagline_korean}</p>
                    <div className="copy-divider" />
                    <div className="copy-lang">English</div>
                    <p className="copy-en">{content.tagline_english}</p>
                  </div>
                </div>

                {/* Instagram visual */}
                <div className="canvas-section">
                  <div className="section-head">
                    <div className="t"><span className="num">02</span> Visual<em> ·</em></div>
                    <span className="meta">Instagram</span>
                  </div>
                  <div className="ig-frame">
                    <div className="ig-head">
                      <div className="av"><div className="inner">A</div></div>
                      <div className="who">atelier.studio</div>
                      <div className="more">···</div>
                    </div>
                    <div className="ig-image">
                      {content.image_url ? (
                        content.image_url.startsWith("data:") || content.image_url.startsWith("http") ? (
                          <img
                            src={content.image_url}
                            alt="Generated"
                            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
                          />
                        ) : (
                          <ArtPlaceholder tagline={content.tagline_english} />
                        )
                      ) : (
                        <ArtPlaceholder tagline="" loading />
                      )}
                    </div>
                    <div className="ig-actions">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>
                      <svg width="20" height="20" className="bookmark" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                    </div>
                    <div className="ig-caption">
                      <b>atelier.studio</b> {content.tagline_korean}
                    </div>
                    <div className="ig-when">방금 전</div>
                  </div>
                </div>

                {/* Approval / Posted */}
                {phase === "done" ? (
                  <div className="posted fade-in">
                    <div className="glyph">{content.simulated ? "◎" : "✓"}</div>
                    <div className="t">{content.simulated ? "시뮬레이션 완료" : "Instagram 게시 완료"}</div>
                    <div className="s">
                      {content.simulated
                        ? (content.post_reason || "자격증명을 확인하세요")
                        : `Post ID: ${content.post_id ?? "—"}`}
                    </div>
                  </div>
                ) : (
                  <div className="approval-bar">
                    <div className="t">
                      이 자료를 게시할까요?
                      <small>Approve to post on Instagram</small>
                    </div>
                    <button
                      className="btn btn-ghost"
                      onClick={generateContent}
                      disabled={loading || posting}
                    >
                      다시 생성
                    </button>
                    <button
                      className="btn btn-gold"
                      onClick={handleApprove}
                      disabled={posting}
                    >
                      {posting ? "게시 중…" : "게시하기"}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="canvas-toolbar">
        <div className="left">
          <span className="live" />
          Live preview
        </div>
        {phase === "done" && (
          <button className="tlbtn" onClick={onRestart}>
            새 페르소나
          </button>
        )}
        {phase === "review" && content && !loading && (
          <button className="tlbtn primary" onClick={handleApprove} disabled={posting}>
            {posting ? "게시 중…" : "승인 → 게시"}
          </button>
        )}
      </div>
    </div>
  );
}

function ArtPlaceholder({ tagline, loading = false }: { tagline: string; loading?: boolean }) {
  return (
    <div className={`ig-art ${loading ? "is-loading" : ""}`}>
      <div className="gridlines" />
      <div className="label-cap">Atelier · Studio</div>
      <div className="seal">A</div>
      {loading ? (
        <div className="headline">Generating…</div>
      ) : (
        <>
          <div className="headline">
            <em>{tagline}</em>
          </div>
          <div className="footer">
            <span>Instagram</span>
            <span>atelier.studio</span>
          </div>
        </>
      )}
    </div>
  );
}

function PersonaCard({ persona }: { persona: Persona }) {
  const initials = persona.name.charAt(0).toUpperCase();
  return (
    <div className="persona-card">
      <div className="persona-head">
        <div className="persona-portrait">{initials}</div>
        <div>
          <div className="persona-name">{persona.name}<em>·</em></div>
          <div className="persona-role">{persona.age_range} · {persona.occupation}</div>
        </div>
      </div>
      <div className="persona-attrs">
        <div className="attr">
          <div className="k">라이프스타일</div>
          <div className="v serif">{persona.lifestyle}</div>
        </div>
        <div className="attr">
          <div className="k">핵심 고민</div>
          <div className="v">{persona.pain_points[0] ?? "—"}</div>
        </div>
        <div className="attr">
          <div className="k">주요 목표</div>
          <div className="v">{persona.goals[0] ?? "—"}</div>
        </div>
        <div className="attr">
          <div className="k">가치관</div>
          <div className="v">{persona.values[0] ?? "—"}</div>
        </div>
      </div>
      <div className="persona-quote">
        <span className="q">{persona.pain_points[1] ?? persona.goals[0] ?? "—"}</span>
        <span className="a">{persona.name}</span>
      </div>
      <div className="chips">
        {persona.interests.map((t) => (
          <span key={t} className="chip gold">{t}</span>
        ))}
        {persona.values.map((t) => (
          <span key={t} className="chip">{t}</span>
        ))}
      </div>
    </div>
  );
}
