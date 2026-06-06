const SearchingOverlay = () => {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#f4f0ec]/95 backdrop-blur-sm">
      
      <div className="bg-white border-4 border-[#1a1a1a] p-8 shadow-[8px_8px_0_0_#1a1a1a] flex flex-col items-center max-w-md w-full mx-4">
        
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-[#1a1a1a] border-t-[#ff6b6b] rounded-full animate-spin mb-6"></div>

        <h2 className="text-2xl font-black text-[#1a1a1a] mb-3 uppercase tracking-wider text-center">
          Connecting to server...
        </h2>
        
        <p className="text-[#1a1a1a] font-bold text-center border-t-2 border-[#1a1a1a] border-dashed pt-4 w-full">
          Looking for someone you can chat with...
        </p>

      </div>

    </div>
  );
};

export default SearchingOverlay;
