
import { GoogleGenAI, Type } from "@google/genai";
import { BedAnalysisResult } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      description: "Must be 'MADE' if the bed is properly made according to hotel standards, or 'UNMADE' if it is messy, used, or poorly prepared.",
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score from 0.0 to 1.0.",
    },
    reason: {
      type: Type.STRING,
      description: "A very brief reason for the classification.",
    },
  },
  required: ["status", "confidence", "reason"],
};

export const analyzeBedImage = async (
  base64Image: string,
  roomNumber: string,
  housekeeperName: string
): Promise<BedAnalysisResult> => {
  const ai = getAIClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          text: `You are a hotel room inspector. Perform a binary classification on this image. 
          Determine if the bed is 'MADE' (ready for a guest) or 'UNMADE' (needs cleaning/fixing).
          Return valid JSON according to the schema.`
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1],
          },
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    },
  });

  const rawResult = JSON.parse(response.text || '{}');

  return {
    id: `res-${Date.now()}`,
    roomNumber,
    timestamp: Date.now(),
    housekeeperName,
    status: (rawResult.status === 'MADE' ? 'MADE' : 'UNMADE') as 'MADE' | 'UNMADE',
    confidence: rawResult.confidence || 0,
    imageUrl: base64Image,
    reviewStatus: rawResult.confidence < 0.9 ? 'PENDING' : undefined,
  };
};
