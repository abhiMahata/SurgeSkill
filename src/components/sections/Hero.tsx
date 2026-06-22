import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export function Hero() {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center max-w-4xl"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
              Built For Students. By Students
            </span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight leading-[1.1] mb-6"
          >
            Join a community where <span className="text-accent">knowledge</span> is shared, skills are developed.
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
          >
            Every learner has the opportunity to become a mentor. The SurgeSkill platform is perfect for creators, founders, and students who want a clean, eye-catching way to share and build skills.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/contact-us" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Try SurgeSkill
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                See features
              </Button>
            </a>
          </motion.div>
        </motion.div>

        {/* Trusted By Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 pt-10 border-t border-black/5 w-full flex flex-col items-center"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">Trusted By</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Using text logos for placeholders */}
            <span className="font-display font-bold text-xl md:text-2xl">Trust Me Bro</span>
            <span className="font-display font-bold text-xl md:text-2xl">Acme Corp</span>
            <span className="font-display font-bold text-xl md:text-2xl">GlobalNet</span>
            <span className="font-display font-bold text-xl md:text-2xl">Stark Ind.</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
