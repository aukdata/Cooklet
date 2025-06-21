// 通知サービス - 朝の定期通知とスケジュール管理

export interface MorningNotificationSettings {
  enabled: boolean;
  time: string; // "HH:MM" 形式
}

class NotificationService {
  private scheduledTimeouts: Set<NodeJS.Timeout> = new Set();

  // 朝の通知をスケジュール
  scheduleMorningNotification(settings: MorningNotificationSettings, _userId: string): void {
    if (!settings.enabled || !('Notification' in window)) {
      return;
    }

    // 既存のスケジュールをクリア
    this.clearMorningNotifications();

    const scheduleDaily = () => {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);
      
      // 今日の指定時刻
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      
      // 明日の指定時刻
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hours, minutes, 0, 0);
      
      // 今日の指定時刻がまだ過ぎていなければ今日、過ぎていれば明日
      const nextNotificationTime = now < today ? today : tomorrow;
      
      const msUntilNotification = nextNotificationTime.getTime() - now.getTime();
      
      // 朝の通知をスケジュール
      const timeout = setTimeout(async () => {
        await this.sendMorningNotification();
        // 次の日の通知をスケジュール
        scheduleDaily();
      }, msUntilNotification);
      
      this.scheduledTimeouts.add(timeout);
    };

    scheduleDaily();
  }

  // 朝の通知を送信
  private async sendMorningNotification(): Promise<void> {
    try {
      if (Notification.permission !== 'granted') {
        return;
      }

      const notification = new Notification('🍳 Cooklet', {
        body: '期限の近い食材があります',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'morning-notification',
        requireInteraction: false,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('朝の通知を送信しました');
    } catch (error) {
      console.error('朝の通知の送信に失敗しました:', error);
    }
  }

  // 朝の通知スケジュールをクリア
  clearMorningNotifications(): void {
    this.scheduledTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    this.scheduledTimeouts.clear();
  }

  // 通知権限を要求
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('通知が拒否されています');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('通知権限の要求に失敗しました:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();