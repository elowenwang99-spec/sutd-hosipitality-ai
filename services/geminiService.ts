
import { GoogleGenAI, Type } from "@google/genai";
import { BedAnalysisResult } from "../types";

// The analysis schema defines the structure of the JSON response from the model.
// Type.OBJECT and Type.ARRAY are imported from @google/genai.
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
      description: "Specific issues found if UNMADE: 'pillow_misaligned', 'bedsheet_wrinkles', 'sheet_not_tucked', 'stains_or_hair', 'runner_misplaced', 'messy_surface'. Leave empty if MADE.",
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

/**
 * Analyzes a bed image using Gemini to determine if it's properly made.
 * Follows @google/genai guidelines:
 * 1. Uses process.env.API_KEY exclusively.
 * 2. Initializes GoogleGenAI right before the call.
 * 3. Uses ai.models.generateContent with model name and prompt.
 * 4. Extracts text via the .text property.
 */
export const analyzeBedImage = async (
  base64Image: string,
  roomNumber: string,
  housekeeperName: string
): Promise<BedAnalysisResult> => {
  // ALWAYS initialize GoogleGenAI with { apiKey: process.env.API_KEY } directly before use.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          text: `You are a high-end hotel room inspector. Perform a binary classification (MADE or UNMADE). 
          If UNMADE, you MUST identify the specific reasons from this list:
          - pillow_misaligned (pillows not centered or tidy)
          - bedsheet_wrinkles (visible creases or folds)
          - sheet_not_tucked (corners or sides not neatly tucked under the mattress)
          - stains_or_hair (any visible dirt or debris)
          - runner_misplaced (the decorative bed runner is crooked or weapon)
          - messy_surface (the duvet or quilt is lumpy or uneven)
          
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

  // Extract text output using the .text property (do not call as a function).
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
};
