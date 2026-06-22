import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-4' : 'py-6 md:py-8'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center">
        <div className={`flex items-center justify-between w-full max-w-5xl rounded-full px-4 md:px-6 py-3 transition-all duration-300 ${isScrolled ? 'glass' : 'bg-transparent'}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl leading-none">S</span>
            </div>
            <span className="font-display font-semibold text-lg hidden sm:block">SurgeSkill</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm font-medium hover:text-accent transition-colors">Features</a>
            <a href="/#pricing" className="text-sm font-medium hover:text-accent transition-colors">Pricing</a>
            <Link to="/blog" className="text-sm font-medium hover:text-accent transition-colors">Blog</Link>
            <Link to="/contact-us" className="text-sm font-medium hover:text-accent transition-colors">Contact Us</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/contact-us">
              <Button variant="primary" size="sm">Try SurgeSkill</Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
