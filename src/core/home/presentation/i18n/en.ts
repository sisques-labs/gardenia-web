const dict = {
  topbar: {
    search: 'Search',
    newEntry: 'New entry',
    notifications: 'Notifications',
    createMenu: {
      label: 'Create',
      newPlant: 'New plant',
      newJournalEntry: 'New journal entry',
    },
  },
  greeting: 'Hello',
  sections: {
    todayTasks: {
      title: "Today's tasks",
      empty: 'No tasks due today.',
    },
    growingNow: {
      title: 'Growing now',
      empty: 'No active plants yet.',
      andMore: 'and {count} more',
    },
    plantingSpotsSummary: {
      title: 'Planting spots',
      active: 'Active',
      fallow: 'Fallow',
      empty: 'No planting spots yet.',
    },
  },
} as const;

export default dict;
export type HomeDict = typeof dict;
