import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Menu, X, LogOut, User, Shield } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  credits?: number;
  onLogout?: () => void;
}

const Navbar = ({ isLoggedIn = false, isAdmin = false, credits = 0, onLogout }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-strong sticky top-0 z-50 px-6 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Zap className="h-7 w-7 text-neon-green" />
          <span className="font-display text-lg font-bold gradient-text">MEHEDI X GLORY</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">Login</Link>
              <Link to="/register" className="btn-neon text-sm !py-2 !px-5">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`text-sm font-medium transition-colors ${location.pathname === "/dashboard" ? "neon-text-green" : "text-muted-foreground hover:text-foreground"}`}>Dashboard</Link>
              {isAdmin && (
                <Link to="/admin" className={`text-sm font-medium transition-colors flex items-center gap-1 ${location.pathname.startsWith("/admin") ? "neon-text-blue" : "text-muted-foreground hover:text-foreground"}`}>
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-lg">
                <span className="text-xs text-muted-foreground">💰</span>
                <span className="text-sm font-semibold neon-text-green">{credits}৳</span>
              </div>
              <button onClick={onLogout} className="text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden mt-4 flex flex-col gap-3 pb-4">
          {!isLoggedIn ? (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-muted-foreground text-sm">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-neon text-sm text-center !py-2">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground">Dashboard</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground">Admin</Link>}
              <div className="text-sm neon-text-green font-semibold">💰 {credits}৳</div>
              <button onClick={() => { onLogout?.(); setMobileOpen(false); }} className="text-sm text-destructive text-left">Logout</button>
            </>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
