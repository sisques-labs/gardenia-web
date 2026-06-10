const dict = {
  nav: 'Tasks',
  list: {
    title: 'Tasks',
    empty: 'No tasks yet',
    columns: {
      name: 'Name',
      status: 'Status',
      scheduledAt: 'Scheduled At',
    },
  },
  detail: {
    title: 'Task Detail',
    breadcrumbList: 'Tasks',
    payload: 'Payload',
    runs: 'Run History',
    runsEmpty: 'No runs yet',
    columns: {
      status: 'Status',
      startedAt: 'Started At',
      completedAt: 'Completed At',
      error: 'Error',
    },
  },
} as const;

export default dict;
export type TasksDict = typeof dict;
