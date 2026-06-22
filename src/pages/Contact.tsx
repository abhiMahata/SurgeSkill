
import { motion } from 'motion/react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';

export function Contact() {
  return (
    <main className="pt-32 pb-24 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full mx-auto px-4 sm:px-6">
        <SectionHeader 
          title="Contact Us"
          description="We'd love to hear from you."
          className="mb-12"
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border shadow-sm"
        >
           <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-foreground">Name</label>
                 <input type="text" className="h-12 rounded-xl border px-4 focus:outline-none focus:ring-2 focus:ring-accent bg-secondary/50" placeholder="John Doe" />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-foreground">Email</label>
                 <input type="email" className="h-12 rounded-xl border px-4 focus:outline-none focus:ring-2 focus:ring-accent bg-secondary/50" placeholder="john@example.com" />
              </div>
              <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-foreground">Message</label>
                 <textarea className="h-32 rounded-xl border p-4 focus:outline-none focus:ring-2 focus:ring-accent bg-secondary/50 resize-none" placeholder="How can we help?"></textarea>
              </div>
              <Button type="submit" size="lg" className="mt-2">Send Message</Button>
           </form>
        </motion.div>
      </div>
    </main>
  );
}
