// Cooklet Service Worker
// 基本的なキャッシュ機能とオフライン対応を提供

const CACHE_NAME = 'cooklet-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/bundle.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

const API_CACHE_NAME = 'cooklet-api-v1.0.0';
const MAX_API_CACHE_SIZE = 50; // APIレスポンスの最大キャッシュ数

// Service Worker インストール時
self.addEventListener('install', event => {
  console.log('[SW] インストール開始');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 静的リソースをキャッシュ');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] インストール完了');
        return self.skipWaiting(); // 新しいSWを即座にアクティブ化
      })
  );
});

// Service Worker アクティベート時
self.addEventListener('activate', event => {
  console.log('[SW] アクティベート開始');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // 古いキャッシュを削除
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] 古いキャッシュを削除:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] アクティベート完了');
        return self.clients.claim(); // 既存のページに対してもSWを有効化
      })
  );
});

// ネットワークリクエストの処理
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Supabase APIリクエストの場合
  if (url.hostname.includes('supabase')) {
    event.respondWith(handleSupabaseRequest(request));
    return;
  }
  
  // 静的リソースの場合
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
  }
});

// Supabase APIリクエストの処理
async function handleSupabaseRequest(request) {
  const url = request.url;
  
  try {
    // ネットワーク優先戦略
    const response = await fetch(request);
    
    // GETリクエストで成功した場合のみキャッシュ
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      
      // キャッシュサイズを制限
      const keys = await cache.keys();
      if (keys.length >= MAX_API_CACHE_SIZE) {
        // 最も古いエントリを削除
        await cache.delete(keys[0]);
      }
      
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] ネットワークエラー、キャッシュから取得を試行:', url);
    
    // ネットワークエラーの場合、キャッシュから取得
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // キャッシュにもない場合はオフラインページを返す
    return new Response(
      JSON.stringify({
        error: 'オフライン',
        message: 'ネットワーク接続を確認してください'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 静的リソースの処理
async function handleStaticRequest(request) {
  try {
    // キャッシュ優先戦略
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // キャッシュにない場合はネットワークから取得
    const response = await fetch(request);
    
    // 成功した場合はキャッシュに保存
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] 静的リソース取得エラー:', request.url);
    
    // HTML リクエストの場合はオフラインページを返す
    if (request.headers.get('accept')?.includes('text/html')) {
      return new Response(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>オフライン - Cooklet</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
              padding: 50px 20px;
              background-color: #f9fafb;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 {
              color: #374151;
              margin-bottom: 16px;
            }
            p {
              color: #6b7280;
              line-height: 1.6;
            }
            button {
              background-color: #f3f4f6;
              color: #374151;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              margin-top: 20px;
              cursor: pointer;
              font-size: 16px;
            }
            button:hover {
              background-color: #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1>オフラインです</h1>
            <p>インターネット接続を確認してください。<br>
            一部の機能はオフラインでも利用できます。</p>
            <button onclick="window.location.reload()">再試行</button>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Service Unavailable', { status: 503 });
  }
}

// プッシュ通知の処理（将来的な拡張用）
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('Cooklet', options)
    );
  }
});

// 通知クリック時の処理（将来的な拡張用）
self.addEventListener('notificationclick', event => {
  console.log('[SW] 通知がクリックされました');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// バックグラウンド同期（将来的な拡張用）
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('[SW] バックグラウンド同期実行');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // オフライン時に蓄積されたデータの同期処理
  console.log('[SW] バックグラウンド同期完了');
}

// Service Worker の更新通知
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});