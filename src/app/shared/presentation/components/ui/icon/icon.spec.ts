import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideLeaf, provideLucideIcons } from '@lucide/angular';
import { Icon } from './icon';
import { createTestBed } from '../_testing/test-host';

describe('Icon', () => {
  let fixture: ComponentFixture<Icon>;

  beforeEach(async () => {
    await createTestBed(Icon, {
      providers: [provideLucideIcons(LucideLeaf)],
    });
    fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', LucideLeaf.icon);
    fixture.detectChanges();
  });

  it('renders an SVG with aria-hidden="true" by default', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');

    const svg = host.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('renders at 16px by default (size=16)', () => {
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('height')).toBe('16');
  });

  it('renders at custom size when size input changes', async () => {
    fixture.componentRef.setInput('size', 24);
    fixture.detectChanges();
    await fixture.whenStable();

    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('width')).toBe('24');
    expect(svg.getAttribute('height')).toBe('24');
  });

  it('sets aria-label and removes aria-hidden when label is provided', async () => {
    fixture.componentRef.setInput('label', 'Leaf icon');
    fixture.detectChanges();
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-label')).toBe('Leaf icon');
    expect(host.getAttribute('aria-hidden')).toBeNull();
  });
});
