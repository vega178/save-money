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
  TextField,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import { MenuItem, Select } from '@mui/material';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { format } from 'date-fns';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DashboardCard from '../../../components/shared/DashboardCard';
import BillForm from './BillForm';
import {
  getBillsByUserId,
  createBillByUserId,
  update,
  remove,
  reorderBills,
} from '../../../services/billsServices';
import { getUsers } from '../../../services/userService';

const SortableTableRow = ({ row, index, editIndex, adding, handleCheckboxChange, handleEditClick, handleDeleteClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(row.id) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#f0f0f0' : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} key={row.id}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span {...attributes} {...listeners} style={{ cursor: 'grab', color: '#aaa', display: 'flex' }}>
            <DragIndicatorIcon fontSize="small" />
          </span>
          {row.counter}
        </Box>
      </TableCell>
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
      <TableCell style={{ whiteSpace: 'pre-line' }}>{row.amount.toLocaleString()}</TableCell>
      <TableCell style={{ whiteSpace: 'pre-line' }}>{row.totalDebt.toLocaleString()}</TableCell>
      <TableCell style={{ whiteSpace: 'pre-line' }}>{row.actualDebt.toLocaleString()}</TableCell>
      <TableCell style={{ whiteSpace: 'pre-line' }}>{row.totalBalance.toLocaleString()}</TableCell>
      <TableCell style={{ whiteSpace: 'pre-line' }}>{row.remainingAmount.toLocaleString()}</TableCell>
      <TableCell style={{ whiteSpace: 'pre-line' }}>{row.gap.toLocaleString()}</TableCell>
      <TableCell>
        <>
          <Button startIcon={<EditIcon />} onClick={() => handleEditClick(index)} />
          <Button style={{ color: 'red' }} startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(index)} />
        </>
      </TableCell>
    </TableRow>
  );
};

const BillsTable = () => {
  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [adding, setAdding] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const mainJsonSession = sessionStorage.getItem('login');
  const jsonSession = JSON.parse(mainJsonSession);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isSessionTimeoutModalOpen, setIsSessionTimeoutModalOpen] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);


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
    try {
      const users = await getUsers();
      if (!users || !users.data) {
        console.error('Failed to fetch users or users data is null.');
        return;
      }

      users.data.forEach((item) => {
        if (item.username === jsonSession.username) {
          sessionStorage.setItem('userId', item.id);
        }
      });

      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found in session storage.');
        return;
      }

      const bills = await getBillsByUserId(sessionStorage.getItem('userId'));
      if (!bills || !bills.data) {
        if(bills.message.includes("status code 403")) {
          setIsSessionTimeoutModalOpen(true);
        }
        console.error('Failed to fetch bills or bills data is null.' + bills.message);
        return;
      }

      const formattedBills = bills.data.map((bill, index) => {
        const billDate = new Date(bill.billDate);
        const counter = index + 1;
        return {
          ...bill,
          billDate,
          counter,
        };
      });
      setData(formattedBills);
      const filtered = formattedBills.filter((item) => {
        const billDate = new Date(item.billDate);
        const matchesMonth =
          selectedMonth === '' || billDate.getMonth() + 1 === parseInt(selectedMonth);
        const matchesYear =
          selectedYear === '' || billDate.getFullYear() === parseInt(selectedYear);
        return matchesMonth && matchesYear;
      });
      setFilteredData(filtered);
      setTotalItems(bills.data.length);
      const { years, months } = getAvailableYearsAndMonths(formattedBills);
      setAvailableYears(years);
      setAvailableMonths(months);
      return formattedBills;
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response && error.response.data.message.includes('JWT expired')) {
        console.log('JWT expired error detected');
        setIsSessionTimeoutModalOpen(true);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredData.findIndex((r) => String(r.id) === active.id);
    const newIndex = filteredData.findIndex((r) => String(r.id) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(filteredData, oldIndex, newIndex).map((item, i) => ({
      ...item,
      counter: i + 1,
    }));
    setFilteredData(reordered);

    // Also reorder in the full data array
    const movedId = filteredData[oldIndex].id;
    const fullOldIndex = data.findIndex((r) => r.id === movedId);
    const targetId = filteredData[newIndex].id;
    const fullNewIndex = data.findIndex((r) => r.id === targetId);
    if (fullOldIndex !== -1 && fullNewIndex !== -1) {
      const reorderedData = arrayMove(data, fullOldIndex, fullNewIndex).map((item, i) => ({
        ...item,
        counter: i + 1,
      }));
      setData(reorderedData);
      await reorderBills(reorderedData.map((r) => r.id));
    }
  };

  const handleEditClick = (index) => {
    const globalIndex = page * rowsPerPage + index;
    setEditIndex(globalIndex);
    setFormData(data[globalIndex]);
    setIsFormOpen(true);
  };

  const getBillsItems = async () => {
    await fetchData();
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
    const billToDelete = filteredData[globalIndex];
    await remove(billToDelete.id);

    const updatedFilteredData = [...filteredData];
    updatedFilteredData.splice(globalIndex, 1);
    setFilteredData(updatedFilteredData);

    const updatedData = data.filter((item) => item.id !== billToDelete.id);
    setData(updatedData);

    setTotalItems(updatedFilteredData.length);
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
    const updatedFilteredData = [...filteredData];
    const itemToUpdate = updatedFilteredData[index];

    itemToUpdate.isChecked = !itemToUpdate.isChecked;

    try {
      if (itemToUpdate.id) {
        await update(itemToUpdate);
      } else {
        const createdItem = await createBillByUserId(itemToUpdate);
        itemToUpdate.id = createdItem.id;
      }
      setFilteredData(updatedFilteredData);

      const updatedSelectedItems = updatedFilteredData
        .filter((item) => item.isChecked)
        .map((item) => item.id);

      setSelectedItems(updatedSelectedItems);
      setSelectAll(updatedSelectedItems.length === updatedFilteredData.length);
    } catch (error) {
      console.error('Error updating checkbox state:', error);
    }
  };

  const handleSelectAll = () => {
    const updatedSelectAll = !selectAll;
    setSelectAll(updatedSelectAll);

    const updatedFilteredData = filteredData.map((item) => ({
      ...item,
      isChecked: updatedSelectAll,
    }));

    setFilteredData(updatedFilteredData);
    setSelectedItems(updatedSelectAll ? updatedFilteredData.map((item) => item.id) : []);
  };

  const handleSelectedItemsChange = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedItems) {
        await remove(id);
      }

      const updatedFilteredData = filteredData.filter((item) => !selectedItems.includes(item.id));
      setFilteredData(updatedFilteredData);

      const updatedData = data.filter((item) => !selectedItems.includes(item.id));
      setData(updatedData);

      setSelectedItems([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error deleting selected items:', error);
    }
  };

  const handleMonthChange = (event) => {
    const month = event.target.value;
    setSelectedMonth(month);
    const filtered = data.filter((item) => {
      const billDate = new Date(item.billDate);
      const matchesMonth = month === '' || billDate.getMonth() + 1 === parseInt(month);
      const matchesYear = selectedYear === '' || billDate.getFullYear() === parseInt(selectedYear);
      return matchesMonth && matchesYear;
    });
    setFilteredData(filtered);
    setPage(0);
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);

    const filtered = data.filter((item) => {
      const billDate = new Date(item.billDate);
      const matchesMonth =
        selectedMonth === '' || billDate.getMonth() + 1 === parseInt(selectedMonth);
      const matchesYear = year === '' || billDate.getFullYear() === parseInt(year);
      return matchesMonth && matchesYear;
    });

    setFilteredData(filtered);
    setPage(0);
  };

  const getAvailableYearsAndMonths = (data) => {
    const years = new Set();
    const months = new Set();
  
    data.forEach((item) => {
      const billDate = new Date(item.billDate);
      years.add(billDate.getFullYear());
      months.add(billDate.getMonth() + 1);
    });
  
    return {
      years: Array.from(years).sort((a, b) => a - b),
      months: Array.from(months).sort((a, b) => a - b),
    };
  };

  const getFinalRemainingAmount = () => {
    if (filteredData.length === 0) return null;
    const lastItem = filteredData[filteredData.length - 1];
    return lastItem.remainingAmount;
  };


  return (
    <DashboardCard>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Monthly Bills
        </Typography>
        <Button startIcon={<AddIcon />} sx={{ ml: 2 }} onClick={handleAddClick} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            mr: 2,
            color: getFinalRemainingAmount() < 0 ? 'red' : 'green',
          }}
        >
        {selectedYear || selectedMonth
      ? `Remaining Amount for ${selectedYear || 'All Years'} - ${
          selectedMonth
            ? [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ][selectedMonth - 1]
            : 'All Months'
        } = ${getFinalRemainingAmount() !== null ? getFinalRemainingAmount().toLocaleString() : 'N/A'}`
      : 'No Filter Applied'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            displayEmpty
            sx={{ width: 150, mr: 2 }}
            disabled={data.length === 0}
          >
            <MenuItem value="">
              <em>All Years</em>
            </MenuItem>
            {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
              <MenuItem key={year} value={year} disabled={!availableYears.includes(year)}>
                {year}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            displayEmpty
            sx={{ width: 200 }}
            disabled={data.length === 0}
          >
            <MenuItem value="">
              <em>All Months</em>
            </MenuItem>
            {[
              { value: 1, label: 'January' },
              { value: 2, label: 'February' },
              { value: 3, label: 'March' },
              { value: 4, label: 'April' },
              { value: 5, label: 'May' },
              { value: 6, label: 'June' },
              { value: 7, label: 'July' },
              { value: 8, label: 'August' },
              { value: 9, label: 'September' },
              { value: 10, label: 'October' },
              { value: 11, label: 'November' },
              { value: 12, label: 'December' },
            ].map((month) => (
              <MenuItem
                key={month.value}
                value={month.value}
                disabled={!availableMonths.includes(month.value)}
              >
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
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
                      <Checkbox
                        style={{ color: 'green' }}
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
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
                    <TableCell>
                      <Button
                        style={{ color: 'red' }}
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteSelected}
                        disabled={selectedItems.length === 0}
                      />
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                      items={filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((r) => String(r.id))}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredData
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, index) => (
                          <SortableTableRow
                            key={row.id}
                            row={row}
                            index={index}
                            editIndex={editIndex}
                            adding={adding}
                            handleCheckboxChange={handleCheckboxChange}
                            handleEditClick={handleEditClick}
                            handleDeleteClick={handleDeleteClick}
                          />
                        ))}
                    </SortableContext>
                  </DndContext>
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
            items={data}
            title={adding ? 'Add new bill' : formData.name}
            user={sessionStorage.getItem('userId')}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isSessionTimeoutModalOpen} onClose={() => {}}>
        <DialogContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Session Timeout
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your session has expired. Please log in again to continue.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              sessionStorage.clear();
              window.location.href = '/auth/login';
            }}
          >
            Accept
          </Button>
        </Box>
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
