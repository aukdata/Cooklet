#!/usr/bin/env node

// リアルタイム更新を削除してタブ切り替え時の更新チェック機能に置き換えるスクリプト

import fs from 'fs';
import path from 'path';

const hooksDir = './src/hooks';
const targetFiles = [
  'useShoppingList.ts',
  'useCostRecords.ts', 
  'useIngredients.ts'
];

// リアルタイム更新コードのパターン
const realtimePatterns = [
  // useEffect で subscribe を含む全体のパターン
  /\/\/ リアルタイム更新の設定[\s\S]*?useEffect\(\(\) => \{[\s\S]*?\}, \[.*?\]\);/g,
  // 個別のリアルタイム関連コード
  /let subscription.*?= null;[\s\S]*?\.subscribe\([\s\S]*?\);[\s\S]*?return \(\) => \{[\s\S]*?\};/g,
  // setupSubscription 関数
  /const setupSubscription[\s\S]*?setupSubscription\(\);/g
];

// markAsUpdated を追加するパターン
const updatePatterns = [
  {
    // ローカル状態更新の後にmarkAsUpdatedを追加
    pattern: /(setShoppingList\(.*?\);|setCostRecords\(.*?\);|setIngredients\(.*?\);)/g,
    replacement: '$1\n      markAsUpdated(); // データ変更後に更新時刻をマーク'
  }
];

function processFile(filePath) {
  console.log(`処理中: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`ファイルが見つかりません: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // useTabRefresh のインポートを追加
  if (!content.includes('useTabRefresh')) {
    content = content.replace(
      /import { useAuth } from '\.\.\/contexts\/AuthContext';/,
      `import { useAuth } from '../contexts/AuthContext';\nimport { useTabRefresh } from './useTabRefresh';`
    );
    modified = true;
    console.log('  - useTabRefresh インポートを追加');
  }
  
  // リアルタイム更新コードを削除
  realtimePatterns.forEach((pattern, index) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
      console.log(`  - リアルタイム更新コード ${index + 1} を削除`);
    }
  });
  
  // タブ切り替え時の更新チェック機能を追加
  const fetchFunctionName = content.includes('fetchShoppingList') ? 'fetchShoppingList' :
                           content.includes('fetchCostRecords') ? 'fetchCostRecords' :
                           content.includes('fetchIngredients') ? 'fetchIngredients' : 'refetch';
  
  if (!content.includes('useTabRefresh')) {
    // useEffect の後にタブ切り替え機能を追加
    content = content.replace(
      /(\/\/ 初回データ取得[\s\S]*?useEffect\(\(\) => \{[\s\S]*?\}, \[.*?\]\);)/,
      `$1\n\n  // タブ切り替え時の更新チェック機能（5分間隔）\n  const { markAsUpdated } = useTabRefresh(${fetchFunctionName}, 5);`
    );
    modified = true;
    console.log('  - タブ切り替え時の更新チェック機能を追加');
  }
  
  // markAsUpdated を各更新操作に追加
  updatePatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content) && !content.includes('markAsUpdated()')) {
      content = content.replace(pattern, replacement);
      modified = true;
      console.log('  - markAsUpdated() を追加');
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} を更新しました`);
  } else {
    console.log(`⏭️  ${filePath} は変更不要でした`);
  }
}

// メイン処理
console.log('🔄 リアルタイム更新削除スクリプト開始...\n');

targetFiles.forEach(file => {
  const filePath = path.join(hooksDir, file);
  processFile(filePath);
  console.log('');
});

console.log('✅ 全ファイルの処理が完了しました');