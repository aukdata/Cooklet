// Netlify Functions用プロキシサーバー (TypeScript版)
// レシピサイトからのコンテンツ取得をCORS制限なしで実行

import type { Handler, Context } from '@netlify/functions';
import type {
  CorsHeaders,
  ErrorResponse,
  ProxySuccessResponse,
  LogEntry,
  NetlifyEvent
} from './types/shared';

/**
 * プロキシエラーレスポンスの型定義
 */
interface ProxyErrorResponse {
  error: string;
  message: string;
  url?: string;
  status?: number;
  statusText?: string;
  details?: string;
}

/**
 * プロキシ成功レスポンスの詳細版
 */
interface ProxyResponse {
  url: string;
  title: string;
  html: string;
  fetchedAt: string;
  debug: {
    responseStatus: number;
    responseHeaders: Record<string, string>;
    contentLength: number;
    hasTitle: boolean;
  };
}

/**
 * CORS ヘッダーを設定（プロキシ用）
 * @param origin - リクエストのOrigin
 * @returns CORS ヘッダー
 */
function getCorsHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': process.env.VITE_ALLOWED_ORIGINS ?? 'https://cooklet.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

/**
 * URLの妥当性チェック
 * @param url - チェックするURL
 * @returns 検証結果
 */
function validateUrl(url: string): { isValid: boolean; validatedUrl?: URL; error?: string } {
  try {
    const validatedUrl = new URL(url);

    // HTTPSのみ許可（セキュリティ上の理由）
    if (validatedUrl.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'HTTPSのURLのみサポートしています'
      };
    }

    return { isValid: true, validatedUrl };
  } catch {
    return {
      isValid: false,
      error: '有効なURLを指定してください'
    };
  }
}

/**
 * HTMLからタイトルを抽出
 * @param html - HTMLコンテンツ
 * @returns 抽出されたタイトル
 */
function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  
  if (!titleMatch) {
    return 'レシピ';
  }

  return titleMatch[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
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
 * @param error - エラー名
 * @param message - エラーメッセージ
 * @param statusCode - HTTPステータスコード
 * @param additionalData - 追加データ
 * @returns エラーレスポンス
 */
function createErrorResponse(
  error: string,
  message: string,
  statusCode: number,
  additionalData?: Record<string, unknown>
): ProxyErrorResponse {
  return {
    error,
    message,
    ...additionalData
  };
}

/**
 * メインのハンドラー関数
 */
export const handler: Handler = async (event: NetlifyEvent, _context: Context) => {
  const startTime: number = Date.now();
  const origin: string | undefined = event.headers.origin || event.headers.Origin;
  const headers = getCorsHeaders(origin);

  // OPTIONSリクエスト（プリフライト）への対応
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // GETリクエストのみ許可
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify(createErrorResponse(
        'Method Not Allowed',
        'このエンドポイントはGETリクエストのみサポートしています',
        405
      ))
    };
  }

  try {
    // URLパラメータから対象URLを取得
    const targetUrl: string | undefined = event.queryStringParameters?.url;

    if (!targetUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(createErrorResponse(
          'Bad Request',
          'URLパラメータが必要です。例: /.netlify/functions/proxy?url=https://example.com',
          400
        ))
      };
    }

    // URLの妥当性チェック
    const urlValidation = validateUrl(targetUrl);
    if (!urlValidation.isValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify(createErrorResponse(
          urlValidation.error === 'HTTPSのURLのみサポートしています' ? 'Invalid Protocol' : 'Invalid URL',
          urlValidation.error || '有効なURLを指定してください',
          400
        ))
      };
    }

    // ログ出力
    log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'プロキシリクエスト',
      data: { targetUrl, origin }
    });

    // セキュリティログ
    const allowedOrigins: string[] = [
      'https://cooklet.netlify.app',
      'http://localhost:8888',
      'http://localhost:5173'
    ];
    const isAllowedOrigin: boolean = Boolean(
      origin && (
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== 'production' && origin.includes('localhost'))
      )
    );

    if (!isAllowedOrigin) {
      log({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: '不正なOriginからのアクセス',
        data: { origin, targetUrl }
      });
    }

    // ターゲットサイトにリクエスト送信
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        // 実際のブラウザのように見せるためのヘッダー
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      },
      // タイムアウト設定（20秒）
      signal: AbortSignal.timeout(20000)
    });

    // レスポンス情報をログ出力
    log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'レスポンス受信',
      data: {
        status: response.status,
        statusText: response.statusText,
        url: targetUrl
      }
    });

    // エラーレスポンスの場合
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify(createErrorResponse(
          'Fetch Error',
          `ターゲットサイトからエラーレスポンス: ${response.status} ${response.statusText}`,
          response.status,
          {
            url: targetUrl,
            status: response.status,
            statusText: response.statusText
          }
        ))
      };
    }

    // HTMLコンテンツを取得
    const html: string = await response.text();

    if (!html || html.trim().length === 0) {
      return {
        statusCode: 204,
        headers,
        body: JSON.stringify(createErrorResponse(
          'Empty Content',
          'ターゲットサイトからコンテンツが取得できませんでした',
          204,
          { url: targetUrl }
        ))
      };
    }

    // タイトルを抽出
    const title: string = extractTitle(html);
    const processingTime: number = Date.now() - startTime;

    // 成功ログ
    log({
      timestamp: new Date().toISOString(),
      level: 'SUCCESS',
      message: 'プロキシ処理完了',
      data: {
        url: targetUrl,
        contentLength: html.length,
        processingTime,
        title: title.substring(0, 50) // タイトルは50文字まで
      }
    });

    // 成功レスポンス
    const proxyResponse: ProxyResponse = {
      url: targetUrl,
      title,
      html,
      fetchedAt: new Date().toISOString(),
      debug: {
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        contentLength: html.length,
        hasTitle: !!html.match(/<title[^>]*>(.*?)<\/title>/i)
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(proxyResponse)
    };

  } catch (error) {
    const processingTime: number = Date.now() - startTime;
    const errorObj = error as Error & { name?: string; code?: string };

    // エラーログ
    log({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: 'プロキシエラー',
      data: {
        error: errorObj.message,
        processingTime,
        url: event.queryStringParameters?.url,
        stack: errorObj.stack
      }
    });

    // タイムアウトエラー
    if (errorObj.name === 'AbortError') {
      return {
        statusCode: 408,
        headers,
        body: JSON.stringify(createErrorResponse(
          'Request Timeout',
          'リクエストがタイムアウトしました（20秒）',
          408,
          { url: event.queryStringParameters?.url }
        ))
      };
    }

    // ネットワークエラー
    if (errorObj.code === 'ENOTFOUND' || errorObj.code === 'ECONNREFUSED') {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify(createErrorResponse(
          'Network Error',
          'ターゲットサイトに接続できませんでした',
          502,
          {
            url: event.queryStringParameters?.url,
            details: errorObj.message
          }
        ))
      };
    }

    // その他のエラー
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(createErrorResponse(
        'Internal Server Error',
        'プロキシサーバーでエラーが発生しました',
        500,
        {
          url: event.queryStringParameters?.url,
          details: errorObj.message
        }
      ))
    };
  }
};