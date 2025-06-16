import React from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DialogProvider } from './contexts/DialogContext'
import { Login } from './pages/auth/Login'
import { MainLayout } from './components/layout/MainLayout'
import './App.css'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()

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

  return <MainLayout />
}

function App() {
  return (
    <AuthProvider>
      <DialogProvider>
        <AppContent />
      </DialogProvider>
    </AuthProvider>
  )
}

export default App
