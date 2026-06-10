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
  schedule: {
    title: 'Schedule Task',
    templateLabel: 'Template',
    templatePlaceholder: 'Select a template...',
    nameLabel: 'Name',
    namePlaceholder: 'Task name',
    scheduledAtLabel: 'Scheduled At',
    payloadLabel: 'Payload (JSON)',
    payloadPlaceholder: '{}',
    submitBtn: 'Schedule',
    submittingBtn: 'Scheduling...',
    cancelBtn: 'Cancel',
    cancelTask: 'Cancel Task',
    cancelTaskDescription: 'Are you sure you want to cancel this task? This action cannot be undone.',
    confirmCancelLabel: 'Yes, cancel task',
    keepTaskLabel: 'Keep task',
    validation: {
      templateIdRequired: 'Template is required',
      templateIdInvalid: 'Invalid template',
      nameRequired: 'Name is required',
      nameMax: 'Name must be 100 characters or less',
      scheduledAtRequired: 'Scheduled at is required',
      scheduledAtInvalid: 'Invalid date',
      payloadInvalidJson: 'Payload must be valid JSON',
    },
  },
} as const;

export default dict;
export type TasksDict = typeof dict;
