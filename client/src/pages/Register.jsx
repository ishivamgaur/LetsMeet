import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaLongArrowAltLeft } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.username.trim() ||
      !formData.password.trim()
    )
      return;
    console.log(formData);
    setFormData({ fullName: "", username: "", password: "" });
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <div className="text-2xl mb-2 cursor-pointer">
        <Link to={"/"} className="flex items-center gap-2">
          <FaLongArrowAltLeft className="text-blue-500" /> Back to home
        </Link>
      </div>
      <form
        onSubmit={(e) => handleFormSubmit(e)}
        className="w-[400px] p-10 border-2  rounded-2xl h-[500px] flex flex-col justify-center"
      >
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-semibold text-center">
              Register to Zoom
            </h1>
          </div>
          <div>
            <label htmlFor="fullName">FullName:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange(e)}
              placeholder="John Doe"
              required
              className="bg-transparent placeholder:text-gray-700 rounded-md w-full outline-1 focus:outline-3 focus:outline-blue-500 p-2 text-white"
            />
          </div>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={(e) => handleChange(e)}
              placeholder="iamjohndoe"
              required
              className="bg-transparent placeholder:text-gray-700 rounded-md w-full outline-1 focus:outline-3 focus:outline-blue-500 p-2 text-white"
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={(e) => handleChange(e)}
              placeholder="password@01"
              required
              className="bg-transparent placeholder:text-gray-700 rounded-md w-full outline-1 focus:outline-3 focus:outline-blue-500 p-2 text-white"
            />
          </div>
        </div>
        <div className="pt-3 flex flex-col gap-3">
          <div>
            <p>
              Already have an account?{" "}
              <span className="cursor-pointer hover:underline  hover:text-blue-500 transition-all duration-300">
                <Link to={"/auth/login"}>Login</Link>
              </span>
            </p>
          </div>
          <div>
            <button className="text-xl border-2 border-blue-200 rounded-md w-full hover:border-blue-500 px-8 py-2 text-blue-200 hover:text-white transition-all duration-300 cursor-pointer">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
