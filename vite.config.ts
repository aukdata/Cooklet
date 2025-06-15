import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages用の設定
  base: process.env.NODE_ENV === 'production' ? '/Cooklet/' : '/',
  build: {
    // ビルド出力ディレクトリ
    outDir: 'dist',
    // アセットのインライン化制限
    assetsInlineLimit: 4096,
    // ソースマップの生成
    sourcemap: false,
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
  }
})
