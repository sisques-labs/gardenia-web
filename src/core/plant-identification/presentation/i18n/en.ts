const dict = {
  title: 'Identify a plant',
  addPhoto: 'Add photo',
  removePhoto: 'Remove photo',
  photosHint: 'Add 1 to 5 JPG or PNG photos, then choose which part of the plant each one shows.',
  maxPhotosReached: 'You can add up to 5 photos',
  unsupportedFormat: 'Only JPG and PNG photos are supported — some files were skipped.',
  organLabel: 'Plant part',
  organ: {
    leaf: 'Leaf',
    flower: 'Flower',
    fruit: 'Fruit',
    bark: 'Bark',
    habit: 'Whole plant',
    other: 'Other',
  },
  submit: 'Identify plant',
  submitting: 'Identifying…',
  submitError: 'Something went wrong while identifying the plant. Try again.',
  resolved: {
    title: 'We think this is:',
    confidence: 'Confidence',
    createPlantCta: 'Create plant with this species',
    viewOtherCandidates: 'See other possibilities',
  },
  noMatch: {
    title: 'We could not identify this plant with confidence',
    fallbackToManual: 'You can still create the plant manually and search for its species.',
    candidatesTitle: 'Closest matches found',
  },
  error: {
    title: 'Identification is unavailable',
    provider: 'The identification service is temporarily unavailable. Try again in a moment.',
    quota: 'The identification limit has been reached for now. Try again later.',
    retry: 'Try again',
  },
  createModal: {
    title: 'Create plant',
    nameLabel: 'Name',
    namePlaceholder: 'e.g. My Monstera',
    nameRequired: 'Name is required',
    nameMax: 'At most 100 characters',
    submit: 'Create plant',
    submitting: 'Creating…',
    cancel: 'Cancel',
    error: 'Could not create the plant. Try again.',
  },
  recent: {
    title: 'Recent identifications',
    empty: 'No identifications yet',
    resolvedLabel: 'Identified',
    noMatchLabel: 'Not recognized',
    convertedBadge: 'Converted to plant',
    viewPlant: 'View plant',
  },
} as const;

export default dict;
export type PlantIdentificationDict = typeof dict;
