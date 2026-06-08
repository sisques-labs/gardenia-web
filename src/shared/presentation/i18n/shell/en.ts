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
} as const;

export default dict;
export type ShellDict = typeof dict;
