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
}
