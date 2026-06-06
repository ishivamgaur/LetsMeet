const ModeSelector = ({ mode, setMode }) => {
  return (
    <div className="flex gap-3 w-full">
      <button
        onClick={() => setMode("video")}
        className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer border ${
          mode === "video"
            ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/25"
            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
        }`}
      >
        🎥 Video Chat
      </button>
      <button
        onClick={() => setMode("text")}
        className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 cursor-pointer border ${
          mode === "text"
            ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/25"
            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
        }`}
      >
        💬 Text Only
      </button>
    </div>
  );
};

export default ModeSelector;
