import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DialogProvider } from './contexts/DialogContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { ToastProvider } from './hooks/useToast.tsx'
import { Login } from './pages/auth/Login'
import { MainLayout } from './components/layout/MainLayout'
import { NotificationManager } from './components/NotificationManager'
import { MorningNotificationManager } from './components/MorningNotificationManager'
import { ConfirmDialog } from './components/dialogs/ConfirmDialog'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  
  // PWA更新通知用の状態管理
  const [isPWAUpdateDialogOpen, setIsPWAUpdateDialogOpen] = useState(false)
  const [newServiceWorker, setNewServiceWorker] = useState<ServiceWorker | null>(null)
  

  // PWA初期化処理
  useEffect(() => {
    // PWA表示モード検出
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('[PWA] スタンドアロンモードで実行中');
      document.body.classList.add('pwa-standalone');
    }
  }, []);

  // PWA Service Worker更新チェック
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          
          console.log('[PWA] Service Worker登録成功:', registration.scope);
          
          // Service Workerの更新チェック - updatefoundイベント
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] 新しいService Workerが見つかりました');
            const newWorker = registration.installing;
            
            if (newWorker) {
              // 新しいService Workerの状態変化を監視
              newWorker.addEventListener('statechange', () => {
                console.log('[PWA] Service Worker状態変化:', newWorker.state);
                
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // 新しいバージョンがインストール済みで、現在もService Workerが動作中の場合
                  console.log('[PWA] アプリの新しいバージョンが利用可能です');
                  setNewServiceWorker(newWorker);
                  setIsPWAUpdateDialogOpen(true);
                }
              });
            }
          });
          
          // 既存のService Workerがアクティブになった場合の処理
          registration.addEventListener('controllerchange', () => {
            console.log('[PWA] Service Workerが更新されました - リロードします');
            window.location.reload();
          });
          
          // Service Workerからのメッセージ受信
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('[PWA] Service Workerからメッセージ受信:', event.data);
            
            if (event.data && event.data.type === 'SW_UPDATED') {
              console.log('[PWA] Service Worker更新完了:', event.data.version);
              // 必要に応じて追加の処理をここに記述
            }
          });
          
        } catch (error) {
          console.error('[PWA] Service Worker登録失敗:', error);
        }
      };
      
      registerServiceWorker();
    }
  }, []);

  // PWA更新確認ハンドラー
  const handleConfirmPWAUpdate = () => {
    if (newServiceWorker) {
      console.log('[PWA] ユーザーが更新を承認 - skipWaitingを実行');
      
      // 新しいService WorkerにskipWaitingメッセージを送信
      newServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      
      // controllerchangeイベントでリロードされるため、ここでのリロードは削除
      // window.location.reload(); は不要
    }
    setIsPWAUpdateDialogOpen(false);
    setNewServiceWorker(null);
  };

  // PWA更新キャンセルハンドラー
  const handleCancelPWAUpdate = () => {
    console.log('[PWA] ユーザーが更新をキャンセル - 次回まで延期');
    setIsPWAUpdateDialogOpen(false);
    setNewServiceWorker(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <>
      <MainLayout />
      
      {/* 期限通知管理コンポーネント */}
      <NotificationManager />
      
      {/* 朝の通知管理コンポーネント */}
      <MorningNotificationManager />
      
      {/* PWA更新確認ダイアログ */}
      <ConfirmDialog
        isOpen={isPWAUpdateDialogOpen}
        title="🔄 アプリ更新"
        message="新しいバージョンが利用可能です。アプリを更新して最新機能をお使いください。"
        onConfirm={handleConfirmPWAUpdate}
        onCancel={handleCancelPWAUpdate}
        confirmText="今すぐ更新"
        cancelText="後で更新"
        isDestructive={false}
      />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <DialogProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DialogProvider>
      </NavigationProvider>
    </AuthProvider>
  )
}

export default App
