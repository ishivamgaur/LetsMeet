import React, { useEffect, useRef, useState } from "react";
import { IoIosLock } from "react-icons/io";
import Toast from "../components/Toast";
import { Link } from "react-router-dom";

const AuthenticationPage = () => {
  const [formState, setFormState] = useState(0);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const fullNameRef = useRef(null);
  const usernameRef = useRef(null);

  useEffect(() => {
    if (formState === 0) {
      usernameRef.current?.focus();
    } else {
      fullNameRef.current?.focus();
    }
  }, [formState]);

  // console.log(fullName, username, password);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formState === 0) {
      // Login logic
      if (!username.trim() || !password.trim()) {
        return showToast("Please fill all fields.", "false");
      }

      console.log("Logging in with:", {
        username: username.trim(),
        password: password.trim(),
      });
      showToast("Login successfully");

      // API call logic here (example):
      // await axios.post("/api/login", { username, password });
    } else {
      // Register logic
      if (!fullName || !username || !password) {
        return showToast("Please fill all fields.", "false");
      }

      console.log("Registering with:", {
        fullName: fullName.trim(),
        username: username.trim(),
        password: password.trim(),
      });

      // API call logic here (example):
      // await axios.post("/api/register", { fullName, username, password });
    }

    // Clear inputs (optional)
    setFullName("");
    setUsername("");
    setPassword("");
  };

  return (
    <div className="w-full h-screen flex">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div
        className="w-[60%] bg-cover bg-center "
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
      ></div>

      <div className="w-[40%]  p-10 flex justify-center ">
        <div className="flex flex-col gap-5 w-full">
          <p className="w-fit p-2 rounded-full bg-purple-600 flex self-center ">
            <IoIosLock size={32} />
          </p>

          <div className="w-full flex gap-2 justify-center">
            <div
              onClick={() => setFormState(0)}
              role="button"
              className={`px-3 py-1 ${
                formState === 0 ? "bg-blue-500" : "bg-zinc-800"
              } cursor-pointer text-gray-200 transition-all duration-300`}
            >
              Login
            </div>
            <div
              onClick={() => setFormState(1)}
              role="button"
              className={`px-3 py-1 ${
                formState === 1 ? "bg-blue-500" : "bg-zinc-800"
              } cursor-pointer text-gray-200 transition-all duration-300`}
            >
              Register
            </div>
          </div>

          <div>
            <h2 className="text-4xl text-center">
              <span className="text-blue-500">
                {formState === 0 ? "Login" : "Register"}
              </span>{" "}
              to LetsMeet
            </h2>
          </div>

          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col gap-6"
          >
            {formState === 1 ? (
              <div className="w-full relative">
                <label htmlFor="fullName" className="text-gray-500 text-sm">
                  Full name:
                </label>
                <input
                  type="text"
                  ref={fullNameRef}
                  id="fullName"
                  className="w-full border-2 border-gray-800 focus:border-gray-500 transition-all duration-300 rounded-md outline-none px-5 py-2"
                  placeholder="Full name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            ) : (
              ""
            )}
            <div className="w-full relative">
              <label htmlFor="Username" className="text-gray-500 text-sm">
                Username:
              </label>
              <input
                type="text"
                ref={usernameRef}
                id="Username"
                className="w-full border-2 border-gray-800 focus:border-gray-500 transition-all duration-300 rounded-md outline-none px-5 py-2"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="Password" className="text-gray-500 text-sm">
                Password:
              </label>
              <input
                type="password"
                id="Password"
                className="w-full border-2 border-gray-800 focus:border-gray-500 transition-all duration-300 rounded-md outline-none px-5 py-2"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 w-full px-5 py-2 rounded-md cursor-pointer text-gray-200 transition-all duration-300"
              >
                Submit
              </button>
            </div>
            <p className="text-center text-md text-gray-400">
              Or{" "}
              <Link to="/" className="text-blue-500 hover:underline">
                go to Home
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
