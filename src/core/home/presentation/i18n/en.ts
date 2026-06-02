const dict = {
  topbar: {
    search: 'Search',
    newEntry: 'New entry',
  },
  greeting: 'Hello',
  sections: {
    todayTasks: {
      title: "Today's tasks",
      inProgress: 'En desarrollo',
    },
    growingNow: {
      title: 'Growing now',
      inProgress: 'En desarrollo',
    },
    miniMap: {
      title: 'Garden map',
      inProgress: 'En desarrollo',
    },
    harvestPace: {
      title: 'Harvest pace',
      inProgress: 'En desarrollo',
    },
    journal: {
      title: 'Journal',
      inProgress: 'En desarrollo',
    },
  },
  inProgress: 'En desarrollo',
} as const;

export default dict;
export type HomeDict = typeof dict;
