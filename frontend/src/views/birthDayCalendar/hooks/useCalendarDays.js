import { useMemo } from 'react';
import { buildCalendarDays } from '../utils/dateUtils';

/**
 * useCalendarDays
 *
 * Returns the 42 Date objects (6 rows × 7 cols) for the given year/month,
 * memoized so CalendarGrid never re-computes on unrelated re-renders.
 *
 * @param {number} year
 * @param {number} month  0-indexed (Jan=0)
 * @returns {Date[]}
 */
const useCalendarDays = (year, month) => {
  return useMemo(() => buildCalendarDays(year, month), [year, month]);
};

export default useCalendarDays;
