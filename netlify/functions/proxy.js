// Netlify Functions用プロキシサーバー
// レシピサイトからのコンテンツ取得をCORS制限なしで実行

exports.handler = async (event, context) => {
  // CORS設定（環境に応じて制限）
  const allowedOrigins = [
    'https://cooklet.netlify.app',  // 本番環境
    'http://localhost:8888',        // Netlify Dev
    'http://localhost:5173'         // Vite Dev
  ];
  
  const origin = event.headers.origin || event.headers.Origin;
  const isAllowedOrigin = allowedOrigins.includes(origin) || 
                         (process.env.NODE_ENV !== 'production' && origin?.includes('localhost'));
  
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'https://cooklet.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

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
      body: JSON.stringify({ 
        error: 'Method Not Allowed',
        message: 'このエンドポイントはGETリクエストのみサポートしています' 
      })
    };
  }

  try {
    // URLパラメータから対象URLを取得
    const targetUrl = event.queryStringParameters?.url;
    
    if (!targetUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Bad Request',
          message: 'URLパラメータが必要です。例: /.netlify/functions/proxy?url=https://example.com' 
        })
      };
    }

    // URLの妥当性チェック
    let validatedUrl;
    try {
      validatedUrl = new URL(targetUrl);
      
      // HTTPSのみ許可（セキュリティ上の理由）
      if (validatedUrl.protocol !== 'https:') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Invalid Protocol',
            message: 'HTTPSのURLのみサポートしています' 
          })
        };
      }
    } catch (urlError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid URL',
          message: '有効なURLを指定してください' 
        })
      };
    }

    console.log(`プロキシリクエスト: ${targetUrl} (Origin: ${origin})`);
    
    // セキュリティログ
    if (!isAllowedOrigin) {
      console.warn(`不正なOriginからのアクセス: ${origin}`);
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
    console.log(`レスポンス: ${response.status} ${response.statusText}`);

    // エラーレスポンスの場合
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({
          error: 'Fetch Error',
          message: `ターゲットサイトからエラーレスポンス: ${response.status} ${response.statusText}`,
          url: targetUrl,
          status: response.status,
          statusText: response.statusText
        })
      };
    }

    // HTMLコンテンツを取得
    const html = await response.text();
    
    if (!html || html.trim().length === 0) {
      return {
        statusCode: 204,
        headers,
        body: JSON.stringify({
          error: 'Empty Content',
          message: 'ターゲットサイトからコンテンツが取得できませんでした',
          url: targetUrl
        })
      };
    }

    // タイトルを抽出（簡易版）
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim() : 'レシピ';

    // 成功レスポンス
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        url: targetUrl,
        title,
        html,
        fetchedAt: new Date().toISOString(),
        // デバッグ情報
        debug: {
          responseStatus: response.status,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          contentLength: html.length,
          hasTitle: !!titleMatch
        }
      })
    };

  } catch (error) {
    console.error('プロキシエラー:', error);

    // タイムアウトエラー
    if (error.name === 'AbortError') {
      return {
        statusCode: 408,
        headers,
        body: JSON.stringify({
          error: 'Request Timeout',
          message: 'リクエストがタイムアウトしました（20秒）',
          url: event.queryStringParameters?.url
        })
      };
    }

    // ネットワークエラー
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: 'Network Error',
          message: 'ターゲットサイトに接続できませんでした',
          url: event.queryStringParameters?.url,
          details: error.message
        })
      };
    }

    // その他のエラー
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'プロキシサーバーでエラーが発生しました',
        url: event.queryStringParameters?.url,
        details: error.message
      })
    };
  }
};