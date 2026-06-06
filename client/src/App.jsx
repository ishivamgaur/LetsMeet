import React from "react";
import {
  BrowserRouter as RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import ChatRoom from "./pages/ChatRoom.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { ToastContainer, Zoom } from "react-toastify";
import { AuthProvider } from "./context/AuthContext.jsx";

const App = () => {
  return (
    <RouterProvider>
      <AuthProvider>
        <Routes>
          {/* Omegle-style routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={<ChatRoom />} />

          {/* Legacy auth (optional) */}
          <Route path="/auth" element={<AuthPage />} />

          {/* 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </AuthProvider>

      <ToastContainer
        theme="dark"
        hideProgressBar
        position="bottom-left"
        transition={Zoom}
        autoClose={2000}
      />
    </RouterProvider>
  );
};

export default App;
