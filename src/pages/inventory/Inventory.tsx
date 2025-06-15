import React, { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { AddInventoryModal } from './AddInventoryModal';

export const Inventory: React.FC = () => {
  const { inventory, loading, error, addInventoryItem } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600">エラー: {error}</div>
      </div>
    );
  }

  const categoryColors = {
    vegetables: 'bg-green-100 text-green-800',
    meat: 'bg-red-100 text-red-800',
    seasoning: 'bg-yellow-100 text-yellow-800',
    others: 'bg-gray-100 text-gray-800',
  };

  const locationLabels = {
    refrigerator: '冷蔵庫',
    freezer: '冷凍庫',
    pantry: '常温',
  };

  const isExpiringSoon = (expiryDate: string | undefined) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpired = (expiryDate: string | undefined) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">在庫管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          在庫追加
        </button>
      </div>

      {inventory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          まだ在庫が登録されていません
        </div>
      ) : (
        <div className="space-y-3">
          {inventory.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg p-4 shadow-sm border ${
                isExpired(item.expiry_date) 
                  ? 'border-red-300 bg-red-50' 
                  : isExpiringSoon(item.expiry_date) 
                  ? 'border-yellow-300 bg-yellow-50' 
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{item.ingredient?.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        categoryColors[item.ingredient?.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.ingredient?.category}
                    </span>
                    {item.is_leftover && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        作り置き
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>数量: {item.quantity} {item.unit}</div>
                    <div>保存場所: {locationLabels[item.location as keyof typeof locationLabels]}</div>
                    {item.expiry_date && (
                      <div className={
                        isExpired(item.expiry_date) 
                          ? 'text-red-600 font-medium' 
                          : isExpiringSoon(item.expiry_date) 
                          ? 'text-yellow-600 font-medium' 
                          : ''
                      }>
                        賞味期限: {new Date(item.expiry_date).toLocaleDateString('ja-JP')}
                        {isExpired(item.expiry_date) && ' (期限切れ)'}
                        {isExpiringSoon(item.expiry_date) && !isExpired(item.expiry_date) && ' (期限間近)'}
                      </div>
                    )}
                    {item.purchase_price && (
                      <div>購入価格: ¥{item.purchase_price}</div>
                    )}
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddInventoryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
          }}
          addInventoryItem={addInventoryItem}
        />
      )}
    </div>
  );
};