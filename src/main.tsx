import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// PWA関連の処理はApp.tsxに移動

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
