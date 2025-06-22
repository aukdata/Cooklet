// レシート読み取り機能 - Google Vision API + Gemini AI使用
import { createVisionClient, OCRError } from '../lib/vision/vision-client';
import type { OCRResult } from '../lib/vision/vision-client';
import { AIProviderFactory } from '../lib/ai/provider-factory';
import type { ReceiptExtraction } from '../lib/ai/types';
import { ReceiptExtractionError } from '../lib/ai/types';
import { normalizeReceiptItems, getNormalizationStats } from './nameNormalizer';
import type { NameNormalizationResult } from './nameNormalizer';
import type { Ingredient } from '../types';

/**
 * レシート読み取り結果の型定義（互換性のため保持）
 */
export interface ReceiptItem {
  name: string;
  quantity: string;
  price?: number;
  normalizationResult?: NameNormalizationResult; // 商品名正規化結果（任意）
}

/**
 * レシート読み取り結果（計算された合計金額付き）
 */
export interface ReceiptResult {
  items: ReceiptItem[];
  totalPrice?: number;
  storeName?: string;
  date?: string;
  confidence?: number;
}

/**
 * レシート商品リストから合計金額を計算
 * @param items - 商品リスト
 * @returns 合計金額
 */
export const calculateTotalPrice = (items: ReceiptItem[]): number => {
  return items
    .filter(item => typeof item.price === 'number')
    .reduce((total, item) => total + (item.price || 0), 0);
};

/**
 * レシート画像を読み取って商品リストを返す関数
 * Google Vision API の DOCUMENT_TEXT_DETECTION + Gemini AI構造化を使用
 * ingredientsテーブルのoriginal_nameと照らし合わせて商品名を一般名に変換
 * @param file - アップロードされた画像ファイル
 * @param ingredients - 商品名正規化用の食材マスタデータ（任意）
 * @returns Promise<ReceiptResult> - 読み取り結果
 */
export const readReceiptFromImage = async (
  file: File, 
  ingredients?: Ingredient[]
): Promise<ReceiptResult> => {
  try {
    // Step 1: Vision API でOCR処理を実行
    const visionClient = createVisionClient();
    const ocrResult: OCRResult = await visionClient.extractTextFromImage(file);
    
    // OCR結果をコンソールに出力（デバッグ用）
    console.log('=== OCR結果 ===');
    console.log('抽出されたテキスト:', ocrResult.fullText);
    console.log('信頼度:', ocrResult.confidence);
    console.log('処理時刻:', ocrResult.processedAt);
    console.log('================');
    
    // Step 2: Gemini AI でテキストを構造化
    const aiProvider = AIProviderFactory.createFromEnvironment();
    const receiptData: ReceiptExtraction = await aiProvider.extractReceiptFromText(ocrResult.fullText);
    
    // Gemini構造化結果をコンソールに出力（デバッグ用）
    console.log('=== Gemini構造化結果 ===');
    console.log('店舗名:', receiptData.storeName);
    console.log('購入日:', receiptData.date);
    console.log('商品一覧:', receiptData.items);
    console.log('抽出された商品数:', receiptData.items.length);
    console.log('AI信頼度:', receiptData.confidence);
    
    // Step 3: 商品名正規化処理（ingredientsテーブルとの照らし合わせ）
    let normalizedItems = receiptData.items;
    if (ingredients && ingredients.length > 0) {
      normalizedItems = normalizeReceiptItems(receiptData.items, ingredients);
      
      // 正規化統計をコンソールに出力
      const stats = getNormalizationStats(normalizedItems.map(item => item.normalizationResult));
      console.log('=== 商品名正規化結果 ===');
      console.log(`正規化対象: ${stats.total}件`);
      console.log(`正規化成功: ${stats.normalized}件`);
      console.log(`未変更: ${stats.unchanged}件`);
      console.log(`正規化率: ${(stats.normalizationRate * 100).toFixed(1)}%`);
      
      // 正規化された商品詳細
      normalizedItems.forEach((item, index) => {
        if (item.normalizationResult.isNormalized) {
          console.log(`${index + 1}: "${item.normalizationResult.originalName}" → "${item.name}"`);
        }
      });
      console.log('========================');
    }
    
    // Step 4: 合計金額を計算
    const calculatedTotalPrice = calculateTotalPrice(normalizedItems);
    console.log('計算された合計金額:', calculatedTotalPrice);
    console.log('=========================');
    
    return {
      items: normalizedItems,
      totalPrice: calculatedTotalPrice > 0 ? calculatedTotalPrice : undefined,
      storeName: receiptData.storeName,
      date: receiptData.date,
      confidence: receiptData.confidence
    };
    
  } catch (error) {
    console.error('レシート読み取りエラー:', error);
    
    if (error instanceof OCRError) {
      throw new Error(`OCR処理に失敗しました: ${error.message}`);
    }
    
    if (error instanceof ReceiptExtractionError) {
      throw new Error(`AI構造化に失敗しました: ${error.message}`);
    }
    
    throw new Error('レシート読み取り中に予期しないエラーが発生しました');
  }
};

/**
 * 画像ファイルの妥当性チェック
 * @param file - チェックするファイル
 * @returns boolean - 妥当な画像ファイルかどうか
 */
export const validateImageFile = (file: File): boolean => {
  // ファイルタイプのチェック
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  // ファイルサイズのチェック（10MB以下）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }

  return true;
};