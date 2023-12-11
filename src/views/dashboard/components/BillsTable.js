import React, { useState } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers';
import DashboardCard from '../../../components/shared/DashboardCard';
import { format } from 'date-fns';

const BillsTable = () => {
  const [data, setData] = useState([
    {
      id: 1,
      date: new Date(),
      billPaid: '',
      amount: '',
      totalDebt: '',
      actualDebt: '',
      totalBalance: '',
      remainingAmount: '',
      gap: '',
    },
  ]);

  const [editIndex, setEditIndex] = useState(null);

  const handleEditClick = (index) => {
    setEditIndex(index);
  };

  const handleSaveClick = (index) => {
    setEditIndex(null);
  };

  const handleAddClick = () => {
    setData((prevData) => [
      ...prevData,
      {
        id: data.length + 1,
        date: new Date(),
        billPaid: '',
        amount: '',
        totalDebt: '',
        actualDebt: '',
        totalBalance: '',
        remainingAmount: '',
        gap: '',
      },
    ]);
    setEditIndex(data.length);
  };

  const handleDeleteClick = (index) => {
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
  };

  const handleDateChange = (date, index) => {
    setData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], date };
      return updatedData;
    });
  };

  const handleNumericChange = (e, key) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const updatedData = [...data];
    updatedData[editIndex][key] = value;
    setData(updatedData);
  };

  const handleTextChange = (event, key) => {
    const updatedData = [...data];
    updatedData[editIndex][key] = event.target.value;
    setData(updatedData);
  };

  return (
    <DashboardCard>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Bills
        </Typography>
        <Button startIcon={<AddIcon />} sx={{ ml: 2 }} onClick={handleAddClick} />
      </Box>
      <Box sx={{ mt: 2, width: { xs: '280px', sm: 'auto' } }}>
        <Table
          aria-label="simple table"
          sx={{
            whiteSpace: 'nowrap',
            mt: 2,
            minWidth: 600,
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  ID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  DATE
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  BILL PAID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  AMOUNT
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  TOTAL DEBT
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  ACTUAL DEBT
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  TOTAL BALANCE
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'normal' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  REMAINING AMOUNT
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  GAP
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={row.date}
                        onChange={(date) => handleDateChange(date, index)}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  ) : (
                    format(row.date, 'yyyy-MM-dd')
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      value={row.billPaid}
                      onChange={(e) => handleTextChange(e, 'billPaid')}
                    />
                  ) : (
                    row.billPaid
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      type="number"
                      value={row.amount}
                      onChange={(e) => handleNumericChange(e, 'amount')}
                    />
                  ) : (
                    row.amount
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      type="number"
                      value={row.totalDebt}
                      onChange={(e) => handleNumericChange(e, 'totalDebt')}
                    />
                  ) : (
                    row.totalDebt
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      type="number"
                      value={row.actualDebt}
                      onChange={(e) => handleNumericChange(e, 'actualDebt')}
                    />
                  ) : (
                    row.actualDebt
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      type="number"
                      value={row.totalBalance}
                      onChange={(e) => handleNumericChange(e, 'totalBalance')}
                    />
                  ) : (
                    row.totalBalance
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      type="number"
                      value={row.remainingAmount}
                      onChange={(e) => handleNumericChange(e, 'remainingAmount')}
                    />
                  ) : (
                    row.remainingAmount
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      type="number"
                      value={row.gap}
                      onChange={(e) => handleNumericChange(e, 'gap')}
                    />
                  ) : (
                    row.gap
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <>
                      <Button startIcon={<SaveIcon />} onClick={() => handleSaveClick(index)} />
                      <Button startIcon={<CloseIcon />} onClick={() => setEditIndex(null)} />
                    </>
                  ) : (
                    <>
                      <Button startIcon={<EditIcon />} onClick={() => handleEditClick(index)} />
                      <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(index)} />
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </DashboardCard>
  );
};
export default BillsTable;
