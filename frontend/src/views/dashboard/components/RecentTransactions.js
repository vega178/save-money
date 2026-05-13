import React from 'react';
import { format } from 'date-fns';
import DashboardCard from '../../../components/shared/DashboardCard';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { Typography, Box } from '@mui/material';

const DOT_COLORS = ['primary', 'secondary', 'success', 'warning', 'error'];

/**
 * RecentTransactions — Last 5 bills sorted by date desc.
 * Props: bills: { id, name, amount, billDate }[]
 */
const RecentTransactions = ({ bills = [] }) => (
  <DashboardCard title="Recent Bills">
    {bills.length === 0 ? (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No bills yet.</Typography>
      </Box>
    ) : (
      <Timeline
        className="theme-timeline"
        nonce={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
        sx={{
          p: 0,
          mb: '-40px',
          '& .MuiTimelineConnector-root': { width: '1px', backgroundColor: '#efefef' },
          [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.5, paddingLeft: 0 },
        }}
      >
        {bills.map((bill, i) => (
          <TimelineItem key={bill.id}>
            <TimelineOppositeContent>
              <Typography variant="caption" color="textSecondary">
                {format(new Date(bill.billDate), 'MMM d')}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={DOT_COLORS[i % DOT_COLORS.length]} variant="outlined" />
              {i < bills.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography fontWeight="600" variant="body2">
                {bill.name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {bill.amount.toLocaleString()}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    )}
  </DashboardCard>
);

export default RecentTransactions;
