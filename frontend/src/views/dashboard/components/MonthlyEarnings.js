import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/material/styles';
import { Stack, Typography, Avatar, Fab } from '@mui/material';
import { IconArrowDownRight, IconArrowUpRight, IconCurrencyDollar } from '@tabler/icons';
import DashboardCard from '../../../components/shared/DashboardCard';

/**
 * MonthlyEarnings — Current month total spend + MoM % change.
 * Props: currentMonthTotal, previousMonthTotal, monthOverMonthPct, remainingByMonth
 */
const MonthlyEarnings = ({
  currentMonthTotal  = 0,
  previousMonthTotal = 0,
  monthOverMonthPct  = 0,
  remainingByMonth   = [],
}) => {
  const theme         = useTheme();
  const secondary      = theme.palette.secondary.main;
  const secondaryLight = '#f5fcff';
  const errorLight     = '#fdede8';
  const successLight   = theme.palette.success.light;

  const isUp = monthOverMonthPct >= 0;

  const sparklineOptions = {
    chart: {
      type: 'area',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: '#adb0bb',
      toolbar: { show: false },
      height: 60,
      sparkline: { enabled: true },
    },
    stroke: { curve: 'smooth', width: 2 },
    fill:   { colors: [secondaryLight], type: 'solid', opacity: 0.05 },
    markers: { size: 0 },
    tooltip: { theme: theme.palette.mode === 'dark' ? 'dark' : 'light' },
  };

  const sparklineSeries = [{
    name:  'Remaining',
    color: secondary,
    data:  remainingByMonth.map((d) => d.remainingAmount),
  }];

  return (
    <DashboardCard
      title="Current Month Spending"
      action={
        <Fab color="secondary" size="medium" sx={{ color: '#ffffff' }}>
          <IconCurrencyDollar width={24} />
        </Fab>
      }
      footer={
        <Chart options={sparklineOptions} series={sparklineSeries} type="area" height="60px" />
      }
    >
      <>
        <Typography variant="h3" fontWeight="700" mt="-20px">
          {currentMonthTotal.toLocaleString()}
        </Typography>
        <Stack direction="row" spacing={1} my={1} alignItems="center">
          <Avatar sx={{ bgcolor: isUp ? errorLight : successLight, width: 27, height: 27 }}>
            {isUp
              ? <IconArrowUpRight width={20} color="#FA896B" />
              : <IconArrowDownRight width={20} color="#39B69A" />}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="600">
            {isUp ? '+' : ''}{monthOverMonthPct}%
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            vs last month
          </Typography>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default MonthlyEarnings;
