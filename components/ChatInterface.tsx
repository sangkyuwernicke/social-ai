"use client";

import { useState, useRef, useEffect } from "react";
import type { SimpleChatMessage } from "@/lib/types";
import { sendMessage } from "@/lib/chat-api";
import styles from "./ChatInterface.module.css";

export default function ChatInterface() {
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<"claude" | "gemini">("claude");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: SimpleChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessage({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })).concat({ role: "user", content: input }),
        model,
      });

      const assistantMessage: SimpleChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        model: response.model,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send message"
      );
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>AI Chat</h1>
          <p>Choose your AI model and start chatting</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.modelSelector}>
            <label htmlFor="model-select">Model:</label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value as "claude" | "gemini")}
              disabled={loading}
              className={styles.select}
            >
              <option value="claude">Claude (Anthropic)</option>
              <option value="gemini">Gemini (Google)</option>
            </select>
          </div>
          <button
            onClick={handleClear}
            disabled={messages.length === 0 || loading}
            className={styles.clearBtn}
          >
            Clear
          </button>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.length === 0 && !error && (
          <div className={styles.emptyState}>
            <p>Start a conversation by typing a message below</p>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${styles[message.role]}`}
          >
            <div className={styles.messageContent}>
              <p>{message.content}</p>
              {message.model && (
                <span className={styles.badge}>{message.model}</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageContent}>
              <div className={styles.loader}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className={styles.input}
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className={styles.sendBtn}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
