import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, AlertCircle } from "lucide-react";

interface GuildInfo {
  name: string;
  players: number;
  logo?: string;
}

const GuildFetch = ({ region, onGuildFetched }: { region: "bd" | "ind"; onGuildFetched: (guild: GuildInfo, guildId: string) => void }) => {
  const [guildId, setGuildId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [guild, setGuild] = useState<GuildInfo | null>(null);

  const handleFetch = async () => {
    if (!guildId.trim()) return;
    setLoading(true);
    setError("");
    setGuild(null);
    try {
      const res = await fetch(`https://danger-guild-management.vercel.app/guild?guild_id=${guildId}&region=${region}`);
      if (!res.ok) throw new Error("Guild not found");
      const data = await res.json();
      let name = data.guildName || data.guild_name || data.name || "Unknown Guild";
      // Try base64 decode
      try { name = atob(name); } catch {}
      const info: GuildInfo = { name, players: data.playerCount || data.player_count || data.members || 0, logo: data.logo };
      setGuild(info);
      onGuildFetched(info, guildId);
    } catch {
      setError("Guild not found. Please check the ID and region.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6">
      <h3 className="font-display text-sm font-bold text-foreground mb-4">🌐 Fetch Guild</h3>
      <div className="flex gap-3 mb-4">
        <input
          value={guildId}
          onChange={(e) => setGuildId(e.target.value)}
          className="input-glass flex-1"
          placeholder="Enter Guild ID..."
        />
        <button onClick={handleFetch} disabled={loading} className="btn-neon !px-5 flex items-center gap-2">
          <Search className="h-4 w-4" />
          {loading ? "..." : "Fetch"}
        </button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: "hsl(0 80% 55% / 0.1)", color: "hsl(0, 80%, 55%)" }}>
          <AlertCircle className="h-4 w-4" /> {error}
        </motion.div>
      )}

      {guild && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
            {guild.logo ? <img src={guild.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-xl">⚔️</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-foreground">{guild.name}</span>
              <CheckCircle className="h-4 w-4 text-neon-green" />
            </div>
            <span className="text-xs text-muted-foreground">{guild.players} Players</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GuildFetch;
