import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DialogProvider } from './contexts/DialogContext'
import { ToastProvider } from './hooks/useToast.tsx'
import { Login } from './pages/auth/Login'
import { MainLayout } from './components/layout/MainLayout'
import { ConfirmDialog } from './components/dialogs/ConfirmDialog'
import './App.css'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  
  // PWA更新通知用の状態管理
  const [isPWAUpdateDialogOpen, setIsPWAUpdateDialogOpen] = useState(false)
  const [newServiceWorker, setNewServiceWorker] = useState<ServiceWorker | null>(null)

  // PWA Service Worker更新チェック
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
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
                  setNewServiceWorker(newWorker);
                  setIsPWAUpdateDialogOpen(true);
                }
              });
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
      newServiceWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
    setIsPWAUpdateDialogOpen(false);
    setNewServiceWorker(null);
  };

  // PWA更新キャンセルハンドラー
  const handleCancelPWAUpdate = () => {
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
      
      {/* PWA更新確認ダイアログ */}
      <ConfirmDialog
        isOpen={isPWAUpdateDialogOpen}
        title="アプリ更新"
        message="アプリの新しいバージョンが利用可能です。更新しますか？"
        onConfirm={handleConfirmPWAUpdate}
        onCancel={handleCancelPWAUpdate}
        confirmText="更新"
        cancelText="後で"
        isDestructive={false}
      />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <DialogProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </DialogProvider>
    </AuthProvider>
  )
}

export default App
