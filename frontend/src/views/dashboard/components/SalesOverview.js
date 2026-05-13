import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';
import DashboardCard from '../../../components/shared/DashboardCard';
import Chart from 'react-apexcharts';

/**
 * SalesOverview — Remaining amount per month/year bar chart.
 * Props: data: { year, month, label, remainingAmount }[]
 */
const SalesOverview = ({ data = [] }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const error   = theme.palette.error.main;

  const categories = data.map((d) => d.label);
  const amounts    = data.map((d) => d.remainingAmount);

  const options = {
    chart: {
      type: 'bar',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: '#adb0bb',
      toolbar: { show: true },
      height: 370,
    },
    colors: amounts.map((v) => (v >= 0 ? primary : error)),
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 6,
        borderRadiusApplication: 'end',
        distributed: true,
      },
    },
    dataLabels: { enabled: false },
    legend:     { show: false },
    grid: { borderColor: 'rgba(0,0,0,0.1)', strokeDashArray: 3 },
    yaxis: {
      tickAmount: 5,
      labels: {
        formatter: (v) =>
          v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
          : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
          : String(v),
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      labels: { rotate: -35 },
    },
    tooltip: {
      theme: theme.palette.mode === 'dark' ? 'dark' : 'light',
      y: { formatter: (v) => v.toLocaleString() },
    },
  };

  const series = [{ name: 'Remaining Amount', data: amounts }];

  return (
    <DashboardCard title="Remaining Amount by Month">
      {data.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 370 }}>
          <Typography color="text.secondary">No data yet.</Typography>
        </Box>
      ) : (
        <Chart options={options} series={series} type="bar" height="370px" />
      )}
    </DashboardCard>
  );
};

export default SalesOverview;
