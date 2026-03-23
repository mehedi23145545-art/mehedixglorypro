import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "How does MEHEDI X GLORY work?", a: "Select a package, enter your guild ID, and our automated bots will join your guild and generate glory points over time. Fully automated, no manual work needed." },
  { q: "Is it safe to use?", a: "Yes! We use encrypted bot credentials, rate limiting, and anti-detection systems. Your guild is safe with us." },
  { q: "What regions are supported?", a: "We currently support Bangladesh 🇧🇩 and India 🇮🇳 regions with dedicated servers for each." },
  { q: "What is the refund policy?", a: "If bots fail to deliver the promised glory, we offer a full credit refund. Contact admin via Telegram for assistance." },
  { q: "How do I buy credits?", a: "Click 'Buy Credits' and contact our admin on Telegram. Send your User ID and amount in ৳. Credits will be added manually." },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12 gradient-text"
        >
          FAQ
        </motion.h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-sm font-semibold text-foreground">{f.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
