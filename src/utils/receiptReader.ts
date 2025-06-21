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
  totalAmount?: number;
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
    console.log('================');
    
    // 現在はOCR結果の出力のみ実装
    // 今後、テキストパース機能を追加予定
    return {
      items: [
        {
          name: "OCR結果確認用",
          quantity: "1件",
          price: 0
        }
      ],
      totalAmount: 0,
      storeName: "テスト実行",
      date: new Date().toISOString().split('T')[0]
    };
    
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