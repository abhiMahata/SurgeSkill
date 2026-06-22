
import { motion } from 'motion/react';
import { SectionHeader } from '../components/ui/SectionHeader';

export function Blog() {
  return (
    <main className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader 
          title="Blog"
          description="Read our latest articles and updates."
          className="mb-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {/* Placeholder for blog posts */}
           {[1, 2, 3].map((item) => (
             <motion.div 
               key={item}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: item * 0.1 }}
               className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col hover:shadow-md transition-shadow"
             >
                <div className="aspect-[4/3] bg-secondary rounded-xl mb-6"></div>
                <h3 className="text-xl font-display font-semibold mb-3">Blog Post Title {item}</h3>
                <p className="text-muted-foreground mb-4">A short description of the blog post goes here.</p>
                <span className="text-accent text-sm font-medium mt-auto">Read more &rarr;</span>
             </motion.div>
           ))}
        </div>
      </div>
    </main>
  );
}
