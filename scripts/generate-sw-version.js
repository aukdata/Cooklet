#!/usr/bin/env node
// Service Worker バージョン生成スクリプト
// ビルド時に実行して、現在のタイムスタンプをバージョンとして使用

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 現在のタイムスタンプとビルド環境情報を取得
const timestamp = Date.now()
const buildDate = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')

// Netlify環境変数の取得（利用可能な場合）
const netlifyBuildId = process.env.BUILD_ID || ''
const netlifyCommitRef = process.env.COMMIT_REF || ''
const netlifyContext = process.env.CONTEXT || 'local'

// プロジェクトルート
const projectRoot = path.resolve(__dirname, '..')

// package.jsonからバージョン情報を取得
let packageVersion = '1.0.0'
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
  packageVersion = packageJson.version || '1.0.0'
} catch (error) {
  console.warn('package.jsonの読み込みに失敗:', error.message)
}

// 一意なバージョン文字列を生成
let uniqueVersion
if (netlifyBuildId) {
  // Netlify環境の場合
  const shortCommit = netlifyCommitRef.slice(0, 7)
  uniqueVersion = `v${packageVersion}-${netlifyContext}-${shortCommit}-${netlifyBuildId.slice(-6)}`
} else {
  // ローカル開発環境の場合
  uniqueVersion = `v${packageVersion}-${buildDate}-${timestamp.toString().slice(-6)}`
}

// Service Workerファイルのパス
const swPath = path.join(projectRoot, 'public', 'sw.js')

// Service Workerファイルを読み込み
let swContent = fs.readFileSync(swPath, 'utf8')

// CACHE_NAMEを動的バージョンに置換
const originalCacheName = /const CACHE_NAME = '[^']*'/
const newCacheName = `const CACHE_NAME = 'cooklet-${uniqueVersion}'`
swContent = swContent.replace(originalCacheName, newCacheName)

// API_CACHE_NAMEも同様に更新
const originalApiCacheName = /const API_CACHE_NAME = '[^']*'/
const newApiCacheName = `const API_CACHE_NAME = 'cooklet-api-${uniqueVersion}'`
swContent = swContent.replace(originalApiCacheName, newApiCacheName)

// Service Workerファイルに書き戻し
fs.writeFileSync(swPath, swContent, 'utf8')

console.log(`✅ Service Worker バージョン更新完了:`)
console.log(`   - CACHE_NAME: cooklet-${uniqueVersion}`)
console.log(`   - API_CACHE_NAME: cooklet-api-${uniqueVersion}`)
console.log(`   - タイムスタンプ: ${timestamp}`)
console.log(`   - ビルド環境: ${netlifyContext}`)
if (netlifyBuildId) {
  console.log(`   - Netlify Build ID: ${netlifyBuildId}`)
  console.log(`   - Commit: ${netlifyCommitRef.slice(0, 7)}`)
} else {
  console.log(`   - ビルド日時: ${buildDate}`)
}