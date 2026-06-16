export type Phase = "chat" | "review" | "done";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface Persona {
  name: string;
  age_range: string;
  occupation: string;
  interests: string[];
  goals: string[];
  pain_points: string[];
  values: string[];
  lifestyle: string;
}

export interface MarketingContent {
  tagline_korean: string;
  tagline_english: string;
  image_url: string;
  image_prompt: string;
  simulated?: boolean;
  post_id?: string;
  post_reason?: string;
}

// Chat webapp types
export interface SimpleChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  model?: "claude" | "gemini";
}

export interface ChatRequest {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  model: "claude" | "gemini";
}

export interface ChatResponse {
  content: string;
  model: "claude" | "gemini";
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}
