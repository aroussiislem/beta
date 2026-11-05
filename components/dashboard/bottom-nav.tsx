"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "./nav-items";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path));

  return (
    <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50'>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className='relative flex flex-col items-center gap-1 p-2'
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`p-1 rounded-xl transition-colors ${active ? "text-blue-600" : "text-slate-500"}`}
            >
              <Icon className='h-6 w-6' />
            </motion.div>
            <span
              className={`text-[10px] font-medium ${active ? "text-blue-600" : "text-slate-500"}`}
            >
              {item.label}
            </span>
            {active && (
              <motion.div
                layoutId='bottomNavIndicator'
                className='absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full'
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
