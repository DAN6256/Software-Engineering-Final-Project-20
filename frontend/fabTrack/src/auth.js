import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL_API ; 
// Sign up function
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
