import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Shield, Globe, ChevronRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "hsl(160, 100%, 45%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl" style={{ background: "hsl(200, 100%, 50%)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse-neon" />
            <span className="text-sm text-muted-foreground">Automated Glory Boosting Platform</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="gradient-text">MEHEDI X</span>{" "}
          <span className="text-foreground">GLORY</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          The ultimate automated guild glory boosting platform. Fast, reliable, and fully managed. Dominate with ease.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register" className="btn-neon text-base flex items-center gap-2">
            Get Started <ChevronRight className="h-4 w-4" />
          </Link>
          <Link to="/login" className="btn-neon-outline text-base">
            Login
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-16"
        >
          {[
            { icon: Zap, text: "Instant Setup" },
            { icon: Shield, text: "Secure & Encrypted" },
            { icon: Globe, text: "BD & India Support" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-2 glass px-4 py-2 rounded-full">
              <f.icon className="h-4 w-4 text-neon-green" />
              <span className="text-sm text-muted-foreground">{f.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
