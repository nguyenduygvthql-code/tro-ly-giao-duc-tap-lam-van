
import { GoogleGenAI, LiveServerMessage, Modality, Type, Chat, GenerateContentResponse } from "@google/genai";
import { GameQuestion } from "../types";

// Khởi tạo Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Hàm hỗ trợ trích xuất văn bản an toàn từ response
 */
const safeExtractText = (response: GenerateContentResponse): string => {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) return "";
  
  let text = parts
    .filter(part => part.text)
    .map(part => part.text)
    .join("")
    .trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```[a-z]*\n/i, "").replace(/\n```$/i, "").trim();
  }
  
  return text;
};

const TEACHER_SYSTEM_PROMPT = `
Bạn là Trợ lý Giáo dục chuyên biệt dành cho Giáo viên dạy học sinh dân tộc Mông tại vùng cao Việt Nam. 
Phong cách: Đồng nghiệp thân thiện, mộc mạc, giàu tình thương và am hiểu sâu sắc tâm lý học sinh dân tộc thiểu số.
`;

const LIVE_TEACHER_PROMPT = `
Bạn là Thầy Giáo Cú Mèo - một giáo viên Tiểu học (dạy lớp 2-5) cực kỳ vui tính, hóm hỉnh. 
Nhiệm vụ của bạn là lắng nghe học sinh nói câu văn trong bài Tập làm văn và hướng dẫn các em sửa lỗi.

QUY TRÌNH PHẢN HỒI (Tuân thủ nghiêm ngặt 5 bước):
1. NHẮC LẠI: Nhắc lại nguyên văn câu học sinh vừa nói.
2. KIỂM TRA LỖI: Soi kỹ các lỗi (Thiếu chủ/vị, lặp từ, dùng từ sai nghĩa, câu lủng củng, trật tự từ, chính tả n/t, l/n).
3. NHẬN XÉT: 
   - Nếu câu ĐÚNG: Khen ngợi ngắn gọn, dí dỏm (Ví dụ: "Úi chà, câu này bé nói 'chuẩn cơm mẹ nấu' luôn!").
   - Nếu câu SAI: Chỉ ra lỗi bằng lời nhẹ nhàng, ví lỗi sai như "con sâu chữ" hay "cái bụng câu bị đói chữ".
4. ĐƯA RA CÂU SỬA: Chỉ đưa ra DUY NHẤT 1 câu sửa đúng, rõ ý, giàu hình ảnh.
5. YÊU CẦU: Mời bé đọc lại câu đã sửa.

ĐỊNH DẠNG TRẢ VỀ (Bắt buộc dùng dấu | để ngăn cách 3 phần):
[Lời nhận xét + Chỉ lỗi + Khen ngợi] | [Câu văn mẫu chuẩn nhất] | [Lời mời bé đọc lại hoặc viết lại]

VÍ DỤ SAI:
Bé nói: "Con chó nhà em rất sủa."
Phản hồi: "Bé vừa nói là: 'Con chó nhà em rất sủa'. Úi chà, Thầy Cú thấy câu này hơi 'đói chữ' rồi! Từ 'rất' không đi cùng với từ 'sủa' được đâu bé ơi. | Con chó nhà em rất hay sủa báo hiệu mỗi khi có khách đến chơi nhà. | Bây giờ bé hãy đọc lại câu văn hay này cho thầy nghe nhé!"

VÍ DỤ ĐÚNG:
Bé nói: "Em rất yêu con mèo nhỏ của em."
Phản hồi: "Bé nói là: 'Em rất yêu con mèo nhỏ của em'. Chu choa! Một câu văn rất đủ ý và ấm áp, Thầy Cú không bắt được con sâu chữ nào cả! | Em rất yêu con mèo nhỏ của em. | Bé hãy tự tin viết câu văn tuyệt vời này vào vở nha!"
`;

export const generateGameQuestions = async (grade: number, count: number = 5): Promise<GameQuestion[]> => {
  const gradeInstructions: Record<number, string> = {
    1: "Nhận biết âm, vần, tiếng đơn giản. Nhìn chữ chọn hình/nghĩa.",
    2: "Từ ngữ quen thuộc, điền từ vào câu ngắn.",
    3: "Dấu câu, phân biệt câu giới thiệu/hoạt động.",
    4: "Từ gợi tả, gợi cảm, miêu tả hay.",
    5: "Cấu trúc đoạn văn, sắp xếp ý mạch lạc."
  };

  const prompt = `Hãy tạo bộ ${count} câu hỏi trắc nghiệm Tiếng Việt cho học sinh LỚP ${grade}. Mục tiêu: ${gradeInstructions[grade]}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              hint: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex", "hint"]
          }
        }
      }
    });
    return JSON.parse(safeExtractText(response));
  } catch (error) { return []; }
};

export const analyzeStudentWriting = async (base64Image: string) => {
  const prompt = `Hãy chấm bài trong ảnh này như một giáo viên vùng cao thực thụ.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { 
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }, 
          { text: prompt }
        ] 
      },
      config: { 
        responseMimeType: 'application/json',
        systemInstruction: TEACHER_SYSTEM_PROMPT,
      }
    });
    return JSON.parse(safeExtractText(response));
  } catch (error) { return null; }
};

export const generateMindMap = async (subject: string, structure: any[] = []): Promise<string | null> => {
  const structureText = structure.map(s => `- ${s.main} (${s.subs.join(", ")})`).join("\n");
  const prompt = `A whimsical, educational mind map for children. Central: "${subject.toUpperCase()}". Vibrant watercolor style.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

export const generateTeacherResponse = async (input: string, taskContext: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Yêu cầu: ${taskContext}\n\nNội dung: "${input}"`,
      config: { systemInstruction: TEACHER_SYSTEM_PROMPT }
    });
    return safeExtractText(response);
  } catch (error) { return "Lỗi kết nối!"; }
};

export const getVisualVocabularyMetadata = async (topic: string) => {
  const prompt = `Tìm 4 từ vựng Tiếng Việt hay hơn cho: "${topic}". Phong cách: Tranh màu nước thiếu nhi.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              meaning: { type: Type.STRING },
              sentence: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            },
            required: ["word", "meaning", "sentence", "imagePrompt"]
          }
        }
      }
    });
    return JSON.parse(safeExtractText(response));
  } catch (error) { return []; }
};

export const generateIllustration = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `A beautiful watercolor storybook illustration for children: ${prompt}` }] },
      config: { imageConfig: { aspectRatio: '1:1' } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

export class LiveClient {
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;

  constructor(
    private onTranscriptUpdate: (text: string, isModel: boolean) => void,
    private onStatusChange: (isConnected: boolean) => void
  ) {}

  async connect() {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = this.outputAudioContext.createGain();
    outputNode.connect(this.outputAudioContext.destination);
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => { this.onStatusChange(true); this.startAudioStreaming(); },
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) this.playAudioChunk(base64Audio, outputNode);
          if (message.serverContent?.inputTranscription) this.onTranscriptUpdate(message.serverContent.inputTranscription.text, false);
          if (message.serverContent?.modelTurn) {
             const modelText = message.serverContent.modelTurn.parts.map(p => p.text).join("");
             if (modelText) this.onTranscriptUpdate(modelText, true);
          }
        },
        onclose: () => this.onStatusChange(false),
        onerror: () => this.onStatusChange(false)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: LIVE_TEACHER_PROMPT,
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      },
    });
  }

  private startAudioStreaming() {
    if (!this.inputAudioContext || !this.stream) return;
    const sourceNode = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const l = inputData.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) { int16[i] = inputData[i] * 32768; }
      const binary = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
      this.sessionPromise?.then((session) => session.sendRealtimeInput({ media: { data: binary, mimeType: 'audio/pcm;rate=16000' } }));
    };
    sourceNode.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async playAudioChunk(base64: string, outputNode: AudioNode) {
    if (!this.outputAudioContext) return;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = this.outputAudioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) { channelData[i] = dataInt16[i] / 32768.0; }
    this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(outputNode);
    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
  }

  disconnect() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.processor?.disconnect();
    this.sessionPromise = null;
  }
}

export const analyzeImageForIdeas = async (base64Image: string) => {
  const prompt = `Gợi ý ý tưởng viết văn từ ảnh.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(safeExtractText(response));
  } catch (error) { return null; }
};

export const generateGameChallenge = async (challengeType: string, monsterName: string): Promise<any> => {
  const prompt = `Tạo một thử thách loại ${challengeType} cho linh thú "${monsterName}".`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(safeExtractText(response));
  } catch (error) { return null; }
};

export const createForestGameSession = async () => {
  return { id: Math.random().toString(36).substr(2, 9), timestamp: new Date() };
};
