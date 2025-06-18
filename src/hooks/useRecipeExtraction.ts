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
          message: 'AIでレシピ情報を抽出中...'
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
      
      if (error instanceof WebFetchError) {
        errorMessage = `Webサイトの取得エラー: ${error.message}`;
      } else if (error instanceof RecipeExtractionError) {
        errorMessage = `AI抽出エラー: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isExtracting: false,
        error: errorMessage,
        result: null,
        progress: {
          step: 'error',
          message: errorMessage
        }
      }));

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

  return {
    isValid: issues.length === 0,
    issues,
    suggestions
  };
};