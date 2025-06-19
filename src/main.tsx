import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// PWA関連の処理はApp.tsxに移動

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

// PWA初期化機能はApp.tsxに移動
// PWA表示モード検出のみここで実行
if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
  console.log('[PWA] スタンドアロンモードで実行中');
  document.body.classList.add('pwa-standalone');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
