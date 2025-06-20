import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { execSync } from 'child_process'

// ビルド時情報を更新するプラグイン
const embdedInfoOnBuild = () => {
  return {
    name: 'embded-dynamic-info',
    async closeBundle() {
      // ビルド開始時に更新
      console.log('🔄 ビルド時情報更新中...')
      try {
        execSync('node scripts/embed-info-on-build.js', { stdio: 'inherit' })
        console.log('✅ ビルド時情報更新完了')
      } catch (error) {
        console.error('❌ ビルド時情報更新エラー:', error)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), embdedInfoOnBuild()],
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
