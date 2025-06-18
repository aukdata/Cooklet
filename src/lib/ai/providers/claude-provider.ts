// Claude AI Provider実装

import { BaseAIProvider, RECIPE_EXTRACTION_PROMPT } from '../base-provider';
import type { AIProviderConfig, RecipeExtraction } from '../types';
import { RecipeExtractionError } from '../types';

export class ClaudeProvider extends BaseAIProvider {
  private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
  private readonly model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.model = config.model || 'claude-3-5-sonnet-20241022'; // デフォルトモデル
  }

  async extractRecipeFromHtml(html: string, url: string): Promise<RecipeExtraction> {
    try {
      // HTMLをクリーニング
      const cleanText = this.cleanHtml(html);
      
      // Claude APIにリクエスト
      const response = await this.callClaudeAPI(cleanText);
      
      // JSONを抽出
      const extractedData = this.extractJsonFromResponse(response);
      
      // 結果を検証して返す
      return this.validateExtractionResult(extractedData, url);
      
    } catch (error) {
      if (error instanceof RecipeExtractionError) {
        throw error;
      }
      
      throw new RecipeExtractionError(
        `Claude APIでのレシピ抽出に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.getProviderName(),
        url,
        error as Error
      );
    }
  }

  private async callClaudeAPI(cleanText: string): Promise<string> {
    const prompt = RECIPE_EXTRACTION_PROMPT + cleanText;
    
    const requestBody = {
      model: this.model,
      max_tokens: this.config.maxTokens || 1000,
      temperature: this.config.temperature || 0.1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Claude APIから有効な応答を得られませんでした');
    }

    return data.content[0].text;
  }
}