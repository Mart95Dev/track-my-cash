export default function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8F7FC]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-[16px] bg-[#F0EEFF] flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-[#6C5CE7] text-[28px]">account_balance_wallet</span>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7] animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7] animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-[#6C5CE7] animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
