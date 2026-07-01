import { useSidebarStore } from './sidebar.store';

beforeEach(() => {
  localStorage.clear();
  useSidebarStore.setState({ collapsed: false, drawerOpen: false });
});

describe('useSidebarStore', () => {
  it('starts with collapsed=false by default', () => {
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it('starts with drawerOpen=false by default', () => {
    expect(useSidebarStore.getState().drawerOpen).toBe(false);
  });

  it('toggleCollapsed flips collapsed', () => {
    useSidebarStore.getState().toggleCollapsed();
    expect(useSidebarStore.getState().collapsed).toBe(true);
    useSidebarStore.getState().toggleCollapsed();
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it('toggleCollapsed persists collapsed to localStorage', () => {
    useSidebarStore.getState().toggleCollapsed();
    const stored = JSON.parse(localStorage.getItem('gardenia.sidebar.collapsed') ?? '{}');
    expect(stored.state.collapsed).toBe(true);
  });

  it('openDrawer sets drawerOpen=true', () => {
    useSidebarStore.getState().openDrawer();
    expect(useSidebarStore.getState().drawerOpen).toBe(true);
  });

  it('closeDrawer sets drawerOpen=false', () => {
    useSidebarStore.getState().openDrawer();
    useSidebarStore.getState().closeDrawer();
    expect(useSidebarStore.getState().drawerOpen).toBe(false);
  });

  it('drawerOpen is not persisted to localStorage', () => {
    useSidebarStore.getState().openDrawer();
    const stored = JSON.parse(localStorage.getItem('gardenia.sidebar.collapsed') ?? '{}');
    expect(stored.state?.drawerOpen).toBeUndefined();
  });
});
