"use client";

import { ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/header";
import BottomNav from "@/components/dashboard/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex h-screen bg-slate-50 overflow-hidden'>
      {/* Sidebar for Desktop */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col md:ml-64 relative min-w-0'>
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto pb-24 md:pb-6 scroll-smooth'>
          <AnimatePresence mode='wait'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className='p-4 md:p-8 max-w-7xl mx-auto w-full'
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav />
      </div>
    </div>
  );
}
