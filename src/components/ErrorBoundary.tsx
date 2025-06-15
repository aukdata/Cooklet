import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// エラー境界コンポーネント - Reactエラーをキャッチして適切に表示
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーをキャッチしてstateを更新
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログを記録
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIがある場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <span className="text-4xl">⚠️</span>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                エラーが発生しました
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                アプリの読み込み中に問題が発生しました。
                <br />
                ページを再読み込みするか、しばらく時間を置いてからお試しください。
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  ページを再読み込み
                </button>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                >
                  再試行
                </button>
              </div>
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    エラー詳細
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 使いやすいHOC版
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};