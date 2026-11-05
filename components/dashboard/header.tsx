"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <header className='sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between'>
      {/* Left - Mobile Logo / Page Title */}
      <div className='flex items-center gap-4'>
        <div className='md:hidden flex items-center gap-2'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
            <span className='text-white font-black text-sm'>S</span>
          </div>
          <span className='font-bold tracking-tighter text-lg'>SUNHELP</span>
        </div>
        <h2 className='hidden md:block text-sm font-medium text-slate-500'>
          Ravi de vous revoir,{" "}
          <span className='text-slate-900 font-semibold'>{user.name}</span> !
        </h2>
      </div>

      {/* Right - Actions & User Menu */}
      <div className='flex items-center gap-2 md:gap-4'>
        <Button
          variant='ghost'
          size='icon'
          className='text-slate-500 hover:bg-slate-100 rounded-full'
        >
          <Bell className='h-5 w-5' />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex items-center gap-2 md:gap-3 h-auto py-1 px-1 md:px-2 hover:bg-slate-100 rounded-full md:rounded-xl group transition-all'
            >
              <Avatar className='h-8 w-8 border-2 border-slate-100 group-hover:border-blue-100 transition-colors'>
                <AvatarFallback className='text-xs font-bold bg-blue-50 text-blue-600'>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className='hidden md:block text-left'>
                <p className='text-sm font-semibold text-slate-900 leading-none'>
                  {user.name}
                </p>
                <p className='text-[10px] text-slate-500 uppercase font-bold tracking-tight mt-1'>
                  {user.role}
                </p>
              </div>
              <ChevronDown className='h-4 w-4 text-slate-400 hidden md:block' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-64 p-2 rounded-2xl shadow-xl border-slate-200'
          >
            <DropdownMenuLabel className='px-3 py-2'>
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
                  Mon compte
                </span>
                <span className='text-sm text-slate-900 truncate font-semibold'>
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='my-2' />
            <DropdownMenuItem className='rounded-xl px-3 py-2 focus:bg-slate-50'>
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem className='rounded-xl px-3 py-2 focus:bg-slate-50'>
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator className='my-2' />
            <DropdownMenuItem
              onClick={handleLogout}
              className='text-red-500 focus:bg-red-50 focus:text-red-600 rounded-xl px-3 py-2 font-medium'
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
