import { useState } from 'react';
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <section className="py-24 bg-white/50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader 
          badge="pricing"
          title="for serious work"
          className="mb-12"
        />

        <div className="flex justify-center mb-16">
          <div className="flex items-center p-1 bg-secondary rounded-full relative">
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-full transition-colors z-10 ${
                isAnnual ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {isAnnual && (
                <motion.div
                  layoutId="pricingTabIndicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              Annually
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-full transition-colors z-10 ${
                !isAnnual ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {!isAnnual && (
                <motion.div
                  layoutId="pricingTabIndicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              Monthly
            </button>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {/* Basic Plan */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <h3 className="text-xl font-display font-semibold mb-2">Basic</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-display font-semibold">Free</span>
            </div>
            <p className="text-muted-foreground text-sm mb-8">For solo use with light needs.</p>
            
            <div className="flex flex-col gap-4 mb-8 flex-1">
              {['Unlimited projects', 'Unlimited clients', 'Time tracking', 'CRM', 'iOS & Andriod app'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <Link to="/contact-us">
              <Button variant="secondary" className="w-full">Try now</Button>
            </Link>
          </motion.div>

          {/* Premium Plan */}
          <motion.div variants={itemVariants} className="bg-primary text-primary-foreground rounded-[32px] p-8 shadow-xl flex flex-col relative transform md:-translate-y-4">
            {isAnnual && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase shadow-md">
                Save 20%
              </div>
            )}
            <h3 className="text-xl font-display font-semibold mb-2">Premium</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-display font-semibold">${isAnnual ? '87' : '109'}</span>
              <span className="text-white/70">/mo</span>
            </div>
            <p className="text-white/70 text-sm mb-8">For pro use with light needs.</p>
            
            <div className="flex flex-col gap-4 mb-8 flex-1">
              {['Everything in Basic', 'Invoices & payments', 'Expense tracking', 'Income tracking', 'Scheduling'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <Link to="/contact-us">
              <Button variant="primary" className="w-full bg-white text-primary hover:bg-white/90">Get started</Button>
            </Link>
          </motion.div>

          {/* Campus Plan */}
          <motion.div variants={itemVariants} className="bg-white rounded-[32px] p-8 border shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <h3 className="text-xl font-display font-semibold mb-2">Campus</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-display font-semibold">Rs {isAnnual ? '3,499' : '349'}</span>
              <span className="text-muted-foreground">{isAnnual ? '/yr' : '/mo'}</span>
            </div>
            <p className="text-muted-foreground text-sm mb-8">For team use with light needs.</p>
            
            <div className="flex flex-col gap-4 mb-8 flex-1">
              {['Everything in Premium', 'Custom data import', 'Advanced onboarding', 'Hubspot integration', 'Timesheets'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
            <Link to="/contact-us">
              <Button variant="secondary" className="w-full">Contact sales</Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
