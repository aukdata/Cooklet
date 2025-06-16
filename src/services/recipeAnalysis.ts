// レシピ解析サービス - レシピサイトからの情報抽出

export interface RecipeAnalysisResult {
  success: boolean;
  data?: {
    recipeName: string;
    servings: number;
    ingredients: { name: string; quantity: string }[];
  };
  error?: string;
}

// URLの妥当性をチェックする関数
export const isValidRecipeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

// レシピサイトからの情報を解析する関数（モック実装）
export const analyzeRecipeFromUrl = async (url: string): Promise<RecipeAnalysisResult> => {
  // URLの妥当性チェック
  if (!isValidRecipeUrl(url)) {
    return {
      success: false,
      error: 'HTTPまたはHTTPSから始まる有効なURLを入力してください'
    };
  }

  // モック実装：実際のLLM解析をシミュレート
  try {
    // 解析処理をシミュレート（2秒の遅延）
    await new Promise(resolve => setTimeout(resolve, 2000));

    // モックデータを返す（URLに応じて異なるデータを返す）
    if (url.includes('cookpad.com')) {
      return {
        success: true,
        data: {
          recipeName: 'ふわふわハンバーグ',
          servings: 2,
          ingredients: [
            { name: '牛ひき肉', quantity: '300g' },
            { name: '玉ねぎ', quantity: '1個' },
            { name: 'パン粉', quantity: '30g' },
            { name: '卵', quantity: '1個' },
            { name: '牛乳', quantity: '50ml' },
            { name: '塩コショウ', quantity: '適量' }
          ]
        }
      };
    } else if (url.includes('kurashiru.com')) {
      return {
        success: true,
        data: {
          recipeName: '簡単親子丼',
          servings: 1,
          ingredients: [
            { name: '鶏もも肉', quantity: '150g' },
            { name: '卵', quantity: '2個' },
            { name: '玉ねぎ', quantity: '1/2個' },
            { name: 'ご飯', quantity: '1杯' },
            { name: '醤油', quantity: '大さじ2' },
            { name: 'みりん', quantity: '大さじ1' },
            { name: 'だしの素', quantity: '小さじ1' }
          ]
        }
      };
    } else if (url.includes('recipe.rakuten.co.jp')) {
      return {
        success: true,
        data: {
          recipeName: 'トマトパスタ',
          servings: 2,
          ingredients: [
            { name: 'パスタ', quantity: '200g' },
            { name: 'トマト缶', quantity: '1缶' },
            { name: 'にんにく', quantity: '2片' },
            { name: 'オリーブオイル', quantity: '大さじ2' },
            { name: 'バジル', quantity: '適量' },
            { name: '塩', quantity: '適量' }
          ]
        }
      };
    } else {
      // 一般的なレシピサイトの場合
      return {
        success: true,
        data: {
          recipeName: 'おいしい料理',
          servings: 2,
          ingredients: [
            { name: '食材1', quantity: '適量' },
            { name: '食材2', quantity: '適量' }
          ]
        }
      };
    }
  } catch {
    return {
      success: false,
      error: 'レシピの解析中にエラーが発生しました'
    };
  }
};

// 将来的なLLM実装のためのプレースホルダー
export const analyzeRecipeWithLLM = async (url: string): Promise<RecipeAnalysisResult> => {
  // TODO: 実際のLLM API（OpenAI, Claude等）を使用した実装
  // 現在はモック実装を使用
  return analyzeRecipeFromUrl(url);
};