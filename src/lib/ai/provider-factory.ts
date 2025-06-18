// AI Provider Factory - 設定に基づいてProviderを作成

import type { AIProvider, AIProviderConfig } from './types';
import { RecipeExtractionError } from './types';
import { GeminiProvider } from './providers/gemini-provider';
import { ClaudeProvider } from './providers/claude-provider';
import { OpenAIProvider } from './providers/openai-provider';

export class AIProviderFactory {
  // 設定に基づいてAI Providerを作成
  static createProvider(config: AIProviderConfig): AIProvider {
    switch (config.provider) {
      case 'gemini':
        return new GeminiProvider(config);
      
      case 'claude':
        return new ClaudeProvider(config);
      
      case 'openai':
        return new OpenAIProvider(config);
      
      case 'groq':
        // TODO: Groq Providerの実装
        throw new RecipeExtractionError(
          'Groq Providerはまだ実装されていません',
          'groq'
        );
      
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
        apiKey = import.meta.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
        model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite';
        break;
      
      case 'claude':
        apiKey = import.meta.env.CLAUDE_API_KEY || import.meta.env.VITE_CLAUDE_API_KEY;
        model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
        break;
      
      case 'openai':
        apiKey = import.meta.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
        model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
        break;
      
      default:
        throw new RecipeExtractionError(
          `サポートされていないAI Provider: ${providerType}`,
          providerType
        );
    }

    if (!apiKey) {
      throw new RecipeExtractionError(
        `${providerType.toUpperCase()}_API_KEYが設定されていません`,
        providerType
      );
    }

    const config: AIProviderConfig = {
      provider: providerType,
      apiKey,
      model,
      maxTokens: parseInt(import.meta.env.VITE_AI_MAX_TOKENS || '1000'),
      temperature: parseFloat(import.meta.env.VITE_AI_TEMPERATURE || '0.1')
    };

    return this.createProvider(config);
  }

  // 利用可能なProviderの一覧を取得
  static getAvailableProviders(): string[] {
    return ['gemini', 'claude', 'openai'];
  }

  // Providerの説明を取得
  static getProviderDescription(provider: string): string {
    const descriptions: Record<string, string> = {
      gemini: 'Google Gemini (高速・高品質)',
      claude: 'Anthropic Claude (高精度)',
      openai: 'OpenAI GPT (安定性重視)',
      groq: 'Groq (超高速・今後対応予定)'
    };
    
    return descriptions[provider] || 'Unknown Provider';
  }
}