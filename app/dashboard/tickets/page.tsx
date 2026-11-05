"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import {
  statusColors,
  priorityColors,
  translateStatus,
  translatePriority,
} from "@/lib/ticket-utils";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  priority: string;
  createdBy: { name: string };
  assignedTo: { name: string } | null;
  actualHours: number;
  calculatedPrice: number;
  createdAt: string;
}

export default function TicketsPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isLoading && isAuthenticated) {
      fetchTickets();
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchTickets = async () => {
    try {
      let url = "/api/tickets";
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);

      if (params.toString()) url += `?${params.toString()}`;

      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      if (data.success) setTickets(data.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchTickets();
    }
  }, [search, statusFilter, priorityFilter, isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous supprimer ce ticket ?")) return;

    try {
      const token = localStorage.getItem("authToken");
      await fetch(`/api/tickets/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTickets(tickets.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete ticket:", error);
    }
  };

  if (isLoading)
    return (
      <div className='flex justify-center h-full items-center'>
        Chargement...
      </div>
    );
  if (!isAuthenticated) return null;

  return (
    <div className='space-y-8 pb-12'>
      {/* Header */}
      <div className='flex flex-col md:flex-row items-start md:items-end justify-between gap-6'>
        <div>
          <h1 className='text-4xl font-black text-slate-900 tracking-tight'>
            Tickets
          </h1>
          <p className='text-slate-500 font-medium mt-1'>
            Gérez les demandes de support et suivez leur progression.
          </p>
        </div>
        <Link href='/dashboard/tickets/new'>
          <Button className='bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-2xl shadow-lg shadow-blue-600/20 gap-2 w-full md:w-auto'>
            <Plus className='h-5 w-5' />
            Nouveau Ticket
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <Card className='border-none shadow-sm rounded-3xl bg-white overflow-hidden'>
        <CardContent className='p-6 md:p-8'>
          <div className='flex flex-col md:flex-row gap-4 items-center'>
            <div className='relative flex-1 w-full'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Rechercher par titre, description ou n°...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-11 h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-sm font-medium'
              />
            </div>
            <Button
              variant='outline'
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className={`h-12 rounded-2xl px-6 font-bold gap-2 border-2 transition-all ${isFilterVisible ? "border-blue-100 bg-blue-50 text-blue-600" : "border-slate-100"}`}
            >
              <Filter className='h-4 w-4' />
              Filtres
            </Button>
          </div>

          <AnimatePresence>
            {isFilterVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className='overflow-hidden'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-50'>
                  <div className='space-y-2'>
                    <label className='text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1'>
                      Statut
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className='h-12 rounded-2xl border-slate-100 bg-slate-50/50'>
                        <SelectValue placeholder='Tous les statuts' />
                      </SelectTrigger>
                      <SelectContent className='rounded-2xl shadow-xl border-slate-100'>
                        <SelectItem value='all'>Tous les statuts</SelectItem>
                        <SelectItem value='NEW'>Nouveau</SelectItem>
                        <SelectItem value='ASSIGNED'>Assigné</SelectItem>
                        <SelectItem value='IN_PROGRESS'>En cours</SelectItem>
                        <SelectItem value='PENDING'>En attente</SelectItem>
                        <SelectItem value='RESOLVED'>Résolu</SelectItem>
                        <SelectItem value='CLOSED'>Fermé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1'>
                      Priorité
                    </label>
                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger className='h-12 rounded-2xl border-slate-100 bg-slate-50/50'>
                        <SelectValue placeholder='Toutes les priorités' />
                      </SelectTrigger>
                      <SelectContent className='rounded-2xl shadow-xl border-slate-100'>
                        <SelectItem value='all'>
                          Toutes les priorités
                        </SelectItem>
                        <SelectItem value='LOW'>Basse</SelectItem>
                        <SelectItem value='MEDIUM'>Moyenne</SelectItem>
                        <SelectItem value='HIGH'>Haute</SelectItem>
                        <SelectItem value='URGENT'>Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='mt-4 flex items-center justify-between px-1'>
            <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>
              {loading
                ? "Chargement..."
                : tickets.length === 0
                  ? "Aucun ticket trouvé"
                  : `${tickets.length} ticket(s) trouvé(s)`}
            </p>
            {(statusFilter !== "all" || priorityFilter !== "all" || search) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setSearch("");
                }}
                className='text-xs font-bold text-blue-600 hover:text-blue-700 p-0 h-auto'
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tickets List Card */}
      <Card className='border-none shadow-sm rounded-[2rem] bg-white overflow-hidden'>
        <CardContent className='p-0'>
          <div className='block md:hidden'>
            {/* Mobile List View */}
            <div className='divide-y divide-slate-50'>
              {loading ? (
                <div className='p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs'>
                  Chargement des données...
                </div>
              ) : tickets.length === 0 ? (
                <div className='p-12 text-center space-y-4'>
                  <div className='w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto'>
                    <Search className='h-8 w-8 text-slate-200' />
                  </div>
                  <p className='text-slate-400 font-bold uppercase tracking-widest text-xs'>
                    Aucun ticket trouvé
                  </p>
                </div>
              ) : (
                tickets.map((t) => (
                  <Link
                    href={`/dashboard/tickets/${t.id}`}
                    key={t.id}
                    className='p-6 block hover:bg-slate-50/50 transition-colors'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <span className='font-black text-xs text-blue-600 font-mono tracking-tighter bg-blue-50 px-2 py-1 rounded-lg'>
                        {t.ticketNumber}
                      </span>
                      <Badge
                        style={{ backgroundColor: statusColors[t.status] }}
                        className='text-white border-none rounded-lg px-2 shadow-sm font-bold text-[10px] uppercase tracking-tighter'
                      >
                        {translateStatus(t.status)}
                      </Badge>
                    </div>
                    <h3 className='font-bold text-slate-900 mb-2 truncate'>
                      {t.title}
                    </h3>
                    <div className='flex items-center justify-between mt-4'>
                      <div className='flex items-center gap-2'>
                        <div className='w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600'>
                          {t.createdBy.name[0]}
                        </div>
                        <span className='text-xs font-bold text-slate-500'>
                          {t.createdBy.name}
                        </span>
                      </div>
                      <span className='text-[10px] font-black text-slate-300 uppercase tracking-widest'>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className='hidden md:block'>
            {/* Desktop Table View */}
            {loading ? (
              <div className='p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs'>
                Chargement des données...
              </div>
            ) : (
              <Table>
                <TableHeader className='bg-slate-50/50'>
                  <TableRow className='border-none hover:bg-transparent'>
                    <TableHead className='px-8 font-black text-slate-400 uppercase text-[10px] tracking-widest h-14'>
                      N° Ticket
                    </TableHead>
                    <TableHead className='font-black text-slate-400 uppercase text-[10px] tracking-widest h-14'>
                      Titre
                    </TableHead>
                    <TableHead className='font-black text-slate-400 uppercase text-[10px] tracking-widest h-14 text-center'>
                      Statut
                    </TableHead>
                    <TableHead className='font-black text-slate-400 uppercase text-[10px] tracking-widest h-14 text-center'>
                      Priorité
                    </TableHead>
                    <TableHead className='font-black text-slate-400 uppercase text-[10px] tracking-widest h-14 text-right'>
                      Créé le
                    </TableHead>
                    <TableHead className='px-8 h-14'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {tickets.map((t, idx) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className='group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors'
                      >
                        <TableCell className='px-8 py-5'>
                          <span className='font-black text-xs text-blue-600 font-mono tracking-tighter bg-blue-50/50 px-2 py-1 rounded-lg'>
                            {t.ticketNumber}
                          </span>
                        </TableCell>
                        <TableCell className='py-5'>
                          <div className='max-w-[300px]'>
                            <p className='font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate'>
                              {t.title}
                            </p>
                            <p className='text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1'>
                              Par {t.createdBy.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className='py-5 text-center'>
                          <Badge
                            style={{ backgroundColor: statusColors[t.status] }}
                            className='text-white border-none rounded-lg px-2.5 py-1 shadow-sm font-bold text-[10px] uppercase tracking-tighter'
                          >
                            {translateStatus(t.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className='py-5 text-center'>
                          <Badge
                            style={{
                              backgroundColor: priorityColors[t.priority],
                              color: "white",
                            }}
                            className='border-none rounded-lg px-2.5 py-1 font-bold text-[10px] uppercase tracking-tighter'
                          >
                            {translatePriority(t.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell className='py-5 text-right font-bold text-slate-400 text-xs'>
                          {new Date(t.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className='px-8 py-5 text-right'>
                          <div className='flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Link href={`/dashboard/tickets/${t.id}`}>
                              <Button
                                size='icon'
                                variant='ghost'
                                className='h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600'
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                            </Link>
                            {["ADMIN", "MANAGER"].includes(
                              user?.role || "",
                            ) && (
                              <Button
                                size='icon'
                                variant='ghost'
                                onClick={() => handleDelete(t.id)}
                                className='h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
