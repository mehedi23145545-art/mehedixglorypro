import { Zap } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-8 px-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-neon-green" />
        <span className="font-display text-sm font-bold gradient-text">MEHEDI X GLORY</span>
      </div>
      <p className="text-xs text-muted-foreground">© 2024 MEHEDI X GLORY. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
