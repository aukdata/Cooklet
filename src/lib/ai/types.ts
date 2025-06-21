// AI Provider抽象化のための型定義

// レシピ抽出結果のスキーマ
export interface RecipeExtraction {
  title: string; // レシピ名
  servings: number; // 何人前
  ingredients: Array<{
    name: string; // 食材名
    quantity: string; // 数量（数値部分）
    unit: string; // 単位（g、ml、個、等）
  }>;
  extractedFrom: string; // 抽出元URL
  confidence: number; // 抽出結果の信頼度（0-1）
  isRecipeSite: boolean; // レシピサイトかどうかの判定
  suggestedTags: string[]; // 提案されたタグ
}

// AI Provider設定
export interface AIProviderConfig {
  provider: 'gemini' | 'claude' | 'openai' | 'groq'; // 使用するAI Provider
  apiKey: string; // API Key
  model?: string; // 使用するモデル名（省略時はデフォルト）
  maxTokens?: number; // 最大トークン数
  temperature?: number; // 生成温度
}

// AI Provider抽象化インターフェース
export interface AIProvider {
  // レシピサイトのHTMLからレシピ情報を抽出
  extractRecipeFromHtml(html: string, url: string): Promise<RecipeExtraction>;
  
  // レシートテキストから構造化データを抽出
  extractReceiptFromText(text: string): Promise<ReceiptExtraction>;
  
  // プロバイダー名を取得
  getProviderName(): string;
  
  // 設定を取得
  getConfig(): AIProviderConfig;
}

// レシート抽出結果のスキーマ
export interface ReceiptExtraction {
  items: Array<{
    name: string; // 商品名
    quantity: string; // 数量
    price?: number; // 価格（任意）
  }>;
  storeName?: string; // 店舗名
  date?: string; // 購入日
  confidence: number; // 抽出結果の信頼度（0-1）
}

// レシピ抽出エラー
export class RecipeExtractionError extends Error {
  public readonly provider: string;
  public readonly url?: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    provider: string,
    url?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'RecipeExtractionError';
    this.provider = provider;
    this.url = url;
    this.originalError = originalError;
  }
}

// レシート抽出エラー
export class ReceiptExtractionError extends Error {
  public readonly provider: string;
  public readonly originalError?: Error;

  constructor(
    message: string,
    provider: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ReceiptExtractionError';
    this.provider = provider;
    this.originalError = originalError;
  }
}