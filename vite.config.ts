import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Netlify用の設定
  base: '/',
  build: {
    // ビルド出力ディレクトリ
    outDir: 'dist',
    // アセットのインライン化制限
    assetsInlineLimit: 4096,
    // ソースマップの生成（Netlifyでデバッグ用に有効化）
    sourcemap: true,
    // minificationの設定
    minify: 'terser',
    // 静的アセットの処理
    rollupOptions: {
      output: {
        // チャンクファイル名の設定
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // Netlify環境での開発サーバー設定
  server: {
    port: 5173,
    host: true,
    // SPAルーティング対応
    historyApiFallback: true
  },
  // プレビューサーバー設定
  preview: {
    port: 4173,
    host: true
  }
})
