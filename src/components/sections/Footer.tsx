
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="pt-24 pb-8 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Community Section */}
        <div className="mb-32">
          <SectionHeader 
            badge="Community"
            title="Stay in the loop"
            align="center"
            className="mb-16"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* X/Twitter Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[32px] p-8 border shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">15.2K followers</span>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4">X/Twitter</h3>
              <p className="text-muted-foreground mb-8 flex-1">Stay updated on new features and discover how others are using Dreelio.</p>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="w-full">Follow us</Button>
              </a>
            </motion.div>

            {/* YouTube Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] p-8 border shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">32k subscribers</span>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4">YouTube</h3>
              <p className="text-muted-foreground mb-8 flex-1">Tips, tutorials, and in-depth feature guides to inspire and enhance your Dreelio workflow.</p>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="w-full">Subscribe</Button>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Big CTA Section */}
        <div className="text-center mb-32 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative z-10"
           >
             <h2 className="text-5xl md:text-7xl font-display font-semibold tracking-tight mb-6">
               Ready to get started
             </h2>
             <p className="text-xl text-muted-foreground mb-10">
               Download SurgeSkills for free.
             </p>
             <Link to="/contact-us">
               <Button size="lg">Try SurgeSkill</Button>
             </Link>
           </motion.div>
        </div>

        {/* Footer Links & Copyright */}
        <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
             <div className="flex items-center gap-2">
               <div className="w-6 h-6 bg-primary rounded-[4px] flex items-center justify-center">
                 <span className="text-primary-foreground font-display font-bold text-xs leading-none">S</span>
               </div>
               <span className="font-display font-semibold">SurgeSkill</span>
             </div>
             <p className="text-sm text-muted-foreground">Built For Students. By Students</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
             <Link to="/" className="hover:text-primary transition-colors">Home</Link>
             <a href="#features" className="hover:text-primary transition-colors">Features</a>
             <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
             <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
             <Link to="/contact-us" className="hover:text-primary transition-colors">Contact</Link>
             <Link to="/" className="hover:text-primary transition-colors">Privacy</Link>
             <Link to="/" className="hover:text-primary transition-colors">Terms of use</Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
             © 2026 SurgeSkill Inc.
          </div>
        </div>
      </div>
    </footer>
  );
}
