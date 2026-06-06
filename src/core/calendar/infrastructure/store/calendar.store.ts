import { create } from 'zustand';
import { toISODate } from '../../presentation/utils/calendar.utils';

const today = new Date();

export interface CalendarState {
  selectedDate: string;
  currentYear: number;
  currentMonth: number;
  setSelectedDate: (iso: string) => void;
  setCurrentMonth: (year: number, month: number) => void;
  prevMonth: () => void;
  nextMonth: () => void;
}

export const useCalendarStore = create<CalendarState>()((set) => ({
  selectedDate: toISODate(today),
  currentYear: today.getFullYear(),
  currentMonth: today.getMonth(),

  setSelectedDate: (iso) => set({ selectedDate: iso }),

  setCurrentMonth: (year, month) => set({ currentYear: year, currentMonth: month }),

  prevMonth: () =>
    set((s) => {
      if (s.currentMonth === 0) {
        return { currentYear: s.currentYear - 1, currentMonth: 11 };
      }
      return { currentMonth: s.currentMonth - 1 };
    }),

  nextMonth: () =>
    set((s) => {
      if (s.currentMonth === 11) {
        return { currentYear: s.currentYear + 1, currentMonth: 0 };
      }
      return { currentMonth: s.currentMonth + 1 };
    }),
}));
