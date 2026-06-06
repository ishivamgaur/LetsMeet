import { useState } from "react";

const InterestTags = ({ interests, setInterests }) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (e) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const tag = inputValue.trim().toLowerCase();
      if (!interests.includes(tag) && interests.length < 10) {
        setInterests([...interests, tag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tag) => {
    setInterests(interests.filter((t) => t !== tag));
  };

  return (
    <div className="w-full">
      {interests.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-4 mb-2">
          {interests.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#ffeb3b] text-black border-2 border-black font-bold uppercase text-xs shadow-[2px_2px_0_0_#000]"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-600 transition-colors cursor-pointer font-black text-lg leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={addTag}
        placeholder="E.g. music, coding, anime... (Press Enter)"
        className="w-full bg-transparent border-0 px-4 py-4 text-black font-bold placeholder-gray-500 outline-none transition-colors"
      />
    </div>
  );
};

export default InterestTags;
