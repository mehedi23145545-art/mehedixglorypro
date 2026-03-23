import { motion } from "framer-motion";
import { Bot, Target, Clock, Zap } from "lucide-react";
import type { Package } from "@/lib/mockData";

interface Props {
  packages: Package[];
  selected: Package | null;
  onSelect: (pkg: Package) => void;
  credits: number;
}

const PackageSelector = ({ packages, selected, onSelect, credits }: Props) => {
  return (
    <div>
      <h3 className="font-display text-sm font-bold text-foreground mb-4">⚙️ Select Package</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg, i) => {
          const isSelected = selected?.id === pkg.id;
          const canAfford = credits >= pkg.credit_cost;
          const duration = Math.ceil(pkg.target_glory / pkg.glory_per_5min) * 5;

          return (
            <motion.button
              key={pkg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(pkg)}
              className={`glass p-5 text-left transition-all ${isSelected ? "neon-glow-green border-neon-green" : "hover:border-muted-foreground"}`}
            >
              <h4 className="font-display text-sm font-bold text-foreground mb-3">{pkg.name}</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 text-neon-green" />
                  <span>Cost: <span className="neon-text-green font-semibold">{pkg.credit_cost}৳</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-3.5 w-3.5 text-neon-blue" />
                  <span>Target: {pkg.target_glory.toLocaleString()} Glory</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bot className="h-3.5 w-3.5 text-neon-cyan" />
                  <span>{pkg.bot_count} Bots</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-neon-purple" />
                  <span>~{duration} min</span>
                </div>
              </div>
              {!canAfford && (
                <div className="mt-3 text-xs text-neon-red">🔴 Not enough credits</div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PackageSelector;
