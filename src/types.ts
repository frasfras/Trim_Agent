export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export interface SessionState {
  sessionId: string | null;
  loading: boolean;
  error: string | null;
}
