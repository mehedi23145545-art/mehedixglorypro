import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PackageSelector from "@/components/PackageSelector";
import InstanceCard from "@/components/InstanceCard";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, ShoppingCart, X, MessageCircle, Loader2, Search } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading: authLoading, signOut, refreshProfile } = useAuth();

  const [packages, setPackages] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [guildId, setGuildId] = useState("");
  const [guildData, setGuildData] = useState<any>(null);
  const [guildLoading, setGuildLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    supabase.from("packages").select("*").then(({ data }) => {
      if (data) setPackages(data);
    });

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
  const canLaunch = selectedPkg && profile.credits >= selectedPkg.credit_cost;

  const handleLaunch = async () => {
    if (!canLaunch || !selectedPkg || !user) return;

    await supabase
      .from("profiles")
      .update({ credits: profile.credits - selectedPkg.credit_cost })
      .eq("id", user.id);

    await refreshProfile();
    alert("🚀 Bots launched! (Manual process via admin)");
  };

  const handleCoupon = async () => {
    if (!coupon || !user) return;

    const { data, error } = await supabase.rpc("redeem_coupon", {
      _code: coupon,
      _user_id: user.id,
    });

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
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Region: {profile.region === "bd" ? "🇧🇩 Bangladesh" : "🇮🇳 India"}
            </p>
          </div>

          <button
            onClick={() => setShowBuyModal(true)}
            className="btn-neon text-sm flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" /> Buy Credits
          </button>
        </motion.div>

        {/* Coupon */}
        <div className="glass p-5">
          <h3 className="text-sm font-bold mb-3">🎟️ Redeem Coupon</h3>
          <div className="flex gap-3">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="input-glass flex-1"
              placeholder="Enter coupon code..."
            />
            <button onClick={handleCoupon} className="btn-neon-outline text-sm">
              Redeem
            </button>
          </div>
          {couponMsg && <p className="text-sm mt-2">{couponMsg}</p>}
        </div>

        <PackageSelector
          packages={regionPackages}
          selected={selectedPkg}
          onSelect={setSelectedPkg}
          credits={profile.credits}
        />

        {selectedPkg && (
          <div className="glass p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p>Package: {selectedPkg.name}</p>
                <p>Cost: {selectedPkg.credit_cost}৳</p>
                <p>Balance: {profile.credits}৳</p>
              </div>
            </div>

            {/* Guild ID Input */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Guild ID (required)</label>
              <input
                value={guildId}
                onChange={(e) => setGuildId(e.target.value)}
                placeholder="Enter Guild ID..."
                className="input-glass w-full"
              />
            </div>

            {/* Guild Info Preview */}
            {guildData && (
              <div className="rounded-xl border border-yellow-500/50 p-4 bg-black/40">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-foreground font-bold">{guildData.GuildName}</h3>
                    <p className="text-xs text-muted-foreground">
                      ID: {guildData.GuildId} • {guildData.GuildRegion} • LV.{guildData.GuildLevel}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="glass p-2 rounded text-center">
                    <p className="text-muted-foreground">Members</p>
                    <p className="text-foreground font-bold">{guildData.CurrentMembers}/{guildData.MaxMembers}</p>
                  </div>
                  <div className="glass p-2 rounded text-center">
                    <p className="text-muted-foreground">Leader</p>
                    <p className="text-yellow-400 font-bold truncate">{guildData.GuildLeader?.Name}</p>
                  </div>
                  <div className="glass p-2 rounded text-center">
                    <p className="text-muted-foreground">Glory</p>
                    <p className="text-orange-400 font-bold">{guildData.TotalActivityPoints?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleFetchGuild}
                disabled={!guildId || guildLoading}
                className="btn-neon-outline text-sm flex items-center gap-2"
              >
                <Search className="h-4 w-4" /> {guildLoading ? "Fetching..." : "Fetch Guild"}
              </button>

              <button
                onClick={handleLaunch}
                disabled={!canLaunch || !guildData}
                className="btn-neon flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" /> Launch
              </button>
            </div>

            {!guildData && guildId && (
              <p className="text-xs text-muted-foreground">⚡ Guild fetch করো আগে Launch করার জন্য</p>
            )}

            {profile.credits < selectedPkg.credit_cost && (
              <p className="text-red-500 text-xs">
                🔴 Not enough credits
              </p>
            )}
          </div>
        )}

        {/* Instances */}
        <div>
          <h3 className="text-sm font-bold mb-4">📦 Your Instances</h3>
          {instances.length === 0 ? (
            <div className="glass p-6 text-center text-sm">
              No active instances yet
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {instances.map((inst) => (
                <InstanceCard key={inst.id} instance={inst} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BUY MODAL */}
      {showBuyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="glass p-6 w-full max-w-sm">
            <div className="flex justify-between mb-4">
              <h3>Buy Credits</h3>
              <button onClick={() => setShowBuyModal(false)}>
                <X />
              </button>
            </div>

            <p className="text-sm mb-4">
              Contact admin on Telegram
            </p>

            <a
              href={`https://t.me/Proxaura?text=I want to buy credits. User ID: ${user?.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-neon w-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Contact on Telegram
            </a>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;
