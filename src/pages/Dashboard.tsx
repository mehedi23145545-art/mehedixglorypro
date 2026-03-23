import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
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
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [coupon, setCoupon] = useState("");
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
          <div className="glass p-6">
            <div className="flex justify-between items-center">
              <div>
                <p>Package: {selectedPkg.name}</p>
                <p>Cost: {selectedPkg.credit_cost}৳</p>
                <p>Balance: {profile.credits}৳</p>
              </div>

              <button
                onClick={handleLaunch}
                disabled={!canLaunch}
                className="btn-neon flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" /> Launch
              </button>
            </div>

            {profile.credits < selectedPkg.credit_cost && (
              <p className="text-red-500 text-xs mt-2">
                Not enough credits
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

export default Dashboard;-background/60 backdrop-blur-sm px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong w-full max-w-sm p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">Buy Credits</h3>
              <button onClick={() => setShowBuyModal(false)}>
                <X />
              </button>
            </div>

            <p className="text-sm mb-4">
              Contact admin on Telegram. Send your User ID and amount.
            </p>

            <a
              href={`https://t.me/yourusername?text=I want to buy credits. User ID: ${user?.id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-neon w-full flex items-center justify-center gap-2"
            >
              <MessageCircle /> Contact on Telegram
            </a>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard; gap-2">
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
Dashboard;
