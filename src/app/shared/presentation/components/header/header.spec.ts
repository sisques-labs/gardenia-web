import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header, NavLink } from './header';
import { createTestBed } from '../ui/_testing/test-host';

// ---------------------------------------------------------------------------
// Test hosts
// ---------------------------------------------------------------------------

@Component({
  standalone: true,
  imports: [Header],
  template: `<app-header [navLinks]="navLinks" [ctaLabel]="ctaLabel" />`,
})
class HeaderHost {
  navLinks: NavLink[] = [];
  ctaLabel = '';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function query<T extends Element>(el: HTMLElement, selector: string): T | null {
  return el.querySelector<T>(selector);
}

function queryAll<T extends Element>(el: HTMLElement, selector: string): T[] {
  return Array.from(el.querySelectorAll<T>(selector));
}

// ---------------------------------------------------------------------------
// Specs
// ---------------------------------------------------------------------------

describe('Header', () => {
  let fixture: ComponentFixture<HeaderHost>;
  let host: HeaderHost;
  let el: HTMLElement;

  beforeEach(async () => {
    await createTestBed(HeaderHost);
    fixture = TestBed.createComponent(HeaderHost);
    host = fixture.componentInstance;
    // Do NOT call detectChanges here — set state in each test first, then detect
    el = fixture.nativeElement as HTMLElement;
  });

  // --- Basic structure ---

  it('should create', () => {
    fixture.detectChanges();
    expect(host).toBeTruthy();
  });

  it('renders a <header> element with role="banner"', () => {
    fixture.detectChanges();
    const header = query<HTMLElement>(el, 'header');
    expect(header).not.toBeNull();
    expect(header!.getAttribute('role')).toBe('banner');
  });

  it('renders the Gardenia logo linking to /', () => {
    fixture.detectChanges();
    const logo = query<HTMLAnchorElement>(el, 'a[aria-label="Gardenia home"]');
    expect(logo).not.toBeNull();
    expect(logo!.getAttribute('href')).toBe('/');
    expect(logo!.textContent?.trim()).toBe('Gardenia');
  });

  // --- Nav links (Scenario: Nav links render) ---

  it('renders nav <a> elements for each navLink', () => {
    host.navLinks = [
      { label: 'Home', href: '/' },
      { label: 'Garden', href: '/garden' },
    ];
    fixture.detectChanges();

    const links = queryAll<HTMLAnchorElement>(el, 'nav a');
    const hrefs = links.map(a => a.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/garden');
  });

  it('renders correct link labels', () => {
    host.navLinks = [{ label: 'Plants', href: '/plants' }];
    fixture.detectChanges();

    const links = queryAll<HTMLAnchorElement>(el, 'nav a');
    const labels = links.map(a => a.textContent?.trim());
    expect(labels).toContain('Plants');
  });

  it('renders no nav links when navLinks is empty', () => {
    host.navLinks = [];
    fixture.detectChanges();

    const links = queryAll<HTMLAnchorElement>(el, 'nav a');
    expect(links.length).toBe(0);
  });

  // --- CTA (Scenario: CTA renders when label provided / No CTA when empty) ---

  it('renders app-button when ctaLabel is non-empty', () => {
    host.ctaLabel = 'Get started';
    fixture.detectChanges();

    const btn = query<HTMLElement>(el, 'app-button');
    expect(btn).not.toBeNull();
    expect(btn!.textContent?.trim()).toContain('Get started');
  });

  it('does NOT render app-button when ctaLabel is empty', () => {
    host.ctaLabel = '';
    fixture.detectChanges();

    const btn = query<HTMLElement>(el, 'app-button');
    expect(btn).toBeNull();
  });

  // --- Mobile menu toggle (Scenario: Mobile menu toggle) ---

  it('hamburger button exists', () => {
    fixture.detectChanges();
    const hamburger = query<HTMLButtonElement>(el, '.app-header__hamburger');
    expect(hamburger).not.toBeNull();
  });

  it('hamburger starts with aria-expanded="false"', () => {
    fixture.detectChanges();
    const hamburger = query<HTMLButtonElement>(el, '.app-header__hamburger');
    expect(hamburger!.getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking hamburger sets aria-expanded="true" and shows mobile nav', () => {
    fixture.detectChanges();
    const hamburger = query<HTMLButtonElement>(el, '.app-header__hamburger');
    hamburger!.click();
    fixture.detectChanges();

    expect(hamburger!.getAttribute('aria-expanded')).toBe('true');
    const mobileNav = query<HTMLElement>(el, '.app-header__mobile-nav');
    expect(mobileNav).not.toBeNull();
  });

  it('clicking hamburger twice collapses the mobile nav', () => {
    fixture.detectChanges();
    const hamburger = query<HTMLButtonElement>(el, '.app-header__hamburger');
    hamburger!.click();
    fixture.detectChanges();
    hamburger!.click();
    fixture.detectChanges();

    expect(hamburger!.getAttribute('aria-expanded')).toBe('false');
    const mobileNav = query<HTMLElement>(el, '.app-header__mobile-nav');
    expect(mobileNav).toBeNull();
  });

  it('mobile nav shows nav links when open', () => {
    host.navLinks = [{ label: 'Garden', href: '/garden' }];
    fixture.detectChanges();

    const hamburger = query<HTMLButtonElement>(el, '.app-header__hamburger');
    hamburger!.click();
    fixture.detectChanges();

    const mobileLinks = queryAll<HTMLAnchorElement>(el, '.app-header__mobile-nav a');
    expect(mobileLinks.length).toBeGreaterThan(0);
    expect(mobileLinks[0].getAttribute('href')).toBe('/garden');
  });
});
