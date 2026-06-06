import { useState, useRef, useEffect } from "react";

const ChatPanel = ({ messages, onSendMessage, onTyping, isPartnerTyping, isOpen }) => {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPartnerTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText("");
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    onTyping?.(e.target.value.length > 0);
  };

  return (
    <div
      className={`flex flex-col bg-white h-full transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b-4 border-[#1a1a1a] bg-[#ffe66d] flex justify-between items-center">
        <h3 className="text-sm font-black text-[#1a1a1a] uppercase tracking-widest">Chat Log</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar bg-[#f8edeb]">
        {messages.length === 0 && (
          <div className="border-4 border-[#1a1a1a] bg-white p-4 mx-auto max-w-xs text-center mt-10 shadow-[4px_4px_0_0_#1a1a1a]">
            <p className="text-[#1a1a1a] font-bold uppercase text-sm">
              You're now chatting with a random stranger. Say hi!
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 border-2 border-[#1a1a1a] font-medium text-sm shadow-[4px_4px_0_0_#1a1a1a] ${
                msg.sender === "you"
                  ? "bg-[#4ecdc4] text-[#1a1a1a] ml-auto"
                  : "bg-white text-[#1a1a1a] mr-auto"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isPartnerTyping && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-[#1a1a1a] px-4 py-3 shadow-[4px_4px_0_0_#1a1a1a]">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#1a1a1a] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t-4 border-[#1a1a1a] bg-[#ffe66d]">
        <div className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            placeholder="Type a message..."
            className="flex-1 bg-white border-2 border-[#1a1a1a] px-4 py-3 text-[#1a1a1a] font-bold placeholder-gray-500 outline-none focus:shadow-[4px_4px_0_0_#1a1a1a] transition-shadow"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#4ecdc4] border-2 border-[#1a1a1a] text-[#1a1a1a] text-sm uppercase font-black transition-all shadow-[4px_4px_0_0_#1a1a1a] active:shadow-none active:translate-y-[4px] cursor-pointer"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
