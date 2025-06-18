// Gemini AI Provider実装

import { BaseAIProvider, RECIPE_EXTRACTION_PROMPT } from '../base-provider';
import type { AIProviderConfig, RecipeExtraction } from '../types';
import { RecipeExtractionError } from '../types';

export class GeminiProvider extends BaseAIProvider {
  private readonly apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private readonly model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.model = config.model || 'gemini-2.5-flash-lite'; // デフォルトモデル（ユーザー要求準拠）
  }

  async extractRecipeFromHtml(html: string, url: string): Promise<RecipeExtraction> {
    try {
      // HTMLをクリーニング
      const cleanText = this.cleanHtml(html);
      
      // Gemini APIにリクエスト
      const response = await this.callGeminiAPI(cleanText);
      
      // JSONを抽出
      const extractedData = this.extractJsonFromResponse(response);
      
      // 結果を検証して返す
      return this.validateExtractionResult(extractedData, url);
      
    } catch (error) {
      if (error instanceof RecipeExtractionError) {
        throw error;
      }
      
      throw new RecipeExtractionError(
        `Gemini APIでのレシピ抽出に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.getProviderName(),
        url,
        error as Error
      );
    }
  }

  private async callGeminiAPI(cleanText: string): Promise<string> {
    const prompt = RECIPE_EXTRACTION_PROMPT + cleanText;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: this.config.temperature || 0.05, // より低い温度で確実性を重視
        maxOutputTokens: this.config.maxTokens || 1500, // JSON応答に十分な長さ
        topP: 0.1, // より決定的な応答
        topK: 10, // より少ない候補から選択
        stopSequences: ["```", "以上", "参考"], // 余計な出力を停止
      }
    };

    const response = await fetch(
      `${this.apiUrl}/${this.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Gemini APIから有効な応答を得られませんでした');
    }

    return data.candidates[0].content.parts[0].text;
  }
}