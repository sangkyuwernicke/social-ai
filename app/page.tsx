"use client";

import { useState } from "react";
import ChatPhase from "@/components/ChatPhase";
import ContentPhase from "@/components/ContentPhase";
import PostPhase from "@/components/PostPhase";
import type { Phase, ChatMessage, Persona, MarketingContent } from "@/lib/types";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("chat");
  const [apiMessages, setApiMessages] = useState<unknown[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [content, setContent] = useState<MarketingContent | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-4 py-5 border-b border-purple-100 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              AI
            </div>
            <div>
              <h1 className="font-semibold text-gray-800 text-sm">소셜 미디어 AI 에이전트</h1>
              <p className="text-xs text-gray-500">페르소나 기반 Instagram 홍보 자료 생성</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {["chat", "review", "done"].map((p, i) => (
                <div
                  key={p}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    phase === p
                      ? "bg-purple-500 scale-125"
                      : ["chat", "review", "done"].indexOf(phase) > i
                      ? "bg-purple-300"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {phase === "chat" && (
            <ChatPhase
              apiMessages={apiMessages}
              chatMessages={chatMessages}
              setApiMessages={setApiMessages}
              setChatMessages={setChatMessages}
              onPersonaReady={(p) => {
                setPersona(p);
                setPhase("review");
              }}
            />
          )}
          {phase === "review" && persona && (
            <ContentPhase
              persona={persona}
              content={content}
              setContent={setContent}
              onApprove={(c) => {
                setContent(c);
                setPhase("done");
              }}
            />
          )}
          {phase === "done" && content && (
            <PostPhase
              content={content}
              onRestart={() => {
                setPhase("chat");
                setApiMessages([]);
                setChatMessages([]);
                setPersona(null);
                setContent(null);
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
