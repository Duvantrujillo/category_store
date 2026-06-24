import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeNavLogo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 shrink-0 group select-none"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/25 text-white shadow-sm group-hover:bg-white/35 transition-colors">
        <Sparkles size={17} />
      </div>
      <span className="block font-bold italic text-white text-[15px] tracking-tight leading-none">
        Wow<span className="text-white/75">Beauty</span>
      </span>
    </Link>
  );
}
