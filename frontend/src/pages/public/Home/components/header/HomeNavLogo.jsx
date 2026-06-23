import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeNavLogo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 shrink-0 group select-none"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-400 text-white shadow-sm group-hover:bg-rose-500 transition-colors">
        <Sparkles size={17} />
      </div>
      <span className="hidden sm:block font-bold text-rose-900 text-[15px] tracking-tight leading-none">
        Bloom<span className="text-rose-400">Beauty</span>
      </span>
    </Link>
  );
}
