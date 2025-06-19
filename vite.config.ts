import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { execSync } from 'child_process'

// ビルド時にビルド情報ファイルを更新するプラグイン
const buildInfoPlugin = () => {
  return {
    name: 'build-info-plugin',
    buildEnd() {
      // ビルド開始時にビルド情報バージョンを更新
      console.log('🔄 ビルド情報バージョン更新中...')
      try {
        execSync('node scripts/generate-sw-version.js', { stdio: 'inherit' })
        console.log('✅ ビルド情報バージョン更新完了')
      } catch (error) {
        console.error('❌ ビルド情報バージョン更新エラー:', error)
      }
    }
  }
}

// ビルド時にService Workerバージョンを更新するプラグイン
const swVersionPlugin = () => {
  return {
    name: 'sw-version-plugin',
    buildEnd() {
      // ビルド開始時にService Workerバージョンを更新
      console.log('🔄 Service Workerバージョン更新中...')
      try {
        execSync('node scripts/generate-sw-version.js', { stdio: 'inherit' })
        console.log('✅ Service Workerバージョン更新完了')
      } catch (error) {
        console.error('❌ Service Workerバージョン更新エラー:', error)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), buildInfoPlugin(), swVersionPlugin()],
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
    host: true
  },
  // プレビューサーバー設定
  preview: {
    port: 4173,
    host: true
  }
})
