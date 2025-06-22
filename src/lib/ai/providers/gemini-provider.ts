// Gemini AI Provider実装

import { GoogleGenAI, Type } from '@google/genai';
import { BaseAIProvider, RECIPE_EXTRACTION_PROMPT, RECEIPT_EXTRACTION_PROMPT } from '../base-provider';
import type { AIProviderConfig, RecipeExtraction, ReceiptResult } from '../types';
import { RecipeExtractionError, ReceiptExtractionError } from '../types';
import { FOOD_UNITS } from '../../../constants/units';

export class GeminiProvider extends BaseAIProvider {
  private readonly genAI: GoogleGenAI;
  private readonly model: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.genAI = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model || 'gemini-2.5-flash'; // デフォルトモデル
  }

  async extractRecipeFromHtml(html: string, url: string): Promise<RecipeExtraction> {
    try {
      // HTMLをクリーニング
      const cleanText = this.cleanHtml(html);
      
      // Gemini APIにリクエスト（レシピ用）
      const response = await this.callGeminiAPIForRecipe(cleanText);
      
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

  async extractReceiptFromText(text: string): Promise<ReceiptResult> {
    try {
      // Gemini APIにリクエスト（レシート用）
      const response = await this.callGeminiAPIForReceipt(text);
      
      // JSONを抽出
      const extractedData = this.extractJsonFromResponse(response);
      
      // 結果を検証して返す
      return this.validateReceiptExtractionResult(extractedData);
      
    } catch (error) {
      if (error instanceof ReceiptExtractionError) {
        throw error;
      }
      
      throw new ReceiptExtractionError(
        `Gemini APIでのレシート抽出に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.getProviderName(),
        error as Error
      );
    }
  }

  private async callGeminiAPIForRecipe(cleanText: string): Promise<string> {
    const prompt = RECIPE_EXTRACTION_PROMPT + cleanText;
    
    console.log('Gemini API Prompt:', prompt);

    try {
      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0 // 思考機能を無効化して速度とコストを最適化
          },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isRecipeSite: {
                type: Type.BOOLEAN,
              },
              title: {
                type: Type.STRING,
              },
              servings: {
                type: Type.NUMBER,
              },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: {
                      type: Type.STRING,
                    },
                    quantity: {
                      type: Type.STRING,
                    },
                    unit: {
                      type: Type.STRING,
                      enum: FOOD_UNITS,
                    },
                  },
                  propertyOrdering: ["name", "quantity", "unit"],
                },
              },
              suggestedTags: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
              confidence: {
                type: Type.NUMBER,
              },
            },
            propertyOrdering: [
              "isRecipeSite",
              "title",
              "servings",
              "ingredients",
              "suggestedTags",
              "confidence"
            ],
          },
          temperature: this.config.temperature || 0.05, // より低い温度で確実性を重視
          maxOutputTokens: this.config.maxTokens || 1500, // JSON応答に十分な長さ
          topP: 0.1, // より決定的な応答
          topK: 10, // より少ない候補から選択
        }
      });

      console.log('Gemini API Response:', response);

      if (!response.text) {
        throw new Error('Gemini APIから有効な応答を得られませんでした');
      }

      // 改行と空白を削除
      return response.text.replace(/\s+/g, '').replace(/\n/g, '');
    } catch (error) {
      throw new Error(`Gemini API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async callGeminiAPIForReceipt(text: string): Promise<string> {
    const prompt = RECEIPT_EXTRACTION_PROMPT + text;
    
    console.log('Gemini API Receipt Prompt:', prompt);

    try {
      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0 // 思考機能を無効化して速度とコストを最適化
          },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    originalName: {
                      type: Type.STRING,
                    },
                    name: {
                      type: Type.STRING,
                    },
                    quantity: {
                      type: Type.STRING,
                    },
                    unit: {
                      type: Type.STRING,
                      enum: FOOD_UNITS,
                    },
                    price: {
                      type: Type.NUMBER,
                    },
                  },
                  propertyOrdering: ["originalName", "name", "quantity", "unit", "price"],
                },
              },
              storeName: {
                type: Type.STRING,
              },
              date: {
                type: Type.STRING,
              },
              confidence: {
                type: Type.NUMBER,
              },
            },
            propertyOrdering: [
              "items",
              "storeName", 
              "date",
              "confidence"
            ],
          },
          temperature: this.config.temperature || 0.05, // より低い温度で確実性を重視
          maxOutputTokens: this.config.maxTokens || 1500, // JSON応答に十分な長さ
          topP: 0.1, // より決定的な応答
          topK: 10, // より少ない候補から選択
        }
      });

      console.log('Gemini API Receipt Response:', response);

      if (!response.text) {
        throw new Error('Gemini APIから有効な応答を得られませんでした');
      }

      // 改行と空白を削除
      return response.text.replace(/\s+/g, '').replace(/\n/g, '');
    } catch (error) {
      throw new Error(`Gemini API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
