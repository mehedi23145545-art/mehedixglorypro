import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState<"bd" | "ind">("bd");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || password.length < 4) {
      setError("Please fill all fields (password min 4 chars)");
      return;
    }
    localStorage.setItem("user", JSON.stringify({ id: "user-" + Date.now(), email, credits: 0, region, isAdmin: false }));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "hsl(200, 100%, 50%)" }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong w-full max-w-md p-8 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap className="h-6 w-6 text-neon-green" />
          <span className="font-display text-lg font-bold gradient-text">MEHEDI X GLORY</span>
        </div>
        <h2 className="font-display text-xl font-bold text-center mb-6 text-foreground">Create Account</h2>
        {error && <div className="mb-4 p-3 rounded-lg text-sm text-center" style={{ background: "hsl(0 80% 55% / 0.15)", color: "hsl(0, 80%, 55%)" }}>{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glass" placeholder="you@example.com" required />
          </div>
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-glass pr-10" placeholder="••••••••" required />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-8 text-muted-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Region</label>
            <div className="flex gap-3">
              {[
                { val: "bd" as const, label: "🇧🇩 Bangladesh" },
                { val: "ind" as const, label: "🇮🇳 India" },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setRegion(r.val)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${region === r.val ? "neon-glow-green border-neon-green text-neon-green" : "border-border text-muted-foreground hover:border-muted-foreground"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-neon w-full">Register</button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="neon-text-green hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
