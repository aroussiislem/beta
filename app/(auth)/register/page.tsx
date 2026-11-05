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
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate password strength
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setIsLoading(false);
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins une lettre majuscule");
      setIsLoading(false);
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins une lettre minuscule");
      setIsLoading(false);
      return;
    }

    if (!/\d/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins un chiffre");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || "Échec de l'inscription");
        return;
      }

      // Store token in localStorage
      localStorage.setItem("authToken", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-slate-900 mb-2'>SUNHELP</h1>
          <p className='text-slate-600'>Plateforme de gestion des tickets</p>
        </div>

        {/* Register Card */}
        <Card className='border-0 shadow-lg'>
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>Rejoignez SUNHELP pour commencer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Error Alert */}
              {error && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name Input */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Nom complet
                </label>
                <Input
                  type='text'
                  name='name'
                  placeholder='John Doe'
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Email Input */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Email
                </label>
                <Input
                  type='email'
                  name='email'
                  placeholder='vous@exemple.com'
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password Input */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Mot de passe
                </label>
                <Input
                  type='password'
                  name='password'
                  placeholder='••••••••'
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <p className='text-xs text-slate-500'>
                  Min 8 car., 1 majuscule, 1 minuscule, 1 chiffre
                </p>
              </div>

              {/* Role Select */}
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Type de compte
                </label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Sélectionnez le type de compte' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CLIENT'>Client</SelectItem>
                    <SelectItem value='DEVELOPER'>Développeur</SelectItem>
                    <SelectItem value='MANAGER'>Manager</SelectItem>
                    <SelectItem value='ADMIN'>Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Création du compte...
                  </>
                ) : (
                  "Créer un compte"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className='my-6 flex items-center gap-4'>
              <div className='flex-1 h-px bg-slate-200' />
              <span className='text-sm text-slate-500'>
                Vous avez déjà un compte ?
              </span>
              <div className='flex-1 h-px bg-slate-200' />
            </div>

            {/* Sign In Link */}
            <Link href='/login' className='block'>
              <Button variant='outline' className='w-full bg-transparent'>
                Se connecter
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
