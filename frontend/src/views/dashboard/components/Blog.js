import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Grid } from '@mui/material';
import DashboardCard from '../../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';

/**
 * Blog — Spending by card & by subscription as horizontal bar charts.
 * Props: spendingByCard: { name, total }[], spendingBySubscription: { name, total }[]
 */
const Blog = ({ spendingByCard = [], spendingBySubscription = [] }) => {
  const theme = useTheme();

  const buildOptions = (categories, color) => ({
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: '#adb0bb',
      toolbar: { show: false },
    },
    colors: [color],
    plotOptions: {
      bar: { horizontal: true, barHeight: '55%', borderRadius: 4, borderRadiusApplication: 'end' },
    },
    dataLabels: { enabled: false },
    legend:     { show: false },
    grid: { borderColor: 'rgba(0,0,0,0.1)', strokeDashArray: 3 },
    xaxis: {
      categories,
      axisBorder: { show: false },
      labels: {
        formatter: (v) =>
          v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
          : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
          : String(v),
      },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: { formatter: (v) => v.toLocaleString() },
    },
  });

  const cardOptions = buildOptions(spendingByCard.map((d) => d.name), theme.palette.primary.main);
  const subOptions  = buildOptions(spendingBySubscription.map((d) => d.name), theme.palette.secondary.main);
  const cardSeries  = [{ name: 'Spending', data: spendingByCard.map((d) => d.total) }];
  const subSeries   = [{ name: 'Spending', data: spendingBySubscription.map((d) => d.total) }];
  const isEmpty     = (arr) => !arr || arr.every((d) => d.total === 0);

  return (
    <DashboardCard title="Spending by Category">
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Credit Cards</Typography>
          {isEmpty(spendingByCard) ? (
            <Box sx={{ py: 3 }}><Typography color="text.secondary">No card spending found.</Typography></Box>
          ) : (
            <Chart options={cardOptions} series={cardSeries} type="bar" height={`${spendingByCard.length * 52 + 40}px`} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Subscriptions</Typography>
          {isEmpty(spendingBySubscription) ? (
            <Box sx={{ py: 3 }}><Typography color="text.secondary">No subscription spending found.</Typography></Box>
          ) : (
            <Chart options={subOptions} series={subSeries} type="bar" height={`${spendingBySubscription.length * 52 + 40}px`} />
          )}
        </Grid>
      </Grid>
    </DashboardCard>
  );
};

export default Blog;
