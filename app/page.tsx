"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 20px", textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "20px" }}>AI Apps</h1>
        <p style={{ fontSize: "18px", marginBottom: "60px", opacity: 0.9 }}>
          Welcome to your AI-powered applications
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginTop: "40px" }}>
          {/* Chat App */}
          <Link href="/chat" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "40px 20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                transition: "transform 0.3s, box-shadow 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 15px 50px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.2)";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>💬</div>
              <h2 style={{ color: "#333", fontSize: "24px", marginBottom: "10px" }}>AI Chat</h2>
              <p style={{ color: "#666", fontSize: "14px" }}>
                Chat with Claude or Gemini AI models. Choose your preferred AI and have intelligent conversations.
              </p>
            </div>
          </Link>

          {/* Persona Studio */}
          <Link href="/persona" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "40px 20px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                transition: "transform 0.3s, box-shadow 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 15px 50px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.2)";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>👤</div>
              <h2 style={{ color: "#333", fontSize: "24px", marginBottom: "10px" }}>Persona Studio</h2>
              <p style={{ color: "#666", fontSize: "14px" }}>
                Create and manage personas for AI-powered social media content generation.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
