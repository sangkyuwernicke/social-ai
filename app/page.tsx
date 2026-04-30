"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPhase";
import CanvasPanel from "@/components/ContentPhase";
import type { ChatMessage, Persona, MarketingContent } from "@/lib/types";

const STEPS = [
  { num: "I",   label: "Persona" },
  { num: "II",  label: "Assets"  },
  { num: "III", label: "Review"  },
  { num: "IV",  label: "Posted"  },
];

function stepIndex(phase: string) {
  if (phase === "chat")   return 0;
  if (phase === "review") return 1;
  if (phase === "approve") return 2;
  return 3;
}

export default function Home() {
  const [phase, setPhase] = useState<"chat" | "review" | "done">("chat");
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [apiMessages, setApiMessages] = useState<unknown[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [content, setContent] = useState<MarketingContent | null>(null);

  const currentStep = phase === "chat" ? 0 : phase === "review" ? 2 : 3;

  function handlePersonaReady(p: Persona) {
    setPersona(p);
    setPhase("review");
    setCanvasOpen(true);
  }

  function handleApprove(c: MarketingContent) {
    setContent(c);
    setPhase("done");
  }

  function handleRestart() {
    setPhase("chat");
    setCanvasOpen(false);
    setApiMessages([]);
    setChatMessages([]);
    setPersona(null);
    setContent(null);
  }

  return (
    <div className="shell">
      {/* Top bar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div className="brand-name">Atelier<em>·</em></div>
          <span className="brand-tag">Persona Studio</span>
        </div>

        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div className="step-bar" />}
              <div className={`step ${i === currentStep ? "is-active" : i < currentStep ? "is-done" : ""}`}>
                <span className="step-num">{s.num}</span>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="topbar-right">
          {(phase === "review" || phase === "done") && (
            <button
              className={`icon-btn ${canvasOpen ? "is-on" : ""}`}
              onClick={() => setCanvasOpen((v) => !v)}
            >
              <span className="dot" />
              {canvasOpen ? "Hide Canvas" : "View Canvas"}
            </button>
          )}
        </div>
      </header>

      {/* Workspace */}
      <div className={`workspace ${canvasOpen ? "is-canvas-open" : ""}`}>
        <ChatPanel
          apiMessages={apiMessages}
          chatMessages={chatMessages}
          setApiMessages={setApiMessages}
          setChatMessages={setChatMessages}
          onPersonaReady={handlePersonaReady}
          phase={phase}
        />

        {(phase === "review" || phase === "done") && (
          <CanvasPanel
            persona={persona}
            content={content}
            setContent={setContent}
            phase={phase}
            onApprove={handleApprove}
            onRestart={handleRestart}
          />
        )}

        {/* Floating toggle when canvas closed and persona ready */}
        {(phase === "review" || phase === "done") && !canvasOpen && (
          <button className="float-toggle" onClick={() => setCanvasOpen(true)}>
            <span className="pulse" />
            View Canvas
          </button>
        )}
      </div>
    </div>
  );
}
