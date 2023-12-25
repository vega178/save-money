import React from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import BillsTable from './components/BillsTable';

const Bills = () => {
  return (
    <PageContainer title="Bills" description="">
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={16}>
            <BillsTable />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Bills;
