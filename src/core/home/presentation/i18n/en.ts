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
      inProgress: 'Coming soon',
    },
    growingNow: {
      title: 'Growing now',
      inProgress: 'Coming soon',
    },
    miniMap: {
      title: 'Garden map',
      inProgress: 'Coming soon',
    },
    harvestPace: {
      title: 'Harvest pace',
      inProgress: 'Coming soon',
    },
    journal: {
      title: 'Journal',
      inProgress: 'Coming soon',
    },
  },
  inProgress: 'Coming soon',
} as const;

export default dict;
export type HomeDict = typeof dict;
