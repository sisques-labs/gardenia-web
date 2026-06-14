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
    raised_bed: 'Raised bed',
    pot: 'Pot',
    container: 'Container',
    field_section: 'Field section',
    other: 'Other',
  },
} as const;

export default dict;
export type PlantingSpotsDict = typeof dict;
