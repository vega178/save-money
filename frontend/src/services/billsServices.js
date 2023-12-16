import axios from "axios";

const BASE_URL = 'http://localhost:8080/api/bills';

export const getBills = async() => {
  try {
    return await axios.get(BASE_URL);
  } catch (error) {
    console.log(error);
  }
  return null;
}

export const create = async({
  billDate,
  name,
  amount,
  totalDebt,
  actualDebt,
  totalBalance,
  remainingAmount,
  gap
}) => {
  try {
    return await axios.post(
      BASE_URL, 
      {
         billDate,
         name,
         amount,
         totalDebt,
         actualDebt,
         totalBalance,
         remainingAmount,
         gap
      }
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
  gap
}) => {
  try {
    return await axios.put(
      `${BASE_URL}/${id}`, 
      {
         billDate,
         name,
         amount,
         totalDebt,
         actualDebt,
         totalBalance,
         remainingAmount,
         gap
      }
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const remove = async(id) => {
  try {
    return await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.log(error);
  }
}