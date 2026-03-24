import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Package, Users, Bot, Ticket, FileText, Plus, Trash2, Edit, Loader2, Save, X } from "lucide-react";

type Tab = "packages" | "users" | "bots" | "coupons" | "instances" | "logs";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "packages", label: "Packages", icon: Package },
  { id: "users", label: "Users", icon: Users },
  { id: "bots", label: "Bots", icon: Bot },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "instances", label: "Instances", icon: FileText },
  { id: "logs", label: "Logs", icon: FileText },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("packages");
  const [packages, setPackages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bots, setBots] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [allInstances, setAllInstances] = useState<any[]>([]);

  // Modal states
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showBotForm, setShowBotForm] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [editPkg, setEditPkg] = useState<any>(null);

  // Package form
  const [pkgForm, setPkgForm] = useState({ name: "", region: "bd", price: 0, credit_cost: 0, target_glory: 0, glory_per_5min: 0, bot_count: 0 });
  // Coupon form
  const [couponForm, setCouponForm] = useState({ code: "", credit_amount: 0, usage_limit: 1, expiry_date: "" });
  // Bot form
  const [botForm, setBotForm] = useState({ uid: "", password: "" });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate(user ? "/dashboard" : "/login");
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin, activeTab]);

  const loadData = async () => {
    if (activeTab === "packages") {
      const { data } = await supabase.from("packages").select("*").order("created_at");
      if (data) setPackages(data);
    } else if (activeTab === "users") {
      const { data } = await supabase.from("profiles").select("*").order("created_at");
      if (data) setUsers(data);
    } else if (activeTab === "bots") {
      const { data } = await supabase.from("bots").select("*").order("created_at");
      if (data) setBots(data);
    } else if (activeTab === "coupons") {
      const { data } = await supabase.from("coupons").select("*").order("created_at");
      if (data) setCoupons(data);
    } else if (activeTab === "instances") {
      const { data } = await supabase.from("instances").select("*").order("started_at", { ascending: false });
      if (data) setAllInstances(data);
    } else if (activeTab === "logs") {
      const { data } = await supabase.from("system_logs").select("*").order("created_at", { ascending: false }).limit(50);
      if (data) setLogs(data);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Package CRUD
  const savePkg = async () => {
    if (editPkg) {
      await supabase.from("packages").update(pkgForm).eq("id", editPkg.id);
    } else {
      await supabase.from("packages").insert(pkgForm);
    }
    setShowPkgForm(false);
    setEditPkg(null);
    setPkgForm({ name: "", region: "bd", price: 0, credit_cost: 0, target_glory: 0, glory_per_5min: 0, bot_count: 0 });
    loadData();
  };

  const deletePkg = async (id: string) => {
    await supabase.from("packages").delete().eq("id", id);
    loadData();
  };

  const startEditPkg = (p: any) => {
    setEditPkg(p);
    setPkgForm({ name: p.name, region: p.region, price: p.price, credit_cost: p.credit_cost, target_glory: p.target_glory, glory_per_5min: p.glory_per_5min, bot_count: p.bot_count });
    setShowPkgForm(true);
  };

  // User credit management
  const addCredits = async () => {
    if (!showCreditModal || !creditAmount) return;
    const amt = parseInt(creditAmount);
    await supabase.from("profiles").update({ credits: showCreditModal.credits + amt }).eq("id", showCreditModal.id);
    setShowCreditModal(null);
    setCreditAmount("");
    loadData();
  };

  const toggleBan = async (u: any) => {
    const newStatus = u.status === "active" ? "banned" : "active";
    await supabase.from("profiles").update({ status: newStatus }).eq("id", u.id);
    loadData();
  };

  // Bot CRUD
  const saveBot = async () => {
    await supabase.from("bots").insert({ uid: botForm.uid, password: botForm.password });
    setShowBotForm(false);
    setBotForm({ uid: "", password: "" });
    loadData();
  };

  // Coupon CRUD
  const saveCoupon = async () => {
    const payload: any = { code: couponForm.code, credit_amount: couponForm.credit_amount, usage_limit: couponForm.usage_limit };
    if (couponForm.expiry_date) payload.expiry_date = couponForm.expiry_date;
    await supabase.from("coupons").insert(payload);
    setShowCouponForm(false);
    setCouponForm({ code: "", credit_amount: 0, usage_limit: 1, expiry_date: "" });
    loadData();
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    loadData();
  };

  const deleteBot = async (id: string) => {
    await supabase.from("bots").delete().eq("id", id);
    loadData();
  };

  const updateInstanceStatus = async (id: string, status: string) => {
    await supabase.from("instances").update({ status }).eq("id", id);
    loadData();
  };

  const deleteInstance = async (id: string) => {
    await supabase.from("instances").delete().eq("id", id);
    loadData();
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar isLoggedIn credits={profile?.credits ?? 0} isAdmin onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold text-foreground mb-6">
          👑 Admin Panel
        </motion.h1>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeTab === t.id ? "gradient-primary text-background" : "glass text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* PACKAGES */}
        {activeTab === "packages" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-foreground">Package Manager</h2>
              <button onClick={() => { setEditPkg(null); setPkgForm({ name: "", region: "bd", price: 0, credit_cost: 0, target_glory: 0, glory_per_5min: 0, bot_count: 0 }); setShowPkgForm(true); }} className="btn-neon text-sm !py-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Package</button>
            </div>
            {showPkgForm && (
              <div className="glass p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-glass" placeholder="Name" value={pkgForm.name} onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })} />
                  <select className="input-glass" value={pkgForm.region} onChange={e => setPkgForm({ ...pkgForm, region: e.target.value })}>
                    <option value="bd">🇧🇩 BD</option><option value="ind">🇮🇳 IND</option>
                  </select>
                  <input className="input-glass" type="number" placeholder="Price ৳" value={pkgForm.price || ""} onChange={e => setPkgForm({ ...pkgForm, price: +e.target.value })} />
                  <input className="input-glass" type="number" placeholder="Credit Cost" value={pkgForm.credit_cost || ""} onChange={e => setPkgForm({ ...pkgForm, credit_cost: +e.target.value })} />
                  <input className="input-glass" type="number" placeholder="Target Glory" value={pkgForm.target_glory || ""} onChange={e => setPkgForm({ ...pkgForm, target_glory: +e.target.value })} />
                  <input className="input-glass" type="number" placeholder="Glory/5min" value={pkgForm.glory_per_5min || ""} onChange={e => setPkgForm({ ...pkgForm, glory_per_5min: +e.target.value })} />
                  <input className="input-glass" type="number" placeholder="Bot Count" value={pkgForm.bot_count || ""} onChange={e => setPkgForm({ ...pkgForm, bot_count: +e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={savePkg} className="btn-neon text-sm !py-2 flex items-center gap-2"><Save className="h-4 w-4" /> Save</button>
                  <button onClick={() => setShowPkgForm(false)} className="btn-danger text-sm !py-2">Cancel</button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Region</th><th className="pb-3 font-medium">Cost (৳)</th><th className="pb-3 font-medium">Target</th><th className="pb-3 font-medium">Bots</th><th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 text-muted-foreground">{p.region === "bd" ? "🇧🇩" : "🇮🇳"}</td>
                      <td className="py-3 neon-text-green">{p.credit_cost}৳</td>
                      <td className="py-3 text-muted-foreground">{p.target_glory?.toLocaleString()}</td>
                      <td className="py-3 text-muted-foreground">{p.bot_count}</td>
                      <td className="py-3 flex gap-2">
                        <button onClick={() => startEditPkg(p)} className="text-neon-blue hover:text-accent"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => deletePkg(p.id)} className="text-neon-red hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-lg font-bold text-foreground mb-4">User Manager</h2>
            {showCreditModal && (
              <div className="glass p-4 mb-4 flex items-center gap-3">
                <span className="text-sm text-foreground">Add credits to {showCreditModal.email}:</span>
                <input className="input-glass w-32" type="number" placeholder="Amount" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} />
                <button onClick={addCredits} className="btn-neon text-sm !py-2">Add</button>
                <button onClick={() => setShowCreditModal(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Email</th><th className="pb-3 font-medium">Credits</th><th className="pb-3 font-medium">Region</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{u.email}</td>
                      <td className="py-3 neon-text-green">{u.credits}৳</td>
                      <td className="py-3 text-muted-foreground">{u.region === "bd" ? "🇧🇩" : "🇮🇳"}</td>
                      <td className="py-3"><span className={u.status === "active" ? "status-running" : "status-stopped"}>{u.status}</span></td>
                      <td className="py-3 flex gap-2">
                        <button onClick={() => setShowCreditModal(u)} className="btn-neon-outline !py-1 !px-3 text-xs">+Credits</button>
                        <button onClick={() => toggleBan(u)} className="btn-danger !py-1 !px-3 text-xs">{u.status === "active" ? "Ban" : "Unban"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* BOTS */}
        {activeTab === "bots" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">Bot Manager</h2>
              <button onClick={() => setShowBotForm(true)} className="btn-neon text-sm !py-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Upload Bots</button>
            </div>
            {showBotForm && (
              <div className="glass p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-glass" placeholder="UID" value={botForm.uid} onChange={e => setBotForm({ ...botForm, uid: e.target.value })} />
                  <input className="input-glass" placeholder="Password" value={botForm.password} onChange={e => setBotForm({ ...botForm, password: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveBot} className="btn-neon text-sm !py-2">Save Bot</button>
                  <button onClick={() => setShowBotForm(false)} className="btn-danger text-sm !py-2">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="stat-card neon-glow-green">
                <h3 className="neon-text-green">{bots.filter(b => b.status === "available").length}</h3>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="stat-card neon-glow-red">
                <h3 className="text-neon-red">{bots.filter(b => b.status === "used").length}</h3>
                <p className="text-xs text-muted-foreground">Used</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">UID</th><th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bots.map((b) => (
                    <tr key={b.id} className="border-b border-border/50">
                      <td className="py-3 font-mono text-foreground">{b.uid}</td>
                      <td className="py-3"><span className={b.status === "available" ? "status-running" : "status-stopped"}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* COUPONS */}
        {activeTab === "coupons" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">Coupon Manager</h2>
              <button onClick={() => setShowCouponForm(true)} className="btn-neon text-sm !py-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Create Coupon</button>
            </div>
            {showCouponForm && (
              <div className="glass p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-glass" placeholder="Code (e.g. GLORY100)" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value })} />
                  <input className="input-glass" type="number" placeholder="Credit Amount" value={couponForm.credit_amount || ""} onChange={e => setCouponForm({ ...couponForm, credit_amount: +e.target.value })} />
                  <input className="input-glass" type="number" placeholder="Usage Limit" value={couponForm.usage_limit || ""} onChange={e => setCouponForm({ ...couponForm, usage_limit: +e.target.value })} />
                  <input className="input-glass" type="date" placeholder="Expiry (optional)" value={couponForm.expiry_date} onChange={e => setCouponForm({ ...couponForm, expiry_date: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveCoupon} className="btn-neon text-sm !py-2">Create</button>
                  <button onClick={() => setShowCouponForm(false)} className="btn-danger text-sm !py-2">Cancel</button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Code</th><th className="pb-3 font-medium">Credits</th><th className="pb-3 font-medium">Used/Limit</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-border/50">
                      <td className="py-3 font-mono neon-text-green">{c.code}</td>
                      <td className="py-3 text-foreground">{c.credit_amount}৳</td>
                      <td className="py-3 text-muted-foreground">{c.used_count}/{c.usage_limit}</td>
                      <td className="py-3"><span className={c.status === "active" ? "status-running" : "status-stopped"}>{c.status}</span></td>
                      <td className="py-3">
                        <button onClick={() => deleteCoupon(c.id)} className="text-neon-red hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* LOGS */}
        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-lg font-bold text-foreground mb-4">System Logs</h2>
            {logs.length === 0 ? (
              <div className="glass p-8 text-center text-muted-foreground text-sm">No logs yet.</div>
            ) : (
              <div className="space-y-2">
                {logs.map((l) => (
                  <div key={l.id} className="glass p-3 flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${l.type === "error" ? "bg-neon-red" : l.type === "credit" ? "bg-neon-blue" : "bg-neon-green"}`} />
                    <span className="text-muted-foreground text-xs font-mono flex-shrink-0">{new Date(l.created_at).toLocaleString()}</span>
                    <span className="text-foreground">{l.message}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
