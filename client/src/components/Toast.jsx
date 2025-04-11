import React from "react";
import { ImCross } from "react-icons/im";

const Toast = ({ message, type = "success", onClose }) => {
  return (
    <div
      className={`fixed bottom-5 left-5 z-50 px-4 py-2 rounded shadow-lg text-white transition-all duration-300
      ${type === "success" ? "bg-green-700" : "bg-red-700"}
    `}
    >
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="text-white font-bold">
          <ImCross size={10} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
