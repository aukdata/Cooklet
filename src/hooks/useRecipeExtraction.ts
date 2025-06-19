// レシピ抽出機能のカスタムフック

import { useState, useCallback } from 'react';
import { WebFetcher, WebFetchError } from '../lib/web-fetch';
import { AIProviderFactory } from '../lib/ai/provider-factory';
import type { RecipeExtraction } from '../lib/ai/types';
import { RecipeExtractionError } from '../lib/ai/types';

export interface RecipeExtractionState {
  isLoading: boolean;
  isExtracting: boolean;
  error: string | null;
  result: RecipeExtraction | null;
  progress: {
    step: 'idle' | 'fetching' | 'extracting' | 'completed' | 'error';
    message: string;
  };
}

export interface UseRecipeExtractionReturn {
  state: RecipeExtractionState;
  extractFromUrl: (url: string) => Promise<RecipeExtraction | null>;
  clearResult: () => void;
  clearError: () => void;
}

// レシピ抽出フックの実装
export const useRecipeExtraction = (): UseRecipeExtractionReturn => {
  const [state, setState] = useState<RecipeExtractionState>({
    isLoading: false,
    isExtracting: false,
    error: null,
    result: null,
    progress: {
      step: 'idle',
      message: ''
    }
  });

  // URLからレシピ情報を抽出
  const extractFromUrl = useCallback(async (url: string): Promise<RecipeExtraction | null> => {
    try {
      // 初期化
      setState(prev => ({
        ...prev,
        isLoading: true,
        isExtracting: true,
        error: null,
        result: null,
        progress: {
          step: 'fetching',
          message: 'Webサイトからコンテンツを取得中...'
        }
      }));

      // WebサイトからHTMLを取得
      const webFetcher = new WebFetcher();
      const fetchedWebsite = await webFetcher.fetchWebsite(url);

      // 進行状況を更新
      setState(prev => ({
        ...prev,
        progress: {
          step: 'extracting',
          message: 'レシピ情報を抽出中...'
        }
      }));

      // AI Providerを作成
      const aiProvider = AIProviderFactory.createFromEnvironment();

      // レシピ情報を抽出
      const extraction = await aiProvider.extractRecipeFromHtml(
        fetchedWebsite.html,
        fetchedWebsite.url
      );

      // 成功
      setState(prev => ({
        ...prev,
        isLoading: false,
        isExtracting: false,
        result: extraction,
        progress: {
          step: 'completed',
          message: `レシピ情報の抽出が完了しました（信頼度: ${Math.round(extraction.confidence * 100)}%）`
        }
      }));

      return extraction;

    } catch (error) {
      let errorMessage = 'レシピの抽出に失敗しました';
      let detailedMessage = '';
      
      if (error instanceof WebFetchError) {
        if (error.status === 503) {
          errorMessage = 'サーバーが一時的に利用できません';
          detailedMessage = 'しばらく時間をおいてから再度お試しください。複数のプロキシサーバーを試行しましたが、すべて失敗しました。';
        } else if (error.status === 429) {
          errorMessage = 'アクセス制限に達しました';
          detailedMessage = '時間をおいてから再度お試しください。';
        } else if (error.status === 403) {
          errorMessage = 'アクセスが拒否されました';
          detailedMessage = 'このサイトはレシピ抽出に対応していない可能性があります。手動でレシピ情報を入力してください。';
        } else if (error.status === 404) {
          errorMessage = 'ページが見つかりません';
          detailedMessage = 'URLが正しいか確認してください。';
        } else {
          errorMessage = `Webサイトの取得エラー: ${error.message}`;
          detailedMessage = 'ネットワーク接続を確認するか、しばらく時間をおいてから再度お試しください。';
        }
      } else if (error instanceof RecipeExtractionError) {
        errorMessage = `抽出エラー: ${error.message}`;
        detailedMessage = 'このサイトからレシピ情報を自動抽出できませんでした。手動でレシピ情報を入力してください。';
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'リクエストがタイムアウトしました';
          detailedMessage = 'ネットワーク接続が遅いか、サーバーの応答が遅い可能性があります。';
        } else {
          errorMessage = error.message;
          detailedMessage = '予期しないエラーが発生しました。';
        }
      }

      const fullErrorMessage = detailedMessage ? `${errorMessage}\n${detailedMessage}` : errorMessage;

      setState(prev => ({
        ...prev,
        isLoading: false,
        isExtracting: false,
        error: fullErrorMessage,
        result: null,
        progress: {
          step: 'error',
          message: fullErrorMessage
        }
      }));

      // コンソールに詳細なエラー情報を出力（開発用）
      console.error('レシピ抽出エラー:', {
        url,
        error,
        message: errorMessage,
        details: detailedMessage
      });

      return null;
    }
  }, []);

  // 結果をクリア
  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
      progress: {
        step: 'idle',
        message: ''
      }
    }));
  }, []);

  // エラーをクリア
  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      progress: prev.progress.step === 'error' ? {
        step: 'idle',
        message: ''
      } : prev.progress
    }));
  }, []);

  return {
    state,
    extractFromUrl,
    clearResult,
    clearError
  };
};

// レシピ抽出結果の検証ユーティリティ
export const validateRecipeExtraction = (extraction: RecipeExtraction): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // レシピサイト判定の検証
  if (!extraction.isRecipeSite) {
    issues.push('レシピサイトではない可能性があります');
    suggestions.push('URLを確認するか、手動でレシピ情報を入力してください');
  }

  // タイトルの検証
  if (!extraction.title || extraction.title.trim().length < 2) {
    issues.push('レシピ名が短すぎます');
    suggestions.push('レシピ名を手動で入力してください');
  }

  // 人数の検証
  if (extraction.servings < 1 || extraction.servings > 20) {
    issues.push('人数設定が不適切です');
    suggestions.push('1-20人の範囲で人数を設定してください');
  }

  // 材料の検証
  if (!extraction.ingredients || extraction.ingredients.length === 0) {
    issues.push('材料が検出されませんでした');
    suggestions.push('材料を手動で追加してください');
  } else {
    // 材料名の検証
    const emptyIngredients = extraction.ingredients.filter(ing => !ing.name.trim());
    if (emptyIngredients.length > 0) {
      issues.push('空の材料名があります');
      suggestions.push('空の材料を削除または名前を入力してください');
    }

    // 材料の数量・単位検証
    const invalidQuantities = extraction.ingredients.filter(ing => 
      ing.quantity && ing.quantity !== '適量' && ing.quantity !== '少々' && !ing.quantity.match(/^[\d.\s/]+$/)
    );
    if (invalidQuantities.length > 0) {
      suggestions.push('一部の数量形式を確認してください');
    }
  }

  // 信頼度の検証
  if (extraction.confidence < 0.5) {
    issues.push('抽出結果の信頼度が低いです');
    suggestions.push('内容を確認して必要に応じて手動で修正してください');
  }

  // タグの検証
  if (extraction.isRecipeSite && extraction.suggestedTags.length === 0) {
    suggestions.push('適切なタグを手動で追加することをお勧めします');
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
};