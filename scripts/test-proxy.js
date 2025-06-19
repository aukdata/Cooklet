#!/usr/bin/env node

// Netlify Functionsプロキシのテストスクリプト
// 使用方法: node scripts/test-proxy.js [URL]

const testUrl = process.argv[2];
const proxyUrl = 'http://localhost:8888/.netlify/functions/proxy';

console.log('🧪 Netlify Functionsプロキシテスト開始...');
console.log(`📋 テスト対象URL: ${testUrl}`);
console.log(`🚀 プロキシエンドポイント: ${proxyUrl}`);
console.log('');

async function testProxy() {
  try {
    console.log('⏳ リクエスト送信中...');
    
    const startTime = Date.now();
    const response = await fetch(`${proxyUrl}?url=${encodeURIComponent(testUrl)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⚡ レスポンス時間: ${responseTime}ms`);
    console.log(`📊 ステータス: ${response.status} ${response.statusText}`);
    console.log('');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ エラーレスポンス:');
      console.error(JSON.stringify(errorData, null, 2));
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ 成功レスポンス:');
    console.log(`📖 タイトル: ${data.title}`);
    console.log(`🔗 URL: ${data.url}`);
    console.log(`📄 HTML長: ${data.html ? data.html.length : 0} 文字`);
    console.log(`⏰ 取得時刻: ${data.fetchedAt}`);
    
    if (data.debug) {
      console.log('');
      console.log('🔍 デバッグ情報:');
      console.log(`   レスポンスステータス: ${data.debug.responseStatus}`);
      console.log(`   コンテンツ長: ${data.debug.contentLength}`);
      console.log(`   タイトル検出: ${data.debug.hasTitle ? '成功' : '失敗'}`);
    }
    
    // HTMLの一部を表示（最初の500文字）
    if (data.html) {
      console.log('');
      console.log('📋 HTML プレビュー（最初の500文字）:');
      console.log('─'.repeat(50));
      console.log(data.html.substring(0, 500) + '...');
      console.log('─'.repeat(50));
    }
    
  } catch (error) {
    console.error('❌ テスト失敗:');
    console.error(`   エラー: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('💡 解決方法:');
      console.error('   1. Netlify Devサーバーが起動していることを確認してください');
      console.error('   2. 以下のコマンドでサーバーを起動してください:');
      console.error('      pnpm run dev:netlify');
      console.error('   3. http://localhost:8888 でアクセス可能か確認してください');
    }
  }
}

console.log('🔧 前提条件チェック:');
console.log('   - Netlify CLIがインストールされていること');
console.log('   - `pnpm run dev:netlify` でサーバーが起動していること');
console.log('   - http://localhost:8888 でアクセス可能であること');
console.log('');

testProxy();