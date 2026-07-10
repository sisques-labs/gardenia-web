// Freezes the global clock for the whole Storybook session. Several stories
// and the components/hooks they render derive "today" from `new Date()` /
// `Date.now()` (calendar highlights, overdue badges, relative-time text).
// Left unfrozen, those renders drift a little more every day and eventually
// mismatch the last-accepted Chromatic baseline — someone has to review and
// re-accept a snapshot that changed for no reason related to the actual
// diff, burning the monthly snapshot budget. Freezing here fixes every
// current and future case in one place instead of threading a mockable
// clock through each component.
//
// 2026-07-02T12:00:00Z was picked to match the fixture dates already in use
// (e.g. CareScheduleRow's Default/Overdue stories, InventoryTable's
// "expiring soon" item) so this doesn't change what those stories look like
// today — only stops them from drifting further.
const FROZEN_DATE_ISO = '2026-07-02T12:00:00.000Z';

const RealDate = Date;

class FrozenDate extends RealDate {
  constructor(...args: unknown[]) {
    if (args.length === 0) {
      super(FROZEN_DATE_ISO);
    } else {
      // @ts-expect-error - forwarding an arbitrary Date constructor overload
      super(...args);
    }
  }

  static now(): number {
    return new RealDate(FROZEN_DATE_ISO).getTime();
  }
}

globalThis.Date = FrozenDate as DateConstructor;
