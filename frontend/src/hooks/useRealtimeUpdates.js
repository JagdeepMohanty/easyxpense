/**
 * React Hook for Socket.IO Realtime Updates
 * 
 * Usage:
 * import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
 * 
 * function Dashboard() {
 *   const { expenses, refreshExpenses } = useExpenses();
 *   
 *   useRealtimeUpdates({
 *     onExpenseAdded: (data) => {
 *       toast.success(`New expense: ${data.description}`);
 *       refreshExpenses();
 *     },
 *     onDebtSettled: (data) => {
 *       toast.success(`Debt settled: ${data.from_user} → ${data.to_user}`);
 *       refreshExpenses();
 *     },
 *     onReminderDue: (data) => {
 *       toast.info(`Reminder: ${data.title} - ₹${data.amount}`);
 *     }
 *   });
 *   
 *   return <div>...</div>;
 * }
 */

import { useEffect } from 'react';
import { socketService, SOCKET_EVENTS } from '../services/socketService';

export const useRealtimeUpdates = ({
  onExpenseAdded,
  onExpenseUpdated,
  onDebtSettled,
  onReminderDue,
  userId,
  groupId
}) => {
  useEffect(() => {
    // Connect socket
    if (userId) {
      socketService.connect(userId);
    }

    // Join group if provided
    if (groupId) {
      socketService.joinGroup(groupId);
    }

    // Register event listeners
    if (onExpenseAdded) {
      socketService.on(SOCKET_EVENTS.EXPENSE_ADDED, onExpenseAdded);
    }

    if (onExpenseUpdated) {
      socketService.on(SOCKET_EVENTS.EXPENSE_UPDATED, onExpenseUpdated);
    }

    if (onDebtSettled) {
      socketService.on(SOCKET_EVENTS.DEBT_SETTLED, onDebtSettled);
    }

    if (onReminderDue) {
      socketService.on(SOCKET_EVENTS.REMINDER_DUE, onReminderDue);
    }

    // Cleanup
    return () => {
      if (onExpenseAdded) {
        socketService.off(SOCKET_EVENTS.EXPENSE_ADDED, onExpenseAdded);
      }
      if (onExpenseUpdated) {
        socketService.off(SOCKET_EVENTS.EXPENSE_UPDATED, onExpenseUpdated);
      }
      if (onDebtSettled) {
        socketService.off(SOCKET_EVENTS.DEBT_SETTLED, onDebtSettled);
      }
      if (onReminderDue) {
        socketService.off(SOCKET_EVENTS.REMINDER_DUE, onReminderDue);
      }

      // Leave group if joined
      if (groupId) {
        socketService.leaveGroup(groupId);
      }
    };
  }, [userId, groupId, onExpenseAdded, onExpenseUpdated, onDebtSettled, onReminderDue]);

  return {
    isConnected: socketService.isConnected()
  };
};
