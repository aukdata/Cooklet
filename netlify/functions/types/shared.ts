// Netlify Functions用の共有型定義

/**
 * Netlify Functionsのイベント型定義
 */
export interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string>;
  body: string | null;
  path: string;
  queryStringParameters: Record<string, string> | null;
  multiValueQueryStringParameters: Record<string, string[]> | null;
  pathParameters: Record<string, string> | null;
  stageVariables: Record<string, string> | null;
  requestContext: {
    requestId: string;
    stage: string;
    resourceId: string;
    httpMethod: string;
    requestTime: string;
    protocol: string;
    resourcePath: string;
    accountId: string;
    apiId: string;
    identity: {
      sourceIp: string;
      userAgent: string;
      accessKey: string | null;
      caller: string | null;
      user: string | null;
      userArn: string | null;
    };
  };
  isBase64Encoded: boolean;
}

/**
 * Netlify Functionsのレスポンス型定義
 */
export interface NetlifyResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

/**
 * CORS ヘッダー型定義
 */
export interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Max-Age': string;
}

/**
 * エラーレスポンスの型定義
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: {
      statusCode: number;
      timestamp: string;
      apiError?: unknown;
    };
  };
}

/**
 * OCR成功レスポンスの型定義
 */
export interface OCRSuccessResponse {
  success: true;
  data: {
    fullText: string;
    confidence: number;
    processedAt: string;
    metadata: {
      imageSize: number;
      processingTime: number;
    };
  };
}

/**
 * OCRリクエストボディの型定義
 */
export interface OCRRequestBody {
  image: string;
  options?: {
    format?: 'jpeg' | 'png' | 'webp';
    maxSize?: number;
    language?: string;
  };
}

/**
 * プロキシ成功レスポンスの型定義
 */
export interface ProxySuccessResponse {
  success: true;
  data: {
    html: string;
    title: string;
    url: string;
    fetchedAt: string;
    metadata: {
      contentLength: number;
      processingTime: number;
    };
  };
}

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * ログエントリの型定義
 */
export interface LogEntry {
  timestamp: string;
  level: 'SUCCESS' | 'ERROR' | 'INFO';
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Google Vision API レスポンスの型定義（実際のGoogle Cloud Vision APIに合わせて修正）
 */
export interface VisionApiTextAnnotation {
  description?: string | null;
  boundingPoly?: {
    vertices: Array<{ x?: number; y?: number }>;
  } | null;
  locale?: string | null;
}

export interface VisionApiFullTextAnnotation {
  text?: string | null;
  pages?: Array<{
    property?: {
      detectedLanguages?: Array<{
        languageCode: string;
        confidence: number;
      }>;
    };
  }> | null;
}

export interface VisionApiResponse {
  textAnnotations?: VisionApiTextAnnotation[] | null;
  fullTextAnnotation?: VisionApiFullTextAnnotation | null;
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

/**
 * OCR処理結果の型定義
 */
export interface OCRResult {
  fullText: string;
  confidence: number;
}


/**
 * 環境変数の型定義
 */
export interface EnvironmentVariables {
  VITE_GOOGLE_CLOUD_API_KEY?: string;
  VITE_ALLOWED_ORIGINS?: string;
  NODE_ENV?: 'development' | 'production' | 'test';
}