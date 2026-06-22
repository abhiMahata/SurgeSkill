import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { Layers, Zap, Users, Globe, LayoutDashboard } from 'lucide-react';

export function FeaturesBento() {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-24 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader 
          badge="features"
          title="powered by simplicity"
          className="mb-16"
        />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-6 gap-6"
        >
          {/* Card 1: Large Top Left */}
          <motion.div variants={itemVariants} className="md:col-span-4 bg-white rounded-3xl p-8 border shadow-sm flex flex-col sm:flex-row gap-8 items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold mb-3">Smart, flexible, and built around your business workflow</h3>
              <p className="text-muted-foreground leading-relaxed">Personalize every detail. From branding and interface layout to colors and menus, so Dreelio feels like an extension of your brand.</p>
            </div>
          </motion.div>

          {/* Card 2: Medium Top Right */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-white rounded-3xl p-8 border shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-3">Start learning tools and skills that seemed impossible</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Seamless integrations. Plug Dreelio into the tools you love. Set up automations, sync your data, and make systems work smarter.</p>
          </motion.div>

          {/* Card 3: Small Bottom Left */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-white rounded-3xl p-8 border shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-semibold mb-2">Collaborate in realtime</h3>
            <p className="text-muted-foreground text-sm">Keep every conversation in sync use comments, messages, and project chats to stay on the same page.</p>
          </motion.div>

          {/* Card 4: Small Bottom Middle */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-white rounded-3xl p-8 border shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-semibold mb-2">Speaks your language</h3>
            <p className="text-muted-foreground text-sm">Set your language, currency, time, and date preferences for a seamless experience that feels truly local.</p>
          </motion.div>

          {/* Card 5: Small Bottom Right */}
          <motion.div variants={itemVariants} className="md:col-span-2 bg-white rounded-3xl p-8 border shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-semibold mb-2">View things your way</h3>
            <p className="text-muted-foreground text-sm">Easily toggle between various views, including Kanban, cards, list, table, timeline, and calendar.</p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
