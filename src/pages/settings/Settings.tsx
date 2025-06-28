import React from 'react';
import { UserProfileSection } from '../../components/settings/UserProfileSection';
import { NotificationSettingsSection } from '../../components/settings/NotificationSettingsSection';
import { AppInfoSection } from '../../components/settings/AppInfoSection';
import { SettingsActions } from '../../components/settings/SettingsActions';

// 設定ページコンポーネント（モジュール化済み）
export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>⚙️</span>
          設定
        </h1>
      </div>

      {/* ユーザープロフィールセクション */}
      <UserProfileSection />

      {/* 通知設定セクション */}
      <NotificationSettingsSection />

      {/* アプリ情報セクション */}
      <AppInfoSection />

      {/* 設定アクションセクション */}
      <SettingsActions />
    </div>
  );
};

