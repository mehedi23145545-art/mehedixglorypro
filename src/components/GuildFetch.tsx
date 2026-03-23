import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

import guildLogo from "@/assets/guild-logo.png";

const GuildFetch = ({ region }: { region: "bd" | "ind" }) => {
  const [guildId, setGuildId] = useState("");
  const [guild, setGuild] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!guildId) return;

    setLoading(true);
    try {
      const res = await fetch(
        `https://danger-guild-management.vercel.app/guild?guild_id=${guildId}&region=${region}`
      );
      const data = await res.json();

      if (data.status !== "success") throw new Error();

      setGuild(data);
    } catch {
      alert("Guild not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      {/* Input */}
      <div className="flex gap-3 mb-6">
        <input
          value={guildId}
          onChange={(e) => setGuildId(e.target.value)}
          placeholder="Enter Guild ID..."
          className="input-glass flex-1"
        />
        <button onClick={handleFetch} className="btn-neon flex gap-2">
          <Search className="w-4 h-4" />
          {loading ? "..." : "Fetch"}
        </button>
      </div>

      {/* Card */}
      {guild && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-yellow-500 p-5 bg-black shadow-xl"
        >

          {/* Top Section */}
          <div className="flex items-center gap-4">

            {/* Logo + Level */}
            <div className="relative">
              <img
                src={guildLogo}
                className="w-16 h-16 rounded-xl border-2 border-yellow-400 shadow-lg"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-0.5 rounded shadow">
                LV.{guild.GuildLevel}
              </span>
            </div>

            {/* Name + ID */}
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg">
                {guild.GuildName}
              </h2>

              <p className="text-gray-400 text-sm">
                ID: {guild.GuildId} • {guild.GuildRegion}
              </p>
            </div>

            {/* Online Indicator */}
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 mt-6 text-sm">

            {/* Members */}
            <div className="bg-black/40 p-3 rounded-lg border border-white/10">
              <p className="text-gray-400 text-xs">MEMBERS</p>
              <p className="text-white font-bold text-lg">
                {guild.CurrentMembers}/{guild.MaxMembers}
              </p>
            </div>

            {/* Leader */}
            <div className="bg-black/40 p-3 rounded-lg border border-white/10">
              <p className="text-gray-400 text-xs">LEADER</p>
              <p className="text-yellow-400 font-bold text-sm truncate">
                {guild.GuildLeader?.Name}
              </p>
            </div>

            {/* Glory */}
            <div className="bg-black/40 p-3 rounded-lg border border-white/10">
              <p className="text-gray-400 text-xs">TOTAL GLORY</p>
              <p className="text-orange-400 font-bold text-lg">
                {guild.TotalActivityPoints?.toLocaleString()}
              </p>
            </div>

          </div>

          {/* Optional Slogan */}
          {guild.GuildSlogan && (
            <p className="text-center text-xs text-gray-400 mt-4 italic">
              "{guild.GuildSlogan}"
            </p>
          )}

        </motion.div>
      )}
    </div>
  );
};

export default GuildFetch;