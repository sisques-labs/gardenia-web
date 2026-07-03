const dict = {
  nav: 'Inventory',
  list: {
    title: 'Garden Catalog',
    newPlant: 'New plant',
    empty: 'No plants yet',
    filterAll: 'All',
    filters: 'Filters',
    searchPlaceholder: 'Search plants...',
    searchChipLabel: 'Search',
    statsPlants: 'plants',
    statsSpecies: 'species',
    inProgress: 'Coming soon',
    categories: {
      vegetable: 'Vegetable',
      herb: 'Herb',
      leafy: 'Leafy',
      root: 'Root',
      flower: 'Flower',
      tree: 'Tree',
    },
    card: {
      delete: 'Delete plant',
      health: {
        good: 'Healthy',
        warn: 'Needs attention',
        bad: 'At risk',
        inactive: 'Inactive',
      },
    },
  },
  create: {
    title: 'New plant',
    name: 'Name',
    namePlaceholder: 'e.g. Monstera',
    nameRequired: 'Name is required',
    nameMax: 'At most 100 characters',
    imageUrl: 'Image URL',
    imageUrlPlaceholder: 'https://...',
    submit: 'Create',
    submitting: 'Creating...',
    cancel: 'Cancel',
    error: 'Could not create the plant. Try again.',
  },
  delete: {
    button: 'Delete plant',
    confirmTitle: 'Delete plant',
    confirmDescription: 'This action cannot be undone. The plant will be permanently removed.',
    confirm: 'Delete',
    cancel: 'Cancel',
    error: 'Could not delete the plant. Try again.',
  },
  detail: {
    breadcrumbList: 'Inventory',
    noSpecies: 'Unknown species',
    actions: {
      markWatered: 'Mark watered',
      markWateredError: 'Could not log the watering. Try again.',
    },
    care: {
      lastWatered: 'Last watered',
      neverWatered: 'Not watered yet',
    },
    addedOn: 'In your garden since',
    qr: {
      label: 'Label · QR',
      hint: 'Print and stick on the pot',
      download: 'Download PDF',
    },
    calendarTitle: 'Upcoming tasks',
  },
} as const;

export default dict;
export type PlantsDict = typeof dict;
