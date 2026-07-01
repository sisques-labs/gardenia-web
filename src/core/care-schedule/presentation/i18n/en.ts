const dict = {
  row: {
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
    dueLabel: 'Due',
    overdueLabel: 'Overdue',
    complete: 'Complete',
    edit: 'Edit',
    delete: 'Delete',
  },
  form: {
    title: 'New task',
    editTitle: 'Edit task',
    plant: 'Plant',
    plantPlaceholder: 'Select a plant',
    activityType: 'Activity',
    nextDueAt: 'Due date',
    recurring: 'Repeats',
    intervalDays: 'Every (days)',
    quantity: 'Quantity',
    unit: 'Unit',
    notes: 'Notes',
    submit: 'Save',
    submitting: 'Saving...',
    cancel: 'Cancel',
  },
  units: {
    ML: 'ml',
    L: 'l',
    G: 'g',
    KG: 'kg',
  },
  panel: {
    empty: 'No tasks due for this day.',
  },
  tab: {
    empty: 'No care schedules for this plant yet.',
    newTask: 'New task',
  },
  errors: {
    loadFailed: 'Could not load care schedules. Try again.',
    saveFailed: 'Could not save the care schedule. Try again.',
    completeFailed: 'Could not complete the care schedule. Try again.',
    deleteFailed: 'Could not delete the care schedule. Try again.',
  },
} as const;

export default dict;
export type CareScheduleDict = typeof dict;
