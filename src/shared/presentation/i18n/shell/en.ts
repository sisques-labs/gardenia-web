const dict = {
  openNavigation: 'Open navigation',
  sidebar: {
    expand: 'Expand sidebar',
    collapse: 'Collapse sidebar',
  },
  spaceSwitcher: {
    activeSpaceLabel: 'Active garden',
    switchSpace: 'Switch space',
  },
  userMenu: {
    openMenu: 'Open menu',
    profile: 'Profile',
    settings: 'Settings',
    logOut: 'Log out',
  },
  nav: {
    home: 'Home',
    spaces: 'Spaces',
    map: 'Map',
    inventory: 'Inventory',
    calendar: 'Calendar',
    journal: 'Journal',
    harvests: 'Harvests',
    pests: 'Pests',
    community: 'Community',
  },
} as const;

export default dict;
export type ShellDict = typeof dict;
