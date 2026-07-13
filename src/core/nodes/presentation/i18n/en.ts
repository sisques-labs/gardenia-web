const dict = {
  nav: 'Devices',
  title: 'Devices',
  subtitle: 'Bridges and sensor nodes connected to this space',
  claim: {
    trigger: 'Claim bridge',
    title: 'Claim a bridge',
    bridgeId: 'Bridge id',
    bridgeIdPlaceholder: 'UUID shown by the bridge',
    bridgeIdRequired: 'Bridge id is required',
    pairingCode: 'Pairing code',
    pairingCodePlaceholder: 'GRDN-XXXX',
    pairingCodeRequired: 'Pairing code is required',
    cancel: 'Cancel',
    submit: 'Claim',
    submitting: 'Claiming…',
    error: 'Could not claim the bridge. Check the id and pairing code.',
  },
  list: {
    bridgesHeading: 'Bridges',
    bridgesEmpty: 'No bridges claimed yet. Claim one using its pairing code.',
    nodesHeading: 'Nodes',
    nodesEmpty: 'No nodes reporting yet.',
    lastSeen: 'Last seen',
    neverSeen: 'Never seen',
  },
} as const;

export default dict;
export type NodesDict = typeof dict;
