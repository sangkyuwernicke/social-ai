import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model } = await request.json() as {
      messages: Message[];
      model: "claude" | "gemini";
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    if (model === "claude") {
      return handleClaude(messages);
    } else if (model === "gemini") {
      return handleGemini(messages);
    } else {
      return NextResponse.json(
        { error: "Invalid model specified" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleClaude(messages: Message[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Claude API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-opus-4-1",
        max_tokens: 1024,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    const content =
      response.data.content[0]?.type === "text"
        ? response.data.content[0].text
        : "No response";

    return NextResponse.json({
      content,
      model: "claude",
      usage: {
        input_tokens: response.data.usage?.input_tokens,
        output_tokens: response.data.usage?.output_tokens,
      },
    });
  } catch (error) {
    console.error("Claude API error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Claude API" },
      { status: 500 }
    );
  }
}

async function handleGemini(messages: Message[]) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: messages.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          maxOutputTokens: 1024,
        },
      },
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );

    const content =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response";

    return NextResponse.json({
      content,
      model: "gemini",
      usage: {
        input_tokens: response.data.usageMetadata?.prompt_token_count,
        output_tokens: response.data.usageMetadata?.candidates_token_count,
      },
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Gemini API" },
      { status: 500 }
    );
  }
}
