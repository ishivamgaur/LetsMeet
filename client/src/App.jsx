import React from "react";
import {
  BrowserRouter as RouterProvider,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import AuthenticationPage from "./pages/AuthenticationPage.jsx";

const App = () => {
  return (
    <div className="relative bg-black text-gray-400">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[200px] bg-blue-600 rounded-[500%] -rotate-45 blur-[150px] opacity-40 mix-blend-screen pointer-events-none" />
      <div className="absolute top-0 right-0 transform w-[100px] h-[100px] bg-red-600 rounded-[100%] blur-[50px] opacity-40 mix-blend-screen pointer-events-none" />
      <RouterProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth" element={<AuthenticationPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </RouterProvider>
    </div>
  );
};

export default App;
