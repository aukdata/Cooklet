/**
 * 数値換算ユーティリティ
 * 料理の分量を表す文字列を数値に変換する関数群
 */

/**
 * 文字列を数値に変換する汎用ユーティリティ関数
 * 料理レシピで使われる様々な分量表現に対応
 * 
 * @param input - 変換対象の文字列
 * @returns 変換された数値、または変換不可能な場合はnull
 * 
 * @example
 * parseQuantityString('1') // → 1
 * parseQuantityString('1/2') // → 0.5
 * parseQuantityString('1 + 1/2') // → 1.5
 * parseQuantityString('2 1/2') // → 2.5
 * parseQuantityString('少々') // → null
 * parseQuantityString('') // → null
 */
export function parseQuantityString(input: string): number | null {
  // 空文字列の場合はnullを返す
  if (!input || input.trim() === '') {
    return null;
  }

  // 入力を正規化（前後の空白を削除）
  const trimmed: string = input.trim();
  
  // 日本語の曖昧な表現の場合はnullを返す
  const ambiguousTerms: string[] = ['少々', 'ひとつまみ', 'お好み', '適量', '適宜'];
  if (ambiguousTerms.some(term => trimmed.includes(term))) {
    return null;
  }

  try {
    // パターン1: 整数のみ（例: "1", "2"）
    const integerMatch: RegExpMatchArray | null = trimmed.match(/^(\d+)$/);
    if (integerMatch) {
      return parseInt(integerMatch[1], 10);
    }

    // パターン2: 分数のみ（例: "1/2", "3/4"）
    const fractionMatch: RegExpMatchArray | null = trimmed.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      const numerator: number = parseInt(fractionMatch[1], 10);
      const denominator: number = parseInt(fractionMatch[2], 10);
      if (denominator === 0) return null; // ゼロ除算を防ぐ
      return numerator / denominator;
    }

    // パターン3: 帯分数（例: "2 1/2", "1 3/4"）
    const mixedFractionMatch: RegExpMatchArray | null = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedFractionMatch) {
      const wholeNumber: number = parseInt(mixedFractionMatch[1], 10);
      const numerator: number = parseInt(mixedFractionMatch[2], 10);
      const denominator: number = parseInt(mixedFractionMatch[3], 10);
      if (denominator === 0) return null; // ゼロ除算を防ぐ
      return wholeNumber + (numerator / denominator);
    }

    // パターン4: 加算（例: "1 + 1/2", "2 + 1/4"）
    const additionMatch: RegExpMatchArray | null = trimmed.match(/^(\d+(?:\/\d+)?)\s*\+\s*(\d+(?:\/\d+)?)$/);
    if (additionMatch) {
      const leftValue: number | null = parseQuantityString(additionMatch[1]);
      const rightValue: number | null = parseQuantityString(additionMatch[2]);
      if (leftValue !== null && rightValue !== null) {
        return leftValue + rightValue;
      }
    }

    // パターン5: 小数点（例: "1.5", "2.25"）
    const decimalMatch: RegExpMatchArray | null = trimmed.match(/^(\d+(?:\.\d+)?)$/);
    if (decimalMatch) {
      return parseFloat(decimalMatch[1]);
    }

    // 上記のパターンに該当しない場合はnullを返す
    return null;

  } catch {
    // 変換エラーが発生した場合はnullを返す
    return null;
  }
}

/**
 * 分数を小数点表記に変換する補助関数
 * 
 * @param numerator - 分子
 * @param denominator - 分母
 * @returns 小数点表記の数値、またはゼロ除算の場合はnull
 */
export function fractionToDecimal(numerator: number, denominator: number): number | null {
  if (denominator === 0) {
    return null; // ゼロ除算を防ぐ
  }
  return numerator / denominator;
}

/**
 * 数値を分数表記の文字列に変換する補助関数
 * 
 * @param value - 変換対象の数値
 * @param precision - 分母の最大値（デフォルト: 16）
 * @returns 分数表記の文字列、または整数の場合はそのまま
 * 
 * @example
 * decimalToFraction(0.5) // → "1/2"
 * decimalToFraction(1.5) // → "1 1/2"
 * decimalToFraction(2) // → "2"
 */
export function decimalToFraction(value: number, precision: number = 16): string {
  // 整数の場合はそのまま返す
  if (Number.isInteger(value)) {
    return value.toString();
  }

  const wholeNumber: number = Math.floor(value);
  const fractionalPart: number = value - wholeNumber;

  // 分数部分を求める
  let bestNumerator: number = 1;
  let bestDenominator: number = 1;
  let minDifference: number = Math.abs(fractionalPart - bestNumerator / bestDenominator);

  for (let denominator = 2; denominator <= precision; denominator++) {
    const numerator: number = Math.round(fractionalPart * denominator);
    const difference: number = Math.abs(fractionalPart - numerator / denominator);
    
    if (difference < minDifference) {
      minDifference = difference;
      bestNumerator = numerator;
      bestDenominator = denominator;
    }
  }

  // 整数部分がある場合は帯分数として返す
  if (wholeNumber > 0) {
    return `${wholeNumber} ${bestNumerator}/${bestDenominator}`;
  } else {
    return `${bestNumerator}/${bestDenominator}`;
  }
}