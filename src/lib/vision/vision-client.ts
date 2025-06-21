// Netlify Functions経由でGoogle Vision APIを使用するOCRクライアント
// セキュリティのためAPIキーはサーバーサイドで管理

/**
 * レシート商品項目の型定義
 */
export interface ReceiptItem {
  name: string;
  quantity: string;
  price?: number;
}

/**
 * OCR処理結果の型定義
 */
export interface OCRResult {
  fullText: string;
  confidence: number;
  processedAt: string;
  metadata?: {
    imageSize: number;
    processingTime: number;
  };
  // 構造化データ（オプション）
  structured?: {
    items: ReceiptItem[];
    totalPrice?: number;
    storeName?: string;
    date?: string;
  };
}

/**
 * OCR処理専用エラークラス
 */
export class OCRError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly timestamp?: string;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    timestamp?: string
  ) {
    super(message);
    this.name = 'OCRError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = timestamp;
  }
}

/**
 * Netlify Functions経由でVision APIを使用するOCRクライアント
 */
export class VisionClient {
  private readonly apiEndpoint: string;

  constructor() {
    // Netlify Functionsのエンドポイントを設定
    this.apiEndpoint = '/.netlify/functions/receiptOCR';
  }

  /**
   * 画像ファイルからテキストを抽出
   * @param imageFile - 解析する画像ファイル
   * @returns Promise<OCRResult> - OCR処理結果
   */
  async extractTextFromImage(imageFile: File): Promise<OCRResult> {
    try {
      // 画像をBase64形式に変換
      const base64Image: string = await this.convertToDataURL(imageFile);

      // Netlify Functionsへリクエスト送信
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          options: {
            format: this.getImageFormat(imageFile.type),
            maxSize: imageFile.size
          }
        })
      });

      // レスポンス解析
      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        const error = responseData.error;
        throw new OCRError(
          error?.message || 'OCR処理に失敗しました',
          error?.code || 'UNKNOWN_ERROR',
          response.status,
          error?.details?.timestamp
        );
      }

      // 構造化データがある場合は一緒に返す
      const result: OCRResult = {
        fullText: responseData.data.fullText,
        confidence: responseData.data.confidence,
        processedAt: responseData.data.processedAt,
        metadata: responseData.data.metadata
      };

      // 構造化データがある場合は追加
      if (responseData.data.structured) {
        result.structured = responseData.data.structured;
      }

      return result;

    } catch (error) {
      if (error instanceof OCRError) {
        throw error;
      }

      // ネットワークエラーや予期しないエラー
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new OCRError(
          'ネットワークエラーが発生しました。接続を確認してください。',
          'NETWORK_ERROR'
        );
      }

      throw new OCRError(
        'OCR処理中に予期しないエラーが発生しました',
        'UNEXPECTED_ERROR',
        undefined,
        new Date().toISOString()
      );
    }
  }

  /**
   * ファイルをData URL形式に変換
   * @param file - 変換するファイル
   * @returns Promise<string> - Data URL形式の画像データ
   */
  private async convertToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('ファイル読み込みに失敗しました'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('ファイル読み込みエラー'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * MIMEタイプから画像形式を取得
   * @param mimeType - ファイルのMIMEタイプ
   * @returns string - 画像形式
   */
  private getImageFormat(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        return 'jpeg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      default:
        return 'unknown';
    }
  }

  /**
   * OCR処理の接続テスト
   * @returns Promise<boolean> - 接続可能かどうか
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'OPTIONS'
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * デフォルトのVisionクライアントインスタンスを作成
 */
export const createVisionClient = (): VisionClient => {
  return new VisionClient();
};