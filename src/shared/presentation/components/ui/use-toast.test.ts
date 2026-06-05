import { vi } from 'vitest';

vi.mock('sonner', () => {
  const toast = vi.fn() as ReturnType<typeof vi.fn> & {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    warning: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
  };
  toast.success = vi.fn();
  toast.error = vi.fn();
  toast.warning = vi.fn();
  toast.info = vi.fn();
  return { toast };
});

describe('use-toast helpers', () => {
  it('exports a toast function', async () => {
    const { toast } = await import('./use-toast');
    expect(typeof toast).toBe('function');
  });

  it('toast.success is callable', async () => {
    const { toast } = await import('./use-toast');
    expect(typeof toast.success).toBe('function');
    expect(() => toast.success('Plant saved')).not.toThrow();
  });

  it('toast.error is callable', async () => {
    const { toast } = await import('./use-toast');
    expect(typeof toast.error).toBe('function');
    expect(() => toast.error('Something failed')).not.toThrow();
  });

  it('toast.warning is callable', async () => {
    const { toast } = await import('./use-toast');
    expect(typeof toast.warning).toBe('function');
    expect(() => toast.warning('Low water')).not.toThrow();
  });

  it('toast.info is callable', async () => {
    const { toast } = await import('./use-toast');
    expect(typeof toast.info).toBe('function');
    expect(() => toast.info('FYI')).not.toThrow();
  });
});
