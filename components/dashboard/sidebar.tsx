"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { menuItems } from "./nav-items";
import { motion } from "framer-motion";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (path: string) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path));

  return (
    <aside className='hidden md:flex w-64 bg-slate-900 text-white flex-col h-screen fixed left-0 top-0 z-40'>
      {/* Logo */}
      <div className='p-8'>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className='text-2xl font-black tracking-tighter'
        >
          SUNHELP
        </motion.h1>
        <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1'>
          Gestion des tickets
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 overflow-y-auto px-4 py-6 space-y-2'>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={active ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-11 px-4 rounded-xl transition-all duration-300 ${
                    active
                      ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20"
                      : "hover:bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`}
                  />
                  <span className='font-medium'>{item.label}</span>
                </Button>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className='p-4 mt-auto border-t border-slate-800/50'>
        <Button
          variant='ghost'
          className='w-full justify-start gap-3 h-11 px-4 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors'
          onClick={handleLogout}
        >
          <LogOut className='h-4 w-4' />
          <span className='font-medium'>Déconnexion</span>
        </Button>
      </div>
    </aside>
  );
}
