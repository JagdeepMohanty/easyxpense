/**
 * Socket.IO Client for Realtime Updates
 * 
 * Usage:
 * import { socketService } from './services/socketService';
 * 
 * // Connect and authenticate
 * socketService.connect(userId);
 * 
 * // Listen for events
 * socketService.on('expense_added', (data) => {
 *   console.log('New expense:', data);
 *   // Update UI
 * });
 * 
 * // Join group room
 * socketService.joinGroup(groupId);
 * 
 * // Disconnect
 * socketService.disconnect();
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId) {
    if (this.socket && this.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected = true;
      
      // Authenticate user
      if (userId) {
        this.socket.emit('authenticate', { user_id: userId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Group management
  joinGroup(groupId) {
    if (this.socket && this.connected) {
      this.socket.emit('join_group', { group_id: groupId });
      console.log('Joined group:', groupId);
    }
  }

  leaveGroup(groupId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave_group', { group_id: groupId });
      console.log('Left group:', groupId);
    }
  }

  // Check connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
export const socketService = new SocketService();

// Export event names for consistency
export const SOCKET_EVENTS = {
  EXPENSE_ADDED: 'expense_added',
  EXPENSE_UPDATED: 'expense_updated',
  DEBT_SETTLED: 'debt_settled',
  REMINDER_DUE: 'reminder_due'
};
