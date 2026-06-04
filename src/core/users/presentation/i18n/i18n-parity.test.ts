import en from './en';
import es from './es';

describe('users i18n parity', () => {
  it('es has the same top-level keys as en', () => {
    expect(Object.keys(es)).toEqual(Object.keys(en));
  });

  it('es.profile has the same keys as en.profile', () => {
    expect(Object.keys(es.profile)).toEqual(Object.keys(en.profile));
  });
});
