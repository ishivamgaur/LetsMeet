import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const [authenticated, setAuthenticated] = useState(false);

  let navigate = useNavigate();

  const axiosInstance = axios.create({
    baseURL: "https://letsmeet-t85e.onrender.com/api/v1/users",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let res = await axiosInstance.get("/auth-check");

        console.log("Auth response 📞: ", res);
        if (res.data.authenticated) {
          setAuthenticated(true); //user is authenticated
        } else {
          toast.error("Not authenticated");
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkAuth();
  }, []);

  console.log("IsAuthenticated: ", authenticated);

  const handleLogout = async () => {
    try {
      let res = await axiosInstance.get("/logout");
      console.log("Logout Response:", res.data);
      toast.success(res.data.message);
      setAuthenticated(false);
    } catch (error) {
      console.log("Logout failed: ", error);
    }
  };

  const handleJoinCallAsGuest = () => {
    const generateRoomId = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };
    let randomRoomId = generateRoomId();
    navigate(`/${randomRoomId}`);
  };

  return (
    <>
      <nav className=" py-3 flex justify-between items-center px-10">
        <div>
          <h1 className="text-2xl font-semibold hover:text-gray-200 transition-all duration-300">
            <Link to={"/"}>LetsMeet</Link>
          </h1>
        </div>
        <div>
          <ul className="flex gap-10">
            <li
              onClick={handleJoinCallAsGuest}
              className="cursor-pointer hover:text-gray-200 transition-all duration-300"
            >
              Join as guest
            </li>
            <li className="cursor-pointer hover:text-gray-200 transition-all duration-300">
              {authenticated === true ? (
                <p
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 transition-all duration-300 font-semibold uppercase"
                >
                  Logout
                </p>
              ) : (
                <Link to={"/auth"}>Login / Register</Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
