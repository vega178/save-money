import axios from "axios";

const BASE_URL = 'localhost:8080/api/users';

export const getUsers = async () => {
  try {
    return await axios.get(BASE_URL);
  } catch (error) {
    console.log(error);
  }
  return null;
}