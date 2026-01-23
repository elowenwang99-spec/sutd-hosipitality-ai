
import { GoogleGenAI, Type } from "@google/genai";
import { BedAnalysisResult } from "../types";

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      description: "Must be 'MADE' if the bed is perfectly ready for a guest, or 'UNMADE' if any issues exist.",
    },
    unmadeReasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Specific issues found if UNMADE: 'pillow_misaligned', 'bedsheet_wrinkles', 'sheet_not_tucked', 'stains_or_hair', 'runner_misplaced', 'messy_surface'.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score from 0.0 to 1.0.",
    },
    reasoning: {
      type: Type.STRING,
      description: "Brief explanation of the findings.",
    },
  },
  required: ["status", "unmadeReasons", "confidence", "reasoning"],
};

export const analyzeBedImage = async (
  base64Image: string,
  roomNumber: string,
  housekeeperName: string
): Promise<BedAnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === '') {
    throw new Error("API Key is missing from application config. Set VITE_API_KEY in Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // 尝试使用 gemini-3-flash-preview，如果失败可以根据报错信息定位
  const modelName = "gemini-1.5-flash-latest"; // 先切换到一个更广泛可用的模型进行兼容性测试

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            text: `Analyze this hotel bed image. Is it 'MADE' (perfect) or 'UNMADE' (needs attention)?
            Issues to check: wrinkles, misplaced pillows, stains, or messy surfaces.
            Return JSON matching the schema.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.includes(",") ? base64Image.split(",")[1] : base64Image,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonStr = response.text || '{}';
    const rawResult = JSON.parse(jsonStr);

    return {
      id: `res-${Date.now()}`,
      roomNumber,
      timestamp: Date.now(),
      housekeeperName,
      status: (rawResult.status === 'MADE' ? 'MADE' : 'UNMADE') as 'MADE' | 'UNMADE',
      unmadeReasons: rawResult.unmadeReasons || [],
      confidence: rawResult.confidence || 0,
      imageUrl: base64Image,
      reviewStatus: rawResult.confidence < 0.9 ? 'PENDING' : undefined,
    };
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    
    // 更好的错误抛出，传递后端返回的原始错误
    let message = error.message || "Unknown API error";
    if (message.includes("403")) message = "API Key error or Region restricted (403)";
    if (message.includes("404")) message = "Model not found. Try a different model name (404)";
    if (message.includes("429")) message = "Too many requests. Quota exceeded (429)";
    
    throw new Error(message);
  }
};
