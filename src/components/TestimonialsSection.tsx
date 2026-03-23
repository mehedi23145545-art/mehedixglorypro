import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { name: "Rahim Hossain", region: "🇧🇩 Bangladesh", text: "Best glory service! My guild reached top 10 in just 2 days. Super reliable.", rating: 5 },
  { name: "Suresh Kumar", region: "🇮🇳 India", text: "Excellent platform. Bots joined instantly and glory was delivered on time. 100% legit.", rating: 5 },
  { name: "Arif Rahman", region: "🇧🇩 Bangladesh", text: "Tried many services before, this one is the fastest and cheapest. Amazing support!", rating: 5 },
  { name: "Priya Sharma", region: "🇮🇳 India", text: "The UI is so clean and the process is fully automated. Will use again for sure!", rating: 4 },
];

const TestimonialsSection = () => (
  <section className="py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-center mb-12 gradient-text"
      >
        What Our Users Say
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-6">
        {reviews.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6"
          >
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: r.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-neon-green text-neon-green" />
              ))}
            </div>
            <p className="text-muted-foreground text-sm mb-4">"{r.text}"</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{r.name}</span>
              <span className="text-xs text-muted-foreground">{r.region}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
