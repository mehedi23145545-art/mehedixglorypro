import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import GuildFetch from "@/components/GuildFetch";
import PackageSelector from "@/components/PackageSelector";
import InstanceCard from "@/components/InstanceCard";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, ShoppingCart, X, MessageCircle, Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading: authLoading, signOut, refreshProfile } = useAuth();
  const [packages, setPackages] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [guildReady, setGuildReady] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    // Fetch packages
    supabase.from("packages").select("*").then(({ data }) => {
      if (data) setPackages(data);
    });
    // Fetch user instances
    supabase.from("instances").select("*").eq("user_id", user.id).then(({ data }) => {
      if (data) setInstances(data);
    });
  }, [user]);

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
      </div>
    );
  }

  const regionPackages = packages.filter((p) => p.region === profile.region);
  const canLaunch = guildReady && selectedPkg && profile.credits >= selectedPkg.credit_cost;

  const handleLaunch = async () => {
    if (!canLaunch || !selectedPkg || !user) return;
    // Deduct credits
    await supabase.from("profiles").update({ credits: profile.credits - selectedPkg.credit_cost }).eq("id", user.id);
    await refreshProfile();
    alert("🚀 Bots launched! Check your instances below.");
  };

  const handleCoupon = async () => {
    if (!coupon || !user) return;
    const { data, error } = await supabase.rpc("redeem_coupon", { _code: coupon, _user_id: user.id });
    if (error) {
      setCouponMsg("❌ " + error.message);
    } else if (data && typeof data === "object") {
      const result = data as any;
      if (result.success) {
        setCouponMsg(`✅ +${result.credits_added}৳ added!`);
        setCoupon("");
        await refreshProfile();
      } else {
        setCouponMsg("❌ " + result.error);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <Navbar isLoggedIn credits={profile.credits} isAdmin={isAdmin} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Region: {profile.region === "bd" ? "🇧🇩 Bangladesh" : "🇮🇳 India"}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowBuyModal(true)} className="btn-neon text-sm !py-2 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Buy Credits
            </button>
          </div>
        </motion.div>

        {/* Coupon */}
        <div className="glass p-5">
          <h3 className="font-display text-sm font-bold text-foreground mb-3">🎟️ Redeem Coupon</h3>
          <div className="flex gap-3">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} className="input-glass flex-1" placeholder="Enter coupon code..." />
            <button onClick={handleCoupon} className="btn-neon-outline !py-2 text-sm">Redeem</button>
          </div>
          {couponMsg && <p className="text-sm mt-2 text-muted-foreground">{couponMsg}</p>}
        </div>

        <GuildFetch region={profile.region as "bd" | "ind"} onGuildFetched={() => setGuildReady(true)} />

        <PackageSelector packages={regionPackages} selected={selectedPkg} onSelect={setSelectedPkg} credits={profile.credits} />

        {selectedPkg && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Package: </span>
                <span className="font-semibold text-foreground">{selectedPkg.name}</span>
                <span className="text-muted-foreground ml-4">Cost: </span>
                <span className="neon-text-green font-semibold">{selectedPkg.credit_cost}৳</span>
                <span className="text-muted-foreground ml-4">Balance: </span>
                <span className={`font-semibold ${profile.credits >= selectedPkg.credit_cost ? "neon-text-green" : "text-neon-red"}`}>{profile.credits}৳</span>
              </div>
              <button onClick={handleLaunch} disabled={!canLaunch} className={`btn-neon flex items-center gap-2 ${!canLaunch ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Rocket className="h-4 w-4" /> Launch Bots
              </button>
            </div>
            {!guildReady && <p className="text-xs text-neon-red mt-2">⚠️ Fetch a guild first</p>}
            {profile.credits < selectedPkg.credit_cost && <p className="text-xs text-neon-red mt-2">🔴 Not enough credits. Please buy or redeem.</p>}
          </motion.div>
        )}

        <div>
          <h3 className="font-display text-sm font-bold text-foreground mb-4">📦 Your Instances</h3>
          {instances.length === 0 ? (
            <div className="glass p-8 text-center text-muted-foreground text-sm">No active instances. Launch bots to get started!</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {instances.map((inst) => (
                <InstanceCard key={inst.id} instance={inst} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm px-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-strong w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-foreground">💰 Buy Credits (৳)</h3>
              <button onClick={() => setShowBuyModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Contact admin on Telegram to purchase credits. Send your User ID and amount in ৳.</p>
            <p className="text-xs text-muted-foreground mb-4">Your ID: <span className="font-mono neon-text-green">{user?.id?.slice(0, 8)}</span></p>
            <div className="flex gap-3">
              <a href="https://t.me/YOUR_ADMIN_USERNAME" target="_blank" rel="noreferrer" className="btn-neon flex-1 text-center text-sm flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" /> Get Credits
              </a>
              <button onClick={() => setShowBuyModal(false)} className="btn-danger flex-1 text-sm">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
