import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// PWA Service Worker登録
const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[PWA] Service Worker登録成功:', registration.scope);
      
      // Service Workerの更新チェック
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 新しいService Workerが利用可能になった場合
              console.log('[PWA] 新しいバージョンが利用可能です');
              
              // ユーザーに更新を通知（必要に応じて）
              const shouldUpdate = confirm('アプリの新しいバージョンが利用可能です。更新しますか？');
              if (shouldUpdate) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.error('[PWA] Service Worker登録失敗:', error);
    }
  } else {
    console.log('[PWA] Service Workerはサポートされていません');
  }
};

// PWAインストール促進
const handleBeforeInstallPrompt = (): void => {
  // PWAインストール関連機能は将来的な拡張として保留
  window.addEventListener('beforeinstallprompt', (e) => {
    // デフォルトのインストール促進UIを非表示
    e.preventDefault();
    
    console.log('[PWA] インストール可能');
    
    // 将来的にインストール促進UIを実装予定
    // 現在は基本的なイベント処理のみ
  });
  
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] アプリがインストールされました');
  });
};

// PWA関連機能の初期化
const initializePWA = (): void => {
  registerServiceWorker();
  handleBeforeInstallPrompt();
  
  // PWA表示モード検出
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('[PWA] スタンドアロンモードで実行中');
    document.body.classList.add('pwa-standalone');
  }
};

// アプリ起動時にPWA機能を初期化
if (typeof window !== 'undefined') {
  initializePWA();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
