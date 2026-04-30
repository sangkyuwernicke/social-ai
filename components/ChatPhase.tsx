"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Persona } from "@/lib/types";

interface Props {
  apiMessages: unknown[];
  chatMessages: ChatMessage[];
  phase: string;
  setApiMessages: (msgs: unknown[]) => void;
  setChatMessages: (msgs: ChatMessage[]) => void;
  onPersonaReady: (persona: Persona) => void;
}

export default function ChatPanel({
  apiMessages,
  chatMessages,
  phase,
  setApiMessages,
  setChatMessages,
  onPersonaReady,
}: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      initChat();
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

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
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const newChat: ChatMessage[] = [...chatMessages, { role: "user", text }];
    setChatMessages(newChat);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
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
      if (data.response) updated.push({ role: "assistant", text: data.response });
      setChatMessages(updated);

      if (data.persona) {
        setTimeout(() => onPersonaReady(data.persona), 600);
      }
    } catch {
      setChatMessages([...newChat, { role: "assistant", text: "오류가 발생했습니다. 다시 시도해 주세요." }]);
    } finally {
      setLoading(false);
    }
  }

  const disabled = phase !== "chat";

  return (
    <div className="chat-panel">
      <div className="chat-scroll">
        <div className="chat-inner">
          {/* Intro splash */}
          <div className="intro">
            <div className="intro-eyebrow">Persona-driven Social Agent</div>
            <h1 className="intro-title">
              Build your<br /><em>audience persona</em>
            </h1>
            <p className="intro-sub">
              AI와 대화를 나누며 타겟 페르소나를 완성하세요.<br />
              완성되면 맞춤 Instagram 홍보 자료를 자동으로 생성합니다.
            </p>
            <div className="intro-rule" />
          </div>

          {/* Messages */}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`row ${msg.role === "user" ? "user" : ""}`}>
              {msg.role === "assistant" && <div className="avatar bot">A</div>}
              <div className={`bubble ${msg.role === "bot" || msg.role === "assistant" ? "bot" : "usr"}`}>
                {msg.text.split("\n").map((line, j) => (
                  <p key={j}>{line}</p>
                ))}
              </div>
              {msg.role === "user" && <div className="avatar usr">Y</div>}
            </div>
          ))}

          {loading && (
            <div className="row">
              <div className="avatar bot">A</div>
              <div className="bubble bot">
                <div className="typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          {phase !== "chat" && (
            <div className="row fade-in">
              <div className="avatar bot">A</div>
              <div className="bubble bot">
                <div className="label">Atelier Studio</div>
                <p>페르소나가 완성되었습니다. 캔버스에서 생성된 홍보 자료를 확인해 주세요.</p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      {!disabled && (
        <div className="composer-wrap">
          <div className="composer">
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="메시지를 입력하세요..."
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
          <div className="composer-hint">
            <span className="kbd">Enter</span>
            <span>전송</span>
            <span className="sep" />
            <span className="kbd">Shift + Enter</span>
            <span>줄바꿈</span>
          </div>
        </div>
      )}
    </div>
  );
}
