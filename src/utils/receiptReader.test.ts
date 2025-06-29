import { describe, it, expect, vi } from 'vitest';
import {
  calculateTotalPrice,
  validateImageFile,
  readReceiptFromImage,
  type ReceiptItem
} from './receiptReader';
import type { Ingredient } from '../types';

// 外部依存をモック
vi.mock('../lib/vision/vision-client', () => ({
  createVisionClient: vi.fn(() => ({
    extractTextFromImage: vi.fn()
  })),
  OCRError: class extends Error {}
}));

vi.mock('../lib/ai/provider-factory', () => ({
  AIProviderFactory: {
    create: vi.fn(() => ({
      extractReceiptFromText: vi.fn()
    })),
    createFromEnvironment: vi.fn(() => ({
      extractReceiptFromText: vi.fn()
    }))
  }
}));

vi.mock('./nameNormalizer', () => ({
  normalizeReceiptItems: vi.fn((items) => 
    items.map((item: unknown) => ({
      ...item,
      item: {
        ...item,
        name: item.name || item.originalName
      },
      normalizationResult: { 
        item: {
          ...item,
          name: item.name || item.originalName
        },
        isNormalized: false 
      }
    }))
  )
}));

describe('receiptReader', () => {
  
  describe('calculateTotalPrice', () => {
    it('should calculate total price correctly', () => {
      const items: ReceiptItem[] = [
        { originalName: '牛乳', name: '牛乳', quantity: '1', price: 200 },
        { originalName: 'パン', name: 'パン', quantity: '1', price: 150 },
        { originalName: '卵', name: '卵', quantity: '1', price: 300 }
      ];

      const total = calculateTotalPrice(items);
      expect(total).toBe(650);
    });

    it('should filter out items without price', () => {
      const items: ReceiptItem[] = [
        { originalName: '牛乳', name: '牛乳', quantity: '1', price: 200 },
        { originalName: 'パン', name: 'パン', quantity: '1' }, // 価格なし
        { originalName: '卵', name: '卵', quantity: '1', price: 300 }
      ];

      const total = calculateTotalPrice(items);
      expect(total).toBe(500);
    });

    it('should handle empty array', () => {
      const total = calculateTotalPrice([]);
      expect(total).toBe(0);
    });

    it('should handle items with zero price', () => {
      const items: ReceiptItem[] = [
        { originalName: '無料サンプル', name: '無料サンプル', quantity: '1', price: 0 },
        { originalName: '牛乳', name: '牛乳', quantity: '1', price: 200 }
      ];

      const total = calculateTotalPrice(items);
      expect(total).toBe(200);
    });

    it('should handle invalid price types', () => {
      const items: ReceiptItem[] = [
        { originalName: '牛乳', name: '牛乳', quantity: '1', price: 200 },
        { originalName: 'パン', name: 'パン', quantity: '1', price: '150' as unknown as number }, // テスト用の文字列価格
        { originalName: '卵', name: '卵', quantity: '1', price: null as unknown as number } // テスト用のnull価格
      ];

      const total = calculateTotalPrice(items);
      expect(total).toBe(200); // 数値のみが対象
    });
  });

  describe('validateImageFile', () => {
    it('should validate JPEG files', () => {
      const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(validateImageFile(jpegFile)).toBe(true);
    });

    it('should validate PNG files', () => {
      const pngFile = new File([''], 'test.png', { type: 'image/png' });
      expect(validateImageFile(pngFile)).toBe(true);
    });

    it('should validate WebP files', () => {
      const webpFile = new File([''], 'test.webp', { type: 'image/webp' });
      expect(validateImageFile(webpFile)).toBe(true);
    });

    it('should reject unsupported file types', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
      
      expect(validateImageFile(textFile)).toBe(false);
      expect(validateImageFile(pdfFile)).toBe(false);
    });

    it('should reject files larger than 10MB', () => {
      // 10MB + 1byteのファイルを作成
      const largeContent = new ArrayBuffer(10 * 1024 * 1024 + 1);
      const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      
      expect(validateImageFile(largeFile)).toBe(false);
    });

    it('should accept files exactly 10MB', () => {
      // 正確に10MBのファイルを作成
      const exactContent = new ArrayBuffer(10 * 1024 * 1024);
      const exactFile = new File([exactContent], 'exact.jpg', { type: 'image/jpeg' });
      
      expect(validateImageFile(exactFile)).toBe(true);
    });

    it('should handle empty files', () => {
      const emptyFile = new File([''], 'empty.jpg', { type: 'image/jpeg' });
      expect(validateImageFile(emptyFile)).toBe(true);
    });
  });

  describe('readReceiptFromImage (mocked)', () => {
    it('should handle successful OCR and extraction', async () => {
      // VisionClientのモック設定
      const { createVisionClient } = await import('../lib/vision/vision-client');
      const mockVisionClient = {
        extractTextFromImage: vi.fn().mockResolvedValue({
          fullText: 'レシートテキスト\n牛乳 200円\nパン 150円',
          confidence: 0.95
        })
      };
      (createVisionClient as unknown as jest.Mock).mockReturnValue(mockVisionClient);

      // AIProviderのモック設定
      const { AIProviderFactory } = await import('../lib/ai/provider-factory');
      const mockProvider = {
        extractReceiptFromText: vi.fn().mockResolvedValue({
          items: [
            { originalName: '牛乳', name: '牛乳', quantity: '1', price: 200 },
            { originalName: 'パン', name: 'パン', quantity: '1', price: 150 }
          ],
          storeName: 'テストスーパー',
          date: '2025-06-15',
          confidence: 0.9
        })
      };
      (AIProviderFactory.createFromEnvironment as unknown as jest.Mock).mockReturnValue(mockProvider);

      const testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = await readReceiptFromImage(testFile);

      expect(result.items).toHaveLength(2);
      expect(result.totalPrice).toBe(350);
      expect(result.storeName).toBe('テストスーパー');
      expect(result.date).toBe('2025-06-15');
    });

    it('should handle OCR errors gracefully', async () => {
      const { createVisionClient, OCRError } = await import('../lib/vision/vision-client');
      const mockVisionClient = {
        extractTextFromImage: vi.fn().mockRejectedValue(new (OCRError as unknown as ErrorConstructor)('OCR failed'))
      };
      (createVisionClient as unknown as jest.Mock).mockReturnValue(mockVisionClient);

      const testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      await expect(readReceiptFromImage(testFile)).rejects.toThrow();
    });

    it('should normalize product names when ingredients provided', async () => {
      const { createVisionClient } = await import('../lib/vision/vision-client');
      const { AIProviderFactory } = await import('../lib/ai/provider-factory');
      const { normalizeReceiptItems } = await import('./nameNormalizer');

      // モックセットアップ
      const mockVisionClient = {
        extractTextFromImage: vi.fn().mockResolvedValue({
          fullText: 'レシートテキスト',
          confidence: 0.95
        })
      };
      (createVisionClient as unknown as jest.Mock).mockReturnValue(mockVisionClient);

      const mockProvider = {
        extractReceiptFromText: vi.fn().mockResolvedValue({
          items: [{ originalName: '牛乳', name: '牛乳', quantity: '1', price: 200 }],
          storeName: 'テストスーパー',
          date: '2025-06-15',
          confidence: 0.9
        })
      };
      (AIProviderFactory.createFromEnvironment as unknown as jest.Mock).mockReturnValue(mockProvider);

      const mockIngredients: Ingredient[] = [
        {
          id: 1,
          user_id: 'user1',
          name: '牛乳',
          category: 'others',
          default_unit: 'mL',
          typical_price: 200,
          original_name: 'テスト牛乳',
          conversion_quantity: '',
          conversion_unit: '',
          infinity: false,
          created_at: '2025-01-01T00:00:00Z'
        }
      ];

      const testFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      await readReceiptFromImage(testFile, mockIngredients);

      // 正規化関数が呼ばれることを確認
      expect(normalizeReceiptItems).toHaveBeenCalledWith(
        expect.any(Array),
        mockIngredients
      );
    });
  });

  // エッジケースのテスト
  describe('Edge cases', () => {
    it('should handle special characters in file names', () => {
      const specialFile = new File([''], 'テスト画像!@#$.jpg', { type: 'image/jpeg' });
      expect(validateImageFile(specialFile)).toBe(true);
    });

    it('should handle case-insensitive file extensions', () => {
      const upperFile = new File([''], 'test.JPG', { type: 'image/jpeg' });
      const mixedFile = new File([''], 'test.JpG', { type: 'image/jpeg' });
      
      expect(validateImageFile(upperFile)).toBe(true);
      expect(validateImageFile(mixedFile)).toBe(true);
    });

    it('should calculate total for very large numbers', () => {
      const items: ReceiptItem[] = [
        { originalName: '高額商品1', name: '高額商品1', quantity: '1', price: 999999 },
        { originalName: '高額商品2', name: '高額商品2', quantity: '1', price: 999999 }
      ];

      const total = calculateTotalPrice(items);
      expect(total).toBe(1999998);
    });

    it('should handle floating point prices', () => {
      const items: ReceiptItem[] = [
        { originalName: '牛乳', name: '牛乳', quantity: '1', price: 199.99 },
        { originalName: 'パン', name: 'パン', quantity: '1', price: 150.50 }
      ];

      const total = calculateTotalPrice(items);
      expect(total).toBeCloseTo(350.49, 2);
    });
  });

  // パフォーマンステスト
  describe('Performance', () => {
    it('should calculate total for large number of items efficiently', () => {
      const largeItemList: ReceiptItem[] = Array.from({ length: 10000 }, (_, i) => ({
        originalName: `商品${i}`,
        name: `商品${i}`,
        quantity: '1',
        price: 100
      }));

      const start = performance.now();
      const total = calculateTotalPrice(largeItemList);
      const end = performance.now();

      expect(total).toBe(1000000);
      expect(end - start).toBeLessThan(50); // 50ms以内で処理完了
    });

    it('should validate files quickly', () => {
      const testFile = new File(['small content'], 'test.jpg', { type: 'image/jpeg' });
      
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        validateImageFile(testFile);
      }
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // 1000回の検証が10ms以内
    });
  });
});