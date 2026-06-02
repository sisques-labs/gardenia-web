const dict = {
  nav: 'Inventory',
  list: {
    title: 'Garden Catalog',
    newPlant: 'New plant',
    empty: 'No plants yet',
    filterAll: 'All',
    inProgress: 'Coming soon',
  },
  detail: {
    breadcrumbList: 'Inventory',
    qrPrint: 'Print QR',
    noImage: 'No image',
    noSpecies: 'Unknown species',
    actions: {
      markWatered: 'Mark watered',
      addPhoto: 'Add photo',
      newNote: 'New note',
    },
    qr: {
      label: 'Label · QR',
      hint: 'Print and stick on the pot',
      download: 'Download PDF',
    },
    tabs: {
      care: 'Care',
      calendar: 'Calendar',
      associations: 'Associations',
    },
    sections: {
      care: { title: 'Care', inProgress: 'Coming soon' },
      cycle: { title: 'Growth cycle', inProgress: 'Coming soon' },
      photoHistory: { title: 'Photo history', inProgress: 'Coming soon' },
      pests: { title: 'Pest tracking', inProgress: 'Coming soon' },
    },
  },
} as const;

export default dict;
export type PlantsDict = typeof dict;
