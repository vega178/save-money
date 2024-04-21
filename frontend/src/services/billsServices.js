import axios from "axios";

const BASE_URL = 'http://localhost:8080/api';

const config = () => {
  return {
    headers: {
      "Authorization" : sessionStorage.getItem('token'),
      "Content-Type" : "application/json",
    }
  }
}

export const getBills = async() => {
  try {
    return await axios.get(BASE_URL + "/bills", config());
  } catch (error) {
    console.log(error);
  }
  return null;
}

export const getBillsByUserId = async(userId) => {
  try {
    return await axios.get(`${BASE_URL + "/users"}/${userId}/bills`, config());
  } catch (error) {
    console.log(error);
  }
  return null;
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
    return await axios.post(
      `${BASE_URL + "/users"}/${userId}/bills`, 
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
      }, config()
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
    return await axios.put(
      `${BASE_URL + "/bills"}/${id}`, 
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
      }, config()
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const remove = async(id) => {
  try {
    return await axios.delete(`${BASE_URL+ "/bills"}/${id}`, config());
  } catch (error) {
    console.log(error);
  }
}