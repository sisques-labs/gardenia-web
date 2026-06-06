export function getFirstDayOffset(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}
