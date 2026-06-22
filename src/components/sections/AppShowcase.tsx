import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';

export function AppShowcase() {
  const [activeTab, setActiveTab] = useState<'mobile' | 'web'>('web');

  return (
    <section className="py-24 overflow-hidden bg-white/50" id="showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader 
          badge="Seamless LEARNING, POWERED BY YOU!"
          title="Learn Anything, Anywhere, Powered By The Community"
          className="mb-16"
        />

        <div className="flex flex-col items-center">
          {/* Toggle Buttons */}
          <div className="flex items-center p-1 bg-secondary rounded-full mb-12">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-full transition-colors z-10 ${
                activeTab === 'mobile' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {activeTab === 'mobile' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              Mobile App
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-full transition-colors z-10 ${
                activeTab === 'web' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {activeTab === 'web' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              Web App
            </button>
          </div>

          {/* Image Showcase */}
          <div className="w-full max-w-5xl aspect-[16/9] relative rounded-2xl md:rounded-[40px] overflow-hidden bg-secondary border border-white/50 shadow-xl">
            <AnimatePresence mode="wait">
              {activeTab === 'web' ? (
                <motion.div
                  key="web"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center p-4 md:p-8"
                >
                  {/* Mockup Placeholder */}
                  <div className="w-full h-full bg-white rounded-xl md:rounded-2xl shadow-sm border overflow-hidden flex flex-col">
                    {/* Browser Chrome */}
                    <div className="h-10 bg-secondary border-b flex items-center px-4 gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div className="ml-4 h-5 bg-white/50 rounded flex-1 max-w-md mx-auto"></div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-6 flex gap-6 bg-slate-50">
                      <div className="w-48 hidden md:flex flex-col gap-3">
                        <div className="h-8 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                      </div>
                      <div className="flex-1 flex flex-col gap-6">
                        <div className="h-32 bg-white rounded-xl shadow-sm border w-full"></div>
                        <div className="flex gap-6 flex-1">
                          <div className="flex-1 bg-white rounded-xl shadow-sm border"></div>
                          <div className="flex-1 bg-white rounded-xl shadow-sm border"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mobile"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-accent/5 p-4 md:p-8"
                >
                  {/* Mobile Mockup Placeholder */}
                  <div className="w-[300px] h-[600px] bg-white rounded-[40px] shadow-2xl border-8 border-slate-900 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl"></div>
                    <div className="flex-1 mt-10 p-4 flex flex-col gap-4 bg-slate-50">
                       <div className="h-40 bg-white rounded-2xl shadow-sm border"></div>
                       <div className="flex gap-2">
                         <div className="h-24 flex-1 bg-white rounded-2xl shadow-sm border"></div>
                         <div className="h-24 flex-1 bg-white rounded-2xl shadow-sm border"></div>
                       </div>
                       <div className="h-32 bg-white rounded-2xl shadow-sm border"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
