class NotificationService {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      this.permission = await this.requestPermission();
    }
  }

  async requestPermission() {
    if (this.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  async show(title, options = {}) {
    if (!('Notification' in window)) {
      console.warn('Bu tarayıcı bildirim özelliğini desteklemiyor');
      return null;
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Bildirim izni verilmedi');
        return null;
      }
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto close after 5 seconds if not requiring interaction
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('Bildirim gösterilirken hata:', error);
      return null;
    }
  }

  // Predefined notification types
  showOrderNotification(orderData) {
    return this.show(`Yeni Sipariş - Masa ${orderData.tableName}`, {
      body: `Sipariş #${orderData.id} - Toplam: ${orderData.totalCost}₺`,
      icon: '/favicon.ico',
      tag: `order-${orderData.id}`,
      requireInteraction: true,
      actions: [
        {
          action: 'view',
          title: 'Görüntüle'
        },
        {
          action: 'dismiss',
          title: 'Kapat'
        }
      ]
    });
  }

  showStatusUpdateNotification(orderData) {
    const statusMessages = {
      'PENDING': 'Beklemede',
      'PREPARING': 'Hazırlanıyor',
      'READY': 'Hazır',
      'SERVED': 'Servis Edildi',
      'CANCELLED': 'İptal Edildi'
    };

    return this.show(`Sipariş Durumu Güncellendi`, {
      body: `Sipariş #${orderData.id} - ${statusMessages[orderData.status] || orderData.status}`,
      icon: '/favicon.ico',
      tag: `status-${orderData.id}`,
      requireInteraction: false
    });
  }

  showSuccessNotification(message) {
    return this.show('Başarılı', {
      body: message,
      icon: '/favicon.ico',
      requireInteraction: false
    });
  }

  showErrorNotification(message) {
    return this.show('Hata', {
      body: message,
      icon: '/favicon.ico',
      requireInteraction: true
    });
  }

  showInfoNotification(message) {
    return this.show('Bilgi', {
      body: message,
      icon: '/favicon.ico',
      requireInteraction: false
    });
  }

  showWarningNotification(message) {
    return this.show('⚠️ Uyarı', {
      body: message,
      icon: '/favicon.ico',
      requireInteraction: true,
      tag: 'low-stock-warning'
    });
  }

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window;
  }

  // Get current permission status
  getPermission() {
    return this.permission;
  }

  // Clear all notifications with a specific tag
  clearNotifications(tag) {
    if ('serviceWorker' in navigator && 'getNotifications' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications({ tag }).then(notifications => {
          notifications.forEach(notification => notification.close());
        });
      });
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;