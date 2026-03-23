import { motion } from "framer-motion";
import { Trophy, Users, Clock, Bot } from "lucide-react";

const stats = [
  { icon: Trophy, value: "2.5M+", label: "Glory Delivered", color: "neon-text-green" },
  { icon: Users, value: "1,200+", label: "Active Users", color: "neon-text-blue" },
  { icon: Clock, value: "99.8%", label: "Uptime", color: "neon-text-cyan" },
  { icon: Bot, value: "5,000+", label: "Bots Ready", color: "neon-text-green" },
];

const StatsSection = () => (
  <section className="py-20 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="stat-card neon-glow-green"
        >
          <s.icon className={`h-8 w-8 mx-auto mb-3 ${s.color}`} />
          <h3 className={s.color}>{s.value}</h3>
          <p className="text-sm text-muted-foreground">{s.label}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default StatsSection;
