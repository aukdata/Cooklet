import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast.tsx';
import { EditButton } from '../ui/Button';

// ユーザープロフィールセクションコンポーネント
export const UserProfileSection: React.FC = () => {
  const { supabaseUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // ローカル状態
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // supabaseUserの変更を監視してdisplayNameを同期
  useEffect(() => {
    const fullName = supabaseUser?.user_metadata?.full_name || '';
    setDisplayName(fullName);
  }, [supabaseUser]);

  // 表示名保存処理
  const handleSaveDisplayName = async () => {
    if (!supabaseUser || !displayName.trim()) {
      showError('表示名を入力してください');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Supabase Authのuser_metadata更新API連携
      // 現在はローカル状態のみ更新
      console.log('表示名更新:', displayName);
      
      setIsEditing(false);
      showSuccess('表示名を更新しました');
    } catch (error) {
      console.error('表示名更新エラー:', error);
      showError('表示名の更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  // 編集キャンセル処理
  const handleCancelEdit = () => {
    const fullName = supabaseUser?.user_metadata?.full_name || '';
    setDisplayName(fullName);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>👤</span>
        ユーザー情報
      </h2>
      
      <div className="space-y-4">
        {/* メールアドレス（読み取り専用） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600">
            {supabaseUser?.email || 'メールアドレスが取得できません'}
          </div>
        </div>

        {/* 表示名（編集可能） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            表示名
          </label>
          
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="表示名を入力"
                disabled={isSaving}
              />
              <button
                onClick={handleSaveDisplayName}
                disabled={isSaving || !displayName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md">
              <span className="text-gray-900">
                {displayName || '表示名が設定されていません'}
              </span>
              <EditButton
                onClick={() => setIsEditing(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
