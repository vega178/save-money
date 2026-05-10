/**
 * billsServices.js
 *
 * All paths are relative to the baseURL configured in api.js
 * (REACT_APP_API_URL or http://localhost:8080/api).
 *
 * The shared `api` instance handles:
 *   - Attaching the Authorization header automatically
 *   - Unwrapping the NestJS { success, data, timestamp } response envelope
 */
import api from './api';

export const getBills = async() => {
  try {
    return await api.get('/bills');
  } catch (error) {
    console.log(error);
  }
  return null;
}

export const getBillsByUserId = async(userId) => {
  try {
    return await api.get(`/users/${userId}/bills`);
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const createBillByUserId = async(userId,
  {
    billDate,
    name,
    amount,
    totalDebt,
    actualDebt,
    totalBalance,
    remainingAmount,
    gap,
    isChecked
}) => {
  try {
    return await api.post(
      `/users/${userId}/bills`,
      { billDate, name, amount, totalDebt, actualDebt, totalBalance, remainingAmount, gap, isChecked },
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const update = async({
  id,
  billDate,
  name,
  amount,
  totalDebt,
  actualDebt,
  totalBalance,
  remainingAmount,
  gap,
  isChecked
}) => {
  try {
    return await api.put(
      `/bills/${id}`,
      { billDate, name, amount, totalDebt, actualDebt, totalBalance, remainingAmount, gap, isChecked },
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const remove = async(id) => {
  try {
    return await api.delete(`/bills/${id}`);
  } catch (error) {
    console.log(error);
  }
}

export const reorderBills = async(orderedIds) => {
  try {
    return await api.put('/bills/reorder', orderedIds);
  } catch (error) {
    console.log(error);
  }
}