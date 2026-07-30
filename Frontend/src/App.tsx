import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import SubmitForm from "./pages/SubmitForm";
import Wall from "./pages/Wall";
import Dashboard from "./pages/Dashboard";
import EmbedWidget from "./pages/EmbedWidget";

function AppNav() {
  const location = useLocation();
  // /embed renders inside an iframe on someone else's site — it must never carry nav chrome
  if (location.pathname === "/embed") return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `no-underline px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-ink text-paper-raised shadow-xs"
        : "text-muted hover:text-ink hover:bg-slate-200/60"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-paper-raised/85 backdrop-blur-md border-b border-line/80 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5">
        <NavLink to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white font-mono text-sm font-bold shadow-xs group-hover:scale-105 transition-transform">
            T★
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight text-ink">
              Testimonials
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Platform
            </span>
          </div>
        </NavLink>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <NavLink to="/" end className={linkClass}>
            Submit Review
          </NavLink>
          <NavLink to="/wall" className={linkClass}>
            Public Wall
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Moderation
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-paper text-ink">
        <AppNav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<SubmitForm />} />
            <Route path="/wall" element={<Wall />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/embed" element={<EmbedWidget />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}