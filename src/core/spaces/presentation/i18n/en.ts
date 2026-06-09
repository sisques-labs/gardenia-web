const dict = {
  list: {
    title: 'My spaces',
    empty: 'You have no spaces yet.',
    create: 'New space',
    switchTo: 'Switch to this space',
    active: 'Active',
  },
  create: {
    title: 'Create space',
    name: 'Space name',
    namePlaceholder: 'e.g. My project',
    submit: 'Create',
    submitting: 'Creating...',
    error: 'Could not create the space. Try again.',
    nameMin: 'At least 3 characters',
    nameMax: 'At most 50 characters',
  },
  shell: {
    loading: 'Loading...',
    noSpace: 'No active space',
  },
  invite: {
    accepting: 'Joining space...',
    missingCode: 'This invitation link is invalid or missing a code.',
    error: 'Could not accept the invitation. It may be expired or you may already be a member.',
  },
} as const;

export default dict;
export type SpacesDict = typeof dict;
