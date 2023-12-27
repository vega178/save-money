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
  TextField,
  Button,
  TablePagination,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
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
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { format } from 'date-fns';
import DashboardCard from '../../../components/shared/DashboardCard';
import BillForm from './BillForm';
import FileDropzone from './DragAndDropBillsComponent';
import { getBills, create, update, remove } from '../../../services/billsServices';

const BillsTable = () => {
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
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
    setEditIndex(index);
    setSaving(false);
    setFormData(data[index]);
    setIsFormOpen(true);
  };

  const handleSaveClick = async () => {
    try {
      if (adding) {
        await create(formData);
      } else {
        await update(formData);
      }

      setEditIndex(null);
      setSaving(true);
      setIsFormOpen(false);

      fetchData();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
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
    const billToDelete = data[index];
    await remove(billToDelete.id);
    const updatedData = [...data];
    updatedData.splice(index, 1);
    setData(updatedData);
    updatedData.forEach((bill, i) => {
      updatedData[i].counter = i + 1;
    });
  };

  const handleDateChange = (date) => {
    setFormData((prevData) => ({ ...prevData, billDate: date }));
  };

  const handleNumericChange = (e, key) => {
    const value = e.target.value.replace(/[^0-9.]/g, ' ');
    setFormData((prevData) => ({ ...prevData, [key]: value }));
  };

  const handleTextChange = (event, key) => {
    setFormData((prevData) => ({ ...prevData, [key]: event.target.value }));
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleCheckboxChange = async (index) => {
    const updatedData = [...data];
    updatedData[index].isChecked = !updatedData[index].isChecked;
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
                  {data.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((row, index) => (
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
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>{row.totalDebt}</TableCell>
                      <TableCell>{row.actualDebt}</TableCell>
                      <TableCell>{row.totalBalance}</TableCell>
                      <TableCell>{row.remainingAmount}</TableCell>
                      <TableCell>{row.gap}</TableCell>
                      <TableCell>
                        <>
                          <Button startIcon={<EditIcon />} onClick={() => handleEditClick(index)} />
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
              rowsPerPageOptions={[10, 15, 25]}
              rowsPerPage={rowsPerPage}
              page={page}
              component="div"
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPage}
              count={totalItems}
            />
          </>
        )}
      </Box>
      <Dialog open={isFormOpen} onClose={handleCancelButton}>
        <DialogContent>
          <BillForm
            isOpen={isFormOpen}
            onClose={handleCancelButton}
            onSave={handleSaveClick}
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