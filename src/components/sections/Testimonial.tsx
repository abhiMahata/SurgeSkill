
import { motion } from 'motion/react';

export function Testimonial() {
  return (
    <section className="py-24 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Avatar Placeholder */}
          <div className="w-20 h-20 bg-slate-200 rounded-full mb-8 overflow-hidden border-4 border-white shadow-sm flex items-center justify-center">
            <span className="text-slate-400 font-semibold text-xl">XYZ</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-display font-medium leading-tight mb-8">
            "Teaching and learning never seemed to be this easy ever before!"
          </h2>
          
          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold text-lg font-display">XYZ</span>
            <span className="text-muted-foreground text-sm uppercase tracking-widest font-mono">VP Marketing, Meta</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
