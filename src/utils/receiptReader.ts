// レシート読み取り機能 - Google Vision API使用
import { createVisionClient, OCRError } from '../lib/vision/vision-client';
import type { OCRResult } from '../lib/vision/vision-client';

/**
 * レシート読み取り結果の型定義
 */
export interface ReceiptItem {
  name: string;
  quantity: string;
  price?: number;
}

/**
 * レシート読み取り結果
 */
export interface ReceiptResult {
  items: ReceiptItem[];
  totalPrice?: number;
  storeName?: string;
  date?: string;
}

/**
 * レシート画像を読み取って商品リストを返す関数
 * Google Vision API の DOCUMENT_TEXT_DETECTION を使用
 * @param file - アップロードされた画像ファイル
 * @returns Promise<ReceiptResult> - 読み取り結果
 */
export const readReceiptFromImage = async (file: File): Promise<ReceiptResult> => {
  try {
    // Vision API クライアントを作成
    const visionClient = createVisionClient();
    
    // OCR処理を実行
    const ocrResult: OCRResult = await visionClient.extractTextFromImage(file);
    
    // OCR結果をコンソールに出力（デバッグ用）
    console.log('=== OCR結果 ===');
    console.log('抽出されたテキスト:', ocrResult.fullText);
    console.log('信頼度:', ocrResult.confidence);
    console.log('処理時刻:', ocrResult.processedAt);
    
    // 構造化データがある場合は追加で表示
    if (ocrResult.structured) {
      console.log('=== 構造化データ ===');
      console.log('店舗名:', ocrResult.structured.storeName);
      console.log('購入日:', ocrResult.structured.date);
      console.log('合計金額:', ocrResult.structured.totalPrice);
      console.log('商品一覧:', ocrResult.structured.items);
      console.log('抽出された商品数:', ocrResult.structured.items.length);
      console.log('==================');
    }
    
    console.log('================');
    
    // 構造化データがある場合はそれを使用、なければフォールバック
    if (ocrResult.structured && ocrResult.structured.items.length > 0) {
      return {
        items: ocrResult.structured.items,
        totalPrice: ocrResult.structured.totalPrice,
        storeName: ocrResult.structured.storeName,
        date: ocrResult.structured.date
      };
    } else {
      // 構造化データがない場合のフォールバック
      console.log('構造化データが抽出できませんでした。フォールバックデータを返します。');
      return {
        items: [
          {
            name: "OCR結果確認用（構造化失敗）",
            quantity: "1件",
            price: 0
          }
        ],
        totalPrice: 0,
        storeName: "テスト実行",
        date: new Date().toISOString().split('T')[0]
      };
    }
    
  } catch (error) {
    console.error('レシート読み取りエラー:', error);
    
    if (error instanceof OCRError) {
      throw new Error(`OCR処理に失敗しました: ${error.message}`);
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