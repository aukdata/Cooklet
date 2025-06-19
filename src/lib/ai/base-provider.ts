// AI Provider抽象基底クラス

import type { AIProvider, AIProviderConfig, RecipeExtraction } from './types';
import { RecipeExtractionError } from './types';

// レシピ抽出用の統一プロンプト - レシピサイト判定とタグ提案機能付き
export const RECIPE_EXTRACTION_PROMPT = `
あなたはWebサイトからレシピ情報を正確に抽出し、レシピサイトかどうかを判定し、適切なタグを提案する専門AIです。

【重要】絶対に守るべき制約：
1. HTMLに明確に記載されている情報のみを抽出してください
2. 推測や想像で情報を追加してはいけません（ハルシネーション厳禁）
3. 情報が不明な場合は、指定されたデフォルト値を使用してください

抽出・判定する情報：
- レシピサイト判定：true/false レシピ情報（料理名、材料、作り方等）が含まれているかを判定
- レシピ名：HTMLのtitleタグ、h1タグ、またはレシピタイトル要素から。「の作り方」や「のレシピ」は除去する。見つからなければ「レシピ」とする
- 人数：「〇人分」「〇人前」「〇名分」などの記載から数値のみ抽出。見つからなければ1。
- 材料：材料リスト、ingredients、材料名などの要素から
  - 食材名：「玉ねぎ」「牛ひき肉」など。「温かいごはん」など形容詞があるときは、形容詞を除去し単に「ごはん」とする。
  - 数量：「200」「1」「1/2」など数値部分のみ。見つからなければ "適量"。
  - 単位：「g」「ml」「個」「本」「枚」「大さじ」「小さじ」「カップ」など
- タグ提案：料理の特徴に基づいたタグ（料理ジャンル、調理方法、食材特徴など）
- 信頼度：抽出結果の明確性に応じて0.0から1.0の値を設定

材料の数量・単位分離ルール：
- 「200g」→ quantity: "200", unit: "g"
- 「玉ねぎ1個」→ quantity: "1", unit: "個"
- 「大さじ2」→ quantity: "2", unit: "大さじ"
- 「サラダ油大さじ1/2」→ quantity: "1/2", unit: "大さじ"
- 「サラダ油大さじ2と1/2」→ quantity: "2+1/2", unit: "大さじ"
- 「にんにく1かけ」→ quantity: "1", unit: "片"
- 「適量」→ quantity: "適量", unit: ""
- 「少々」→ quantity: "少々", unit: ""
- 「鶏肉100gほど」→ quantity: "100", unit: "g"
- 「鶏肉約100g」→ quantity: "100", unit: "g"
- 単位が不明な場合は unit: "" を設定

タグ提案ルール：
- 料理ジャンル：「和食」「洋食」「中華」「エスニック」「イタリアン」「フレンチ」など
- 調理方法：「炒め物」「煮物」「焼き物」「揚げ物」「蒸し物」「サラダ」「デザート」など
- 食材特徴：「肉料理」「魚料理」「野菜料理」「卵料理」「麺類」「丼物」「パスタ」など
- 特徴：「時短」「簡単」「ヘルシー」「作り置き」「お弁当」「おもてなし」など
- 最大5個まで、レシピ内容に最も適したタグを選択
- レシピサイトでない場合は空配列 [] を返す

レシピサイト判定基準：
- 料理名、材料リスト、作り方・手順のいずれかが明確に記載されている場合：true
- ブログやニュース記事で料理に言及しているが詳細な情報がない場合：false
- ECサイト、企業サイト、一般的なWebページ：false

注意事項：
- ingredientsは配列で、各要素は必ずname、quantity、unitを持つオブジェクト
- 材料が見つからない場合は空配列 [] を返す
- 数量が不明な場合は quantity: "適量", unit: "" を設定
- suggestedTagsは配列で、レシピサイトの場合のみ適切なタグを最大5個提案
- confidenceは抽出情報の明確性に応じて設定（明確:0.8-1.0、やや明確:0.5-0.7、不明確:0.2-0.4）
- レシピサイトでない場合は低いconfidenceを設定

HTMLコンテンツ:
`;

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  // HTMLからレシピ情報を抽出（抽象メソッド）
  abstract extractRecipeFromHtml(html: string, url: string): Promise<RecipeExtraction>;

  // プロバイダー名を取得
  getProviderName(): string {
    return this.config.provider;
  }

  // 設定を取得
  getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  // HTMLをクリーニングしてテキストのみ抽出
  protected cleanHtml(html: string): string {
    // HTMLタグを除去
    let cleanText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanText = cleanText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleanText = cleanText.replace(/<[^>]+>/g, ' ');
    
    // 特殊文字をデコード
    cleanText = cleanText.replace(/&nbsp;/g, ' ');
    cleanText = cleanText.replace(/&amp;/g, '&');
    cleanText = cleanText.replace(/&lt;/g, '<');
    cleanText = cleanText.replace(/&gt;/g, '>');
    cleanText = cleanText.replace(/&quot;/g, '"');
    
    // 余分な空白を削除
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
    
    // 長すぎる場合は最初の8000文字に制限（レシピサイトの詳細情報を含むため増量）
    if (cleanText.length > 8000) {
      cleanText = cleanText.substring(0, 8000) + '...';
    }
    
    return cleanText;
  }

  // レスポンスからJSONを抽出（改良版）
  protected extractJsonFromResponse(response: string): any {
    try {
      // レスポンスをクリーンアップ
      let cleanResponse = response.trim();
      
      // 直接JSON形式
      if (cleanResponse.startsWith('{') && cleanResponse.endsWith('}')) {
        return JSON.parse(cleanResponse);
      }
            
      throw new Error('有効なJSON形式ではありません。');
      
    } catch (error) {
      console.error('JSON抽出エラー:', { response, error });
      throw new RecipeExtractionError(
        `AIの応答からJSON形式のデータを抽出できませんでした: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.getProviderName(),
        undefined,
        error as Error
      );
    }
  }

  // 抽出結果を検証
  protected validateExtractionResult(data: any, url: string): RecipeExtraction {
    if (!data || typeof data !== 'object') {
      throw new RecipeExtractionError(
        '無効な抽出結果です',
        this.getProviderName(),
        url
      );
    }

    // 必須フィールドの検証
    const isRecipeSite = typeof data.isRecipeSite === 'boolean' ? data.isRecipeSite : false;
    const title = data.title || 'レシピ';
    const servings = typeof data.servings === 'number' ? data.servings : 2;
    const confidence = typeof data.confidence === 'number' ? 
      Math.max(0, Math.min(1, data.confidence)) : 0.5;

    // 材料リストの検証（単位対応）
    let ingredients: Array<{name: string; quantity: string; unit: string}> = [];
    if (Array.isArray(data.ingredients)) {
      ingredients = data.ingredients
        .filter((item: any) => item && typeof item === 'object' && item.name)
        .map((item: any) => ({
          name: String(item.name).trim(),
          quantity: String(item.quantity || '適量').trim(),
          unit: String(item.unit || '').trim()
        }));
    }

    // タグリストの検証
    let suggestedTags: string[] = [];
    if (Array.isArray(data.suggestedTags)) {
      suggestedTags = data.suggestedTags
        .filter((tag: any) => typeof tag === 'string' && tag.trim())
        .map((tag: any) => String(tag).trim())
        .slice(0, 5); // 最大5個まで
    }

    return {
      title,
      servings,
      ingredients,
      extractedFrom: url,
      confidence,
      isRecipeSite,
      suggestedTags
    };
  }
}