
import { motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { CheckCircle2 } from 'lucide-react';

export function FeaturesAlternating() {
  const features = [
    {
      badge: "project management",
      title: "Keep every project moving forward",
      description: "Plan, assign, and deliver your work - all in one place. With smart task tracking, deadlines, and real-time progress, you stay organized and clients stay confident.",
      points: ["Tasks", "Time tracking", "Timesheets", "Reports"],
      imagePosition: "right"
    },
    {
      badge: "financial management",
      title: "Track your skills and progression seamlessly",
      description: "Create branded invoices, log expenses, and keep tabs on your earnings. Whether you bill hourly or per project, everything's automated and tax-friendly.",
      points: ["Invoicing", "Budgets", "Forecasting", "Integrations"],
      imagePosition: "left"
    }
  ];

  return (
    <section className="py-24 overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-32">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className={`flex flex-col ${feature.imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}
          >
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: feature.imagePosition === 'right' ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1 w-full"
            >
              <SectionHeader 
                align="left"
                badge={feature.badge}
                title={feature.title}
                description={feature.description}
                className="mb-8"
              />
              
              <div className="grid grid-cols-2 gap-4">
                {feature.points.map((point, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-accent" />
                    <span className="font-medium text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Image Placeholder */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="flex-1 w-full aspect-square md:aspect-[4/3] bg-secondary rounded-3xl border shadow-sm flex items-center justify-center p-8 overflow-hidden relative"
            >
              {/* Decorative elements representing UI */}
              <div className="absolute inset-x-8 top-8 bottom-0 bg-white rounded-t-xl shadow-lg border-x border-t p-6 flex flex-col gap-4">
                 <div className="flex items-center gap-4 border-b pb-4">
                   <div className="w-12 h-12 bg-secondary rounded-full"></div>
                   <div className="flex flex-col gap-2 flex-1">
                     <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                     <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                   </div>
                 </div>
                 <div className="flex-1 flex flex-col gap-3">
                   <div className="h-8 bg-slate-50 rounded border flex items-center px-4">
                     <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                   </div>
                   <div className="h-8 bg-slate-50 rounded border flex items-center px-4">
                     <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                   </div>
                   <div className="h-8 bg-slate-50 rounded border flex items-center px-4">
                     <div className="h-2 bg-slate-200 rounded w-1/3"></div>
                   </div>
                 </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
