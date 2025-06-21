// レシート読み取り機能のモック実装
// 将来的にはOCR APIやAI APIと連携する予定

/**
 * レシート読み取り結果の型定義
 */
export interface ReceiptItem {
  name: string;
  quantity: string;
  price?: number;
}

/**
 * レシート読み取り結果
 */
export interface ReceiptResult {
  items: ReceiptItem[];
  totalAmount?: number;
  storeName?: string;
  date?: string;
}

/**
 * レシート画像を読み取って商品リストを返すモック関数
 * @param file - アップロードされた画像ファイル
 * @returns Promise<ReceiptResult> - 読み取り結果
 */
export const readReceiptFromImage = async (file: File): Promise<ReceiptResult> => {
  // モック処理：実際の画像処理の時間をシミュレート
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ファイル名やサイズに基づいてモックデータを変える
  const mockResults: ReceiptResult[] = [
    {
      items: [
        { name: "キャベツ", quantity: "1個", price: 198 },
        { name: "玉ねぎ", quantity: "3個", price: 168 },
        { name: "豚バラ肉", quantity: "300g", price: 398 },
        { name: "卵", quantity: "1パック", price: 248 },
        { name: "牛乳", quantity: "1L", price: 198 }
      ],
      totalAmount: 1210,
      storeName: "スーパーマーケット",
      date: new Date().toISOString().split('T')[0]
    },
    {
      items: [
        { name: "鶏むね肉", quantity: "2枚", price: 298 },
        { name: "ブロッコリー", quantity: "1株", price: 158 },
        { name: "にんじん", quantity: "3本", price: 98 },
        { name: "米", quantity: "5kg", price: 1980 },
        { name: "醤油", quantity: "1本", price: 168 }
      ],
      totalAmount: 2702,
      storeName: "食品館",
      date: new Date().toISOString().split('T')[0]
    },
    {
      items: [
        { name: "じゃがいも", quantity: "4個", price: 148 },
        { name: "トマト", quantity: "3個", price: 268 },
        { name: "レタス", quantity: "1玉", price: 128 },
        { name: "パン", quantity: "1斤", price: 118 },
        { name: "バター", quantity: "200g", price: 298 }
      ],
      totalAmount: 960,
      storeName: "コンビニ",
      date: new Date().toISOString().split('T')[0]
    }
  ];

  // ファイルサイズに基づいて異なるモックデータを返す
  const index = file.size % mockResults.length;
  return mockResults[index];
};

/**
 * 画像ファイルの妥当性チェック
 * @param file - チェックするファイル
 * @returns boolean - 妥当な画像ファイルかどうか
 */
export const validateImageFile = (file: File): boolean => {
  // ファイルタイプのチェック
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  // ファイルサイズのチェック（10MB以下）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return false;
  }

  return true;
};