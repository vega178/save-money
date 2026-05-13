import api from './api';

/**
 * analyticsService.js
 *
 * Calls GET /api/users/:userId/analytics
 * The backend aggregates all dashboard metrics server-side and returns them
 * in a single response to minimise round-trips.
 *
 * Response shape:
 * {
 *   spendingByCard:         { name, total }[]
 *   spendingBySubscription: { name, total }[]
 *   remainingByMonth:       { year, month, label, remainingAmount }[]
 *   yearlyBreakdown:        { year, total, percentage }[]
 *   recentBills:            { id, name, amount, billDate }[]
 *   currentMonthTotal:      number
 *   previousMonthTotal:     number
 *   monthOverMonthPct:      number   (negative = spending went down)
 * }
 */
export const getAnalytics = async (userId) => {
  try {
    return await api.get(`/users/${userId}/analytics`);
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return null;
  }
};
