const dict = {
  list: {
    title: 'Harvests',
    empty: 'No harvests yet',
    deleteConfirm: 'Are you sure you want to delete this harvest?',
  },
  form: {
    cropType: 'Crop type',
    quantity: 'Quantity',
    unit: 'Unit',
    harvestedAt: 'Harvested on',
    submit: 'Save',
    cancel: 'Cancel',
  },
  units: {
    KG: 'kg',
    G: 'g',
    PIECES: 'pieces',
    LITERS: 'l',
    ML: 'ml',
    BUNCHES: 'bunches',
  },
  errors: {
    loadFailed: 'Could not load harvests. Try again.',
    createFailed: 'Could not create the harvest. Try again.',
    updateFailed: 'Could not update the harvest. Try again.',
    deleteFailed: 'Could not delete the harvest. Try again.',
  },
} as const;

export default dict;
export type HarvestsDict = typeof dict;
