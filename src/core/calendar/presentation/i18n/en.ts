const dict = {
  screenTitle: 'Calendar',
  addTask: 'New task',
  viewSwitcher: {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
  },
  grid: {
    weekdays: {
      mon: 'M',
      tue: 'T',
      wed: 'W',
      thu: 'T',
      fri: 'F',
      sat: 'S',
      sun: 'S',
    },
    seasons: {
      spring: 'spring',
      summer: 'summer',
      autumn: 'autumn',
      winter: 'winter',
    },
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
    },
    overflow: 'more',
    viewSwitcher: {
      day: 'Day',
      week: 'Week',
      month: 'Month',
      year: 'Year',
    },
  },
  panel: {
    todayPrefix: 'Today',
    inDevLabel: 'Day tasks',
  },
} as const;

export default dict;
export type CalendarDict = typeof dict;
