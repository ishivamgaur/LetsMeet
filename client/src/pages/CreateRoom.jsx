import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { MdHistory } from "react-icons/md";

const CreateRoom = () => {
  const [roomCode, setRoomCode] = useState("");
  const [timeString, setTimeString] = useState("");
  const { userData, setUserData, getUserHistory, addUserHistory } =
    useContext(AuthContext);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const handleJoinVideoCall = async () => {
    if (!roomCode.trim()) return;

    let response = await addUserHistory(userData._id, roomCode);
    console.log("Adding History: ", response);
    setRoomCode("");
    toast.success(response.message);
    navigate(`/${roomCode}`);
  };

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/v1/users",
    withCredentials: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        let res = await axiosInstance.get("/auth-check");

        console.log("Auth response 📞: ", res);
        if (res.data.authenticated) {
          setUserData(res.data.user);
          setLoading(false); //user is authenticated
        } else {
          navigate("/auth");
          toast.error("Not authenticated");
        }
      } catch (error) {
        console.log(error);
        navigate("/auth");
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const day = now.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      });

      setTimeString(`${time} • ${day}`);
    };
    updateTime();

    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-3xl text-white">Checking authentication...</p>
      </div>
    );

  // console.log("userData: ", userData);
  const handleLogout = async () => {
    try {
      let res = await axiosInstance.get("/logout");
      setUserData(null);
      console.log("Logout Response:", res.data);
      toast.success(res.data.message);
      if (res.data.success) {
        navigate("/");
      }
    } catch (error) {
      console.log("Logout failed: ", error);
    }
  };

  // * Get all user meeting history
  const handleGetAllHistory = async () => {
    try {
      let userId = userData?._id;
      console.log(userId);
      let history = await getUserHistory(userId);
      console.log("Get All History: ", history);

      navigate("/user-meetings-history", {
        state: { meetingHistory: history.data },
      });
    } catch (error) {
      toast.error("Failed to fetch meeting history");
      console.log("Error Feeting history: ", error);
    }
  };

  return (
    <div className="w-full h-screen relative">
      <nav className="absolute w-full py-3 flex justify-between items-center px-10">
        <div>
          <h1 className="text-2xl font-semibold hover:text-gray-200 transition-all duration-300">
            <Link to={"/"}>LetsMeet</Link>
          </h1>
        </div>
        <div>
          <ul className="flex gap-10">
            <li className="hover:text-gray-200  hidden md:block transition-all duration-300">
              {timeString}
            </li>

            {}

            <Link
              to={"#"}
              className="cursor-pointer hover:text-gray-200 transition-all duration-300"
            >
              <p
                onClick={handleGetAllHistory}
                className="flex items-center gap-1"
              >
                <span>
                  <MdHistory fontSize={24} />
                </span>
                History
              </p>
            </Link>
            <li className="cursor-pointer hover:text-gray-200 transition-all duration-300">
              <p
                onClick={handleLogout}
                className="flex items-center text-red-500 font-semibold gap-2 justify-center"
              >
                <span>
                  <RiLogoutCircleRLine fontSize={22} />
                </span>
                LOGOUT
              </p>
            </li>
          </ul>
        </div>
      </nav>
      <div className="w-full h-full flex flex-col md:flex-row items-center justify-center  text-white p-10 md:p-20 xl:p-30 overflow-hidden">
        {/* Left Side - Form */}
        <div className="md:w-1/2 w-full flex flex-col md:items-start gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl">
              Welcome👋 {userData?.name ? <span>{userData.name}</span> : "User"}
              ,
            </h3>
            <h2 className="text-2xl md:text-3xl">Create or Join a Meeting</h2>
          </div>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            autoFocus
            onChange={(e) => setRoomCode(e.target.value)}
            className="w-full md:w-[70%] px-4 py-3 rounded-md transition-all duration-300 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            onClick={handleJoinVideoCall}
            async
            className="bg-green-700 cursor-pointer hover:bg-green-800 px-6 py-3 rounded-md text-white font-semibold transition-all duration-300"
          >
            Create / Join Room
          </button>
        </div>

        {/* Right Side - Image */}
        <div className="md:w-1/2 w-full overflow-hidden mt-10 md:mt-0 flex justify-center md:justify-end">
          <img
            src="https://images.unsplash.com/photo-1637592156141-d41fb6234e71?q=80&w=2753&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Meeting Illustration"
            className="w-[90%] max-w-md rounded-full shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
