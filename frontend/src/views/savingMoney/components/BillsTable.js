import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TablePagination,
  Checkbox,
  Dialog,
  DialogContent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { format } from 'date-fns';
import DashboardCard from '../../../components/shared/DashboardCard';
import BillForm from './BillForm';
import { getBills, create, update, remove } from '../../../services/billsServices';

const BillsTable = () => {
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [adding, setAdding] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    billDate: new Date(),
    name: '',
    amount: '',
    totalDebt: '',
    actualDebt: '',
    totalBalance: '',
    remainingAmount: '',
    gap: '',
  });

  const fetchData = async () => {
    const bills = await getBills();
    const formattedBills = bills.data.map((bill, index) => ({
      ...bill,
      billDate: new Date(bill.billDate),
      counter: index + 1,
    }));
    setData(formattedBills);
    setTotalItems(bills.data.length);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (index) => {
    const globalIndex = page * rowsPerPage + index;
    setEditIndex(globalIndex);
    setFormData(data[globalIndex]);
    setIsFormOpen(true);
  };

  const getBillsItems = () => {
    fetchData();
  };

  const handleAddClick = () => {
    setAdding(true);
    setFormData({
      billDate: new Date(),
      name: '',
      amount: '',
      totalDebt: '',
      actualDebt: '',
      totalBalance: '',
      remainingAmount: '',
      gap: '',
    });
    setIsFormOpen(true);
  };

  const handleCancelButton = () => {
    if (adding) {
      setAdding(false);
    }
    setEditIndex(null);
    setIsFormOpen(false);
  };

  const handleDeleteClick = async (index) => {
    const globalIndex = page * rowsPerPage + index;
    const billToDelete = data[globalIndex];
    await remove(billToDelete.id);

    const updatedData = [...data];
    updatedData.splice(globalIndex, 1);
    setData(updatedData);

    updatedData.forEach((bill, i) => {
      updatedData[i].counter = i + 1;
    });

    setData(updatedData);
    setTotalItems(updatedData.length);
    setIsFormOpen(false);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPage = (event) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleCheckboxChange = async (index) => {
    const updatedData = [...data];
    updatedData[index].isChecked = !updatedData[index].isChecked;
    const unformattedAmount = updatedData[index].amount.replace(/,/g, '');
    updatedData[index].amount = unformattedAmount;
    setData(updatedData);

    try {
      const billToUpdate = updatedData[index];
      if (billToUpdate.id) {
        await update(billToUpdate);
      } else {
        await create(billToUpdate);
      }
    } catch (error) {
      console.error('Error updating checkbox state:', error);
      setData(updatedData);
    }
  };

  return (
    <DashboardCard>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Monthly Bills
        </Typography>
        <Button startIcon={<AddIcon />} sx={{ ml: 2 }} onClick={handleAddClick} />
      </Box>
      <Box sx={{ mt: 2, width: { xs: '280px', sm: 'auto' } }}>
        {data.length === 0 ? (
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            No bills data available to show. <strong>Please add a new one!</strong>
          </Alert>
        ) : (
          <>
            <Table aria-label="simple table">
              <StyledTable>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        ITEM
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}></Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        DATE
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        NAME
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
                  {data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.counter}</TableCell>
                        <TableCell>
                          <Checkbox
                            style={{ color: 'green' }}
                            checked={row.isChecked}
                            onChange={() => handleCheckboxChange(index)}
                            disabled={editIndex === index || adding}
                          />
                        </TableCell>
                        <TableCell>{format(row.billDate, 'yyyy-MM-dd')}</TableCell>
                        <TableCell style={{ whiteSpace: 'pre-line' }}>{row.name}</TableCell>
                        <TableCell style={{ whiteSpace: 'pre-line' }}>
                          {row.amount.toLocaleString()}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'pre-line' }}>
                          {row.totalDebt.toLocaleString()}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'pre-line' }}>
                          {row.actualDebt.toLocaleString()}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'pre-line' }}>
                          {row.totalBalance.toLocaleString()}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'pre-line' }}>
                          {row.remainingAmount.toLocaleString()}
                        </TableCell>
                        <TableCell style={{ whiteSpace: 'pre-line' }}>
                          {row.gap.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <>
                            <Button
                              startIcon={<EditIcon />}
                              onClick={() => handleEditClick(index)}
                            />
                            <Button
                              style={{ color: 'red' }}
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteClick(index)}
                            />
                          </>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </StyledTable>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15, 20, 25, 50, 100]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPage}
            />
          </>
        )}
      </Box>
      <Dialog open={isFormOpen} onClose={handleCancelButton}>
        <DialogContent>
          <BillForm
            isOpen={isFormOpen}
            onClose={handleCancelButton}
            onSave={getBillsItems}
            data={formData}
            title={adding ? 'Add new bill' : formData.name}
          />
        </DialogContent>
      </Dialog>
    </DashboardCard>
  );
};

const StyledTable = styled(Table)`
  white-space: nowrap;
  mt: 2;
  min-width: 600;
  table-layout: fixed;
`;

export default BillsTable;
