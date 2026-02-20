import { FashionAnalysis } from "../types";

const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL || "/api/analyze";

export const analyzeOutfit = async (base64Image: string): Promise<FashionAnalysis> => {
  const prompt = `
    You are a world-class fashion stylist and critic known for being extremely strict and demanding.
    Analyze the outfit in the image. Please respond in simplified Chinese (简体中文).
    
    Scoring Guidelines (BE VERY STRICT):
    - 9-10: Only for exceptional, runway-ready outfits with perfect coordination
    - 7-8: Well-put-together outfits with minor flaws
    - 5-6: Average outfits with noticeable issues
    - Below 5: Serious fashion mistakes or poorly coordinated outfits
    
    Most everyday outfits should score between 4-7. Be harsh but constructive.
    
    1. Give a STRICT score out of 10 based on: fit (30%), color coordination (30%), style coherence (25%), occasion appropriateness (15%).
    2. Write a sophisticated, brutally honest critique (max 2 sentences) in Chinese. Point out specific flaws directly.
    3. Provide 3 specific, actionable suggestions to improve the look in Chinese.
    4. Extract the dominant color palette (hex codes).
    
    Please respond in JSON format with the following structure:
    {
      "score": number,
      "critique": string,
      "suggestions": string[],
      "colorPalette": string[]
    }
  `;

  try {
    const response = await fetch(API_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: base64Image,
        prompt,
      }),
    });

    if (!response.ok) {
      let errorMsg = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch (e) {
        // ignore parse error if response is not JSON
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.result as FashionAnalysis;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(error.message || "分析失败，请重连试。");
  }
};
