// AI Provider Factory - 設定に基づいてProviderを作成

import type { AIProvider, AIProviderConfig } from './types';
import { RecipeExtractionError } from './types';
import { GeminiProvider } from './providers/gemini-provider';

export class AIProviderFactory {
  // 設定に基づいてAI Providerを作成
  static createProvider(config: AIProviderConfig): AIProvider {
    switch (config.provider) {
      case 'gemini':
        return new GeminiProvider(config);     
      default:
        throw new RecipeExtractionError(
          `サポートされていないAI Provider: ${config.provider}`,
          config.provider
        );
    }
  }

  // 環境変数から設定を読み込み
  static createFromEnvironment(): AIProvider {
    // AI Provider設定（環境変数または設定ファイルから）
    const providerType = (import.meta.env.VITE_AI_PROVIDER || 'gemini') as AIProviderConfig['provider'];
    
    let apiKey: string;
    let model: string | undefined;

    switch (providerType) {
      case 'gemini':
        apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
        model = import.meta.env.VITE_GEMINI_MODEL || 'models/gemini-2.5-flash-lite-preview-06-17';
        break;
      default:
        throw new RecipeExtractionError(
          `サポートされていないAI Provider: ${providerType}`,
          providerType
        );
    }

    if (!apiKey) {
      throw new RecipeExtractionError(
        `${providerType.toUpperCase()} API Keyが設定されていません`,
        providerType
      );
    }

    const config: AIProviderConfig = {
      provider: providerType,
      apiKey,
      model,
      maxTokens: 1000,
      temperature: 0.1,
    };

    return this.createProvider(config);
  }

  // 利用可能なProviderの一覧を取得
  static getAvailableProviders(): string[] {
    return ['gemini'];
  }
}