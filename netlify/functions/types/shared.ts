// Netlify Functions用の共有型定義

import type { Context } from '@netlify/functions';

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
 * 環境変数の型定義
 */
export interface EnvironmentVariables {
  GOOGLE_CLOUD_API_KEY?: string;
  ALLOWED_ORIGINS?: string;
  NODE_ENV?: 'development' | 'production' | 'test';
}