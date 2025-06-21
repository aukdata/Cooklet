// Google Vision API を使用したOCR処理クライアント
// REST API を使用してブラウザから直接呼び出し（@google-cloud/visionはNode.js専用のため）

/**
 * Vision API のレスポンス型定義
 */
interface VisionApiResponse {
  responses: Array<{
    textAnnotations?: Array<{
      description: string;
      boundingPoly?: {
        vertices: Array<{
          x: number;
          y: number;
        }>;
      };
    }>;
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

/**
 * OCR処理結果の型定義
 */
export interface OCRResult {
  fullText: string;
  confidence: number;
  processedAt: string;
}

/**
 * OCR処理専用エラークラス
 */
export class OCRError extends Error {
  public readonly code?: number;
  public readonly originalError?: Error;

  constructor(
    message: string,
    code?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'OCRError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Google Vision API を使用したOCR処理クライアント
 * ブラウザ環境対応のREST API使用版
 */
export class VisionClient {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://vision.googleapis.com/v1/images:annotate';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new OCRError('Google Vision API キーが設定されていません');
    }
    this.apiKey = apiKey;
  }

  /**
   * 画像ファイルからテキストを抽出（DOCUMENT_TEXT_DETECTION使用）
   * @param imageFile - 解析する画像ファイル
   * @returns Promise<OCRResult> - OCR処理結果
   */
  async extractTextFromImage(imageFile: File): Promise<OCRResult> {
    try {
      // 画像をBase64に変換
      const base64Image: string = await this.convertToBase64(imageFile);

      // Vision API へのリクエストボディを構築
      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      };

      // Vision API を呼び出し
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new OCRError(
          `Vision API リクエストが失敗しました: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const data: VisionApiResponse = await response.json();

      // レスポンスエラーチェック
      if (data.responses[0]?.error) {
        const error = data.responses[0].error;
        throw new OCRError(
          `Vision API エラー: ${error.message}`,
          error.code
        );
      }

      // テキスト抽出結果を取得
      const textAnnotations = data.responses[0]?.textAnnotations;
      
      if (!textAnnotations || textAnnotations.length === 0) {
        // フォールバック: fullTextAnnotationから取得を試行
        const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
        if (fullTextAnnotation?.text) {
          return {
            fullText: fullTextAnnotation.text,
            confidence: 0.90,
            processedAt: new Date().toISOString()
          };
        }
        
        throw new OCRError('画像からテキストを検出できませんでした');
      }

      // 最初のtextAnnotationが全体のテキストを含む
      const fullText: string = textAnnotations[0].description;

      return {
        fullText,
        confidence: 0.95, // Vision APIは信頼度を返さないため固定値
        processedAt: new Date().toISOString()
      };

    } catch (error) {
      if (error instanceof OCRError) {
        throw error;
      }
      
      throw new OCRError(
        'OCR処理中にエラーが発生しました',
        undefined,
        error as Error
      );
    }
  }

  /**
   * ファイルをBase64文字列に変換
   * @param file - 変換するファイル
   * @returns Promise<string> - Base64文字列（データURLプレフィックスなし）
   */
  private async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // "data:image/jpeg;base64," プレフィックスを除去
          const base64: string = reader.result.split(',')[1];
          resolve(base64);
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
}

/**
 * デフォルトのVisionクライアントインスタンスを作成
 */
export const createVisionClient = (): VisionClient => {
  const apiKey: string = import.meta.env.VITE_GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new OCRError('VITE_GOOGLE_API_KEY 環境変数が設定されていません');
  }
  
  return new VisionClient(apiKey);
};