import React from "react";
import {
  BrowserRouter as RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { ToastContainer, Zoom } from "react-toastify";
import { AuthProvider } from "./context/AuthContext.jsx";
import VideoMeet from "./pages/VideoMeet.jsx";
import CreateRoom from "./pages/CreateRoom.jsx";
import MeetingHistory from "./pages/MeetingHistory.jsx";

const App = () => {
  return (
    <div className="relative custom-scrollbar bg-black text-gray-400">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[200px] bg-blue-600 rounded-[500%] -rotate-45 blur-[150px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-0 right-0 transform w-[100px] h-[100px] bg-red-600 rounded-[100%] blur-[50px] opacity-40 mix-blend-screen pointer-events-none" />
      <RouterProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="/:url" element={<VideoMeet />} />
            <Route path="/user-meetings-history" element={<MeetingHistory />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </AuthProvider>

        {/* Toast */}
        <ToastContainer
          theme="dark"
          hideProgressBar
          position="bottom-left"
          transition={Zoom}
          autoClose={2000}
        />
      </RouterProvider>
    </div>
  );
};

export default App;
