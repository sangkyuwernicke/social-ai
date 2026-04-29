"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Persona } from "@/lib/types";

interface Props {
  apiMessages: unknown[];
  chatMessages: ChatMessage[];
  setApiMessages: (msgs: unknown[]) => void;
  setChatMessages: (msgs: ChatMessage[]) => void;
  onPersonaReady: (persona: Persona) => void;
}

export default function ChatPhase({
  apiMessages,
  chatMessages,
  setApiMessages,
  setChatMessages,
  onPersonaReady,
}: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      initChat();
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  async function initChat() {
    setLoading(true);
    try {
      const res = await fetch("/api/start", { method: "POST" });
      const data = await res.json();
      setApiMessages(data.messages);
      setChatMessages([{ role: "assistant", text: data.greeting }]);
    } catch {
      setChatMessages([{ role: "assistant", text: "연결에 실패했습니다. 페이지를 새로고침해 주세요." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newChat: ChatMessage[] = [...chatMessages, { role: "user", text }];
    setChatMessages(newChat);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, user_message: text }),
      });
      const data = await res.json();
      setApiMessages(data.messages);

      const updated: ChatMessage[] = [...newChat];
      if (data.response) {
        updated.push({ role: "assistant", text: data.response });
      }
      setChatMessages(updated);

      if (data.persona) {
        setTimeout(() => onPersonaReady(data.persona), 800);
      }
    } catch {
      setChatMessages([...newChat, { role: "assistant", text: "오류가 발생했습니다. 다시 시도해 주세요." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">
                AI
              </div>
            )}
            <div
              className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-tr-sm"
                  : "bg-white text-gray-800 shadow-sm border border-purple-50 rounded-tl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1">
              AI
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-purple-50">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-purple-300 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 bg-white/80 backdrop-blur-sm border-t border-purple-100">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="메시지를 입력하세요..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white disabled:opacity-40 transition-all hover:shadow-md active:scale-95"
          >
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          AI가 충분한 정보를 수집하면 자동으로 다음 단계로 넘어갑니다
        </p>
      </div>
    </div>
  );
}
