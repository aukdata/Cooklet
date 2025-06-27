/**
 * 数値換算ユーティリティのテストケース
 * 
 * このファイルは簡易テストケース集です。
 * 本格的なテストフレームワークが設定された場合は、
 * そちらに移行してください。
 */

import { parseQuantityString, fractionToDecimal, decimalToFraction } from './numberConverter';

/**
 * テストケース実行結果の型定義
 */
interface TestCase {
  readonly input: string;
  readonly expected: number | null;
  readonly description: string;
}

/**
 * テストケースの定義
 * issueで指定された要求通りのテストケース
 */
const testCases: readonly TestCase[] = [
  // 基本的な整数
  { input: '1', expected: 1, description: '整数の変換' },
  { input: '2', expected: 2, description: '整数の変換（2）' },
  { input: '10', expected: 10, description: '2桁整数の変換' },
  
  // 分数
  { input: '1/2', expected: 0.5, description: '基本的な分数の変換' },
  { input: '1/4', expected: 0.25, description: '1/4の変換' },
  { input: '3/4', expected: 0.75, description: '3/4の変換' },
  
  // 加算表現
  { input: '1 + 1/2', expected: 1.5, description: '加算表現の変換' },
  { input: '2 + 1/4', expected: 2.25, description: '加算表現の変換（2）' },
  
  // 帯分数
  { input: '2 1/2', expected: 2.5, description: '帯分数の変換' },
  { input: '1 3/4', expected: 1.75, description: '帯分数の変換（2）' },
  
  // 小数点
  { input: '1.5', expected: 1.5, description: '小数点の変換' },
  { input: '2.25', expected: 2.25, description: '小数点の変換（2）' },
  
  // null を返すべきケース
  { input: '少々', expected: null, description: '曖昧表現はnull' },
  { input: '', expected: null, description: '空文字はnull' },
  { input: '   ', expected: null, description: '空白のみはnull' },
  { input: 'ひとつまみ', expected: null, description: '曖昧表現（ひとつまみ）はnull' },
  { input: '適量', expected: null, description: '曖昧表現（適量）はnull' },
  
  // エラーケース
  { input: 'abc', expected: null, description: '文字列はnull' },
  { input: '1/0', expected: null, description: 'ゼロ除算はnull' },
] as const;

/**
 * テストケースを実行する関数
 */
function runTests(): void {
  console.log('=== 数値換算ユーティリティのテスト実行 ===\n');
  
  let passedCount: number = 0;
  let failedCount: number = 0;
  const failures: string[] = [];

  for (const testCase of testCases) {
    const result: number | null = parseQuantityString(testCase.input);
    const passed: boolean = result === testCase.expected;
    
    if (passed) {
      passedCount++;
      console.log(`✅ PASS: ${testCase.description}`);
      console.log(`   入力: "${testCase.input}" → 結果: ${result}`);
    } else {
      failedCount++;
      const failureMessage: string = `❌ FAIL: ${testCase.description}`;
      console.log(failureMessage);
      console.log(`   入力: "${testCase.input}"`);
      console.log(`   期待値: ${testCase.expected}, 実際の値: ${result}`);
      failures.push(failureMessage);
    }
    console.log('');
  }

  // 結果サマリー
  console.log('=== テスト結果サマリー ===');
  console.log(`総テスト数: ${testCases.length}`);
  console.log(`成功: ${passedCount}`);
  console.log(`失敗: ${failedCount}`);
  console.log(`成功率: ${((passedCount / testCases.length) * 100).toFixed(1)}%`);
  
  if (failedCount > 0) {
    console.log('\n失敗したテスト:');
    failures.forEach(failure => console.log(`  ${failure}`));
  } else {
    console.log('\n🎉 すべてのテストが成功しました！');
  }
}

/**
 * 補助関数のテスト
 */
function runHelperFunctionTests(): void {
  console.log('\n=== 補助関数のテスト ===\n');
  
  // fractionToDecimal のテスト
  console.log('fractionToDecimal のテスト:');
  console.log(`fractionToDecimal(1, 2) = ${fractionToDecimal(1, 2)} (期待値: 0.5)`);
  console.log(`fractionToDecimal(3, 4) = ${fractionToDecimal(3, 4)} (期待値: 0.75)`);
  console.log(`fractionToDecimal(1, 0) = ${fractionToDecimal(1, 0)} (期待値: null)`);
  
  // decimalToFraction のテスト
  console.log('\ndecimalToFraction のテスト:');
  console.log(`decimalToFraction(0.5) = "${decimalToFraction(0.5)}" (期待値: "1/2")`);
  console.log(`decimalToFraction(1.5) = "${decimalToFraction(1.5)}" (期待値: "1 1/2")`);
  console.log(`decimalToFraction(2) = "${decimalToFraction(2)}" (期待値: "2")`);
  console.log(`decimalToFraction(2.75) = "${decimalToFraction(2.75)}" (期待値: "2 3/4")`);
}

// テスト実行（ES module環境用）
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
  runHelperFunctionTests();
}

// エクスポート（他のファイルから利用する場合）
export { runTests, runHelperFunctionTests, testCases };