import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const PALM_VALIDATION_PROMPT = `You are a palm reading expert. Analyze this image and determine if it's suitable for palm reading.

Check for:
1. Is this a human palm (not back of hand)?
2. Is the palm facing the camera?
3. Is the image clear enough to see palm lines?
4. Is this a real hand (not a drawing, not a photo of a screen)?

Return ONLY valid JSON with this exact structure:
{
  "is_valid": true/false,
  "reason": "explanation if invalid"
}

Examples of invalid reasons:
- "No hand visible in image"
- "Back of hand detected, please show palm"
- "Image too blurry to analyze palm lines"
- "Appears to be a photo of screen or drawing"`;

export interface PalmValidationResult {
  is_valid: boolean;
  reason?: string;
}

export async function validatePalmImage(imageUrl: string): Promise<PalmValidationResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return { is_valid: false, reason: "Palm validation service not configured" };
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
            { type: "text", text: PALM_VALIDATION_PROMPT }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 150
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as PalmValidationResult;
  } catch (error) {
    console.error("Palm validation error:", error);
    return { is_valid: false, reason: "Palm validation failed" };
  }
}
