/**
 * birthdayMapUtils.js
 *
 * Builds a O(1) lookup map: "MM-DD" → Birthday[]
 * so CalendarGrid can find who has a birthday on each day without filtering.
 */
import { toMonthDayKey } from './dateUtils';

/**
 * @param {Array} birthdays — flat array from API
 * @returns {Object} e.g. { "05-13": [alice, bob], "11-20": [carlos] }
 */
export const buildBirthdayMap = (birthdays = []) => {
  return birthdays.reduce((map, b) => {
    const key = toMonthDayKey(b.birthDate);
    if (!key) return map;
    if (!map[key]) map[key] = [];
    map[key].push(b);
    return map;
  }, {});
};
