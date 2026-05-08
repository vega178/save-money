import axios from "axios";

const BASE_URL = 'http://localhost:8080';

const config = () => {
  return {
    headers: {
      "Authorization" : sessionStorage.getItem('token'),
      "Content-Type" : "application/json",
    }
  }
}

export const getUsers = async () => {
  try {
    return await axios.get(BASE_URL + "/api/users");
  } catch (error) {
    console.log(error);
  }
  return null;
}

export const createUser = async({
  username, 
  email,
  password
}) => {
  try {
    return await axios.post(
      BASE_URL + "/api/users",
      {
        username,
        email,
        password
      },
       config()
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const login = async({
  username, 
  password
}) => {
  try {
    return await axios.post(
      BASE_URL + "/login",
      {
        username,
        password
      }
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const updateUser = async({
  id,
  username, 
  email,
  password
}) => {
  try {
    return await axios.put(
      `${BASE_URL}/api/users/${id}`, 
      {
        username, 
        email,
        password
      },
      config()
    );
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export const deleteUser = async(id) => {
  try {
    return await axios.delete(`${BASE_URL}/api/users/${id}`, config());
  } catch (error) {
    console.log(error);
  }
}