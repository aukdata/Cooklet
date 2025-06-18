// OpenAI Provider実装

import { BaseAIProvider, RECIPE_EXTRACTION_PROMPT } from '../base-provider';
import type { AIProviderConfig, RecipeExtraction } from '../types';
import { RecipeExtractionError } from '../types';

export class OpenAIProvider extends BaseAIProvider {
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.model = config.model || 'gpt-4o-mini'; // デフォルトモデル
  }

  async extractRecipeFromHtml(html: string, url: string): Promise<RecipeExtraction> {
    try {
      // HTMLをクリーニング
      const cleanText = this.cleanHtml(html);
      
      // OpenAI APIにリクエスト
      const response = await this.callOpenAIAPI(cleanText);
      
      // JSONを抽出
      const extractedData = this.extractJsonFromResponse(response);
      
      // 結果を検証して返す
      return this.validateExtractionResult(extractedData, url);
      
    } catch (error) {
      if (error instanceof RecipeExtractionError) {
        throw error;
      }
      
      throw new RecipeExtractionError(
        `OpenAI APIでのレシピ抽出に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.getProviderName(),
        url,
        error as Error
      );
    }
  }

  private async callOpenAIAPI(cleanText: string): Promise<string> {
    const prompt = RECIPE_EXTRACTION_PROMPT + cleanText;
    
    const requestBody = {
      model: this.model,
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: this.config.maxTokens || 1000,
      temperature: this.config.temperature || 0.1,
      response_format: { type: 'json_object' } // JSON形式を強制
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('OpenAI APIから有効な応答を得られませんでした');
    }

    return data.choices[0].message.content;
  }
}