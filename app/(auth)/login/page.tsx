"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Échec de la connexion");
        return;
      }

      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      router.push("/dashboard");
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden p-4'>
      {/* Background Blobs */}
      <div className='absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob' />
      <div className='absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000' />
      <div className='absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000' />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md z-10'
      >
        {/* Header */}
        <div className='text-center mb-10'>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className='w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/40'
          >
            <Sparkles className='h-8 w-8 text-white' />
          </motion.div>
          <h1 className='text-4xl font-black text-white tracking-tighter mb-2'>
            SUNHELP
          </h1>
          <p className='text-slate-400 font-medium'>
            Gestion intelligente de vos tickets support
          </p>
        </div>

        {/* Login Card */}
        <Card className='border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden'>
          <CardHeader className='pt-10 px-8'>
            <CardTitle className='text-2xl font-black text-white'>
              Bon retour !
            </CardTitle>
            <CardDescription className='text-slate-400 font-medium pt-1'>
              Prêt à aider vos clients aujourd'hui ?
            </CardDescription>
          </CardHeader>
          <CardContent className='px-8 pb-10'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Error Alert */}
              <AnimatePresence mode='wait'>
                {error && (
                  <motion.div
                    key='login-error'
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <Alert
                      variant='destructive'
                      className='bg-red-500/10 border-red-500/20 text-red-400 rounded-2xl'
                    >
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription className='font-bold'>
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input */}
              <div className='space-y-2'>
                <label
                  htmlFor='email'
                  className='text-xs font-black text-slate-500 uppercase tracking-widest ml-1 cursor-pointer'
                >
                  Email Professionnel
                </label>
                <Input
                  id='email'
                  type='email'
                  placeholder='collaborateur@sunhelp.com'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className='h-12 bg-slate-800/50 border-slate-700 text-white rounded-2xl px-4 focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-600'
                  required
                />
              </div>

              {/* Password Input */}
              <div className='space-y-2'>
                <div className='flex justify-between items-center px-1'>
                  <label
                    htmlFor='password'
                    className='text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer'
                  >
                    Mot de passe
                  </label>
                  <Link
                    href='#'
                    className='text-xs font-bold text-blue-500 hover:text-blue-400'
                  >
                    Oublié ?
                  </Link>
                </div>
                <Input
                  id='password'
                  type='password'
                  placeholder='••••••••'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className='h-12 bg-slate-800/50 border-slate-700 text-white rounded-2xl px-4 focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-600'
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type='submit'
                className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]'
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='h-6 w-6 animate-spin' />
                ) : (
                  <span className='flex items-center gap-2'>
                    Se connecter <ArrowRight className='h-5 w-5' />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className='my-8 flex items-center gap-4'>
              <div className='flex-1 h-px bg-slate-800' />
              <span className='text-xs font-bold text-slate-500 uppercase tracking-widest'>
                Ou
              </span>
              <div className='flex-1 h-px bg-slate-800' />
            </div>

            {/* Sign Up Link */}
            <Button
              variant='outline'
              className='w-full h-12 border-2 border-slate-800 bg-transparent hover:bg-slate-800 hover:border-slate-700 text-white rounded-2xl font-bold transition-all'
              asChild
            >
              <Link href='/register'>
                Créer un compte
              </Link>
            </Button>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className='mt-8 p-6 bg-blue-600/10 rounded-[2rem] border border-blue-500/20'
            >
              <h4 className='text-xs font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2'>
                <Sparkles className='h-3 w-3' /> Accès Démo Rapide
              </h4>
              <div className='space-y-2 text-sm'>
                <p className='text-slate-300'>
                  <strong>Email:</strong>{" "}
                  <code className='text-blue-300'>admin@sunhelp.com</code>
                </p>
                <p className='text-slate-300'>
                  <strong>Pass:</strong>{" "}
                  <code className='text-blue-300'>Admin@123</code>
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
