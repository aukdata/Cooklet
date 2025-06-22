// Webサイトからコンテンツを取得するユーティリティ

export interface FetchedWebsite {
  url: string;
  title: string;
  html: string;
  fetchedAt: Date;
}

export class WebFetchError extends Error {
  public readonly url: string;
  public readonly status?: number;
  public readonly originalError?: Error;

  constructor(
    message: string,
    url: string,
    status?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'WebFetchError';
    this.url = url;
    this.status = status;
    this.originalError = originalError;
  }
}

export class WebFetcher {
  private readonly proxyEndpoint: string;
  
  constructor() {
    // Netlify Functionsのプロキシエンドポイントのみ使用
    this.proxyEndpoint = '/.netlify/functions/proxy?url=';
  }

  // URLからWebサイトのコンテンツを取得
  async fetchWebsite(url: string): Promise<FetchedWebsite> {
    try {
      // URLの正規化
      const normalizedUrl = this.normalizeUrl(url);
      
      console.log(`リクエスト: ${normalizedUrl}`);
      
      // Netlify Functions経由でfetch
      const response = await this.fetchWithProxy(normalizedUrl);
      
      if (!response.ok) {
        // Netlify Functionsからのエラーレスポンスを詳細に処理
        let errorData: unknown;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Unknown Error', message: `HTTP ${response.status} ${response.statusText}` };
        }

        throw new WebFetchError(
          (errorData as {message?: string}).message || `HTTP Error: ${response.status} ${response.statusText}`,
          normalizedUrl,
          response.status
        );
      }

      // レスポンスの解析（Netlify FunctionsのJSONレスポンス）
      const data = await response.json();
      const html = data.html || '';
      const title = data.title || 'レシピ';
      
      if (!html) {
        throw new WebFetchError(
          'Webサイトのコンテンツを取得できませんでした',
          normalizedUrl
        );
      }

      console.log(`プロキシで成功しました: ${title}`);
      return {
        url: normalizedUrl,
        title,
        html,
        fetchedAt: new Date()
      };

    } catch (error) {
      if (error instanceof WebFetchError) {
        throw error;
      }

      throw new WebFetchError(
        `Webサイトの取得に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
        url,
        undefined,
        error as Error
      );
    }
  }

  // URLの正規化
  private normalizeUrl(url: string): string {
    // httpやhttpsがない場合は追加
    if (!url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }
    
    try {
      const urlObj = new URL(url);
      return urlObj.href;
    } catch (error) {
      throw new WebFetchError(
        '無効なURLです',
        url,
        undefined,
        error as Error
      );
    }
  }

  // Netlify Functions経由でfetch
  private async fetchWithProxy(url: string): Promise<Response> {
    const proxiedUrl = `${this.proxyEndpoint}${encodeURIComponent(url)}`;
    
    return fetch(proxiedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Cooklet/1.0 (Recipe Manager via Netlify Functions)'
      },
      // タイムアウト設定（Netlify Functionsの制限を考慮して30秒）
      signal: AbortSignal.timeout(30000)
    });
  }


}