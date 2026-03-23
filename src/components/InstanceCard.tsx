import { motion } from "framer-motion";
import { Bot, Globe, RotateCcw, Square } from "lucide-react";
import type { Instance } from "@/lib/mockData";

const InstanceCard = ({ instance }: { instance: Instance }) => {
  const progress = Math.min((instance.earned_glory / instance.target_glory) * 100, 100);
  const isRunning = instance.status === "running";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass p-5 ${isRunning ? "neon-glow-green" : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-sm font-bold text-foreground">{instance.guild_name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">ID: {instance.guild_id}</p>
        </div>
        <span className={isRunning ? "status-running" : "status-stopped"}>
          <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-neon-green animate-pulse-neon" : "bg-neon-red"}`} />
          {isRunning ? "Running" : "Stopped"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
        <div className="glass p-2 rounded-lg text-center">
          <Globe className="h-3.5 w-3.5 mx-auto mb-1 text-neon-blue" />
          <span className="text-muted-foreground">{instance.region === "bd" ? "🇧🇩 BD" : "🇮🇳 IND"}</span>
        </div>
        <div className="glass p-2 rounded-lg text-center">
          <Bot className="h-3.5 w-3.5 mx-auto mb-1 text-neon-cyan" />
          <span className="text-muted-foreground">{instance.bot_count} Bots</span>
        </div>
        <div className="glass p-2 rounded-lg text-center">
          <span className="text-muted-foreground">{instance.glory_per_5min}/5m</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">{instance.earned_glory} / {instance.target_glory}</span>
          <span className="neon-text-green font-semibold">{progress.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-container">
          <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 btn-neon-outline !py-2 text-xs flex items-center justify-center gap-1">
          <RotateCcw className="h-3 w-3" /> Restart
        </button>
        <button className="flex-1 btn-danger !py-2 text-xs flex items-center justify-center gap-1">
          <Square className="h-3 w-3" /> Stop
        </button>
      </div>
    </motion.div>
  );
};

export default InstanceCard;
