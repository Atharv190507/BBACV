import { GoogleGenAI, Type } from "@google/genai";

// WARNING: In a production app, never expose keys in client code.
// This is for demonstration purposes within the allowed environment.
const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MODEL_FLASH = 'gemini-2.5-flash';

export const geminiService = {
  /**
   * Simulates OCR by analyzing a base64 image (or PDF)
   * to extract certificate details.
   */
  extractCertificateData: async (base64Data: string, mimeType: string = 'image/jpeg') => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_FLASH,
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                {
                    text: `Analyze the uploaded academic certificate document (image or PDF) and extract the following details into a structured JSON format.
                    
                    Data Extraction Instructions:
                    1. studentName: Extract the full name of the recipient. Clean up excessive spaces. Ignore honorifics (Mr, Ms) unless part of the official name.
                    2. university: Identify the issuing institution. Look for main headers, seals, or "Conferred by" text.
                    3. degree: The qualification awarded (e.g., "Bachelor of Science", "Master of Arts").
                    4. program: The major/specialization (e.g., "Computer Science"). If combined with degree (e.g., "BSc in Physics"), split them.
                    5. graduationDate: Date of conferral. Format: YYYY-MM-DD. If uncertain, try to infer from "Given on this [Date]" text.
                    6. gpa: Look for "CGPA", "GPA", or "Grade" explicitly mentioned (e.g., "3.8", "4.0", "First Class"). Return empty string if not found.
                    7. issueDate: Date signed/issued. Often same as graduation date. Format: YYYY-MM-DD.
                    8. verifiedBy: Extract the name or title of the signatory or verifying authority (e.g., "Registrar", "Dean", "Controller of Examinations", or a specific person's name if legible).

                    Advanced Edge Case Handling:
                    - **Handwritten Text**: Use high-effort OCR for script fonts or handwritten names/dates common in older certificates.
                    - **PDF Layers**: If input is PDF, analyze both text layers and embedded images for seals/signatures.
                    - **No Hallucinations**: If a field is illegible or missing, strictly return an empty string "". Do not guess.
                    - **Date Standardization**: Convert all dates (e.g., "May 24th, 2024", "24/05/2024") to ISO 8601 (YYYY-MM-DD).
                    - **Noise Reduction**: Ignore watermarks like "COPY", "VOID", or "SAMPLE" that might overlay text.`
                }
            ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              studentName: { type: Type.STRING },
              university: { type: Type.STRING },
              degree: { type: Type.STRING },
              program: { type: Type.STRING },
              graduationDate: { type: Type.STRING },
              gpa: { type: Type.STRING },
              issueDate: { type: Type.STRING },
              verifiedBy: { type: Type.STRING }
            },
            required: [] // Relaxed validation to handle partial extractions
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini OCR Error:", error);
      return null;
    }
  },

  /**
   * Analyzes certificate metadata for potential fraud patterns.
   */
  detectFraud: async (certData: any): Promise<any> => {
    try {
      const prompt = `Analyze this certificate metadata for fraud likelihood. 
      Data: ${JSON.stringify(certData)}.
      
      Tasks:
      1. Check for logical inconsistencies (e.g. graduation date in the future).
      2. Check for mismatched university/degree pairs if common knowledge.
      3. Analyze for unusual patterns.
      
      Return JSON with:
      - score: 0-100 (0=Safe, 100=Fraud)
      - isSuspicious: boolean
      - reasons: array of strings explaining the score.`;

      const response = await ai.models.generateContent({
        model: MODEL_FLASH,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
           responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              isSuspicious: { type: Type.BOOLEAN },
              reasons: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Fraud Check Error:", error);
      return { score: 0, isSuspicious: false, reasons: ["AI Service Unavailable"] };
    }
  },

  /**
   * Chat assistant for the floating widget.
   */
  chat: async (history: { role: string; parts: { text: string }[] }[], newMessage: string) => {
    try {
        const chatSession = ai.chats.create({
            model: MODEL_FLASH,
            history: history,
            config: {
                systemInstruction: "You are the AI Assistant for BBACV (Blockchain-Based Academic Certificate Verification). You help users verify certificates, explain blockchain concepts, and troubleshoot usage. Be professional, concise, and helpful."
            }
        });
        
        const result = await chatSession.sendMessage({ message: newMessage });
        return result.text;
    } catch (error) {
        console.error("Chat Error", error);
        return "I am currently unable to connect to the network.";
    }
  }
};