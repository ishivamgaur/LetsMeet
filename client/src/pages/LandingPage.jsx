import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import InterestTags from "../components/matching/InterestTags.jsx";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

const COUNTRIES = [
  "Any Country", "United States", "India", "United Kingdom", "Canada", 
  "Australia", "Germany", "France", "Japan", "Brazil", "Mexico",
  "South Korea", "Indonesia", "Philippines", "Turkey", "Italy",
  "Spain", "Netherlands", "Sweden", "Norway", "Denmark"
];

const LandingPage = () => {
  const [interests, setInterests] = useState([]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Any");
  const [country, setCountry] = useState("Any Country");
  const [onlineCount, setOnlineCount] = useState(null);
  const [chatting, setChatting] = useState(0);
  const navigate = useNavigate();

  // Connect a lightweight socket just for the landing page so the user counts as "online"
  useEffect(() => {
    let sessionId = sessionStorage.getItem("letsmeet_session");
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + "-" + Date.now();
      sessionStorage.setItem("letsmeet_session", sessionId);
    }

    const s = io(SERVER_URL, {
      query: { sessionId },
      reconnection: true,
      reconnectionAttempts: 3,
    });

    const onCount = ({ count, chatting: chattingCount }) => {
      setOnlineCount(count || 0);
      setChatting(chattingCount || 0);
    };

    s.on("online-count", onCount);

    const handleUnload = () => s.disconnect();
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      s.off("online-count", onCount);
      s.disconnect();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const handleStart = (selectedMode) => {
    navigate("/chat", { state: { mode: selectedMode, interests, name: name || "Stranger", gender, country } });
  };

  return (
    <div className="min-h-screen bg-[#f4f0ec] text-[#1a1a1a] font-sans selection:bg-[#ff6b6b] selection:text-white pb-20">
      
      <header className="border-b-4 border-[#1a1a1a] bg-[#ffffff] py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Let'sMeet<span className="text-[#ff6b6b]">_</span>
            </h1>
            <span className="text-xs font-bold bg-[#ffe66d] text-[#1a1a1a] px-2 py-1 border-2 border-[#1a1a1a] uppercase tracking-wider shadow-[2px_2px_0_0_#1a1a1a]">BETA</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-[#ffffff] px-4 py-2 border-2 border-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a]">
              <div className="w-3 h-3 bg-[#4ecdc4] border border-[#1a1a1a] animate-pulse"></div>
              <span className="text-sm font-bold uppercase tracking-wide">
                {onlineCount !== null ? `${onlineCount} online` : "Connecting..."}
              </span>
            </div>
            {chatting > 0 && (
              <div className="hidden sm:flex items-center gap-2 bg-[#c8b6ff] px-3 py-2 border-2 border-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a]">
                <span className="text-sm font-bold uppercase">{chatting} chatting</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          <div className="inline-block bg-[#c8b6ff] border-2 border-[#1a1a1a] px-4 py-1 font-bold text-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] -rotate-2">
            v2.0 IS LIVE
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none uppercase">
            Talk to <br/> strangers.
          </h2>
          <div className="text-lg md:text-xl font-medium leading-relaxed max-w-lg space-y-6">
            <p>Let'sMeet is the fastest way to meet new friends on the internet. We pick someone at random and let you talk one-on-one.</p>
            <p>Completely anonymous. No tracking. Just pure conversation.</p>
          </div>
          <div className="bg-[#ffe66d] border-4 border-[#1a1a1a] p-5 shadow-[8px_8px_0_0_#1a1a1a] transform rotate-1 max-w-lg">
            <h4 className="font-black text-xl uppercase mb-2">⚠️ Warning</h4>
            <p className="font-bold text-[#1a1a1a]">Predators have been known to use random chat sites. Please be extremely careful. Do not share personal information.</p>
          </div>
        </div>

        <div className="flex-1 w-full max-w-lg mx-auto lg:mt-0">
          <div className="bg-[#ffffff] border-4 border-[#1a1a1a] shadow-[12px_12px_0_0_#1a1a1a] flex flex-col">
            <div className="bg-[#1a1a1a] text-white p-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-center">Connection Terminal</h3>
            </div>
            
            <div className="p-6 md:p-8 border-b-4 border-[#1a1a1a] bg-[#e9ecef] space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wide">Your Name / Alias (Optional)</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Stranger" 
                  className="w-full bg-[#ffffff] border-2 border-[#1a1a1a] px-4 py-3 font-bold text-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] focus:shadow-[6px_6px_0_0_#1a1a1a] outline-none transition-all" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wide">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#ffffff] border-2 border-[#1a1a1a] px-4 py-3 font-bold text-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] focus:shadow-[6px_6px_0_0_#1a1a1a] outline-none appearance-none rounded-none cursor-pointer">
                    <option value="Any">Any</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wide">Country</label>
                  <select value={country} onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#ffffff] border-2 border-[#1a1a1a] px-4 py-3 font-bold text-[#1a1a1a] shadow-[4px_4px_0_0_#1a1a1a] focus:shadow-[6px_6px_0_0_#1a1a1a] outline-none appearance-none rounded-none cursor-pointer">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 border-b-4 border-[#1a1a1a] bg-[#f8edeb]">
              <label className="block text-sm font-bold text-[#1a1a1a] mb-2 uppercase tracking-wide">Your Interests</label>
              <div className="border-2 border-[#1a1a1a] bg-[#ffffff] shadow-[4px_4px_0_0_#1a1a1a] focus-within:shadow-[6px_6px_0_0_#1a1a1a] transition-shadow">
                <InterestTags interests={interests} setInterests={setInterests} />
              </div>
            </div>

            <div className="p-6 md:p-8 bg-[#ffffff]">
              <h3 className="font-black text-[#1a1a1a] text-xl mb-4 uppercase text-center">Initiate Chat</h3>
              <div className="flex flex-col sm:flex-row gap-6">
                <button onClick={() => handleStart("text")}
                  className="flex-1 bg-[#4ecdc4] hover:bg-[#3dbea6] active:bg-[#4ecdc4] text-[#1a1a1a] font-black uppercase text-xl py-4 border-4 border-[#1a1a1a] shadow-[6px_6px_0_0_#1a1a1a] hover:shadow-[4px_4px_0_0_#1a1a1a] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all cursor-pointer">
                  Text
                </button>
                <button onClick={() => handleStart("video")}
                  className="flex-1 bg-[#ff6b6b] hover:bg-[#fa5a5a] active:bg-[#ff6b6b] text-[#1a1a1a] font-black uppercase text-xl py-4 border-4 border-[#1a1a1a] shadow-[6px_6px_0_0_#1a1a1a] hover:shadow-[4px_4px_0_0_#1a1a1a] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all cursor-pointer">
                  Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
