import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";
import { toast } from "react-toastify";

export const AuthContext = createContext();

const client = axios.create({
  baseURL: "https://letsmeet-t85e.onrender.com/api/v1/users",
  withCredentials: true,
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  // * Setting the userData in localstorage
  // Restore userData from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Save userData to localStorage whenever it changes
  useEffect(() => {
    if (userData) {
      // Create a copy of userData without the password field
      const { password, ...safeData } = userData;
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [userData]);

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", {
        name: name,
        username: username,
        password: password,
      });

      if (request.status === httpStatus.CREATED) {
        console.log(request);
        setUserData(request.data);
        navigate("/");
        return request;
      }
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const request = await client.post("/login", {
        username: username,
        password: password,
      });

      if (request.status === httpStatus.OK) {
        console.log(request);
        setUserData(request.data);
        navigate("/");
        return request;
      }
    } catch (error) {
      throw error;
    }
  };

  const getUserHistory = async (userId) => {
    try {
      const request = await client.get(`/get_all_history/${userId}`);
      if (request.status === 404) {
        return request.response.data;
      }
      return request.data;
    } catch (error) {
      let message = error.response.data.message;
      toast.error(message);
      throw error;
    }
  };

  const addUserHistory = async (userId, meetingCode) => {
    try {
      const request = await client.post("/add_to_history", {
        user_id: userId,
        meeting_code: meetingCode,
      });

      return request.data;
    } catch (error) {
      let message = error.response.data.message;
      toast.error(message);
      throw error;
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getUserHistory,
    addUserHistory,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
