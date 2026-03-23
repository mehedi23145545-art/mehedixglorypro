import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      // Navigation will be handled by auth state change
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "hsl(var(--primary))" }} />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-strong w-full max-w-md p-8 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap className="h-6 w-6 text-neon-green" />
          <span className="font-display text-lg font-bold gradient-text">MEHEDI X GLORY</span>
        </div>
        <h2 className="font-display text-xl font-bold text-center mb-6 text-foreground">Welcome Back</h2>
        {error && <div className="mb-4 p-3 rounded-lg text-sm text-center bg-destructive/15 text-destructive">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
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
          <button type="submit" disabled={loading} className="btn-neon w-full flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link to="/register" className="neon-text-green hover:underline">Register</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
