const dict = {
  openNavigation: 'Open navigation',
  sidebar: {
    expand: 'Expand sidebar',
    collapse: 'Collapse sidebar',
  },
  spaceSwitcher: {
    activeSpaceLabel: 'Active garden',
    switchSpace: 'Switch space',
    createSpace: 'New space',
  },
  userMenu: {
    openMenu: 'Open menu',
    profile: 'Profile',
    settings: 'Settings',
    logOut: 'Log out',
  },
  nav: {
    home: 'Home',
    map: 'Map',
    plants: 'Plants',
    calendar: 'Calendar',
    journal: 'Journal',
    harvests: 'Harvests',
    inventory: 'Inventory',
    pests: 'Pests',
    community: 'Community',
    plantingSpots: 'Planting spots',
    nodes: 'Devices',
  },
} as const;

export default dict;
export type ShellDict = typeof dict;
