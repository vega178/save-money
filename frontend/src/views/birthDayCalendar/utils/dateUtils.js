/**
 * dateUtils.js — birthday-specific date helpers
 */

/**
 * Returns the "MM-DD" key used for calendar lookups.
 * birthDate is a string like "1990-05-13"
 */
export const toMonthDayKey = (birthDate) => {
  if (!birthDate) return '';
  const parts = birthDate.split('-');
  return `${parts[1]}-${parts[2]}`;
};

/**
 * Builds the Date object for each day in the 6-week grid of a given month.
 * Returns array of Date objects (42 cells total, some from adjacent months).
 */
export const buildCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const days = [];

  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    days.push(d);
  }
  return days;
};

/**
 * Returns the next occurrence of a birthday (year-agnostic MM-DD) as a Date.
 * birthDate: "1990-05-13"
 */
export const getNextOccurrence = (birthDate) => {
  const [, month, day] = birthDate.split('-');
  const today = new Date();
  const candidate = new Date(today.getFullYear(), +month - 1, +day);
  if (candidate < today && candidate.toDateString() !== today.toDateString()) {
    candidate.setFullYear(today.getFullYear() + 1);
  }
  return candidate;
};

/**
 * Returns how many calendar days until the next birthday occurrence.
 * Returns 0 if today.
 */
export const daysUntilBirthday = (birthDate) => {
  const next = getNextOccurrence(birthDate);
  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcNext = Date.UTC(next.getFullYear(), next.getMonth(), next.getDate());
  const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((utcNext - utcToday) / msPerDay);
};

/**
 * Computes the age someone will turn this year (or already turned).
 */
export const turningAge = (birthDate) => {
  const [year] = birthDate.split('-');
  return new Date().getFullYear() - +year;
};

/** Format "YYYY-MM-DD" → "May 13, 1990" */
export const formatBirthDate = (birthDate) => {
  if (!birthDate) return '';
  const [year, month, day] = birthDate.split('-');
  return new Date(+year, +month - 1, +day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/** Returns today's "MM-DD" key */
export const todayMonthDayKey = () => {
  const t = new Date();
  const m = String(t.getMonth() + 1).padStart(2, '0');
  const d = String(t.getDate()).padStart(2, '0');
  return `${m}-${d}`;
};
