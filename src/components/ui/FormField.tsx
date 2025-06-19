// フォームフィールドコンポーネント - ラベル付きフィールドの統一

import { type ReactNode } from 'react';

export interface FormFieldProps {
  /** フィールドのラベル */
  label: string;
  /** ラベル前の絵文字アイコン（任意） */
  icon?: string;
  /** フィールドのコンテンツ（input, select, textareaなど） */
  children: ReactNode;
  /** 必須項目フラグ */
  required?: boolean;
  /** エラーメッセージ */
  error?: string;
  /** フィールド全体のクラス名（カスタマイズ用） */
  className?: string;
}

/**
 * フォームフィールドコンポーネント
 * 
 * 統一されたラベル付きフィールドを提供：
 * - ラベル（絵文字 + テキスト + 必須マーク）
 * - フィールドコンテンツ
 * - エラーメッセージ表示
 */
export const FormField = ({
  label,
  icon,
  children,
  required = false,
  error,
  className = ''
}: FormFieldProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {/* ラベル */}
      <label className="block text-sm font-medium text-gray-700">
        {icon && <span className="mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        :
      </label>

      {/* フィールドコンテンツ */}
      {children}

      {/* エラーメッセージ */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// よく使用される入力フィールドのプリセット

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

/**
 * テキスト入力フィールド（FormFieldと組み合わせ用）
 */
export const TextInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  maxLength,
  className = ''
}: TextInputProps) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    />
  );
};

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

/**
 * テキストエリアフィールド（FormFieldと組み合わせ用）
 */
export const TextArea = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 3,
  maxLength,
  className = ''
}: TextAreaProps) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      maxLength={maxLength}
      className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-y ${className}`}
    />
  );
};

interface NumberInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

/**
 * 数値入力フィールド（FormFieldと組み合わせ用）
 */
export const NumberInput = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  min,
  max,
  step = 1,
  className = ''
}: NumberInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange('');
    } else {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        onChange(numVal);
      }
    }
  };

  return (
    <input
      type="number"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    />
  );
};