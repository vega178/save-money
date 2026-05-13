import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Grid, Stack, Typography, Avatar, Box } from '@mui/material';
import { IconArrowUpLeft, IconArrowDownRight } from '@tabler/icons';
import DashboardCard from '../../../components/shared/DashboardCard';

/**
 * YearlyBreakup — Donut chart of total spending split by year.
 * Props: data: { year, total, percentage }[]
 */
const YearlyBreakup = ({ data = [] }) => {
  const theme        = useTheme();
  const primary      = theme.palette.primary.main;
  const primaryLight = '#ecf2ff';
  const successLight = theme.palette.success.light;
  const errorLight   = theme.palette.error.light;

  const PALETTE = [primary, primaryLight, '#F9F9FD', '#FA896B', '#39B69A'];

  const grandTotal = data.reduce((s, d) => s + d.total, 0);
  const latestYear = data.length > 0 ? data[data.length - 1] : null;
  const prevYear   = data.length > 1 ? data[data.length - 2] : null;

  const yoyPct =
    prevYear && prevYear.total > 0
      ? Math.round(((latestYear.total - prevYear.total) / prevYear.total) * 100)
      : null;
  const isUp = yoyPct !== null && yoyPct >= 0;

  const options = {
    chart: {
      type: 'donut',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 155,
    },
    colors: data.map((_, i) => PALETTE[i % PALETTE.length]),
    plotOptions: { pie: { donut: { size: '75%', background: 'transparent' } } },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: { formatter: (v) => `${v}%` },
    },
    stroke:     { show: false },
    dataLabels: { enabled: false },
    legend:     { show: false },
  };

  const series = data.map((d) => d.percentage);
  const labels = data.map((d) => String(d.year));

  return (
    <DashboardCard title="Yearly Spending Breakdown">
      {data.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 155 }}>
          <Typography color="text.secondary">No data yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={7}>
            <Typography variant="h3" fontWeight="700">
              {grandTotal.toLocaleString()}
            </Typography>
            {yoyPct !== null && (
              <Stack direction="row" spacing={1} mt={1} alignItems="center">
                <Avatar sx={{ bgcolor: isUp ? errorLight : successLight, width: 27, height: 27 }}>
                  {isUp
                    ? <IconArrowUpLeft width={20} color="#FA896B" />
                    : <IconArrowDownRight width={20} color="#39B69A" />}
                </Avatar>
                <Typography variant="subtitle2" fontWeight="600">
                  {isUp ? '+' : ''}{yoyPct}%
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  vs {prevYear.year}
                </Typography>
              </Stack>
            )}
            <Stack mt={3} spacing={1}>
              {data.map((d, i) => (
                <Stack key={d.year} direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: PALETTE[i % PALETTE.length] }} />
                  <Typography variant="subtitle2" color="textSecondary">
                    {d.year} — {d.percentage}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={5}>
            <Chart options={{ ...options, labels }} series={series} type="donut" height="155px" />
          </Grid>
        </Grid>
      )}
    </DashboardCard>
  );
};

export default YearlyBreakup;
