import React, { useEffect, useState } from 'react';
import { Grid, Box, CircularProgress, Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import { getAnalytics } from '../../services/analyticsService';

// components
import SalesOverview from './components/SalesOverview';
import YearlyBreakup from './components/YearlyBreakup';
import RecentTransactions from './components/RecentTransactions';
import Blog from './components/Blog';
import MonthlyEarnings from './components/MonthlyEarnings';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;
    getAnalytics(userId).then((res) => {
      if (res?.data) setAnalytics(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <Typography color="text.secondary">No analytics data available.</Typography>
      </Box>
    );
  }

  return (
    <PageContainer title="Dashboard" description="Financial analytics dashboard">
      <Box>
        <Grid container spacing={3}>
          {/* Remaining amount per month — full-width bar chart */}
          <Grid item xs={12} lg={8}>
            <SalesOverview data={analytics.remainingByMonth} />
          </Grid>

          {/* Right column: yearly donut + monthly earnings card */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <YearlyBreakup data={analytics.yearlyBreakdown} />
              </Grid>
              <Grid item xs={12}>
                <MonthlyEarnings
                  currentMonthTotal={analytics.currentMonthTotal}
                  previousMonthTotal={analytics.previousMonthTotal}
                  monthOverMonthPct={analytics.monthOverMonthPct}
                  remainingByMonth={analytics.remainingByMonth}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Recent bills timeline */}
          <Grid item xs={12} lg={4}>
            <RecentTransactions bills={analytics.recentBills} />
          </Grid>

          {/* Spending by card + subscription horizontal bars */}
          <Grid item xs={12} lg={8}>
            <Blog
              spendingByCard={analytics.spendingByCard}
              spendingBySubscription={analytics.spendingBySubscription}
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;

