import React, { useState, useRef } from 'react';
import { NameQuantityUnitInput } from '../common/NameQuantityUnitInput';
import { useToast } from '../../hooks/useToast.tsx';
import { readReceiptFromImage, validateImageFile, type ReceiptItem, type ReceiptResult } from '../../utils/receiptReader';
import { type FoodUnit, parseQuantity } from '../../constants/units';
import { type Ingredient } from '../../types';

interface EditableReceiptItem {
  originalName?: string;
  name: string;
  quantity: string;
  unit: FoodUnit;
  price?: number;
}

interface ReceiptReaderProps {
  /** 食材マスタデータ（商品名正規化用） */
  ingredients: Ingredient[];
  /** 食材マスタ追加関数 */
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  /** 買い物リストアイテム追加関数 */
  addShoppingItem: (item: { name: string; quantity?: { amount: string; unit: string }; checked: boolean; added_from: 'manual' | 'auto' }) => Promise<void>;
}

/**
 * レシート読み取り機能コンポーネント
 * OCR処理、結果編集、買い物リスト追加を統合
 */
export const ReceiptReader: React.FC<ReceiptReaderProps> = ({
  ingredients,
  addIngredient,
  addShoppingItem
}) => {
  const { showError, showSuccess } = useToast();

  // レシート読み取り関連の状態
  const [isReadingReceipt, setIsReadingReceipt] = useState(false);
  const [receiptResult, setReceiptResult] = useState<ReceiptResult | null>(null);
  const [editingReceiptItems, setEditingReceiptItems] = useState<EditableReceiptItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // レシート読み取り機能
  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイル妥当性チェック
    if (!validateImageFile(file)) {
      showError('JPEGまたはPNG形式の画像ファイル（10MB以下）を選択してください');
      return;
    }

    setIsReadingReceipt(true);
    
    try {
      // 食材マスタデータを渡してレシート読み取り実行（商品名正規化付き）
      const result: ReceiptResult = await readReceiptFromImage(file, ingredients);
      
      // レシート読み取り結果を状態に保存し、編集可能にする
      setReceiptResult(result);
      
      // 編集用のアイテムリストを初期化（nameが空欄のものを除外し、quantityを分解してunit付きに）
      const editableItems = result.items
        .filter((item: ReceiptItem) => item.name && item.name.trim()) // nameが空欄のものを除外
        .map((item: ReceiptItem) => {
          const parsed = parseQuantity(item.quantity || '');
          const quantity = parsed.amount;
          const unit = parsed.unit;
          return {
            originalName: item.originalName,
            name: item.name,
            quantity,
            unit: unit as FoodUnit,
            price: item.price
          };
        });
      setEditingReceiptItems(editableItems);
      
      showSuccess(`レシートから${result.items.length}件のアイテムを読み取りました。`);
    } catch (err) {
      console.error('レシート読み取りに失敗しました:', err);
      showError('レシート読み取りに失敗しました');
    } finally {
      setIsReadingReceipt(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // レシートアップロードボタンクリック
  const handleReceiptButtonClick = () => {
    fileInputRef.current?.click();
  };

  // レシート読み取り結果のアイテムを編集する関数
  const handleEditReceiptItem = (index: number, field: 'name' | 'quantity' | 'unit', value: string) => {
    setEditingReceiptItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: field === 'unit' ? value as FoodUnit : value } : item
      )
    );
  };

  // 編集したレシート結果を完了済みアイテムに追加し、未登録の食材を自動登録する関数
  const handleAddReceiptItemsToList = async () => {
    if (editingReceiptItems.length === 0) return;

    try {
      let addedCount = 0;
      let registeredCount = 0;

      for (const item of editingReceiptItems) {
        if (item.name.trim()) {
          // 1. まず食材マスタに登録されているかチェック
          const originalNameForSearch = item.originalName || item.name;
          const existingIngredient = ingredients.find(ing => 
            ing.name === item.name || 
            (ing.original_name && new RegExp(ing.original_name, 'i').test(originalNameForSearch))
          );

          // 2. 未登録の場合は自動登録
          if (!existingIngredient) {
            try {
              // 基本的な推測でカテゴリを決定
              let category: 'vegetables' | 'meat' | 'seasoning' | 'others' = 'others';
              const itemName = item.name.toLowerCase();
              if (itemName.includes('野菜') || itemName.includes('レタス') || itemName.includes('人参') || 
                  itemName.includes('玉ねぎ') || itemName.includes('じゃがいも') || itemName.includes('トマト')) {
                category = 'vegetables';
              } else if (itemName.includes('肉') || itemName.includes('魚') || itemName.includes('鶏') || 
                         itemName.includes('豚') || itemName.includes('牛') || itemName.includes('まぐろ')) {
                category = 'meat';
              } else if (itemName.includes('塩') || itemName.includes('砂糖') || itemName.includes('醤油') || 
                         itemName.includes('味噌') || itemName.includes('酢') || itemName.includes('油')) {
                category = 'seasoning';
              }

              await addIngredient({
                name: item.name,
                category,
                default_unit: item.unit !== '-' ? item.unit : '個',
                typical_price: item.price,
                infinity: false,
                original_name: originalNameForSearch !== item.name ? originalNameForSearch : item.name
              });
              registeredCount++;
            } catch (err) {
              console.error(`食材マスタへの登録に失敗: ${item.name}`, err);
            }
          }

          // 3. 買い物リストに完了済みとして追加
          const quantityObj = item.quantity ? { amount: item.quantity, unit: item.unit !== '-' ? item.unit : '' } : undefined;
          await addShoppingItem({
            name: item.name.trim(),
            quantity: quantityObj,
            checked: true, // 完了済みとして追加
            added_from: 'manual' // レシートから追加したものは手動扱い
          });
          addedCount++;
        }
      }

      // レシート読み取り結果をクリア
      setReceiptResult(null);
      setEditingReceiptItems([]);
      
      const messages = [];
      if (addedCount > 0) messages.push(`${addedCount}件のアイテムを完了済みリストに追加`);
      if (registeredCount > 0) messages.push(`${registeredCount}件の食材を自動登録`);
      
      showSuccess(messages.join('、') + 'しました！');
    } catch (err) {
      console.error('アイテムの追加に失敗しました:', err);
      showError('アイテムの追加に失敗しました');
    }
  };

  // レシート読み取り結果をキャンセルする関数
  const handleCancelReceiptResult = () => {
    setReceiptResult(null);
    setEditingReceiptItems([]);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
      <h3 className="font-medium text-gray-900 mb-3 flex items-center">
        <span className="mr-2">📄</span>
        レシートから追加
      </h3>
      
      {/* ファイルアップロードボタン */}
      <div className="flex gap-2 mb-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleReceiptUpload}
          className="hidden"
        />
        <button
          onClick={handleReceiptButtonClick}
          disabled={isReadingReceipt}
          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isReadingReceipt ? '読み取り中...' : '📄 レシートから追加'}
        </button>
      </div>

      {/* レシート読み取り結果表示・編集エリア */}
      {receiptResult && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-900 mb-3">
            📄 レシート読み取り結果（編集可能）
          </h4>
          
          {editingReceiptItems.length > 0 && (
            <div className="space-y-3 mb-4">
              {editingReceiptItems.map((item, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <NameQuantityUnitInput
                    name={item.name}
                    quantity={item.quantity}
                    unit={item.unit}
                    onNameChange={(value) => handleEditReceiptItem(index, 'name', value)}
                    onQuantityChange={(value) => handleEditReceiptItem(index, 'quantity', value)}
                    onUnitChange={(value) => handleEditReceiptItem(index, 'unit', value)}
                    placeholders={{
                      name: '商品名',
                      quantity: '数量',
                      unit: '単位'
                    }}
                  />
                  {item.price && (
                    <div className="text-sm text-gray-600 mt-1">
                      価格: ¥{item.price}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={handleAddReceiptItemsToList}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              ✅ 完了済みリストに追加
            </button>
            <button
              onClick={handleCancelReceiptResult}
              className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
};