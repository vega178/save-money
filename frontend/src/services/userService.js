import axios from "axios";

export const getUsers = async () => {
  try {
    return await axios.get('localhost:8080/api/users');
  } catch (error) {
    console.log(error);
  }
  return null;
}