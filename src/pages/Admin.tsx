import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Package, Users, Bot, Ticket, FileText, Plus, Trash2, Edit } from "lucide-react";

type Tab = "packages" | "users" | "bots" | "coupons" | "logs";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "packages", label: "Packages", icon: Package },
  { id: "users", label: "Users", icon: Users },
  { id: "bots", label: "Bots", icon: Bot },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "logs", label: "Logs", icon: FileText },
];

const mockUsers = [
  { id: "user-001", email: "rahim@gmail.com", credits: 250, region: "bd", status: "active" },
  { id: "user-002", email: "suresh@gmail.com", credits: 120, region: "ind", status: "active" },
  { id: "user-003", email: "arif@gmail.com", credits: 0, region: "bd", status: "banned" },
];

const mockBots = [
  { uid: "BOT001", password: "****", status: "available" },
  { uid: "BOT002", password: "****", status: "used" },
  { uid: "BOT003", password: "****", status: "available" },
  { uid: "BOT004", password: "****", status: "used" },
];

const mockCoupons = [
  { code: "GLORY100", credit_amount: 100, usage_limit: 50, used_count: 12, expiry: "2024-12-31", status: "active" },
  { code: "WELCOME50", credit_amount: 50, usage_limit: 100, used_count: 100, expiry: "2024-06-01", status: "expired" },
];

const mockLogs = [
  { time: "2024-03-20 10:32", type: "bot_join", msg: "BOT001 joined guild GLD001 (BD)" },
  { time: "2024-03-20 10:30", type: "credit", msg: "User rahim@gmail.com deducted 150৳" },
  { time: "2024-03-20 10:28", type: "error", msg: "BOT005 failed to join GLD003 — timeout" },
  { time: "2024-03-20 10:25", type: "bot_join", msg: "BOT003 joined guild GLD002 (IND)" },
  { time: "2024-03-20 10:20", type: "credit", msg: "Coupon GLORY100 redeemed by suresh@gmail.com (+100৳)" },
];

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("packages");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    if (!parsed.isAdmin) { navigate("/dashboard"); return; }
    setUser(parsed);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar isLoggedIn credits={user.credits} isAdmin onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold text-foreground mb-6">
          👑 Admin Panel
        </motion.h1>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${activeTab === t.id ? "gradient-primary text-background" : "glass text-muted-foreground hover:text-foreground"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Packages Tab */}
        {activeTab === "packages" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-foreground">Package Manager</h2>
              <button className="btn-neon text-sm !py-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Package</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Region</th>
                    <th className="pb-3 font-medium">Cost (৳)</th>
                    <th className="pb-3 font-medium">Target</th>
                    <th className="pb-3 font-medium">Bots</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Starter BD", region: "bd", cost: 50, target: 1000, bots: 5 },
                    { name: "Pro BD", region: "bd", cost: 150, target: 5000, bots: 15 },
                    { name: "Ultimate BD", region: "bd", cost: 350, target: 15000, bots: 30 },
                  ].map((p) => (
                    <tr key={p.name} className="border-b border-border/50">
                      <td className="py-3 font-medium text-foreground">{p.name}</td>
                      <td className="py-3 text-muted-foreground">{p.region === "bd" ? "🇧🇩" : "🇮🇳"}</td>
                      <td className="py-3 neon-text-green">{p.cost}৳</td>
                      <td className="py-3 text-muted-foreground">{p.target.toLocaleString()}</td>
                      <td className="py-3 text-muted-foreground">{p.bots}</td>
                      <td className="py-3 flex gap-2">
                        <button className="text-neon-blue hover:text-accent"><Edit className="h-4 w-4" /></button>
                        <button className="text-neon-red hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-lg font-bold text-foreground mb-4">User Manager</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Credits</th>
                    <th className="pb-3 font-medium">Region</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{u.email}</td>
                      <td className="py-3 neon-text-green">{u.credits}৳</td>
                      <td className="py-3 text-muted-foreground">{u.region === "bd" ? "🇧🇩" : "🇮🇳"}</td>
                      <td className="py-3"><span className={u.status === "active" ? "status-running" : "status-stopped"}>{u.status}</span></td>
                      <td className="py-3 flex gap-2">
                        <button className="btn-neon-outline !py-1 !px-3 text-xs">+Credits</button>
                        <button className="btn-danger !py-1 !px-3 text-xs">{u.status === "active" ? "Ban" : "Unban"}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Bots Tab */}
        {activeTab === "bots" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">Bot Manager</h2>
              <button className="btn-neon text-sm !py-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Upload Bots</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="stat-card neon-glow-green">
                <h3 className="neon-text-green">{mockBots.filter(b => b.status === "available").length}</h3>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="stat-card neon-glow-red">
                <h3 className="text-neon-red">{mockBots.filter(b => b.status === "used").length}</h3>
                <p className="text-xs text-muted-foreground">Used</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">UID</th>
                    <th className="pb-3 font-medium">Password</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBots.map((b) => (
                    <tr key={b.uid} className="border-b border-border/50">
                      <td className="py-3 font-mono text-foreground">{b.uid}</td>
                      <td className="py-3 text-muted-foreground">{b.password}</td>
                      <td className="py-3"><span className={b.status === "available" ? "status-running" : "status-stopped"}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Coupons Tab */}
        {activeTab === "coupons" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-lg font-bold text-foreground">Coupon Manager</h2>
              <button className="btn-neon text-sm !py-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Create Coupon</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Code</th>
                    <th className="pb-3 font-medium">Credits</th>
                    <th className="pb-3 font-medium">Used/Limit</th>
                    <th className="pb-3 font-medium">Expiry</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCoupons.map((c) => (
                    <tr key={c.code} className="border-b border-border/50">
                      <td className="py-3 font-mono neon-text-green">{c.code}</td>
                      <td className="py-3 text-foreground">{c.credit_amount}৳</td>
                      <td className="py-3 text-muted-foreground">{c.used_count}/{c.usage_limit}</td>
                      <td className="py-3 text-muted-foreground">{c.expiry}</td>
                      <td className="py-3"><span className={c.status === "active" ? "status-running" : "status-stopped"}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-display text-lg font-bold text-foreground mb-4">System Logs</h2>
            <div className="space-y-2">
              {mockLogs.map((l, i) => (
                <div key={i} className="glass p-3 flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${l.type === "error" ? "bg-neon-red" : l.type === "credit" ? "bg-neon-blue" : "bg-neon-green"}`} />
                  <span className="text-muted-foreground text-xs font-mono flex-shrink-0">{l.time}</span>
                  <span className="text-foreground">{l.msg}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
