import React from "react";
import Navbar from "../components/Navbar.jsx";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const routeTo = useNavigate();

  return (
    <div className=" bg-black w-full flex flex-col h-screen px-10">
      <Navbar />
      <div className="h-full px-10 ">
        <div className="h-full flex justify-around items-center  ">
          {/* left */}
          <div className="flex flex-col w-[50%]  h-full justify-center items-center">
            <div className=" flex flex-col items-start gap-4">
              <h1 className="text-4xl font-bold leading-tight">
                <span className="text-blue-500">Connect</span> with clarity Meet
                from anywhere.
              </h1>
              <h2 className="text-xl text-gray-400">
                Secure, fast, and reliable video meetings built with modern
                tech.
              </h2>
              <button
                onClick={() => routeTo("/create-room")}
                className="text-xl border-2 border-blue-200 rounded-2xl hover:border-blue-500 px-7 py-3 text-blue-200 hover:text-white transition-all duration-300 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>

          <div className="w-[50%] h-full flex justify-center items-center pointer-events-none">
            <div className=" flex items-center justify-center pointer-events-none">
              <img
                src="/assets/ZOOM.PNG"
                alt="image"
                className=" w-[90%] sm:w-[80%] object-contain pointer-events-none "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
