import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Socket bağlantısı kuruldu:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket bağlantısı kesildi');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket bağlantı hatası:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Admin paneline katılma
  joinAdminRoom() {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-admin');
    }
  }

  // Masa odasına katılma
  joinTableRoom(tableId) {
    if (this.socket && this.isConnected && tableId) {
      this.socket.emit('join-table', tableId);
    }
  }

  // Event listener ekleme
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Event listener kaldırma
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Tüm event listener'ları kaldırma
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;