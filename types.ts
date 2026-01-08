
export enum AppMode {
  HOME = 'HOME',
  TEXT_TUTOR = 'TEXT_TUTOR',
  OUTLINE_TUTOR = 'OUTLINE_TUTOR',
  IMAGE_IDEAS = 'IMAGE_IDEAS',
  LIVE_CONVERSATION = 'LIVE_CONVERSATION',
  VISUAL_VOCAB = 'VISUAL_VOCAB',
  VIETNAMESE_GAME = 'VIETNAMESE_GAME',
  SETTINGS = 'SETTINGS',
}

export enum TextTaskType {
  CORRECTION = 'CORRECTION',
  VOCABULARY = 'VOCABULARY',
  OUTLINE = 'OUTLINE',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  type?: 'text' | 'image';
  imageData?: string; // Base64
}

export interface ImageEditConfig {
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9";
}

export interface VocabCard {
  word: string;
  meaning: string;
  sentence: string;
  imagePrompt: string;
  imageUrl?: string | null;
  isLoadingImage?: boolean;
}

export interface WritingCorrection {
  original: string;
  suggestion: string;
  explanation: string;
  type: 'SPELLING' | 'VOCABULARY' | 'GRAMMAR';
}

export interface WritingAnalysis {
  fullText: string;
  corrections: WritingCorrection[];
}

export interface ImageAnalysisResult {
  subjects: string[];
  locations: string[];
  actions: string[];
  adjectives: string[];
  sentences: string[];
}

export interface GameQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}
