"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ticket as TicketIcon,
  Users as UsersIcon,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { translateStatus, statusColors } from "@/lib/ticket-utils";

interface Stats {
  totalTickets: number;
  activeTickets: number;
  totalUsers: number;
  ticketsToday: number;
  totalRevenue: number;
}

interface RecentTicket {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  createdBy: { name: string };
  createdAt: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalTickets: 0,
    activeTickets: 0,
    totalUsers: 0,
    ticketsToday: 0,
    totalRevenue: 0,
  });
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isLoading && isAuthenticated) {
      fetchStats();
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const [ticketsRes, usersRes] = await Promise.all([
        fetch("/api/tickets", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch("/api/users", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      const ticketsData = await ticketsRes.json();
      const usersData = await usersRes.json();

      if (ticketsData.success && usersData.success) {
        const tickets = ticketsData.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeTickets = tickets.filter((t: any) =>
          ["NEW", "ASSIGNED", "IN_PROGRESS", "PENDING"].includes(t.status),
        );

        const ticketsCreatedToday = tickets.filter((t: any) => {
          const createdDate = new Date(t.createdAt);
          createdDate.setHours(0, 0, 0, 0);
          return createdDate.getTime() === today.getTime();
        });

        const totalRevenue = tickets.reduce(
          (sum: number, t: any) => sum + t.calculatedPrice,
          0,
        );

        setStats({
          totalTickets: tickets.length,
          activeTickets: activeTickets.length,
          totalUsers: usersData.data.length,
          ticketsToday: ticketsCreatedToday.length,
          totalRevenue,
        });

        const recent = tickets.slice(0, 5);
        setRecentTickets(recent);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total des tickets",
      value: stats.totalTickets,
      icon: TicketIcon,
      color: "bg-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tickets actifs",
      value: stats.activeTickets,
      icon: Clock,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total des utilisateurs",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "bg-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Tickets aujourd'hui",
      value: stats.ticketsToday,
      icon: TrendingUp,
      color: "bg-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (loading) {
    return (
      <div className='space-y-8 animate-pulse'>
        <div className='h-10 w-64 bg-slate-200 rounded-lg' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-32 bg-slate-200 rounded-2xl' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-10'>
      {/* Page Header */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div>
          <h1 className='text-4xl font-black text-slate-900 tracking-tight'>
            Vue d'ensemble
          </h1>
          <p className='text-slate-500 font-medium mt-1'>
            Gérez votre activité et suivez vos tickets en temps réel.
          </p>
        </div>
        <Link href='/dashboard/tickets/new'>
          <Button className='bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl shadow-lg shadow-blue-600/20 gap-2'>
            <Plus className='h-5 w-5' />
            Nouveau Ticket
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial='hidden'
        animate='show'
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
      >
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div variants={item} key={stat.title}>
              <Card className='border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl group overflow-hidden bg-white'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div
                      className={`${stat.bgColor} ${stat.textColor} p-3 rounded-2xl`}
                    >
                      <Icon className='h-6 w-6' />
                    </div>
                    <div className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                      En direct
                    </div>
                  </div>
                  <div>
                    <h3 className='text-sm font-bold text-slate-500 uppercase tracking-tight mb-1'>
                      {stat.title}
                    </h3>
                    <div className='text-3xl font-black text-slate-900'>
                      {stat.value}
                    </div>
                  </div>
                </CardContent>
                <div
                  className={`h-1.5 w-full ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Recent Tickets Table */}
        <Card className='lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white'>
          <CardHeader className='flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6'>
            <CardTitle className='text-xl font-black text-slate-900'>
              Tickets récents
            </CardTitle>
            <Link href='/dashboard/tickets'>
              <Button
                variant='ghost'
                size='sm'
                className='text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold gap-1'
              >
                Tout voir <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader className='bg-slate-50/50'>
                <TableRow className='hover:bg-transparent border-none'>
                  <TableHead className='px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12'>
                    N° Ticket
                  </TableHead>
                  <TableHead className='font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12'>
                    Titre
                  </TableHead>
                  <TableHead className='font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12'>
                    Statut
                  </TableHead>
                  <TableHead className='px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12 text-right'>
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.map((t) => (
                  <TableRow
                    key={t.id}
                    className='border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors'
                  >
                    <TableCell className='px-8 py-4 font-black text-xs text-slate-900 font-mono'>
                      {t.ticketNumber}
                    </TableCell>
                    <TableCell className='py-4 font-bold text-sm text-slate-700 truncate max-w-[200px]'>
                      {t.title}
                    </TableCell>
                    <TableCell className='py-4'>
                      <Badge
                        style={{ backgroundColor: statusColors[t.status] }}
                        className='text-white border-none rounded-lg px-2 shadow-sm font-bold text-[10px] uppercase tracking-tighter'
                      >
                        {translateStatus(t.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-8 py-4 text-right text-xs font-bold text-slate-400'>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className='space-y-6'>
          <Card className='border-none shadow-sm rounded-3xl overflow-hidden bg-white'>
            <CardHeader className='px-8 py-6'>
              <CardTitle className='text-xl font-black text-slate-900'>
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className='px-8 pb-8 space-y-4'>
              <Link href='/dashboard/tickets/new' className='block'>
                <Button className='w-full justify-start h-12 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10'>
                  <div className='w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3'>
                    <Plus className='h-4 w-4' />
                  </div>
                  Créer un ticket
                </Button>
              </Link>
              <Link href='/dashboard/users/new' className='block'>
                <Button
                  variant='outline'
                  className='w-full justify-start h-12 rounded-2xl font-bold border-2 border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all'
                >
                  <div className='w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center mr-3'>
                    <UsersIcon className='h-4 w-4' />
                  </div>
                  Nouvel utilisateur
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className='border-none shadow-sm rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 text-white'>
            <CardContent className='p-8'>
              <div className='w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6'>
                <TrendingUp className='h-6 w-6' />
              </div>
              <h3 className='text-xl font-black mb-2'>
                Optimisez votre gestion
              </h3>
              <p className='text-blue-100 text-sm font-medium leading-relaxed'>
                Utilisez les priorités pour traiter les tickets critiques en
                premier et améliorer votre temps de réponse.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
