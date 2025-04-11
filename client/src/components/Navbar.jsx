import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
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
            <li className="cursor-pointer hover:text-gray-200 transition-all duration-300">
              Join as guest
            </li>
            <li className="cursor-pointer hover:text-gray-200 transition-all duration-300">
              <Link to={"/auth"}>Login</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-200 transition-all duration-300">
              <Link to={"/auth"}>Register</Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
