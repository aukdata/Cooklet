// レシートOCR処理用Netlify Function (TypeScript版)
// Google Vision APIを使用してレシート画像からテキストを抽出

import { ImageAnnotatorClient } from '@google-cloud/vision';
import type { Handler, Context } from '@netlify/functions';
import type {
  CorsHeaders,
  ErrorResponse,
  OCRSuccessResponse,
  OCRRequestBody,
  ValidationResult,
  LogEntry,
  VisionApiResponse,
  OCRResult,
  NetlifyEvent
} from './types/shared';

/**
 * CORS ヘッダーを設定（プロキシ用）
 * @param origin - リクエストのOrigin
 * @returns CORS ヘッダー
 */
function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins: string[] = [
    'https://cooklet.netlify.app',  // 本番環境
    'http://localhost:8888',        // Netlify Dev
    'http://localhost:5173'         // Vite Dev
  ];

  const isAllowedOrigin: boolean = Boolean(
    origin && (
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== 'production' && origin.includes('localhost'))
    )
  );

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin && origin ? origin : 'https://cooklet.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

/**
 * 画像データのバリデーション
 * @param imageData - Base64エンコードされた画像データ
 * @returns バリデーション結果
 */
function validateImageData(imageData: string): ValidationResult {
  if (!imageData) {
    return { isValid: false, error: '画像データが提供されていません' };
  }

  // Base64形式チェック
  const base64Pattern: RegExp = /^data:image\/(jpeg|jpg|png|webp);base64,/;
  if (!base64Pattern.test(imageData)) {
    return { isValid: false, error: '対応していない画像形式です (JPEG, PNG, WebP のみ)' };
  }

  // ファイルサイズチェック（Base64デコード後のサイズを概算）
  const base64Content: string = imageData.split(',')[1];
  const sizeInBytes: number = (base64Content.length * 3) / 4;
  const maxSize: number = 10 * 1024 * 1024; // 10MB

  if (sizeInBytes > maxSize) {
    return { isValid: false, error: 'ファイルサイズが大きすぎます (10MB以下にしてください)' };
  }

  return { isValid: true };
}

/**
 * Google Vision APIを使用してOCR処理を実行
 * @param imageBuffer - 画像データのBuffer
 * @returns OCR結果
 */
async function performOCR(imageBuffer: Buffer): Promise<OCRResult> {
  const client = new ImageAnnotatorClient({
    apiKey: process.env.GOOGLE_CLOUD_API_KEY
  });

  // DOCUMENT_TEXT_DETECTION を使用してテキストを抽出
  const [result]: [VisionApiResponse] = await client.documentTextDetection({
    image: {
      content: imageBuffer
    }
  });

  const detections = result.textAnnotations;

  if (!detections || detections.length === 0) {
    // フォールバック: fullTextAnnotation を試行
    const fullTextAnnotation = result.fullTextAnnotation;
    if (fullTextAnnotation?.text) {
      return {
        fullText: fullTextAnnotation.text,
        confidence: 0.90
      };
    }

    throw new Error('画像からテキストを検出できませんでした');
  }

  // 最初のtextAnnotationが全体のテキストを含む
  return {
    fullText: detections[0].description || '',
    confidence: 0.95
  };
}

/**
 * ログ出力ヘルパー
 * @param entry - ログエントリ
 */
function log(entry: LogEntry): void {
  const logMessage = `[${entry.level}] ${entry.message}`;
  const logData = {
    timestamp: entry.timestamp,
    ...entry.data
  };

  if (entry.level === 'ERROR') {
    console.error(logMessage, logData);
  } else {
    console.log(logMessage, logData);
  }
}

/**
 * エラーレスポンスを生成
 * @param code - エラーコード
 * @param message - エラーメッセージ
 * @param statusCode - HTTPステータスコード
 * @returns エラーレスポンス
 */
function createErrorResponse(
  code: string,
  message: string,
  statusCode: number
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details: {
        statusCode,
        timestamp: new Date().toISOString()
      }
    }
  };
}

/**
 * メインのハンドラー関数
 */
export const handler: Handler = async (event: NetlifyEvent, context: Context) => {
  const startTime: number = Date.now();

  // CORS プリフライトリクエスト対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(event.headers.origin),
      body: ''
    };
  }

  // POST リクエストのみ許可
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: getCorsHeaders(event.headers.origin),
      body: JSON.stringify(createErrorResponse(
        'METHOD_NOT_ALLOWED',
        'POST リクエストのみサポートしています',
        405
      ))
    };
  }

  try {
    // リクエストボディの解析
    let requestBody: OCRRequestBody;
    try {
      requestBody = JSON.parse(event.body || '{}') as OCRRequestBody;
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event.headers.origin),
        body: JSON.stringify(createErrorResponse(
          'INVALID_REQUEST',
          '無効なリクエスト形式です',
          400
        ))
      };
    }

    const { image } = requestBody;

    // 画像データのバリデーション
    const validation: ValidationResult = validateImageData(image);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(event.headers.origin),
        body: JSON.stringify(createErrorResponse(
          'INVALID_IMAGE',
          validation.error || '画像データが無効です',
          400
        ))
      };
    }

    // Base64データをBufferに変換
    const base64Content: string = image.split(',')[1];
    const imageBuffer: Buffer = Buffer.from(base64Content, 'base64');

    // Google Vision API キーの確認
    if (!process.env.VITE_GOOGLE_CLOUD_API_KEY) {
      log({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: 'GOOGLE_CLOUD_API_KEY 環境変数が設定されていません'
      });

      return {
        statusCode: 500,
        headers: getCorsHeaders(event.headers.origin),
        body: JSON.stringify(createErrorResponse(
          'CONFIGURATION_ERROR',
          'サーバー設定エラーです',
          500
        ))
      };
    }

    // OCR処理を実行
    const ocrResult: OCRResult = await performOCR(imageBuffer);
    const processingTime: number = Date.now() - startTime;

    // 成功ログ出力
    log({
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      message: 'OCR処理完了',
      data: {
        processingTime,
        imageSize: imageBuffer.length,
        textLength: ocrResult.fullText.length,
        confidence: ocrResult.confidence
      }
    });

    // 成功レスポンス
    const successResponse: OCRSuccessResponse = {
      success: true,
      data: {
        fullText: ocrResult.fullText,
        confidence: ocrResult.confidence,
        processedAt: new Date().toISOString(),
        metadata: {
          imageSize: imageBuffer.length,
          processingTime
        }
      }
    };

    return {
      statusCode: 200,
      headers: getCorsHeaders(event.headers.origin),
      body: JSON.stringify(successResponse)
    };

  } catch (error) {
    const processingTime: number = Date.now() - startTime;
    const errorObj = error as Error & { code?: number };

    // エラーログ出力
    log({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: 'OCR処理中にエラーが発生',
      data: {
        processingTime,
        error: errorObj.message,
        stack: errorObj.stack
      }
    });

    // Vision API 固有のエラー処理
    if (errorObj.code) {
      return {
        statusCode: 502,
        headers: getCorsHeaders(event.headers.origin),
        body: JSON.stringify(createErrorResponse(
          'VISION_API_ERROR',
          `Vision API エラー: ${errorObj.message}`,
          502
        ))
      };
    }

    // 一般的なエラー
    return {
      statusCode: 500,
      headers: getCorsHeaders(event.headers.origin),
      body: JSON.stringify(createErrorResponse(
        'PROCESSING_ERROR',
        'OCR処理中にエラーが発生しました',
        500
      ))
    };
  }
};