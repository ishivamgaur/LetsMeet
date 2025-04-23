import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { MdHistory } from "react-icons/md";

const UserMeetingsHistory = () => {
  const axiosInstance = axios.create({
    baseURL: "https://letsmeet-t85e.onrender.com/api/v1/users",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // https://letsmeet-t85e.onrender.com/api/v1/users
  const location = useLocation();
  const navigate = useNavigate();
  const { getUserHistory } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [meetingHistory, setMeetingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(location.state?.meetingHistory);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("parsed user: ", parsedUser);
      setUserData(parsedUser);
    }
  }, []);

  // Fetch meeting history only when userData is available
  useEffect(() => {
    if (userData && userData._id) {
      const fetchHistory = async () => {
        try {
          setLoading(true); // Start loading
          const history = await getUserHistory(userData._id); // Pass user ID
          console.log("History fetched: ", history.data);
          setMeetingHistory(history.data); // Update meeting history state
        } catch (error) {
          console.error("Error fetching history:", error);
          toast.error("Failed to fetch meeting history.");
        } finally {
          setLoading(false); // End loading
        }
      };

      fetchHistory();
    }
  }, [userData, getUserHistory]);

  if (loading && userData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
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
            <li className="hover:text-gray-200  hidden md:block transition-all duration-300"></li>
            <Link
              to={"/create-room"}
              className="cursor-pointer hover:text-gray-200 transition-all duration-300"
            >
              <p className="flex items-center gap-1">Create New Room</p>
            </Link>
          </ul>
        </div>
      </nav>

      <h2 className="text-3xl text-center pt-20 pb-5">Your Meeting History</h2>
      {meetingHistory.length === 0 ? (
        <p>No meeting history found</p>
      ) : (
        <ul className="grid gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
          {meetingHistory.map((meeting) => (
            <li
              key={meeting._id}
              className="p-4 border border-gray-600 rounded-lg shadow-md bg-[#00000027] text-gay-300 transition-transform duration-300 cursor-pointer transform hover:scale-102 hover:shadow-lg"
            >
              <p className="text-lg font-semibold">
                Meeting Code: {meeting.meeting_code}
              </p>
              <p className="text-sm text-gray-300">
                Date: {new Date(meeting.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserMeetingsHistory;
