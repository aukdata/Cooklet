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
  private readonly corsProxy: string;
  
  constructor() {
    // CORS対応のプロキシサーバー（複数の選択肢）
    this.corsProxy = import.meta.env.VITE_CORS_PROXY || 'https://api.allorigins.win/get?url=';
  }

  // URLからWebサイトのコンテンツを取得
  async fetchWebsite(url: string): Promise<FetchedWebsite> {
    try {
      // URLの正規化
      const normalizedUrl = this.normalizeUrl(url);
      
      // プロキシ経由でfetch
      const response = await this.fetchWithProxy(normalizedUrl);
      
      if (!response.ok) {
        throw new WebFetchError(
          `HTTP Error: ${response.status} ${response.statusText}`,
          normalizedUrl,
          response.status
        );
      }

      // レスポンスの解析
      const data = await response.json();
      const html = data.contents || data.html || '';
      
      if (!html) {
        throw new WebFetchError(
          'Webサイトのコンテンツを取得できませんでした',
          normalizedUrl
        );
      }

      // タイトルを抽出
      const title = this.extractTitle(html) || 'レシピ';

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

  // プロキシ経由でfetch
  private async fetchWithProxy(url: string): Promise<Response> {
    const proxiedUrl = `${this.corsProxy}${encodeURIComponent(url)}`;
    
    return fetch(proxiedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cooklet/1.0 (Recipe Manager)'
      }
    });
  }

  // HTMLからタイトルを抽出
  private extractTitle(html: string): string | null {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      // HTMLエンティティをデコード
      return titleMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
    }
    return null;
  }

}