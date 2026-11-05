"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  Calendar,
  User,
  Clock,
  CreditCard,
  MessageSquare,
  Send,
  Zap,
  Info,
  Loader2,
} from "lucide-react";
import { TimerWidget } from "@/components/tickets/timer-widget";
import {
  statusColors,
  priorityColors,
  getComplexityMultiplier,
  translateStatus,
  translatePriority,
  translateComplexity,
} from "@/lib/ticket-utils";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  complexity: string;
  estimatedHours: number | null;
  actualHours: number;
  hourlyRate: number;
  calculatedPrice: number;
  createdBy: { name: string };
  assignedTo: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  content: string;
  isInternal: boolean;
  user: { name: string; email: string };
  createdAt: string;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoading, isAuthenticated, user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const ticketId = params.id as string;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isLoading && isAuthenticated) {
      fetchTicket();
      fetchComments();
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/tickets/${ticketId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      const data = await response.json();
      if (data.success) setTicket(data.data);
    } catch (error) {
      console.error("Failed to fetch ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await response.json();
      if (data.success) setComments(data.data);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ content: commentText, isInternal }),
      });

      const data = await response.json();
      if (data.success) {
        setComments([data.data, ...comments]);
        setCommentText("");
        setIsInternal(false);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (isLoading || loading)
    return (
      <div className='flex justify-center h-full items-center font-bold text-slate-400 uppercase tracking-widest text-xs'>
        Chargement du ticket...
      </div>
    );
  if (!isAuthenticated || !ticket) return null;

  const multiplier = getComplexityMultiplier(ticket.complexity as any);

  return (
    <div className='space-y-10 pb-20'>
      {/* Navigation & Header */}
      <div className='flex flex-col gap-6'>
        <Link href='/dashboard/tickets'>
          <Button
            variant='ghost'
            className='-ml-4 text-slate-500 hover:text-slate-900 font-bold gap-2'
          >
            <ChevronLeft className='h-4 w-4' />
            Retour aux tickets
          </Button>
        </Link>
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <span className='font-black text-sm text-blue-600 font-mono tracking-tighter bg-blue-50 px-3 py-1 rounded-xl'>
                {ticket.ticketNumber}
              </span>
              <Badge
                style={{ backgroundColor: statusColors[ticket.status] }}
                className='text-white border-none rounded-xl px-3 py-1 shadow-sm font-bold text-[10px] uppercase tracking-widest'
              >
                {translateStatus(ticket.status)}
              </Badge>
            </div>
            <h1 className='text-4xl font-black text-slate-900 tracking-tight'>
              {ticket.title}
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex -space-x-2'>
              <div
                className='w-10 h-10 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600'
                title={`Créé par ${ticket.createdBy.name}`}
              >
                {ticket.createdBy.name[0]}
              </div>
              {ticket.assignedTo && (
                <div
                  className='w-10 h-10 rounded-full border-4 border-white bg-blue-600 flex items-center justify-center text-xs font-bold text-white'
                  title={`Assigné à ${ticket.assignedTo.name}`}
                >
                  {ticket.assignedTo.name[0]}
                </div>
              )}
            </div>
            <div className='text-left'>
              <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1'>
                Responsable
              </p>
              <p className='text-sm font-bold text-slate-900'>
                {ticket.assignedTo?.name || "Non assigné"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Column */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Description */}
          <Card className='border-none shadow-sm rounded-[2rem] bg-white overflow-hidden'>
            <CardHeader className='p-8 border-b border-slate-50'>
              <div className='flex items-center gap-2 mb-1'>
                <Info className='h-4 w-4 text-slate-400' />
                <CardTitle className='text-xl font-black text-slate-900'>
                  Description du problème
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className='p-8'>
              <p className='text-slate-600 leading-relaxed font-medium whitespace-pre-wrap'>
                {ticket.description}
              </p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 pt-8 border-t border-slate-50'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center'>
                      <Zap className='h-5 w-5 text-orange-500' />
                    </div>
                    <div>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                        Priorité
                      </p>
                      <p className='font-bold text-slate-900'>
                        {translatePriority(ticket.priority)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center'>
                      <Clock className='h-5 w-5 text-purple-600' />
                    </div>
                    <div>
                      <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                        Complexité
                      </p>
                      <p className='font-bold text-slate-900'>
                        {translateComplexity(ticket.complexity)} (×{multiplier})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <div className='space-y-6'>
            <div className='flex items-center gap-3 px-4'>
              <MessageSquare className='h-5 w-5 text-slate-400' />
              <h2 className='text-2xl font-black text-slate-900'>Discussion</h2>
              <Badge variant='secondary' className='rounded-lg font-bold'>
                {comments.length}
              </Badge>
            </div>

            <Card className='border-none shadow-sm rounded-[2rem] bg-white overflow-hidden'>
              <CardContent className='p-8 space-y-8'>
                {/* New Comment Form */}
                <form onSubmit={handleAddComment} className='space-y-4'>
                  <div className='relative'>
                    <Textarea
                      placeholder='Votre réponse ici...'
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className='min-h-[120px] rounded-[1.5rem] border-slate-100 bg-slate-50/50 focus:bg-white transition-all p-6 font-medium text-slate-700'
                    />
                  </div>
                  <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
                    <label className='flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl transition-colors hover:bg-slate-100'>
                      <Checkbox
                        checked={isInternal}
                        onCheckedChange={setIsInternal as any}
                        className='rounded-md border-slate-300'
                      />
                      Note interne uniquement
                    </label>
                    <Button
                      type='submit'
                      disabled={submittingComment || !commentText.trim()}
                      className='h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold gap-2 shadow-lg shadow-blue-600/20 w-full md:w-auto'
                    >
                      {submittingComment ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Send className='h-4 w-4' />
                      )}
                      Envoyer
                    </Button>
                  </div>
                </form>

                {/* Comments List */}
                <div className='space-y-6'>
                  <AnimatePresence>
                    {comments.length === 0 ? (
                      <div className='py-10 text-center space-y-4'>
                        <div className='w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-200'>
                          <MessageSquare className='h-8 w-8' />
                        </div>
                        <p className='text-xs font-black text-slate-300 uppercase tracking-widest'>
                          Aucun message pour l'instant
                        </p>
                      </div>
                    ) : (
                      comments.map((comment, idx) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`p-6 rounded-[1.5rem] ${comment.isInternal ? "bg-orange-50/50 border border-orange-100/50" : "bg-slate-50/50"}`}
                        >
                          <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-3'>
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${comment.isInternal ? "bg-orange-100 text-orange-700" : "bg-white text-slate-600"}`}
                              >
                                {comment.user.name[0]}
                              </div>
                              <div>
                                <p className='font-bold text-sm text-slate-900'>
                                  {comment.user.name}
                                </p>
                                <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                                  {new Date(comment.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {comment.isInternal && (
                              <Badge className='bg-orange-100 text-orange-700 border-none rounded-lg text-xs font-bold'>
                                INTERNE
                              </Badge>
                            )}
                          </div>
                          <p className='text-slate-700 font-medium text-sm leading-relaxed'>
                            {comment.content}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className='space-y-8'>
          {/* Timer Widget */}
          <TimerWidget ticketId={ticketId} onSessionStop={fetchTicket} />

          {/* Billing Card */}
          <Card className='border-none shadow-sm rounded-[2rem] bg-white overflow-hidden'>
            <CardHeader className='p-8 pb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center'>
                  <CreditCard className='h-5 w-5 text-green-600' />
                </div>
                <div>
                  <CardTitle className='text-xl font-black text-slate-900'>
                    Facturation
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-8 pt-0 space-y-6'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Temps passé
                  </span>
                  <span className='font-bold text-slate-900'>
                    {ticket.actualHours.toFixed(2)}h
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Taux horaire
                  </span>
                  <span className='font-bold text-slate-900'>
                    €{ticket.hourlyRate.toFixed(2)}/h
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                    Multiplié par
                  </span>
                  <span className='font-bold text-purple-600'>
                    ×{multiplier}
                  </span>
                </div>
              </div>

              <div className='pt-6 border-t border-slate-50 flex flex-col items-center justify-center space-y-1'>
                <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                  Total estimé
                </span>
                <span className='text-4xl font-black text-slate-900'>
                  €{ticket.calculatedPrice.toFixed(2)}
                </span>
              </div>

              {ticket.estimatedHours && (
                <div className='bg-slate-50 rounded-2xl p-4 text-center'>
                  <p className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>
                    Objectif temps
                  </p>
                  <p className='text-sm font-bold text-slate-600'>
                    {ticket.estimatedHours}h
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History / Info */}
          <Card className='border-none shadow-sm rounded-[2rem] bg-slate-900 text-white overflow-hidden'>
            <CardContent className='p-8 space-y-6'>
              <div>
                <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2'>
                  <Calendar className='h-3 w-3' /> Date de création
                </p>
                <p className='text-sm font-bold'>
                  {new Date(ticket.createdAt).toLocaleDateString()} à{" "}
                  {new Date(ticket.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className='text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2'>
                  <Clock className='h-3 w-3' /> Dernière mise à jour
                </p>
                <p className='text-sm font-bold'>
                  {new Date(ticket.updatedAt).toLocaleDateString()} à{" "}
                  {new Date(ticket.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
