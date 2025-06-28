import { useState, useCallback } from 'react';

// バリデーションルールの型定義
type ValidationRule<T> = {
  field: keyof T;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: string | number | boolean | null | undefined, formData: T) => string | null;
  message?: string;
};

// バリデーションエラーの型
type ValidationErrors<T> = Partial<Record<keyof T, string>>;

// フォームバリデーションフックの戻り値
interface UseFormValidationReturn<T> {
  errors: ValidationErrors<T>;
  isValid: boolean;
  validate: (formData: T) => boolean;
  validateField: (field: keyof T, value: string | number | boolean | null | undefined, formData: T) => string | null;
  clearErrors: () => void;
  clearFieldError: (field: keyof T) => void;
}

// 汎用フォームバリデーションフック
export const useFormValidation = <T extends Record<string, string | number | boolean | null | undefined>>(
  rules: ValidationRule<T>[]
): UseFormValidationReturn<T> => {
  const [errors, setErrors] = useState<ValidationErrors<T>>({});

  // 単一フィールドのバリデーション
  const validateField = useCallback((field: keyof T, value: string | number | boolean | null | undefined, formData: T): string | null => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return null;

    // 必須チェック
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${String(field)}は必須です`;
    }

    // 値が空の場合は以下のチェックをスキップ
    if (!value || (typeof value === 'string' && !value.trim())) {
      return null;
    }

    // 文字数チェック
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `${String(field)}は${rule.minLength}文字以上で入力してください`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${String(field)}は${rule.maxLength}文字以下で入力してください`;
      }
    }

    // 正規表現チェック
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${String(field)}の形式が正しくありません`;
    }

    // カスタムバリデーション
    if (rule.customValidator) {
      return rule.customValidator(value, formData);
    }

    return null;
  }, [rules]);

  // 全フィールドのバリデーション
  const validate = useCallback((formData: T): boolean => {
    const newErrors: ValidationErrors<T> = {};
    let hasErrors = false;

    for (const rule of rules) {
      const error = validateField(rule.field, formData[rule.field], formData);
      if (error) {
        newErrors[rule.field] = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);
    return !hasErrors;
  }, [rules, validateField]);

  // エラーをクリア
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // 特定フィールドのエラーをクリア
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  // 全体のバリデーション状態
  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError
  };
};

// よく使用されるバリデーションルールのヘルパー
export const commonValidationRules = {
  required: <T>(field: keyof T, message?: string): ValidationRule<T> => ({
    field,
    required: true,
    message
  }),
  
  email: <T>(field: keyof T): ValidationRule<T> => ({
    field,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '有効なメールアドレスを入力してください'
  }),
  
  url: <T>(field: keyof T): ValidationRule<T> => ({
    field,
    pattern: /^https?:\/\/.+/,
    message: '有効なURLを入力してください'
  }),
  
  positiveNumber: <T>(field: keyof T): ValidationRule<T> => ({
    field,
    customValidator: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return '正の数値を入力してください';
      }
      return null;
    }
  }),
  
  minLength: <T>(field: keyof T, length: number): ValidationRule<T> => ({
    field,
    minLength: length
  }),
  
  maxLength: <T>(field: keyof T, length: number): ValidationRule<T> => ({
    field,
    maxLength: length
  })
};
