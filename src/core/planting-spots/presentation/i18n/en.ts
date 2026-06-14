const dict = {
  list: {
    title: 'Planting spots',
    empty: 'No planting spots in this space yet.',
    new: 'New planting spot',
  },
  form: {
    titleCreate: 'New planting spot',
    titleEdit: 'Edit planting spot',
    name: 'Name',
    type: 'Type',
    description: 'Description (optional)',
    save: 'Save',
    saving: 'Saving…',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this planting spot?',
    cancel: 'Cancel',
  },
  types: {
    RAISED_BED: 'Raised bed',
    POT: 'Pot',
    CONTAINER: 'Container',
    FIELD_SECTION: 'Field section',
    OTHER: 'Other',
  },
} as const;

export default dict;
export type PlantingSpotsDict = typeof dict;
