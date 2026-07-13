const dict = {
  messages: {
    careScheduleDue: '{activity} due',
    activityTypes: {
      WATERING: 'Watering',
      FERTILIZING: 'Fertilizing',
      PRUNING: 'Pruning',
      REPOTTING: 'Repotting',
      TRANSPLANTING: 'Transplanting',
      PEST_TREATMENT: 'Pest treatment',
      MISTING: 'Misting',
      ROTATION: 'Rotation',
      OTHER: 'Other',
    },
    inventoryLowStock: '{itemName} is running low ({quantity} {unit} left)',
    inventoryExpiringSoon: '{itemName} expires soon',
    fallback: 'Notification',
  },
  bell: {
    empty: "You're all caught up.",
    markAllRead: 'Mark all as read',
    viewAll: 'View all',
  },
  screen: {
    title: 'Notifications',
    tabs: {
      unread: 'Unread',
      all: 'All',
    },
    empty: 'No notifications here.',
    markAllRead: 'Mark all as read',
  },
} as const;

export default dict;
export type NotificationsDict = typeof dict;
